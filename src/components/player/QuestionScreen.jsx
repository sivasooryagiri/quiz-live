import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitAnswer } from '../../firebase/db';
import { PoweredBySoluto } from '../shared/SolutoBrand';

const OPTION_STYLES = [
  { bg: 'from-violet-600 to-purple-700', border: 'border-violet-400', label: 'A' },
  { bg: 'from-blue-600   to-indigo-700', border: 'border-blue-400',   label: 'B' },
  { bg: 'from-rose-600   to-pink-700',   border: 'border-rose-400',   label: 'C' },
  { bg: 'from-amber-500  to-orange-600', border: 'border-amber-400',  label: 'D' },
];

export default function QuestionScreen({ question, playerId, questionStartTime }) {
  const totalTime   = question.timer ?? 15;
  const [timeLeft,  setTimeLeft]  = useState(totalTime);
  const [selected,  setSelected]  = useState(null);
  const [submitting,setSubmitting]= useState(false);
  const [expired,   setExpired]   = useState(false);
  const expiredRef  = useRef(false);

  // Reset on new question
  useEffect(() => {
    setTimeLeft(totalTime);
    setSelected(null);
    setExpired(false);
    expiredRef.current = false;
  }, [question.id, totalTime]);

  // Countdown synced to server timestamp
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
    const id = setInterval(tick, 80);
    return () => clearInterval(id);
  }, [question.id, questionStartTime, totalTime]);

  const handleSelect = useCallback(async (idx) => {
    if (submitting || expired || selected === idx) return;
    setSelected(idx);
    setSubmitting(true);

    const startMs =
      questionStartTime?.toMillis?.() ??
      (questionStartTime?.seconds ?? 0) * 1000;
    const timeTaken = Math.max(0, (Date.now() - startMs) / 1000);

    try {
      await submitAnswer({
        questionId:    question.id,
        playerId,
        answer:        idx,
        timeTaken,
        correctAnswer: question.correctAnswer,
        timer:         totalTime,
      });
    } catch (e) {
      console.error(e);
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, expired, selected, question, playerId, questionStartTime, totalTime]);

  const pct      = timeLeft / totalTime;
  const barColor = pct > 0.5 ? '#8b5cf6' : pct > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Timer bar */}
      <div className="h-1.5 w-full bg-white/10">
        <div
          className="h-full rounded-r-full"
          style={{ backgroundColor: barColor, width: `${pct * 100}%`, transition: 'width 0.08s linear' }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 py-4 gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-brand-300 text-sm font-semibold">
            {expired
              ? selected !== null ? '🔒 Locked in' : '⏰ Time\'s up'
              : selected !== null ? '✏️ Tap to change' : 'Pick your answer'}
          </span>
          <motion.div
            key={Math.ceil(timeLeft)}
            initial={{ scale: 1.15 }}
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
          style={{ minHeight: 90 }}
        >
          <p className="text-white text-xl font-bold text-center leading-snug">
            {question.text}
          </p>
        </motion.div>

        {/* Options */}
        <div className="flex flex-col gap-2.5 flex-1 justify-center">
          {question.options.map((opt, idx) => {
            const s        = OPTION_STYLES[idx];
            const isChosen = selected === idx;
            const dimmed   = expired && !isChosen;

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={expired || submitting}
                whileTap={!expired ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: dimmed ? 0.35 : 1, x: 0, scale: isChosen ? 0.98 : 1 }}
                transition={{ delay: idx * 0.06 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2
                  font-bold text-white bg-gradient-to-r ${s.bg} ${s.border} transition-all
                  ${isChosen ? 'ring-4 ring-white/50 brightness-110' : ''}
                  ${!expired && !isChosen ? 'hover:brightness-110' : ''}
                  ${expired ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className="text-sm font-black text-white/70 w-5 shrink-0">{s.label}</span>
                <span className="text-sm leading-snug flex-1 text-left">{opt}</span>
                {isChosen && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow shrink-0"
                  >
                    <span className="text-xs text-white font-black">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom status — NO score or correct answer shown */}
        <AnimatePresence mode="wait">
          {expired && selected === null && (
            <motion.div
              key="no-answer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center rounded-xl p-3 bg-red-500/20 border
                         border-red-500/30 text-red-300 font-bold text-sm"
            >
              ⏰ No answer submitted
            </motion.div>
          )}
          {expired && selected !== null && (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center rounded-xl p-3 glass text-white/50 text-sm font-medium"
            >
              Answer locked in — watch the screen!
            </motion.div>
          )}
        </AnimatePresence>
        <PoweredBySoluto />
      </div>
    </div>
  );
}
