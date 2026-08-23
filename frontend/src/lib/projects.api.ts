import axios from 'axios'
import { api } from './axiosInteceptor'
import type { CreateProjectFormInput } from './validation'
import type {
  CreateProjectPayload,
  JobBoardProject,
  Project,
  ProjectPreview,
} from '@/types/project'

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export function mapCreateProjectPayload(
  form: CreateProjectFormInput,
): CreateProjectPayload {
  return {
    title: form.title,
    description: form.description,
    totalBudget: form.budget,
    currency: form.currency,
    isPublic: form.visibility === 'public',
    skills: form.skills,
    milestones: form.milestones.map((milestone, index) => ({
      orderIndex: index,
      title: milestone.title,
      description: milestone.title,
      amount: milestone.amount,
      deadline: milestone.deadline,
    })),
  }
}

export const createProject = async (payload: CreateProjectPayload) => {
  const res = await api.post<Project>('/projects', payload)
  return res.data
}

export const listProjects = async () => {
  const res = await api.get<Project[]>('/projects')
  return res.data
}

export const getProject = async (id: string) => {
  const res = await api.get<Project>(`/projects/${id}`)
  return res.data
}

export const getProjectPreview = async (id: string) => {
  const res = await publicApi.get<ProjectPreview>(`/projects/${id}/preview`)
  return res.data
}

export const listJobs = async () => {
  const res = await publicApi.get<JobBoardProject[]>('/jobs')
  return res.data
}

export const inviteFreelancer = async (
  projectId: string,
  identifier: string,
) => {
  const res = await api.post<Project>(`/projects/${projectId}/invite`, {
    identifier,
  })
  return res.data
}

export const cancelInvite = async (projectId: string) => {
  const res = await api.delete<Project>(`/projects/${projectId}/invite`)
  return res.data
}

export const acceptInvite = async (projectId: string) => {
  const res = await api.post<Project>(`/projects/${projectId}/accept`)
  return res.data
}

export const declineInvite = async (projectId: string, reason?: string) => {
  const res = await api.post<Project>(`/projects/${projectId}/decline`, {
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  })
  return res.data
}

export const fundProject = async (projectId: string) => {
  const res = await api.post<Project>(`/projects/${projectId}/fund`)
  return res.data
}

export const updateProject = async (
  projectId: string,
  payload: import('@/types/project').UpdateProjectPayload,
) => {
  const res = await api.patch<Project>(`/projects/${projectId}`, payload)
  return res.data
}

export const appendMilestones = async (
  projectId: string,
  milestones: Array<{
    title: string
    description: string
    amount: string
    deadline: string
  }>,
) => {
  const res = await api.post<Project>(`/projects/${projectId}/milestones`, {
    milestones,
  })
  return res.data
}

export const getProjectActivity = async (projectId: string) => {
  const res = await api.get<import('@/types/project').ProjectActivity[]>(
    `/projects/${projectId}/activity`,
  )
  return res.data
}

export const approveMilestone = async (milestoneId: string) => {
  const res = await api.post<Project & { payoutTxRef?: string }>(
    `/milestones/${milestoneId}/approve`,
  )
  return res.data
}

export const submitMilestone = async (
  milestoneId: string,
  content: string,
  file?: File | null,
) => {
  const form = new FormData()
  form.append('content', content)
  if (file) {
    form.append('file', file)
  }
  const res = await api.post<Project>(`/milestones/${milestoneId}/submit`, form)
  return res.data
}

export const deleteProject = async (projectId: string) => {
  const res = await api.delete<{ id: string }>(`/projects/${projectId}`)
  return res.data
}

export const openDispute = async (
  projectId: string,
  payload: { milestoneId: string; reason: string },
) => {
  const res = await api.post<import('@/types/project').ProjectOpenDispute>(
    `/projects/${projectId}/disputes`,
    payload,
  )
  return res.data
}

export const resolveDispute = async (
  disputeId: string,
  payload: { outcome: string; resolution: string },
) => {
  const res = await api.post<import('@/types/project').ProjectOpenDispute>(
    `/projects/disputes/${disputeId}/resolve`,
    payload,
  )
  return res.data
}

export const listArbiterDisputes = async () => {
  const res = await api.get<
    Array<
      import('@/types/project').ProjectOpenDispute & {
        project: {
          id: string
          title: string
          client: { id: string; displayName: string | null; name: string | null }
          freelancer: {
            id: string
            displayName: string | null
            name: string | null
          } | null
        }
      }
    >
  >('/projects/disputes/assigned')
  return res.data
}

export type ProjectReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  authorId: string
  subjectId: string
}

export const getMyProjectReview = async (projectId: string) => {
  const res = await api.get<ProjectReview | null>(`/projects/${projectId}/my-review`)
  return res.data
}

export const createProjectReview = async (
  projectId: string,
  payload: { rating: number; comment?: string },
) => {
  const res = await api.post<ProjectReview>(`/projects/${projectId}/review`, payload)
  return res.data
}
