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
  body('password').exists().withMessage('Password is required'),
  body().custom((value) => {
    if (!value.email && !value.username) {
      throw new Error('Please provide email or username');
    }
    if (value.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value.email)) {
      throw new Error('Please provide a valid email');
    }
    return true;
  }),
  validate
], authController.login);

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
], authController.register);

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user
 * @access Private
 */
router.get('/me', auth, authController.getMe);

module.exports = router;
