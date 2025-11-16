#!/bin/bash

echo "🔨 Building widget..."
npm run build

echo "📦 Installing test server dependencies..."
npm install express cors multer

echo "🚀 Starting mock server on http://localhost:3001..."
echo "📝 Open http://localhost:8080 in your browser to test the widget"
echo ""
echo "Starting servers..."

# Start mock server in background
node mock-server.js &
SERVER_PID=$!

# Start file server for widget
python3 -m http.server 8080 &
FILE_SERVER_PID=$!

echo ""
echo "✅ Servers started!"
echo "🌐 Mock API Server: http://localhost:3001"
echo "🌐 Widget Test Page: http://localhost:8080/test.html"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "kill $SERVER_PID $FILE_SERVER_PID; exit" INT
wait