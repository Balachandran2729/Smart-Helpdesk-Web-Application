// src/models/Config.js
const mongoose = require('mongoose');

// Assuming a single config document for the system
const configSchema = new mongoose.Schema({
  autoCloseEnabled: {
    type: Boolean,
    default: true,
  },
  confidenceThreshold: {
    type: Number,
    default: 0.78,
    min: 0,
    max: 1,
  },
  // slaHours: { // Optional for stretch goal
  //   type: Number,
  //   default: 24,
  // }
}, {
  timestamps: true // Adds createdAt, updatedAt
});

// Ensure only one config document exists
configSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = new this(); // Create default config
    await config.save();
  }
  return config;
};

module.exports = mongoose.model('Config', configSchema);