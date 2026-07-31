/* =========================================================
   ADMIN DASHBOARD — PLACEHOLDER DATA
   Same pattern as Product-data.js: swap for a live fetch once
   the backend/admin API exists, e.g.
     fetch('/api/admin/overview')
       .then(res => res.json())
       .then(data => { window.BLEGAB_ADMIN_OVERVIEW = data; });
   ========================================================= */

window.BLEGAB_ADMIN_OVERVIEW = {
  // No hardcoded date — the calendar defaults to whatever "today" is
  // when the dashboard loads (see admin.js: renderStatCards()).
  stats: {
    salesToday: 0,
    salesWeek: 0,
    ordersTotal: 0,
    ordersPending: 0
  }
};

window.BLEGAB_ADMIN_LOW_STOCK = [
  { name: 'Raw Indian Body Wave', meta: '24" • 200% • 13x4 Lace', left: 3, image: 'assets/images/admin/lowstock/rawindianbodywave.webp' },
  { name: 'Bone Straight',        meta: '20" • 180% • 5x5 Lace',  left: 5, image: 'assets/images/admin/lowstock/bonestraight.webp' },
  { name: 'Deep Wave',            meta: '22" • 200% • 13x6 Lace', left: 2, image: 'assets/images/admin/lowstock/deepwave.webp' },
  { name: 'Kinky Curly',          meta: '18" • 150% • 4x4 Lace',  left: 4, image: 'assets/images/admin/lowstock/kinkycurly.webp' }
];

/* -----------------------------------------------------------
   ORDERS — single source of truth.
   Used by BOTH:
     - admin.html "Recent Orders" widget (admin.js: renderRecentOrders)
     - admin-orders.html full Orders page + detail modal (admin-orders.js)
   Every order needs ALL of these fields so the detail modal (which
   shows product/customer/payment info) has something to display no
   matter which page you clicked the order from.
   ----------------------------------------------------------- */
