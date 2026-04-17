<p align="center">
  <img src="public/logo.svg" width="80" alt="QuizLive logo" />
</p>

# QuizLive — Open Source Real-Time Quiz App (Kahoot / Slido / Mentimeter Alternative)

**Open source. Self-hosted. No subscriptions. No player accounts. Unlimited questions.**

QuizLive is a free, open-source, real-time multiplayer quiz and trivia platform built with React and Firebase. Run it on your laptop for a classroom, deploy it on a server for a public event, or self-host it however you want. You own the code, you own the data, you keep the players.

> Looking for an **open source Kahoot alternative**? A **free Slido alternative**? A **self-hosted Mentimeter** for classrooms, conferences, town halls, or trivia nights? A **live polling tool** without a paywall? This is it.

**Use it for:** classroom quizzes · school trivia · corporate town halls · conference Q&A · pub trivia · live polling · audience response · community quiz nights · onboarding games · workshop icebreakers.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-ff6f00?style=flat-square&logo=firebase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-Non--Commercial-red?style=flat-square)

---

## 🆚 Why QuizLive?

| | QuizLive | Kahoot | Slido |
|--|---------|--------|-------|
| Open source | ✅ Yes | ❌ No | ❌ No |
| Self-hostable | ✅ Yes | ❌ No | ❌ No |
| No monthly subscription | ✅ Yes | ❌ $17+/mo | ❌ $15+/mo |
| No player accounts | ✅ Yes | ✅ Yes | ✅ Yes |
| No vendor lock-in | ✅ Your data | ❌ Their servers | ❌ Their servers |
| Works on local network | ✅ Offline-capable | ❌ Requires internet | ❌ Requires internet |
| Unlimited questions | ✅ Yes | ⚠️ Paid plan | ⚠️ Paid plan |

---

## ✨ What it does

- 📱 Players join from their phones — scan a QR or visit a URL, no account needed
- 🖥️ Host screen runs on the projector — live answer chart, timer, leaderboard podium
- 🎛️ Admin panel controls everything — questions, game flow, QR toggle, session history
- ⚡ Scores are time-weighted — faster correct answers earn more ([how scoring & ranking work →](SCORING.md))
- 📋 Full session history saved automatically — download any past leaderboard as CSV
- 🌐 Works offline on a local network — no internet required

---

## 📸 Screenshots

<p align="center">
  <img src="docs/screenshots/overview.png" width="820" alt="Admin panel with questions list + host projector screen showing QR join code" />
  <br /><sub><em>Admin panel (left) + host projector screen with QR join code (right)</em></sub>
</p>

<p align="center">
  <img src="docs/screenshots/gameplay.png" width="820" alt="Players on phones seeing result, admin controls, and host screen showing live answer bar chart" />
  <br /><sub><em>Live gameplay — player phones, admin controls, host answer chart</em></sub>
</p>

<p align="center">
  <img src="docs/screenshots/leaderboard.png" width="820" alt="Leaderboard phase — player rank cards and host podium with medals" />
  <br /><sub><em>Leaderboard phase — player rank cards + host podium</em></sub>
</p>

<p align="center">
  <img src="docs/screenshots/history.png" width="560" alt="Session history tab showing past quiz results with medals and CSV export" />
  <br /><sub><em>Session history — past results with CSV export</em></sub>
</p>

---

## 🚀 Getting Started

Pick the setup that fits your situation:

| Method | Best for | Where it runs |
|--------|----------|---------------|
| [🔥 **Firebase + Vercel** ⭐ *Recommended*](docs/deploy-free.md) | **Easiest cloud setup, no server to manage** | **Vercel CDN (global, fast)** |
| [🏠 Local + Private Network](docs/deploy-local.md) | Classroom, office, events on same Wi-Fi | Your laptop |
| [☁️ AWS EC2](docs/deploy-aws.md) | Public quiz, full control, your own server | AWS instance |
| [🐳 Docker](docs/deploy-docker.md) | Self-hosted, clean environment | Any container host |

> ⭐ **Recommended:** **Firebase + Vercel CDN** — zero servers to babysit, global CDN, free up to ~80–100 concurrent players. **This is the only setup we've tested end-to-end.** The Local / AWS / Docker paths should work (same code, just different host) but we haven't run them ourselves — your mileage may vary.

> **All four use Firebase Firestore as the real-time database** — that part is the same everywhere. Firebase's free tier comfortably covers normal use (~80–100 concurrent players). For larger events or detailed pricing → [FIREBASE-COSTS.md](FIREBASE-COSTS.md).

---

### ⚡ Quickstart (localhost)

```bash
git clone https://github.com/sivasooryagiri/quizlive.git
cd quizlive
npm install
cp .env.example .env
# fill in your Firebase config
npm run dev
```

Open `http://localhost:5173`

> ⚠️ **Two manual steps in Firebase Console you must do, or login + security won't work:**
> 1. **Auth** → add user with email **`admin@quizlive.internal`** (this email is hardcoded — see [LoginScreen.jsx:16](src/components/admin/LoginScreen.jsx)) + your chosen password
> 2. **Firestore → Rules** tab → paste the contents of [`firestore.rules`](firestore.rules) → Publish
>
> Full Firebase setup guide → [docs/deploy-local.md](docs/deploy-local.md)

---

### 🐳 Docker

```bash
git clone https://github.com/sivasooryagiri/quizlive.git
cd quizlive
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

**QuizLive itself is $0 — always.** No license, no subscription, no per-player fee. Code is yours, free forever.

The only moving part with a meter on it is **Firebase Firestore** (the real-time database). Google runs Firebase, not QuizLive — so any database cost goes directly to your own Firebase project, not to us.

- ✅ **Firebase free tier (Spark)** handles **~80–100 concurrent players** at $0/month — fits classrooms, small offices, community quizzes, most events.
- 📈 If you outgrow that (hundreds of players, dozens of sessions/day), you'd switch your Firebase project to the pay-as-you-go plan.

> Heavy usage? Hosting hundreds of players or running this for a big organization? **Read [FIREBASE-COSTS.md](FIREBASE-COSTS.md)** for the full breakdown — free-tier sessions per day by player count × question count, paid pricing bands, and how to set a budget cap so you never get a surprise bill.

---

## 🛠️ Tech stack

- **Frontend** — React 18, Vite, Tailwind CSS, Framer Motion
- **Database** — Firebase Firestore (real-time listeners)
- **Auth** — Firebase Authentication (admin), no player accounts
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

- 🏫 **Teachers** — run classroom quizzes, no Kahoot subscription needed
- 🏢 **Teams** — replace Slido for internal events and town halls
- 🎉 **Events** — trivia nights, conferences, community meetups
- 🖥️ **Self-hosters** — full control, runs on your own hardware
- 🌐 **Offline use** — works on a local network with no internet

---

## 👤 About

Built by [SivaSoorya G.R](https://deadtechguy.fun) — ML/DL creator, co-founder of Soluto. Opened this up so anyone can run a quiz without a paywall or a vendor in the way.

→ [deadtechguy.fun](https://deadtechguy.fun) · [GitHub](https://github.com/sivasooryagiri) · 📧 [dtg@soluto.in](mailto:dtg@soluto.in)

---

## 🤖 Build credits

This release was built with [Claude Code](https://claude.com/claude-code) using **Claude Sonnet 4.6** and **Claude Opus 4.7**.

---

<sub>**Topics:** quiz · trivia · kahoot-alternative · slido-alternative · mentimeter-alternative · open-source-quiz · self-hosted · real-time · multiplayer · classroom · live-polling · audience-response · firebase · react · vite · tailwindcss · free-quiz-app · no-subscription</sub>
