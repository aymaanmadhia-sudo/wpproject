const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded receipts
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// Route Handlers
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/repairs', require('./routes/repairs'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reminders', require('./routes/reminders'));

// Root endpoint info
app.get('/api', (req, res) => {
  res.json({
    name: 'ProofPocket API',
    version: '1.0.0',
    description: 'Personal Ownership Vault API',
    endpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/items',
      '/api/repairs',
      '/api/dashboard/stats',
      '/api/reminders'
    ]
  });
});

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

// Start server
const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[ProofPocket Server] Running on http://localhost:${PORT}`);
  });
};

startServer();
