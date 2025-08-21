// src/services/audit.service.js
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Logs an event to the AuditLog.
 * @param {mongoose.Types.ObjectId} ticketId - The ID of the related ticket.
 * @param {string} actor - Who performed the action (system, agent, user).
 * @param {string} action - The action performed.
 * @param {Object} meta - Additional metadata about the event.
 * @param {string} [traceId] - A trace ID to correlate events. If not provided, one should ideally be generated or passed down.
 */
const logEvent = async (ticketId, actor, action, meta = {}, traceId = null) => {
  try {
    // In a real app, traceId should ideally be passed down through the request context
    // or generated at the very beginning of a workflow (like in agent.service.js)
    // If not provided here, it's a problem for correlation.
    if (!traceId) {
        logger.warn('Audit log event created without traceId', { ticketId, actor, action });
        // You might choose to generate one here, but it's better to pass it down.
        // For now, we'll log a warning.
    }

    const logEntry = new AuditLog({
      ticketId,
      traceId, // Can be null if not provided
      actor,
      action,
      meta,
    });

    await logEntry.save();
    logger.debug('Audit event logged', { ticketId, actor, action, traceId });
  } catch (err) {
    // Don't let audit logging failures break the main flow, but log the error
    logger.error('Failed to log audit event', { error: err.message, ticketId, actor, action });
  }
};

/**
 * Retrieves audit logs for a specific ticket, ordered by timestamp.
 * @param {mongoose.Types.ObjectId} ticketId - The ID of the ticket.
 * @returns {Promise<Array>} - Array of audit log entries.
 */
const getAuditLogByTicketId = async (ticketId) => {
  try {
    const logs = await AuditLog.find({ ticketId }).sort({ createdAt: 1 }); // Ascending order
    logger.debug('Audit logs fetched for ticket', { ticketId, count: logs.length });
    return logs;
  } catch (err) {
    logger.error('Failed to fetch audit logs for ticket', { error: err.message, ticketId });
    throw new Error('Could not retrieve audit logs');
  }
};

/**
 * Retrieves audit logs for a specific trace ID, ordered by timestamp.
 * Useful for tracking the entire agentic workflow for a ticket.
 * @param {string} traceId - The trace ID.
 * @returns {Promise<Array>} - Array of audit log entries.
 */
const getAuditLogByTraceId = async (traceId) => {
  try {
    if (!traceId) {
        throw new Error('Trace ID is required');
    }
    const logs = await AuditLog.find({ traceId }).sort({ createdAt: 1 }); // Ascending order
    logger.debug('Audit logs fetched for trace', { traceId, count: logs.length });
    return logs;
  } catch (err) {
    logger.error('Failed to fetch audit logs for trace', { error: err.message, traceId });
    throw new Error('Could not retrieve audit logs for trace');
  }
};

module.exports = {
  logEvent,
  getAuditLogByTicketId,
  getAuditLogByTraceId,
};