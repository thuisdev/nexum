import type { User } from '@/types/user'
import type { ReactNode } from 'react'
import { createContext, useEffect, useState } from 'react'
import { TOKEN_KEY } from '@/lib/constants'
import { getMe } from '@/hooks/useApi'

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

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await getMe()
        setUser(response.data)
      } catch {
        logout()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async () => {

  }

  const register = async () => {

  }

  const logout = async () => {

  }


  // AuthContext
  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
