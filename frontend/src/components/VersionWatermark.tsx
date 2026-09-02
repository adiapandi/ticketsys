const APP_VERSION = '1.6.0';

export function VersionWatermark() {
  const year = new Date().getFullYear();
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      v{APP_VERSION} · © {year} iTix
    </div>
  );
}
