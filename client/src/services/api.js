import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api' 
      : '/api'
  ),
  timeout: 10000,
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Permits API
export const permitsAPI = {
  getAll: (params) => api.get('/permits', { params }),
  getById: (id) => api.get(`/permits/${id}`),
  create: (permitData) => api.post('/permits', permitData),
  update: (id, permitData) => api.put(`/permits/${id}`, permitData),
  delete: (id) => api.delete(`/permits/${id}`),
  updateChecklist: (permitId, checklistId, data) => 
    api.put(`/permits/${permitId}/checklist/${checklistId}`, data),
};

// Counties API
export const countiesAPI = {
  getAll: (params) => api.get('/counties', { params }),
  getById: (id) => api.get(`/counties/${id}`),
  getByState: (state) => api.get(`/counties/state/${state}`),
  getStates: () => api.get('/counties/states/all'),
};

// Checklists API
export const checklistsAPI = {
  getAll: (params) => api.get('/checklists', { params }),
  getById: (id) => api.get(`/checklists/${id}`),
  getByCounty: (countyId) => api.get(`/checklists/county/${countyId}`),
  getByProjectType: (projectType, params) => 
    api.get(`/checklists/project-type/${projectType}`, { params }),
  getCategoriesSummary: (params) => api.get('/checklists/categories/summary', { params }),
};

// Files API
export const filesAPI = {
  upload: (permitId, file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }
    return api.post(`/files/upload/${permitId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByPermit: (permitId) => api.get(`/files/permit/${permitId}`),
  download: (fileId) => api.get(`/files/download/${fileId}`, { responseType: 'blob' }),
  delete: (fileId) => api.delete(`/files/${fileId}`),
  update: (fileId, metadata) => api.put(`/files/${fileId}`, metadata),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  changeUserPassword: (id, passwordData) => api.put(`/admin/users/${id}/password`, passwordData),
  getStats: () => api.get('/admin/stats'),
  getActivity: (params) => api.get('/admin/activity', { params }),
};

export default api;
