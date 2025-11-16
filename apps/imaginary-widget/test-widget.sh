#!/bin/bash

echo "🔨 Building widget..."
npm install
npm run build

echo "📦 Installing test server dependencies..."

# Start file server for widget
python3 -m http.server 8080 &
FILE_SERVER_PID=$!

echo ""
echo "✅ Servers started!"
echo "🌐 Widget Test Page: http://localhost:8080/test.html"
echo ""
echo "Press Ctrl+C to stop the server."

# Wait for interrupt
trap "kill $FILE_SERVER_PID; exit" INT
wait