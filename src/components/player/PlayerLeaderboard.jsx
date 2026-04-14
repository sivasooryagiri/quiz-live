import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToPlayers } from '../../firebase/db';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function PlayerLeaderboard({ playerId, playerName }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPlayers(setPlayers);
    return unsub;
  }, []);

  const myRank  = players.findIndex((p) => p.id === playerId) + 1;
  const myScore = players.find((p) => p.id === playerId)?.score ?? 0;
  const topTen  = players.slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628] px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-black gradient-text">Leaderboard</h2>
        <p className="text-brand-300 text-sm mt-1">Check the big screen!</p>
      </motion.div>

      {/* My rank card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl p-4 mb-4 flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">Your rank</p>
          <p className="text-3xl font-black text-white">#{myRank || '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">Score</p>
          <p className="text-3xl font-black gradient-text">{myScore}</p>
        </div>
      </motion.div>

      {/* Top 10 */}
      <div className="space-y-2">
        {topTen.map((p, i) => {
          const isMe = p.id === playerId;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3
                ${isMe ? 'glass-strong border border-brand-500/50' : 'glass'}`}
            >
              <span className="text-xl w-7 text-center">
                {i < 3 ? MEDAL[i] : <span className="text-white/50 font-bold text-sm">#{i + 1}</span>}
              </span>
              <span className={`flex-1 font-bold truncate ${isMe ? 'text-brand-300' : 'text-white'}`}>
                {p.name} {isMe && '(you)'}
              </span>
              <span className="font-black text-white tabular-nums">{p.score}</span>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-white/20 text-xs mt-4">Waiting for next question…</p>
    </div>
  );
}
