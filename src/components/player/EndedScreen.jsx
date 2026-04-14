import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToPlayers } from '../../firebase/db';
import Particles from '../shared/Particles';
import { PoweredBySoluto } from '../shared/SolutoBrand';

export default function EndedScreen({ playerId, playerName }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPlayers(setPlayers);
    return unsub;
  }, []);

  const myRank  = players.findIndex((p) => p.id === playerId) + 1;
  const myScore = players.find((p) => p.id === playerId)?.score ?? 0;
  const isWinner = myRank === 1 && players.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {isWinner && <Particles count={30} />}

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="glass rounded-2xl p-8 text-center max-w-xs w-full"
      >
        <div className="text-6xl mb-4">
          {isWinner ? '🏆' : myRank <= 3 ? '🎉' : '👏'}
        </div>
        <h2 className="text-2xl font-black gradient-text mb-1">Quiz Over!</h2>
        <p className="text-white/50 text-sm mb-6">Thanks for playing, {playerName}!</p>

        <div className="space-y-3">
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-brand-300 uppercase tracking-wider">Final Rank</p>
            <p className="text-3xl font-black text-white">#{myRank || '—'}</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-brand-300 uppercase tracking-wider">Total Score</p>
            <p className="text-3xl font-black gradient-text">{myScore}</p>
          </div>
        </div>

        {isWinner && (
          <motion.p
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mt-4 text-yellow-300 font-black text-lg"
          >
            👑 You won!
          </motion.p>
        )}
      </motion.div>
      <PoweredBySoluto />
    </div>
  );
}
