import axios from 'axios';

const API = axios.create({
  baseURL: 'https://task-wrdg.onrender.com/api/',
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const registerUser  = (data) => API.post('/users/register', data);
export const loginUser     = (data) => API.post('/users/login', data);
export const updateProfile = (data) => API.put('/users/profile', data);
export const updatePassword = (data) => API.put('/users/password', data);
export const deleteAccount = () => API.delete('/users/profile');


export const getTasks      = (params) => API.get('/tasks', { params });
export const getTask       = (id)     => API.get(`/tasks/${id}`);
export const createTask    = (data)   => API.post('/tasks', data);
export const updateTask    = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask    = (id)     => API.delete(`/tasks/${id}`);
export const updateStatus  = (id, status) => API.patch(`/tasks/${id}/status`, { status });
export const postComment   = (taskId, text) => API.post(`/tasks/${taskId}/comments`, { text });

export default API;
