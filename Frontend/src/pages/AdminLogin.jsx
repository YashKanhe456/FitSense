import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user, logout } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/admin/dashboard';
  const forceRelogin = Boolean(location.state?.forceRelogin);

  useEffect(() => {
    if (forceRelogin && user && user.role !== 'admin') {
      logout();
      toast.error('Please sign in with an admin account.');
      return;
    }

    if (user?.role === 'admin') {
      navigate(redirectTo, { replace: true });
    }
  }, [forceRelogin, logout, navigate, redirectTo, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const loggedInUser = await login(form.email, form.password);

      if (loggedInUser.role !== 'admin') {
        logout();
        toast.error('This portal is only for admin accounts.');
        return;
      }

      toast.success('Admin access granted.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-auth-section">
      <div className="admin-auth-panel">
        <div className="admin-auth-card">
          <span className="admin-auth-card__badge">
            <ShieldCheck size={16} />
            Admin Access
          </span>
          <h1>Sign in to the control room</h1>
          <p>
            This login is separate from the customer storefront and is reserved for staff managing
            products, orders, and customer operations.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Admin Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
                spellCheck={false}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Checking access...' : 'Login as Admin'}
            </button>
          </form>

          <div className="admin-auth-links">
            <Link to="/login" className="ghost-button">Customer Login</Link>
            <Link to="/" className="ghost-button">Back to Store</Link>
          </div>
        </div>

        <div className="admin-auth-aside">
          <p className="section-kicker">Private Workspace</p>
          <h2>Everything your team needs in one place.</h2>
          <ul className="admin-auth-list">
            <li>Track orders and update fulfillment status quickly.</li>
            <li>Manage product catalog, stock visibility, and new launches.</li>
            <li>Review customers and store activity from the admin dashboard.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;
