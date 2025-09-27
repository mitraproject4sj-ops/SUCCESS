#!/bin/bash

# Clean previous build artifacts
rm -rf build
rm -rf node_modules
rm -f package-lock.json

# Install dependencies with legacy peer deps
npm install --legacy-peer-deps

# Build the project
npm run build

# Create optimized vercel.json
cat > vercel.json << EOL
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build",
        "installCommand": "npm install --legacy-peer-deps",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": { "cache-control": "public, max-age=31536000, immutable" },
      "dest": "/static/\$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/manifest.json",
      "dest": "/manifest.json"
    },
    {
      "src": "/(.*)",
      "headers": { "cache-control": "public, max-age=0, must-revalidate" },
      "dest": "/index.html"
    }
  ]
}
EOL