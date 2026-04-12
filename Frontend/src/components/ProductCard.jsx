import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { resolveImage } from '../assets';

function ProductCard({ product }) {
  const productId = product._id || product.id;
  const inStock = product.stock > 0;

  return (
    <article className="product-card">
      <Link to={`/product/${productId}`} className="product-card__image-wrap">
        <img
          src={resolveImage(product.image)}
          alt={product.name}
          className="product-card__image"
          width="800"
          height="1000"
          loading="lazy"
        />
        <span className={`product-card__badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
          {inStock ? `${product.stock} in stock` : 'Out of stock'}
        </span>
      </Link>

      <div className="product-card__content">
        <div>
          <p className="product-card__category">{product.category}</p>
          <h3>{product.name}</h3>
          <p className="product-card__description">{product.description}</p>
        </div>

        <div className="product-card__footer">
          <div>
            <strong className="product-card__price">Rs. {Number(product.price).toLocaleString('en-IN')}</strong>
            <span className="product-card__brand">{product.brand || 'Patil Mens Wear'}</span>
          </div>

          <Link to={`/product/${productId}`} className="ghost-button icon-button">
            View
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
