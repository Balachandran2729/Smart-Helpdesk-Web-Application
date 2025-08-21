// src/tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// --- IMPORTANT: SET ENVIRONMENT VARIABLES FOR TESTS ---
// Set default environment variables needed for the application to run in tests
process.env.NODE_ENV = 'test'; // Optional: indicate test environment
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only'; // Provide a default for tests
process.env.PORT = process.env.PORT || '8080'; // If needed
// MONGO_URI will be set by MongoMemoryServer below
// --- END ENVIRONMENT VARIABLES ---

// Setup before all tests
beforeAll(async () => {
  // Use an in-memory MongoDB instance for isolated tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Set the MONGO_URI for tests
  process.env.MONGO_URI = mongoUri; // This is crucial

  await mongoose.connect(mongoUri, {
    // useNewUrlParser: true, // Not needed for Mongoose 6+
    // useUnifiedTopology: true, // Not needed for Mongoose 6+
  });
});

// Teardown after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Clean up database between tests if needed (optional)
// beforeEach(async () => {
//   // const collections = await mongoose.connection.db.collections();
//   // for (let collection of collections) {
//   //   await collection.deleteMany({});
//   // }
// });
