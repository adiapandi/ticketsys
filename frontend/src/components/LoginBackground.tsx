export function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern halus */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Blob gradient kiri atas */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-3xl" />

      {/* Blob gradient kanan bawah */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-500/20 rounded-full blur-3xl" />

      {/* Blob gradient tengah, lebih kecil dan subtle */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl" />

      {/* Fade ke warna background di tepi supaya blob gak terlalu tajam */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-slate-900" />
    </div>
  );
}