window.BLEGAB_ADMIN_ORDERS = [
  {
    id: 'BLG-1256',
    productName: 'Body Wave Lace Front Wig',
    productDescription: 'Premium 100% virgin human hair body wave wig with a pre-plucked hairline and bleached knots for a seamless, natural-looking scalp.',
    productSku: 'SKU-BW-2401-001',
    productImage: 'assets/images/admin/products/body-wave.webp',
    quantity: 1,
    length: '24 inches',
    density: '200%',
    laceType: '13x4 HD Lace',
    category: 'Lace Front Wigs',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    customerPhone: '+1 (555) 234-5678',
    country: 'United States',
    streetAddress: '742 Evergreen Terrace',
    apartment: 'Apt 4B',
    city: 'Springfield',
    state: 'Illinois',
    zipCode: '62701',
    paymentMethod: 'Credit Card (Visa ****4242)',
    paymentDate: 'May 24, 2025',
    paymentTime: '10:45 AM',
    total: 650.00,
    status: 'pending',
    orderDate: 'May 24, 2025'
  },
  {
    id: 'BLG-1255',
    productName: 'Deep Wave Full Lace Wig',
    productDescription: 'Luxurious deep wave texture with baby hair and bleached knots for a natural, undetectable hairline that blends effortlessly with your skin.',
    productSku: 'SKU-DW-2401-042',
    productImage: 'assets/images/admin/products/deep-wave.webp',
    quantity: 1,
    length: '22 inches',
    density: '180%',
    laceType: '13x6 Transparent Lace',
    category: 'Full Lace Wigs',
    customerName: 'Amanda Brown',
    customerEmail: 'amanda.brown@email.com',
    customerPhone: '+1 (555) 876-5432',
    country: 'Canada',
    streetAddress: '1500 Rue Sainte-Catherine',
    apartment: '',
    city: 'Montreal',
    state: 'Quebec',
    zipCode: 'H3G 1S8',
    paymentMethod: 'PayPal',
    paymentDate: 'May 24, 2025',
    paymentTime: '09:32 AM',
    total: 420.00,
    status: 'processing',
    orderDate: 'May 24, 2025'
  },
  {
    id: 'BLG-1254',
    productName: 'Bone Straight HD Lace Wig',
    productDescription: 'Silky straight texture with invisible HD lace that melts into any skin tone for a flawless, undetectable finish.',
    productSku: 'SKU-BS-2401-018',
    productImage: 'assets/images/admin/products/bone-straight.webp',
    quantity: 2,
    length: '20 inches',
    density: '150%',
    laceType: '5x5 HD Lace',
    category: 'HD Lace Wigs',
    customerName: 'Jessica Williams',
    customerEmail: 'jessica.w@email.com',
    customerPhone: '+1 (555) 345-6789',
    country: 'United Kingdom',
    streetAddress: '221B Baker Street',
    apartment: 'Flat 3',
    city: 'London',
    state: 'England',
    zipCode: 'NW1 6XE',
    paymentMethod: 'Credit Card (MasterCard ****8791)',
    paymentDate: 'May 24, 2025',
    paymentTime: '08:15 AM',
    total: 380.00,
    status: 'shipped',
    orderDate: 'May 24, 2025'
  },
  {
    id: 'BLG-1253',
    productName: 'PRODUCT NAME — TODO',
    productDescription: 'TODO — add product description',
    productSku: 'TODO-SKU',
    productImage: 'assets/images/admin/products/placeholder.webp',
    quantity: 1,
    length: 'TODO',
    density: 'TODO',
    laceType: 'TODO',
    category: 'TODO',
    customerName: 'Brittany Davis',
    customerEmail: 'TODO@email.com',
    customerPhone: 'TODO',
    country: 'TODO',
    streetAddress: 'TODO',
    apartment: '',
    city: 'TODO',
    state: 'TODO',
    zipCode: 'TODO',
    paymentMethod: 'TODO',
    paymentDate: 'May 23, 2025',
    paymentTime: '07:50 PM',
    total: 720.00,
    status: 'delivered',
    orderDate: 'May 23, 2025'
  },
  {
    id: 'BLG-1252',
    productName: 'PRODUCT NAME — TODO',
    productDescription: 'TODO — add product description',
    productSku: 'TODO-SKU',
    productImage: 'assets/images/admin/products/placeholder.webp',
    quantity: 1,
    length: 'TODO',
    density: 'TODO',
    laceType: 'TODO',
    category: 'TODO',
    customerName: 'Olivia Martinez',
    customerEmail: 'TODO@email.com',
    customerPhone: 'TODO',
    country: 'TODO',
    streetAddress: 'TODO',
    apartment: '',
    city: 'TODO',
    state: 'TODO',
    zipCode: 'TODO',
    paymentMethod: 'TODO',
    paymentDate: 'May 23, 2025',
    paymentTime: '06:20 PM',
    total: 510.00,
    status: 'cancelled',
    orderDate: 'May 23, 2025'
  },
  {
    id: 'BLG-1251',
    productName: 'PRODUCT NAME — TODO',
    productDescription: 'TODO — add product description',
    productSku: 'TODO-SKU',
    productImage: 'assets/images/admin/products/placeholder.webp',
    quantity: 1,
    length: 'TODO',
    density: 'TODO',
    laceType: 'TODO',
    category: 'TODO',
    customerName: 'Monique Anderson',
    customerEmail: 'TODO@email.com',
    customerPhone: 'TODO',
    country: 'TODO',
    streetAddress: 'TODO',
    apartment: '',
    city: 'TODO',
    state: 'TODO',
    zipCode: 'TODO',
    paymentMethod: 'TODO',
    paymentDate: 'May 23, 2025',
    paymentTime: '04:15 PM',
    total: 610.00,
    status: 'delivered',
    orderDate: 'May 23, 2025'
  },
  {
    id: 'BLG-1250',
    productName: 'PRODUCT NAME — TODO',
    productDescription: 'TODO — add product description',
    productSku: 'TODO-SKU',
    productImage: 'assets/images/admin/products/placeholder.webp',
    quantity: 1,
    length: 'TODO',
    density: 'TODO',
    laceType: 'TODO',
    category: 'TODO',
    customerName: 'Tiffany Thomas',
    customerEmail: 'TODO@email.com',
    customerPhone: 'TODO',
    country: 'TODO',
    streetAddress: 'TODO',
    apartment: '',
    city: 'TODO',
    state: 'TODO',
    zipCode: 'TODO',
    paymentMethod: 'TODO',
    paymentDate: 'May 23, 2025',
    paymentTime: '03:08 PM',
    total: 450.00,
    status: 'processing',
    orderDate: 'May 23, 2025'
  },
  {
    id: 'BLG-1249',
    productName: 'PRODUCT NAME — TODO',
    productDescription: 'TODO — add product description',
    productSku: 'TODO-SKU',
    productImage: 'assets/images/admin/products/placeholder.webp',
    quantity: 1,
    length: 'TODO',
    density: 'TODO',
    laceType: 'TODO',
    category: 'TODO',
    customerName: 'Danielle Harris',
    customerEmail: 'TODO@email.com',
    customerPhone: 'TODO',
    country: 'TODO',
    streetAddress: 'TODO',
    apartment: '',
    city: 'TODO',
    state: 'TODO',
    zipCode: 'TODO',
    paymentMethod: 'TODO',
    paymentDate: 'May 23, 2025',
    paymentTime: '01:42 PM',
    total: 330.00,
    status: 'pending',
    orderDate: 'May 23, 2025'
  },
  {
    id: 'BLG-1248',
    productName: 'PRODUCT NAME — TODO',
    productDescription: 'TODO — add product description',
    productSku: 'TODO-SKU',
    productImage: 'assets/images/admin/products/placeholder.webp',
    quantity: 1,
    length: 'TODO',
    density: 'TODO',
    laceType: 'TODO',
    category: 'TODO',
    customerName: 'Lauren White',
    customerEmail: 'TODO@email.com',
    customerPhone: 'TODO',
    country: 'TODO',
    streetAddress: 'TODO',
    apartment: '',
    city: 'TODO',
    state: 'TODO',
    zipCode: 'TODO',
    paymentMethod: 'TODO',
    paymentDate: 'May 23, 2025',
    paymentTime: '11:27 AM',
    total: 560.00,
    status: 'shipped',
    orderDate: 'May 23, 2025'
  },
  {
    id: 'BLG-1247',
    productName: 'PRODUCT NAME — TODO',
    productDescription: 'TODO — add product description',
    productSku: 'TODO-SKU',
    productImage: 'assets/images/admin/products/placeholder.webp',
    quantity: 1,
    length: 'TODO',
    density: 'TODO',
    laceType: 'TODO',
    category: 'TODO',
    customerName: 'Kayla Thompson',
    customerEmail: 'TODO@email.com',
    customerPhone: 'TODO',
    country: 'TODO',
    streetAddress: 'TODO',
    apartment: '',
    city: 'TODO',
    state: 'TODO',
    zipCode: 'TODO',
    paymentMethod: 'TODO',
    paymentDate: 'May 23, 2025',
    paymentTime: '09:50 AM',
    total: 700.00,
    status: 'delivered',
    orderDate: 'May 23, 2025'
  }
];

