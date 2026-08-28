import { getAvatarUrl, getInitials } from '../utils/avatar';

export function Avatar({ name, avatarUrl, size = 32 }: { name: string; avatarUrl?: string | null; size?: number }) {
  const fullUrl = getAvatarUrl(avatarUrl);

  if (fullUrl) {
    return (
      <img
        src={fullUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover border border-slate-200"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0"
    >
      {getInitials(name)}
    </div>
  );
}
