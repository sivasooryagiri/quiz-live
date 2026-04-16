/**
 * Falling confetti particles — fixed to viewport, rains down from top.
 * Honors prefers-reduced-motion: disabled entirely for users who opt out
 * of motion (also helps low-end projector PCs that can't keep up).
 */
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const EMOJIS = ['⭐', '🌟', '✨', '🎉', '🎊', '💫', '🏆', '👑', '🎈', '🥳'];

export default function Particles({ count = 35 }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Cap particle count for slower devices, half it on small viewports.
  const effectiveCount = useMemo(() => {
    if (reduced) return 0;
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return Math.min(count, 14);
    }
    return count;
  }, [count, reduced]);

  const particles = useMemo(
    () =>
      Array.from({ length: effectiveCount }, (_, i) => ({
        id: i,
        left:     `${Math.random() * 100}%`,
        delay:    Math.random() * 4,
        duration: 3 + Math.random() * 3,
        emoji:    EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        size:     18 + Math.random() * 18,
        rotate:   Math.random() > 0.5 ? 360 : -360,
      })),
    [effectiveCount]
  );

  if (effectiveCount === 0) return null;

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
