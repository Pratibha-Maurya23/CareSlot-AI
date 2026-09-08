const express = require('express');
const router  = express.Router();
const { register, registerDoctor, login, logout, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/register-doctor', registerDoctor);
router.post('/login',    login);
router.post('/logout',   logout);

// Protected routes
router.get('/me',                protect, getMe);
router.put('/change-password',   protect, changePassword);

module.exports = router;

