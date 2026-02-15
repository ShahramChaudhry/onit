#!/bin/bash

# Teams Task Manager - Quick Start Script
# NYUAD x AppliedAI Hackathon 2026

echo "🚀 Teams Task Manager - Starting..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env with your Opus credentials before continuing"
    echo ""
    echo "You need:"
    echo "  - OPUS_API_KEY (from Opus dashboard)"
    echo "  - OPUS_WORKFLOW_ID (from your published workflow)"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Dependencies ready!"
echo ""
echo "🎯 Starting servers..."
echo "   - Backend: http://localhost:3001"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start both servers
npm run dev
