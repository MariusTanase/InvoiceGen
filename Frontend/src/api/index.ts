import axios from 'axios';

// Create axios instance with default configs
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for global request handling
api.interceptors.request.use(
    (config) => {
        // Could add authentication token or other headers here
        // not necessary now as this app is inhouse use only
        // Example: config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Global error handling
        console.error('API Error:', error);

        // Format error message
        let errorMessage = 'An unexpected error occurred';

        if (error.response) {
            // Server responded with an error status
            errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = 'No response received from server';
        } else {
            // Error setting up the request
            errorMessage = error.message;
        }

        return Promise.reject({
            originalError: error,
            message: errorMessage
        });
    }
);

export default api;