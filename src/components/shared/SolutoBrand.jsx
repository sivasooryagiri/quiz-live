// Soluto branding components — used on every page

/** The Soluto logo: white text + blue dot */
export function SolutoLogo({ size = 'md' }) {
  const cfg = {
    xs: { text: 'text-base',  dot: 'w-2 h-2'   },
    sm: { text: 'text-xl',    dot: 'w-2.5 h-2.5' },
    md: { text: 'text-3xl',   dot: 'w-3.5 h-3.5' },
    lg: { text: 'text-5xl',   dot: 'w-5 h-5'   },
    xl: { text: 'text-7xl',   dot: 'w-7 h-7'   },
  }[size];

  return (
    <a
      href="https://soluto.in"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-1 no-underline"
    >
      <span className={`${cfg.text} font-bold text-white tracking-tight leading-none`}>
        Soluto
      </span>
      <span
        className={`${cfg.dot} rounded-full bg-blue-500 shrink-0 self-end mb-[0.15em]`}
      />
    </a>
  );
}

/** Small footer bar — for player phone screens */
export function PoweredBySoluto() {
  return (
    <div className="w-full flex items-center justify-center gap-2 py-3 mt-auto">
      <span className="text-white/30 text-xs font-medium">Powered by</span>
      <SolutoLogo size="xs" />
    </div>
  );
}

/** Prominent bar — for host/projector screens */
export function SolutoHostBar({ tagline = false }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-3 mt-4 border-t border-white/10">
      <div className="flex items-center gap-3">
        <span className="text-white/40 text-sm font-medium">Powered by</span>
        <SolutoLogo size="md" />
      </div>
      {tagline && (
        <p className="text-white/30 text-sm mt-1 font-medium">
          soluto.in — your complete tech business solution
        </p>
      )}
    </div>
  );
}
