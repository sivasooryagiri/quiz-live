import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import useGameState from '../hooks/useGameState';
import { subscribeToQuestions, advanceToResults, advanceToLeaderboard, saveSession } from '../firebase/db';
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
  const timerRef      = useRef(null);
  const sessionSaving = useRef(false);

  useEffect(() => {
    const unsub = subscribeToQuestions(setQuestions);
    return unsub;
  }, []);

  // Save session snapshot when quiz ends (once per session).
  useEffect(() => {
    if (!gameState || gameState.phase !== 'ended') return;
    if (gameState.sessionSaved || sessionSaving.current) return;
    sessionSaving.current = true;
    saveSession(gameState).catch(console.error);
  }, [gameState?.phase, gameState?.sessionSaved]);

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
    const remaining = Math.max(0, (currentQ.timer ?? 15) - elapsed);

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

  const joinUrl = gameState?.joinUrl || window.location.origin;
  const showQR  = gameState?.showQR ?? false;

  return (
    <div className="min-h-screen w-full overflow-hidden">

      {/* Join URL — fixed bottom bar, always visible on all host screens */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center
                      gap-2 py-2 bg-black/30 backdrop-blur-sm border-t border-white/5 pointer-events-none">
        <span className="text-white/30 text-sm">Join at</span>
        <span className="text-brand-300 text-sm font-bold">
          {joinUrl.replace(/^https?:\/\//, '')}
        </span>
      </div>

      {/* QR overlay — bottom-left, only when showQR is on AND not during question */}
      <AnimatePresence>
        {showQR && phase !== 'question' && (
          <motion.div
            key="qr-overlay"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-12 left-6 z-50 bg-black/60 backdrop-blur-md
                       rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-2"
          >
            <QRCodeSVG
              value={joinUrl}
              size={120}
              bgColor="transparent"
              fgColor="#ffffff"
              level="M"
            />
            <span className="text-white/40 text-xs">Scan to join</span>
          </motion.div>
        )}
      </AnimatePresence>

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
