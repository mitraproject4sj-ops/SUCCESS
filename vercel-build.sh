#!/bin/bash

# Clean up
rm -rf node_modules
rm -rf build
rm -f package-lock.json

# Install dependencies with force and legacy peer deps
npm install --legacy-peer-deps --force

# Ensure react-scripts is installed globally
npm install -g react-scripts

# Build with CI=false to prevent treating warnings as errors
CI=false npm run build