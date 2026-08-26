export interface Application {
  id: string
  projectId: string
  freelancerId: string
  pitch: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  freelancer?: {
    id: string
    displayName: string | null
    name: string | null
    avatarUrl: string | null
    avatarColor?: string | null
    isVerified: boolean
  }
}

export interface FreelancerApplication extends Application {
  project: {
    id: string
    title: string
    totalBudget: string
    currency: string
    status: string
    escrowStatus: string
    skills: string[]
    milestoneCount: number
    createdAt: string
    client: {
      id: string
      displayName: string | null
      name: string | null
    }
  }
}
