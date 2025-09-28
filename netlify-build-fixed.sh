#!/bin/bash
# Netlify Build Script - Fixed Version

echo "🚀 Starting Netlify Build Process..."

# Set environment variables
export CI=false
export NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type checking
echo "🔍 Type checking..."
npm run type-check

# Build the project
echo "🔨 Building project..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -d "build" ] && [ -f "build/index.html" ]; then
    echo "✅ Build successful! Files generated:"
    ls -la build/
else
    echo "❌ Build failed - no build directory found"
    exit 1
fi

echo "🎉 Build process completed successfully!"