#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://trading-dashboard-backend-qwe4.onrender.com';

console.log('🔍 LAKSHYA Backend Connection Test');
console.log('=====================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testConnection() {
  const tests = [
    { name: 'Health Check', endpoint: '/api/status', method: 'GET' },
    { name: 'Market Data', endpoint: '/api/market-data', method: 'GET' },
    { name: 'Signals', endpoint: '/api/signals', method: 'GET' },
    { name: 'Test Telegram', endpoint: '/api/test-telegram', method: 'POST' },
    { name: 'Run Strategies', endpoint: '/api/run-strategies', method: 'POST' }
  ];

  console.log('Running connection tests...\n');

  for (const test of tests) {
    try {
      console.log(`⏳ Testing ${test.name}...`);
      
      const config = {
        method: test.method.toLowerCase(),
        url: `${BACKEND_URL}${test.endpoint}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.method === 'POST') {
        config.data = {};
      }

      const response = await axios(config);
      
      console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
      if (response.data) {
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      if (error.response) {
        console.log(`   Status: ${error.response.status} ${error.response.statusText}`);
        console.log(`   Error: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
      } else if (error.request) {
        console.log(`   Error: No response received (${error.code})`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }

  console.log('🏁 Connection test completed!');
  console.log('');
  console.log('📝 Troubleshooting Tips:');
  console.log('1. Check if your Render backend service is running');
  console.log('2. Verify environment variables are set correctly');
  console.log('3. Ensure CORS is configured for your frontend domain');
  console.log('4. Check Render service logs for detailed error messages');
}

testConnection().catch(console.error);