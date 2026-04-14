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
        </motion.div>
      </main>
    </div>
  );
}
