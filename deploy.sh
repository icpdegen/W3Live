#!/bin/bash

# W3Live ICP Deployment Script
set -e

echo "🚀 Starting W3Live deployment to ICP..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx is not installed. Please install it first:"
    echo "   sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Check if we're authenticated
if ! dfx identity whoami &> /dev/null; then
    echo "❌ Not authenticated. Please run: dfx identity new <identity-name>"
    echo "   Then: dfx identity use <identity-name>"
    exit 1
fi

# Check if we have cycles
echo "💰 Checking cycles balance..."
dfx ledger balance

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build the project
echo "🔨 Building project..."
dfx build

# Deploy to ICP
echo "🌐 Deploying to ICP..."
dfx deploy --network ic

# Get canister IDs
echo "📋 Getting canister IDs..."
BACKEND_CANISTER_ID=$(dfx canister id w3live_backend --network ic)
FRONTEND_CANISTER_ID=$(dfx canister id w3live_frontend --network ic)

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your W3Live app is now live at:"
echo "   Frontend: https://$FRONTEND_CANISTER_ID.ic0.app"
echo "   Backend:  $BACKEND_CANISTER_ID"
echo ""
echo "📝 Update your frontend/.env.local with:"
echo "   VITE_CANISTER_ID_W3LIVE_BACKEND=$BACKEND_CANISTER_ID"
echo "   VITE_DFX_NETWORK=ic"
echo ""
echo "🎉 W3Live is now deployed on the Internet Computer!" 