import axios from 'axios';

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, ''),
  timeout: 15000
});

API.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('patilMensWearUser');

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    } catch (error) {
      localStorage.removeItem('patilMensWearUser');
    }
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    return Promise.reject(error);
  }
);

export const apiServices = {
  login: (payload) => API.post('/auth/login', payload),
  register: (payload) => API.post('/auth/register', payload),
  getMe: () => API.get('/auth/me'),

  getProducts: (params = {}) => API.get('/products', { params: { sort: 'newest', ...params } }),
  getFeaturedProducts: (params = {}) => API.get('/products/featured', { params }),
  getProductById: (id) => API.get(`/products/${id}`),
  getRelatedProducts: (id) => API.get(`/products/${id}/related`),
  createProduct: (payload) => API.post('/products', payload),
  updateProduct: (id, payload) => API.put(`/products/${id}`, payload),
  deleteProduct: (id) => API.delete(`/products/${id}`),
  getUploadStatus: () => API.get('/upload/status'),
  uploadProductImage: (formData) =>
    API.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000
    }),

  createOrder: (payload) => API.post('/orders', payload),
  getMyOrders: () => API.get('/orders/my'),
  getOrderById: (id) => API.get(`/orders/${id}`),
  getAllOrders: () => API.get('/orders'),
  updateOrderStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),

  getUsers: (params = {}) => API.get('/users', { params }),
  getUserById: (id) => API.get(`/users/${id}`),
  getAdminDashboard: () => API.get('/admin/dashboard')
};

export default API;
