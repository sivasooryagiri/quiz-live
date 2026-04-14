import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const submit = (e) => {
    e.preventDefault();
    const expected = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === expected) {
      sessionStorage.setItem('ql_admin', '1');
      onLogin();
    } else {
      setError('Incorrect password.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <span className="text-5xl">🔐</span>
          <h1 className="text-2xl font-black gradient-text mt-3">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Enter your admin password</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                       text-white placeholder-white/30 focus:outline-none focus:border-brand-400
                       focus:bg-white/15 transition-all"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-black text-white
                       bg-gradient-to-r from-brand-600 to-purple-600
                       hover:from-brand-500 hover:to-purple-500 transition-all"
          >
            Login →
          </button>
        </form>
      </motion.div>
    </div>
  );
}
