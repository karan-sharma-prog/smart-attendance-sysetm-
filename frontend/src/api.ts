import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add auth header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('omni_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (data: any) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/me'),
};

export const dashboard = {
    getAdmin: () => api.get('/dashboard/admin'),
    getTeacher: () => api.get('/dashboard/teacher'),
    getStudent: () => api.get('/dashboard/student'),
};

export const misc = {
    seed: () => api.post('/seed', {})
};

export default api;
