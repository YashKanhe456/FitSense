import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Shirt, Truck } from 'lucide-react';
import { apiServices } from '../services/api';
import ProductCard from '../components/ProductCard';
import StatePanel from '../components/StatePanel';
import { CATEGORY_IMAGES } from '../assets';

const categoryCards = [
  { name: 'Shirts', blurb: 'Sharp staples for office hours, dinners, and Patil-level polish.' },
  { name: 'T-Shirts', blurb: 'Easy essentials with a clean fit and youthful confidence.' },
  { name: 'Jeans', blurb: 'Reliable denim built for repeat wear, college days, and city plans.' },
  { name: 'Pants', blurb: 'Tailored chinos and trousers for a smarter everyday look.' },
  { name: 'Formal Wear', blurb: 'Royal occasion pieces with a modern Maharashtrian attitude.' },
  { name: 'Casual Wear', blurb: 'Relaxed premium layers with a desi edge and modern finish.' }
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHome = async () => {
      try {
        const { data } = await apiServices.getProducts();
        setProducts(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load products right now.');
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  const featuredProducts = useMemo(() => products.filter((product) => product.isFeatured).slice(0, 4), [products]);
  const stats = useMemo(
    () => [
      { label: 'Curated SKUs', value: products.length || 12, icon: Shirt },
      { label: 'Free shipping threshold', value: 'Rs. 2,999', icon: BadgePercent },
      { label: 'Checkout mode', value: 'COD ready', icon: Truck }
    ],
    [products.length]
  );
  const launches = useMemo(
    () => [
      {
        eyebrow: 'Everyday swagger',
        title: 'Smart shirts, chinos, and easy layers for everyday confidence with a Patil touch.',
        cta: '/products?category=Shirts'
      },
      {
        eyebrow: 'Royal wedding looks',
        title: 'Bandhgalas, festive jackets, and formal silhouettes made for standout celebrations.',
        cta: '/products?category=Formal+Wear'
      }
    ],
    []
  );

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="section-kicker">Patil style for the modern gentleman</p>
            <p className="hero-copy__tag">Aapli style. Premium fit.</p>
            <h1>Traditional roots. Modern swagger. Built for the confident Patil generation.</h1>
            <p className="hero-copy__lede">
              Patil Mens Wear brings together Maharashtrian pride, premium tailoring, and everyday-ready menswear for
              men who carry culture with confidence. From festive statements to daily drip, every fit is designed to
              feel sharp, local, and modern.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="primary-button">
                Shop Now
              </Link>
              <Link to="/products?category=Formal+Wear" className="ghost-button icon-button">
                Explore Collection
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-trust-grid">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <Icon size={18} />
                  <span>
                    <strong>{value}</strong> {label}
                  </span>
                </div>
              ))}
            </div>
          </div>


          <div className="hero-panel">
            <div className="hero-panel__card">

              {/* Monogram & rule */}
              <div className="hero-panel__monogram-row">
                <span className="hero-panel__monogram">PMW</span>
                <span className="hero-panel__est">Est. 2024</span>
              </div>
              <div className="hero-panel__gold-rule" />

              {/* Editorial headline */}
              <h3 className="hero-panel__headline">
                The art of Maharashtrian menswear - where heritage meets precision.
              </h3>

              {/* 3-column luxury brand promises */}
              <div className="hero-panel__luxe-stats">
                <div className="hero-panel__luxe-stat">
                  <span className="hero-panel__stat-num">100%</span>
                  <span className="hero-panel__stat-label">Premium Craft</span>
                </div>
                <div className="hero-panel__luxe-stat hero-panel__luxe-stat--center">
                  <span className="hero-panel__stat-num">6+</span>
                  <span className="hero-panel__stat-label">Collections</span>
                </div>
                <div className="hero-panel__luxe-stat">
                  <span className="hero-panel__stat-num">Infinity</span>
                  <span className="hero-panel__stat-label">Confidence</span>
                </div>
              </div>

              <div className="hero-panel__gold-rule hero-panel__gold-rule--faded" />

              {/* Pull-quote */}
              <div className="hero-panel__quote-block">
                <span className="hero-panel__quote-mark">&quot;</span>
                <p className="hero-panel__quote">
                  Worn with pride. Crafted with purpose. Every piece is a statement of who we are.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-heading">
            <p className="section-kicker">Style edits</p>
            <h2>Browse by mood, moment, and the way you carry yourself</h2>
            <p>Each category is shaped to feel like a confident local menswear brand, not a generic catalog dump.</p>
          </div>

          <div className="category-grid">
            {categoryCards.map((category) => (
              <Link key={category.name} to={`/products?category=${encodeURIComponent(category.name)}`} className="category-card">
                <img src={CATEGORY_IMAGES[category.name]} alt={category.name} width="900" height="1125" loading="lazy" />
                <div className="category-card__overlay">
                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.blurb}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block section-block--tinted">
        <div className="container">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Patil picks</p>
              <h2>Trending fits with premium energy and everyday confidence</h2>
            </div>
            <Link to="/products" className="ghost-button">
              View all products
            </Link>
          </div>

          {loading ? (
            <StatePanel title="Loading the collection" description="Pulling featured products for the homepage..." />
          ) : error ? (
            <StatePanel title="Could not load featured products" description={error} />
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="container editorial-grid">
          {launches.map((entry) => (
            <Link key={entry.title} to={entry.cta} className="editorial-panel">
              <p className="section-kicker">{entry.eyebrow}</p>
              <h2>{entry.title}</h2>
              <div className="editorial-panel__cta">
                <span>Explore collection</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
