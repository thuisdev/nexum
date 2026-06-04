import { api } from "./axiosInteceptor";

import type { UpdateProfileInput } from "./validation";

export const patchMe = async (credentials: UpdateProfileInput) => {
    const res = await api.patch('/users/me', credentials)
    return res.data
};