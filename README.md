# W3Live - Web3 Livestreaming Platform

A decentralized livestreaming platform built on the Internet Computer Protocol (ICP), enabling sovereign, unstoppable live streaming experiences.

## 🌟 Features

- **Decentralized Authentication**: Multi-user system with admin/user roles
- **File Storage**: Secure, on-chain file storage and streaming
- **Real-time Comments**: Community interaction with content moderation
- **Cross-chain Integration**: Chain Fusion technology for multi-blockchain support
- **Sovereign Infrastructure**: Runs entirely on ICP without traditional cloud dependencies

## 🏗️ Architecture

- **Backend**: Motoko canister with multi-user auth, file storage, and HTTP serving
- **Frontend**: React + TypeScript application with ICP agent integration
- **Storage**: On-chain file storage with HTTP streaming capabilities
- **Authentication**: Internet Identity integration for secure, passwordless auth

## 🚀 Quick Start

### Prerequisites

1. **Install DFX (Internet Computer SDK)**:
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Install Node.js** (v18+):
   ```bash
   # Using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

### Local Development

1. **Clone and setup**:
   ```bash
   git clone <your-repo>
   cd w3live
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

2. **Start local ICP replica**:
   ```bash
   dfx start --background --clean
   ```

3. **Deploy canisters locally**:
   ```bash
   dfx deploy
   ```

4. **Set up environment variables**:
   ```bash
   cd frontend
   cp env.example .env.local
   
   # Update .env.local with your local canister IDs
   echo "VITE_CANISTER_ID_W3LIVE_BACKEND=$(dfx canister id w3live_backend)" >> .env.local
   echo "VITE_DFX_NETWORK=local" >> .env.local
   ```

5. **Start frontend development server**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see your app running locally.

### Testing

1. **Backend Tests**:
   ```bash
   # Run Motoko tests
   dfx canister call w3live_backend test_suite
   ```

2. **Frontend Tests**:
   ```bash
   cd frontend
   npm test
   ```

3. **E2E Tests**:
   ```bash
   npm run test:e2e
   ```

## 🌐 Production Deployment

### Prerequisites for ICP Mainnet

1. **Create ICP Identity**:
   ```bash
   dfx identity new production
   dfx identity use production
   ```

2. **Get Cycles** (ICP's compute currency):
   - Buy ICP tokens on an exchange
   - Convert to cycles using NNS dapp or dfx

3. **Deploy to IC**:
   ```bash
   ./deploy.sh
   ```

### Environment Setup for Production

1. **Update frontend environment**:
   ```bash
   cd frontend
   cp .env.local .env.production
   
   # Update with mainnet values
   VITE_CANISTER_ID_W3LIVE_BACKEND=<your-backend-canister-id>
   VITE_DFX_NETWORK=ic
   VITE_PERSPECTIVE_API_KEY=<your-api-key>
   ```

2. **Verify deployment**:
   ```bash
   # Check canister status
   dfx canister status w3live_backend --network ic
   dfx canister status w3live_frontend --network ic
   ```

## 🔧 Development Commands

```bash
# Start local replica
dfx start --background

# Deploy locally
dfx deploy

# Build frontend
cd frontend && npm run build

# Restart local deployment
dfx deploy --mode reinstall

# Check canister logs
dfx canister logs w3live_backend

# Stop local replica
dfx stop
```

## 📋 Project Structure

```
w3live/
├── backend/
│   ├── main.mo              # Main canister logic
│   ├── auth-multi-user/     # Authentication system
│   ├── file-storage/        # File storage and HTTP serving
│   └── http-outcalls/       # External API integration
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── backend.ts      # ICP backend integration
│   └── package.json
├── dfx.json                # DFX configuration
├── canister_ids.json       # Canister ID registry
└── deploy.sh              # Production deployment script
```

## 🛡️ Security Considerations

- All data operations require proper authentication
- File uploads are validated and sandboxed
- Comments go through moderation pipeline
- Canister upgrade procedures preserve state
- Multi-signature governance for production updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- [Internet Computer Developer Docs](https://internetcomputer.org/docs)
- [ICP Developer Forum](https://forum.dfinity.org/)
- [W3Live Community Discord](#) <!-- Add your Discord link -->

## 🗺️ Roadmap

- [ ] Enhanced live streaming protocols
- [ ] NFT integration for content monetization
- [ ] DAO governance for platform decisions
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
