import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { resolveImage } from '../../assets';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatePanel from '../../components/StatePanel';
import { apiServices } from '../../services/api';
import { formatCurrency } from '../../utils/storefront';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const { data } = await apiServices.getProducts();
      setProducts(data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !normalizedSearch
        || [product.name, product.category, product.brand].filter(Boolean).some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesCategory = category === 'All' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, products, search]);

  const summary = useMemo(
    () => ({
      total: products.length,
      featured: products.filter((product) => product.isFeatured).length,
      lowStock: products.filter((product) => product.stock <= 5).length
    }),
    [products]
  );

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      setDeleting(true);
      await apiServices.deleteProduct(selectedProduct._id);
      toast.success('Product deleted successfully.');
      setSelectedProduct(null);
      loadProducts({ silent: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <StatePanel title="Loading products" description="Preparing the product management view..." />;
  }

  if (error) {
    return <StatePanel title="Could not load products" description={error} />;
  }

  return (
    <section className="admin-page">
      <div className="section-heading section-heading--inline">
        <div>
          <p className="section-kicker">Manage Products</p>
          <h1>Update the product catalog</h1>
        </div>
        <div className="table-actions">
          <button type="button" className="ghost-button" onClick={() => loadProducts({ silent: true })} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
          <Link to="/admin/products/new" className="primary-button">Add Product</Link>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name, category, or brand…"
          aria-label="Search products"
          autoComplete="off"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="All">All categories</option>
          {[...new Set(products.map((product) => product.category))].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>

      <div className="admin-mini-stats">
        <div><strong>{summary.total}</strong><span>Total products</span></div>
        <div><strong>{summary.featured}</strong><span>Featured</span></div>
        <div><strong>{summary.lowStock}</strong><span>Low stock</span></div>
      </div>

      {filteredProducts.length === 0 ? (
        <StatePanel title="No matching products" description="Try a different search term or add a new product." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="product-cell">
                      <img src={resolveImage(product.image)} alt={product.name} />
                      <div>
                        <strong>{product.name}</strong>
                      <p>{product.brand || 'FitSense'}</p>
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <span className={`stock-pill ${product.stock <= 5 ? 'out-of-stock' : 'in-stock'}`}>
                      {product.stock} unit(s)
                    </span>
                  </td>
                  <td>{product.isFeatured ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/products/${product._id}/edit`} className="ghost-button">Edit</Link>
                      <button type="button" className="ghost-button danger-button" onClick={() => setSelectedProduct(product)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(selectedProduct)}
        title="Delete this product?"
        description={`This will permanently remove ${selectedProduct?.name || 'the selected product'} from the store.`}
        confirmText="Delete Product"
        onConfirm={confirmDelete}
        onCancel={() => setSelectedProduct(null)}
        loading={deleting}
      />
    </section>
  );
}

export default ManageProducts;
