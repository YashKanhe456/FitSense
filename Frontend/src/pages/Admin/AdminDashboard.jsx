import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleAlert, Package, RefreshCw, ShoppingCart, Users } from 'lucide-react';
import { resolveImage } from '../../assets';
import { apiServices } from '../../services/api';
import StatePanel from '../../components/StatePanel';
import { formatCompactCurrency, formatCurrency } from '../../utils/storefront';

const statusTransitions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  const loadDashboard = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await apiServices.getAdminDashboard();
      setDashboard(data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    if (!dashboard) return [];

    const { summary } = dashboard;

    return [
      {
        label: 'Revenue',
        value: formatCurrency(summary.totalRevenue),
        meta: `${summary.totalOrders} total order(s)`,
        to: '/admin/orders',
        icon: ShoppingCart
      },
      {
        label: 'Delivered revenue',
        value: formatCurrency(summary.deliveredRevenue),
        meta: `${summary.deliveredOrders} delivered order(s)`,
        to: '/admin/orders',
        icon: ArrowRight
      },
      {
        label: 'Customers',
        value: summary.totalCustomers,
        meta: `${summary.processingOrders} order(s) in process`,
        to: '/admin/customers',
        icon: Users
      },
      {
        label: 'Low stock alerts',
        value: summary.lowStockCount,
        meta: `${summary.cancelledOrders} cancelled order(s)`,
        to: '/admin/products',
        icon: CircleAlert
      }
    ];
  }, [dashboard]);

  const orderHealth = useMemo(() => {
    if (!dashboard) return [];

    const { summary } = dashboard;
    return [
      { label: 'Pending', value: summary.pendingOrders },
      { label: 'Processing', value: summary.processingOrders },
      { label: 'Delivered', value: summary.deliveredOrders },
      { label: 'Cancelled', value: summary.cancelledOrders }
    ];
  }, [dashboard]);

  if (loading) {
    return <StatePanel title="Loading dashboard" description="Collecting products and order metrics..." />;
  }

  if (error || !dashboard) {
    return <StatePanel title="Could not load admin dashboard" description={error || 'No dashboard data available.'} />;
  }

  const { monthlySales, categoryBreakdown, topProducts, topCustomers, lowStockProducts, recentOrders } = dashboard;
  const maxRevenue = Math.max(...monthlySales.map((entry) => entry.revenue), 1);
  const maxCategoryRevenue = Math.max(...categoryBreakdown.map((entry) => entry.revenue), 1);
  const categoryLeader = categoryBreakdown[0];
  const topProduct = topProducts[0];
  const topCustomer = topCustomers[0];

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await apiServices.updateOrderStatus(orderId, status);
      toast.success('Order status updated.');
      await loadDashboard({ silent: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update order status.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  return (
    <section className="admin-page">
      <div className="section-heading section-heading--inline">
        <div>
          <p className="section-kicker">Dashboard Overview</p>
          <h1>Run the store from one operational view</h1>
          <p>Track revenue, order flow, customer value, stock pressure, and best-performing merchandise.</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => loadDashboard({ silent: true })} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing' : 'Refresh data'}
        </button>
      </div>

      <div className="admin-actions-grid">
        <Link to="/admin/products/new" className="admin-action-card admin-action-card--cta">
          <Package size={20} />
          <div>
            <strong>Add a new product</strong>
            <p>Create a fresh catalog listing with pricing, sizes, stock, and featured placement.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/admin/orders" className="admin-action-card">
          <ShoppingCart size={20} />
          <div>
            <strong>Process incoming orders</strong>
            <p>Update pending orders quickly so operations keep moving.</p>
          </div>
        </Link>
        <Link to="/admin/customers" className="admin-action-card">
          <Users size={20} />
          <div>
            <strong>Review customer value</strong>
            <p>See repeat shoppers, recent spend, and accounts worth nurturing.</p>
          </div>
        </Link>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.to} className="admin-stat-card admin-stat-card--interactive">
              <div className="admin-stat-card__icon">
                <Icon size={18} />
              </div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <p>{stat.meta}</p>
            </Link>
          );
        })}
      </div>

      <div className="admin-dashboard-grid admin-dashboard-grid--secondary">
        <article className="admin-card">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Operations pulse</p>
              <h2>Order health at a glance</h2>
            </div>
            <span className="muted-copy">{dashboard.summary.totalOrders} order(s) tracked</span>
          </div>

          <div className="admin-mini-stats">
            {orderHealth.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="stacked-list">
            <div className="stacked-row">
              <div>
                <strong>Top category</strong>
                <p>{categoryLeader ? `${categoryLeader._id} is leading revenue right now.` : 'No sales yet.'}</p>
              </div>
              <span>{categoryLeader ? formatCurrency(categoryLeader.revenue) : formatCurrency(0)}</span>
            </div>
            <div className="stacked-row">
              <div>
                <strong>Best product</strong>
                <p>{topProduct ? `${topProduct.name} has sold ${topProduct.unitsSold} unit(s).` : 'No sales yet.'}</p>
              </div>
              <span>{topProduct ? formatCurrency(topProduct.revenue) : formatCurrency(0)}</span>
            </div>
            <div className="stacked-row">
              <div>
                <strong>Top customer</strong>
                <p>{topCustomer ? `${topCustomer.name} has placed ${topCustomer.orders} order(s).` : 'No customer revenue yet.'}</p>
              </div>
              <span>{topCustomer ? formatCurrency(topCustomer.revenue) : formatCurrency(0)}</span>
            </div>
          </div>
        </article>

        <article className="admin-card">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Revenue mix</p>
              <h2>Best-performing categories</h2>
            </div>
            <span className="muted-copy">Based on non-cancelled orders</span>
          </div>

          <div className="admin-progress-list">
            {categoryBreakdown.map((entry) => (
              <div key={entry._id} className="admin-progress-row">
                <div className="admin-progress-row__head">
                  <strong>{entry._id}</strong>
                  <span>{formatCurrency(entry.revenue)}</span>
                </div>
                <div className="admin-progress-row__track">
                  <div
                    className="admin-progress-row__fill"
                    style={{ width: `${Math.max((entry.revenue / maxCategoryRevenue) * 100, 8)}%` }}
                  />
                </div>
                <p>{entry.unitsSold} unit(s) sold</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="admin-dashboard-grid">
        <article className="admin-card">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Sales trend</p>
              <h2>Last 6 months</h2>
            </div>
            <span className="muted-copy">Gross revenue excluding cancelled orders</span>
          </div>

          <div className="sales-bars">
            {monthlySales.map((entry) => (
              <div key={entry.key} className="sales-bar">
                <div className="sales-bar__track">
                  <div
                    className="sales-bar__fill"
                    style={{ height: `${Math.max((entry.revenue / maxRevenue) * 100, entry.revenue ? 12 : 0)}%` }}
                  />
                </div>
                <strong>{entry.label}</strong>
                <span>{formatCompactCurrency(entry.revenue)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Recent orders</p>
              <h2>Latest activity</h2>
            </div>
            <Link to="/admin/orders" className="ghost-button">View all</Link>
          </div>

          {recentOrders.length === 0 ? (
            <StatePanel title="No orders yet" description="Once the store receives orders, they will appear here." />
          ) : (
            <div className="stacked-list">
              {recentOrders.map((order) => (
                <div key={order._id} className="admin-order-card">
                  <div className="admin-order-card__top">
                    <div>
                      <strong>#{order._id.slice(-8)}</strong>
                      <p>{order.user?.name || 'Customer'} - {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className="stock-pill in-stock">{formatCurrency(order.totalPrice)}</span>
                  </div>
                  <p className="admin-order-card__items">
                    {order.orderItems.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                  </p>
                  <div className="admin-order-card__actions">
                    <select
                      value={order.orderStatus}
                      onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                      disabled={updatingOrderId === order._id}
                    >
                      {statusTransitions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <Link to="/admin/orders" className="ghost-button small-button">Open orders</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <div className="admin-dashboard-grid admin-dashboard-grid--secondary">
        <article className="admin-card">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Top products</p>
              <h2>Best sellers</h2>
            </div>
            <Link to="/admin/products/new" className="ghost-button">Add product</Link>
          </div>

          <div className="stacked-list">
            {topProducts.map((product) => (
              <div key={product._id} className="media-row">
                <img src={resolveImage(product.image)} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.unitsSold} units sold</p>
                </div>
                <span>{formatCurrency(product.revenue)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Top customers</p>
              <h2>Highest value accounts</h2>
            </div>
            <Link to="/admin/customers" className="ghost-button">Open customers</Link>
          </div>

          <div className="stacked-list">
            {topCustomers.map((customer) => (
              <div key={customer._id} className="stacked-row">
                <div>
                  <strong>{customer.name}</strong>
                  <p>{customer.email} - {customer.orders} order(s)</p>
                </div>
                <span>{formatCurrency(customer.revenue)}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="admin-dashboard-grid admin-dashboard-grid--secondary">
        <article className="admin-card">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Low stock</p>
              <h2>Replenishment watchlist</h2>
            </div>
            <Link to="/admin/products" className="ghost-button">Manage products</Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <StatePanel title="Inventory looks healthy" description="There are no products under the low-stock threshold." />
          ) : (
            <div className="stacked-list">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="media-row">
                  <img src={resolveImage(product.image)} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.category}</p>
                  </div>
                  <span>{product.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="admin-card">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Catalog focus</p>
              <h2>What needs attention</h2>
            </div>
            <Link to="/admin/products" className="ghost-button">Open catalog</Link>
          </div>

          <div className="stacked-list">
            <div className="stacked-row">
              <div>
                <strong>Products in store</strong>
                <p>Keep featured pieces fresh and high-intent categories populated.</p>
              </div>
              <span>{dashboard.summary.totalProducts}</span>
            </div>
            <div className="stacked-row">
              <div>
                <strong>Low stock count</strong>
                <p>These need replenishment before they start affecting conversion.</p>
              </div>
              <span>{dashboard.summary.lowStockCount}</span>
            </div>
            <div className="stacked-row">
              <div>
                <strong>Delivered revenue</strong>
                <p>Useful benchmark for fulfilled sales instead of placed-only revenue.</p>
              </div>
              <span>{formatCurrency(dashboard.summary.deliveredRevenue)}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboard;
