// src/api/axios.ts
import axios from 'axios';

// Create Axios instance with default configs
const api = axios.create({
    baseURL: 'http://192.168.1.121:5000/api', // Replace with your backend URL
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