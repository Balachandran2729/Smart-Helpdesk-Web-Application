// src/utils/logger.js
const winston = require('winston');
const { format, transports } = winston;
const { combine, timestamp, printf, json } = format;

// Define a custom format for logs
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return JSON.stringify({ level, message, timestamp, ...meta });
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(), // Adds ISO timestamp
    json() // Outputs as JSON - great for structured logging
    // You could also use logFormat if you wanted a specific string format
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp(),
        // For console, a simple format might be easier to read
        printf(({ timestamp, level, message }) => {
           return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
      )
    }),
    // Add file transport if needed
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;