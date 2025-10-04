#!/bin/bash
# Quick Deploy Test Script for LAKSHYA Trading Dashboard
# Run this to test the deployment locally before pushing to Render

set -e  # Exit on error

echo "🚀 LAKSHYA Deployment Test"
echo "=========================="
echo ""

# Step 1: Clean previous builds
echo "📦 Step 1: Cleaning previous builds..."
rm -rf build backend/node_modules
echo "✅ Clean complete"
echo ""

# Step 2: Install frontend dependencies
echo "📦 Step 2: Installing frontend dependencies..."
npm install
echo "✅ Frontend dependencies installed"
echo ""

# Step 3: Build React app
echo "🏗️  Step 3: Building React application..."
SKIP_PREFLIGHT_CHECK=true npm run build
echo "✅ React build complete"
echo ""

# Step 4: Install backend dependencies
echo "📦 Step 4: Installing backend dependencies..."
cd backend && npm install && cd ..
echo "✅ Backend dependencies installed"
echo ""

# Step 5: Test backend server
echo "🧪 Step 5: Testing backend server..."
PORT=3003 node backend/server.js &
SERVER_PID=$!
sleep 3

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3003/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "\"status\":\"ok\""; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test root endpoint
echo "Testing root endpoint..."
ROOT_RESPONSE=$(curl -s http://localhost:3003/ | head -1)
if echo "$ROOT_RESPONSE" | grep -q "<!doctype html>"; then
    echo "✅ Root endpoint serving HTML"
else
    echo "❌ Root endpoint failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Stop server
kill $SERVER_PID 2>/dev/null
echo "✅ Server stopped"
echo ""

echo "🎉 All tests passed!"
echo ""
echo "📊 Build Statistics:"
echo "   - Build size: $(du -sh build | cut -f1)"
echo "   - Build files: $(find build -type f | wc -l) files"
echo "   - Backend deps: $(cd backend && npm list --depth=0 | wc -l) packages"
echo ""
echo "🚀 Ready to deploy to Render!"
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'Ready for deployment'"
echo "3. git push origin main"
echo "4. Render will automatically deploy"
