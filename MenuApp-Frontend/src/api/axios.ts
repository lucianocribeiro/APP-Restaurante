import axios from 'axios';

// Same-origin `/api` (Apache/PM2 or Vite proxy). On Vercel set VITE_BACKEND_URL
// to the teammate's API host, e.g. https://api.example.com
const backend = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: backend ? `${backend}/api` : '/api',
});

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
