// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose'); // Need for readyz check
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/error');
// Import Routes
const authRoutes = require('./routes/auth.routes');
const kbRoutes = require('./routes/kb.routes');
const ticketsRoutes = require('./routes/tickets.routes');
const agentRoutes = require('./routes/agent.routes');
const configRoutes = require('./routes/config.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic Request Logging Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs: duration,
            // userId: req.user?.id // If auth middleware runs before this
        });
    });
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/config', configRoutes);
app.use('/api/audit', auditRoutes);

// Health Checks
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/readyz', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
             res.status(200).json({ status: 'OK', service: 'API', timestamp: new Date().toISOString() });
        } else {
             res.status(503).json({ status: 'Service Unavailable', reason: 'Database not connected', timestamp: new Date().toISOString() });
        }
    } catch (err) {
        logger.error('Readiness check failed', { error: err.message });
        res.status(503).json({ status: 'Service Unavailable', reason: 'Readiness check error', timestamp: new Date().toISOString() });
    }
});
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});
app.use(errorHandler);
app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});