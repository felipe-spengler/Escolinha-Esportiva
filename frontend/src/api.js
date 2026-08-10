import axios from 'axios';

const getBaseURL = () => {
    const host = window.location.hostname;

    // Se estiver no desenvolvimento local
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:8000/api';
    }

    // Em produção no Coolify, usamos o MESMO domínio do frontend.
    // O sistema de proxy (Traefik) vai encaminhar o que começar com /api para o backend.
    return '/api';
};

const API_BASE_URL = getBaseURL();
console.log("🚀 API URL Ativa:", API_BASE_URL);

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export { API_BASE_URL };
export default api;
