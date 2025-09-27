#!/bin/bash
echo "🏗️ Building Trading Dashboard..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔨 Building project..."
npm run build

echo "✅ Build complete! Ready for deployment."
