const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login with email and password
 * @access Public
 */
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
  validate
], authController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user
 * @access Private
 */
router.get('/me', auth, authController.getMe);

module.exports = router;
