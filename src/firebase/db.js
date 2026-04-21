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
  deleteField,
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
const gameRef        = doc(db, 'meta', 'gameState');
const questionsCol   = () => collection(db, 'questions');
const answerKeysCol  = () => collection(db, 'answerKeys');
const playersCol     = () => collection(db, 'players');
const answersCol     = () => collection(db, 'answers');
const sessionsCol    = () => collection(db, 'sessions');

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
// Public question docs hold text/options/timer/order — but NOT correctAnswer.
// correctAnswer lives in /answerKeys/{questionId}, locked behind rules so
// players can't fetch all answers via DevTools before answering.
export const subscribeToQuestions = (cb) =>
  onSnapshot(
    query(questionsCol(), orderBy('order', 'asc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

/** Admin-only: stream every {questionId: correctAnswer} for the editor UI. */
export const subscribeToAnswerKeys = (cb) =>
  onSnapshot(answerKeysCol(), (snap) => {
    const map = {};
    snap.docs.forEach((d) => { map[d.id] = d.data().correctAnswer; });
    cb(map);
  });

/** Public read allowed only after question phase ends (rules-enforced). */
export const subscribeToAnswerKey = (qId, cb) =>
  onSnapshot(doc(db, 'answerKeys', qId), (s) =>
    cb(s.exists() ? s.data() : null)
  );

export const addQuestion = async (q) => {
  const { correctAnswer = 0, ...publicData } = q;
  const snap = await getDocs(
    query(questionsCol(), orderBy('order', 'desc'), limit(1))
  );
  const nextOrder = snap.empty ? 0 : snap.docs[0].data().order + 1;
  const newRef = doc(questionsCol());
  const batch = writeBatch(db);
  batch.set(newRef, {
    ...publicData,
    order: nextOrder,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, 'answerKeys', newRef.id), { correctAnswer });
  await batch.commit();
  return newRef;
};

export const updateQuestion = async (id, data) => {
  const { correctAnswer, ...publicData } = data;
  const batch = writeBatch(db);
  if (Object.keys(publicData).length) {
    batch.update(doc(db, 'questions', id), publicData);
  }
  if (correctAnswer !== undefined) {
    batch.set(doc(db, 'answerKeys', id), { correctAnswer }, { merge: true });
  }
  return batch.commit();
};

export const deleteQuestion = async (id) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'questions', id));
  batch.delete(doc(db, 'answerKeys', id));
  return batch.commit();
};

export const reorderQuestions = async (orderedIds) => {
  const batch = writeBatch(db);
  orderedIds.forEach((id, idx) =>
    batch.update(doc(db, 'questions', id), { order: idx })
  );
  return batch.commit();
};

/**
 * Self-healing migration. Runs on admin login. Handles:
 *   1. Old questions with embedded correctAnswer field — move to /answerKeys, strip field
 *   2. Any question missing an /answerKeys doc — create one with default 0
 * Idempotent. Admin-only.
 */
export const migrateAnswerKeys = async () => {
  const [qSnap, kSnap] = await Promise.all([
    getDocs(questionsCol()),
    getDocs(answerKeysCol()),
  ]);
  const existingKeys = new Set(kSnap.docs.map((d) => d.id));
  const work = [];
  for (const d of qSnap.docs) {
    const data = d.data();
    const hasEmbedded = 'correctAnswer' in data;
    const hasKeyDoc   = existingKeys.has(d.id);
    if (hasEmbedded || !hasKeyDoc) {
      work.push({
        id:            d.id,
        correctAnswer: data.correctAnswer ?? 0,
        stripField:    hasEmbedded,
      });
    }
  }
  if (!work.length) return 0;
  const batch = writeBatch(db);
  for (const w of work) {
    batch.set(doc(db, 'answerKeys', w.id), { correctAnswer: w.correctAnswer }, { merge: true });
    if (w.stripField) {
      batch.update(doc(db, 'questions', w.id), { correctAnswer: deleteField() });
    }
  }
  await batch.commit();
  return work.length;
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

// Aggregates scores live from /answers so direct player doc writes have no effect.
export const subscribeToPlayers = (cb) => {
  let players = [];
  let answers = [];

  const merge = () => {
    const scoreMap = {};
    answers.forEach(({ playerId, score }) => {
      scoreMap[playerId] = (scoreMap[playerId] || 0) + (score || 0);
    });
    cb(
      players
        .map((p) => ({ ...p, score: scoreMap[p.id] || 0 }))
        .sort((a, b) => b.score - a.score)
    );
  };

  const unsubPlayers = onSnapshot(playersCol(), (snap) => {
    players = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    merge();
  });
  const unsubAnswers = onSnapshot(answersCol(), (snap) => {
    answers = snap.docs.map((d) => d.data());
    merge();
  });

  return () => { unsubPlayers(); unsubAnswers(); };
};

export const subscribeToPlayerCount = (cb) =>
  onSnapshot(playersCol(), (snap) => cb(snap.size));

export const getPlayer = (id) =>
  getDoc(doc(db, 'players', id)).then((s) =>
    s.exists() ? { id: s.id, ...s.data() } : null
  );

// ─── Answers ──────────────────────────────────────────────────
/**
 * Re-submission safe: subtracts previous score, adds new score.
 *
 * Two-attempt pattern: client doesn't know correctAnswer (it's hidden in
 * /answerKeys, locked behind rules during 'question' phase). So we
 * optimistically submit isCorrect=true with the max-for-time score. If
 * Firestore rules reject (player guessed wrong), we retry with
 * isCorrect=false, score=0. Either way, the server is the source of truth.
 */
const PERMISSION_DENIED = (e) => {
  const code = e?.code || e?.cause?.code || '';
  return code === 'permission-denied' || code === 'PERMISSION_DENIED';
};

// Scores are computed from /answers — player docs are never updated.
// Two-attempt pattern: submit isCorrect=true optimistically; rules reject
// if the answer is wrong, then retry with isCorrect=false, score=0.
export const submitAnswer = async ({
  questionId,
  playerId,
  answer,
  timeTaken,
  timer = 15,
}) => {
  const answerRef = doc(db, 'answers', `${questionId}_${playerId}`);
  const optimisticScore = calcScore(true, timeTaken, timer);

  try {
    await setDoc(answerRef, {
      questionId, playerId, answer, timeTaken,
      score: optimisticScore, isCorrect: true,
      timestamp: serverTimestamp(),
    });
    return optimisticScore;
  } catch (e) {
    if (!PERMISSION_DENIED(e)) throw e;
    await setDoc(answerRef, {
      questionId, playerId, answer, timeTaken,
      score: 0, isCorrect: false,
      timestamp: serverTimestamp(),
    });
    return 0;
  }
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
  const [playerSnap, answerSnap] = await Promise.all([
    getDocs(playersCol()),
    getDocs(answersCol()),
  ]);
  const scoreMap = {};
  answerSnap.docs.forEach((d) => {
    const { playerId, score } = d.data();
    scoreMap[playerId] = (scoreMap[playerId] || 0) + (score || 0);
  });
  const players = playerSnap.docs
    .map((d) => ({ id: d.id, ...d.data(), score: scoreMap[d.id] || 0 }))
    .sort((a, b) => b.score - a.score);
  const ranked = players.map((p) => ({
    name:  p.name,
    score: p.score,
    rank:  players.filter((x) => x.score > p.score).length + 1,
  }));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef);
    if (!snap.exists() || snap.data().sessionSaved) return;
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
