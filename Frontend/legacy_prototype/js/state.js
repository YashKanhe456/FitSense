export const state = {
    user: null,
    cart: { items: [], totalAmount: 0 },
    products: []
};

// Observers for reactivity
const listeners = [];

export const subscribe = (listener) => {
    listeners.push(listener);
};

export const notify = () => {
    listeners.forEach(listener => listener(state));
};

export const setUser = (user, token) => {
    state.user = user;
    if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    } else if (user === null) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    notify();
};

export const setCart = (cartData) => {
    state.cart = cartData || { items: [], totalAmount: 0 };
    notify();
};

export const setProducts = (productsList) => {
    state.products = productsList;
    notify();
};

// Init state from local storage on load
const storedUser = localStorage.getItem('user');
if (storedUser) {
    try {
        state.user = JSON.parse(storedUser);
    } catch (e) {
        console.error('Failed to parse user from local storage');
    }
}
