import type { User } from '@/types/user';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { TOKEN_KEY } from '@/lib/constants';
import { getMe, loginApi, registerApi } from '@/hooks/useApi';

type AuthProviderProps = {
  children: ReactNode
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
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
        setUser(null)
      } finally {
        setLoading(false)
      }
    };

    initAuth()
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password});
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user);
  };

  const register = async (email: string, password: string) => {
    await registerApi({email, password, name: '', role: 'CLIENT'});
    await login(email, password);
  };


  // AuthContext
  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
