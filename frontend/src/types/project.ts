export interface Milestone {
  id: string
  orderIndex: number
  title: string
  description: string
  amount: string
  deadline: string
  status: string
}

export interface Project {
  id: string
  title: string
  description: string
  totalBudget: string
  currency: string
  status: string
  escrowStatus: string
  isPublic: boolean
  skills: string[]
  clientId: string
  freelancerId: string | null
  invitedFreelancerId: string | null
  milestones: Milestone[]
  createdAt: string
  client?: {
    id: string
    displayName: string | null
    name: string | null
    avatarUrl: string | null
    isVerified: boolean
  }
  freelancer?: {
    id: string
    displayName: string | null
    name: string | null
    avatarUrl: string | null
    isVerified: boolean
  } | null
  openDispute?: ProjectOpenDispute | null
}

export interface ProjectOpenDispute {
  id: string
  milestoneId: string
  raisedBy: string
  reason: string
  status: string
  resolution: string | null
  createdAt: string
  resolvedAt: string | null
  milestone: {
    id: string
    title: string
    status: string
    orderIndex: number
  }
}

export interface ProjectActivity {
  id: string
  action: string
  metadata: unknown
  createdAt: string
  actor: {
    id: string
    displayName: string | null
    name: string | null
    avatarUrl?: string | null
    isVerified?: boolean
  }
}

export interface UpdateProjectPayload {
  title?: string
  description?: string
  totalBudget?: string
  currency?: string
  isPublic?: boolean
  skills?: string[]
  milestones?: Array<{
    orderIndex: number
    title: string
    description: string
    amount: string
    deadline: string
  }>
}

export interface ProjectPreview {
  id: string
  title: string
  description: string
  totalBudget: string
  currency: string
  status: string
  isPublic: boolean
  skills: string[]
  createdAt: string
  client: {
    id: string
    displayName: string | null
    name: string | null
  }
  milestones: Array<{
    orderIndex: number
    title: string
    description: string
    amount: string
    deadline: string
  }>
}

export interface JobBoardProject {
  id: string
  title: string
  totalBudget: string
  currency: string
  status: string
  skills: string[]
  milestoneCount: number
  createdAt: string
  client: {
    id: string
    displayName: string | null
    name: string | null
  }
}

export interface CreateProjectPayload {
  title: string
  description: string
  totalBudget: string
  currency: string
  isPublic: boolean
  skills: string[]
  milestones: Array<{
    orderIndex: number
    title: string
    description: string
    amount: string
    deadline: string
  }>
}
