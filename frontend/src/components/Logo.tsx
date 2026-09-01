export function Logo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bentuk tiket dengan lekukan di kiri-kanan */}
        <path
          d="M4 16C4 13.7909 5.79086 12 8 12H40C42.2091 12 44 13.7909 44 16V20C41.7909 20 40 21.7909 40 24C40 26.2091 41.7909 28 44 28V32C44 34.2091 42.2091 36 40 36H8C5.79086 36 4 34.2091 4 32V28C6.20914 28 8 26.2091 8 24C8 21.7909 6.20914 20 4 20V16Z"
          fill="#2563EB"
        />
        {/* Garis putus-putus tengah (sobekan tiket) */}
        <line x1="24" y1="14" x2="24" y2="34" stroke="white" strokeWidth="2" strokeDasharray="3 3" strokeOpacity="0.5" />
        {/* Checkmark */}
        <path
          d="M13 24L16.5 27.5L23 20"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          <span className="text-blue-600 dark:text-blue-400">i</span>Tix
        </span>
      )}
    </div>
  );
}
