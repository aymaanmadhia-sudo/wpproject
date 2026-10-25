const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');

const protect = async (req, res, next) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.isConnected) {
    return res.status(503).json({
      success: false,
      error: 'Database is not connected',
      details: dbStatus.error || 'Please configure MONGODB_URI to access your vault.'
    });
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized: Access token missing'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'proofpocket_default_jwt_secret_key_2025';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized: User account no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized: Token is invalid or expired',
      details: err.message
    });
  }
};

module.exports = { protect };
