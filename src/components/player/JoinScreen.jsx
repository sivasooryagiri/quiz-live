import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JoinScreen({ onJoin, joining, error, suggested, onClearSuggested, gameTitle = 'QuizLive' }) {
  const [name, setName] = useState('');

  // When a suggestion comes in, pre-fill the input
  useEffect(() => {
    if (suggested) setName(suggested);
  }, [suggested]);

  const submit = (e) => {
    e.preventDefault();
    if (name.trim().length >= 2) onJoin(name);
  };

  const isTaken = error === 'name_taken';

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center px-6
                    bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
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
        {/* Logo */}
        <div className="text-center mb-5">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="mb-3"
          >
            <img src="/logo.svg" alt="QuizLive" className="w-14 h-14 mx-auto" />
          </motion.div>
          <h1 className="text-2xl font-black gradient-text">{gameTitle}</h1>
          <p className="text-brand-300 mt-1 text-sm">Enter your name to join</p>
        </div>

        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-300 mb-2 uppercase tracking-wider">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (suggested) onClearSuggested();
              }}
              placeholder="e.g. Alex 🚀"
              maxLength={20}
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                         placeholder-white/30 text-lg font-semibold focus:outline-none
                         focus:border-brand-400 focus:bg-white/15 transition-all"
            />
          </div>

          {/* Name taken notice */}
          <AnimatePresence>
            {isTaken && suggested && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass rounded-xl px-4 py-3 border border-amber-500/30"
              >
                <p className="text-amber-300 text-xs font-semibold">
                  That name is taken.
                </p>
                <p className="text-white/60 text-xs mt-0.5">
                  Joining as <span className="text-white font-bold">"{suggested}"</span> — edit above if you want a different name.
                </p>
              </motion.div>
            )}

            {/* Generic error */}
            {error && !isTaken && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400/80 text-xs"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

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
            ) : isTaken ? `Join as "${name}" →` : 'Join Game →'}
          </motion.button>
        </form>

        <p className="text-center text-white/20 text-xs mt-4">
          Min 2 characters · Max 20 characters
        </p>
      </motion.div>

      <a
        href="https://deadtechguy.fun"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-0 right-0 text-center text-white/20 text-xs hover:text-white/40 transition-colors"
      >
        Built by DeadTechGuy
      </a>
    </div>
  );
}
