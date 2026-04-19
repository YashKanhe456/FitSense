import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../utils/storefront';

const STORAGE_KEY = 'fitsenseCart';
const WISHLIST_STORAGE_KEY = 'fitsenseWishlist';
const CHECKOUT_STORAGE_KEY = 'fitsenseCheckoutDraft';
const CartContext = createContext(null);

const makeItemKey = (productId, size) => `${productId}::${size || 'nosize'}`;

const normalizeCart = (items) =>
  items.map((item) => ({
    ...item,
    key: makeItemKey(item.productId, item.size),
    quantity: Number(item.quantity) || 1,
    stock: Number(item.stock) || 0,
    price: Number(item.price) || 0,
    size: item.size || ''
  }));

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      return storedItems ? normalizeCart(JSON.parse(storedItems)) : [];
    } catch (error) {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      const storedItems = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
      return [];
    }
  });
  const [checkoutDraft, setCheckoutDraftState] = useState(() => {
    try {
      const storedDraft = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      return storedDraft ? JSON.parse(storedDraft) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (checkoutDraft) {
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutDraft));
      return;
    }

    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }, [checkoutDraft]);

  const addToCart = (product, quantity, size) => {
    const productId = product._id || product.id;
    const normalizedSize = size || '';
    const key = makeItemKey(productId, normalizedSize);
    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      return { success: false, message: 'This product is currently out of stock.' };
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.key === key);

      if (existingItem) {
        return currentItems.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, stock),
                stock
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          key,
          productId,
          name: product.name,
          image: product.image,
          price: Number(product.price),
          quantity: Math.min(quantity, stock),
          size: normalizedSize,
          stock
        }
      ];
    });

    return { success: true, message: 'Added to cart successfully.' };
  };

  const updateQuantity = (productId, size, quantity) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.key !== makeItemKey(productId, size)) {
          return item;
        }

        const nextQuantity = Math.max(1, Math.min(quantity, item.stock || quantity));
        return { ...item, quantity: nextQuantity };
      })
    );
  };

  const removeItem = (productId, size) => {
    setItems((currentItems) => currentItems.filter((item) => item.key !== makeItemKey(productId, size)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isWishlisted = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  const toggleWishlist = (product) => {
    const productId = product?._id || product?.id;
    if (!productId) {
      return { active: false };
    }

    let active = false;
    setWishlist((currentWishlist) => {
      if (currentWishlist.includes(productId)) {
        active = false;
        return currentWishlist.filter((id) => id !== productId);
      }

      active = true;
      return [...currentWishlist, productId];
    });

    return { active };
  };

  const setCheckoutDraft = (value) => {
    setCheckoutDraftState(value);
  };

  const clearCheckoutDraft = () => {
    setCheckoutDraftState(null);
  };

  const summary = useMemo(() => {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const total = subtotal + shipping;
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    return { subtotal, shipping, total, itemCount };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      wishlist,
      checkoutDraft,
      summary,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      isWishlisted,
      toggleWishlist,
      setCheckoutDraft,
      clearCheckoutDraft
    }),
    [items, wishlist, checkoutDraft, summary, isWishlisted]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
