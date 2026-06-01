import type { User } from '@/types/user'
import type { ReactNode } from 'react'
import { createContext, useState } from 'react'

type AuthProviderProps = {
  children: ReactNode
}

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setLoading] = useState(true)




  // AuthContext
  return <>{children}</>
}

export default AuthProvider
