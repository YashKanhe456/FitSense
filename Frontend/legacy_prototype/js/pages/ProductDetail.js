import { api } from '../api.js';
import { state, setCart } from '../state.js';

export const renderProductDetail = async (id) => {
    if (!id) return '<p>Product Not Found</p>';

    try {
        const res = await api.getProduct(id);
        const p = res.data;

        // Global functions for cart
        window.selectSize = (btn) => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };

        window.addToCartHandler = async (productId) => {
            if (!state.user) {
                alert('Please login to add items to cart');
                window.location.hash = '#/login';
                return;
            }

            const activeSizeBtn = document.querySelector('.size-btn.active');
            const size = activeSizeBtn ? activeSizeBtn.innerText : (p.sizes[0] || 'Default');
            const qty = parseInt(document.getElementById('p-qty').value) || 1;

            if(qty > p.stock) {
                alert('Not enough stock available!');
                return;
            }

            try {
                const addRes = await api.addToCart(productId, qty, size);
                if(addRes.success) {
                    setCart(addRes.data);
                    alert('Item added to cart!');
                }
            } catch (err) {
                alert(err.message);
            }
        };

        const sizeBtnsHTML = p.sizes && p.sizes.length > 0 
            ? p.sizes.map((s, i) => `<button class="size-btn ${i===0?'active':''}" onclick="selectSize(this)">${s}</button>`).join('')
            : '<p>One Size Fits All</p>';

        return `
            <section id="product">
                <div class="container product-details-container">
                    <a href="javascript:history.back()" style="display:inline-block; margin-bottom:20px; color:var(--text-secondary);">&larr; Back</a>
                    
                    <div class="product-details-wrapper">
                        <div class="product-gallery">
                            <img src="${p.imageUrl}" alt="${p.name}">
                        </div>

                        <div class="product-info-detail">
                            <p style="color: var(--accent-gold); text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem;">
                                ${p.category} | ${p.brand || 'Patil Mens Wear'}
                            </p>
                            <h1>${p.name}</h1>
                            <div class="product-price-large">₹${p.price}</div>
                            
                            <p style="color:${p.stock > 0 ? '#4cd137' : 'red'}; margin-bottom: 10px;">
                                ${p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}
                            </p>

                            <div class="product-description">
                                <p>${p.description}</p>
                            </div>

                            <div class="size-selector">
                                <p style="margin-bottom: 10px; font-weight: bold;">Select Size:</p>
                                ${sizeBtnsHTML}
                            </div>

                            <div style="display: flex; align-items: center; margin-bottom: 30px; gap: 15px;">
                                <input type="number" id="p-qty" class="qty-input" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? 'disabled' : ''}>
                                <button class="btn" onclick="addToCartHandler('${p._id}')" ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                                    Add to Cart
                                </button>
                            </div>

                            <div style="border-top: 1px solid var(--border-color); padding-top: 20px; color: var(--text-secondary);">
                                <p><i class="fas fa-truck" style="margin-right: 10px;"></i> Free shipping on orders above ₹1,999</p>
                                <p style="margin-top: 10px;"><i class="fas fa-undo" style="margin-right: 10px;"></i> 7 Days Return Policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    } catch (error) {
        return `<div class="container" style="padding:50px; text-align:center;"><h2>Product Not Found</h2><p>${error.message}</p></div>`;
    }
};
