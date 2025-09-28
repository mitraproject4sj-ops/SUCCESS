# Backend Deployment Configuration for Render

## Environment Variables Required:
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_IDS=your_chat_ids
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_secret
COINDCX_API_KEY=your_coindcx_key
COINDCX_API_SECRET=your_coindcx_secret
DELTA_API_KEY=your_delta_key
DELTA_API_SECRET=your_delta_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
GOOGLE_SHEET_ID=your_sheet_id
```

## Required Backend Files:
1. package.json - Dependencies and scripts
2. src/index.ts - Main server file
3. src/routes/ - API routes
4. src/utils/ - Trading utilities
5. src/config/ - Configuration files

## Backend API Endpoints:
- GET /health - Health check
- GET /api/market-data - Market data
- GET /api/signals - Trading signals
- POST /api/test-telegram - Test telegram
- POST /api/run-strategies - Execute strategies

## MongoDB Collections:
- trades
- market_data  
- signals
- performance
- logs

## Deployment Steps:
1. Push backend code to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy service