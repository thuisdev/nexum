import type { ReactNode } from 'react'

type AuthProviderProps = {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  // AuthContext
  return <>{children}</>
}

export default AuthProvider
