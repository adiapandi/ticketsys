export function LoginIllustration() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Blob background di belakang ilustrasi */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-full h-full bg-blue-50 dark:bg-slate-800 rounded-[40%_60%_60%_40%/50%_40%_60%_50%]" />
      </div>
      <img
        src="/login-illustration.svg"
        alt="Illustration"
        className="w-full h-auto relative z-10"
      />
    </div>
  );
}
