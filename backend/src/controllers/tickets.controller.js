// src/controllers/tickets.controller.js
const ticketService = require('../services/ticket.service');
const auditService = require('../services/audit.service');

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private/User
const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tickets (with filters)
// @route   GET /api/tickets
// @access  Private (User: own tickets, Agent/Admin: potentially all)
const getTickets = async (req, res, next) => {
  try {
    // Basic filter support
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    // Add more filters as needed (e.g., category)

    const tickets = await ticketService.getTickets(filter, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private (User: own tickets, Agent/Admin: assigned or all)
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status (e.g., resolve, close, assign)
// @route   PUT /api/tickets/:id/status
// @access  Private (Agent/Admin primarily)
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const ticket = await ticketService.updateTicketStatus(req.params.id, status, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reply to a ticket (Agent/Admin)
// @route   POST /api/tickets/:id/reply
// @access  Private (Agent/Admin)
// const addReply = async (req, res, next) => {
//   // Implementation for adding replies (not strictly required in core spec but implied)
//   // This would involve creating a message/reply object linked to the ticket
//   // and updating ticket status
// };

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  // addReply
};