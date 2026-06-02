import type { User } from '@/types/user';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { TOKEN_KEY } from '@/lib/constants';
import { getMe, loginApi, registerApi } from '@/lib/auth.api';
import type { RegisterCredentials } from '@/types/api.types';

type AuthProviderProps = {
  children: ReactNode
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}


export const AuthContext = createContext<AuthContextValue | null>(null)

// Auth Provider
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setLoading] = useState(true)

  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getMe()
        setUser(res.data)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    };

    initAuth()
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerApi({
      email: credentials.email,
      password: credentials.password,
      ...(credentials.name ? { name: credentials.name } : {}),
      ...(credentials.role ? { role: credentials.role } : {}),
    });
    await login(credentials.email, credentials.password);
  };

  // AuthContext
  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
