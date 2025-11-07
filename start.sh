#!/bin/bash

echo "========================================"
echo "  Sicily Live Map - Local Server"
echo "========================================"
echo ""
echo "Starting HTTP server on port 8080..."
echo "Opening browser automatically..."
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

sleep 2

# Try to open browser (works on macOS and Linux)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8080 &
elif command -v open > /dev/null; then
    open http://localhost:8080 &
fi

npx http-server . -p 8080

