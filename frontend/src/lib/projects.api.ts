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
  freelancerEmail: string,
) => {
  const res = await api.post<Project>(`/projects/${projectId}/invite`, {
    freelancerEmail,
  })
  return res.data
}

export const acceptInvite = async (projectId: string) => {
  const res = await api.post<Project>(`/projects/${projectId}/accept`)
  return res.data
}

export const fundProject = async (projectId: string) => {
  const res = await api.post<Project>(`/projects/${projectId}/fund`)
  return res.data
}
