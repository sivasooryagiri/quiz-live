/**
 * Particle burst effect for winner celebration.
 * Renders N colored dots that fly outward + fade.
 */
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const EMOJIS = ['⭐', '🌟', '✨', '🎉', '🎊', '💫', '🏆', '👑'];

export default function Particles({ count = 24 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (360 / count) * i + Math.random() * 20 - 10,
        distance: 120 + Math.random() * 80,
        size: 16 + Math.random() * 16,
        delay: Math.random() * 0.3,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x   = Math.cos(rad) * p.distance;
        const y   = Math.sin(rad) * p.distance;
        return (
          <motion.span
            key={p.id}
            className="absolute select-none"
            style={{ fontSize: p.size }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x, y, opacity: 0, scale: 1.5 }}
            transition={{
              duration: 1.4,
              delay: p.delay,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: 1.2,
            }}
          >
            {p.emoji}
          </motion.span>
        );
      })}
    </div>
  );
}
