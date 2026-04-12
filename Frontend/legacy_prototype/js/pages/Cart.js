import { state, setCart } from '../state.js';
import { api } from '../api.js';

export const renderCart = async () => {
    if (!state.user) {
        return `
            <section id="cart" style="padding:100px 0; text-align:center;">
                <div class="container">
                    <i class="fas fa-shopping-cart" style="font-size: 4rem; color: var(--text-muted); margin-bottom:20px;"></i>
                    <h2>Your Cart is Empty</h2>
                    <p style="color:var(--text-secondary); margin-bottom:30px;">Please login to view your cart.</p>
                    <a href="#/login" class="btn">Login Now</a>
                </div>
            </section>
        `;
    }

    // Ensure we have latest cart
    try {
        const res = await api.getCart();
        setCart(res.data);
    } catch (e) {
        console.error("Cart fetch error", e);
    }

    window.removeItem = async (itemId) => {
        try {
            const res = await api.removeCartItem(itemId);
            setCart(res.data);
            // Re-render
            const event = new Event('hashchange');
            window.dispatchEvent(event);
        } catch(e) { alert(e.message); }
    };

    window.updateQty = async (itemId, val) => {
        try {
            const res = await api.updateCartItem(itemId, parseInt(val));
            setCart(res.data);
            const event = new Event('hashchange');
            window.dispatchEvent(event);
        } catch(e) { alert(e.message); }
    };

    const cart = state.cart;

    if (!cart.items || cart.items.length === 0) {
        return `
            <section id="cart" style="padding:100px 0; text-align:center;">
                <div class="container">
                    <i class="fas fa-shopping-basket" style="font-size: 4rem; color: var(--text-muted); margin-bottom:20px;"></i>
                    <h2>Your Cart is Empty</h2>
                    <p style="color:var(--text-secondary); margin-bottom:30px;">Looks like you haven't added anything yet.</p>
                    <a href="#/shop" class="btn">Start Shopping</a>
                </div>
            </section>
        `;
    }

    const itemsHTML = cart.items.map(item => `
        <tr>
            <td>
                <div class="cart-item-info">
                    <img src="${item.imageUrl}" class="cart-item-img" alt="${item.name}">
                    <div>
                        <p style="font-weight: bold; margin-bottom: 5px;">
                            <a href="#/product/${item.product}" style="color:inherit;">${item.name}</a>
                        </p>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">Size: ${item.size}</p>
                    </div>
                </div>
            </td>
            <td>₹${item.price}</td>
            <td>
                <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                    style="width: 50px; margin: 0;" onchange="updateQty('${item._id}', this.value)">
            </td>
            <td>₹${item.subtotal}</td>
            <td><a href="javascript:void(0)" onclick="removeItem('${item._id}')" style="color: #ff4444;"><i class="fas fa-trash"></i></a></td>
        </tr>
    `).join('');

    return `
        <section id="cart">
            <div class="page-header">
                <h1>Your Shopping Cart</h1>
            </div>
            <div class="container cart-header">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>

                <div class="cart-summary">
                    <h3 style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Cart Totals</h3>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>₹${cart.totalAmount}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div class="summary-row summary-total">
                        <span>Total</span>
                        <span>₹${cart.totalAmount}</span>
                    </div>
                    <button class="btn btn-block" style="margin-top: 20px;" onclick="window.location.hash='#/checkout'">Proceed to Checkout</button>
                    <a href="#/shop" class="btn btn-block btn-outline" style="margin-top: 10px;">Continue Shopping</a>
                </div>
            </div>
        </section>
    `;
};
