# Run Locally & Share on Private Network

Run QuizLive on your own machine and let anyone on the same Wi-Fi join — no internet required.

---

## Prerequisites

- [Node.js 18+](https://nodejs.org) installed
- A Firebase project (free Spark plan is fine)
- Git

---

## Step 1 — Clone & install

```bash
git clone https://github.com/sivasooryagiri/quizlive.git
cd quizlive
npm install
```

---

## Step 2 — Create your Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (disable Google Analytics — not needed)
3. Go to **Project Settings → General → Your apps → Web** and register a web app
4. Copy the config values shown

---

## Step 3 — Enable Firebase Authentication

1. In Firebase console → **Authentication → Get started**
2. Click **Email/Password** → Enable → Save
3. Go to **Users → Add user**
4. Enter any email (e.g. `admin@quiz.local`) and a strong password
5. These go into your `.env` as `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD`

---

## Step 4 — Set up Firestore

1. In Firebase console → **Firestore Database → Create database**
2. Choose **Start in test mode** (you can tighten rules later)
3. Pick any region

---

## Step 5 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxx

VITE_JOIN_URL=http://localhost:5173
```

---

## Step 6 — Run the app

```bash
npm run dev
```

App is live at `http://localhost:5173`

- **Admin panel:** `http://localhost:5173/admin`
- **Host / projector screen:** `http://localhost:5173/host`
- **Player join page:** `http://localhost:5173`

---

## Share on your local network (private IP)

This lets people on the same Wi-Fi or LAN join from their phones — no internet needed.

**Step 1 — Find your local IP**

```bash
# Linux / Mac
ip addr show | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
# Look for "IPv4 Address" under your Wi-Fi adapter
```

Your IP looks like `192.168.x.x` or `10.x.x.x`.

**Step 2 — Start Vite on all interfaces**

```bash
npm run dev -- --host
```

Vite will print something like:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.42:5173/
```

**Step 3 — Update the join URL**

In your `.env`:

```env
VITE_JOIN_URL=http://192.168.1.42:5173
```

Restart the dev server. The QR code on the host screen now points to your local IP.

**Step 4 — Share with players**

Players on the same network scan the QR or open `http://192.168.1.42:5173` on their phones.

> Make sure your firewall allows port 5173. On Linux: `sudo ufw allow 5173`

---

## Firestore security rules

Deploy the rules from the repo to lock down the database:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```
