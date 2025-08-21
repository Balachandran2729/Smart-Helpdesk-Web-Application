// src/controllers/auth.controller.js
const authService = require('../services/auth.service');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { token, user } = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    // Let the error middleware handle it
    error.statusCode = 400; // Set status code for user errors
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const { token, user } = await authService.loginUser(email, password);
    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

module.exports = {
  register,
  login,
};