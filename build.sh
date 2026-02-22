#!/bin/bash
set -e

echo "=== Starting Build Process ==="

# Build frontend
echo "Step 1: Installing frontend dependencies..."
npm install

echo "Step 2: Building frontend..."
npm run build

# Verify dist folder was created
if [ ! -d "dist" ]; then
  echo "ERROR: dist folder was not created!"
  exit 1
fi

echo "✓ Frontend built successfully"
echo "  dist folder contents:"
ls -la dist

# Install server dependencies
echo "Step 3: Installing server dependencies..."
cd server
npm install

echo "=== Build Complete ==="
