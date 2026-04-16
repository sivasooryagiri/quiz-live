export default function ErrorScreen({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6
                    bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628]">
      <div className="glass rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-xl font-black text-white">Connection problem</h1>
        <p className="text-white/50 text-sm break-words">{message}</p>
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="w-full py-3 rounded-xl font-bold text-white
                     bg-gradient-to-r from-brand-600 to-purple-600
                     hover:from-brand-500 hover:to-purple-500 transition-all"
        >
          Reload
        </button>
        <p className="text-white/30 text-xs">
          If this keeps happening, the host's Firebase quota may be exhausted or rules may be misconfigured.
        </p>
      </div>
    </div>
  );
}
