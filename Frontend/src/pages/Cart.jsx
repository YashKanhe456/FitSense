import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { resolveImage } from '../assets';
import ConfirmDialog from '../components/ConfirmDialog';
import StatePanel from '../components/StatePanel';
import { useCart } from '../context/CartContext';

function Cart() {
  const navigate = useNavigate();
  const { items, summary, updateQuantity, removeItem, clearCart } = useCart();
  const [confirmState, setConfirmState] = useState({ open: false, mode: null, item: null });

  if (items.length === 0) {
    return (
      <StatePanel
        title="Your cart is empty"
        description="Add a few pieces from the collection and come back to review your order."
        action={<Link to="/products" className="primary-button">Continue Shopping</Link>}
      />
    );
  }

  const openRemoveDialog = (item) => setConfirmState({ open: true, mode: 'remove', item });
  const openClearDialog = () => setConfirmState({ open: true, mode: 'clear', item: null });
  const closeDialog = () => setConfirmState({ open: false, mode: null, item: null });

  const handleConfirm = () => {
    if (confirmState.mode === 'remove' && confirmState.item) {
      removeItem(confirmState.item.productId, confirmState.item.size);
      toast.success('Item removed from cart.');
    }

    if (confirmState.mode === 'clear') {
      clearCart();
      toast.success('Cart cleared successfully.');
    }

    closeDialog();
  };

  return (
    <section className="section-block">
      <div className="container cart-layout">
        <div className="cart-list">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Cart</p>
              <h1>Review your selected items</h1>
            </div>
            <button type="button" className="ghost-button danger-button" onClick={openClearDialog}>
              Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <article key={item.key} className="cart-item">
              <img src={resolveImage(item.image)} alt={item.name} className="cart-item__image" width="160" height="160" loading="lazy" />
              <div className="cart-item__content">
                <div>
                  <p className="cart-item__category">{item.size ? `Size ${item.size}` : 'Standard item'}</p>
                  <Link to={`/product/${item.productId}`} className="cart-item__title">
                    {item.name}
                  </Link>
                  <p className="cart-item__price">Rs. {Number(item.price).toLocaleString('en-IN')}</p>
                </div>

                <div className="cart-item__actions">
                  <div className="quantity-control">
                    <button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>

                  <button type="button" className="ghost-button danger-button icon-button" onClick={() => openRemoveDialog(item)}>
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-card">
          <p className="section-kicker">Summary</p>
          <h2>Order overview</h2>
          <div className="summary-row">
            <span>Items</span>
            <strong>{summary.itemCount}</strong>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>Rs. {summary.subtotal.toLocaleString('en-IN')}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{summary.shipping === 0 ? 'Free' : `Rs. ${summary.shipping.toLocaleString('en-IN')}`}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>Rs. {summary.total.toLocaleString('en-IN')}</strong>
          </div>
          <button type="button" className="primary-button" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link to="/products" className="ghost-button center-button">
            Continue Shopping
          </Link>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.mode === 'clear' ? 'Clear the entire cart?' : 'Remove this item?'}
        description={
          confirmState.mode === 'clear'
            ? 'This will remove every item from your cart.'
            : 'Only this size-specific cart item will be removed.'
        }
        confirmText={confirmState.mode === 'clear' ? 'Clear Cart' : 'Remove Item'}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </section>
  );
}

export default Cart;
