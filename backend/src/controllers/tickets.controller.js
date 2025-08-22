// backend/src/controllers/tickets.controller.js
const ticketService = require('../services/ticket.service');
const auditService = require('../services/audit.service');
const Ticket = require('../models/Ticket');
const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user.id);
    res.status(201).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};
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
      data: tickets, // This structure is fine
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
    // req.params.id is the ticket ID from the URL
    // req.user.id is the authenticated user's ID
    // req.user.role is the authenticated user's role
    const ticket = await ticketService.getTicketById(req.params.id, req.user.id, req.user.role);
    
    // If ticketService.getTicketById doesn't throw, it found the ticket
    res.status(200).json({
      success: true,
      ticket, // Match frontend expectation { success: true, ticket }
    });
  } catch (error) {
    // If ticketService.getTicketById throws (e.g., not found, access denied),
    // the error middleware will handle it (likely sending 404 or 403)
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
      ticket, // Match frontend expectation { success: true, ticket }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reply to a ticket (Agent/Admin)
// @route   POST /api/tickets/:id/reply
// @access  Private (Agent/Admin)
const addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body; // Expecting { content: "Reply message..." }

    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }
    const userId = req.user.id;
    const userRole = req.user.role;
    if (userRole !== 'agent' && userRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Only agents and admins can add replies.' });
    }
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    const oldStatus = ticket.status;
    if (ticket.status === 'waiting_human') {
        ticket.status = 'resolved';
        ticket.assignee = userId; 
        await ticket.save();
        await auditService.logEvent(ticket._id, userRole, 'STATUS_CHANGED', { from: oldStatus, to: 'resolved' }, ticket._id); // Use ticket ID as trace ID if none from context
    } else if (ticket.status === 'resolved' || ticket.status === 'closed') {
    } else {
        ticket.status = 'resolved';
        ticket.assignee = userId;
        await ticket.save();
        await auditService.logEvent(ticket._id, userRole, 'STATUS_CHANGED', { from: oldStatus, to: 'resolved' }, ticket._id);
    }
    await auditService.logEvent(ticket._id, userRole, 'REPLY_SENT', { messageSnippet: content.substring(0, 50) + (content.length > 50 ? '...' : '') }, ticket._id);

    // --- Respond ---
    // Return the updated ticket or just success
    res.status(200).json({
      success: true,
      message: 'Reply processed and ticket updated',
       ticket, // Optionally return the updated ticket
    });

  } catch (error) {
    next(error); // Pass to error handling middleware
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById, // Export the corrected function
  updateTicketStatus,
  addReply
};