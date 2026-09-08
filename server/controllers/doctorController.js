const Doctor = require('../models/Doctor');
const logger = require('../utils/logger');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, isAvailable } = req.query;

    const filter = { isActive: true };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (search) {
      filter.$or = [
        { name:           { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { department:     { $regex: search, $options: 'i' } },
      ];
    }

    const doctors = await Doctor.find(filter).sort({ name: 1 });

    res.json({ success: true, total: doctors.length, data: doctors });
  } catch (error) {
    logger.error('Error fetching doctors list', error);
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    logger.error(`Error fetching doctor ${req.params.id}`, error);
    next(error);
  }
};

// @desc    Create doctor
// @route   POST /api/doctors
// @access  Private (Admin)
const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    logger.info(`Doctor created: ID ${doctor._id} (${doctor.name})`);
    res.status(201).json({
      success: true,
      message: 'Doctor profile created.',
      data: doctor,
    });
  } catch (error) {
    logger.error('Error creating doctor', error);
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin)
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!doctor) {
      logger.warn(`Doctor update failed: ID ${req.params.id} not found`);
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    logger.info(`Doctor updated: ID ${doctor._id} (${doctor.name})`);
    res.json({ success: true, message: 'Doctor updated.', data: doctor });
  } catch (error) {
    logger.error(`Error updating doctor ${req.params.id}`, error);
    next(error);
  }
};

// @desc    Toggle doctor availability
// @route   PATCH /api/doctors/:id/availability
// @access  Private
const toggleAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      logger.warn(`Toggle availability failed: Doctor ${req.params.id} not found`);
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();
    logger.info(`Doctor ${doctor._id} (${doctor.name}) availability set to ${doctor.isAvailable}`);
    res.json({
      success: true,
      message: `Doctor is now ${doctor.isAvailable ? 'available' : 'unavailable'}.`,
      data: doctor,
    });
  } catch (error) {
    logger.error(`Error toggling doctor availability ${req.params.id}`, error);
    next(error);
  }
};

// @desc    Delete doctor (soft delete)
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
const deleteDoctor = async (req, res, next) => {
  try {
    await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
    logger.info(`Doctor soft deleted: ID ${req.params.id}`);
    res.json({ success: true, message: 'Doctor removed.' });
  } catch (error) {
    logger.error(`Error deleting doctor ${req.params.id}`, error);
    next(error);
  }
};

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, toggleAvailability, deleteDoctor };
