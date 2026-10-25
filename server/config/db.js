const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to avoid querySrv ECONNREFUSED on Windows/ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Use default resolver if custom servers cannot be set
}

let connectionState = {
  isConnected: false,
  host: null,
  dbName: null,
  error: null,
  stateString: 'disconnected'
};

const maskUri = (uri) => {
  if (!uri) return '';
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3');
  } catch {
    return '***hidden***';
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'proofpocket';

  if (!uri || uri.trim() === '' || uri.includes('<db_username>') || uri.includes('<username>')) {
    const errorMsg = 'MONGODB_URI is not configured or still contains placeholder values. Please set your actual MongoDB Atlas connection string.';
    connectionState = {
      isConnected: false,
      host: null,
      dbName: null,
      error: errorMsg,
      stateString: 'not_configured'
    };
    console.warn(`[ProofPocket DB] WARNING: ${errorMsg}`);
    return false;
  }

  try {
    console.log(`[ProofPocket DB] Attempting connection to MongoDB Atlas at ${maskUri(uri)}...`);
    const conn = await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 8000,
    });

    connectionState = {
      isConnected: true,
      host: conn.connection.host,
      dbName: conn.connection.name,
      error: null,
      stateString: 'connected'
    };

    console.log(`[ProofPocket DB] Connected successfully to MongoDB Atlas! Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    let diagnosticHelp = error.message;

    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      diagnosticHelp = 'Authentication failed: Verify your MongoDB Atlas database username and password.';
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      diagnosticHelp = 'Cluster hostname not found: Check that your MongoDB Atlas cluster domain in the connection string is valid.';
    } else if (error.message.includes('Server selection timed out') || error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
      diagnosticHelp = 'Connection timed out: Check your MongoDB Atlas Network Access whitelist. You must allow your current IP address (or 0.0.0.0/0 for anywhere).';
    }

    connectionState = {
      isConnected: false,
      host: null,
      dbName: null,
      error: diagnosticHelp,
      stateString: 'error'
    };

    console.error(`[ProofPocket DB] Connection Error: ${diagnosticHelp}`);
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  connectionState.isConnected = false;
  connectionState.stateString = 'disconnected';
  console.warn('[ProofPocket DB] Lost connection to MongoDB.');
});

mongoose.connection.on('reconnected', () => {
  connectionState.isConnected = true;
  connectionState.stateString = 'connected';
  connectionState.error = null;
  console.log('[ProofPocket DB] Reconnected to MongoDB.');
});

const getDbStatus = () => {
  return {
    ...connectionState,
    readyState: mongoose.connection.readyState
  };
};

module.exports = { connectDB, getDbStatus, maskUri };
