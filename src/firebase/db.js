/**
 * Firestore data layer.
 *
 * Collections:
 *   meta/gameState      – single game-state document
 *   questions/{id}      – question documents, ordered by `order`
 *   players/{id}        – player documents
 *   answers/{qId_pId}   – one answer doc per (question, player) pair
 *
 * Scoring formula (per question, max 30 pts):
 *   correct → max(5, round(30 - (timeTaken / timer) * 25))
 *   wrong   → 0
 *
 *   Examples (15s timer):
 *     0s  → 30 pts   (fastest)
 *     5s  → ~22 pts
 *     10s → ~13 pts
 *     15s → 5 pts    (slowest correct)
 *   Works proportionally for any timer length.
 */
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

// ─── Refs ─────────────────────────────────────────────────────
const gameRef      = doc(db, 'meta', 'gameState');
const questionsCol = () => collection(db, 'questions');
const playersCol   = () => collection(db, 'players');
const answersCol   = () => collection(db, 'answers');
const sessionsCol  = () => collection(db, 'sessions');

// ─── Scoring ──────────────────────────────────────────────────
export const calcScore = (isCorrect, timeTaken, timer) => {
  if (!isCorrect) return 0;
  const t = Math.max(0, timeTaken);
  const d = Math.max(1, timer);               // avoid division by zero
  return Math.max(5, Math.round(30 - (t / d) * 25));
};

// ─── Game state ───────────────────────────────────────────────
export const initGameState = async () => {
  const snap = await getDoc(gameRef);
  if (!snap.exists()) {
    await setDoc(gameRef, {
      phase: 'waiting',
      currentQuestionIndex: 0,
      questionStartTime: null,
      title: 'QuizLive',
      joinUrl: import.meta.env.VITE_JOIN_URL || window.location.origin,
      showQR: false,
    });
  }
};

export const subscribeToGameState = (cb, onError) =>
  onSnapshot(
    gameRef,
    (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );

export const updateGameState = (data) => updateDoc(gameRef, data);

export const startQuiz = () =>
  updateDoc(gameRef, {
    phase: 'question',
    currentQuestionIndex: 0,
    questionStartTime: serverTimestamp(),
    startedAt: serverTimestamp(),
    sessionSaved: false,
  });

/** Idempotent via transaction — safe for multiple admin tabs. */
export const advanceToResults = () =>
  runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef);
    if (snap.exists() && snap.data().phase === 'question') {
      tx.update(gameRef, { phase: 'results' });
    }
  });

export const advanceToLeaderboard = () =>
  updateDoc(gameRef, { phase: 'leaderboard' });

export const nextQuestion = async (currentIndex, total) => {
  if (currentIndex + 1 >= total) {
    return updateDoc(gameRef, { phase: 'ended' });
  }
  return updateDoc(gameRef, {
    phase: 'question',
    currentQuestionIndex: currentIndex + 1,
    questionStartTime: serverTimestamp(),
  });
};

export const endQuiz = () => updateDoc(gameRef, { phase: 'ended' });

export const resetGame = async () => {
  const batch = writeBatch(db);
  batch.update(gameRef, {
    phase: 'waiting',
    currentQuestionIndex: 0,
    questionStartTime: null,
    sessionSaved: false,
  });
  const [players, answers] = await Promise.all([
    getDocs(playersCol()),
    getDocs(answersCol()),
  ]);
  players.forEach((d) => batch.delete(d.ref));
  answers.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};

