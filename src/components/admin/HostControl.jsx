import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { updateGameState } from '../../firebase/db';

export default function HostControl({ gameState }) {
  const [title,    setTitle]    = useState(gameState?.title   ?? 'QuizLive');
  const [joinUrl,  setJoinUrl]  = useState(gameState?.joinUrl ?? window.location.origin);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [copied,   setCopied]   = useState(false);

  const isQuestioning = gameState?.phase === 'question';
  const showQR        = gameState?.showQR ?? false;

  // QR preview must reflect the SAVED url, not the unsaved input — otherwise
  // admins type a new URL, see the QR update, and assume it's already live.
  const savedJoinUrl = gameState?.joinUrl || window.location.origin;
  const dirty        = joinUrl !== savedJoinUrl || title !== (gameState?.title ?? 'QuizLive');

  const copyUrl = () => {
    navigator.clipboard.writeText(savedJoinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleQR = () => {
    if (isQuestioning) return;
    updateGameState({ showQR: !showQR });
  };

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

      {/* QR toggle */}
      <div className={`glass rounded-2xl p-4 flex items-center justify-between
                       ${isQuestioning ? 'opacity-50' : ''}`}>
        <div>
          <p className="text-white text-sm font-semibold">Show QR on presentation</p>
          <p className="text-white/30 text-xs mt-0.5">
            {isQuestioning ? 'Disabled during question' : showQR ? 'QR visible on host screen' : 'QR hidden'}
          </p>
        </div>
        <button
          onClick={toggleQR}
          disabled={isQuestioning}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200
                      ${showQR && !isQuestioning ? 'bg-brand-500' : 'bg-white/20'}
                      disabled:cursor-not-allowed`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                            ${showQR && !isQuestioning ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

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
        <div className="self-start flex items-center gap-2">
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">QR Preview</p>
          {dirty && (
            <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded px-1.5 py-0.5 font-bold">
              Unsaved — click Save Settings
            </span>
          )}
        </div>
        <div className="glass-strong rounded-2xl p-4">
          <QRCodeSVG
            value={savedJoinUrl}
            size={160}
            bgColor="transparent"
            fgColor="#ffffff"
            level="M"
          />
        </div>
        <p className="text-brand-300 text-sm font-medium">{savedJoinUrl}</p>
        <button
          onClick={copyUrl}
          className="w-full py-2 rounded-xl glass border border-white/10 text-xs font-semibold
                     text-white/50 hover:text-white hover:border-white/20 transition-all"
        >
          {copied ? '✓ Copied!' : 'Copy Join URL'}
        </button>
      </div>
    </div>
  );
}
