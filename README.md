# <img src="public/logo.svg" width="36" height="36" alt="QuizLive" style="vertical-align:middle"> QuizLive — Free Kahoot & Slido Alternative

**Free. Open source. Fully yours.**

QuizLive is a **free, open-source real-time multiplayer quiz app** — a self-hosted alternative to Kahoot, Slido, Mentimeter, and Poll Everywhere. No paywall. No account required to play. No vendor deciding what you can do with it. Run it on a laptop, share it over Wi-Fi, or deploy it to the cloud. Your call.

> Looking for a **free Kahoot alternative**? A **free Slido alternative**? A **self-hosted quiz platform** for classrooms, events, or team meetups? This is it.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-ff6f00?style=flat-square&logo=firebase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-Non--Commercial-red?style=flat-square)

---

## 🆚 Why QuizLive over Kahoot / Slido?

| | QuizLive | Kahoot | Slido |
|--|---------|--------|-------|
| Free to use | ✅ Always | ⚠️ Limited free tier | ⚠️ Limited free tier |
| Self-hostable | ✅ Yes | ❌ No | ❌ No |
| No player accounts | ✅ Yes | ✅ Yes | ✅ Yes |
| No vendor lock-in | ✅ Open source | ❌ Proprietary | ❌ Proprietary |
| Works on local network | ✅ Offline-capable | ❌ Requires internet | ❌ Requires internet |
| Unlimited questions | ✅ Yes | ⚠️ Paid plan | ⚠️ Paid plan |

---

## ✨ What it does

- 📱 Players join from their phones — scan a QR or visit a URL, no account needed
- 🖥️ Host screen runs on the projector — live answer chart, timer, leaderboard podium
- 🎛️ Admin panel controls everything — questions, game flow, QR toggle, session history
- ⚡ Scores are time-weighted — faster correct answers earn more
- 📋 Full session history saved automatically — download any past leaderboard as CSV
- 🌐 Works offline on a local network — no internet required

---

## 📸 Screenshots

_Coming soon._

---

## 🚀 Getting Started

Pick the setup that fits your situation:

| Method | Best for | Cost |
|--------|----------|------|
| [🏠 Local + Private Network](docs/deploy-local.md) | Classroom, office, events on same Wi-Fi | Free |
| [☁️ AWS EC2](docs/deploy-aws.md) | Public quiz, anyone can join from anywhere | Free tier |
| [🔥 Firebase + Vercel](docs/deploy-free.md) | Easiest cloud setup, 80–100 players | Free |
| [🐳 Docker](docs/deploy-docker.md) | Self-hosted, clean environment | Free |

---

### ⚡ Quickstart (localhost)

```bash
git clone https://github.com/sivasooryagiri/quiz-live.git
cd quiz-live
npm install
cp .env.example .env
# fill in your Firebase config
npm run dev
```

Open `http://localhost:5173`

> Full Firebase setup guide → [docs/deploy-local.md](docs/deploy-local.md)

---

### 🐳 Docker

```bash
git clone https://github.com/sivasooryagiri/quiz-live.git
cd quiz-live
cp .env.example .env
# fill in your Firebase config in .env

docker build -t quizlive .
docker run -p 3000:3000 --env-file .env quizlive
```

Open `http://localhost:3000`

---

## 🗺️ Pages

| Path | Access | Purpose |
|------|--------|---------|
| `/` | Open — no login needed | Join and answer on their phones |
| `/host` | Open — meant for the projector/big screen | Live question display, timer, leaderboard |
| `/admin` | Admin password required | Questions, game control, history, QR toggle |
| `/about` | Open — no login needed | About the project and builder |

---

## 👥 Capacity

| Plan | Concurrent players | Cost |
|------|--------------------|------|
| Firebase Spark (free) | 80–100 | $0 |
| Firebase Blaze (pay-as-you-go) | 500+ | ~$0.01 per session |

Firestore Spark allows 100 simultaneous connections. Reads/writes are well within daily free limits for typical quiz sessions.

---

## 🛠️ Tech stack

- **Frontend** — React 18, Vite, Tailwind CSS, Framer Motion
- **Database** — Firebase Firestore (real-time listeners)
- **Auth** — Password-protected admin (env var), no player accounts
- **Hosting** — Vercel (or self-hosted)
- **Charts** — Recharts (answer bar chart)
- **QR** — qrcode.react

---

## ⚖️ License & use

Open source. Free to use, modify, and self-host.

**Not for commercial or monetary use.** Do not sell access, charge players, bundle into a paid product, or use as a revenue-generating service. Built to make quizzes free and accessible — keep it that way.

Personal use, education, internal events, community quizzes — all fine.

---

## 🗓️ Roadmap

Things planned or worth building next:

**🎨 Presentation themes**
Multiple visual themes for the host/projector screen — dark, light, high-contrast, branded. Selectable per session from the admin panel.

**💬 Room mood / word cloud**
Players type any word during a session. Words appear as floating bubbles on the host screen — the more a word is typed, the bigger its bubble. A lightweight way to feel the room before or between questions.

**More ideas worth adding**
- [ ] 🖼️ Image questions — attach an image to a question
- [ ] 👥 Team mode — group players into teams, score aggregated
- [ ] 🔢 Custom scoring — let admin set points per question
- [ ] ⏱️ Timed lobby — auto-start after countdown
- [ ] 📥 Question import — paste a JSON or CSV to bulk-add questions
- [ ] 🔔 Webhook on session end — post results to Slack, Discord, or a URL

---

## 🔍 Use cases

- 🏫 **Teachers** — run classroom quizzes without a Kahoot subscription
- 🏢 **Teams** — replace Slido for internal events and town halls
- 🎉 **Events** — trivia nights, conferences, community meetups
- 🖥️ **Self-hosters** — full control, runs on your own hardware
- 🌐 **Offline use** — works on a local network with no internet

---

## 👤 About

Built by [SivaSoorya G.R](https://deadtechguy.fun) — ML/DL creator, co-founder of Soluto. Opened this up so anyone can run a quiz without a paywall or a vendor in the way.

→ [deadtechguy.fun](https://deadtechguy.fun) · [GitHub](https://github.com/sivasooryagiri) · 📧 [dtg@soluto.in](mailto:dtg@soluto.in)
