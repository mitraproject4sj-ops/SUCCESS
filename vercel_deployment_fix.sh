# Fix for Vercel Deployment Error
# The issue is react-scripts is missing from dependencies

echo "🔧 Fixing Vercel Deployment Issue..."

# 1. Create the CORRECT package.json with react-scripts in dependencies
cat > package.json << 'EOF'
{
  "name": "trading-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "^5.0.1",
    "typescript": "^4.9.5",
    "@types/node": "^16.18.0",
    "@types/react": "^18.2.25",
    "@types/react-dom": "^18.2.11",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.263.1",
    "recharts": "^2.8.0",
    "axios": "^1.5.0",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "web-vitals": "^2.1.4"
  },
  "devDependencies": {
    "@types/jest": "^27.5.2"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# 2. Create CORRECT vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

# 3. Create package-lock.json to ensure consistent installs
echo "Creating package-lock.json..."

# 4. Ensure all source files are in correct locations
echo "Checking source file structure..."

echo ""
echo "✅ Fixed package.json and vercel.json"
echo ""
echo "🚀 Now run these commands to fix and redeploy:"
echo ""
echo "1. Delete node_modules and package-lock.json:"
echo "   rm -rf node_modules package-lock.json"
echo ""
echo "2. Install fresh dependencies:"
echo "   npm install"
echo ""
echo "3. Test build locally:"
echo "   npm run build"
echo ""
echo "4. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "If you still get errors, use these alternative commands:"
echo ""
echo "Alternative 1 - Force clean install:"
echo "   npm ci"
echo ""
echo "Alternative 2 - Use Vercel CLI with build override:"
echo "   vercel --prod --build-env NODE_ENV=production"
echo ""
echo "Alternative 3 - Manual deployment:"
echo "   npm run build"
echo "   vercel deploy build --prod"
echo ""
