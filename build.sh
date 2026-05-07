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

# Copy static assets to server
echo "Step 3: Copying static assets to server..."
mkdir -p server/public
cp public/*.jpg server/public/ 2>/dev/null || true
cp public/*.png server/public/ 2>/dev/null || true
cp public/*.svg server/public/ 2>/dev/null || true
echo "✓ Static assets copied to server"

# Install server dependencies
echo "Step 4: Installing server dependencies..."
cd server
npm install

echo "=== Build Complete ==="
