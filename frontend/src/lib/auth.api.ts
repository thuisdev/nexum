import { api } from "@/lib/axiosInteceptor";
import type { LoginCredentials, RegisterCredentials } from "@/types/api.types"

// Login API Call
export const loginApi = async (credentials: LoginCredentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
};

// Register API Call
export const registerApi = async (credentials: RegisterCredentials) => {
    const res = await api.post('/auth/register', credentials);
    return res.data;
};

// Get Me API call
export const getMe = async () => {
    return api.get('/auth/me')
};