# LAKSHYA Backend Server

## Purpose
This is a minimal Express.js server designed to serve the LAKSHYA Trading Dashboard React application on Render.

## What It Does
1. Serves static files from the `../build` directory (React production build)
2. Provides health check and status API endpoints
3. Handles client-side routing by serving index.html for all non-API routes

## API Endpoints

### Health Check
```
GET /api/health
```
Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T00:00:00.000Z",
  "service": "lakshya-trading-frontend",
  "version": "1.0.0"
}
```

### Status
```
GET /api/status
```
Returns:
```json
{
  "status": "ok",
  "message": "Frontend server running",
  "timestamp": "2025-10-04T00:00:00.000Z"
}
```

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

Or with custom port:
```bash
PORT=3001 npm start
```

## Dependencies
- **express**: Web server framework
- **cors**: CORS middleware for API requests

## Environment Variables
- `PORT` (optional): Server port (default: 3000)
- `NODE_ENV` (optional): Environment mode (default: development)

## Notes
- This server does NOT provide backend API functionality
- For full backend features (trading APIs, database, etc.), deploy a separate backend service
- This is purely for serving the React frontend on Render