/* -----------------------------------------------------------
   RECENT ORDERS (dashboard widget) — auto-built from the same
   BLEGAB_ADMIN_ORDERS array above, so it's never out of sync.
   Just takes the 10 most recent and reshapes them into the
   {id, customer, date, dateISO, status, total} format the
   admin.html widget expects.
   ----------------------------------------------------------- */
window.BLEGAB_ADMIN_RECENT_ORDERS = window.BLEGAB_ADMIN_ORDERS.slice(0, 10).map(function (order) {
  return {
    id: order.id,
    customer: order.customerName,
    date: order.paymentDate + ' • ' + order.paymentTime,
    dateISO: '', // fill in if you need real date-sorting later
    status: order.status,
    total: order.total
  };
});

/* Push {id, title, message, time} objects into this array (and re-render)
   whenever something happens on the site/dashboard — new order, low
   stock, product edit, etc. This is the "real" notification feed. */
window.BLEGAB_ADMIN_NOTIFICATIONS = [
  { id: 'notif-low-stock', title: 'Low Stock Alert', message: 'Deep Wave Wig has only 2 left in stock.', time: '2 hours ago' },
  { id: 'notif-new-order', title: 'New Order Received', message: 'Order #BLG-1256 was placed by Sarah Johnson.', time: '3 hours ago' }
];

window.BLEGAB_ADMIN_CATEGORIES = [
  { id: 'cat-default', name: 'Lace Wigs' }
];

window.BLEGAB_ADMIN_PRODUCTS = [
  { id: 'prd-1', name: 'Body Wave Wig',  sku: 'BW-001', categoryId: 'cat-default', price: 0, stock: 20, status: 'in-stock',     image: '' },
  { id: 'prd-2', name: 'Deep Wave Wig',  sku: 'DW-001', categoryId: 'cat-default', price: 0, stock: 3,  status: 'low-stock',    image: '' },
  { id: 'prd-3', name: 'Straight Wig',   sku: 'ST-001', categoryId: 'cat-default', price: 0, stock: 0,  status: 'out-of-stock', image: '' }
];