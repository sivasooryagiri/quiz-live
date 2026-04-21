# Run Locally — Laptop / Private Network

Run QuizLive on your own machine. Players on the same Wi-Fi can join from their phones — no internet required.

**You need:** Node.js 18+, a Firebase project (free), basic comfort with a terminal.

---

## Step 1 — Firebase setup

### Create a project & get config keys

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Give it a name → disable Google Analytics → **Create project**
3. Left sidebar → **Firestore Database → Create database** → **Start in production mode** → pick a region → **Done**
4. Click the **gear icon** → **Project settings** → scroll to **Your apps** → click **`</>`** (Web)
5. Give the app any nickname → **Register app** → copy the `firebaseConfig` values shown

### Create the admin user

1. Left sidebar → **Authentication → Get started** → **Email/Password → Enable → Save**
2. **Users → Add user** → Email: **`admin@quizlive.internal`** → set a password → **Add user**

> The email must be exactly `admin@quizlive.internal` — it's hardcoded in the login screen. Password is never stored in code or env vars.

### Deploy Firestore security rules (REQUIRED)

Without this, the database is wide open.

1. Open [`firestore.rules`](../firestore.rules) → copy all contents
2. Firebase Console → **Firestore Database → Rules** tab → delete everything → paste → **Publish**

---

## Step 2 — Clone & configure

```bash
git clone https://github.com/sivasooryagiri/quizlive.git
cd quizlive
npm install
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

## Step 3 — Run

```bash
npm run dev
```

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Player join |
| `http://localhost:5173/admin` | Admin panel |
| `http://localhost:5173/host` | Host / projector |

---

## Share on your local network

Let players on the same Wi-Fi join from their phones — no internet needed.

**1. Start Vite on all interfaces:**

```bash
npm run dev -- --host
```

Vite will print your local IP:
```
  ➜  Network: http://192.168.1.42:5173/
```

**2. Update `.env`:**

```env
VITE_JOIN_URL=http://192.168.1.42:5173
```

Restart the dev server. The QR code on the host screen now points at your local IP — players scan it to join.

> If players can't connect, allow the port: `sudo ufw allow 5173` (Linux)
