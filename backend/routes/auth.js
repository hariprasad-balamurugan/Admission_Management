// ============================================================
// routes/auth.js — Authentication Routes
// ============================================================
// This file handles user registration and login.
//
// Routes:
//   POST /api/auth/register → Create a new user
//   POST /api/auth/login    → Log in and get a JWT token
//   GET  /api/auth/me       → Get currently logged-in user's info
//
// What is a JWT?
//   JWT = JSON Web Token. It's a small encoded string that contains
//   user info (like their ID and role). After login, the server sends
//   this token to the client. The client stores it and sends it with
//   every future request to prove who they are.
// ============================================================

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// ----------------------------------
// Helper: Generate JWT Token
// ----------------------------------
// jwt.sign() creates a token containing { id: user._id }
// The token expires in 7 days (after that, the user must log in again)
// ----------------------------------
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ----------------------------------
// POST /api/auth/register
// ----------------------------------
// Body: { name, email, password, role }
// Creates a new user. Password is automatically hashed by the model.
// ----------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Create the user (password gets hashed automatically by the pre-save hook)
    const user = await User.create({ name, email, password, role });

    // Generate a token for immediate login after registration
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors (like duplicate email)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use.' });
    }
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------
// POST /api/auth/login
// ----------------------------------
// Body: { email, password }
// Returns a JWT token if credentials are correct.
// ----------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated.' });
    }

    // Compare the entered password with the hashed one
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------
// GET /api/auth/me
// ----------------------------------
// Protected route — requires a valid JWT token.
// Returns the currently logged-in user's profile.
// ----------------------------------
router.get('/me', protect, async (req, res) => {
  // req.user was attached by the 'protect' middleware
  res.json({
    user: {
      id:        req.user._id,
      name:      req.user.name,
      email:     req.user.email,
      role:      req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = router;
