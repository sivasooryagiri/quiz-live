/**
 * Circular SVG countdown timer.
 * Props: timeLeft (float), totalTime (int), size (px)
 */
import { useMemo } from 'react';

export default function Timer({ timeLeft, totalTime, size = 120 }) {
  const radius     = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress   = Math.max(0, timeLeft / totalTime);
  const dashOffset = circumference * (1 - progress);

  const color = useMemo(() => {
    if (progress > 0.5) return '#8b5cf6';
    if (progress > 0.25) return '#f59e0b';
    return '#ef4444';
  }, [progress]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={8}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
      </svg>
      {/* Center number */}
      <span
        className="absolute text-3xl font-black tabular-nums"
        style={{ color, transition: 'color 0.3s ease' }}
      >
        {Math.ceil(timeLeft)}
      </span>
    </div>
  );
}
