import { api } from '../api.js';

export const renderShop = async () => {
    // Get query params if any
    const hashParts = window.location.hash.split('?');
    const query = hashParts[1] ? `?${hashParts[1]}` : '';

    let productsHTML = '<p>Loading products...</p>';
    
    try {
        const res = await api.getProducts(query);
        const products = res.data;

        if (products.length === 0) {
            productsHTML = '<p>No products found.</p>';
        } else {
            productsHTML = products.map(p => `
                <div class="product-card">
                    <div class="product-image">
                        <a href="#/product/${p._id}"><img src="${p.imageUrl}" alt="${p.name}"></a>
                    </div>
                    <div class="product-info">
                        <a href="#/product/${p._id}">
                            <h3 class="product-title">${p.name}</h3>
                        </a>
                        <p class="product-price">₹${p.price}</p>
                        <a href="#/product/${p._id}" class="btn btn-sm btn-outline">View Details</a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        productsHTML = `<p style="color:red;">Error loading products: ${error.message}</p>`;
    }

    // Expose search filter logic globally
    window.handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = document.getElementById('search-input').value;
        const categoryFilter = document.getElementById('category-filter').value;
        
        const params = new URLSearchParams();
        if(searchTerm) params.append('search', searchTerm);
        if(categoryFilter) params.append('category', categoryFilter);
        
        window.location.hash = `#/shop?${params.toString()}`;
    };

    return `
        <section id="shop">
            <div class="page-header">
                <h1>Our Collection</h1>
            </div>

            <div class="container shop-container">
                <aside class="filters">
                    <form onsubmit="handleSearch(event)">
                        <div class="filter-group">
                            <h4>Search</h4>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="search-input" class="form-input" placeholder="Search products..." style="flex: 1; padding: 10px;">
                                <button type="submit" class="btn btn-sm" style="padding: 10px 15px;"><i class="fas fa-search"></i></button>
                            </div>
                        </div>

                        <div class="filter-group">
                            <h4>Categories</h4>
                            <select id="category-filter" class="form-input" onchange="handleSearch(event)">
                                <option value="">All Categories</option>
                                <option value="Kurta Pajama">Kurta Pajama</option>
                                <option value="Sherwani">Sherwani</option>
                                <option value="Nehru Jacket">Nehru Jacket</option>
                                <option value="Indo-Western">Indo-Western</option>
                                <option value="Shirt">Shirt</option>
                                <option value="Trouser">Trouser</option>
                            </select>
                        </div>
                    </form>
                </aside>

                <main class="product-grid">
                    ${productsHTML}
                </main>
            </div>
        </section>
    `;
};
