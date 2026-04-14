import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { updateGameState } from '../../firebase/db';

export default function HostControl({ gameState }) {
  const [title,    setTitle]    = useState(gameState?.title   ?? 'QuizLive');
  const [joinUrl,  setJoinUrl]  = useState(gameState?.joinUrl ?? window.location.origin);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateGameState({ title, joinUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const openHost = () => window.open('/host', '_blank', 'noopener');

  return (
    <div className="space-y-4">
      {/* Open host screen */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={openHost}
        className="w-full py-4 rounded-xl font-black text-lg text-white
                   bg-gradient-to-r from-brand-600 to-purple-600
                   hover:from-brand-500 hover:to-purple-500 transition-all
                   shadow-lg shadow-brand-900/50 flex items-center justify-center gap-3"
      >
        🖥 Open Host Screen (Projector)
      </motion.button>
      <p className="text-center text-white/30 text-xs">Opens /host in a new tab — show this on the projector</p>

      {/* Settings */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Game Settings</p>

        <div>
          <label className="label">Game Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="QuizLive"
          />
        </div>

        <div>
          <label className="label">Player Join URL (used for QR code)</label>
          <input
            type="text"
            value={joinUrl}
            onChange={(e) => setJoinUrl(e.target.value)}
            className="input font-mono text-sm"
            placeholder="https://your-app.vercel.app"
          />
          <p className="text-white/30 text-xs mt-1">
            Set to your production URL before the event
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* QR Preview */}
      <div className="glass rounded-2xl p-5 flex flex-col items-center gap-4">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold self-start">QR Preview</p>
        <div className="glass-strong rounded-2xl p-4">
          <QRCodeSVG
            value={joinUrl || window.location.origin}
            size={160}
            bgColor="transparent"
            fgColor="#ffffff"
            level="M"
          />
        </div>
        <p className="text-brand-300 text-sm font-medium">{joinUrl}</p>
      </div>
    </div>
  );
}
