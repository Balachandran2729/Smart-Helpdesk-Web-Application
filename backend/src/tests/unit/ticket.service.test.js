// src/tests/unit/ticket.service.test.js
const ticketService = require('../../services/ticket.service');
const Ticket = require('../../models/Ticket');
const User = require('../../models/User');

describe('Ticket Service', () => {
  let testUser;

  beforeEach(async () => {
    await Ticket.deleteMany({});
    await User.deleteMany({});
    // Create a test user
    testUser = await User.create({
      name: 'Ticket Test User',
      email: 'ticketuser@example.com',
      password: 'password123',
    });
  });

  describe('createTicket', () => {
    it('should create a new ticket and assign createdBy', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'This is a test ticket description.',
        category: 'tech',
      };

      const createdTicket = await ticketService.createTicket(ticketData, testUser._id);

      expect(createdTicket).toBeDefined();
      expect(createdTicket.title).toBe(ticketData.title);
      expect(createdTicket.description).toBe(ticketData.description);
      expect(createdTicket.category).toBe(ticketData.category); // Might be overridden by agent later, but initially set
      expect(createdTicket.createdBy.toString()).toBe(testUser._id.toString());
      expect(createdTicket.status).toBe('open'); // Initial status

      // Verify in DB
      const ticketInDb = await Ticket.findById(createdTicket._id);
      expect(ticketInDb).toBeDefined();
      expect(ticketInDb.title).toBe(ticketData.title);
    });
  });

  // Add tests for getTickets, getTicketById, updateTicketStatus if desired
});