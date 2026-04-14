import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitAnswer } from '../../firebase/db';

const OPTION_COLORS = [
  { bg: 'from-violet-600 to-purple-700', border: 'border-violet-500', label: 'A' },
  { bg: 'from-blue-600   to-indigo-700', border: 'border-blue-500',   label: 'B' },
  { bg: 'from-rose-600   to-pink-700',   border: 'border-rose-500',   label: 'C' },
  { bg: 'from-amber-500  to-orange-600', border: 'border-amber-400',  label: 'D' },
];

export default function QuestionScreen({
  question,
  playerId,
  questionStartTime,
  onAnswered,
}) {
  const [timeLeft,    setTimeLeft]    = useState(question.timer ?? 30);
  const [selected,    setSelected]    = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [earnedScore, setEarnedScore] = useState(null);
  const [expired,     setExpired]     = useState(false);

  // ── Countdown ─────────────────────────────────────────────
  useEffect(() => {
    setTimeLeft(question.timer ?? 30);
    setSelected(null);
    setEarnedScore(null);
    setExpired(false);
  }, [question.id]);

  useEffect(() => {
    if (!questionStartTime) return;
    const startMs =
      questionStartTime?.toMillis?.() ??
      (questionStartTime?.seconds ?? 0) * 1000;

    const tick = () => {
      const elapsed   = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, (question.timer ?? 30) - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) setExpired(true);
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [question.id, questionStartTime, question.timer]);

  // ── Submit ─────────────────────────────────────────────────
  const handleSelect = useCallback(
    async (idx) => {
      if (selected !== null || submitting || expired) return;
      setSelected(idx);
      setSubmitting(true);

      const startMs =
        questionStartTime?.toMillis?.() ??
        (questionStartTime?.seconds ?? 0) * 1000;
      const timeTaken = Math.max(0, (Date.now() - startMs) / 1000);

      try {
        const score = await submitAnswer({
          questionId:    question.id,
          playerId,
          answer:        idx,
          timeTaken,
          correctAnswer: question.correctAnswer,
        });
        setEarnedScore(score);
        onAnswered(question.id);
      } catch (e) {
        console.error(e);
        setSelected(null);
      } finally {
        setSubmitting(false);
      }
    },
    [selected, submitting, expired, question, playerId, questionStartTime, onAnswered]
  );

  const pct = timeLeft / (question.timer ?? 30);
  const barColor =
    pct > 0.5 ? '#8b5cf6' : pct > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Timer bar */}
      <div className="h-2 w-full bg-white/10">
        <motion.div
          className="h-full rounded-r-full"
          style={{ backgroundColor: barColor }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-brand-300 text-sm font-semibold">Question</span>
          <div
            className="text-2xl font-black tabular-nums px-4 py-1 rounded-xl glass"
            style={{ color: barColor }}
          >
            {Math.ceil(timeLeft)}s
          </div>
        </div>

        {/* Question text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 flex-1 flex items-center justify-center"
        >
          <p className="text-white text-xl font-bold text-center leading-snug">
            {question.text}
          </p>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt, idx) => {
            const color   = OPTION_COLORS[idx];
            const isChosen = selected === idx;
            return (
              <motion.button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null || expired}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className={`
                  relative p-4 rounded-2xl border-2 text-left font-bold text-white
                  bg-gradient-to-br ${color.bg} ${color.border}
                  disabled:cursor-not-allowed transition-all
                  ${isChosen ? 'ring-4 ring-white/40 scale-95' : 'hover:scale-105 hover:brightness-110'}
                `}
              >
                <span className="block text-xs font-black text-white/60 mb-1">
                  {color.label}
                </span>
                <span className="text-sm leading-snug">{opt}</span>

                {isChosen && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <span className="text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Expired banner */}
        <AnimatePresence>
          {expired && selected === null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center glass rounded-xl p-3 border border-red-500/30"
            >
              <p className="text-red-400 font-bold">⏰ Time's up!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score feedback */}
        <AnimatePresence>
          {earnedScore !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`text-center rounded-xl p-4 font-black text-lg
                ${earnedScore > 0
                  ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                  : 'bg-red-500/20 border border-red-500/40 text-red-300'
                }`}
            >
              {earnedScore > 0 ? `+${earnedScore} pts 🎉` : 'Incorrect 😢'}
              <p className="text-xs font-medium opacity-60 mt-1">Waiting for results…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
