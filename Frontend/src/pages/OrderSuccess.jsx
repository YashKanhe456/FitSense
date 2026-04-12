import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link, useLocation, Navigate } from 'react-router-dom';

function OrderSuccess() {
  const location = useLocation();
  const fallbackOrder = (() => {
    try {
      const storedValue = sessionStorage.getItem('patilMensWearLastOrder');
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
      return null;
    }
  })();
  const orderId = location.state?.orderId || fallbackOrder?.orderId;
  const totalPrice = location.state?.totalPrice ?? fallbackOrder?.totalPrice;

  if (!orderId) {
    return <Navigate to="/my-orders" replace />;
  }

  return (
    <section className="state-panel">
      <div className="state-panel__card success-card">
        <CheckCircle2 size={64} />
        <p className="section-kicker">Order confirmed</p>
        <h1>Thank you for shopping with Patil Mens Wear</h1>
        <p>Your order has been created successfully and the cart was cleared only after confirmation.</p>
        <div className="success-card__meta">
          <span>Order ID: {orderId}</span>
          {totalPrice ? <span>Total: Rs. {Number(totalPrice).toLocaleString('en-IN')}</span> : null}
        </div>
        <div className="state-panel__action success-card__actions">
          <Link to="/products" className="primary-button">Continue Shopping</Link>
          <Link to="/my-orders" className="ghost-button">View My Orders</Link>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccess;
