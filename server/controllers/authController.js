const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const logger = require('../utils/logger');

// Helper: generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Helper: cookie configuration for auth token
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Helper: format patient response (all health fields)
const formatPatient = (p) => ({
  id:           p._id,
  patientId:    p.patientId,
  name:         p.name,
  email:        p.email,
  role:         'patient',
  phone:        p.phone,
  age:          p.age,
  height:       p.height,
  weight:       p.weight,
  bloodGroup:   p.bloodGroup,
  gender:       p.gender,
  conditions:   p.conditions,
  medications:  p.medications,
  allergies:    p.allergies,
  address:      p.address,
  priority:     p.priority,
  status:       p.status,
});

// Helper: format doctor response
const formatDoctor = (d) => ({
  id:              d._id,
  doctorId:        d.doctorId,
  name:            d.name,
  email:           d.email,
  role:            d.role || 'doctor',
  specialization:  d.specialization,
  phone:           d.phone,
  qualification:   d.qualification,
  experience:      d.experience,
  department:      d.department,
  consultationFee: d.consultationFee,
  bio:             d.bio,
  rating:          d.rating,
});

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name, email, password,
      age, height, weight, bloodGroup, gender,
      conditions, medications, allergies, address, phone,
    } = req.body;

    // Check if patient already exists
    const existing = await Patient.findOne({ email });
    if (existing) {
      logger.warn(`Patient registration failed: email already exists (${email})`);
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create patient in patients collection
    const patient = await Patient.create({
      name, email, password,
      age:         age         || '',
      height:      height      || '',
      weight:      weight      || '',
      bloodGroup:  bloodGroup  || '',
      gender:      gender      || '',
      conditions:  conditions  || [],
      medications: medications || '',
      allergies:   allergies   || '',
      address:     address     || '',
      phone:       phone       || '',
    });

    const token = generateToken(patient._id);
    res.cookie('token', token, getCookieOptions());

    logger.info(`New patient registered: ${patient.email} (ID: ${patient._id})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: formatPatient(patient),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new doctor
// @route   POST /api/auth/register-doctor
// @access  Public
const registerDoctor = async (req, res, next) => {
  try {
    const {
      name, email, password, phone,
      specialization, qualification, experience, department, consultationFee
    } = req.body;

    // Check if doctor already exists
    const existing = await Doctor.findOne({ email });
    if (existing) {
      logger.warn(`Doctor registration failed: email already exists (${email})`);
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create doctor in doctors collection
    const doctor = await Doctor.create({
      name, email, password, phone,
      specialization,
      qualification:   qualification || '',
      experience:      experience || 0,
      department:      department || '',
      consultationFee: consultationFee || 500,
    });

    const token = generateToken(doctor._id);
    res.cookie('token', token, getCookieOptions());

    logger.info(`New doctor registered: ${doctor.email} (ID: ${doctor._id})`);

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully.',
      token,
      user: formatDoctor(doctor),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login (Patient or Doctor)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // ── Check Patient ──────────────────────────────────────────────────
    const patient = await Patient.findOne({ email }).select('+password');
    if (patient) {
      const isMatch = await patient.matchPassword(password);
      if (isMatch) {
        if (!patient.isActive) {
          logger.warn(`Login rejected: patient account deactivated (${email})`);
          return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
        }
        const token = generateToken(patient._id);
        res.cookie('token', token, getCookieOptions());
        logger.info(`Patient logged in: ${patient.email}`);
        return res.json({
          success: true,
          message: 'Login successful.',
          token,
          user: formatPatient(patient),
        });
      }
    }

    // ── Check Doctor ───────────────────────────────────────────────────
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (doctor) {
      const isMatch = await doctor.matchPassword(password);
      if (isMatch) {
        if (!doctor.isActive) {
          logger.warn(`Login rejected: doctor account deactivated (${email})`);
          return res.status(401).json({ success: false, message: 'Doctor account deactivated.' });
        }
        const token = generateToken(doctor._id);
        res.cookie('token', token, getCookieOptions());
        logger.info(`Doctor logged in: ${doctor.email}`);
        return res.json({
          success: true,
          message: 'Login successful (Doctor Access).',
          token,
          user: formatDoctor(doctor),
        });
      }
    }

    // ── Check Admin / System User ──────────────────────────────────────
    const systemUser = await User.findOne({ email }).select('+password');
    if (systemUser) {
      const isMatch = await systemUser.matchPassword(password);
      if (isMatch) {
        const token = generateToken(systemUser._id);
        res.cookie('token', token, getCookieOptions());
        logger.info(`Admin logged in: ${systemUser.email}`);
        return res.json({
          success: true,
          message: 'Login successful (Admin Access).',
          token,
          user: {
            id: systemUser._id,
            name: systemUser.name,
            email: systemUser.email,
            role: systemUser.role || 'admin',
          },
        });
      }
    }

    logger.warn(`Failed login attempt for email: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
  logger.info('User logged out / cookie cleared');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const u = req.user;
  
  if (u.role === 'doctor') {
    return res.json({
      success: true,
      user: formatDoctor(u)
    });
  }

  res.json({
    success: true,
    user: formatPatient(u)
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    let userModel = req.user.role === 'doctor' ? Doctor : Patient;

    const user = await userModel.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      logger.warn(`Password change failed for user: ${req.user.email || req.user._id} (incorrect current password)`);
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password updated successfully for user: ${req.user.email || req.user._id}`);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, registerDoctor, login, logout, getMe, changePassword };
