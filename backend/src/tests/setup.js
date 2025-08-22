// src/tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const connectDB = require('../config/db');

let mongoServer;
process.env.NODE_ENV = 'test'; 
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only'; 
process.env.PORT = process.env.PORT || '8080'; 
beforeAll(async () => {
  // Use an in-memory MongoDB instance for isolated tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Override the MONGO_URI environment variable for tests
  process.env.MONGO_URI = mongoUri;

  // Connect using your application's logic (which now includes bufferTimeoutMS)
  await connectDB();

  // --- Optional but good: Explicitly wait for Mongoose connection to be ready ---
  // Wait until Mongoose connection state is 1 (connected)
  // while (mongoose.connection.readyState !== 1) {
  //   await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms and check again
  // }
  // console.log('Mongoose connection is ready for tests.');
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
