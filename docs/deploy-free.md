# Free Hosting — Firebase + Vercel (80–100 simultaneous players)

The easiest way to get QuizLive live on the internet for free.  
Firebase handles the real-time database, Vercel serves the frontend.

**Cost: $0.** Firebase Spark (free) plan + Vercel Hobby (free) plan covers everything for a typical quiz event.

---

## Player limits on the free tier

| Limit | What it means |
|-------|--------------|
| **100 concurrent Firestore connections** | The real ceiling — players holding an active connection (in lobby, answering, watching leaderboard) each use one. Safe up to **80–100 simultaneously active players**. |
| **50,000 reads / day** | A 100-player, 20-question session uses ~8–10k reads. You can run several sessions a day. |
| **20,000 writes / day** | Same session uses ~500–1,000 writes. Barely touched. |
| **1 GB storage** | Questions are tiny text documents. Effectively unlimited. |
| **Unlimited questions** | No cap on how many questions you store. |
| **Unlimited total players** | No cap on total registered players — only concurrent connections matter. |

> If you need 150+ simultaneously active players, upgrade to **Blaze (pay-as-you-go)**. Cost for a typical large session is fractions of a cent — you only pay for what you use, and there's a free quota built in.

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

**Enable Authentication:**
1. Left sidebar → **Authentication → Get started**
2. Click **Email/Password** → Enable → Save
3. Go to **Users → Add user** → use email `admin@quizlive.internal` and a strong password of your choice
4. Remember that password — you'll type it into the admin login screen (it is never stored in any file)

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
git remote add origin https://github.com/yourusername/quizlive.git
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
| `VITE_JOIN_URL` | leave blank for now (fill after first deploy) |

5. Click **Deploy**

Vercel will build and give you a URL like `https://quizlive-abc123.vercel.app`

---

## Step 5 — Set the join URL

1. In Vercel dashboard → your project → **Settings → Environment Variables**
2. Edit `VITE_JOIN_URL` → set it to your Vercel URL: `https://quizlive-abc123.vercel.app`
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

For a typical session (80 players, 15 questions):

- **Reads:** ~12k (well within 50k/day)
- **Writes:** ~800 (well within 20k/day)
- **Connections:** ~80 peak (within the 100 limit)

Monitor usage in Firebase console → **Usage** tab. The daily quotas reset at midnight Pacific time.
