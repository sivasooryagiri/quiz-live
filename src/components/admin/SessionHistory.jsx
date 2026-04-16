import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToSessions } from '../../firebase/db';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function duration(start, end) {
  if (!start || !end) return null;
  const s = start.toDate ? start.toDate() : new Date(start.seconds * 1000);
  const e = end.toDate   ? end.toDate()   : new Date(end.seconds   * 1000);
  const mins = Math.round((e - s) / 60000);
  return `${mins} min`;
}

function downloadCSV(session) {
  const rows = [
    ['Rank', 'Name', 'Score'],
    ...session.players.map((p) => [p.rank, p.name, p.score]),
  ];
  const csv  = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${session.title}-${formatDate(session.endedAt)}.csv`.replace(/[^a-z0-9.\-]/gi, '_');
  a.click();
  URL.revokeObjectURL(url);
}

const MEDAL = ['🥇', '🥈', '🥉'];

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const top3 = session.players.slice(0, 3);
  const rest = session.players.slice(3);

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-white font-black text-base leading-none">{session.title}</p>
          <p className="text-white/30 text-xs mt-1">{formatDate(session.endedAt)}</p>
          {duration(session.startedAt, session.endedAt) && (
            <p className="text-white/20 text-xs">Duration: {duration(session.startedAt, session.endedAt)}</p>
          )}
        </div>
        <button
          onClick={() => downloadCSV(session)}
          className="text-xs text-white/30 hover:text-white/60 transition-colors glass
                     border border-white/10 rounded-lg px-3 py-1.5 shrink-0"
        >
          CSV
        </button>
      </div>

      {/* Top 3 */}
      <div className="flex gap-2">
        {top3.map((p, i) => (
          <div
            key={i}
            className="flex-1 glass-strong rounded-xl p-3 text-center"
          >
            <p className="text-lg">{MEDAL[i] ?? `#${p.rank}`}</p>
            <p className="text-white font-bold text-sm truncate mt-1">{p.name}</p>
            <p className="text-brand-300 text-xs font-bold">{p.score} pts</p>
          </div>
        ))}
        {top3.length === 0 && (
          <p className="text-white/20 text-xs">No players recorded</p>
        )}
      </div>

      {/* Show more */}
      {rest.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-semibold"
          >
            {expanded ? '▲ Show less' : `▼ Show all ${session.players.length} players`}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 pt-1">
                  {rest.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
                      <span className="text-white/30 text-xs font-black w-6 text-right shrink-0">
                        #{p.rank}
                      </span>
                      <span className="text-white text-sm flex-1 truncate">{p.name}</span>
                      <span className="text-brand-300 text-xs font-bold shrink-0">{p.score} pts</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const unsub = subscribeToSessions(setSessions);
    return unsub;
  }, []);

  return (
    <div className="space-y-4">
      {sessions.length === 0 && (
        <p className="text-center text-white/30 py-10 text-sm">
          No sessions yet. Sessions are saved automatically when a quiz ends.
        </p>
      )}
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} />
      ))}
    </div>
  );
}
