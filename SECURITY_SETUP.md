# Security Setup Guide

## ⚠️ API Key Security Issue Fixed

This document explains how to properly configure your API keys after the security fix.

## What Was Fixed

- **Removed hardcoded Google Perspective API key** from source code
- **Added proper environment variable handling**
- **Created `.gitignore`** to prevent future exposure of sensitive files

## How to Set Up API Keys Properly

### 1. Get a New Google Perspective API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Perspective API
4. Create a new API key (DO NOT reuse the exposed key)
5. Restrict the API key to only the Perspective API for security

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
cd frontend
cp env.example .env.local
```

Edit `.env.local` and add your new API key:

```
# W3Live Frontend Environment Variables
VITE_CANISTER_ID_W3LIVE_BACKEND=your_backend_canister_id_here
VITE_DFX_NETWORK=local
VITE_PERSPECTIVE_API_KEY=your_new_api_key_here
```

### 3. Verify the Setup

The application will now:
1. First try to load the API key from `VITE_PERSPECTIVE_API_KEY` environment variable
2. Fall back to loading from `env.json` file (if it exists)
3. Gracefully handle missing API keys by disabling moderation

### 4. Important Security Notes

- ✅ **Never commit** `.env*` files to version control
- ✅ **Always use environment variables** for API keys
- ✅ **Restrict API keys** to only necessary services
- ✅ **Rotate API keys** regularly
- ✅ **Monitor API usage** for unexpected activity

### 5. What Happens Without an API Key

If no valid API key is provided:
- The application will log a warning
- Comment moderation will be disabled
- Comments will be allowed without filtering
- The app will continue to function normally

## Files Modified

- `frontend/src/utils/perspectiveApi.ts` - Removed hardcoded API key
- `.gitignore` - Added to prevent future exposure
- `SECURITY_SETUP.md` - This guide

## Next Steps

1. **Immediately revoke the old API key** (`AIzaSyAnJ55WLjMfyOCU_7pcNCjdMemauS7Ls_M`)
2. Create a new API key following the steps above
3. Configure your `.env.local` file
4. Test the application to ensure moderation works