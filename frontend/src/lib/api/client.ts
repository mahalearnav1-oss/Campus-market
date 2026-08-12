import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Auth token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardized Error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      message: error.response?.data?.error?.message || 'Unable to connect to server',
      details: error.response?.data?.error?.details || [],
    };
    return Promise.reject(customError);
  }
);
