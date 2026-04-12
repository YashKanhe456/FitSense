import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import StatePanel from '../../components/StatePanel';
import { apiServices } from '../../services/api';
import { formatCurrency } from '../../utils/storefront';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState('');

  const loadOrders = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const { data } = await apiServices.getAllOrders();
      setOrders(data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    const haystack = [
      order._id,
      order.user?.name,
      order.user?.email,
      ...order.orderItems.map((item) => item.name)
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return matchesStatus && (!normalizedSearch || haystack.includes(normalizedSearch));
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      await apiServices.updateOrderStatus(orderId, status);
      toast.success('Order status updated.');
      await loadOrders({ silent: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update status.');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return <StatePanel title="Loading orders" description="Preparing the admin orders view…" />;
  }

  if (error) {
    return <StatePanel title="Could not load orders" description={error} />;
  }

  return (
    <section className="admin-page">
      <div className="section-heading section-heading--wide">
        <p className="section-kicker">Manage Orders</p>
        <h1>Review and update order progress</h1>
        <p>Only admins can access this area and update order statuses.</p>
      </div>

      <div className="admin-mini-stats">
        <div><strong>{orders.length}</strong><span>Total orders</span></div>
        <div><strong>{orders.filter((order) => order.orderStatus === 'Pending').length}</strong><span>Pending</span></div>
        <div><strong>{orders.filter((order) => order.orderStatus === 'Delivered').length}</strong><span>Delivered</span></div>
        <div><strong>{formatCurrency(orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0))}</strong><span>Gross value</span></div>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by order, customer, or product…" aria-label="Search orders" autoComplete="off"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button type="button" className="ghost-button" onClick={() => loadOrders({ silent: true })} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <StatePanel title="No orders yet" description="Orders will appear here once customers complete checkout." />
      ) : (
        <div className="stacked-list">
          {filteredOrders.map((order) => (
            <article key={order._id} className="admin-order-card admin-order-card--expanded">
              <div className="admin-order-card__top">
                <div>
                  <strong>#{order._id.slice(-8)}</strong>
                  <p>{order.user?.name || 'Customer'} - {order.user?.email || 'No email available'}</p>
                </div>
                <span className="stock-pill in-stock">{formatCurrency(order.totalPrice)}</span>
              </div>

              <div className="admin-order-card__meta-grid">
                <div>
                  <span>Date</span>
                  <strong>{new Date(order.createdAt).toLocaleDateString('en-IN')}</strong>
                </div>
                <div>
                  <span>Items</span>
                  <strong>{order.orderItems.length}</strong>
                </div>
                <div>
                  <span>Payment</span>
                  <strong>{order.paymentMethod}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{order.orderStatus}</strong>
                </div>
              </div>

              <div className="admin-order-card__actions">
                <select
                  value={order.orderStatus}
                  onChange={(event) => handleStatusChange(order._id, event.target.value)}
                  disabled={updatingId === order._id}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ghost-button small-button"
                  onClick={() => setExpandedOrderId((current) => (current === order._id ? '' : order._id))}
                >
                  {expandedOrderId === order._id ? 'Hide details' : 'View details'}
                </button>
              </div>

              {expandedOrderId === order._id ? (
                <div className="admin-order-card__details">
                  <div>
                    <strong>Shipping address</strong>
                    <p>
                      {order.shippingAddress.fullName}, {order.shippingAddress.phone}
                    </p>
                    <p>
                      {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                    </p>
                  </div>
                  <div>
                    <strong>Items</strong>
                    <div className="stacked-list">
                      {order.orderItems.map((item) => (
                        <div key={`${order._id}-${item.product}-${item.size}`} className="stacked-row">
                          <div>
                            <strong>{item.name}</strong>
                            <p>{item.size ? `Size ${item.size}` : 'Standard'} - Qty {item.quantity}</p>
                          </div>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ManageOrders;
