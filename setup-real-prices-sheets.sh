#!/bin/bash

# LAKSHYA Trading Dashboard - Complete Setup Script
echo "🚀 LAKSHYA Trading Dashboard - Real Prices + Google Sheets Setup"
echo "================================================================"

# 1. Install required dependencies
echo "📦 Installing required packages..."
npm install googleapis@^118.0.0 axios@^1.6.0

# 2. Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env.local << EOF
# Real Price APIs (No keys required)
REACT_APP_BINANCE_API_URL=https://api.binance.com/api/v3
REACT_APP_COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_PATH=./lakshya-service-account.json
GOOGLE_SHEET_ID=your-spreadsheet-id-here

# Currency Settings
USD_TO_INR_RATE=84.25
DEFAULT_CURRENCY=INR

# Update Intervals (milliseconds)
PRICE_UPDATE_INTERVAL=30000
SHEETS_UPDATE_INTERVAL=300000
EOF

# 3. Create Google Sheets service account template
echo "🔧 Creating Google Sheets setup template..."
cat > lakshya-service-account-template.json << EOF
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"
}
EOF

# 4. Create quick test script
echo "🧪 Creating test scripts..."
cat > test-real-prices.js << EOF
const axios = require('axios');

async function testRealPrices() {
  console.log('🧪 Testing Real Price APIs...\n');
  
  try {
    // Test Binance API
    console.log('📊 Testing Binance API...');
    const binanceResponse = await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
    const btcPrice = parseFloat(binanceResponse.data.lastPrice);
    const btcINR = btcPrice * 84.25;
    
    console.log(\`✅ Binance: BTC = $\${btcPrice} (₹\${btcINR.toLocaleString('en-IN')})\`);
    
    // Test CoinGecko API
    console.log('🦎 Testing CoinGecko API...');
    const geckoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr');
    const btcINRDirect = geckoResponse.data.bitcoin.inr;
    
    console.log(\`✅ CoinGecko: BTC = ₹\${btcINRDirect.toLocaleString('en-IN')}\`);
    
    console.log('\n🎉 Both APIs working! Real prices available.');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testRealPrices();
EOF

# 5. Create Google Sheets setup guide
cat > GOOGLE_SHEETS_SETUP.md << EOF
# 🔧 Google Sheets Integration Setup

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "LAKSHYA Trading Dashboard"
3. Enable "Google Sheets API"

## Step 2: Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: "lakshya-sheets-service"
4. Create and download JSON key file
5. Rename to: \`lakshya-service-account.json\`

## Step 3: Create Google Sheet
1. Create new Google Sheet: "LAKSHYA Trading Data"
2. Copy Sheet ID from URL: \`https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit\`
3. Share sheet with service account email (Editor permissions)

## Step 4: Configure Environment
1. Update \`.env.local\` with your Sheet ID
2. Place \`lakshya-service-account.json\` in project root
3. Run: \`npm run test-sheets\`

## Sheet Structure Created Automatically:
- **Trades**: Individual trade logging
- **Daily_Analysis**: Daily performance summary  
- **Performance**: Strategy-wise performance
- **Real_Prices**: Live price updates
- **Strategies**: Strategy configuration

## Alternative: CSV Export
If Google Sheets setup is complex, use local CSV export:
- All data saved to \`/exports\` folder
- Automatic daily/weekly reports
- Import to any spreadsheet software
EOF

# 6. Add npm scripts
echo "📝 Adding npm scripts..."
node -e "
const fs = require('fs');
const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));
package.scripts = package.scripts || {};
package.scripts['test-prices'] = 'node test-real-prices.js';
package.scripts['setup-sheets'] = 'node -e \"console.log(\\\"📖 Read GOOGLE_SHEETS_SETUP.md for instructions\\\")\"';
package.scripts['start-trading'] = 'REACT_APP_REAL_PRICES=true npm start';
fs.writeFileSync('package.json', JSON.stringify(package, null, 2));
"

echo ""
echo "✅ SETUP COMPLETE!"
echo "=================="
echo ""
echo "🎯 Quick Start:"
echo "1. Test real prices: npm run test-prices"
echo "2. Setup Google Sheets: npm run setup-sheets" 
echo "3. Start with real prices: npm run start-trading"
echo ""
echo "📊 Features Now Available:"
echo "- ✅ Real-time crypto prices (Binance + CoinGecko)"
echo "- ✅ INR conversion (₹84.25 per USD)"
echo "- ✅ Google Sheets logging"
echo "- ✅ Auto-updates every 30 seconds"
echo "- ✅ Detailed analytics tracking"
echo ""
echo "🔧 Next Steps:"
echo "- Read GOOGLE_SHEETS_SETUP.md for Google integration"
echo "- Configure .env.local with your settings"
echo "- Run 'npm run start-trading' for live dashboard"
echo ""
echo "🎉 LAKSHYA Dashboard is ready for professional trading!"