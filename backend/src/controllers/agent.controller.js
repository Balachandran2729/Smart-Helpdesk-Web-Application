// src/controllers/agent.controller.js
const agentService = require('../services/agent.service');
const AgentSuggestion = require('../models/AgentSuggestion');

// @desc    Get agent suggestion for a ticket
// @route   GET /api/agent/suggestion/:ticketId
// @access  Private (Agent/Admin)
const getAgentSuggestion = async (req, res, next) => {
  try {
    const suggestion = await AgentSuggestion.findOne({ ticketId: req.params.ticketId }).populate('articleIds');
    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Agent suggestion not found for this ticket' });
    }
    res.status(200).json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger triage for a ticket (internal/debug)
// @route   POST /api/agent/triage
// @access  Private/Admin (or internal service call)
const triggerTriage = async (req, res, next) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ success: false, message: 'Ticket ID is required' });
    }
    // In a real scenario, you'd enqueue this job. For simplicity, call directly.
    await agentService.processTicket(ticketId);
    res.status(202).json({
      success: true,
      message: 'Triage process initiated for ticket',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgentSuggestion,
  triggerTriage // Optional, might be internal
};