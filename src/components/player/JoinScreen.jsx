import { useState } from 'react';
import { motion } from 'framer-motion';

export default function JoinScreen({ onJoin, joining, error, gameTitle = 'QuizLive' }) {
  const [name, setName] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (name.trim().length >= 2) onJoin(name);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo / title */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl mb-4"
          >
            🧠
          </motion.div>
          <h1 className="text-3xl font-black gradient-text">{gameTitle}</h1>
          <p className="text-brand-300 mt-2 text-sm">Enter your name to join</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-300 mb-2 uppercase tracking-wider">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex 🚀"
              maxLength={20}
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                         placeholder-white/30 text-lg font-semibold focus:outline-none
                         focus:border-brand-400 focus:bg-white/15 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400/80 text-xs">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={joining || name.trim().length < 2}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-xl font-black text-lg text-white
                       bg-gradient-to-r from-brand-600 to-purple-600
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:from-brand-500 hover:to-purple-500
                       transition-all shadow-lg shadow-brand-900/50"
          >
            {joining ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Joining…
              </span>
            ) : (
              'Join Game →'
            )}
          </motion.button>
        </form>

        <p className="text-center text-white/20 text-xs mt-4">
          Min 2 characters · Max 20 characters
        </p>
      </motion.div>
    </div>
  );
}
