// src/services/ticket.service.js
const Ticket = require('../models/Ticket');
const auditService = require('./audit.service');
const agentService = require('./agent.service'); // To trigger triage
const logger = require('../utils/logger');

const createTicket = async (ticketData, userId) => {
  const ticket = await Ticket.create({ ...ticketData, createdBy: userId });
  await auditService.logEvent(ticket._id, 'system', 'TICKET_CREATED', { message: 'Ticket created by user' });
  logger.info('Ticket created', { ticketId: ticket._id, userId });
  setImmediate(async () => {
    try {
      await agentService.processTicket(ticket._id);
    } catch (err) {
      logger.error('Error triggering agent triage', { ticketId: ticket._id, error: err.message });
      await auditService.logEvent(ticket._id, 'system', 'TRIAGE_FAILED', { error: err.message }, ticket._id); // Use ticket ID as trace ID if none generated yet
    }
  });

  return ticket;
};

const getTickets = async (filter = {}, userId, userRole) => {
  let query = { ...filter };
  
  // Users can only see their own tickets
  if (userRole === 'user') {
    query.createdBy = userId;
  }
  // Agents/Admins might see all or have different filters, handled by controller
  
  const tickets = await Ticket.find(query).populate('createdBy', 'name email').populate('assignee', 'name email').sort({ createdAt: -1 });
  logger.debug('Tickets fetched', { count: tickets.length, userId, role: userRole });
  return tickets;
};

const getTicketById = async (id, userId, userRole) => {
  let query = { _id: id }; 
  if (userRole === 'user') {
    query.createdBy = userId;
  }
  try {
    const ticket = await Ticket.findOne(query)
      .populate('createdBy', 'name email') // Populate creator info
      .populate('assignee', 'name email')  // Populate assignee info
      .populate({
        path: 'agentSuggestionId', // This must match the field name in your Ticket schema
        model: 'AgentSuggestion',   // Optional but explicit
        // select: '...' // You can specify fields to include if needed
      });

    if (!ticket) {
      throw new Error('Ticket not found or access denied');
    }

    logger.debug('Ticket fetched by ID', { ticketId: id, userId, userRole });
    return ticket;
  } catch (error) {
    logger.error('Error fetching ticket by ID', { ticketId: id, userId, userRole, error: error.message });
    throw error;
  }
};

const updateTicketStatus = async (ticketId, status, userId, userRole) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  const oldStatus = ticket.status;
  ticket.status = status;
  if (status === 'resolved' || status === 'closed') {
      ticket.assignee = userId; 
  }
  await ticket.save();
  
  await auditService.logEvent(ticket._id, userRole, 'STATUS_CHANGED', { from: oldStatus, to: status }, ticket._id); // Use ticket ID as trace ID if not available
  
  logger.info('Ticket status updated', { ticketId, from: oldStatus, to: status, userId });
  return ticket;
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  // Add other ticket-related logic as needed
};