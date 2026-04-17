import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  startQuiz,
  nextQuestion,
  advanceToLeaderboard,
  endQuiz,
  resetGame,
  advanceToResults,
} from '../../firebase/db';

const PHASE_LABELS = {
  waiting:     { label: 'Waiting for players', color: 'text-blue-300',   dot: 'bg-blue-400' },
  question:    { label: 'Question in progress', color: 'text-yellow-300', dot: 'bg-yellow-400' },
  results:     { label: 'Showing results',      color: 'text-orange-300', dot: 'bg-orange-400' },
  leaderboard: { label: 'Leaderboard',          color: 'text-green-300',  dot: 'bg-green-400' },
  ended:       { label: 'Quiz ended',           color: 'text-red-300',    dot: 'bg-red-400' },
};

function ActionButton({ label, onClick, disabled, variant = 'primary', danger = false }) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try { await onClick(); }
    finally { setLoading(false); }
  };

  const base = 'w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    primary: `${base} bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg`,
    secondary: `${base} glass border border-white/20 text-white hover:bg-white/10`,
    danger: `${base} bg-red-600/30 border border-red-500/50 text-red-300 hover:bg-red-600/50`,
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handle}
      disabled={disabled || loading}
      className={danger ? styles.danger : styles[variant]}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Working…
        </span>
      ) : label}
    </motion.button>
  );
}

export default function GameControl({ gameState, questions }) {
  const phase    = gameState?.phase ?? 'waiting';
  const qIndex   = gameState?.currentQuestionIndex ?? 0;
  const total    = questions.length;
  const currentQ = questions[qIndex];
  const phaseInfo = PHASE_LABELS[phase] ?? PHASE_LABELS.waiting;

  const isLastQuestion = qIndex >= total - 1;

  // Inline two-step confirm for Reset — window.confirm() is silently
  // suppressed by some browsers, which made the button look dead.
  const [confirmReset, setConfirmReset] = useState(false);
  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setConfirmReset(false);
    try {
      await resetGame();
    } catch (err) {
      console.error('Reset game failed:', err);
      alert(`Couldn't reset game: ${err.code || err.message || err}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-3 h-3 rounded-full ${phaseInfo.dot} animate-pulse`} />
          <span className={`font-bold ${phaseInfo.color}`}>{phaseInfo.label}</span>
        </div>

        {phase !== 'waiting' && phase !== 'ended' && (
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Question</p>
            <p className="text-white font-semibold">
              {qIndex + 1} / {total}: {currentQ?.text ?? '—'}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Controls</p>

        {/* Waiting → Start */}
        {phase === 'waiting' && (
          <ActionButton
            label={`🚀 Start Quiz (${total} question${total !== 1 ? 's' : ''})`}
            disabled={total === 0}
            onClick={startQuiz}
          />
        )}

        {/* Question phase controls */}
        {phase === 'question' && (
          <ActionButton
            label="⏭ Skip to Results"
            onClick={advanceToResults}
            variant="secondary"
          />
        )}

        {/* Results → Leaderboard */}
        {phase === 'results' && (
          <ActionButton
            label="📊 Show Leaderboard"
            onClick={advanceToLeaderboard}
          />
        )}

        {/* Leaderboard → Next / End */}
        {phase === 'leaderboard' && (
          <>
            {!isLastQuestion && (
              <ActionButton
                label={`▶ Next Question (${qIndex + 2} / ${total})`}
                onClick={() => nextQuestion(qIndex, total)}
              />
            )}
            <ActionButton
              label={isLastQuestion ? '🏁 End Quiz' : '🏁 End Quiz Early'}
              onClick={endQuiz}
              variant={isLastQuestion ? 'primary' : 'secondary'}
            />
          </>
        )}

        {/* Ended */}
        {phase === 'ended' && (
          <p className="text-center text-white/40 text-sm py-2">Quiz has ended. Reset to start again.</p>
        )}
      </div>

      {/* Reset */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Danger Zone</p>
        <ActionButton
          label={confirmReset
            ? '⚠ Confirm reset — click again to wipe players & answers'
            : '🔄 Reset Game (clears all players & answers)'}
          onClick={handleReset}
          danger
        />
      </div>
    </div>
  );
}
