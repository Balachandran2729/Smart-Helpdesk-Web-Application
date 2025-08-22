// src/routes/tickets.routes.js
const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  addReply,
} = require('../controllers/tickets.controller');

const { getAuditLogByTicketId } = require('../controllers/audit.controller');

const router = express.Router();

// All ticket routes require authentication
router.use(protect);

router.route('/')
  .post(createTicket) // Any authenticated user
  .get(getTickets); // Any authenticated user (filtered by role in controller)

router.route('/:id')
  .get(getTicketById); // Any authenticated user (filtered by role in controller)
router.route('/:id/reply')
  .post(authorize('agent', 'admin'), addReply);
router.route('/:id/status')
  .put(authorize('agent', 'admin'), updateTicketStatus); // Agent or Admin

router.route('/:id/audit')
  .get(getAuditLogByTicketId); // Any authenticated user (filtered by role in controller)

module.exports = router;