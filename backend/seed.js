// seed.js
require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Article = require('./src/models/Article');
const Ticket = require('./src/models/Ticket');
// const Config = require('./src/models/Config'); // We'll handle config separately if needed

const logger = require('./src/utils/logger');

// Sample data based on the "Starter Seed" example
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'securepassword123', // Will be hashed by User model pre-save hook
    role: 'admin',
  },
  {
    name: 'Agent User',
    email: 'agent@example.com',
    password: 'securepassword123',
    role: 'agent',
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'securepassword123',
    role: 'user',
  },
];

const articles = [
  {
    title: 'How to update payment method',
    body: 'To update your payment method, navigate to your account settings and select the \'Payment Methods\' section. From there, you can add, remove, or set a default payment method.',
    tags: ['billing', 'payments', 'account'],
    status: 'published',
  },
  {
    title: 'Troubleshooting 500 errors',
    body: 'A 500 Internal Server Error indicates a problem on the server side. Try refreshing the page. If the issue persists, check the application logs for specific error messages. Common causes include database connection issues, unhandled exceptions, or misconfigurations.',
    tags: ['tech', 'errors', 'troubleshooting'],
    status: 'published',
  },
  {
    title: 'Tracking your shipment',
    body: 'You can track your shipment using the tracking number provided in your shipping confirmation email. Visit the carrier\'s website (e.g., FedEx, UPS, USPS) and enter the tracking number in their tracking tool to get real-time updates on your package location and estimated delivery date.',
    tags: ['shipping', 'delivery', 'tracking'],
    status: 'published',
  },
  {
    title: 'Order cancellation policy', // Example of a draft article
    body: 'Orders can be cancelled within 24 hours of placement for a full refund. After 24 hours, cancellations are subject to a 15% restocking fee. Please contact support with your order number to initiate a cancellation request.',
    tags: ['billing', 'orders', 'policy'],
    status: 'draft', // This one is a draft
  },
];

const tickets = [
  {
    title: 'Refund for double charge',
    description: 'I was charged twice for order #1234 on my credit card ending in 1234. Please process a refund for the duplicate charge as soon as possible.',
    category: 'other', // Agent will classify
    // createdBy will be linked by email
    // status defaults to 'open'
  },
  {
    title: 'App shows 500 on login',
    description: 'When I try to log in to the mobile app (version 2.1.3), the app crashes and displays a 500 Internal Server Error. The stack trace in the logs seems to point towards an issue in the authentication module. This happens every time I try to log in.',
    category: 'other', // Agent will classify
    // createdBy will be linked by email
  },
  {
    title: 'Where is my package?',
    description: 'My shipment for order #5678 was supposed to be delivered yesterday, but the tracking status hasn\'t updated in 5 days. It\'s currently showing "In Transit". I\'m concerned about the delay and would like an update on the expected delivery date.',
    category: 'other', // Agent will classify
    // createdBy will be linked by email
  },
];

const connectDB = async () => {
  try {
    // Use the same connection string as your app
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Options if needed
    });
    logger.info(`MongoDB Connected for seeding: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB for seeding: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (optional, be careful!)
    // Uncomment the lines below if you want to clear data before seeding each time
    /*
    await User.deleteMany({});
    logger.info('Users collection cleared');
    await Article.deleteMany({});
    logger.info('Articles collection cleared');
    await Ticket.deleteMany({});
    logger.info('Tickets collection cleared');
    // Note: Clearing Config might reset system settings unexpectedly
    // await Config.deleteMany({});
    */

    // Insert Users
    const createdUsers = await User.insertMany(users, { ordered: false }); // ordered: false allows partial success
    logger.info(`Inserted ${createdUsers.length} users`);

    // Create a map of email to user ID for easy lookup
    const userEmailToIdMap = {};
    createdUsers.forEach(user => {
        userEmailToIdMap[user.email] = user._id;
    });

    // Insert KB Articles
    const createdArticles = await Article.insertMany(articles, { ordered: false });
    logger.info(`Inserted ${createdArticles.length} KB articles`);

    // Prepare Tickets with createdBy linked to the correct user ID
    // Assuming all tickets are created by 'user@example.com'
    const userIdForTickets = userEmailToIdMap['user@example.com'];
    if (!userIdForTickets) {
        throw new Error('User for tickets (user@example.com) not found after user creation.');
    }

    const ticketsWithUser = tickets.map(ticket => ({
        ...ticket,
        createdBy: userIdForTickets
    }));

    // Insert Tickets
    const createdTickets = await Ticket.insertMany(ticketsWithUser, { ordered: false });
    logger.info(`Inserted ${createdTickets.length} tickets`);

    // Optional: Set initial Config if it doesn't exist or update it
    // This part depends on how you want to handle initial config.
    // The Config model has a static method getConfig that creates default if none exists.
    // For seeding, you might want to explicitly set values.
    /*
    const Config = require('./src/models/Config');
    let config = await Config.findOne();
    if (!config) {
        config = new Config({
            autoCloseEnabled: process.env.AUTO_CLOSE_ENABLED === 'true',
            confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.78
        });
        await config.save();
        logger.info('Initial Config document created/updated via seed');
    } else {
        // Optionally update existing config with env vars
        config.autoCloseEnabled = process.env.AUTO_CLOSE_ENABLED === 'true';
        config.confidenceThreshold = parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.78;
        await config.save();
        logger.info('Existing Config document updated via seed');
    }
    */

    logger.info('Seeding completed successfully!');
    process.exit(0); // Exit successfully

  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1); // Exit with error
  } finally {
    // Ensure the mongoose connection is closed
    if (mongoose.connection.readyState === 1) { // 1 = connected
        await mongoose.connection.close();
        logger.info('MongoDB connection closed after seeding.');
    }
  }
};

// Run the seed function if this script is executed directly
if (require.main === module) {
    seedData();
}

// Export for potential use in other scripts or tests
module.exports = seedData;