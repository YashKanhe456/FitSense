import React, { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import StatePanel from '../components/StatePanel';
import { apiServices } from '../services/api';

const categories = ['All', 'Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Formal Wear', 'Casual Wear'];
const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'stock-desc', label: 'Most stocked' }
];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');

  const selectedCategory = searchParams.get('category') || 'All';
  const searchTerm = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const featuredOnly = searchParams.get('featured') === 'true';
  const deferredSearchInput = useDeferredValue(searchInput);

  useEffect(() => {
    setSearchInput(searchTerm);
    setPriceMax(searchParams.get('priceMax') || '');
  }, [searchParams, searchTerm]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (sort) params.sort = sort;
        if (inStockOnly) params.inStock = true;
        if (featuredOnly) params.featured = true;
        if (priceMax) params.priceMax = priceMax;

        const { data } = await apiServices.getProducts(params);
        setProducts(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load products right now.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [featuredOnly, inStockOnly, priceMax, searchTerm, selectedCategory, sort]);

  const resultLabel = useMemo(() => {
    if (searchTerm && selectedCategory !== 'All') {
      return `Showing results for "${searchTerm}" in ${selectedCategory}`;
    }
    if (searchTerm) {
      return `Showing results for "${searchTerm}"`;
    }
    if (selectedCategory !== 'All') {
      return `Browsing ${selectedCategory}`;
    }
    return 'Browse the complete Patil Mens Wear catalog';
  }, [searchTerm, selectedCategory]);

  const updateFilters = (category, search) => {
    const nextParams = new URLSearchParams();
    if (category && category !== 'All') nextParams.set('category', category);
    if (search?.trim()) nextParams.set('search', search.trim());
    if (sort && sort !== 'newest') nextParams.set('sort', sort);
    if (inStockOnly) nextParams.set('inStock', 'true');
    if (featuredOnly) nextParams.set('featured', 'true');
    if (priceMax) nextParams.set('priceMax', priceMax);
    setSearchParams(nextParams);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    startTransition(() => {
      updateFilters(selectedCategory, searchInput);
    });
  };

  const updateQueryParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === '' || value === false || value === 'All' || value == null || value === 'newest') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }

    setSearchParams(nextParams);
  };

  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading section-heading--wide">
          <p className="section-kicker">Shop</p>
          <h1>Find premium menswear without the clutter</h1>
          <p>{resultLabel}</p>
        </div>

        <div className="shop-toolbar">
          <form className="shop-search" onSubmit={handleSubmit}>
            <Search size={18} />
            <input
              type="search"
              placeholder="Search by product name..."
              name="catalogSearch"
              aria-label="Search products by name"
              autoComplete="off"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit" className="primary-button small-button">
              Search
            </button>
          </form>

          <div className="catalog-controls">
            <label>
              Sort
              <select value={sort} onChange={(event) => updateQueryParam('sort', event.target.value)}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Max price
              <input
                type="number"
                min="0"
                placeholder="No cap..."
                name="priceMax"
                inputMode="numeric"
                value={priceMax}
                onChange={(event) => setPriceMax(event.target.value)}
                onBlur={() => updateQueryParam('priceMax', priceMax)}
              />
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => updateQueryParam('inStock', event.target.checked ? 'true' : '')}
              />
              In stock only
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(event) => updateQueryParam('featured', event.target.checked ? 'true' : '')}
              />
              Featured only
            </label>
          </div>

          <div className="filter-pills" aria-label="Category filters">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`filter-pill ${selectedCategory === category ? 'is-active' : ''}`}
                onClick={() => updateFilters(category, searchTerm)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <StatePanel title="Loading products" description="Fetching the latest items from the store..." />
        ) : error ? (
          <StatePanel title="Could not load products" description={error} />
        ) : products.length === 0 ? (
          <StatePanel
            title="No products found"
            description="Try another keyword or switch to a different category to see more products."
          />
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {deferredSearchInput !== searchInput ? <p className="muted-copy catalog-status">Preparing updated results...</p> : null}
      </div>
    </section>
  );
}

export default Products;
