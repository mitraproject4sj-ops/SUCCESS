const axios = require('axios');
const WebSocket = require('ws');
const { MongoClient } = require('mongodb');
const DeploymentNotifier = require('../src/utils/DeploymentNotifier').default;

const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const ENDPOINTS = {
  frontend: 'https://lakshya-trading.netlify.app',
  backend: 'https://lakshya-trading-backend.onrender.com/health',
  websocket: 'wss://lakshya-trading-backend.onrender.com',
  database: process.env.MONGODB_URI
};

async function checkFrontend() {
  try {
    const response = await axios.head(ENDPOINTS.frontend);
    return response.status === 200;
  } catch (error) {
    console.error('Frontend health check failed:', error.message);
    return false;
  }
}

async function checkBackend() {
  try {
    const response = await axios.get(ENDPOINTS.backend);
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Backend health check failed:', error.message);
    return false;
  }
}

async function checkWebSocket() {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(ENDPOINTS.websocket);
      
      ws.on('open', () => {
        ws.close();
        resolve(true);
      });

      ws.on('error', () => {
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        ws.terminate();
        resolve(false);
      }, 5000);
    } catch (error) {
      console.error('WebSocket health check failed:', error.message);
      resolve(false);
    }
  });
}

async function checkDatabase() {
  try {
    const client = await MongoClient.connect(ENDPOINTS.database);
    await client.close();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return false;
  }
}

async function performHealthCheck() {
  console.log('Starting health check...');

  const status = {
    frontend: await checkFrontend(),
    backend: await checkBackend(),
    database: await checkDatabase(),
    websocket: await checkWebSocket()
  };

  console.log('Health check results:', status);

  // If any check fails, notify
  if (!Object.values(status).every(s => s)) {
    const deploymentInfo = {
      version: process.env.npm_package_version || '1.0.0',
      environment: 'production',
      changes: ['Automated health check detected issues'],
      deployedBy: 'System',
      timestamp: Date.now()
    };

    await DeploymentNotifier.getInstance().notifyDeployment(deploymentInfo, status);
  }

  return status;
}

async function startHealthChecks() {
  console.log('Starting automated health checks...');
  
  // Initial check
  await performHealthCheck();

  // Schedule regular checks
  setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);
}

if (require.main === module) {
  startHealthChecks().catch(console.error);
}

module.exports = {
  performHealthCheck,
  startHealthChecks
};