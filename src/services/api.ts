import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Staff API
export const staffApi = {
  getAll: (params?: any) => api.get('/staff', { params }),
  getById: (id: string) => api.get(`/staff/${id}`),
  create: (data: any) => api.post('/staff', data),
  update: (id: string, data: any) => api.put(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
  getStats: () => api.get('/staff/stats/summary'),
  getDepartments: () => api.get('/staff/departments/list'),
};

// Appointments API
export const appointmentsApi = {
  getAll: (params?: any) => api.get('/appointments', { params }),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`),
  delete: (id: string) => api.delete(`/appointments/${id}`),
  getTimeSlots: (doctorId: string, date: string) => 
    api.get(`/appointments/timeslots/${doctorId}/${date}`),
};

// Patients API
export const patientsApi = {
  getAll: (params?: any) => api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
};

// Reminders API
export const remindersApi = {
  getAll: (params?: any) => api.get('/reminders', { params }),
  create: (data: any) => api.post('/reminders', data),
  update: (id: string, data: any) => api.put(`/reminders/${id}`, data),
  complete: (id: string) => api.patch(`/reminders/${id}/complete`),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};

// Blog API
export const blogApi = {
  getAll: (params?: any) => api.get('/blog', { params }),
  getById: (id: string) => api.get(`/blog/${id}`),
  create: (data: any) => api.post('/blog', data),
  update: (id: string, data: any) => api.put(`/blog/${id}`, data),
  delete: (id: string) => api.delete(`/blog/${id}`),
  getAuthors: () => api.get('/blog/authors/list'),
};

// Calendar API
export const calendarApi = {
  getAll: (params?: any) => api.get('/calendar', { params }),
  getById: (id: string) => api.get(`/calendar/${id}`),
  create: (data: any) => api.post('/calendar', data),
  update: (id: string, data: any) => api.put(`/calendar/${id}`, data),
  delete: (id: string) => api.delete(`/calendar/${id}`),
};

// Tutorials API
export const tutorialsApi = {
  getAll: (params?: any) => api.get('/tutorials', { params }),
  getById: (id: string) => api.get(`/tutorials/${id}`),
  create: (data: any) => api.post('/tutorials', data),
  update: (id: string, data: any) => api.put(`/tutorials/${id}`, data),
  delete: (id: string) => api.delete(`/tutorials/${id}`),
  incrementViews: (id: string) => api.patch(`/tutorials/${id}/view`),
  getAuthors: () => api.get('/tutorials/authors/list'),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export default api;