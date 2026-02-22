#!/bin/bash

echo "Testing production build..."
echo ""

# Build frontend
echo "1. Building frontend..."
npm install
npm run build

# Check if dist folder was created
if [ -d "dist" ]; then
  echo "✓ dist folder created successfully"
  echo "  Files in dist:"
  ls -la dist | head -10
else
  echo "✗ dist folder not found!"
  exit 1
fi

# Install server dependencies
echo ""
echo "2. Installing server dependencies..."
cd server
npm install

# Start server (will exit after 5 seconds)
echo ""
echo "3. Starting server..."
echo "   Server will start and you can test at http://localhost:5000"
echo "   Press Ctrl+C to stop"
node server.js
