import express from 'express';
import { MongoClient } from 'mongodb';
import os from 'os';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      service: 'lakshya-trading-backend',
      status: 'ok',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      system: {
        arch: os.arch(),
        platform: os.platform(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        cpu: os.cpus().length,
        loadAvg: os.loadavg()
      }
    };

    // Check MongoDB connection
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    await client.db('admin').command({ ping: 1 });
    await client.close();
    
    status.database = 'connected';

    res.json(status);
  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      service: 'lakshya-trading-backend',
      status: 'error',
      error: error.message
    });
  }
});

// Detailed system status
router.get('/status', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const stats = {
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpus: os.cpus(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAvg: os.loadavg(),
      uptime: os.uptime()
    },
    env: process.env.NODE_ENV
  };

  res.json(stats);
});

export default router;