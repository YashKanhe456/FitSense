import { state, subscribe, setUser } from './state.js';
import { api } from './api.js';

// Import Pages
import { renderHome } from './pages/Home.js';
import { renderShop } from './pages/Shop.js';
import { renderProductDetail } from './pages/ProductDetail.js';
import { renderCart } from './pages/Cart.js';
import { renderLogin, renderRegister } from './pages/Auth.js';
import { renderCheckout } from './pages/Checkout.js';
import { renderAdmin } from './pages/Admin.js';

// Import Components
import { renderNavbar } from './components/Navbar.js';

const appContainer = document.getElementById('app');
const navContainer = document.getElementById('navbar-container');

// Router Logic
const router = async () => {
    // Re-render navbar on route change to keep active links accurate
    navContainer.innerHTML = renderNavbar();

    const hash = window.location.hash || '#/';
    const path = hash.split('/')[1] || '';
    const id = hash.split('/')[2] || null;

    appContainer.innerHTML = '<div class="loading-state" style="text-align:center; padding:50px;"><h2>Loading...</h2></div>';

    try {
        switch (path) {
            case '':
                appContainer.innerHTML = await renderHome();
                break;
            case 'shop':
                appContainer.innerHTML = await renderShop();
                break;
            case 'product':
                appContainer.innerHTML = await renderProductDetail(id);
                break;
            case 'cart':
                appContainer.innerHTML = await renderCart();
                break;
            case 'checkout':
                if (!state.user) {
                    window.location.hash = '#/login';
                    return;
                }
                appContainer.innerHTML = await renderCheckout();
                break;
            case 'login':
                appContainer.innerHTML = renderLogin();
                break;
            case 'register':
                appContainer.innerHTML = renderRegister();
                break;
            case 'admin':
                if (!state.user || state.user.role !== 'admin') {
                    appContainer.innerHTML = '<div style="text-align:center; padding:50px; color: red;"><h2>Access Denied</h2><p>Admin rights required.</p></div>';
                    return;
                }
                appContainer.innerHTML = await renderAdmin();
                break;
            default:
                appContainer.innerHTML = '<div style="text-align:center; padding:50px;"><h2>404 - Page Not Found</h2></div>';
        }
    } catch (error) {
        console.error("Routing Error:", error);
        appContainer.innerHTML = `<div style="text-align:center; padding:50px; color: red;"><h2>Error Loading Page</h2><p>${error.message}</p></div>`;
    }
};

// Global Event Listeners (e.g., Logout)
window.logout = () => {
    setUser(null, null);
    window.location.hash = '#/login';
};

// Initialize App
const init = async () => {
    // If logged in, optionally fetch latest cart info
    if (state.user) {
        try {
            const res = await api.getCart();
            if(res.success) {
                // Not doing full reactive set here to avoid loop, just initialize
                state.cart = res.data;
            }
        } catch (e) {
            console.warn("Could not fetch cart on init", e);
        }
    }

    // Listen to hash changes
    window.addEventListener('hashchange', router);
    
    // Subscribe to state changes to re-render navbar (for cart count, login status)
    subscribe(() => {
        navContainer.innerHTML = renderNavbar();
    });

    // Initial render
    router();
};

document.addEventListener('DOMContentLoaded', init);
