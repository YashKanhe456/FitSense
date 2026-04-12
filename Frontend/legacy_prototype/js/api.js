// Centralized API config
const API_BASE_URL = 'http://localhost:5000/api';

const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const api = {
    // Auth
    login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => apiFetch('/auth/me'),

    // Products
    getProducts: (query = '') => apiFetch(`/products${query ? '?search=' + query : ''}`),
    getProduct: (id) => apiFetch(`/products/${id}`),

    // Cart
    getCart: () => apiFetch('/cart'),
    addToCart: (productId, quantity, size) => apiFetch('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity, size }) }),
    updateCartItem: (itemId, quantity) => apiFetch(`/cart/update/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    removeCartItem: (itemId) => apiFetch(`/cart/remove/${itemId}`, { method: 'DELETE' }),
    clearCart: () => apiFetch('/cart/clear', { method: 'DELETE' }),

    // Orders
    checkout: (orderData) => apiFetch('/orders/checkout', { method: 'POST', body: JSON.stringify(orderData) }),
    getMyOrders: () => apiFetch('/orders/my-orders'),
};
