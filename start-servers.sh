#!/bin/bash

# MERN Job Portal - Server Startup Script
# This script starts both backend and frontend servers in the background

echo "🚀 Starting MERN Job Portal Servers..."

# Kill any existing processes on ports 3000 and 5000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs -r kill -9
lsof -ti:5000 | xargs -r kill -9

# Wait a moment for cleanup
sleep 2

# Start Backend Server
echo "🔧 Starting Backend API Server (Port 5000)..."
cd /home/kiran/mern_jobportal/backend
nohup npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to initialize
sleep 5

# Start Frontend Server  
echo "🎨 Starting Frontend Server (Port 3000)..."
cd /home/kiran/mern_jobportal/frontend
nohup serve -s build -l 3000 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to initialize
sleep 3

# Check if servers are running
echo "📊 Checking Server Status..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend Server: RUNNING on http://localhost:5000"
else
    echo "❌ Backend Server: FAILED TO START"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Frontend Server: RUNNING on http://localhost:3000"
else
    echo "❌ Frontend Server: FAILED TO START"
fi

# Save PIDs for later management
echo $BACKEND_PID > /tmp/WorkBee_backend.pid
echo $FRONTEND_PID > /tmp/WorkBee_frontend.pid

echo "🎉 Server startup complete!"
echo "📱 Access your application at: http://localhost:3000"
echo "🔗 Backend API available at: http://localhost:5000"
echo ""
echo "📝 Logs available at:"
echo "   Backend:  /home/kiran/mern_WorkBee/logs/backend.log"
echo "   Frontend: /home/kiran/mern_WorkBee/logs/frontend.log"
echo ""
echo "🛑 To stop servers, run: ./stop-servers.sh"