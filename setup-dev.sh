#!/bin/bash

echo "🚀 Setting up W3Live Development Environment"

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx is not installed. Please install dfx first."
    exit 1
fi

echo "✅ dfx is installed"

# Stop any running dfx processes
echo "🛑 Stopping any running dfx processes..."
dfx stop 2>/dev/null || true

# Start dfx with clean state
echo "🔄 Starting dfx with clean state..."
dfx start --background --clean

# Wait for dfx to be ready
echo "⏳ Waiting for dfx to be ready..."
sleep 5

# Deploy canisters
echo "📦 Deploying canisters..."
dfx deploy

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

cd ..

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Your app is available at:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://127.0.0.1:8000/?canisterId=be2us-64aaa-aaaaa-qaabq-cai&id=bkyz2-fmaaa-aaaaa-qaaaq-cai"
echo ""
echo "💡 For development, run: cd frontend && npm run dev"
echo "💡 For production testing, use: dfx deploy --network ic_testnet" 