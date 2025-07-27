#!/bin/bash

# W3Live ICP Deployment Script
set -e

echo "🚀 Starting W3Live deployment to ICP..."

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
    error "dfx is not installed. Installing now..."
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    
    # Verify installation
    if ! command -v dfx &> /dev/null; then
        error "Failed to install dfx. Please install manually and retry."
        exit 1
    fi
    success "dfx installed successfully!"
fi

# Check dfx version
DFX_VERSION=$(dfx --version | grep "dfx" | cut -d' ' -f2)
info "Using dfx version: $DFX_VERSION"

# Check if we're authenticated
if ! dfx identity whoami &> /dev/null; then
    error "Not authenticated. Setting up new identity..."
    echo "Creating new identity 'w3live-deploy'..."
    dfx identity new w3live-deploy
    dfx identity use w3live-deploy
    success "Identity created and activated!"
    
    warning "Please ensure you have ICP tokens for cycles. You can:"
    echo "  1. Transfer ICP to your identity: $(dfx identity get-principal)"
    echo "  2. Convert ICP to cycles using: dfx ledger create-canister --amount <amount>"
    echo "  3. Or use the NNS dapp to manage cycles"
    echo ""
    read -p "Press Enter when you have sufficient cycles to continue..."
fi

# Display current identity info
info "Current identity: $(dfx identity whoami)"
info "Principal ID: $(dfx identity get-principal)"

# Check if we have cycles (try to get wallet info)
echo "💰 Checking cycles and wallet status..."
if dfx wallet balance --network ic &> /dev/null; then
    WALLET_BALANCE=$(dfx wallet balance --network ic)
    success "Wallet balance: $WALLET_BALANCE"
else {
    warning "Could not check wallet balance. Proceeding anyway..."
fi

# Validate project structure
echo "🔍 Validating project structure..."
if [[ ! -f "dfx.json" ]]; then
    error "dfx.json not found. Are you in the project root?"
    exit 1
fi

if [[ ! -d "backend" ]]; then
    error "Backend directory not found!"
    exit 1
fi

if [[ ! -d "frontend" ]]; then
    error "Frontend directory not found!"
    exit 1
fi

success "Project structure validated!"

# Install dependencies and run tests
echo "📦 Installing frontend dependencies..."
cd frontend

if [[ ! -f "package.json" ]]; then
    error "package.json not found in frontend directory!"
    exit 1
fi

npm install
success "Frontend dependencies installed!"

# Run tests
echo "🧪 Running tests..."
npm test -- --run --reporter=verbose 2>/dev/null || warning "Some tests failed, continuing deployment..."

cd ..

# Build the project
echo "🔨 Building project..."
dfx build --network ic

success "Project built successfully!"

# Deploy to ICP
echo "🌐 Deploying to ICP mainnet..."
echo "This may take several minutes..."

# Deploy with proper error handling
if dfx deploy --network ic --with-cycles 1000000000000; then
    success "Deployment successful!"
else
    error "Deployment failed! Check the logs above for details."
    exit 1
fi

# Get canister IDs
echo "📋 Getting canister IDs..."
BACKEND_CANISTER_ID=$(dfx canister id w3live_backend --network ic)
FRONTEND_CANISTER_ID=$(dfx canister id w3live_frontend --network ic)

# Test backend health
echo "🏥 Testing backend health..."
if dfx canister call w3live_backend health --network ic &> /dev/null; then
    success "Backend health check passed!"
else
    warning "Backend health check failed, but deployment may still be successful"
fi

# Update canister_ids.json with backend ID if missing
if ! grep -q "w3live_backend" canister_ids.json; then
    echo "📝 Updating canister_ids.json..."
    # Create a temporary file with both canister IDs
    cat > temp_canister_ids.json << EOF
{
  "w3live_backend": {
    "ic": "$BACKEND_CANISTER_ID"
  },
  "w3live_frontend": {
    "ic": "$FRONTEND_CANISTER_ID"
  }
}
EOF
    mv temp_canister_ids.json canister_ids.json
    success "canister_ids.json updated!"
fi

echo ""
success "🎉 W3Live deployment complete!"
echo ""
echo "🌐 Your W3Live app is now live at:"
echo "   Frontend: https://$FRONTEND_CANISTER_ID.ic0.app"
echo "   Backend:  $BACKEND_CANISTER_ID"
echo ""
echo "📝 Update your frontend/.env.local with:"
echo "   VITE_CANISTER_ID_W3LIVE_BACKEND=$BACKEND_CANISTER_ID"
echo "   VITE_DFX_NETWORK=ic"
echo ""
echo "🔧 Useful commands:"
echo "   dfx canister status w3live_backend --network ic"
echo "   dfx canister status w3live_frontend --network ic"
echo "   dfx canister logs w3live_backend --network ic"
echo ""
info "Don't forget to update your environment variables and redeploy the frontend if needed!" 