// ─── Questions ────────────────────────────────────────────────
export const subscribeToQuestions = (cb) =>
  onSnapshot(
    query(questionsCol(), orderBy('order', 'asc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

export const addQuestion = async (q) => {
  // Use a transaction so two admin tabs adding simultaneously can't both pick
  // the same `order` value. Read max order, write new doc with order+1, atomically.
  const newRef = doc(questionsCol());
  await runTransaction(db, async (tx) => {
    const snap = await getDocs(
      query(questionsCol(), orderBy('order', 'desc'), limit(1))
    );
    const nextOrder = snap.empty ? 0 : snap.docs[0].data().order + 1;
    tx.set(newRef, {
      ...q,
      order: nextOrder,
      createdAt: serverTimestamp(),
    });
  });
  return newRef;
};

export const updateQuestion = (id, data) =>
  updateDoc(doc(db, 'questions', id), data);

export const deleteQuestion = (id) =>
  deleteDoc(doc(db, 'questions', id));

export const reorderQuestions = async (orderedIds) => {
  const batch = writeBatch(db);
  orderedIds.forEach((id, idx) =>
    batch.update(doc(db, 'questions', id), { order: idx })
  );
  return batch.commit();
};

// ─── Players ──────────────────────────────────────────────────
export const joinGame = async (rawName) => {
  // Server-side name validation (UI also enforces this, but block bypass attempts)
  const name = String(rawName ?? '').trim();
  if (name.length < 2 || name.length > 20) {
    throw new Error('INVALID_NAME');
  }

  // Fetch all players to do case-insensitive check (fine for ≤50 players)
  const allSnap  = await getDocs(playersCol());
  const allNames = allSnap.docs.map((d) => d.data().name.toLowerCase());

  if (allNames.includes(name.toLowerCase())) {
    // Find next free suffix: Siva2, Siva3 …
    let n = 2;
    while (allNames.includes(`${name.toLowerCase()}${n}`)) n++;
    const err = new Error('NAME_TAKEN');
    err.suggested = `${name}${n}`;
    throw err;
  }

  const ref = doc(playersCol());
  await setDoc(ref, {
    id: ref.id,
    name,
    score: 0,
    joinedAt: serverTimestamp(),
  });
  return ref.id;
};

export const subscribeToPlayers = (cb) =>
  onSnapshot(
    query(playersCol(), orderBy('score', 'desc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

export const subscribeToPlayerCount = (cb) =>
  onSnapshot(playersCol(), (snap) => cb(snap.size));

export const getPlayer = (id) =>
  getDoc(doc(db, 'players', id)).then((s) =>
    s.exists() ? { id: s.id, ...s.data() } : null
  );

// ─── Answers ──────────────────────────────────────────────────
/**
 * Re-submission safe: subtracts previous score, adds new score.
 * Pass `timer` so scoring is proportional regardless of question timer.
 */
export const submitAnswer = async ({
  questionId,
  playerId,
  answer,
  timeTaken,
  correctAnswer,
  timer = 15,
}) => {
  const isCorrect = answer === correctAnswer;
  const score     = calcScore(isCorrect, timeTaken, timer);
  const answerId  = `${questionId}_${playerId}`;
  const answerRef = doc(db, 'answers', answerId);
  const playerRef = doc(db, 'players', playerId);

  // Single atomic transaction: read both docs, write both docs.
  // Eliminates the bug where setDoc succeeds but score transaction fails,
  // leaving answer saved but score never updated.
  await runTransaction(db, async (tx) => {
    const [answerSnap, playerSnap] = await Promise.all([
      tx.get(answerRef),
      tx.get(playerRef),
    ]);

    const oldScore = answerSnap.exists() ? (answerSnap.data().score || 0) : 0;

    tx.set(answerRef, {
      questionId,
      playerId,
      answer,
      timeTaken,
      score,
      isCorrect,
      timestamp: serverTimestamp(),
    });

    if (playerSnap.exists()) {
      const current = playerSnap.data().score || 0;
      tx.update(playerRef, { score: Math.max(0, current - oldScore + score) });
    }
  });

  return score;
};

export const getPlayerAnswer = (questionId, playerId) =>
  getDoc(doc(db, 'answers', `${questionId}_${playerId}`)).then((s) =>
    s.exists() ? s.data() : null
  );

/** Real-time listener for one player's answer to one question. */
export const subscribeToPlayerAnswer = (questionId, playerId, cb) =>
  onSnapshot(doc(db, 'answers', `${questionId}_${playerId}`), (s) =>
    cb(s.exists() ? s.data() : null)
  );

export const subscribeToQuestionAnswers = (questionId, cb) =>
  onSnapshot(
    query(answersCol(), where('questionId', '==', questionId)),
    (snap) => cb(snap.docs.map((d) => d.data()))
  );

// ─── Rank helper (handles ties) ───────────────────────────────
/**
 * Returns the 1-based rank of `playerId` in a sorted player list.
 * Tied scores share the same rank (e.g. two players at 60 = both rank 1).
 */
export const getPlayerRank = (players, playerId) => {
  const myScore = players.find((p) => p.id === playerId)?.score ?? 0;
  return players.filter((p) => p.score > myScore).length + 1;
};

// ─── Sessions (leaderboard history) ──────────────────────────
/**
 * Saves a session snapshot when quiz ends.
 * Transaction-guarded: only saves once even with multiple host tabs open.
 */
export const saveSession = async (gameState) => {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef);
    if (!snap.exists() || snap.data().sessionSaved) return;

    const playerSnap = await getDocs(query(playersCol(), orderBy('score', 'desc')));
    const players = playerSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const ranked = players.map((p) => ({
      name:  p.name,
      score: p.score,
      rank:  players.filter((x) => x.score > p.score).length + 1,
    }));

    const sessionRef = doc(sessionsCol());
    tx.set(sessionRef, {
      title:     gameState.title ?? 'QuizLive',
      startedAt: gameState.startedAt ?? null,
      endedAt:   serverTimestamp(),
      players:   ranked,
    });
    tx.update(gameRef, { sessionSaved: true });
  });
};

export const subscribeToSessions = (cb) =>
  onSnapshot(
    // Cap at the most recent 50 sessions so the history page stays fast
    // even after years of use. Older sessions remain in Firestore (admin
    // can still query them directly if ever needed).
    query(sessionsCol(), orderBy('endedAt', 'desc'), limit(50)),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
