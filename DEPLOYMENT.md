# Deployment Guide

## Frontend Deployment (Netlify)

1. Connect to GitHub Repository:
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Select the GitHub repository
   - Choose the branch: `master`

2. Configure Build Settings:
   - Build command: `CI= npm run build`
   - Publish directory: `build`

3. Environment Variables:
   ```
   REACT_APP_BACKEND_URL=https://lakshya-trading-backend.onrender.com
   REACT_APP_WS_URL=wss://lakshya-trading-backend.onrender.com
   ```

4. Deploy Settings:
   - Enable automatic deployments
   - Configure custom domain (optional)
   - Enable HTTPS

## Backend Deployment (Render)

1. Connect to GitHub Repository:
   - Go to [Render](https://dashboard.render.com)
   - Click "New Web Service"
   - Select the backend repository

2. Configure Service:
   - Name: `lakshya-trading-backend`
   - Environment: `Node`
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   TELEGRAM_BOT_TOKEN=your_bot_token
   BINANCE_API_KEY=your_binance_key
   BINANCE_API_SECRET=your_binance_secret
   ```

4. Health Check Path:
   - Set to `/api/health`

5. Resource Settings:
   - Instance Type: Standard
   - Memory: 512 MB minimum
   - Region: Choose closest to users

## Important Notes

1. CORS Configuration:
   - Backend is configured to accept requests from Netlify domain
   - WebSocket connections are properly secured

2. Environment Variables:
   - Never commit sensitive keys
   - Use platform-specific env management

3. Monitoring:
   - Set up Netlify notifications
   - Configure Render alerts
   - Monitor WebSocket connections

4. SSL/HTTPS:
   - Enabled by default on both platforms
   - Required for secure WebSocket (wss://)