# Free Hosting — Firebase + Vercel (up to ~50 concurrent users)

The easiest way to get QuizLive live on the internet for free.  
Firebase handles the real-time database, Vercel serves the frontend.

**Cost: $0.** Firebase Spark (free) plan + Vercel Hobby (free) plan is more than enough for a quiz with up to ~50 players.

---

## What you get

| Service | Free tier limits | More than enough? |
|---------|-----------------|-------------------|
| Firebase Firestore | 50k reads/day, 20k writes/day, 1 GB storage | Yes — a 50-player quiz uses ~5k reads |
| Vercel | Unlimited deployments, 100 GB bandwidth/month | Yes |

---

## Prerequisites

- A [Firebase account](https://console.firebase.google.com) (free)
- A [Vercel account](https://vercel.com) (free, sign in with GitHub)
- Your code pushed to a GitHub repo

---

## Step 1 — Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Create a project** → give it a name → disable Google Analytics → Create
3. Go to **Project Settings → General → Your apps** → click **Web** icon (`</>`)
4. Register the app (give it any nickname) → **Register app**
5. Copy the `firebaseConfig` values shown — you'll need these in Step 4

**Enable Firestore:**
1. Left sidebar → **Firestore Database → Create database**
2. Select **Start in test mode** → Next
3. Pick a region close to your users → Done

---

## Step 2 — Deploy Firestore security rules

In your project directory:

```bash
npm install -g firebase-tools
firebase login
firebase use --add    # select your project
firebase deploy --only firestore:rules
```

This deploys the `firestore.rules` file already in the repo.

---

## Step 3 — Push your code to GitHub

If not already:

```bash
git remote add origin https://github.com/yourusername/quiz-live.git
git push -u origin main
```

---

## Step 4 — Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. Click **Environment Variables** and add each one:

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | from Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | your project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase config |
| `VITE_FIREBASE_APP_ID` | from Firebase config |
| `VITE_ADMIN_PASSWORD` | choose a strong password |
| `VITE_JOIN_URL` | leave blank for now (fill after first deploy) |

5. Click **Deploy**

Vercel will build and give you a URL like `https://quiz-live-abc123.vercel.app`

---

## Step 5 — Set the join URL

1. In Vercel dashboard → your project → **Settings → Environment Variables**
2. Edit `VITE_JOIN_URL` → set it to your Vercel URL: `https://quiz-live-abc123.vercel.app`
3. Go to **Deployments → Redeploy** (top deployment → three dots → Redeploy)

The QR code on the host screen now points to your live URL.

---

## Step 6 — Verify it works

| URL | Purpose |
|-----|---------|
| `https://your-app.vercel.app` | Player join page |
| `https://your-app.vercel.app/admin` | Admin panel |
| `https://your-app.vercel.app/host` | Host / projector screen |

Open admin, add a few questions, open host on a big screen, and have players join from their phones.

---

## Custom domain (optional)

1. Vercel dashboard → your project → **Settings → Domains**
2. Add your domain → follow the DNS instructions shown
3. Update `VITE_JOIN_URL` to your custom domain and redeploy

---

## Staying within the free tier

For a typical quiz session (50 players, 10 questions):

- **Reads:** ~10k (well within 50k/day)
- **Writes:** ~500 (well within 20k/day)

If you're running multiple sessions a day with large groups, monitor usage in the Firebase console under **Usage** tab. The free tier resets daily.
