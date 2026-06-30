import axios from 'axios'
import { api } from './axiosInteceptor'

import type { UpdateProfileInput } from './validation'
import type { PublicUserProfile } from '@/types/user'

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export const patchMe = async (credentials: UpdateProfileInput) => {
  const res = await api.patch('/users/me', credentials)
  return res.data
}

export const uploadAvatar = async (file: File) => {
  const form = new FormData()
  form.append('avatar', file)
  const res = await api.post('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const getPublicProfile = async (userId: string) => {
  const res = await publicApi.get<PublicUserProfile>(`/users/${userId}/public`)
  return res.data
}

export type PublicReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  author: {
    id: string
    displayName: string | null
    name: string | null
    avatarUrl: string | null
    avatarColor?: string | null
  }
  project: { id: string; title: string }
}

export const getUserReviews = async (userId: string) => {
  const res = await publicApi.get<PublicReview[]>(`/users/${userId}/reviews`)
  return res.data
}
