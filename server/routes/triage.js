const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { runAgentLoop } = require('../services/agentLoop');
const { protect, optionalProtect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// POST /api/triage/start — guests allowed, patient info logged if authenticated
router.post('/start', optionalProtect, async (req, res, next) => {
  try {
    const { symptoms, patientName, patientId } = req.body;
    
    const session = await Session.create({
      symptoms,
      patientName: patientName || (req.user ? req.user.name : 'Anonymous'),
      patientId: patientId || (req.user ? (req.user._id || req.user.patientId) : null),
      conversationHistory: [{ role: 'user', content: symptoms }],
      questionCount: 0
    });
    
    logger.info(`Triage session started: ${session._id} for patient: ${session.patientName}`);

    // Run agent immediately
    const agentResult = await runAgentLoop(session);
    
    res.json({ 
      success: true, 
      sessionId: session._id,
      agentResult 
    });
  } catch (error) {
    logger.error('Error starting triage session', error);
    next(error);
  }
});

// POST /api/triage/respond — no auth needed (sessionId is the key)
router.post('/respond', async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      logger.warn(`Triage respond failed: Session ${sessionId} not found`);
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    // Add answer to history
    session.conversationHistory.push({ role: 'user', content: answer });
    session.questionCount += 1;
    await session.save();
    
    // Run agent loop again
    const agentResult = await runAgentLoop(session);
    
    // If done, save results to session
    if (agentResult.done) {
      session.triageResult = agentResult.triage;
      session.decisionResult = agentResult.decision;
      session.status = 'completed';
      await session.save();
      logger.info(`Triage session completed: ${session._id} with risk: ${agentResult.triage?.risk || 'UNKNOWN'}`);
    }
    
    res.json({ success: true, agentResult });
  } catch (error) {
    logger.error(`Error in triage response for session ${req.body.sessionId}`, error);
    next(error);
  }
});

// GET /api/triage/sessions — for doctor dashboard and admin review (protected)
router.get('/sessions', protect, authorize('admin', 'doctor'), async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = { status: 'completed' };
    if (patientId) {
      query.patientId = patientId;
    }
    
    const sessions = await Session.find(query)
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;