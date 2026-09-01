export function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Blob gradient kiri atas */}
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-blue-300/40 dark:bg-blue-500/10 rounded-full blur-[100px]" />

      {/* Blob gradient kanan bawah */}
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-indigo-300/40 dark:bg-indigo-500/10 rounded-full blur-[100px]" />

      {/* Blob gradient tengah atas, halus */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-sky-200/30 dark:bg-sky-500/5 rounded-full blur-[100px]" />
    </div>
  );
}
