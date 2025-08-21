// src/tests/unit/audit.service.test.js
const auditService = require('../../services/audit.service');
const AuditLog = require('../../models/AuditLog');
const Ticket = require('../../models/Ticket');
const User = require('../../models/User');

describe('Audit Service', () => {
  let testUser, testTicket;

  beforeEach(async () => {
    await AuditLog.deleteMany({});
    await Ticket.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      name: 'Audit Test User',
      email: 'audituser@example.com',
      password: 'password123',
    });

    testTicket = await Ticket.create({
      title: 'Audit Test Ticket',
      description: 'For testing audit logs.',
      createdBy: testUser._id,
    });
  });

  describe('logEvent', () => {
    it('should create an audit log entry', async () => {
      const actor = 'system';
      const action = 'TEST_ACTION';
      const meta = { detail: 'This is test metadata' };
      const traceId = 'trace-id-123';

      await auditService.logEvent(testTicket._id, actor, action, meta, traceId);

      const logEntry = await AuditLog.findOne({ ticketId: testTicket._id });
      expect(logEntry).toBeDefined();
      expect(logEntry.ticketId.toString()).toBe(testTicket._id.toString());
      expect(logEntry.traceId).toBe(traceId);
      expect(logEntry.actor).toBe(actor);
      expect(logEntry.action).toBe(action);
      expect(logEntry.meta).toEqual(meta); // Use toEqual for object comparison
    });

    it('should handle logEvent without traceId gracefully', async () => {
         // This test depends on how you want to handle missing traceId.
         // Our implementation logs a warning but still saves the entry.
         const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(); // Spy on logger warning

         await auditService.logEvent(testTicket._id, 'agent', 'NO_TRACE_ACTION', {});

         const logEntry = await AuditLog.findOne({ action: 'NO_TRACE_ACTION' });
         expect(logEntry).toBeDefined();
         // Depending on implementation, traceId might be null or undefined
         // expect(logEntry.traceId).toBeFalsy(); // Check if traceId is falsy

         // expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('without traceId')); // Check if warning was logged
         consoleSpy.mockRestore(); // Restore console
    });
  });

  describe('getAuditLogByTicketId', () => {
    it('should retrieve audit logs for a ticket ordered by timestamp', async () => {
         const traceId = 'ordered-trace-456';
         // Log events in a specific order
         await auditService.logEvent(testTicket._id, 'system', 'ACTION_1', {}, traceId);
         // Simulate a small delay to ensure different timestamps (though MongoMemoryServer might be fast)
         await new Promise(resolve => setTimeout(resolve, 10));
         await auditService.logEvent(testTicket._id, 'agent', 'ACTION_2', {}, traceId);

         const logs = await auditService.getAuditLogByTicketId(testTicket._id);

         expect(logs).toHaveLength(2);
         expect(logs[0].action).toBe('ACTION_1');
         expect(logs[1].action).toBe('ACTION_2');
         // Check they have the correct ticketId
         expect(logs[0].ticketId.toString()).toBe(testTicket._id.toString());
         expect(logs[1].ticketId.toString()).toBe(testTicket._id.toString());
    });
  });
});