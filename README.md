# W3Live - Decentralized Live Streaming Platform

A decentralized live streaming platform built on the Internet Computer (IC) blockchain, enabling creators to stream content with Web3 features like direct monetization, NFT integration, and decentralized storage.

## 🚀 Features

- **Live Streaming**: High-quality video streaming with low latency
- **Web3 Integration**: Internet Identity authentication and blockchain features
- **Decentralized Storage**: Content stored on IC with redundancy
- **Creator Tools**: Dashboard for managing streams and content
- **Monetization**: Direct payment channels and NFT marketplace integration
- **Cross-Platform**: Works on web browsers with WebRTC support

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Motoko (Internet Computer canister)
- **Authentication**: Internet Identity
- **Storage**: Internet Computer asset canister
- **Deployment**: dfx (Internet Computer SDK)

## 📋 Prerequisites

- [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd W3Live
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Local Development

```bash
# Start local Internet Computer replica
dfx start --background --clean

# Deploy canisters locally
dfx deploy

# Start frontend development server
cd frontend
npm run dev
```

Visit `http://localhost:3001` to access the application.

### 4. Deploy to Testnet

```bash
# Deploy to Internet Computer testnet
./deploy-testnet.sh
```

## 📁 Project Structure

```
W3Live/
├── backend/                 # Motoko backend canister
│   ├── main.mo             # Main canister logic
│   └── auth-multi-user/    # Authentication module
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── backend.ts      # Backend interface
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── dfx.json               # dfx configuration
├── deploy-testnet.sh      # Testnet deployment script
└── README.md
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

- `DFX_NETWORK`: Network to deploy to (`local`, `ic_testnet`, `ic`)
- `CANISTER_ID_W3LIVE_BACKEND`: Backend canister ID (auto-generated)

### Networks

- **Local**: `http://127.0.0.1:8000` (for development)
- **Testnet**: `https://ic0.testnet.dfinity.network`
- **Mainnet**: `https://ic0.app`

## 🚀 Deployment

### Local Development

```bash
dfx start --background --clean
dfx deploy
cd frontend && npm run dev
```

### Testnet Deployment

```bash
./deploy-testnet.sh
```

### Mainnet Deployment

```bash
export DFX_NETWORK=ic
dfx deploy --network ic
```

## 🔐 Authentication

The application uses Internet Identity for authentication. Users can:

1. Click "Login" to authenticate with Internet Identity
2. Create a new identity or use an existing one
3. Access the dashboard with their authenticated identity

## 📊 Backend API

The Motoko backend provides the following endpoints:

- `initializeAuth()`: Initialize authentication
- `getUserProfile()`: Get current user profile
- `saveUserProfile(profile)`: Save user profile
- `createData(content, metadata)`: Create new data entry
- `upload(path, mimeType, data, overwrite)`: Upload file
- `list()`: List uploaded files
- `delete(path)`: Delete file
- `health()`: Health check

## 🧪 Testing

```bash
# Run backend tests
dfx canister call w3live_backend runTests

# Test specific functions
dfx canister call w3live_backend health
dfx canister call w3live_backend getCurrentUserRole
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Internet Computer Docs](https://internetcomputer.org/docs/)
- **Community**: [Internet Computer Forum](https://forum.dfinity.org/)
- **Issues**: Create an issue in this repository

## 🎯 Roadmap

- [ ] Enhanced streaming quality
- [ ] NFT marketplace integration
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Social features (comments, likes, shares)

---

Built with ❤️ on the Internet Computer
