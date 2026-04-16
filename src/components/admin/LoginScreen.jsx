import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, 'admin@quizlive.internal', password);
      onLogin();
    } catch {
      setError('Incorrect password.');
      setPassword('');
    } finally {
      setBusy(false);
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
            disabled={busy}
            className="w-full py-3 rounded-xl font-black text-white
                       bg-gradient-to-r from-brand-600 to-purple-600
                       hover:from-brand-500 hover:to-purple-500 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Signing in…' : 'Login →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
