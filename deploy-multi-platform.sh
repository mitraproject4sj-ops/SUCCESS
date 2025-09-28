#!/bin/bash

# 🚀 Multi-Platform Frontend Deployment Script
# Choose your deployment platform

echo "🚀 LAKSHYA Trading Dashboard - Multi-Platform Deployment"
echo "======================================================="

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."
    
    # Build the project
    export CI=false
    export NODE_OPTIONS="--max-old-space-size=4096"
    
    echo "🔧 Installing dependencies..."
    npm install
    
    echo "🏗️ Building project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        
        if [ $? -eq 0 ]; then
            echo "🎉 Deployment to Vercel successful!"
            echo "🌐 Your app should be live at: https://your-app.vercel.app"
        else
            echo "❌ Vercel deployment failed"
            exit 1
        fi
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    echo "📦 Deploying to GitHub Pages..."
    
    # Install gh-pages if not present
    npm install --save-dev gh-pages
    
    # Add homepage to package.json if not present
    echo "🔧 Configuring GitHub Pages..."
    
    # Build and deploy
    export CI=false
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        npx gh-pages -d build
        
        if [ $? -eq 0 ]; then
            echo "🎉 Deployment to GitHub Pages successful!"
            echo "🌐 Your app will be live at: https://mitraproject4sj-ops.github.io/SUCCESS"
        else
            echo "❌ GitHub Pages deployment failed"
            exit 1
        fi
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Function to deploy to Surge
deploy_surge() {
    echo "📦 Deploying to Surge.sh..."
    
    # Install surge if not present
    npm install -g surge
    
    export CI=false
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        cd build
        surge . --domain lakshya-trading.surge.sh
        
        if [ $? -eq 0 ]; then
            echo "🎉 Deployment to Surge successful!"
            echo "🌐 Your app is live at: https://lakshya-trading.surge.sh"
        else
            echo "❌ Surge deployment failed"
            exit 1
        fi
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Menu selection
echo "Select deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) GitHub Pages"
echo "3) Surge.sh"
echo "4) All platforms"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_github_pages
        ;;
    3)
        deploy_surge
        ;;
    4)
        echo "🚀 Deploying to all platforms..."
        deploy_vercel
        deploy_github_pages
        deploy_surge
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo "✅ Deployment process completed!"