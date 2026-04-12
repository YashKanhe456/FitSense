import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { apiServices } from '../services/api';
import { useCart } from '../context/CartContext';
import { resolveImage } from '../assets';
import ProductCard from '../components/ProductCard';
import StatePanel from '../components/StatePanel';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [{ data }, { data: relatedData }] = await Promise.all([
          apiServices.getProductById(id),
          apiServices.getRelatedProducts(id)
        ]);
        setProduct(data.data);
        setSelectedSize(data.data.sizes?.[0] || '');
        setRelatedProducts(relatedData.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const inStock = useMemo(() => Number(product?.stock || 0) > 0, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes?.length && !selectedSize) {
      toast.error('Please choose a size before adding this item.');
      return;
    }

    const result = addToCart(product, quantity, selectedSize);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (loading) {
    return <StatePanel title="Loading product" description="Preparing the product details page..." />;
  }

  if (error || !product) {
    return <StatePanel title="Unable to open product" description={error || 'This product is unavailable.'} />;
  }

  return (
    <section className="section-block">
      <div className="container product-detail">
        <div>
          <Link to="/products" className="detail-back-link">
            Back to products
          </Link>
          <div className="product-detail__image-card">
            <img
              src={resolveImage(product.image)}
              alt={product.name}
              className="product-detail__image"
              width="1000"
              height="1250"
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="product-detail__content">
          <p className="section-kicker">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-detail__price">Rs. {Number(product.price).toLocaleString('en-IN')}</p>
          <p className={`stock-pill ${inStock ? 'in-stock' : 'out-of-stock'}`}>
            {inStock ? `${product.stock} pieces available` : 'Currently out of stock'}
          </p>
          <p className="product-detail__description">{product.description}</p>

          {product.sizes?.length ? (
            <div className="detail-block">
              <h3>Select Size</h3>
              <div className="size-list">
                {product.sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={`size-chip ${selectedSize === size ? 'is-active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="detail-block">
            <h3>Quantity</h3>
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={!inStock}>
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                disabled={!inStock}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="product-detail__actions">
            <button type="button" className="primary-button" onClick={handleAddToCart} disabled={!inStock}>
              <ShoppingBag size={18} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          <div className="detail-highlight">
            <Truck size={18} />
            <div>
              <strong>Cash on Delivery available</strong>
              <p>Backend totals are recalculated securely before every order is created.</p>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <div className="container section-block">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Related products</p>
              <h2>More from this category</h2>
            </div>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="ghost-button">
              View all {product.category}
            </Link>
          </div>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProductDetails;
