import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import StatePanel from '../components/StatePanel';
import { useCart } from '../context/CartContext';
import { apiServices } from '../services/api';
import { formatCurrency } from '../utils/storefront';

const initialForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: ''
};

function Checkout() {
  const navigate = useNavigate();
  const { items, summary, clearCart, checkoutDraft, setCheckoutDraft, clearCheckoutDraft } = useCart();
  const [form, setForm] = useState(() => checkoutDraft || initialForm);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const orderItems = useMemo(
    () => items.map((item) => ({ product: item.productId, quantity: item.quantity, size: item.size || '' })),
    [items]
  );

  if (items.length === 0) {
    return (
      <StatePanel
        title="Checkout is unavailable"
        description="Your cart is empty, so there is nothing to place right now."
        action={<Link to="/products" className="primary-button">Browse Products</Link>}
      />
    );
  }

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setForm((current) => {
      const nextForm = { ...current, [event.target.name]: nextValue };
      setCheckoutDraft(nextForm);
      return nextForm;
    });
    setFormErrors([]);
  };

  const validateCheckoutForm = () => {
    const errors = [];

    if (form.fullName.trim().length < 3) {
      errors.push('Full name must be at least 3 characters long.');
    }

    if (form.phone.trim().length < 10) {
      errors.push('Phone number must be at least 10 digits long.');
    }

    if (form.address.trim().length < 10) {
      errors.push('Address must be at least 10 characters long.');
    }

    if (!form.city.trim()) {
      errors.push('City is required.');
    }

    if (!form.state.trim()) {
      errors.push('State is required.');
    }

    if (form.pincode.trim().length < 6) {
      errors.push('Pincode must be at least 6 characters long.');
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    const validationErrors = validateCheckoutForm();
    if (validationErrors.length > 0) {
      setFormErrors(validationErrors);
      toast.error(validationErrors[0]);
      return;
    }

    try {
      setLoading(true);

      const { data } = await apiServices.createOrder({
        orderItems,
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim()
        },
        paymentMethod: 'COD'
      });

      clearCart();
      clearCheckoutDraft();
      sessionStorage.setItem(
      'fitsenseLastOrder',
        JSON.stringify({
          orderId: data.data._id,
          totalPrice: data.data.totalPrice
        })
      );
      toast.success('Order placed successfully.');
      navigate('/order-success', {
        replace: true,
        state: {
          orderId: data.data._id,
          totalPrice: data.data.totalPrice
        }
      });
    } catch (error) {
      const responseErrors = error.response?.data?.errors || [];
      setFormErrors(responseErrors);
      toast.error(responseErrors[0] || error.response?.data?.message || 'Unable to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-block">
      <div className="container checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Checkout</p>
              <h1>Complete your shipping details</h1>
            </div>
            <span className="stock-pill in-stock">Payment: Cash on Delivery</span>
          </div>

          {formErrors.length > 0 ? (
            <div className="admin-inline-error">
              <strong>Fix these details before placing the order:</strong>
              <ul>
                {formErrors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="form-grid">
            <label>
              Full Name
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                minLength={3}
                autoComplete="name"
                required
              />
            </label>
            <label>
              Phone
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                minLength={10}
                autoComplete="tel"
                inputMode="numeric"
                required
              />
            </label>
            <label className="form-grid__full">
              Address
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                minLength={10}
                autoComplete="street-address"
                required
              />
            </label>
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} autoComplete="address-level2" required />
            </label>
            <label>
              State
              <input name="state" value={form.state} onChange={handleChange} autoComplete="address-level1" required />
            </label>
            <label>
              Pincode
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                minLength={6}
                autoComplete="postal-code"
                inputMode="numeric"
                required
              />
            </label>
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </form>

        <aside className="summary-card">
          <p className="section-kicker">Order Summary</p>
          <h2>{items.length} item(s) ready</h2>
          <div className="summary-list">
            {items.map((item) => (
              <div key={item.key} className="summary-list__row">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.size ? `Size ${item.size}` : 'Standard'} - Qty {item.quantity}</p>
                </div>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(summary.subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{summary.shipping === 0 ? 'Free' : formatCurrency(summary.shipping)}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>{formatCurrency(summary.total)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
