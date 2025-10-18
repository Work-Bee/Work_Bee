#!/bin/bash

# Stop MERN Job Portal Servers on Alternative Ports

echo "🛑 Stopping MERN Job Portal Servers (Alternative Ports)..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to stop process on a port
stop_port() {
    local port=$1
    local name=$2
    
    if lsof -ti:$port > /dev/null 2>&1; then
        lsof -ti:$port | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ $name server stopped (Port: $port)${NC}"
    else
        echo "ℹ️  No $name server running on port $port"
    fi
}

# Stop backend on port 5555
stop_port 5555 "Backend"

# Stop frontend on port 3333
stop_port 3333 "Frontend"

# Clean up any remaining node/serve processes
echo ""
echo "🧹 Cleaning up any remaining processes..."
pkill -f "node.*5555" 2>/dev/null || true
pkill -f "serve.*3333" 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 All servers stopped successfully!${NC}"
echo ""
