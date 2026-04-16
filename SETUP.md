# QuizLive — Setup Guide

## Prerequisites
- Node.js 18+ / npm 9+
- Firebase account (free Spark plan works)
- Vercel account (for deployment)

---

## 1. Firebase Project Setup

### Create project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. `quiz-live-app`)
3. Disable Google Analytics (optional) → **Create project**

### Enable Firestore
1. In Firebase console → **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add rules later)
4. Select your region → **Done**

### Get Firebase config
1. Click the gear icon → **Project settings**
2. Scroll to **Your apps** → Click **</>** (Web)
3. Register app name → **Register app**
4. Copy the `firebaseConfig` object values

---

## 2. Local Setup

```bash
cd quizlive
cp .env.example .env
# Edit .env and paste your Firebase values
npm install
npm run dev
```

Open:
- `http://localhost:5173` — Player view
- `http://localhost:5173/host` — Host/projector screen
- `http://localhost:5173/admin` — Admin panel (default password: `admin123`)

---

## 3. Firestore Security Rules (Production)

In Firebase console → **Firestore → Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /meta/{doc}        { allow read: if true; allow write: if true; }
    match /questions/{id}    { allow read: if true; allow write: if true; }
    match /players/{id}      { allow read, write: if true; }
    match /answers/{id}      { allow read, write: if true; }
    match /sessions/{id}     { allow read, write: if true; }
  }
}
```

> For a fully locked-down production setup, restrict writes to
> authenticated admin users via Firebase Auth email/password.

---

## 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# (or paste the .env values when prompted)
```

In the Vercel dashboard → **Settings → Environment Variables**, add all
`VITE_FIREBASE_*` variables and `VITE_ADMIN_PASSWORD`.

Then update `VITE_JOIN_URL` to your Vercel deployment URL and redeploy:
```bash
vercel --prod
```

---

## 5. Event Day Checklist

1. Open `/admin` on your laptop → add all questions
2. Confirm `VITE_JOIN_URL` in your `.env` matches your Vercel URL
3. Open `/host` on the projector (full-screen the browser tab)
4. Players scan the QR code on screen or visit the URL
5. In admin → **Game Control** → click **Start Quiz**
6. Flow per question:
   - Timer auto-advances Question → Results
   - Click **Show Leaderboard** (or wait ~3s for auto)
   - Click **Next Question**
7. After last question → quiz ends automatically

---

## 6. Folder Structure

```
quiz-app/
├── src/
│   ├── firebase/
│   │   ├── config.js        Firebase init
│   │   └── db.js            All Firestore operations
│   ├── hooks/
│   │   ├── useGameState.js  Real-time game state listener
│   │   └── usePlayer.js     Player session management
│   ├── pages/
│   │   ├── PlayerPage.jsx   / (mobile players)
│   │   ├── HostPage.jsx     /host (projector)
│   │   └── AdminPage.jsx    /admin (control panel)
│   └── components/
│       ├── player/          Mobile player components
│       ├── host/            Projector screen components
│       ├── admin/           Admin panel components
│       └── shared/          Timer, Particles, Spinner
├── .env.example
├── firestore.rules
└── SETUP.md (this file)
```

---

## 7. Scoring Formula

```
score = correct ? max(100, 1000 - floor(timeTaken) * 50) : 0
```

- Answer in 0s → 1000 pts
- Answer in 10s → 500 pts
- Answer in 18s+ → 100 pts (minimum for correct)
- Wrong answer → 0 pts

---

## 8. Customization

| What | Where |
|------|-------|
| Color theme | `tailwind.config.js` → `brand` colors |
| Default timer | Question editor in admin |
| Background gradient | Each page's `bg-gradient-to-br` class |
| Game title | Admin → Host/QR tab |
| Admin password | `.env` → `VITE_ADMIN_PASSWORD` |
