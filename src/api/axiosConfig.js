import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here when authentication is implemented
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else if (status === 404) {
      // Handle not found
      console.error('Resource not found');
    } else if (status === 500) {
      // Handle server error
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

export default apiClient;