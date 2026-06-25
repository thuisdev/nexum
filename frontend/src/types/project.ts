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
