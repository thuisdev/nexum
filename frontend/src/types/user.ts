export interface PublicUserProfile {
  id: string
  displayName: string | null
  avatarUrl: string | null
  avatarColor: string | null
  role: 'CLIENT' | 'FREELANCER' | 'ARBITER' | 'ADMIN'
  bio: string | null
  skills: string[]
  isVerified: boolean
  createdAt: string
  reviewCount: number
  totalStars: number
  averageRating: number
  completedProjectCount: number
}

export interface User {
  id: string
  email: string
  name: string | null
  role: 'CLIENT' | 'FREELANCER' | 'ARBITER' | 'ADMIN'
  createdAt: string
  displayName: string | null
  avatarUrl?: string | null
  avatarColor?: string | null
  bio?: string | null
  skills?: string[]
}
