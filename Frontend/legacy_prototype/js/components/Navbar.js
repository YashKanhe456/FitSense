import { state } from '../state.js';

export const renderNavbar = () => {
    const { user, cart } = state;
    
    // Calculate total cart items
    const cartCount = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    let authLinks = `
        <li><a href="#/login"><i class="fas fa-user"></i> Login</a></li>
    `;

    if (user) {
        authLinks = `
            <li><a href="javascript:void(0)" style="color:var(--accent-gold);"><i class="fas fa-user-circle"></i> ${user.name.split(' ')[0]}</a></li>
            ${user.role === 'admin' ? `<li><a href="#/admin">Admin Panel</a></li>` : ''}
            <li><a href="javascript:void(0)" onclick="logout()"><i class="fas fa-sign-out-alt"></i></a></li>
        `;
    }

    return `
        <nav class="navbar">
            <div class="container">
                <a href="#/" class="logo">Patil Mens Wear</a>
                <ul class="nav-links">
                    <li><a href="#/">Home</a></li>
                    <li><a href="#/shop">Shop</a></li>
                </ul>
                <div class="nav-icons" style="display:flex; gap:15px; align-items:center;">
                    <ul class="nav-links" style="margin:0;">
                        ${authLinks}
                    </ul>
                    <a href="#/cart" style="position:relative;">
                        <i class="fas fa-shopping-cart"></i>
                        ${cartCount > 0 ? `<span class="cart-badge" style="position:absolute; top:-8px; right:-10px; background:var(--accent-gold); color:#000; border-radius:50%; padding:2px 6px; font-size:0.7rem; font-weight:bold;">${cartCount}</span>` : ''}
                    </a>
                </div>
            </div>
        </nav>
    `;
};
