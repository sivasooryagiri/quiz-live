import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToPlayerCount } from '../../firebase/db';

export default function LobbyScreen({ playerName, gameTitle = 'QuizLive' }) {
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToPlayerCount(setPlayerCount);
    return unsub;
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brand-800/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-sm w-full"
      >
        {/* Animated waiting indicator */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center"
        >
          <span className="text-4xl">⏳</span>
        </motion.div>

        <h1 className="text-3xl font-black gradient-text mb-2">{gameTitle}</h1>

        <div className="glass rounded-2xl p-6 mt-6 space-y-4">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Joined as</p>
            <p className="text-2xl font-black text-white mt-1">{playerName}</p>
          </div>

          <div className="h-px bg-white/10" />

          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Players in lobby</p>
            <motion.p
              key={playerCount}
              initial={{ scale: 1.3, color: '#a78bfa' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-4xl font-black mt-1"
            >
              {playerCount}
            </motion.p>
          </div>

          <div className="h-px bg-white/10" />

          <div className="flex items-center justify-center gap-2 text-brand-300">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            <span className="text-sm font-medium">Waiting for host to start…</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
