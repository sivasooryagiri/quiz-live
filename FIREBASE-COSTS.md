# Firebase costs — free vs. paid

QuizLive itself is free and open source. The only running cost is **Firebase Firestore**, the real-time database that powers live sync between the host, admin, and players. You own the Firebase project and the billing — there is no middleman.

---

## The free plan (Spark)

Firebase Spark is **$0 forever** with these daily quotas:

| Quota | Free allowance | Notes |
|-------|----------------|-------|
| Document reads | **50,000 / day** | Resets midnight Pacific Time |
| Document writes | **20,000 / day** | Resets midnight Pacific Time |
| Document deletes | **20,000 / day** | Resets midnight Pacific Time |
| Storage | **1 GiB total** | Not daily — cumulative |
| Network egress | **10 GiB / month** | Monthly |

**What happens when you hit the limit?** Firestore stops accepting reads/writes until the next reset (midnight Pacific). Players would see the quiz freeze. Upgrade to Blaze before this matters for your event.

---

## How many sessions fit in a free day?

Each row = number of players in one session. Each column = how many questions that session has. Values = approximate sessions you can run **per day** on the free plan.

| Players ↓ / Questions → | 15 Q | 30 Q | 60 Q | 100 Q |
|-------------------------|------|------|------|-------|
| **10 players**          | ~50  | ~25  | ~12  | ~7    |
| **25 players**          | ~20  | ~10  | ~5   | ~3    |
| **50 players**          | ~10  | ~5   | ~2–3 | ~1–2  |
| **100 players**         | ~5   | ~2   | ~1   | < 1   |

> Estimates are conservative — they assume every player stays active the full session with all real-time listeners engaged. Short quizzes with fewer players stretch much further than these numbers suggest.

**Rule of thumb:** if you're running a classroom quiz (20–30 students, 10–20 questions) a few times a week, you will not come close to the free limit. The limit starts to matter at 50+ players running multiple sessions per day.

---

## When free is enough

- ✅ A teacher running 2–3 classroom quizzes per day (≤ 40 students, 10–30 questions)
- ✅ A small office doing weekly trivia (≤ 50 people, 20 questions)
- ✅ A community quiz night, 1–2 events per day (≤ 80 players)
- ✅ Demos, workshops, onboarding, icebreakers

---

## When you should upgrade to Blaze

- ❌ Conference or town hall with 200+ concurrent attendees
- ❌ School-wide event with 500+ students
- ❌ Running 10+ sessions per day across a whole organization
- ❌ Any event where "quiz freezes mid-round" is not an acceptable outcome

Blaze is **pay-as-you-go**. You still get the same 50K reads / 20K writes / day for free — you only pay for what goes over.

---

## Blaze pricing (pay-as-you-go)

| Usage pattern | Approx monthly cost |
|---------------|---------------------|
| 100 players × 3 sessions/day × 30 Q | **~$1–2 / month** |
| 500 players × 3 sessions/day × 30 Q | **~$5–7 / month** |
| 1,000 players × 5 sessions/day × 30 Q | **~$15–20 / month** |
| 5,000 players × 2 sessions/day × 30 Q | **~$40–60 / month** |

The public Firestore price list: **$0.06 per 100K reads**, **$0.18 per 100K writes**, **$0.18 per 100K deletes**, **$0.18 / GiB storage/month** (as of 2026 — check [firebase.google.com/pricing](https://firebase.google.com/pricing) for current rates).

---

## How to upgrade

1. Firebase Console → your project → **Upgrade** → Blaze
2. Add a credit card and a monthly **budget alert** (e.g. $10) so you get an email if anything spikes
3. That's it — no code changes, same deployment

You can downgrade back to Spark any time from the billing page.

---

## How to check your actual usage

Firebase Console → **Firestore Database** → **Usage** tab. Shows daily reads, writes, deletes, and storage. If you're approaching the free limit, that's where you'll see it first.

---

## TL;DR

- Classroom or small-office use → **free, forever**
- Event with hundreds of players → upgrade to Blaze, set a **$10 budget alert**, expect **$5–20/month**
- You own the Firebase project — no lock-in, no middleman, no QuizLive-side pricing
