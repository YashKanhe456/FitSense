import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveImage } from '../assets';
import StatePanel from '../components/StatePanel';
import { apiServices } from '../services/api';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await apiServices.getMyOrders();
        setOrders(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <StatePanel title="Loading your orders" description="Fetching your recent purchases..." />;
  }

  if (error) {
    return <StatePanel title="Could not load orders" description={error} />;
  }

  if (orders.length === 0) {
    return (
      <StatePanel
        title="No orders yet"
        description="Once you place an order, it will appear here with status and item details."
        action={<Link to="/products" className="primary-button">Start Shopping</Link>}
      />
    );
  }

  return (
    <section className="section-block">
      <div className="container orders-page">
        <div className="section-heading section-heading--wide">
          <p className="section-kicker">My Orders</p>
          <h1>Your recent purchases</h1>
          <p>Track order totals, statuses, and item summaries in one place.</p>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <div className="order-card__header">
                <div>
                  <p className="section-kicker">Order ID</p>
                  <h3>{order._id}</h3>
                </div>
                <div className="order-card__meta">
                  <span className={`stock-pill ${order.orderStatus === 'Cancelled' ? 'out-of-stock' : 'in-stock'}`}>
                    {order.orderStatus}
                  </span>
                  <strong>Rs. {Number(order.totalPrice).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <p className="order-card__date">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>

              <div className="order-items-preview">
                {order.orderItems.map((item) => (
                  <div key={`${order._id}-${item.product}-${item.size}`} className="order-item-preview">
                    <img src={resolveImage(item.image)} alt={item.name} width="160" height="160" loading="lazy" />
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.size ? `Size ${item.size}` : 'Standard'} - Qty {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MyOrders;
