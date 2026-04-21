# Free Hosting — Firebase + Vercel (80–100 simultaneous players)

The easiest way to get QuizLive live on the internet for free.  
Firebase handles the real-time database, Vercel serves the frontend.

**Cost: $0.** Firebase Spark (free) plan + Vercel Hobby (free) plan covers everything for a typical quiz event.

**No git, no terminal, no server to manage.** Just Firebase + a button.

---

## Player limits on the free tier

| Limit | What it means |
|-------|--------------|
| **100 concurrent Firestore connections** | Players holding an active connection each use one. Safe up to **80–100 simultaneously active players**. |
| **50,000 reads / day** | A 100-player, 20-question session uses ~8–10k reads. You can run several sessions a day. |
| **20,000 writes / day** | Same session uses ~500–1,000 writes. Barely touched. |
| **1 GB storage** | Questions are tiny text documents. Effectively unlimited. |

> Need 150+ simultaneous players? Upgrade to **Blaze (pay-as-you-go)**. A large session costs fractions of a cent — see [FIREBASE-COSTS.md](../FIREBASE-COSTS.md).

---

## Step 1 — Set up Firebase

### 1a — Create a project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name → disable Google Analytics → **Create project**
3. Left sidebar → **Firestore Database → Create database**
4. Choose **Start in production mode** → Next
5. Pick a region close to your users → **Done**

### 1b — Get your config keys

1. In Firebase Console → click the **gear icon** (top left) → **Project settings**
2. Scroll down to **Your apps** → click the **Web** icon (`</>`)
3. Give the app any nickname → click **Register app**
4. You'll see a `firebaseConfig` block like this — **copy these values**, you'll need them soon:

```js
apiKey: "AIza..."
authDomain: "your-project.firebaseapp.com"
projectId: "your-project-id"
storageBucket: "your-project.appspot.com"
messagingSenderId: "123456789"
appId: "1:123456789:web:abc123"
```

### 1c — Create the admin user

1. Left sidebar → **Authentication → Get started**
2. Click **Email/Password** → toggle **Enable** → **Save**
3. Click the **Users** tab → **Add user**
4. Email: **`admin@quizlive.internal`** (must be exactly this)
5. Password: anything strong → **Add user**

> The email is hardcoded in the login screen. The password is never stored anywhere in the code — it lives only in Firebase's secure user store.

### 1d — Deploy Firestore security rules (REQUIRED)

This is what stops players from cheating or reading the answers. **Without it your database is wide open.**

1. Open [`firestore.rules`](../firestore.rules) from this repo → click **Raw** → select all → copy
2. In Firebase Console → **Firestore Database → Rules** tab
3. Delete everything in the editor → paste what you copied
4. Click **Publish**

Done. Rules are live in ~5 seconds.

---

## Step 2 — Deploy to Vercel

Click this button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sivasooryagiri/quizlive&env=VITE_FIREBASE_API_KEY,VITE_FIREBASE_AUTH_DOMAIN,VITE_FIREBASE_PROJECT_ID,VITE_FIREBASE_STORAGE_BUCKET,VITE_FIREBASE_MESSAGING_SENDER_ID,VITE_FIREBASE_APP_ID,VITE_JOIN_URL&envDescription=Firebase%20config%20from%20your%20Firebase%20project%20settings&envLink=https://github.com/sivasooryagiri/quizlive/blob/main/docs/deploy-free.md&project-name=quizlive&repository-name=quizlive)

Vercel will:
1. Copy the QuizLive repo into your own GitHub account
2. Ask you to fill in the environment variables (use the values from Step 1b)
3. Build and deploy automatically

Fill in the variables like this:

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | `apiKey` from Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` from Firebase config |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` from Firebase config |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` from Firebase config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` from Firebase config |
| `VITE_FIREBASE_APP_ID` | `appId` from Firebase config |
| `VITE_JOIN_URL` | leave blank for now |

Click **Deploy**. Vercel builds and gives you a URL like `https://quizlive-abc123.vercel.app`.

---

## Step 3 — Set the join URL

The QR code on the host screen needs to know your live URL.

1. Vercel dashboard → your project → **Settings → Environment Variables**
2. Edit `VITE_JOIN_URL` → set it to your Vercel URL: `https://quizlive-abc123.vercel.app`
3. Go to **Deployments** → click the three dots on the latest deployment → **Redeploy**

---

## Step 4 — Verify it works

Open these URLs and check each one works:

| URL | What you should see |
|-----|---------------------|
| `https://your-app.vercel.app` | Player join screen |
| `https://your-app.vercel.app/admin` | Password prompt → admin panel |
| `https://your-app.vercel.app/host` | Host / projector screen |

Log in to admin, add a few questions, open host on a big screen, and have players join from their phones.

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

Monitor usage: Firebase Console → **Usage** tab. Daily quotas reset at midnight Pacific time.
