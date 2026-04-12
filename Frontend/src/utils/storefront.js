export const FREE_SHIPPING_THRESHOLD = 2999;
export const STANDARD_SHIPPING_FEE = 149;

export const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export const formatCompactCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(value || 0));

export const getShippingProgress = (subtotal) => {
  const currentSubtotal = Number(subtotal || 0);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - currentSubtotal, 0);
  const progress = Math.min((currentSubtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return {
    remaining,
    progress,
    unlocked: remaining === 0
  };
};

export const getStockTone = (stock) => {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= 5) return 'low-stock';
  return 'in-stock';
};

export const getStockLabel = (stock) => {
  if (stock <= 0) return 'Out of stock';
  if (stock <= 5) return `Only ${stock} left`;
  return `${stock} in stock`;
};

export const getProductFlags = (product) => {
  const flags = [];

  if (product?.isFeatured) {
    flags.push('Featured');
  }

  if ((product?.stock || 0) <= 5 && (product?.stock || 0) > 0) {
    flags.push('Selling fast');
  }

  if ((product?.sizes || []).length >= 4) {
    flags.push('Multi-size');
  }

  return flags;
};
