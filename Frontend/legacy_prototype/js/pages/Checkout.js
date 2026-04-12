import { state, setCart } from '../state.js';
import { api } from '../api.js';

export const renderCheckout = async () => {
    window.handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        
        const address = document.getElementById('checkout-address').value;
        const city = document.getElementById('checkout-city').value;
        const pin = document.getElementById('checkout-pin').value;
        const paymentMethod = document.getElementById('payment-method').value;

        const fullAddress = `${address}, ${city} - ${pin}`;

        try {
            const res = await api.checkout({
                shippingAddress: fullAddress,
                paymentMethod
            });

            if(res.success) {
                alert('Order Placed Successfully! Your Order ID is: ' + res.data._id);
                // Cart is cleared on backend, fetch to sync state
                const cartRes = await api.getCart();
                setCart(cartRes.data);
                window.location.hash = '#/shop';
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const cart = state.cart;

    if (!cart.items || cart.items.length === 0) {
        return `
            <div style="text-align:center; padding: 100px;">
                <h2>Your Cart is Empty</h2>
                <a href="#/shop" class="btn">Return to Shop</a>
            </div>
        `;
    }

    return `
        <section id="checkout" style="padding: 60px 0;">
            <div class="container" style="max-width: 800px; margin: 0 auto; background: #1a1a1a; padding: 30px; border-radius: 8px;">
                <h2 style="margin-bottom: 20px; text-align:center;">Checkout</h2>
                
                <form onsubmit="handleCheckoutSubmit(event)">
                    <div style="margin-bottom: 30px;">
                        <h3 style="margin-bottom: 15px; color: var(--accent-gold);">Shipping Details</h3>
                        <div class="form-group">
                            <label>Full Address</label>
                            <input type="text" id="checkout-address" class="form-input" required placeholder="123 Main Street">
                        </div>
                        <div style="display:flex; gap: 15px;">
                            <div class="form-group" style="flex:1;">
                                <label>City</label>
                                <input type="text" id="checkout-city" class="form-input" required>
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>PIN Code</label>
                                <input type="text" id="checkout-pin" class="form-input" required>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="margin-bottom: 15px; color: var(--accent-gold);">Payment Method</h3>
                        <select id="payment-method" class="form-input" required>
                            <option value="Cash On Delivery">Cash On Delivery (COD)</option>
                            <option value="UPI">UPI / Online Payment (Mock)</option>
                        </select>
                    </div>

                    <div style="background: #222; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h3 style="margin-bottom: 15px;">Order Summary</h3>
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span>Total Items:</span>
                            <span>${cart.items.length}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size: 1.2rem; font-weight:bold; color: var(--accent-gold);">
                            <span>Total Amount:</span>
                            <span>₹${cart.totalAmount}</span>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-block" style="font-size: 1.1rem; padding: 15px;">Place Order</button>
                    <div style="text-align:center; margin-top:20px;">
                        <a href="#/cart" style="color:var(--text-secondary);">Cancel and Return to Cart</a>
                    </div>
                </form>
            </div>
        </section>
    `;
};
