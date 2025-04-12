import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
    } else if (error.response) {
      console.error(`Server Error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Utility function for file uploads
export const uploadFile = async (endpoint, file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { retries = 2, ...axiosOptions } = options;
  
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...axiosOptions
      });
    } catch (error) {
      console.log(`Upload attempt ${attempt + 1}/${retries + 1} failed:`, error.message);
      lastError = error;
      // Wait before retrying
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  throw lastError;
};

// Utility function for job data fetching with retry logic
export const fetchJobs = async (jobRole, location, limit = 15) => {
  const url = `/api/jobs/recent-jobs?job_role=${encodeURIComponent(jobRole)}&location=${encodeURIComponent(location)}&limit=${limit}`;
  
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export default api;
