import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import useGameState from '../hooks/useGameState';
import { subscribeToQuestions } from '../firebase/db';
import WaitingScreen    from '../components/host/WaitingScreen';
import QuestionPhase    from '../components/host/QuestionPhase';
import ResultsPhase     from '../components/host/ResultsPhase';
import LeaderboardPhase from '../components/host/LeaderboardPhase';
import EndedPhase       from '../components/host/EndedPhase';
import LoadingSpinner   from '../components/shared/LoadingSpinner';
import ErrorScreen      from '../components/shared/ErrorScreen';

const fade = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.5 },
};

// HostPage is read-only — pure projector display.
// Auto-advance lives in AdminPage so meta writes stay admin-authenticated.
export default function HostPage() {
  const { gameState, loading, error } = useGameState();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const unsub = subscribeToQuestions(setQuestions);
    return unsub;
  }, []);

  if (error) return <ErrorScreen message={error} />;
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
