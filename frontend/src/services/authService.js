// src/services/authService.js
import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data; // { success: true, token, user }
};

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data; // { success: true, token, user }
};

// Optional: Logout function (mostly client-side state clearing)
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;