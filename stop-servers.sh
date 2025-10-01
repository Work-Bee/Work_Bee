#!/bin/bash

# MERN Job Portal - Server Stop Script
# This script stops both backend and frontend servers

echo "🛑 Stopping MERN Job Portal Servers..."

# Kill processes by PID if PID files exist
if [ -f /tmp/WorkBee_backend.pid ]; then
    BACKEND_PID=$(cat /tmp/WorkBee_backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend server stopped (PID: $BACKEND_PID)"
    fi
    rm -f /tmp/WorkBee_backend.pid
fi

if [ -f /tmp/WorkBee_frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/WorkBee_frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend server stopped (PID: $FRONTEND_PID)"
    fi
    rm -f /tmp/WorkBee_frontend.pid
fi

# Kill any remaining processes on ports 3000 and 5000
echo "🧹 Cleaning up any remaining processes..."
lsof -ti:3000 | xargs -r kill -9
lsof -ti:5000 | xargs -r kill -9

echo "🎉 All servers stopped successfully!"