#!/bin/bash

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm -v)
echo "npm version: $NPM_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checks
echo "🔎 Running type checks..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false

# Build the application
echo "🏗️ Building application..."
npm run build

# Start the server
echo "🚀 Starting server..."
npm start