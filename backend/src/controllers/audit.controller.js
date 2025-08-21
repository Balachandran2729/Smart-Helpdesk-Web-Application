// src/controllers/audit.controller.js
const auditService = require('../services/audit.service');

// @desc    Get audit logs for a ticket
// @route   GET /api/tickets/:id/audit
// @access  Private (User: own tickets, Agent/Admin: assigned/all)
const getAuditLogByTicketId = async (req, res, next) => {
  try {
    const logs = await auditService.getAuditLogByTicketId(req.params.id);
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogByTicketId,
};