import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Có lỗi xảy ra';
};

export default api;

