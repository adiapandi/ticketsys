export function LoginIllustration() {
  return (
    <div className="relative w-full max-w-lg" style={{ aspectRatio: '500 / 420' }}>
      <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        {/* Blob background */}
        <path
          d="M400 40C450 70 480 130 470 190C460 250 420 290 370 320C320 350 250 360 190 340C130 320 80 270 60 210C40 150 60 80 110 45C160 10 230 5 290 10C350 15 350 10 400 40Z"
          className="fill-blue-50 dark:fill-slate-800"
        />

        {/* Card / browser mockup */}
        <rect x="140" y="40" width="260" height="200" rx="12" className="fill-white dark:fill-slate-700" stroke="#2563EB" strokeOpacity="0.15" />
        <circle cx="160" cy="58" r="4" fill="#2563EB" fillOpacity="0.3" />
        <circle cx="174" cy="58" r="4" fill="#2563EB" fillOpacity="0.3" />
        <circle cx="188" cy="58" r="4" fill="#2563EB" fillOpacity="0.3" />
        <rect x="160" y="70" width="220" height="14" rx="7" fill="#2563EB" fillOpacity="0.08" />

        <rect x="160" y="98" width="60" height="60" rx="6" fill="#2563EB" />
        <rect x="160" y="164" width="28" height="28" rx="4" fill="#2563EB" fillOpacity="0.2" />
        <rect x="192" y="164" width="28" height="28" rx="4" fill="#2563EB" fillOpacity="0.2" />

        <circle cx="255" cy="108" r="14" fill="#2563EB" fillOpacity="0.15" />
        <path d="M249 108l4 4 8-8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="278" y="102" width="90" height="8" rx="4" fill="#94A3B8" fillOpacity="0.4" />
        <rect x="278" y="116" width="60" height="6" rx="3" fill="#94A3B8" fillOpacity="0.25" />

        <rect x="230" y="140" width="8" height="8" rx="2" fill="#22C55E" />
        <rect x="245" y="140" width="80" height="8" rx="4" fill="#94A3B8" fillOpacity="0.4" />

        <rect x="230" y="160" width="8" height="8" rx="2" fill="#F59E0B" />
        <rect x="245" y="160" width="70" height="8" rx="4" fill="#94A3B8" fillOpacity="0.4" />

        <rect x="160" y="204" width="220" height="24" rx="12" fill="#2563EB" />
        <rect x="220" y="212" width="100" height="8" rx="4" fill="white" fillOpacity="0.8" />

        {/* Tanaman */}
        <g transform="translate(50 260)">
          <rect x="8" y="110" width="46" height="36" rx="7" fill="#1E3A8A" />
          <rect x="8" y="108" width="46" height="8" rx="4" fill="#1E40AF" />
          <path d="M31 108 Q31 70 20 45" stroke="#22C55E" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M31 108 Q31 65 31 35" stroke="#16A34A" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M31 108 Q31 72 45 50" stroke="#22C55E" strokeWidth="7" strokeLinecap="round" fill="none" />
        </g>

        {/* Kartu ticket melayang */}
        <g transform="translate(355 265)">
          <rect x="0" y="0" width="70" height="44" rx="8" fill="white" className="dark:fill-slate-700" stroke="#2563EB" strokeOpacity="0.2" />
          <circle cx="0" cy="22" r="6" fill="#F8FAFC" className="dark:fill-slate-900" />
          <circle cx="70" cy="22" r="6" fill="#F8FAFC" className="dark:fill-slate-900" />
          <line x1="14" y1="8" x2="14" y2="36" stroke="#2563EB" strokeOpacity="0.2" strokeDasharray="3 3" />
          <path d="M22 22l5 5 10-10" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="42" y="16" width="20" height="5" rx="2.5" fill="#94A3B8" fillOpacity="0.5" />
          <rect x="42" y="25" width="14" height="5" rx="2.5" fill="#94A3B8" fillOpacity="0.3" />
        </g>
      </svg>

      {/* Ilustrasi orang - gambar hasil download, ditumpuk di posisi bawah-tengah */}
      <img
        src="/login-illustration.svg"
        alt="Illustration"
        className="absolute"
        style={{ left: '10%', top: '52%', width: '55%', height: 'auto' }}
      />
    </div>
  );
}
