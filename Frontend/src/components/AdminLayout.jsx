import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Menu, Package, PlusCircle, ShoppingCart, Store, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Manage Products', icon: Package },
  { to: '/admin/products/new', label: 'Add Product', icon: PlusCircle },
  { to: '/admin/orders', label: 'Manage Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users }
];

function AdminLayout() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Administrator';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-shell">
      {/* Mobile top bar */}
      <div className="admin-mobile-bar">
        <button
          type="button"
          className="admin-mobile-bar__toggle"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setSidebarOpen((o) => !o)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="admin-mobile-bar__title">Patil Mens Wear - Admin</span>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div>
          <p className="admin-sidebar__eyebrow">Admin Panel</p>
          <h1>Patil Mens Wear</h1>
          <p className="admin-sidebar__meta">Signed in as {user?.name || 'Administrator'}</p>
          <div className="admin-sidebar__card">
            <strong>{firstName}, your control room is live.</strong>
            <span>Review revenue, update orders, and keep stock healthy from one place.</span>
          </div>
        </div>

        <nav className="admin-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `admin-nav__link ${isActive ? 'is-active' : ''}`}
              onClick={closeSidebar}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <NavLink to="/" className="admin-nav__store-link" onClick={closeSidebar}>
            <Store size={18} />
            <span>Back to Store</span>
          </NavLink>
        </div>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
