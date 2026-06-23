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

export const getPublicProfile = async (userId: string) => {
  const res = await publicApi.get<PublicUserProfile>(`/users/${userId}/public`)
  return res.data
}
