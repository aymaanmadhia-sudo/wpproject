const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getDbStatus } = require('../config/db');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'proofpocket_default_jwt_secret_key_2025';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

// @route   POST /api/auth/register
// @desc    Register a new user account
// @access  Public
router.post('/register', async (req, res, next) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.isConnected) {
    return res.status(503).json({
      success: false,
      error: 'MongoDB is not connected. Please configure your MONGODB_URI to register.',
      details: dbStatus.error
    });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, email and a password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT token
// @access  Public
router.post('/login', async (req, res, next) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.isConnected) {
    return res.status(503).json({
      success: false,
      error: 'MongoDB is not connected. Please configure your MONGODB_URI to log in.',
      details: dbStatus.error
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
});

module.exports = router;
