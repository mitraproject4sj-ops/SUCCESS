#!/bin/bash

# LAKSHYA Trading Dashboard - Deployment Script
echo "🚀 Starting LAKSHYA Trading Dashboard Deployment..."

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if build directory exists
if [ -d "build" ]; then
    echo "📁 Build directory found"
    echo "📊 Build statistics:"
    du -sh build/
    echo "📄 Files in build:"
    ls -la build/
else
    echo "❌ Build directory not found!"
    exit 1
fi

# Health check
echo "🔍 Running health checks..."
if [ -f "build/index.html" ]; then
    echo "✅ index.html found"
else
    echo "❌ index.html not found!"
    exit 1
fi

if [ -d "build/static" ]; then
    echo "✅ Static assets found"
    echo "📊 Static assets size:"
    du -sh build/static/*
else
    echo "❌ Static assets not found!"
    exit 1
fi

# Display deployment information
echo ""
echo "🎉 LAKSHYA Trading Dashboard is ready for deployment!"
echo ""
echo "📋 Deployment Summary:"
echo "===================="
echo "• Project Name: LAKSHYA Trading Dashboard"
echo "• Build Size: $(du -sh build/ | cut -f1)"
echo "• Strategies Implemented: 5 (Trend Rider, Momentum Burst, Volume Surge, Mean Reversal, Breakout Hunter)"
echo "• Features: AI Strategy Coordinator, Strategy Manager, Reporting Integration"
echo "• Dashboard: Comprehensive real-time trading dashboard"
echo "• Demo Mode: Fully functional without backend"
echo ""
echo "🌐 Deployment Options:"
echo "1. Netlify: Connect to GitHub and deploy from 'build' folder"
echo "2. Vercel: Import GitHub repository"
echo "3. GitHub Pages: Deploy from 'build' branch"
echo "4. Local Server: Serve from 'build' directory"
echo ""
echo "🔗 Local Preview:"
echo "To preview locally, run: npx serve build"
echo ""
echo "✨ Your advanced trading system with all 5 strategies is now ready!"

# Create deployment ready marker
echo "LAKSHYA_DEPLOYMENT_READY=true" > .deployment-status
echo "BUILD_DATE=$(date)" >> .deployment-status
echo "STRATEGIES=5" >> .deployment-status
echo "VERSION=1.0.0" >> .deployment-status