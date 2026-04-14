import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Timer from '../shared/Timer';
import { subscribeToQuestionAnswers } from '../../firebase/db';
import { SolutoHostBar } from '../shared/SolutoBrand';

const OPTION_STYLES = [
  { bg: 'bg-violet-600/80',  border: 'border-violet-400', label: 'A', icon: '▲' },
  { bg: 'bg-blue-600/80',    border: 'border-blue-400',   label: 'B', icon: '◆' },
  { bg: 'bg-rose-600/80',    border: 'border-rose-400',   label: 'C', icon: '●' },
  { bg: 'bg-amber-500/80',   border: 'border-amber-400',  label: 'D', icon: '■' },
];

export default function QuestionPhase({
  question,
  gameState,
  questionIndex,
  totalQuestions,
}) {
  const [timeLeft,     setTimeLeft]     = useState(question.timer ?? 15);
  const [answerCount,  setAnswerCount]  = useState(0);

  // Live answer counter
  useEffect(() => {
    const unsub = subscribeToQuestionAnswers(question.id, (answers) => {
      setAnswerCount(answers.length);
    });
    return unsub;
  }, [question.id]);

  // Countdown from Firestore timestamp
  useEffect(() => {
    if (!gameState?.questionStartTime) return;
    setTimeLeft(question.timer ?? 15);

    const startMs =
      gameState.questionStartTime?.toMillis?.() ??
      (gameState.questionStartTime?.seconds ?? 0) * 1000;

    const tick = () => {
      const elapsed   = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, (question.timer ?? 15) - elapsed);
      setTimeLeft(remaining);
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [question.id, gameState?.questionStartTime, question.timer]);

  return (
    <div className="min-h-screen w-full flex flex-col p-8 bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="glass rounded-xl px-4 py-2">
          <span className="text-brand-300 text-sm font-semibold">
            Question {questionIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Answer count */}
        <motion.div
          key={answerCount}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="glass rounded-xl px-4 py-2 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-sm font-semibold">{answerCount} answered</span>
        </motion.div>

        {/* Timer */}
        <Timer timeLeft={timeLeft} totalTime={question.timer ?? 15} size={110} />
      </div>

      {/* Question text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 mb-8 flex items-center justify-center flex-1 max-h-48"
      >
        <h2 className="text-4xl font-black text-white text-center leading-tight">
          {question.text}
        </h2>
      </motion.div>

      {/* Options + branding */}
      <div className="flex flex-col gap-3">
        {question.options.map((opt, idx) => {
          const s = OPTION_STYLES[idx];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`${s.bg} border-2 ${s.border} rounded-2xl px-6 py-4 flex items-center gap-5`}
            >
              <span className="text-white/60 text-2xl font-black w-8 shrink-0 text-center">
                {s.label}
              </span>
              <span className="text-white text-xl font-bold leading-snug">{opt}</span>
            </motion.div>
          );
        })}
      </div>
      <SolutoHostBar />
    </div>
  );
}
