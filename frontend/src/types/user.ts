export interface PublicUserProfile {
  id: string
  name: string | null
  displayName: string | null
  avatarUrl: string | null
  role: 'CLIENT' | 'FREELANCER' | 'ARBITER' | 'ADMIN'
  bio: string | null
  skills: string[]
  isVerified: boolean
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string | null
  role: 'CLIENT' | 'FREELANCER' | 'ARBITER' | 'ADMIN'
  createdAt: string
  displayName: string | null
  bio?: string | null
  skills?: string[]
}
