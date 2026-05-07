#!/bin/bash

# Stop any running backend servers
echo "Stopping existing backend servers..."
pkill -f "node.*server.js" || true

# Wait a moment
sleep 2

# Start the backend
echo "Starting backend server..."
cd server
node server.js
