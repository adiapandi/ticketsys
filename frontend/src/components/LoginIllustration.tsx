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
      <g transform="translate(58 255)">
        <rect x="8" y="110" width="46" height="36" rx="7" fill="#1E3A8A" />
        <rect x="8" y="108" width="46" height="8" rx="4" fill="#1E40AF" />
        <path d="M31 108 Q31 70 20 45" stroke="#22C55E" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M31 108 Q31 65 31 35" stroke="#16A34A" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M31 108 Q31 72 45 50" stroke="#22C55E" strokeWidth="7" strokeLinecap="round" fill="none" />
      </g>

      {/* Orang duduk bersila dengan laptop - versi lebih detail */}
      <g transform="translate(120 250)">
        {/* Rambut belakang, mengalir sampai bahu */}
        <path
          d="M50 12 C40 22 34 42 38 68 C40 84 46 95 53 100 L61 100
             C57 90 55 74 55 58 C55 38 59 22 67 12 Z"
          fill="#1E293B"
          className="dark:fill-slate-900"
        />
        <path
          d="M110 12 C120 22 126 42 122 68 C120 84 114 95 107 100 L99 100
             C103 90 105 74 105 58 C105 38 101 22 93 12 Z"
          fill="#1E293B"
          className="dark:fill-slate-900"
        />

        {/* Kaki bersila */}
        <path
          d="M18 140 Q8 165 45 168 L150 168 Q190 165 175 138
             Q170 125 150 122 L45 122 Q25 125 18 140 Z"
          fill="#1E293B"
          className="dark:fill-slate-600"
        />

        {/* Sepatu */}
        <ellipse cx="30" cy="150" rx="17" ry="10" fill="#2563EB" />
        <rect x="17" y="148" width="26" height="5" rx="2.5" fill="white" fillOpacity="0.7" />
        <ellipse cx="165" cy="148" rx="17" ry="10" fill="#2563EB" />
        <rect x="152" y="146" width="26" height="5" rx="2.5" fill="white" fillOpacity="0.7" />

        {/* Lengan */}
        <path d="M42 60 Q26 84 36 114" stroke="#2563EB" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M118 60 Q134 84 124 114" stroke="#2563EB" strokeWidth="15" strokeLinecap="round" fill="none" />

        {/* Badan / baju */}
        <rect x="38" y="47" width="84" height="72" rx="30" fill="#2563EB" />
        {/* Kerah */}
        <path d="M66 47 Q80 60 94 47" stroke="#1D4ED8" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Leher */}
        <rect x="70" y="22" width="20" height="18" rx="8" fill="#FBCFB0" />

        {/* Kepala */}
        <circle cx="80" cy="12" r="24" fill="#FBCFB0" />

        {/* Rambut atas */}
        <path
          d="M52 14 Q50 -16 80 -16 Q110 -16 108 14
             Q108 -2 96 -6 Q88 -10 80 -9 Q72 -10 64 -6
             Q52 -2 52 14 Z"
          fill="#1E293B"
          className="dark:fill-slate-900"
        />

        {/* Wajah: mata + senyum */}
        <circle cx="72" cy="12" r="1.8" fill="#1E293B" className="dark:fill-slate-900" />
        <circle cx="88" cy="12" r="1.8" fill="#1E293B" className="dark:fill-slate-900" />
        <path d="M73 20 Q80 24 87 20" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" className="dark:stroke-slate-900" />

        {/* Laptop */}
        <rect x="28" y="97" width="104" height="14" rx="3" fill="#1E293B" className="dark:fill-slate-600" />
        <rect x="32" y="52" width="96" height="52" rx="5" fill="#1E293B" className="dark:fill-slate-600" />
        <rect x="38" y="58" width="84" height="40" rx="2" fill="#2563EB" fillOpacity="0.25" />

        {/* Tangan di atas laptop */}
        <circle cx="36" cy="117" r="8" fill="#FBCFB0" />
        <circle cx="124" cy="117" r="8" fill="#FBCFB0" />
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
  );
}
