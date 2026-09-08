const express = require('express');
const router = express.Router();
const {
  getDoctors, getDoctor, createDoctor,
  updateDoctor, toggleAvailability, deleteDoctor,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',                    protect, getDoctors);
router.get('/:id',                protect, getDoctor);
router.post('/',                   protect, authorize('admin'), createDoctor);
router.put('/:id',                protect, authorize('admin', 'doctor'), updateDoctor);
router.patch('/:id/availability', protect, authorize('admin', 'doctor'), toggleAvailability);
router.delete('/:id',             protect, authorize('admin'), deleteDoctor);

module.exports = router;

