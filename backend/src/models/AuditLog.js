// src/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  traceId: {
    type: String,
    required: true,
    index: true, // Index for faster lookups by traceId
  },
  actor: {
    type: String,
    enum: ['system', 'agent', 'user'],
    required: true,
  },
  action: {
    type: String,
    required: true,
    // Add common actions here, but allow flexibility
    // enum: ['TICKET_CREATED', 'AGENT_CLASSIFIED', 'KB_RETRIEVED', 'DRAFT_GENERATED', 'AUTO_CLOSED', 'ASSIGNED_TO_HUMAN', 'REPLY_SENT']
  },
  meta: {
    type: mongoose.Schema.Types.Mixed, // Flexible JSON object for extra details
  }
}, {
  timestamps: true // Adds createdAt (which is the timestamp)
});

module.exports = mongoose.model('AuditLog', auditLogSchema);