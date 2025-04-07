// src/api/axios.ts
import axios from 'axios';

// Create Axios instance with default configs
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;