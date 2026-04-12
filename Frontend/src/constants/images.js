/**
 * Product Image Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * Currently using Unsplash placeholder URLs for demo purposes.
 *
 * TO USE LOCAL IMAGES INSTEAD:
 *   1. Place your image files in: Frontend/src/assets/products/
 *   2. Import them here:
 *      import shirtWhite from '../assets/products/shirt_white.jpg';
 *   3. Replace the URL strings below with the imported variables.
 *
 * All product cards, detail pages, and the admin panel read images
 * from the database (imageUrl field). To update images:
 *   - Edit and re-run: node Backend/seeder.js
 *   - OR use the Admin > Edit Product panel to update image URLs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x500?text=Product+Image';

export const PRODUCT_IMAGES = {
  // Shirts
  SHIRT_WHITE: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
  SHIRT_BLUE:  'https://images.unsplash.com/photo-1603252110-1e2f02b21d00?auto=format&fit=crop&w=800&q=80',
  SHIRT_CHECK: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=800&q=80',

  // T-Shirts
  TSHIRT_WHITE:   'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
  TSHIRT_GRAPHIC: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
  TSHIRT_POLO:    'https://images.unsplash.com/photo-1625910513422-3b5b8d04d51a?auto=format&fit=crop&w=800&q=80',

  // Pants / Trousers
  PANTS_CHINO:  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
  PANTS_FORMAL: 'https://images.unsplash.com/photo-1548811087-a3b48f16c4fa?auto=format&fit=crop&w=800&q=80',

  // Jeans
  JEANS_DARK:  'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
  JEANS_LIGHT: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',

  // Formal
  SUIT_CHARCOAL: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4742?auto=format&fit=crop&w=800&q=80',
  BLAZER_NAVY:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',

  // Ethnic / Traditional
  SHERWANI_GOLD:   'https://images.unsplash.com/photo-1585914924626-15adac1e6402?auto=format&fit=crop&w=800&q=80',
  SHERWANI_MAROON: 'https://images.unsplash.com/photo-1620015509740-f192b0be6e19?auto=format&fit=crop&w=800&q=80',
  KURTA_NAVY:      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
  KURTA_WHITE:     'https://images.unsplash.com/photo-1603204961502-ad185f3debb1?auto=format&fit=crop&w=800&q=80',
  NEHRU_EMERALD:   'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  INDO_WESTERN:    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
};
