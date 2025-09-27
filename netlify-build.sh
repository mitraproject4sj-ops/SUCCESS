#!/bin/bash

# Clean install dependencies
npm ci

# Build with optimizations
GENERATE_SOURCEMAP=false npm run build

# Optimize build folder
npm prune --production