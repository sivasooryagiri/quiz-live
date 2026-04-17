import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
import { subscribeToQuestionAnswers, subscribeToAnswerKey } from '../../firebase/db';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// Pill-shaped count chip at the end of each bar.
function CountChip({ x, y, width, height, value }) {
  const cx = x + width + 28;
  const cy = y + height / 2;
  const r  = 18;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="rgba(15,10,30,0.85)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fill="white"
        fontSize={15}
        fontWeight={800}
      >
        {value ?? 0}
      </text>
    </g>
  );
}

export default function ResultsPhase({ question, questionIndex, totalQuestions }) {
  const [answers,   setAnswers]   = useState([]);
  const [correctIdx, setCorrectIdx] = useState(null);

  useEffect(() => {
    const unsub = subscribeToQuestionAnswers(question.id, setAnswers);
    return unsub;
  }, [question.id]);

  useEffect(() => {
    const unsub = subscribeToAnswerKey(question.id, (k) =>
      setCorrectIdx(k?.correctAnswer ?? null)
    );
    return unsub;
  }, [question.id]);

  const counts = question.options.map((_, i) =>
    answers.filter((a) => a.answer === i).length
  );
  const total = answers.length || 1;

  const chartData = question.options.map((opt, i) => ({
    name:    `${OPTION_LABELS[i]}. ${opt}`,
    count:   counts[i],
    correct: i === correctIdx,
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

      {/* Question recap + inline correct answer */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl px-6 py-4 mb-4 flex flex-col items-center gap-2"
      >
        <p className="text-white text-2xl font-bold text-center">{question.text}</p>
        {correctIdx != null && (
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1
                           bg-green-500/15 border border-green-400/30
                           text-green-300 text-sm font-bold">
            ✅ {OPTION_LABELS[correctIdx]}. {question.options[correctIdx]}
          </span>
        )}
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
              <LabelList dataKey="count" content={<CountChip />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

    </div>
  );
}
