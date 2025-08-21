// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Adjust as needed
  });
};

const registerUser = async (userData) => {
  const { name, email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }
  const user = await User.create({
    name,
    email,
    password,
    role: userData.role || 'user', 
  });
  const token = generateToken(user._id);
  logger.info('User registered', { userId: user._id, email: user.email });
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password'); // Explicitly select password

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id);

  logger.info('User logged in', { userId: user._id, email: user.email });
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

module.exports = {
  registerUser,
  loginUser,
};