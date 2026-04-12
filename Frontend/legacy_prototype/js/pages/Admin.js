import { api } from '../api.js';

let products = [];

export const renderAdmin = async () => {
    // Initial fetch
    try {
        const res = await api.getProducts();
        products = res.data;
    } catch(e) {
        console.error("Admin fetch error", e);
    }

    // Global handlers
    window.handleAdminTab = (tabId) => {
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
        
        document.getElementById(`panel-${tabId}`).classList.add('active');
        document.getElementById(`nav-${tabId}`).classList.add('active');
    };

    window.adminDeleteProduct = async (id) => {
        if(confirm('Delete product?')) {
            try {
                await api.deleteProduct(id);
                alert('Deleted');
                // Re-render admin
                window.location.reload();
            } catch(e) { alert(e.message); }
        }
    };

    window.adminAddProduct = async (e) => {
        e.preventDefault();
        const productData = {
            name: document.getElementById('prod-name').value,
            category: document.getElementById('prod-category').value,
            price: document.getElementById('prod-price').value,
            stock: document.getElementById('prod-stock').value,
            description: document.getElementById('prod-desc').value || 'No description',
            imageUrl: document.getElementById('prod-image').value,
            sizes: ['S', 'M', 'L', 'XL'] // Simplified for demo
        };

        try {
            await api.createProduct(productData);
            alert('Product created');
            window.location.reload();
        } catch(e) { alert(e.message); }
    };

    const tbodyHTML = products.map(p => `
        <tr>
            <td><img src="${p.imageUrl}" class="product-thumb" alt="" style="width:40px; height:40px; object-fit:cover;"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>₹${p.price}</td>
            <td>${p.stock}</td>
            <td>
                <button class="btn btn-sm" style="background:#ff4444;" onclick="adminDeleteProduct('${p._id}')">Delete</button>
            </td>
        </tr>
    `).join('');

    return `
        <section id="admin">
            <div class="container admin-container">
                <aside class="admin-sidebar">
                    <ul class="admin-menu">
                        <li><a href="javascript:void(0)" onclick="handleAdminTab('dashboard')" id="nav-dashboard" class="admin-nav-link active"><i class="fas fa-tachometer-alt" style="width:20px"></i> Dashboard</a></li>
                        <li><a href="javascript:void(0)" onclick="handleAdminTab('products')" id="nav-products" class="admin-nav-link"><i class="fas fa-box" style="width:20px"></i> Products</a></li>
                        <li><a href="javascript:void(0)" onclick="handleAdminTab('add-product')" id="nav-add-product" class="admin-nav-link"><i class="fas fa-plus" style="width:20px"></i> Add Product</a></li>
                    </ul>
                </aside>
                <main class="admin-main">
                    
                    <!-- Dashboard -->
                    <div id="panel-dashboard" class="admin-panel active">
                        <h2>Dashboard</h2>
                        <div class="status-grid" style="margin-top:20px;">
                            <div class="status-card">
                                <h3>Total Products</h3>
                                <div class="status-number">${products.length}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Products -->
                    <div id="panel-products" class="admin-panel">
                        <h2>Product List</h2>
                        <table class="admin-table" style="margin-top:20px;">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tbodyHTML}
                            </tbody>
                        </table>
                    </div>

                    <!-- Add Product -->
                    <div id="panel-add-product" class="admin-panel">
                        <h2>Add New Product</h2>
                        <form onsubmit="adminAddProduct(event)" class="product-form-grid" style="margin-top:20px;">
                            <div class="admin-card">
                                <div class="form-group"><label>Name</label><input type="text" id="prod-name" class="form-input" required></div>
                                <div class="form-group"><label>Category</label>
                                    <select id="prod-category" class="form-input" required>
                                        <option value="Kurta Pajama">Kurta Pajama</option>
                                        <option value="Sherwani">Sherwani</option>
                                        <option value="Nehru Jacket">Nehru Jacket</option>
                                        <option value="Indo-Western">Indo-Western</option>
                                    </select>
                                </div>
                                <div class="form-group"><label>Price</label><input type="number" id="prod-price" class="form-input" required></div>
                                <div class="form-group"><label>Stock</label><input type="number" id="prod-stock" class="form-input" required></div>
                                <div class="form-group"><label>Image URL</label><input type="text" id="prod-image" class="form-input" required></div>
                                <div class="form-group"><label>Description</label><textarea id="prod-desc" class="form-input"></textarea></div>
                                <button type="submit" class="btn">Save Product</button>
                            </div>
                        </form>
                    </div>

                </main>
            </div>
        </section>
    `;
};
