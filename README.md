# QuizLive

A free, open-source, real-time multiplayer quiz app — think Kahoot or Slido, but fully in your control.

Run it on your laptop for a room full of people, share it on your office network, or deploy it to the cloud. No subscriptions. No paywalls. No limits you didn't set yourself.

Built by [deadtechguy.fun](https://deadtechguy.fun)

---

## What it does

- Players join from their phones by scanning a QR code or visiting a URL
- Host screen shows questions and a live answer bar chart on the projector
- Admin panel lets you add questions, control the game flow, and reset between sessions
- Real-time scoring — faster correct answers score more points
- Leaderboard with podium after each question and at the end

---

## Screenshots

_Screenshots coming soon._

---

## Tech stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion
- **Database:** Firebase Firestore (real-time)
- **Hosting:** Vercel (or self-hosted — your choice)

---

## How to run it

Pick the setup that fits your situation:

### [Local machine + private network](docs/deploy-local.md)
Run on your laptop and share with everyone on the same Wi-Fi. Best for classrooms, offices, or events where you control the network. No internet required.

### [AWS EC2 — public internet](docs/deploy-aws.md)
Host on a public IP using AWS free tier. Anyone with the link can join from anywhere. Good for remote events or public quizzes.

### [Firebase + Vercel — free cloud hosting](docs/deploy-free.md)
The easiest path to a live public URL at $0 cost. Handles up to ~50 concurrent players on the free tier with zero configuration overhead.

---

## Quick start (localhost)

```bash
git clone https://github.com/sivasooryagiri/quiz-live.git
cd quiz-live
npm install
cp .env.example .env
# fill in your Firebase config in .env
npm run dev
```

Open `http://localhost:5173`

See [docs/deploy-local.md](docs/deploy-local.md) for the full setup including Firebase project creation.

---

## Pages

| Path | Who uses it |
|------|-------------|
| `/` | Players — join and answer on their phones |
| `/host` | Host — projector/big screen display |
| `/admin` | Admin — add questions, control game, reset |

---

## About

Built for fun when a friend couldn't find a quiz app that was actually free and usable.

The whole point is that you decide how to run it — local, private network, or public cloud. Simple UI, quick to set up, works for any audience.

Builder: [deadtechguy.fun](https://deadtechguy.fun)
