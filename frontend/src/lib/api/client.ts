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
    const errorData = error.response?.data?.error;
    let message = errorData?.message || 'Couldn\'t connect to the server. Please check your connection.';

    // If validation error has specific field details, surface the most specific message
    if (errorData?.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
      const firstDetail = errorData.details[0];
      if (firstDetail?.message) {
        message = firstDetail.message;
      }
    }

    const customError = {
      code: errorData?.code || 'NETWORK_ERROR',
      message,
      details: errorData?.details || [],
    };
    return Promise.reject(customError);
  }
);
