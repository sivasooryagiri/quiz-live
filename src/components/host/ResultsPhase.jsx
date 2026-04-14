import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SolutoHostBar } from '../shared/SolutoBrand';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { subscribeToQuestionAnswers } from '../../firebase/db';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function CustomLabel({ x, y, width, height, value, isCorrect }) {
  if (!value) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2 + 5}
      fill={isCorrect ? '#4ade80' : '#f87171'}
      fontSize={18}
      fontWeight={700}
    >
      {value}
    </text>
  );
}

export default function ResultsPhase({ question, questionIndex, totalQuestions }) {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const unsub = subscribeToQuestionAnswers(question.id, setAnswers);
    return unsub;
  }, [question.id]);

  const counts = question.options.map((_, i) =>
    answers.filter((a) => a.answer === i).length
  );
  const total = answers.length || 1;

  const chartData = question.options.map((opt, i) => ({
    name:    `${OPTION_LABELS[i]}. ${opt}`,
    count:   counts[i],
    correct: i === question.correctAnswer,
  }));

  return (
    <div className="min-h-screen w-full flex flex-col p-8 bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="glass rounded-xl px-4 py-2">
          <span className="text-brand-300 text-sm font-semibold">
            Question {questionIndex + 1} / {totalQuestions} — Results
          </span>
        </div>
        <div className="glass rounded-xl px-4 py-2">
          <span className="text-white text-sm font-semibold">{answers.length} responses</span>
        </div>
      </div>

      {/* Question recap */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl px-6 py-4 mb-6"
      >
        <p className="text-white text-2xl font-bold text-center">{question.text}</p>
      </motion.div>

      {/* Bar chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 glass rounded-3xl p-6"
      >
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
            barCategoryGap="20%"
          >
            <XAxis type="number" hide domain={[0, Math.max(...counts, 1)]} />
            <YAxis
              type="category"
              dataKey="name"
              width={220}
              tick={{ fill: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,10,30,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: 'white',
              }}
              formatter={(val, name, props) => [`${val} votes`, props.payload.correct ? '✅ Correct' : '❌ Wrong']}
              labelStyle={{ color: '#a78bfa' }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} isAnimationActive animationDuration={800}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.correct ? '#22c55e' : '#ef4444'}
                  opacity={entry.correct ? 1 : 0.65}
                  style={entry.correct ? { filter: 'drop-shadow(0 0 10px #22c55e)' } : {}}
                />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                formatter={(val) => `${val} ${val === 1 ? 'person' : 'people'}`}
                style={{ fill: 'white', fontSize: 16, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Correct answer callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 text-center"
      >
        <span className="glass rounded-xl px-6 py-3 text-green-300 font-bold text-lg inline-block">
          ✅ Correct answer: {OPTION_LABELS[question.correctAnswer]}. {question.options[question.correctAnswer]}
        </span>
      </motion.div>
      <SolutoHostBar />
    </div>
  );
}
