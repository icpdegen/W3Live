#!/bin/bash

echo "🚀 Deploying W3Live to Testnet"

# Set environment for testnet deployment
export DFX_NETWORK=ic_testnet

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx is not installed. Please install dfx first."
    exit 1
fi

echo "✅ dfx is installed"

# Check if we have a wallet configured
if ! dfx identity whoami &> /dev/null; then
    echo "❌ No identity configured. Please run 'dfx identity new <name>' first."
    exit 1
fi

echo "✅ Identity configured: $(dfx identity whoami)"

# Check wallet balance
echo "💰 Checking wallet balance..."
dfx ledger --network ic_testnet balance

# Build and deploy
echo "📦 Building and deploying canisters..."
dfx deploy --network ic_testnet

# Get canister IDs
echo "📋 Canister IDs:"
dfx canister --network ic_testnet id w3live_backend
dfx canister --network ic_testnet id w3live_frontend

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is available at:"
echo "   Frontend: https://$(dfx canister --network ic_testnet id w3live_frontend).ic0.app"
echo "   Backend:  https://$(dfx canister --network ic_testnet id w3live_backend).ic0.app" 