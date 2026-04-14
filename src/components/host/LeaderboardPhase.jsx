import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '../shared/Particles';
import { subscribeToPlayers } from '../../firebase/db';

const MEDAL  = ['🥇', '🥈', '🥉'];
const COLORS = [
  'from-yellow-400 to-amber-500',
  'from-slate-300  to-slate-400',
  'from-amber-600  to-orange-700',
];

export default function LeaderboardPhase({ gameState, questions }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPlayers(setPlayers);
    return unsub;
  }, []);

  const topTen  = players.slice(0, 10);
  const winner  = topTen[0];
  const isLast  = (gameState?.currentQuestionIndex ?? 0) >= (questions.length - 1);

  return (
    <div className="min-h-screen w-full flex flex-col p-8 bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628] relative overflow-hidden">
      {/* Winner particles */}
      {winner && <Particles count={32} />}

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-6xl font-black gradient-text">🏆 Leaderboard</h1>
        {isLast && (
          <p className="text-brand-300 text-xl mt-2 font-medium">Final Results!</p>
        )}
      </motion.div>

      {/* Podium row for top 3 */}
      {topTen.length >= 1 && (
        <div className="flex justify-center items-end gap-4 mb-8">
          {[topTen[1], topTen[0], topTen[2]].map((p, visualIdx) => {
            if (!p) return <div key={visualIdx} className="w-40" />;
            const rank    = topTen.indexOf(p);
            const heights = ['h-32', 'h-44', 'h-28'];
            const color   = COLORS[rank] || 'from-brand-600 to-brand-700';
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: visualIdx * 0.15, type: 'spring', bounce: 0.3 }}
                className={`w-40 ${heights[visualIdx]} bg-gradient-to-t ${color} rounded-t-2xl
                            flex flex-col items-center justify-end pb-4 shadow-xl relative
                            ${rank === 0 ? 'animate-pulse-glow' : ''}`}
              >
                {rank === 0 && (
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-8 text-4xl"
                  >
                    👑
                  </motion.span>
                )}
                <span className="text-2xl mb-1">{MEDAL[rank]}</span>
                <span className="text-white font-black text-sm text-center px-1 truncate w-full text-center">
                  {p.name}
                </span>
                <span className="text-white/80 font-bold text-xs mt-1">{p.score} pts</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Ranks 4–10 */}
      <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto w-full">
        <AnimatePresence>
          {topTen.slice(3).map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.06 }}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <span className="text-white/50 font-black text-lg w-6 text-center">
                {i + 4}
              </span>
              <span className="flex-1 text-white font-bold truncate">{p.name}</span>
              <span className="text-brand-300 font-black">{p.score}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {players.length === 0 && (
        <p className="text-center text-white/30 mt-8">No players yet</p>
      )}
    </div>
  );
}
