import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ceyseat_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('ceyseat_token');
            localStorage.removeItem('ceyseat_user');
            if (window.location.pathname !== '/login') {
                window.location.assign('/login?sessionExpired=1');
            }
        }
        return Promise.reject(error);
    });

export default client;