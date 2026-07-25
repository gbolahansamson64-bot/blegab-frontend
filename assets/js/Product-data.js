/* =========================================================
   PRODUCT / COLLECTION SEARCH DATA
   Placeholder list so search has something to match against
   before the backend is connected.

   TO REPLACE LATER: swap the array below for a live fetch, e.g.
     fetch('/api/products')
       .then(res => res.json())
       .then(data => { window.BLEGAB_PRODUCTS = data; });

   Each item needs a "name" (matched against what's typed)
   and a "url" (where the person is sent).
   ========================================================= */


   
window.BLEGAB_PRODUCTS = [
  { name: 'Body Wave Wigs', url: 'shop.html?category=body-wave' },
  { name: 'Bone Straight Wigs', url: 'shop.html?category=bone-straight' },
  { name: 'Deep Wave Wigs', url: 'shop.html?category=deep-wave' },
  { name: 'Highlight Wigs', url: 'shop.html?category=highlight' },
  { name: 'Bob Wigs', url: 'shop.html?category=bob' },
  { name: 'Lace Front Wigs', url: 'shop.html?category=lace-front' },
  { name: 'Full Lace Wigs', url: 'shop.html?category=full-lace' },
  { name: 'HD Lace Wigs', url: 'shop.html?category=hd-lace' },
  { name: 'Custom Wigs', url: 'shop.html?category=custom' }
];

/* =========================================================
   SHOP GRID PRODUCTS — powers the product grid on shop.html
   TO REPLACE LATER: swap for a live fetch from /api/products
   ========================================================= */
window.BLEGAB_SHOP_PRODUCTS = [
  { id: 'body-wave',     name: 'Body Wave Wig',     price: 320, badge: 'Best Seller', image: 'assets/images/shopimage/bodywave.webp',     alt: 'Body Wave Wig',     url: 'shop.html?category=body-wave' },
  { id: 'bone-straight', name: 'Bone Straight Wig', price: 300, badge: null,          image: 'assets/images/shopimage/bonestraight.webp', alt: 'Bone Straight Wig', url: 'shop.html?category=bone-straight' },
  { id: 'deep-wave',     name: 'Deep Wave Wig',     price: 320, badge: null,          image: 'assets/images/shopimage/deepwave.webp',     alt: 'Deep Wave Wig',     url: 'shop.html?category=deep-wave' },
  { id: 'highlight',     name: 'Highlight Wig',     price: 330, badge: null,          image: 'assets/images/shopimage/highlight.webp',    alt: 'Highlight Wig',     url: 'shop.html?category=highlight' },
  { id: 'custom-colored',name: 'Custom Colored Wig',price: 330, badge: null,          image: 'assets/images/shopimage/customcolored.webp',alt: 'Custom Colored Wig',url: 'shop.html?category=custom-colored' },
  { id: 'bob',           name: 'Bob Wig',           price: 280, badge: null,          image: 'assets/images/shopimage/bob.webp',           alt: 'Bob Wig',           url: 'shop.html?category=bob' },
  { id: 'honey-blonde',  name: 'Honey Blonde Wig',  price: 340, badge: null,          image: 'assets/images/shopimage/honeyblonde.webp',   alt: 'Honey Blonde Wig',  url: 'shop.html?category=honey-blonde' },
  { id: 'loose-wave',    name: 'Loose Wave Wig',    price: 310, badge: null,          image: 'assets/images/shopimage/loosewave.webp',     alt: 'Loose Wave Wig',    url: 'shop.html?category=loose-wave' },
  { id: 'kinky-curly',   name: 'Kinky Curly Wig',   price: 330, badge: null,          image: 'assets/images/shopimage/kinkycurly.webp',    alt: 'Kinky Curly Wig',   url: 'shop.html?category=kinky-curly' },
  { id: 'midnight-allure', name: 'Blegab Midnight Allure', price: 399, badge: null,   image: 'assets/images/shopimage/blegabmidnightallure.webp', alt: 'Blegab Midnight Allure', url: 'shop.html?category=midnight-allure' }
];