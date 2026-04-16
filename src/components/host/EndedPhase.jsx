import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToPlayers } from '../../firebase/db';
import Particles from '../shared/Particles';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function EndedPhase() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPlayers(setPlayers);
    return unsub;
  }, []);

  const topThree = players.slice(0, 3);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 relative overflow-hidden
                    bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      <Particles count={40} />

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="relative z-10 text-center"
      >
        <div className="text-8xl mb-4">🏆</div>
        <h1 className="text-7xl font-black gradient-text mb-2">Quiz Over!</h1>
        <p className="text-brand-300 text-2xl mb-12">Thanks everyone for playing!</p>

        <div className="flex justify-center items-end gap-6">
          {[
            { p: topThree[1], rank: 1 }, // 2nd place left
            { p: topThree[0], rank: 0 }, // 1st place center
            { p: topThree[2], rank: 2 }, // 3rd place right
          ].map(({ p, rank }, vi) => {
            if (!p) return <div key={vi} className="w-44" />;
            const heights = ['h-36', 'h-52', 'h-28'];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: vi * 0.2 }}
                className={`w-44 ${heights[vi]} glass-strong rounded-t-2xl flex flex-col items-center justify-end pb-5`}
              >
                {rank === 0 && <span className="absolute -top-10 text-5xl">👑</span>}
                <span className="text-3xl">{MEDAL[rank]}</span>
                <p className="text-white font-black text-sm mt-1 truncate px-2">{p.name}</p>
                <p className="text-brand-300 font-bold text-xs">{p.score} pts</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
