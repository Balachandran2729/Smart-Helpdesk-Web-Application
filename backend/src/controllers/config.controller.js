// src/controllers/config.controller.js
const configService = require('../services/config.service');

// @desc    Get system configuration
// @route   GET /api/config
// @access  Private/Admin
const getConfig = async (req, res, next) => {
  try {
    const config = await configService.getConfig();
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system configuration
// @route   PUT /api/config
// @access  Private/Admin
const updateConfig = async (req, res, next) => {
  try {
    const config = await configService.updateConfig(req.body);
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConfig,
  updateConfig,
};