#!/bin/bash

echo "Starting all applications..."

run_database() {
  echo "[DATABASE] Starting database..."
  cd packages/docker-dev
  docker compose up -d
  cd - > /dev/null
}

run_widget() {
  echo "[WIDGET] Starting widget test server..."
  cd apps/imaginary-widget
  if [ ! -d "node_modules" ]; then
      echo "[WIDGET] Installing widget dependencies..."
      npm install
      npm run build
  fi
  python3 -m http.server 9090 2>&1 | while IFS= read -r line; do
      echo "[WIDGET] $line"
  done
}


run_landing() {
  echo "[LANDING] Starting landing..."
  cd apps/landing-site
  if [ ! -d "node_modules" ]; then
      echo "[LANDING] Installing landing dependencies..."
      npm install
  fi
  NO_CLEAR=1 npm run dev 2>&1 | while IFS= read -r line; do
      echo "[LANDING] $line"
  done
}

run_backend() {
  echo "[NEST_BACKEND] Starting nest-backend..."
  cd apps/nest-backend
  if [ ! -d "node_modules" ]; then
      echo "[NEST-BACKEND] Installing nest-backend dependencies..."
      npm install
  fi
  NO_CLEAR=1 npm run start:debug 2>&1 | while IFS= read -r line; do
      echo "[NEST-BACKEND] $line"
  done
}

run_proxy() {
  echo "[PROXY] Starting proxy..."
  cd apps/proxy
  if [ ! -d "node_modules" ]; then
      echo "[PROXY] Installing proxy dependencies..."
      npm install
  fi
  NO_CLEAR=1 npm run dev 2>&1 | while IFS= read -r line; do
      echo "[PROXY] $line"
  done
}

run_frontend() {
  echo "[FRONTEND] Starting frontend..."
  cd apps/frontend
  if [ ! -d "node_modules" ]; then
      echo "[FRONTEND] Installing frontend dependencies..."
      bun install
  fi
  NO_CLEAR=1 bun run dev 2>&1 | while IFS= read -r line; do
      echo "[FRONTEND] $line"
  done
}

cleanup() {
  echo ""
  echo "Stopping applications..."
  jobs -p | xargs -r kill 2>/dev/null
  cd packages/docker-dev && docker compose down
  exit
}

trap cleanup SIGINT SIGTERM EXIT

echo "Press Ctrl+C to stop everything"
echo "----------------------------------------"

# run_database

run_proxy &
PROXY_PID=$!

run_backend &
NEST_BACKEND_PID=$!

run_landing &
LANDING_PID=$!

run_widget &
WIDGET_PID=$!

run_frontend &
FRONTEND_PID=$!

echo "Backend PID: $NEST_BACKEND_PID"
echo "Proxy PID: $PROXY_PID"
echo "Landing PID: $LANDING_PID"
echo "Widget PID: $WIDGET_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "----------------------------------------"

wait $PROXY_PID $NEST_BACKEND_PID $LANDING_PID $WIDGET_PID $FRONTEND_PID