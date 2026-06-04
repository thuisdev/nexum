import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { User } from '@/types/user';
import { TOKEN_KEY } from '@/lib/constants';
import { getMe, loginApi, registerApi } from '@/lib/auth.api';
import type { RegisterCredentials } from '@/types/api.types';
import { AuthContext } from '@/context/auth.context';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

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
        const res = await getMe();
        setUser(res.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const isLoggedIn = !!user;

  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
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

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, isLoggedIn }}
    >
      {children}
    </AuthContext.Provider>
  );
}
