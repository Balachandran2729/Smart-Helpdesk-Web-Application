// src/tests/unit/agent.service.test.js
const agentService = require('../../services/agent.service');
const Ticket = require('../../models/Ticket');
const Article = require('../../models/Article');
const AgentSuggestion = require('../../models/AgentSuggestion');
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');
const Config = require('../../models/Config');

describe('Agent Service', () => {
  let testUser, testTicketBilling;

  beforeAll(async () => {
    // Clear relevant collections
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Article.deleteMany({});
    await AgentSuggestion.deleteMany({});
    await AuditLog.deleteMany({});
    await Config.deleteMany({});

    testUser = await User.create({
      name: 'Agent Test User',
      email: 'agentuser@example.com',
      password: 'password123',
    });

    // Create test KB articles
    await Article.insertMany([
      {
        title: 'Billing Refund Policy',
        body: 'Our policy on refunds and double charges.',
        tags: ['billing', 'refund'],
        status: 'published',
      },
      {
        title: 'Tech Troubleshooting Guide',
        body: 'Steps to fix common tech issues like 500 errors.',
        tags: ['tech', 'error'],
        status: 'published',
      },
    ]);

    // Create ticket for high-confidence test
    testTicketBilling = await Ticket.create({
      title: 'Double charge on my card',
      description: 'I see two charges for the same order. Please refund one.',
      category: 'other', // Agent should classify
      createdBy: testUser._id,
    });

    // Ensure a clean config exists with known values for testing
    let config = await Config.findOne();
    if (!config) {
        config = new Config();
    }
    // Set explicit values for testing
    config.autoCloseEnabled = true;
    config.confidenceThreshold = 0.78;
    await config.save();
  });

  describe('processTicket', () => {
    it('should correctly classify, retrieve, draft, and auto-close a high-confidence ticket', async () => {
      // Ensure Config is as expected for this test
      const config = await Config.getConfig();
      expect(config.autoCloseEnabled).toBe(true);
      expect(config.confidenceThreshold).toBe(0.78);

      await agentService.processTicket(testTicketBilling._id);

      // Check Ticket update
      const updatedTicket = await Ticket.findById(testTicketBilling._id);
      expect(updatedTicket).toBeDefined();
      expect(updatedTicket.status).toBe('resolved'); // Should be auto-closed
      expect(updatedTicket.category).toBe('billing'); // Should be classified
      expect(updatedTicket.agentSuggestionId).toBeDefined();

      // Check AgentSuggestion
      const suggestion = await AgentSuggestion.findById(updatedTicket.agentSuggestionId);
      expect(suggestion).toBeDefined();
      expect(suggestion.ticketId.toString()).toBe(testTicketBilling._id.toString());
      expect(suggestion.predictedCategory).toBe('billing');
      // The stub logic for "refund" should give high confidence (around 0.9)
      expect(suggestion.confidence).toBeGreaterThanOrEqual(0.8);
      // Draft should reference relevant KB
      expect(suggestion.draftReply).toEqual(expect.stringContaining('Billing Refund Policy'));
      expect(suggestion.autoClosed).toBe(true);

      // Check Audit Logs exist and have traceId
      const auditLogs = await AuditLog.find({ ticketId: testTicketBilling._id }).sort({ createdAt: 1 });
      expect(auditLogs.length).toBeGreaterThan(0);
      const traceIds = [...new Set(auditLogs.map(log => log.traceId))]; // Get unique traceIds
      expect(traceIds).toHaveLength(1); // Should be only one traceId for this ticket's triage
      
      // --- CORRECTED ASSERTIONS ---
      // Check for specific log actions, not relying on exact order of first element
      expect(auditLogs.some(log => log.action === 'TICKET_CREATED' && log.actor === 'system')).toBe(true);
      expect(auditLogs.some(log => log.action === 'PLAN_CREATED' && log.actor === 'agent')).toBe(true);
      expect(auditLogs.some(log => log.action === 'AGENT_CLASSIFIED' && log.actor === 'agent')).toBe(true);
      expect(auditLogs.some(log => log.action === 'KB_RETRIEVED' && log.actor === 'agent')).toBe(true);
      expect(auditLogs.some(log => log.action === 'DRAFT_GENERATED' && log.actor === 'agent')).toBe(true);
      expect(auditLogs.some(log => log.action === 'AUTO_CLOSED' && log.actor === 'agent')).toBe(true);
      expect(auditLogs.some(log => log.action === 'TRIAGE_COMPLETED' && log.actor === 'agent')).toBe(true);
    });

    it('should classify and assign to human for a low-confidence ticket', async () => {
         // Create a *new* ticket specifically for this test with text that yields low confidence
         // Avoid any keywords like billing, tech, shipping, refund, error, delivery etc.
         const testTicketLowConf = await Ticket.create({
            title: 'Feedback on Service Experience',
            description: 'I wanted to share some general thoughts about my overall experience with the service. It was okay, nothing specific to report.', // Very generic
            category: 'other',
            createdBy: testUser._id,
         });

         // Ensure Config is as expected for this test
         const configCheck = await Config.getConfig();
         expect(configCheck.autoCloseEnabled).toBe(true);
         expect(configCheck.confidenceThreshold).toBe(0.78);

         await agentService.processTicket(testTicketLowConf._id);

         // Check Ticket update
         const updatedTicket = await Ticket.findById(testTicketLowConf._id);
         expect(updatedTicket).toBeDefined();
         // With confidence ~0.5 (< 0.78) and autoCloseEnabled=true, it should be assigned to human
         expect(updatedTicket.status).toBe('waiting_human');
         expect(updatedTicket.agentSuggestionId).toBeDefined();

         // Check AgentSuggestion
         const suggestion = await AgentSuggestion.findById(updatedTicket.agentSuggestionId);
         expect(suggestion).toBeDefined();
         expect(suggestion.ticketId.toString()).toBe(testTicketLowConf._id.toString());
         // Should be classified as 'other' due to lack of keywords
         expect(suggestion.predictedCategory).toBe('other');
         // Confidence should be low (stub gives base 0.5)
         expect(suggestion.confidence).toBeLessThan(0.6); // e.g., 0.5
         expect(suggestion.autoClosed).toBe(false);

         // Check Audit Logs
         const auditLogs = await AuditLog.find({ ticketId: testTicketLowConf._id }).sort({ createdAt: 1 });
         expect(auditLogs.length).toBeGreaterThan(0);
         const traceIds = [...new Set(auditLogs.map(log => log.traceId))];
         expect(traceIds).toHaveLength(1);
         // Check for human assignment log
         expect(auditLogs.some(log => log.action === 'ASSIGNED_TO_HUMAN')).toBe(true);
         expect(auditLogs.some(log => log.action === 'TRIAGE_COMPLETED')).toBe(true);
    });
  });
});