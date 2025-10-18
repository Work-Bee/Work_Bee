#!/bin/bash

# Build and Start MERN Job Portal on Alternative Ports
# Backend: 5555, Frontend: 3333

echo "🚀 Building and Starting MERN Job Portal (Alternative Ports)..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Clean up any existing processes on alternative ports
echo "🧹 Cleaning up existing processes on ports 5555 and 3333..."
lsof -ti:5555 | xargs kill -9 2>/dev/null || true
lsof -ti:3333 | xargs kill -9 2>/dev/null || true
sleep 1

# Create logs directory if it doesn't exist
mkdir -p logs

# Build frontend with alternative API URL
echo -e "${BLUE}📦 Building Frontend with API URL: http://localhost:5555/api${NC}"
cd frontend
REACT_APP_API_URL=http://localhost:5555/api npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..

# Create a separate build directory for alt version
echo "📁 Creating alternative build directory..."
rm -rf frontend/build-alt
cp -r frontend/build frontend/build-alt

# Start Backend on port 5001
echo -e "${BLUE}🔧 Starting Backend API Server (Port 5555)...${NC}"
cd backend
PORT=5555 nohup node server.js > ../logs/backend-alt.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait a bit for backend to start
sleep 2

# Start Frontend on port 3001
echo -e "${BLUE}🎨 Starting Frontend Server (Port 3333)...${NC}"
cd frontend
nohup serve -s build-alt -l 3333 > ../logs/frontend-alt.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

# Wait for servers to be ready
sleep 3

# Check if servers are running
echo ""
echo "📊 Checking Server Status..."

# Check backend
if curl -s http://localhost:5555 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend Server: RUNNING on http://localhost:5555${NC}"
else
    echo -e "${RED}❌ Backend Server: FAILED TO START${NC}"
fi

# Check frontend
if curl -s http://localhost:3333 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend Server: RUNNING on http://localhost:3333${NC}"
else
    echo -e "${RED}❌ Frontend Server: FAILED TO START${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Server startup complete!${NC}"
echo ""
echo -e "${YELLOW}📱 Access your application at: http://localhost:3333${NC}"
echo -e "${YELLOW}🔗 Backend API available at: http://localhost:5555${NC}"
echo ""
echo -e "${BLUE}📝 Logs available at:${NC}"
echo "   Backend:  $(pwd)/logs/backend-alt.log"
echo "   Frontend: $(pwd)/logs/frontend-alt.log"
echo ""
echo -e "${YELLOW}🛑 To stop servers, run: ./stop-servers-alt.sh${NC}"
echo ""
