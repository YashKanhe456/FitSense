import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <p className="footer-eyebrow">Patil Mens Wear</p>
          <h3>Premium menswear shopping with clean browsing, ordering, and admin management.</h3>
          <p>
            Premium casual and formal essentials for daily wear, festive looks, and a polished shopping experience.
          </p>
        </div>

        <div>
          <p className="footer-eyebrow">Browse</p>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/products">Shop</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/my-orders">My Orders</Link>
          </div>
        </div>

        <div>
          <p className="footer-eyebrow">Support</p>
          <p>Mumbai, Maharashtra</p>
          <p>support@patilmenswear.com</p>
          <p>Cash on Delivery available on eligible orders.</p>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>Copyright {new Date().getFullYear()} Patil Mens Wear</span>
        <span>Built with React, Express, PostgreSQL, and clean role-based flows.</span>
      </div>
    </footer>
  );
}

export default Footer;
