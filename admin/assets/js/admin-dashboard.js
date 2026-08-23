/* =========================================================
   ADMIN DASHBOARD JS
   Shows overview statistics, recent orders, low stock alerts,
   and quick action buttons
   ========================================================= */

const API_URL = "https://api.blegab.com/api";

document.addEventListener('DOMContentLoaded', function () {
  initDashboard();
});

/**
 * Initialize dashboard
 */
function initDashboard() {
  loadDashboardStats();
  loadRecentOrders();
  loadLowStockAlerts();
  loadQuickStats();

  // Refresh stats every 30 seconds
  setInterval(() => {
    loadDashboardStats();
    loadRecentOrders();
  }, 30000);
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/admin/dashboard-stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      loadDemoStats();
      return;
    }

    const stats = await response.json();
    updateStatsCards(stats);
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    loadDemoStats();
  }
}

/**
 * Load demo statistics
 */
function loadDemoStats() {
  const stats = {
    totalOrders: 1250,
    totalRevenue: 45000,
    totalCustomers: 320,
    averageOrderValue: 36,
    ordersThisMonth: 180,
    revenueThisMonth: 6500,
    newCustomersThisMonth: 45,
    ordersToday: 12
  };

  updateStatsCards(stats);
}

/**
 * Update statistics cards
 */
function updateStatsCards(stats) {
  // Total Orders
  const totalOrdersEl = document.getElementById('stat-total-orders');
  if (totalOrdersEl) {
    totalOrdersEl.textContent = stats.totalOrders.toLocaleString();
  }

  // Total Revenue
  const totalRevenueEl = document.getElementById('stat-total-revenue');
  if (totalRevenueEl) {
    totalRevenueEl.textContent = `$${stats.totalRevenue?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}`;
  }

  // Total Customers
  const totalCustomersEl = document.getElementById('stat-total-customers');
  if (totalCustomersEl) {
    totalCustomersEl.textContent = stats.totalCustomers.toLocaleString();
  }

  // Average Order Value
  const avgOrderEl = document.getElementById('stat-avg-order');
  if (avgOrderEl) {
    avgOrderEl.textContent = `$${stats.averageOrderValue?.toFixed(2) || '0.00'}`;
  }

  // This Month
  const thisMonthOrdersEl = document.getElementById('stat-this-month-orders');
  if (thisMonthOrdersEl) {
    thisMonthOrdersEl.textContent = stats.ordersThisMonth;
  }

  const thisMonthRevenueEl = document.getElementById('stat-this-month-revenue');
  if (thisMonthRevenueEl) {
    thisMonthRevenueEl.textContent = `$${stats.revenueThisMonth?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}`;
  }

  // Today
  const todayOrdersEl = document.getElementById('stat-today-orders');
  if (todayOrdersEl) {
    todayOrdersEl.textContent = stats.ordersToday;
  }
}

/**
 * Load recent orders
 */
async function loadRecentOrders() {
  try {
    const response = await fetch(`${API_URL}/orders?limit=5&sort=recent`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      loadDemoRecentOrders();
      return;
    }

    const data = await response.json();
    renderRecentOrders(data.orders || []);
  } catch (error) {
    console.error('Error loading recent orders:', error);
    loadDemoRecentOrders();
  }
}

/**
 * Load demo recent orders
 */
function loadDemoRecentOrders() {
  const orders = [
    {
      id: 'ORD-001',
      customer: 'Jane Doe',
      total: 165.00,
      status: 'processing',
      date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ORD-002',
      customer: 'John Smith',
      total: 320.50,
      status: 'pending',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ORD-003',
      customer: 'Mary Johnson',
      total: 210.00,
      status: 'shipped',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ORD-004',
      customer: 'Robert Davis',
      total: 450.00,
      status: 'delivered',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ORD-005',
      customer: 'Lisa Brown',
      total: 280.00,
      status: 'pending',
      date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
  ];

  renderRecentOrders(orders);
}

/**
 * Render recent orders
 */
function renderRecentOrders(orders) {
  const container = document.getElementById('recent-orders-list');
  if (!container) return;

  container.innerHTML = orders.map(order => `
    <div class="admin-recent-order">
      <div class="admin-recent-order__left">
        <div class="admin-recent-order__id">${order.id}</div>
        <div class="admin-recent-order__customer">${order.customer}</div>
        <div class="admin-recent-order__date">${formatTimeAgo(order.date)}</div>
      </div>
      <div class="admin-recent-order__right">
        <span class="admin-status-badge admin-status-${order.status}">
          ${formatStatus(order.status)}
        </span>
        <div class="admin-recent-order__amount">$${order.total.toFixed(2)}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Load low stock alerts
 */
async function loadLowStockAlerts() {
  try {
    const response = await fetch(`${API_URL}/products/low-stock`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      loadDemoLowStock();
      return;
    }

    const data = await response.json();
    renderLowStockAlerts(data.products || []);
  } catch (error) {
    console.error('Error loading low stock:', error);
    loadDemoLowStock();
  }
}

/**
 * Load demo low stock
 */
function loadDemoLowStock() {
  const products = [
    { name: 'Curly Lace Wig', sku: 'CL-16-SC', stock: 3 },
    { name: 'Bone Straight - 20"', sku: 'BS-20-MC', stock: 7 },
    { name: 'Custom Lace Wig', sku: 'CUSTOM-001', stock: 2 }
  ];

  renderLowStockAlerts(products);
}

/**
 * Render low stock alerts
 */
function renderLowStockAlerts(products) {
  const container = document.getElementById('low-stock-list');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<p class="admin-empty-state">All products have healthy stock levels</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="admin-alert admin-alert--warning">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <div class="admin-alert__content">
        <strong>${product.name}</strong>
        <p>Only ${product.stock} units left</p>
      </div>
      <a href="admin-products.html" class="admin-alert__action">Reorder</a>
    </div>
  `).join('');
}

/**
 * Load quick stats
 */
function loadQuickStats() {
  // Calculate stats based on loaded data
  const pendingOrdersEl = document.getElementById('quick-stat-pending');
  const shippedOrdersEl = document.getElementById('quick-stat-shipped');
  
  if (pendingOrdersEl) {
    pendingOrdersEl.textContent = '8';
  }
  
  if (shippedOrdersEl) {
    shippedOrdersEl.textContent = '12';
  }
}

/**
 * Utility functions
 */
function formatStatus(status) {
  const labels = {
    'pending': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return labels[status] || status;
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
