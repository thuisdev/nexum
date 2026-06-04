import { createContext } from 'react';
import type { User } from '@/types/user';
import type { RegisterCredentials } from '@/types/api.types';

export type AuthContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
