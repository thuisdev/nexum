import axios from "axios"
import type { LoginCredentials, RegisterCredentials } from "@/types/api"

// Register API Call
export const loginApi = async (credentials: LoginCredentials) => {
    const res = await axios.post('/api/auth/login', credentials);

    localStorage.setItem('pactum_token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    return res.data;
};

// Login API Call
export const registerApi = async (credentials: RegisterCredentials) => {
    const res = await axios.post('/api/auth/register', credentials);

    localStorage.setItem('pactum_token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    return res.data;
};

// Logout API Call
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};


// Get Me API call
export const getMe = async () => {
    return axios.get('/api/auth/me')
};

// Get Token API Call