const express = require('express');
const router = express.Router();
const { getDbStatus, connectDB, maskUri } = require('../config/db');

// @route   GET /api/health
// @desc    Check API and MongoDB connection status with clear diagnostics
// @access  Public
router.get('/', (req, res) => {
  const db = getDbStatus();
  const configured = Boolean(
    process.env.MONGODB_URI &&
    process.env.MONGODB_URI.trim() !== '' &&
    !process.env.MONGODB_URI.includes('<db_username>') &&
    !process.env.MONGODB_URI.includes('<username>')
  );

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      isConnected: db.isConnected,
      state: db.stateString,
      host: db.host,
      databaseName: db.dbName,
      isConfigured: configured,
      maskedUri: maskUri(process.env.MONGODB_URI),
      error: db.error
    }
  });
});

// @route   POST /api/health/reconnect
// @desc    Attempt reconnecting to MongoDB (useful if user updated .env)
// @access  Public
router.post('/reconnect', async (req, res) => {
  // Reload dotenv if needed
  require('dotenv').config();
  const success = await connectDB();
  const db = getDbStatus();

  res.json({
    success,
    database: {
      isConnected: db.isConnected,
      state: db.stateString,
      host: db.host,
      databaseName: db.dbName,
      error: db.error
    }
  });
});

module.exports = router;
