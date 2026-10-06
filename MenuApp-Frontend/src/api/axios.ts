import axios from 'axios';
import { demoAdapter } from './demo';

// Same-origin `/api` (Apache/PM2 or Vite proxy). On Vercel set VITE_BACKEND_URL
// to the teammate's API host, e.g. https://api.example.com
const backend = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

// On Vercel without VITE_BACKEND_URL there is no API: requests are answered by
// the demo adapter with data stored in the browser.
export const HAS_BACKEND = Boolean(backend) || import.meta.env.DEV;

const api = axios.create({
  baseURL: backend ? `${backend}/api` : '/api',
});

if (!HAS_BACKEND) {
  api.defaults.adapter = demoAdapter;
}

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('menuapp-auth');
    const token = raw ? JSON.parse(raw)?.state?.token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore parse errors
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('menuapp-auth');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
