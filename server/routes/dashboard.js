const express = require('express');
const router  = express.Router();
const {
  getDashboardSummary,
  getMonthlyVisits,
  getCaseDistribution,
  getDoctorLoad,
  getPatientDashboard,
  getDoctorDashboardOverview,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/dashboard/patient           — Single comprehensive API call for Patient Portal
// GET /api/dashboard/overview          — Single comprehensive API call for Doctor Portal
// GET /api/dashboard/summary           — all stats + recent data in one call
// GET /api/dashboard/monthly-visits    — 6-month chart data
// GET /api/dashboard/case-distribution — pie chart data
// GET /api/dashboard/doctor-load       — doctor workload

router.get('/patient',            getPatientDashboard);
router.get('/overview',           getDoctorDashboardOverview);
router.get('/summary',            getDashboardSummary);
router.get('/monthly-visits',     getMonthlyVisits);
router.get('/case-distribution',  getCaseDistribution);
router.get('/doctor-load',        getDoctorLoad);

module.exports = router;
