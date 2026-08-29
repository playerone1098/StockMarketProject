# Unified Google Authentication Setup Guide

This document provides a comprehensive overview of the **Google Sign-In Authentication System** for **JodhpurTraders**.

---

## 🌟 Key Features

1. **Google Sign-In Exclusive**:
   - Google Sign-In is now the sole authentication method for the platform.
   - Mobile OTP and Email/Password flows have been completely removed.

2. **Unified Login & Register Flow**:
   - Signing in and Registering are **identical** (one-click process).
   - If an account exists for the Google Account, the system logs the user in.
   - If no account exists, the system automatically creates a new user profile with default Watchlists and Portfolios in a single seamless step.

3. **Google Sign-In (OAuth 2.0)**:
   - Full Google Identity Services integration.
   - Automatic profile name & image retrieval.
   - Instant authentication.

---

## 📋 Steps to Configure Google OAuth

### Step 1: Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select **Web application**.
6. Set **Authorized JavaScript origins** to:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
7. Copy your generated **Client ID**.
8. Add the Client ID to both backend and frontend `.env` files:

   **In `backend/.env`**:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

   **In `frontend/.env`**:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

---

### Step 2: Running the Services

Run the all-in-one startup script or start backend and frontend individually:

```bash
# Start all services (MongoDB + Backend + Frontend)
./start-all.sh
```

Or manually:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

---

## 🧪 Testing Google Authentication

1. Open `http://localhost:3000/login` or `http://localhost:3000/register`.
2. Click **Continue with Google**.
3. You will be authenticated immediately and redirected to your Portfolio.
