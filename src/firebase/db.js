/**
 * Firestore data layer.
 *
 * Collections:
 *   meta/gameState      – single game-state document
 *   questions/{id}      – question documents, ordered by `order`
 *   players/{id}        – player documents
 *   answers/{qId_pId}   – one answer doc per (question, player) pair
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

// ─── Firestore refs ───────────────────────────────────────────
const gameRef      = doc(db, 'meta', 'gameState');
const questionsCol = () => collection(db, 'questions');
const playersCol   = () => collection(db, 'players');
const answersCol   = () => collection(db, 'answers');

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
  if (!existing.empty) return existing.docs[0].id;

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
 * Supports re-submission: subtracts old score, adds new score.
 * score = correct ? max(100, 1000 - floor(timeTaken) * 50) : 0
 */
export const submitAnswer = async ({
  questionId,
  playerId,
  answer,
  timeTaken,
  correctAnswer,
}) => {
  const isCorrect = answer === correctAnswer;
  const score     = isCorrect
    ? Math.max(100, 1000 - Math.floor(timeTaken) * 50)
    : 0;

  const answerId  = `${questionId}_${playerId}`;
  const answerRef = doc(db, 'answers', answerId);

  // Get existing answer to calculate score delta
  const existing  = await getDoc(answerRef);
  const oldScore  = existing.exists() ? (existing.data().score || 0) : 0;

  await setDoc(answerRef, {
    questionId,
    playerId,
    answer,
    timeTaken,
    score,
    isCorrect,
    timestamp: serverTimestamp(),
  });

  // Atomically adjust player score (subtract old, add new)
  await runTransaction(db, async (tx) => {
    const playerRef  = doc(db, 'players', playerId);
    const playerSnap = await tx.get(playerRef);
    if (playerSnap.exists()) {
      const current = playerSnap.data().score || 0;
      tx.update(playerRef, { score: current - oldScore + score });
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
