# Render Deployment Guide for LAKSHYA Trading Dashboard

## Overview
This repository deploys a React frontend application with a minimal Express backend to serve the static files on Render.

## Deployment Architecture
- **Frontend**: React/TypeScript application (built with `npm run build`)
- **Backend**: Minimal Express server that serves the React build
- **Platform**: Render Web Service

## Deployment Configuration

### render.yaml Configuration
The `render.yaml` file is configured to:
1. Install frontend dependencies (`npm install`)
2. Build the React app (`npm run build`)
3. Install backend dependencies (`cd backend && npm install`)
4. Start the Express server (`cd backend && npm start`)

### Environment Variables
No environment variables are required for basic deployment. The service will run on Render's assigned PORT.

## Build Command
```bash
npm install && npm run build && cd backend && npm install
```

## Start Command
```bash
cd backend && npm start
```

## Health Check
The backend provides a health check endpoint at:
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T00:00:00.000Z",
  "service": "lakshya-trading-frontend",
  "version": "1.0.0"
}
```

## Local Testing

### 1. Build the Frontend
```bash
npm install
npm run build
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Start the Server
```bash
npm start
```

The server will start on port 3000 (or the PORT environment variable if set).

### 4. Test the Application
- Open browser to `http://localhost:3000`
- Check health endpoint: `http://localhost:3000/api/health`

## Troubleshooting

### Issue: Module 'express' not found
**Solution**: Ensure backend dependencies are installed:
```bash
cd backend && npm install
```

### Issue: Build directory not found
**Solution**: Ensure the frontend is built before starting the server:
```bash
npm run build
```

### Issue: TypeScript errors during build
**Note**: The build may show TypeScript warnings/errors but will still complete successfully. These are type-checking issues in unused files and don't prevent the application from running.

## File Structure
```
/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── package-lock.json  # Backend lockfile
├── src/                   # React source code
├── public/                # Static assets
├── build/                 # React production build (generated)
├── package.json           # Frontend dependencies
└── render.yaml            # Render deployment config
```

## Backend Server Features
- Serves static files from the `build/` directory
- Provides API endpoints:
  - `/api/health` - Health check
  - `/api/status` - Status information
- Catch-all route serves React app for client-side routing
- CORS enabled for development

## Notes
- This is a frontend-only deployment with a minimal backend for serving static files
- Backend-only features (Google Sheets integration, Telegram bot, etc.) are disabled
- For full functionality, deploy a separate backend service and configure the frontend to connect to it

## Deployment Steps on Render

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Click "Create Web Service"
6. Render will automatically deploy using the configuration in `render.yaml`

## After Deployment
- The application will be available at: `https://your-service-name.onrender.com`
- Health check: `https://your-service-name.onrender.com/api/health`
