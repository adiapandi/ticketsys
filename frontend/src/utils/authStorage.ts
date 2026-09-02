const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export function saveAuth(token: string, user: unknown, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  // Bersihkan storage lainnya biar gak ada data nyangkut dobel
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function updateStoredUser(data: Record<string, unknown>) {
  const remembered = !!localStorage.getItem(USER_KEY);
  const storage = remembered ? localStorage : sessionStorage;
  const current = getStoredUser<Record<string, unknown>>() || {};
  const updated = { ...current, ...data };
  storage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}
