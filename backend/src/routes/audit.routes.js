// src/routes/audit.routes.js
const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { getAuditLogByTicketId } = require('../controllers/audit.controller');

const router = express.Router();

// Apply authentication middleware to all routes in this file
router.use(protect);

// @route   GET /api/audit/tickets/:ticketId
// @desc    Get audit logs for a specific ticket
// @access  Private (Access control is handled inside the controller based on user role)
router.route('/tickets/:ticketId')
  .get(getAuditLogByTicketId);

// You could add other audit routes here if needed, like getting by traceId
// router.route('/trace/:traceId')
//   .get(authorize('agent', 'admin'), getAuditLogByTraceId); // Example

module.exports = router;