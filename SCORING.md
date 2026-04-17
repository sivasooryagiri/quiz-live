# Scoring & Ranking

This doc explains exactly how QuizLive awards points per question and how final rankings are computed. No secret sauce — what's here is what runs.

---

## Per-question score

```
score = 0                                           if answer is wrong
score = max(5, round(30 - (timeTaken / timer) * 25))  if answer is correct
```

Where:
- `timeTaken` — seconds between question-start and the player tapping an option, measured from Firebase's server timestamp.
- `timer` — the per-question timer set by the admin (default 15s, configurable).

### What the formula gives you

| When you answer | Correct answer earns |
|---|---|
| Instantly (t = 0s) | **30 pts** (the max) |
| At half the timer (t = timer/2) | **~18 pts** |
| Right at the buzzer (t = timer) | **5 pts** (the floor) |
| After the timer / no answer | **0 pts** |
| Wrong answer | **0 pts** |

The score decays linearly with time — fast answers are worth more, but even a last-second correct answer is worth 5 points so players aren't punished for thinking.

### Why 30 and 5

- **30 max** keeps the numbers readable on a projector and matches the order of magnitude Kahoot/Slido use.
- **5 floor** on correct answers rewards effort — a correct slow answer still beats a wrong fast one.
- **Linear decay**, not exponential, because it's easier to explain to a room of players than "answer twice as fast = 4× points."

### Where the calculation runs

Score is computed on the player's device the moment they tap, then written to Firestore. Firestore **security rules re-validate every write server-side** — the rule recomputes `maxScoreFor(timeTaken, timer)` using the same formula and rejects the write if the submitted score exceeds the cap, if `isCorrect` doesn't match the actual answer key, or if the write is submitted outside the question phase.

Mirror formulas:
- Client: [`calcScore()` in `src/firebase/db.js`](src/firebase/db.js)
- Server (Firestore rule): [`maxScoreFor()` in `firestore.rules`](firestore.rules)

The two are kept byte-for-byte parity so a legit client write always passes.

---

## Total score

A player's displayed total is the sum of their per-question scores across the current session. It's stored in `/players/{playerId}.score` and updated atomically in the same transaction that writes the answer doc — no scoreboard drift vs. answer history.

Firestore rules cap each `/players` update at **±30 per write** (the single-question max), so even a malicious client can't jump from 0 to 5000 in one shot. See [SECURITY.md](SECURITY.md) for the full threat model.

---

## Ranking

### The rule — "tie-aware standard competition ranking"

```
rank(player) = (number of players with score strictly greater) + 1
```

So two players with the same score share a rank, and the next rank *skips* the duplicate slot.

Example — scores 27, 18, 0, 0, 0:

| Player | Score | Rank |
|---|---|---|
| Ad | 27 | **1** |
| Eu | 18 | **2** |
| FU | 0 | **3** |
| F7 | 0 | **3** *(tied)* |
| TYU | 0 | **3** *(tied)* |

There is no rank 4 or 5 in this example — all three zero-scorers share rank 3. If one of them scored 1, they'd be rank 3 alone and the other two zero-scorers would be rank 4.

This is known as **standard competition ranking** ("1-2-2-4" style) — the same rule used by FIFA, golf, and most scoreboards. We picked it because it feels fair ("same score = same rank") without surprising anyone used to sports scoreboards.

### Where it runs

- Player leaderboard (phone): [`src/components/player/PlayerLeaderboard.jsx`](src/components/player/PlayerLeaderboard.jsx)
- Host / projector leaderboard: [`src/components/host/LeaderboardPhase.jsx`](src/components/host/LeaderboardPhase.jsx)
- Helper: [`getPlayerRank()` in `src/firebase/db.js`](src/firebase/db.js)

All three use the same formula. The rank number a player sees on their phone is the same number the projector shows next to their name.

### Podium slots (host screen) when there are ties

The host-screen podium has three physical slots (2nd–1st–3rd left-to-right) so it always shows *some* ordering for the top 3, even when they tie.

If players are tied, the circle above each slot shows the **real tie-aware rank** (e.g. `#1`, `#1`, `#3` for a 2-way tie at the top), not the slot's default position. The medal emoji (🥇/🥈/🥉) shown on the pedestal also comes from the actual rank — so two gold medals can appear if two players tied for first.

In other words: the slot you stand on is arbitrary (someone has to be on the left), but the number above your head is real.

---

## Why there's no tie-breaker

When two players end the session with the same total, we don't pick a winner. Options we considered and rejected:

- **Fastest answer across the session** — penalizes careful players; adds a hidden second scoring dimension.
- **Most correct answers** — already captured by score; adds no info.
- **First to join** — random; frustrates players who joined late for unrelated reasons.
- **Coin flip** — unfair and unexplainable.

Instead: tied players share a rank, and if the quiz is for prizes, the host decides the tie-break offline (rock-paper-scissors, sudden-death question, etc.). QuizLive is designed for low-stakes fun; a rare tie is a feature of the honest ranking, not a bug.

---

## FAQ

**Q: My answer was correct but I got 5 points. Why?**
A: You answered near the end of the timer. The score decays linearly from 30 (instant) to 5 (buzzer).

**Q: I was rank #3 on my phone but the projector showed someone else in the bronze pedestal slot. Why?**
A: There were ties. All players tied for rank 3 see `#3` on their phone. The projector's three physical pedestal slots are assigned by the underlying list order (Firebase returns ties in document-insertion order), but the *number* above each slot — and the medal on it — reflects the real tie-aware rank.

**Q: Can someone cheat their score?**
A: See [SECURITY.md](SECURITY.md) for the threat model and what's enforced server-side. Short version: rules check every score write, the per-write delta is capped at 30, and the correct-answer key is hidden from the client until the question phase ends. A motivated cheater can still probe for the correct answer with multiple writes (at the cost of a lower score) — closing that fully requires Cloud Functions.
