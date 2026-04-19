import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, User2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { summary } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  // Close on ESC key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || !menuRef.current) {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    const drawerNode = menuRef.current;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    drawerNode.focus();
    drawerNode.querySelector('[href], button:not([disabled])')?.focus();

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = [...drawerNode.querySelectorAll(focusableSelector)];
      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <Link to="/" className="site-logo" onClick={closeMenu}>
          <span className="site-logo__copy">
            <span className="site-logo__eyebrow">Men&apos;s Fashion</span>
            <span className="site-logo__title">FitSense</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="site-nav" aria-label="Primary">
          <NavLink to="/" className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}>
            Shop
          </NavLink>
          <NavLink
            to="/products?category=Formal+Wear"
            className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
          >
            Categories
          </NavLink>
        </nav>

        {/* Desktop actions */}
        <div className="site-actions">
          {user ? (
            <div className="site-user">
              <div className="site-user__copy">
                <span className="site-user__hello">Hello</span>
                <span className="site-user__name">{user.name?.split(' ')[0] || 'Member'}</span>
              </div>
              {user.role === 'admin' ? (
                <Link to="/admin/dashboard" className="ghost-button">Dashboard</Link>
              ) : (
                <Link to="/my-orders" className="ghost-button">My Orders</Link>
              )}
              <button type="button" className="ghost-button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="site-auth-links">
              <Link to="/login" className="ghost-button icon-button"><User2 size={18} />Login</Link>
              {/*        <Link to="/admin/login" className="ghost-button">Admin Login</Link> */}
              <Link to="/register" className="primary-button small-button">Register</Link>
            </div>
          )}
          <Link to="/cart" className="cart-button" aria-label="View cart">
            <ShoppingBag size={19} />
            <span>Cart</span>
            <strong>{summary.itemCount}</strong>
          </Link>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="mobile-nav-actions">
          <Link to="/cart" className="cart-button" aria-label="View cart">
            <ShoppingBag size={19} />
            <strong>{summary.itemCount}</strong>
          </Link>
          <button
            type="button"
            className="hamburger-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="mobile-nav-overlay" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div
        className={`mobile-nav-drawer ${menuOpen ? 'is-open' : ''}`}
        ref={menuRef}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        tabIndex={-1}
      >
        <nav className="mobile-nav__links" aria-label="Mobile navigation">
          <NavLink to="/" className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`} onClick={closeMenu}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`} onClick={closeMenu}>Shop</NavLink>
          <NavLink to="/products?category=Formal+Wear" className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`} onClick={closeMenu}>Categories</NavLink>
          <NavLink to="/cart" className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`} onClick={closeMenu}>
            Cart {summary.itemCount > 0 && <span className="mobile-nav__badge">{summary.itemCount}</span>}
          </NavLink>
        </nav>

        <div className="mobile-nav__auth">
          {user ? (
            <>
              <p className="mobile-nav__greeting">Signed in as <strong>{user.name?.split(' ')[0]}</strong></p>
              {user.role === 'admin'
                ? <Link to="/admin/dashboard" className="ghost-button" onClick={closeMenu}>Admin Dashboard</Link>
                : <Link to="/my-orders" className="ghost-button" onClick={closeMenu}>My Orders</Link>
              }
              <button type="button" className="ghost-button danger-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="primary-button" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="ghost-button" onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
