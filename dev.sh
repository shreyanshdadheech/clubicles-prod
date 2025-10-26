#!/bin/bash

# Quick development start script
echo "🚀 Starting Clubicles development server..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "Please run ./setup.sh first to configure your environment"
    exit 1
fi

# Start the development server
echo "🌐 Starting Next.js development server..."
npm run dev
