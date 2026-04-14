import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '../shared/Particles';
import { subscribeToPlayers } from '../../firebase/db';

const PODIUM_CONFIG = [
  // visual order: 2nd, 1st, 3rd
  {
    rankIdx: 1,
    height: 'h-36',
    gradient: 'from-slate-400 to-slate-500',
    glow: 'shadow-slate-400/40',
    medal: '🥈',
    label: '2nd',
    textSize: 'text-base',
  },
  {
    rankIdx: 0,
    height: 'h-52',
    gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
    glow: 'shadow-yellow-400/60',
    medal: '🥇',
    label: '1st',
    textSize: 'text-lg',
    isWinner: true,
  },
  {
    rankIdx: 2,
    height: 'h-28',
    gradient: 'from-amber-600 to-orange-700',
    glow: 'shadow-orange-500/40',
    medal: '🥉',
    label: '3rd',
    textSize: 'text-sm',
  },
];

function PodiumCard({ player, config, delay }) {
  if (!player) return <div className="w-40" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 120, damping: 14 }}
      className="flex flex-col items-center gap-2"
    >
      {/* Crown for winner */}
      {config.isWinner && (
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl"
        >
          👑
        </motion.div>
      )}

      {/* Avatar circle */}
      <motion.div
        animate={config.isWinner ? { boxShadow: [
          '0 0 20px rgba(250,204,21,0.4)',
          '0 0 50px rgba(250,204,21,0.8)',
          '0 0 20px rgba(250,204,21,0.4)',
        ]} : {}}
        transition={{ duration: 1.8, repeat: Infinity }}
        className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient}
                    flex items-center justify-center text-xl font-black text-white
                    shadow-xl ${config.glow}`}
      >
        {player.name.charAt(0).toUpperCase()}
      </motion.div>

      {/* Podium block */}
      <div
        className={`w-36 ${config.height} bg-gradient-to-t ${config.gradient}
                    rounded-t-2xl flex flex-col items-center justify-end pb-4
                    shadow-xl ${config.glow} shadow-lg`}
      >
        <span className="text-2xl mb-1">{config.medal}</span>
        <p className={`text-white font-black ${config.textSize} text-center px-2 w-full truncate`}>
          {player.name}
        </p>
        <p className="text-white/70 font-bold text-xs mt-0.5">{player.score} pts</p>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPhase({ gameState, questions }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPlayers(setPlayers);
    return unsub;
  }, []);

  const topTen  = players.slice(0, 10);
  const isLast  = (gameState?.currentQuestionIndex ?? 0) >= (questions.length - 1);

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden relative
                    bg-gradient-to-b from-[#0f0a1e] via-[#160b2e] to-[#0a1628]">

      {/* Falling confetti */}
      {topTen.length > 0 && <Particles count={30} />}

      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                     bg-brand-600 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-black gradient-text tracking-tight">
            🏆 Leaderboard
          </h1>
          {isLast && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-brand-300 text-lg mt-1 font-semibold"
            >
              Final Results!
            </motion.p>
          )}
        </motion.div>

        {/* Podium — top 3 */}
        {topTen.length > 0 && (
          <div className="flex justify-center items-end gap-3 mb-8">
            {PODIUM_CONFIG.map((cfg, vi) => (
              <PodiumCard
                key={cfg.rankIdx}
                player={topTen[cfg.rankIdx]}
                config={cfg}
                delay={vi * 0.15 + 0.2}
              />
            ))}
          </div>
        )}

        {/* Ranks 4–10 */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 max-w-4xl mx-auto">
            <AnimatePresence>
              {topTen.slice(3).map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.07, type: 'spring', stiffness: 150 }}
                  className="flex items-center gap-3 glass rounded-xl px-4 py-3"
                >
                  {/* Rank badge */}
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center
                                  shrink-0">
                    <span className="text-white/60 font-black text-sm">{i + 4}</span>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600
                                  flex items-center justify-center text-xs font-black text-white shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>

                  <span className="flex-1 text-white font-bold truncate text-sm">{p.name}</span>

                  <span className="text-brand-300 font-black text-sm tabular-nums shrink-0">
                    {p.score}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {players.length === 0 && (
          <p className="text-center text-white/30 mt-8 text-lg">No players yet</p>
        )}
      </div>
    </div>
  );
}
