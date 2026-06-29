import { api } from './axiosInteceptor'
import type { Application, FreelancerApplication } from '@/types/application'
import type { Project } from '@/types/project'

export const applyToProject = async (projectId: string, pitch: string) => {
  const res = await api.post<Application>(`/projects/${projectId}/apply`, {
    pitch,
  })
  return res.data
}

export const listProjectApplications = async (projectId: string) => {
  const res = await api.get<Application[]>(`/projects/${projectId}/applications`)
  return res.data
}

export const getMyApplication = async (projectId: string) => {
  const res = await api.get<Application | null>(
    `/projects/${projectId}/my-application`,
  )
  return res.data
}

export const listMyApplications = async () => {
  const res = await api.get<FreelancerApplication[]>('/applications/me')
  return res.data
}

export const acceptApplication = async (applicationId: string) => {
  const res = await api.post<Project>(`/applications/${applicationId}/accept`)
  return res.data
}

export const rejectApplication = async (applicationId: string) => {
  const res = await api.post<Application>(`/applications/${applicationId}/reject`)
  return res.data
}
