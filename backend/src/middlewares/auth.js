// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password'); // Exclude password

      if (!req.user) {
        logger.warn('Token valid but user not found', { userId: decoded.id });
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn('User role not authorized', { userId: req.user._id, role: req.user.role, requiredRoles: roles });
      return res.status(403).json({
        success: false,
        message: 'User role not authorized',
      });
    }
    next();
  };
};

module.exports = { protect, authorize };