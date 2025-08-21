// src/routes/config.routes.js
const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { getConfig, updateConfig } = require('../controllers/config.controller');

const router = express.Router();

// Config routes require authentication and admin role
router.use(protect, authorize('admin'));

router.route('/')
  .get(getConfig)
  .put(updateConfig);

module.exports = router;