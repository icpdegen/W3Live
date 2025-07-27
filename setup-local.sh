#!/bin/bash

# W3Live Local Development Setup Script
set -e

echo "🏗️  Setting up W3Live for local development..."

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    info "Installing dfx (Internet Computer SDK)..."
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    
    # Verify installation
    if ! command -v dfx &> /dev/null; then
        error "Failed to install dfx. Please install manually."
        exit 1
    fi
    success "dfx installed successfully!"
else
    success "dfx is already installed"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 18+ and try again."
    echo "You can install it from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

success "Node.js $(node --version) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install npm and try again."
    exit 1
fi

success "npm $(npm --version) is installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend

if [[ ! -f "package.json" ]]; then
    error "package.json not found in frontend directory!"
    exit 1
fi

npm install
success "Frontend dependencies installed!"

cd ..

# Create .env.local if it doesn't exist
if [[ ! -f "frontend/.env.local" ]]; then
    info "Creating frontend/.env.local from template..."
    cp frontend/env.example frontend/.env.local
    success "Environment file created!"
else
    warning "frontend/.env.local already exists"
fi

# Stop any existing dfx process
echo "🛑 Stopping any existing dfx processes..."
dfx stop 2>/dev/null || true

# Start local Internet Computer replica
echo "🚀 Starting local Internet Computer replica..."
dfx start --background --clean

# Wait for replica to be ready
echo "⏳ Waiting for replica to be ready..."
sleep 5

# Deploy canisters locally
echo "🏗️  Deploying canisters locally..."
dfx deploy

# Get local canister IDs
BACKEND_CANISTER_ID=$(dfx canister id w3live_backend)
FRONTEND_CANISTER_ID=$(dfx canister id w3live_frontend)

# Update .env.local with canister IDs
echo "📝 Updating environment variables..."
cat > frontend/.env.local << EOF
# W3Live Frontend Environment Variables
# Backend canister ID (automatically generated)
VITE_CANISTER_ID_W3LIVE_BACKEND=$BACKEND_CANISTER_ID

# Network configuration
VITE_DFX_NETWORK=local

# Perspective API key for comment moderation (add your key here)
VITE_PERSPECTIVE_API_KEY=your_perspective_api_key_here
EOF

success "Environment variables updated!"

# Run backend tests
echo "🧪 Running backend tests..."
if dfx canister call w3live_backend runTests; then
    success "Backend tests completed!"
else
    warning "Backend tests had issues, but continuing..."
fi

# Test backend health
echo "🏥 Testing backend health..."
dfx canister call w3live_backend health

echo ""
success "🎉 Local development environment is ready!"
echo ""
echo "📋 Setup Summary:"
echo "   Backend Canister ID: $BACKEND_CANISTER_ID"
echo "   Frontend Canister ID: $FRONTEND_CANISTER_ID"
echo "   Local Replica: http://127.0.0.1:8000"
echo ""
echo "🚀 To start frontend development:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🌐 Your app will be available at:"
echo "   Frontend Dev Server: http://localhost:3000"
echo "   Deployed Frontend: http://$FRONTEND_CANISTER_ID.localhost:8000"
echo ""
echo "🔧 Useful development commands:"
echo "   dfx canister status --all"
echo "   dfx canister logs w3live_backend"
echo "   dfx deploy --mode reinstall"
echo "   dfx stop (when you're done)"
echo ""
info "Start coding! 🚀"

# Optionally start the frontend dev server
read -p "Would you like to start the frontend development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd frontend
    echo "🌐 Starting frontend development server..."
    npm run dev
fi