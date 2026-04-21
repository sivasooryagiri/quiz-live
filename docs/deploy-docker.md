# Self-Host with Docker

Run QuizLive in a container — works on any machine or VPS with Docker installed.

**You need:** Docker, a Firebase project (free).

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

> The email must be exactly `admin@quizlive.internal`. Password is never stored in code or env vars.

### Deploy Firestore security rules (REQUIRED)

1. Open [`firestore.rules`](../firestore.rules) → copy all contents
2. Firebase Console → **Firestore Database → Rules** tab → delete everything → paste → **Publish**

---

## Step 2 — Clone & configure

```bash
git clone https://github.com/sivasooryagiri/quizlive.git
cd quizlive
cp .env.example .env
```

Open `.env` and fill in your values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxx
VITE_JOIN_URL=http://localhost:3000
```

> Running on a server? Set `VITE_JOIN_URL` to your server's public IP or domain, e.g. `https://quiz.yourdomain.com`.

---

## Step 3 — Build & run

```bash
docker build -t quizlive .
docker run -d --restart unless-stopped -p 3000:3000 --env-file .env --name quizlive quizlive
```

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Player join |
| `http://localhost:3000/admin` | Admin panel |
| `http://localhost:3000/host` | Host / projector |

---

## Useful commands

```bash
# View logs
docker logs -f quizlive

# Stop
docker stop quizlive

# Update to latest version
git pull
docker build -t quizlive .
docker stop quizlive && docker rm quizlive
docker run -d --restart unless-stopped -p 3000:3000 --env-file .env --name quizlive quizlive
```

---

## Notes

- Vite bakes `VITE_*` env vars into the build at compile time. If you change `.env`, rebuild the image.
- Firebase credentials are visible in the browser bundle — this is expected for all Firebase web apps. Your Firestore rules are what protect the data.
