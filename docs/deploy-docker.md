# 🐳 Self-Host with Docker

Run QuizLive in a clean, isolated container — works on any machine with Docker installed.  
Good for self-hosting on a VPS, a home server, or keeping things tidy on your own machine.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- A Firebase project (free Spark plan is fine) — [set one up here](https://console.firebase.google.com)

---

## Step 1 — Clone the repo

```bash
git clone https://github.com/sivasooryagiri/quizlive.git
cd quizlive
```

---

## Step 2 — Enable Firebase Authentication

1. In Firebase console → **Authentication → Get started**
2. Click **Email/Password** → Enable → Save
3. Go to **Users → Add user** → use email `admin@quizlive.internal` and a strong password of your choice
4. Remember that password — you will type it into the admin login screen (never stored in any file)

---

## Step 3 — Configure environment

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

VITE_JOIN_URL=http://localhost:3000
```

> If running on a server, set `VITE_JOIN_URL` to your server's public IP or domain, e.g. `http://192.168.1.42:3000` or `https://quiz.yourdomain.com`.

---

## Step 4 — Build the image

```bash
docker build -t quizlive .
```

This compiles the app into a production build inside the container.

---

## Step 5 — Run the container

```bash
docker run -p 3000:3000 --env-file .env quizlive
```

App is live at `http://localhost:3000`

- **Player join:** `http://localhost:3000`
- **Admin panel:** `http://localhost:3000/admin`
- **Host screen:** `http://localhost:3000/host`

---

## Keep it running in the background

```bash
docker run -d --restart unless-stopped -p 3000:3000 --env-file .env --name quizlive quizlive
```

- `-d` — runs detached (background)
- `--restart unless-stopped` — auto-restarts on reboot or crash

Check logs:

```bash
docker logs -f quizlive
```

Stop it:

```bash
docker stop quizlive
```

---

## Updating to a new version

```bash
git pull
docker build -t quizlive .
docker stop quizlive && docker rm quizlive
docker run -d --restart unless-stopped -p 3000:3000 --env-file .env --name quizlive quizlive
```

---

## Notes

- The container bakes your `.env` values into the build at compile time (Vite inlines `VITE_*` vars). If you change `.env`, rebuild the image.
- Firebase credentials in `VITE_*` variables are visible in the browser bundle — this is expected for Firebase web apps. Secure your Firestore rules to limit what unauthenticated clients can do.
