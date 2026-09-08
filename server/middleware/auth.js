const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');

// Helper: Extract token from cookies or Authorization header
const extractToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

// Helper: Verify token and find active user
const resolveUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check patients collection first (patient portal users)
  let user = await Patient.findById(decoded.id).select('-password');

  // Fall back to Doctor
  if (!user) {
    const Doctor = require('../models/Doctor');
    user = await Doctor.findById(decoded.id).select('-password');
    if (user) {
      user.role = 'doctor'; // Doctors act as 'doctor' role
    }
  }

  // Fall back to System User (Admin)
  if (!user) {
    const User = require('../models/User');
    user = await User.findById(decoded.id).select('-password');
  }

  if (!user || !user.isActive) {
    return null;
  }

  return user;
};

// Protect routes — verify JWT token from cookie or header
const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    logger.warn(`Unauthorized access attempt to ${req.method} ${req.originalUrl} - No token provided`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
    });
  }

  try {
    const user = await resolveUserFromToken(token);

    if (!user) {
      logger.warn(`Auth failed on ${req.method} ${req.originalUrl} - User not found or inactive`);
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn(`Auth token verification failed on ${req.method} ${req.originalUrl}`, error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// Optional protect — attaches user if authenticated, but does not block guests
const optionalProtect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const user = await resolveUserFromToken(token);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'patient';
    if (!roles.includes(userRole)) {
      logger.warn(`Forbidden role access attempt: user with role '${userRole}' tried to access '${req.originalUrl}' (required: ${roles.join(', ')})`);
      return res.status(403).json({
        success: false,
        message: `Role '${userRole}' is not authorized for this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorize };

