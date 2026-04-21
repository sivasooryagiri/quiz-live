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
| No monthly subscription | ✅ Free up to ~100 players¹ | ❌ $17+/mo | ❌ $15+/mo |
| No player accounts | ✅ Yes | ✅ Yes | ✅ Yes |
| No vendor lock-in | ✅ Your data | ❌ Their servers | ❌ Their servers |
| Database cost at scale | ⚠️ Firebase pay-as-you-go² | Included | Included |
| Works on local network | ✅ Offline-capable | ❌ Requires internet | ❌ Requires internet |
| Unlimited questions | ✅ Yes | ⚠️ Paid plan | ⚠️ Paid plan |

<sub>¹ Firebase free tier (Spark) covers ~80–100 concurrent players at $0/month. Larger events need the pay-as-you-go plan — see [FIREBASE-COSTS.md](FIREBASE-COSTS.md).</sub>
<sub>² Firebase Firestore is billed per read/write at scale. QuizLive itself will always be free; the database cost is yours, going directly to your own Firebase project.</sub>

---

## ✨ What it does

- 📱 Players join from their phones — scan a QR or visit a URL, no account needed
- 🖥️ Host screen runs on the projector — live answer chart, timer, leaderboard podium
- 🎛️ Admin panel controls everything — questions, game flow, QR toggle, session history
- ⚡ Scores are time-weighted — faster correct answers earn more, computed from answers so they can't be tampered with ([how scoring & ranking work →](SCORING.md))
- 📋 Full session history saved automatically — download any past leaderboard as CSV
- 🌐 Works offline on a local network — no internet required

---

## 📸 Screenshots

<p align="center">
  <img src="docs/screenshots/overview.png" width="820" alt="Admin panel with questions list + host projector screen showing QR join code" />
  <br /><sub><em>Admin panel (left) + host projector screen with QR join code (right)</em></sub>
</p>

<p align="center">
  <img src="docs/screenshots/question.png" width="820" alt="Player question screen — four color-coded answer options with countdown timer" />
  <br /><sub><em>Player question screen — tap to answer, faster = more points</em></sub>
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

### ☁️ Recommended — Deploy to Vercel (no git needed)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sivasooryagiri/quizlive&env=VITE_FIREBASE_API_KEY,VITE_FIREBASE_AUTH_DOMAIN,VITE_FIREBASE_PROJECT_ID,VITE_FIREBASE_STORAGE_BUCKET,VITE_FIREBASE_MESSAGING_SENDER_ID,VITE_FIREBASE_APP_ID,VITE_JOIN_URL&envDescription=Firebase%20config%20from%20your%20Firebase%20project%20settings&envLink=https://github.com/sivasooryagiri/quizlive/blob/main/docs/deploy-free.md&project-name=quizlive&repository-name=quizlive)

Click the button → Vercel clones the repo to your GitHub and walks you through the env vars. **You only need to set up Firebase first** (5 minutes) — [full guide here](docs/deploy-free.md).

> 📖 **Docs:** [Scoring & Ranking](SCORING.md) · [Security & Threat Model](SECURITY.md) · [Firebase Costs](FIREBASE-COSTS.md)

---

### Other options

| Method | Best for | Where it runs |
|--------|----------|---------------|
| [🔥 **Firebase + Vercel** ⭐](docs/deploy-free.md) | Cloud, no server to manage | Vercel CDN (global) |
| [🏠 Local + Private Network](docs/deploy-local.md) | Classroom, office, same Wi-Fi | Your laptop |
| [☁️ AWS EC2](docs/deploy-aws.md) | Full control, your own server | AWS instance |
| [🐳 Docker](docs/deploy-docker.md) | Self-hosted, clean environment | Any container host |

> ⭐ **Firebase + Vercel is the only setup tested end-to-end.** Local / AWS / Docker should work (same code, different host) but aren't officially verified.

> **All options use Firebase Firestore** for the real-time database. Free tier covers ~80–100 concurrent players. For larger events → [FIREBASE-COSTS.md](FIREBASE-COSTS.md).

---

### ⚡ Quickstart (localhost, developers only)

```bash
git clone https://github.com/sivasooryagiri/quizlive.git
cd quizlive
npm install
cp .env.example .env
# fill in your Firebase config
npm run dev
```

Open `http://localhost:5173`

> ⚠️ **Two steps in Firebase Console required before login + security work:**
> 1. **Authentication** → add user with email **`admin@quizlive.internal`** + your chosen password
> 2. **Firestore → Rules** tab → paste contents of [`firestore.rules`](firestore.rules) → Publish
>
> Full guide → [docs/deploy-local.md](docs/deploy-local.md)

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
