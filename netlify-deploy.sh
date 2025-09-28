#!/bin/bash
# Netlify Manual Deployment Script
# Save as: netlify-deploy.sh

echo "🚀 Starting Netlify Manual Deployment..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Netlify (draft first)
echo "🔄 Deploying to Netlify (preview)..."
netlify deploy --dir=build --message="Manual deployment - $(date)"

# Ask for production deployment
echo ""
echo "📋 Preview deployment completed!"
echo "🔗 Check the preview URL above"
echo ""
read -p "Deploy to production? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to production..."
    netlify deploy --prod --dir=build --message="Production deployment - $(date)"
    echo "✅ Production deployment completed!"
else
    echo "ℹ️ Staying in preview mode"
fi

echo "🎉 Deployment process finished!"