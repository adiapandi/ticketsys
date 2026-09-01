export function LoginIllustration() {
  return (
    <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-lg">
      {/* Blob background */}
      <path
        d="M400 40C450 70 480 130 470 190C460 250 420 290 370 320C320 350 250 360 190 340C130 320 80 270 60 210C40 150 60 80 110 45C160 10 230 5 290 10C350 15 350 10 400 40Z"
        className="fill-blue-50 dark:fill-slate-800"
      />

      {/* Card / browser mockup */}
      <rect x="140" y="40" width="260" height="200" rx="12" className="fill-white dark:fill-slate-700" stroke="#2563EB" strokeOpacity="0.15" />
      {/* Top bar dots */}
      <circle cx="160" cy="58" r="4" fill="#2563EB" fillOpacity="0.3" />
      <circle cx="174" cy="58" r="4" fill="#2563EB" fillOpacity="0.3" />
      <circle cx="188" cy="58" r="4" fill="#2563EB" fillOpacity="0.3" />
      {/* Address bar */}
      <rect x="160" y="70" width="220" height="14" rx="7" fill="#2563EB" fillOpacity="0.08" />

      {/* Sidebar boxes */}
      <rect x="160" y="98" width="60" height="60" rx="6" fill="#2563EB" />
      <rect x="160" y="164" width="28" height="28" rx="4" fill="#2563EB" fillOpacity="0.2" />
      <rect x="192" y="164" width="28" height="28" rx="4" fill="#2563EB" fillOpacity="0.2" />

      {/* Content lines (ticket list style) */}
      <circle cx="255" cy="108" r="14" fill="#2563EB" fillOpacity="0.15" />
      <path d="M249 108l4 4 8-8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="278" y="102" width="90" height="8" rx="4" fill="#94A3B8" fillOpacity="0.4" />
      <rect x="278" y="116" width="60" height="6" rx="3" fill="#94A3B8" fillOpacity="0.25" />

      <rect x="230" y="140" width="8" height="8" rx="2" fill="#22C55E" />
      <rect x="245" y="140" width="80" height="8" rx="4" fill="#94A3B8" fillOpacity="0.4" />

      <rect x="230" y="160" width="8" height="8" rx="2" fill="#F59E0B" />
      <rect x="245" y="160" width="70" height="8" rx="4" fill="#94A3B8" fillOpacity="0.4" />

      {/* Button */}
      <rect x="160" y="204" width="220" height="24" rx="12" fill="#2563EB" />
      <rect x="220" y="212" width="100" height="8" rx="4" fill="white" fillOpacity="0.8" />

      {/* Simple seated person */}
      <g transform="translate(80 250)">
        {/* Plant pot */}
        <rect x="-20" y="90" width="36" height="30" rx="4" fill="#1E3A8A" />
        <path d="M-14 90 Q-14 60 -20 40 M-2 90 Q-2 55 4 30 M10 90 Q10 60 18 45" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Legs */}
        <path d="M60 130 Q90 150 130 140 Q160 132 175 110" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" fill="none" className="dark:stroke-slate-500" />
        {/* Body */}
        <path d="M55 60 Q50 100 60 135" stroke="#2563EB" strokeWidth="30" strokeLinecap="round" fill="none" />
        {/* Head */}
        <circle cx="58" cy="35" r="22" fill="#FBCFB0" />
        {/* Hair */}
        <path d="M36 32 Q34 10 58 8 Q84 8 82 32 Q82 20 58 18 Q40 18 36 32Z" fill="#1E293B" className="dark:fill-slate-900" />
        {/* Laptop */}
        <rect x="95" y="95" width="70" height="46" rx="4" fill="#1E293B" className="dark:fill-slate-600" />
        <rect x="99" y="99" width="62" height="34" rx="2" fill="#2563EB" fillOpacity="0.2" />
        <rect x="90" y="141" width="80" height="6" rx="3" fill="#1E293B" className="dark:fill-slate-600" />
      </g>

      {/* Floating ticket icon */}
      <g transform="translate(370 260)">
        <rect x="0" y="0" width="70" height="44" rx="8" fill="white" className="dark:fill-slate-700" stroke="#2563EB" strokeOpacity="0.2" />
        <circle cx="0" cy="22" r="6" fill="#F8FAFC" className="dark:fill-slate-900" />
        <circle cx="70" cy="22" r="6" fill="#F8FAFC" className="dark:fill-slate-900" />
        <line x1="14" y1="8" x2="14" y2="36" stroke="#2563EB" strokeOpacity="0.2" strokeDasharray="3 3" />
        <path d="M22 22l5 5 10-10" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="42" y="16" width="20" height="5" rx="2.5" fill="#94A3B8" fillOpacity="0.5" />
        <rect x="42" y="25" width="14" height="5" rx="2.5" fill="#94A3B8" fillOpacity="0.3" />
      </g>
    </svg>
  );
}
