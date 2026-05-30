import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the JWT to every outgoing request, if we have one stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pactum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says 401 (unauthorized), drop the dead token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pactum_token');
    }
    return Promise.reject(error);
  },
);