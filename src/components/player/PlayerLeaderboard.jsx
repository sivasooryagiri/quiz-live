import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToPlayers, getPlayerRank } from '../../firebase/db';
import { PoweredBySoluto } from '../shared/SolutoBrand';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function PlayerLeaderboard({ playerId, playerName }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPlayers(setPlayers);
    return unsub;
  }, []);

  // Proper rank accounting for ties
  const myRank  = players.length ? getPlayerRank(players, playerId) : null;
  const myScore = players.find((p) => p.id === playerId)?.score ?? 0;
  const topTen  = players.slice(0, 50);

  // Build display ranks for each player (ties share same rank)
  const withRanks = topTen.map((p) => ({
    ...p,
    rank: players.filter((x) => x.score > p.score).length + 1,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628] px-4 py-6">

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-black gradient-text">Leaderboard</h2>
        <p className="text-brand-300 text-sm mt-0.5">Check the big screen!</p>
      </motion.div>

      {/* My stats card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-2xl p-4 mb-4 flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">Your rank</p>
          <p className="text-3xl font-black text-white mt-0.5">
            {myRank != null ? `#${myRank}` : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">Score</p>
          <p className="text-3xl font-black gradient-text mt-0.5">{myScore}</p>
        </div>
      </motion.div>

      {/* Top 10 */}
      <div className="space-y-2">
        {withRanks.map((p, i) => {
          const isMe  = p.id === playerId;
          const medal = p.rank <= 3 ? MEDAL[p.rank - 1] : null;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3
                ${isMe
                  ? 'glass-strong border border-brand-500/60'
                  : 'glass'
                }`}
            >
              {/* Rank */}
              <span className="w-8 text-center shrink-0">
                {medal
                  ? <span className="text-xl">{medal}</span>
                  : <span className="text-white/40 font-black text-sm">#{p.rank}</span>
                }
              </span>

              {/* Name */}
              <span className={`flex-1 font-bold truncate text-sm
                ${isMe ? 'text-brand-300' : 'text-white'}`}>
                {p.name}{isMe ? ' (you)' : ''}
              </span>

              {/* Score */}
              <span className="font-black text-white tabular-nums text-sm shrink-0">
                {p.score}
              </span>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-white/20 text-xs mt-4">
        Waiting for next question…
      </p>
      <PoweredBySoluto />
    </div>
  );
}
