import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameState    from '../hooks/useGameState';
import { subscribeToQuestions, subscribeToPlayers } from '../firebase/db';
import LoginScreen     from '../components/admin/LoginScreen';
import QuestionEditor  from '../components/admin/QuestionEditor';
import GameControl     from '../components/admin/GameControl';
import HostControl     from '../components/admin/HostControl';
import LoadingSpinner  from '../components/shared/LoadingSpinner';

const TABS = [
  { id: 'questions', label: '📝 Questions' },
  { id: 'game',      label: '🎮 Game Control' },
  { id: 'host',      label: '🖥 Host / QR' },
  { id: 'about',     label: '👤 About' },
];

export default function AdminPage() {
  const [authed, setAuthed]       = useState(() => sessionStorage.getItem('ql_admin') === '1');
  const [tab,    setTab]          = useState('game');
  const [questions, setQuestions] = useState([]);
  const [players,   setPlayers]   = useState([]);
  const { gameState, loading }    = useGameState();

  useEffect(() => {
    if (!authed) return;
    const u1 = subscribeToQuestions(setQuestions);
    const u2 = subscribeToPlayers(setPlayers);
    return () => { u1(); u2(); };
  }, [authed]);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  if (loading)  return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Header */}
      <header className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h1 className="font-black text-white leading-none">Admin Panel</h1>
            <p className="text-brand-300 text-xs">{gameState?.title ?? 'QuizLive'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-3 py-1.5 text-xs text-white/60">
            {players.length} player{players.length !== 1 ? 's' : ''} · {questions.length} Q
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('ql_admin'); setAuthed(false); }}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-[65px] z-30 glass border-b border-white/10 px-4 flex gap-1 py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${tab === t.id
                ? 'bg-brand-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <main className="p-4 max-w-2xl mx-auto pb-16">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'questions' && (
            <QuestionEditor questions={questions} />
          )}
          {tab === 'game' && (
            <GameControl gameState={gameState} questions={questions} />
          )}
          {tab === 'host' && (
            <HostControl gameState={gameState} />
          )}
          {tab === 'about' && (
            <div className="space-y-4">
              {/* Builder card */}
              <div className="glass-strong rounded-2xl p-6">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-4">The Builder</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-purple-600
                                  flex items-center justify-center text-2xl shrink-0 shadow-lg">
                    🧑‍💻
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-none">deadtechguy</p>
                    <a
                      href="https://deadtechguy.fun"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-300 text-sm hover:text-brand-200 transition-colors"
                    >
                      deadtechguy.fun ↗
                    </a>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  Used Claude for help — nahh, he did the work. I just lived, paved his path and made it clean.
                </p>
              </div>

              {/* Project story */}
              <div className="glass rounded-2xl p-6">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Why This Exists</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  A friend told me she couldn't find an interactive quiz app that was free and actually usable —
                  something like Slido or Kahoot but without the paywall. So I built this for fun.
                </p>
                <p className="text-white/70 text-sm leading-relaxed mt-3">
                  It's free, open source, and fully in your control — run it on localhost, share on a private IP
                  inside your network, or host it publicly on the cloud. No forced subscriptions, no vendor lock-in.
                  Anyone can set it up for a public quiz in minutes.
                </p>
              </div>

              {/* What it is */}
              <div className="glass rounded-2xl p-6">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">What It Is</p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Real-time multiplayer quiz — works like Kahoot / Slido</li>
                  <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> 100% free and open source</li>
                  <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Self-hostable: localhost, private network, or public cloud</li>
                  <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Clean UI — simple enough for any audience</li>
                  <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Quick to set up — no unnecessary complexity</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
