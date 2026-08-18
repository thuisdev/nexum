import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { User } from '@/types/user';
import { TOKEN_KEY } from '@/lib/constants';
import { getMe, loginApi, registerApi } from '@/lib/auth.api';
import { subscribeUnauthorized } from '@/lib/axiosInteceptor';
import { patchMe } from '@/lib/users.api';
import type { RegisterCredentials, LoginCredentials } from '@/types/api.types';
import type { UpdateProfileInput } from '@/lib/validation';
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
    const unsubscribe = subscribeUnauthorized(() => {
      setUser(null);
    });

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
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
    return unsubscribe;
  }, []);

  const isLoggedIn = !!user;

  const login = async (credentails: LoginCredentials) => {
    const data = await loginApi({
      email: credentails.email,
      password: credentails.password
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerApi({
      email: credentials.email,
      password: credentials.password,
      ...(credentials.name ? { name: credentials.name } : {}),
      ...(credentials.displayName ? { displayName: credentials.displayName } : {}),
      ...(credentials.role ? { role: credentials.role } : {}),
    });
    await login(credentials);
  };

  const update = async (credentials: UpdateProfileInput) => {
    const data = await patchMe(credentials);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, isLoggedIn, update }}
    >
      {children}
    </AuthContext.Provider>
  );
}
