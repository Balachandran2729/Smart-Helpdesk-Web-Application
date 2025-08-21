// src/routes/agent.routes.js
const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { getAgentSuggestion, triggerTriage } = require('../controllers/agent.controller');

const router = express.Router();

// Agent routes require authentication
router.use(protect);

router.route('/suggestion/:ticketId')
  .get(authorize('agent', 'admin'), getAgentSuggestion); // Agent or Admin

// Optional: Internal endpoint to manually trigger
router.route('/triage')
  .post(authorize('admin'), triggerTriage); // Admin only

module.exports = router;