import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../api/client';
import { saveAuth, getStoredUser, clearAuth, updateStoredUser } from '../utils/authStorage';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string, remember: boolean = true) {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveAuth(data.accessToken, data.user, remember);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }

  async function register(email: string, password: string, name: string) {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password, name });
      saveAuth(data.accessToken, data.user, true);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  function updateUser(data: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      updateStoredUser(data);
      return updated;
    });
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
