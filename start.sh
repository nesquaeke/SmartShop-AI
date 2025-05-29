#!/bin/bash

# Kill any existing processes
pkill -f "ts-node-dev|live-server|python"

# Install dependencies if needed
npm install
cd src/backend && npm install
cd ../frontend && npm install
cd ../ai-engine && pip install -r requirements.txt
cd ../..

# Initialize Prisma
cd src/backend && npx prisma generate
cd ../..

# Start backend service
cd src/backend && npm run dev &
echo "🚀 Backend starting on http://localhost:3001"
sleep 5

# Start frontend service
cd ../frontend && npx live-server --port=3000 --host=localhost --open=index.html &
echo "🌐 Frontend starting on http://localhost:3000"
sleep 2

# Start AI service
cd ../ai-engine && python3 simple_ai.py &
echo "🤖 AI service starting"

# Keep script running
wait 