import { createContext } from 'react';
import type { User } from '@/types/user';
import type { LoginCredentials, RegisterCredentials } from '@/types/api.types';
import type { UpdateProfileInput } from '@/lib/validation';

export type AuthContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  update: (credentials: UpdateProfileInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
