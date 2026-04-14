/**
 * Falling confetti particles — fixed to viewport, rains down from top.
 */
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const EMOJIS = ['⭐', '🌟', '✨', '🎉', '🎊', '💫', '🏆', '👑', '🎈', '🥳'];

export default function Particles({ count = 35 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left:     `${Math.random() * 100}%`,
        delay:    Math.random() * 4,
        duration: 3 + Math.random() * 3,
        emoji:    EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        size:     18 + Math.random() * 18,
        rotate:   Math.random() > 0.5 ? 360 : -360,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{ left: p.left, top: -40, fontSize: p.size }}
          animate={{ y: '110vh', rotate: p.rotate, opacity: [0, 1, 1, 0] }}
          transition={{
            duration:    p.duration,
            delay:       p.delay,
            repeat:      Infinity,
            repeatDelay: Math.random() * 2,
            ease:        'linear',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
