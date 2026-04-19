import shirtCategory from './categories/cat_shirt.jpg';
import tshirtCategory from './categories/cat_tshirt.jpg';
import pantsCategory from './categories/cat_pants.jpg';
import formalCategory from './categories/cat_nehru.jpg';

import blazerNavy from './products/blazer_navy.jpg';
import indoWestern from './products/indo_western.jpg';
import jeansDark from './products/jeans_dark.jpg';
import jeansLight from './products/jeans_light.jpg';
import nehruEmerald from './products/nehru_emerald.jpg';
import pantsChino from './products/pants_chino.jpg';
import sherwaniGold from './products/sherwani_gold.jpg';
import shirtCheck from './products/shirt_check.jpg';
import shirtWhite from './products/shirt_white.jpg';
import tshirtWhite from './products/tshirt_white.jpg';

export const PLACEHOLDER_IMAGE = 'https://placehold.co/720x900/f4efe6/1e1b18?text=FitSense';

export const CATEGORY_IMAGES = {
  Shirts: shirtCategory,
  'T-Shirts': tshirtCategory,
  Jeans: jeansDark,
  Pants: pantsCategory,
  'Formal Wear': formalCategory,
  'Casual Wear': shirtCheck
};

export const PRODUCT_IMAGES = {
  blazer_navy: blazerNavy,
  indo_western: indoWestern,
  jeans_dark: jeansDark,
  jeans_light: jeansLight,
  kurta_navy: nehruEmerald,
  nehru_emerald: nehruEmerald,
  pants_chino: pantsChino,
  sherwani_gold: sherwaniGold,
  shirt_check: shirtCheck,
  shirt_white: shirtWhite,
  tshirt_white: tshirtWhite
};

const apiOrigin = (() => {
  const configuredApiUrl = import.meta.env.VITE_API_URL;

  if (!configuredApiUrl || configuredApiUrl.startsWith('/')) {
    return '';
  }

  return configuredApiUrl.replace(/\/api\/?$/, '');
})();

export const resolveImage = (value) => {
  if (!value) return PLACEHOLDER_IMAGE;
  if (typeof value === 'string' && value.startsWith('/uploads/') && apiOrigin) {
    return `${apiOrigin}${value}`;
  }
  return PRODUCT_IMAGES[value] || CATEGORY_IMAGES[value] || value;
};
