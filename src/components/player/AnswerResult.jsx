import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPlayerAnswer } from '../../firebase/db';

export default function AnswerResult({ question, playerId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlayerAnswer(question.id, playerId)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [question.id, playerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center
                      bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const didAnswer  = result !== null;
  const isCorrect  = result?.isCorrect ?? false;
  const score      = result?.score ?? 0;
  const chosen     = result?.answer ?? null;
  const correct    = question.correctAnswer;
  const LABELS     = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5
                    bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">

      {/* Result badge */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl
          ${!didAnswer ? 'bg-gray-500/20 border-2 border-gray-500/40' :
            isCorrect  ? 'bg-green-500/20 border-2 border-green-400/60' :
                         'bg-red-500/20   border-2 border-red-400/60'}`}
      >
        {!didAnswer ? '⏰' : isCorrect ? '✅' : '❌'}
      </motion.div>

      {/* Status text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className={`text-3xl font-black
          ${!didAnswer ? 'text-gray-400' : isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {!didAnswer ? "Time's up!" : isCorrect ? 'Correct!' : 'Wrong!'}
        </p>
        {didAnswer && (
          <p className="text-white/40 text-sm mt-1">
            +{score} pts
          </p>
        )}
      </motion.div>

      {/* Answer breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-2xl p-4 w-full max-w-xs space-y-3"
      >
        {/* Their answer */}
        {didAnswer && (
          <div className={`rounded-xl px-4 py-3 flex items-center gap-3 border
            ${isCorrect
              ? 'bg-green-500/15 border-green-500/40'
              : 'bg-red-500/15   border-red-500/40'}`}
          >
            <span className={`font-black text-sm w-6 text-center
              ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {LABELS[chosen]}
            </span>
            <span className="text-white text-sm font-semibold flex-1">
              {question.options[chosen]}
            </span>
            <span className="text-lg">{isCorrect ? '✓' : '✗'}</span>
          </div>
        )}

        {/* Correct answer (if they got it wrong or didn't answer) */}
        {(!isCorrect) && (
          <div className="rounded-xl px-4 py-3 flex items-center gap-3
                          bg-green-500/15 border border-green-500/40">
            <span className="font-black text-sm w-6 text-center text-green-400">
              {LABELS[correct]}
            </span>
            <span className="text-white text-sm font-semibold flex-1">
              {question.options[correct]}
            </span>
            <span className="text-green-400 text-xs font-bold">Correct</span>
          </div>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/30 text-xs"
      >
        Leaderboard coming up…
      </motion.p>
    </div>
  );
}
