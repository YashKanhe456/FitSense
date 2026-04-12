import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user, logout } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/';
  const adminOnly = Boolean(location.state?.adminOnly);
  const forceRelogin = Boolean(location.state?.forceRelogin);

  useEffect(() => {
    if (forceRelogin && user && user.role !== 'admin') {
      logout();
      return;
    }

    if (user && (!adminOnly || user.role === 'admin')) {
      navigate(redirectTo, { replace: true });
    }
  }, [adminOnly, forceRelogin, logout, navigate, redirectTo, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      await login(form.email, form.password);
      toast.success('Logged in successfully.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <p className="section-kicker">{adminOnly ? 'Admin Access' : 'Welcome back'}</p>
        <h1>{adminOnly ? 'Login to open the admin dashboard' : 'Login to continue shopping'}</h1>
        <p>
          {adminOnly
            ? 'Use an admin account to access products, orders, customers, and dashboard controls.'
            : 'Access checkout, orders, and your account details securely.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
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
              autoComplete={adminOnly ? 'current-password' : 'current-password'}
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-helper">
          Don&apos;t have an account? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
