import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { subscribeToPlayerCount } from '../../firebase/db';
import { SolutoHostBar } from '../shared/SolutoBrand';

export default function WaitingScreen({ gameState }) {
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToPlayerCount(setPlayerCount);
    return unsub;
  }, []);

  const joinUrl = gameState?.joinUrl || window.location.origin;
  const title   = gameState?.title   || 'QuizLive';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden
                    bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-700 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-800 rounded-full blur-3xl"
        />
      </div>

      {/* Player count badge */}
      <motion.div
        key={playerCount}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute top-8 right-8 glass rounded-2xl px-6 py-3 text-center"
      >
        <p className="text-brand-300 text-sm font-semibold uppercase tracking-wider">Players</p>
        <p className="text-5xl font-black text-white">{playerCount}</p>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-7xl font-black gradient-text leading-none">{title}</h1>
          <p className="text-brand-300 text-2xl mt-3 font-medium">Join Now!</p>
        </motion.div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-6 glow-box"
        >
          <QRCodeSVG
            value={joinUrl}
            size={240}
            bgColor="transparent"
            fgColor="#ffffff"
            level="M"
          />
        </motion.div>

        {/* URL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Scan QR or visit</p>
          <p className="text-brand-300 text-2xl font-bold">{joinUrl.replace(/^https?:\/\//, '')}</p>
        </motion.div>

        {/* Animated dots */}
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className="w-3 h-3 rounded-full bg-brand-400"
            />
          ))}
        </div>
      </div>
      <div className="relative z-10 w-full">
        <SolutoHostBar />
      </div>
    </div>
  );
}
