import axios from 'axios';
import { TOKEN_KEY } from './constants';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

type UnauthorizedListener = () => void;

const unauthorizedListeners = new Set<UnauthorizedListener>();

/** Subscribe to expired/invalid session (401). Returns unsubscribe. */
export function subscribeUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function isCredentialRequest(url: string | undefined) {
  return Boolean(url && /\/auth\/(login|register)(?:\?|$)/.test(url));
}

// Attach the JWT to every outgoing request, if we have one stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Drop a dead session on 401 — not on failed login/register
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isCredentialRequest(error.config?.url)
    ) {
      localStorage.removeItem(TOKEN_KEY);
      unauthorizedListeners.forEach((listener) => listener());
    }
    return Promise.reject(error);
  },
);