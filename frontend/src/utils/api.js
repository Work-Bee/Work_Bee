import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:5000/api';

const normalizeApiUrl = (value) => {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return DEFAULT_API_URL;
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');

  if (/\/api$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
};

const API_URL = normalizeApiUrl(process.env.REACT_APP_API_URL);
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const storedUser = localStorage.getItem('user');
      let redirectPath = '/login/jobseeker';

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.role === 'admin') {
            redirectPath = '/login/admin';
          } else if (parsedUser?.role === 'employer') {
            redirectPath = '/login/employer';
          } else {
            redirectPath = '/login/jobseeker';
          }
        } catch (parseError) {
          // ignore JSON parse errors and fallback to default
        }
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = redirectPath;
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
};

// Job API calls
export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getEmployerJobs: (params) => api.get('/jobs/employer/my-jobs', { params }),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  toggleJobStatus: (id) => api.put(`/jobs/${id}/toggle-status`),
};

// Application API calls
export const applicationAPI = {
  applyForJob: (applicationData) => {
    const formData = new FormData();
    Object.keys(applicationData).forEach(key => {
      if (key === 'resume') {
        formData.append('resume', applicationData[key]);
      } else {
        formData.append(key, applicationData[key]);
      }
    });
    
    return api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId, params) => api.get(`/applications/employer/${jobId}`, { params }),
  getAllEmployerApplications: (params) => api.get('/applications/employer/all', { params }),
  getApplication: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, statusData) => api.put(`/applications/${id}/status`, statusData),
  addEmployerNotes: (id, notes) => api.put(`/applications/${id}/notes`, notes),
  withdrawApplication: (id) => api.delete(`/applications/${id}`),
};

// Company API calls
export const companyAPI = {
  getCompanies: (params) => api.get('/companies', { params }),
  getCompany: (id) => api.get(`/companies/${id}`),
  getMyCompany: () => api.get('/companies/profile/my-company'),
  createCompany: (companyData) => api.post('/companies', companyData),
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  getApplications: (params) => api.get('/admin/applications', { params }),
};

// User API calls
export const userAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    return api.post('/users/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export { API_URL, API_BASE_URL };
export default api;