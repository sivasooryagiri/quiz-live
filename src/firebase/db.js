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
    });
  }
};

export const subscribeToGameState = (cb) =>
  onSnapshot(gameRef, (snap) =>
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  );

export const updateGameState = (data) => updateDoc(gameRef, data);

export const startQuiz = () =>
  updateDoc(gameRef, {
    phase: 'question',
    currentQuestionIndex: 0,
    questionStartTime: serverTimestamp(),
  });

/** Idempotent via transaction — safe for multiple host tabs. */
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
  const snap = await getDocs(
    query(questionsCol(), orderBy('order', 'desc'), limit(1))
  );
  const nextOrder = snap.empty ? 0 : snap.docs[0].data().order + 1;
  return addDoc(questionsCol(), {
    ...q,
    order: nextOrder,
    createdAt: serverTimestamp(),
  });
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
export const joinGame = async (name) => {
  const existing = await getDocs(
    query(playersCol(), where('name', '==', name))
  );
  // Name already taken — throw so UI can show error
  if (!existing.empty) {
    throw new Error('NAME_TAKEN');
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

  // Get old score to calculate delta (handles re-submissions)
  const existing = await getDoc(answerRef);
  const oldScore = existing.exists() ? (existing.data().score || 0) : 0;

  await setDoc(answerRef, {
    questionId,
    playerId,
    answer,
    timeTaken,
    score,
    isCorrect,
    timestamp: serverTimestamp(),
  });

  // Atomically adjust running total: remove old pts, add new pts
  await runTransaction(db, async (tx) => {
    const playerRef  = doc(db, 'players', playerId);
    const playerSnap = await tx.get(playerRef);
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
