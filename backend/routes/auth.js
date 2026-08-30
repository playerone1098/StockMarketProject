const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Email/Password login (Admin Panel)
router.post('/login', authController.login);

// Google OAuth endpoint (Unified Login / Register)
router.post('/google', authController.googleAuth);

// Authenticated user management
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
