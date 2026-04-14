import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameState from '../hooks/useGameState';
import { subscribeToQuestions, advanceToResults, advanceToLeaderboard } from '../firebase/db';
import WaitingScreen    from '../components/host/WaitingScreen';
import QuestionPhase    from '../components/host/QuestionPhase';
import ResultsPhase     from '../components/host/ResultsPhase';
import LeaderboardPhase from '../components/host/LeaderboardPhase';
import EndedPhase       from '../components/host/EndedPhase';
import LoadingSpinner   from '../components/shared/LoadingSpinner';

const fade = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.5 },
};

export default function HostPage() {
  const { gameState, loading } = useGameState();
  const [questions, setQuestions] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToQuestions(setQuestions);
    return unsub;
  }, []);

  // Auto-advance results → leaderboard after 5 seconds
  useEffect(() => {
    if (!gameState || gameState.phase !== 'results') return;
    const id = setTimeout(() => {
      advanceToLeaderboard().catch(console.error);
    }, 5000);
    return () => clearTimeout(id);
  }, [gameState?.phase, gameState?.currentQuestionIndex]);

  // Auto-advance question → results when timer expires.
  // Transaction ensures only one client advances even if multiple host tabs are open.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!gameState || gameState.phase !== 'question') return;
    if (!gameState.questionStartTime)                  return;

    const currentQ = questions[gameState.currentQuestionIndex];
    if (!currentQ) return;

    const startMs =
      gameState.questionStartTime?.toMillis?.() ??
      (gameState.questionStartTime?.seconds ?? 0) * 1000;

    const elapsed   = (Date.now() - startMs) / 1000;
    const remaining = Math.max(0, (currentQ.timer ?? 30) - elapsed);

    timerRef.current = setTimeout(() => {
      advanceToResults().catch(console.error);
    }, remaining * 1000);

    return () => clearTimeout(timerRef.current);
  }, [
    gameState?.phase,
    gameState?.currentQuestionIndex,
    // Use the seconds value as a primitive dep to avoid infinite re-renders
    gameState?.questionStartTime?.seconds,
    questions,
  ]);

  if (loading) return <LoadingSpinner />;

  const phase    = gameState?.phase ?? 'waiting';
  const qIndex   = gameState?.currentQuestionIndex ?? 0;
  const currentQ = questions[qIndex];

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div key="waiting" {...fade} className="min-h-screen">
            <WaitingScreen gameState={gameState} />
          </motion.div>
        )}

        {phase === 'question' && currentQ && (
          <motion.div key={`q-${qIndex}`} {...fade} className="min-h-screen">
            <QuestionPhase
              question={currentQ}
              gameState={gameState}
              questionIndex={qIndex}
              totalQuestions={questions.length}
            />
          </motion.div>
        )}

        {phase === 'results' && currentQ && (
          <motion.div key={`r-${qIndex}`} {...fade} className="min-h-screen">
            <ResultsPhase
              question={currentQ}
              questionIndex={qIndex}
              totalQuestions={questions.length}
            />
          </motion.div>
        )}

        {phase === 'leaderboard' && (
          <motion.div key={`lb-${qIndex}`} {...fade} className="min-h-screen">
            <LeaderboardPhase
              gameState={gameState}
              questions={questions}
            />
          </motion.div>
        )}

        {phase === 'ended' && (
          <motion.div key="ended" {...fade} className="min-h-screen">
            <EndedPhase />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
