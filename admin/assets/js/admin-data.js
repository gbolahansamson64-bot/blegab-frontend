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

window.BLEGAB_ADMIN_RECENT_ORDERS = [
  { id: 'BLG-1256', customer: 'Sarah Johnson',    date: 'May 24, 2025 • 10:45 AM', dateISO: '2025-05-24', status: 'pending',    total: 650.00 },
  { id: 'BLG-1255', customer: 'Amanda Brown',     date: 'May 24, 2025 • 09:32 AM', dateISO: '2025-05-24', status: 'processing', total: 420.00 },
  { id: 'BLG-1254', customer: 'Jessica Williams', date: 'May 24, 2025 • 08:15 AM', dateISO: '2025-05-24', status: 'shipped',    total: 380.00 },
  { id: 'BLG-1253', customer: 'Brittany Davis',   date: 'May 23, 2025 • 07:50 PM', dateISO: '2025-05-23', status: 'delivered',  total: 720.00 },
  { id: 'BLG-1252', customer: 'Olivia Martinez',  date: 'May 23, 2025 • 06:20 PM', dateISO: '2025-05-23', status: 'cancelled',  total: 510.00 },
  { id: 'BLG-1251', customer: 'Monique Anderson', date: 'May 23, 2025 • 04:15 PM', dateISO: '2025-05-23', status: 'delivered',  total: 610.00 },
  { id: 'BLG-1250', customer: 'Tiffany Thomas',   date: 'May 23, 2025 • 03:08 PM', dateISO: '2025-05-23', status: 'processing', total: 450.00 },
  { id: 'BLG-1249', customer: 'Danielle Harris',  date: 'May 23, 2025 • 01:42 PM', dateISO: '2025-05-23', status: 'pending',    total: 330.00 },
  { id: 'BLG-1248', customer: 'Lauren White',     date: 'May 23, 2025 • 11:27 AM', dateISO: '2025-05-23', status: 'shipped',    total: 560.00 },
  { id: 'BLG-1247', customer: 'Kayla Thompson',   date: 'May 23, 2025 • 09:50 AM', dateISO: '2025-05-23', status: 'delivered',  total: 700.00 }
];

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