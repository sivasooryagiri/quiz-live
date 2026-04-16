export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1e] via-[#1a0a2e] to-[#0a1628] flex items-center justify-center px-6">
      <div className="max-w-lg w-full space-y-6 py-12">
        <button
          onClick={() => window.close()}
          className="text-white/30 hover:text-white/60 transition-colors text-sm"
        >
          ← Close
        </button>

        {/* Builder */}
        <div className="flex items-center gap-4">
          <a href="https://deadtechguy.fun" target="_blank" rel="noopener noreferrer">
            <img
              src="/builder.jpg"
              alt="SivaSoorya G.R"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
            />
          </a>
          <div>
            <p className="text-white font-bold text-lg leading-none">SivaSoorya G.R</p>
            <a
              href="https://deadtechguy.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              deadtechguy.fun
            </a>
          </div>
        </div>

        {/* About builder */}
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Builder</p>
          <p className="text-white/60 text-sm leading-relaxed">
            ML/DL creator and co-founder of Soluto. Builds and experiments in public — technical deep dives,
            real-time systems, and tools that actually get used. Also has a Linux penguin plushie on his desk.
          </p>
        </div>

        {/* Why open source */}
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Why This Is Open Source</p>
          <p className="text-white/60 text-sm leading-relaxed">
            Every decent quiz tool either has a paywall, a user limit, or some vendor deciding what features
            you get. This exists to fix that. Run it on your laptop, share it on your office network, or
            deploy it to the cloud — the hosting is yours and so is the control.
          </p>
        </div>

        {/* What's better */}
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-2">What We Did Better</p>
          <p className="text-white/60 text-sm leading-relaxed">
            Cleaner UI that works for any audience. No account creation for players — just scan and join.
            Self-hostable on a private IP so you can run it completely offline. Timer-based scoring that
            rewards speed. Free tier Firebase handles up to 100 simultaneous players at zero cost.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-6 pt-2">
          <a
            href="https://github.com/sivasooryagiri/quizlive"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 text-sm hover:text-white/70 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://deadtechguy.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 text-sm hover:text-white/70 transition-colors"
          >
            deadtechguy.fun
          </a>
        </div>

      </div>
    </div>
  );
}
