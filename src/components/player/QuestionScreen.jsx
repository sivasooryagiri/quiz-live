/**
 * QuestionScreen — shows question, options, live timer.
 * After answering: stays on screen with selection highlighted.
 * Player can tap another option to change answer (re-submits).
 * When timer expires: locks everything, shows "Time's up".
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitAnswer } from '../../firebase/db';

const OPTION_STYLES = [
  { bg: 'from-violet-600 to-purple-700', border: 'border-violet-400', label: 'A' },
  { bg: 'from-blue-600   to-indigo-700', border: 'border-blue-400',   label: 'B' },
  { bg: 'from-rose-600   to-pink-700',   border: 'border-rose-400',   label: 'C' },
  { bg: 'from-amber-500  to-orange-600', border: 'border-amber-400',  label: 'D' },
];

export default function QuestionScreen({
  question,
  playerId,
  questionStartTime,
  onAnswered,
}) {
  const totalTime    = question.timer ?? 30;
  const [timeLeft,   setTimeLeft]   = useState(totalTime);
  const [selected,   setSelected]   = useState(null);   // current selection
  const [submitting, setSubmitting] = useState(false);
  const [expired,    setExpired]    = useState(false);
  const [lastScore,  setLastScore]  = useState(null);
  const expiredRef   = useRef(false);

  // Reset on new question
  useEffect(() => {
    setTimeLeft(totalTime);
    setSelected(null);
    setLastScore(null);
    setExpired(false);
    expiredRef.current = false;
  }, [question.id]);

  // Live countdown from server timestamp
  useEffect(() => {
    if (!questionStartTime) return;
    const startMs =
      questionStartTime?.toMillis?.() ??
      (questionStartTime?.seconds ?? 0) * 1000;

    const tick = () => {
      const elapsed   = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, totalTime - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        setExpired(true);
      }
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [question.id, questionStartTime, totalTime]);

  const handleSelect = useCallback(
    async (idx) => {
      if (submitting || expired) return;
      if (selected === idx) return; // same option, ignore

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
        setLastScore(score);
        onAnswered(question.id);
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, expired, selected, question, playerId, questionStartTime, onAnswered]
  );

  const pct      = timeLeft / totalTime;
  const barColor = pct > 0.5 ? '#8b5cf6' : pct > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Timer bar */}
      <div className="h-2 w-full bg-white/10">
        <motion.div
          className="h-full rounded-r-full transition-colors duration-300"
          style={{ backgroundColor: barColor, width: `${pct * 100}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 py-4 gap-3">
        {/* Timer number + status */}
        <div className="flex items-center justify-between">
          <span className="text-brand-300 text-sm font-semibold">
            {selected !== null && !expired
              ? '✏️ Tap to change'
              : expired
              ? '⏰ Time\'s up'
              : 'Choose your answer'}
          </span>
          <motion.div
            key={Math.ceil(timeLeft)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black tabular-nums px-4 py-1 rounded-xl glass"
            style={{ color: barColor }}
          >
            {Math.ceil(timeLeft)}s
          </motion.div>
        </div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 flex items-center justify-center"
          style={{ minHeight: 100 }}
        >
          <p className="text-white text-xl font-bold text-center leading-snug">
            {question.text}
          </p>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {question.options.map((opt, idx) => {
            const s        = OPTION_STYLES[idx];
            const isChosen = selected === idx;
            const locked   = expired;

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={locked || submitting}
                whileTap={!locked ? { scale: 0.94 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: locked && !isChosen ? 0.4 : 1,
                  y: 0,
                  scale: isChosen ? 0.97 : 1,
                }}
                transition={{ delay: idx * 0.06 }}
                className={`
                  relative p-4 rounded-2xl border-2 text-left font-bold text-white
                  bg-gradient-to-br ${s.bg} ${s.border}
                  transition-all
                  ${isChosen
                    ? 'ring-4 ring-white/50 brightness-110'
                    : !locked ? 'hover:brightness-110' : ''
                  }
                  ${locked ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className="block text-xs font-black text-white/60 mb-1">
                  {s.label}
                </span>
                <span className="text-sm leading-snug">{opt}</span>

                {isChosen && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full
                               flex items-center justify-center shadow"
                  >
                    <span className="text-xs text-purple-700 font-black">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Score feedback */}
        <AnimatePresence>
          {lastScore !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center rounded-xl p-3 font-bold text-sm
                ${lastScore > 0
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
                }`}
            >
              {lastScore > 0 ? `+${lastScore} pts` : 'Wrong answer'}
              {!expired && (
                <span className="text-white/40 font-normal ml-2">
                  · tap to change
                </span>
              )}
            </motion.div>
          )}

          {expired && selected === null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center rounded-xl p-3 bg-red-500/20 border border-red-500/30
                         text-red-300 font-bold text-sm"
            >
              ⏰ No answer submitted
            </motion.div>
          )}

          {expired && selected !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center rounded-xl p-3 glass text-white/50 text-sm"
            >
              Waiting for results…
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
