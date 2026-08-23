/* =========================================================
   ADMIN ORDERS MANAGEMENT JS
   Handles viewing, updating order status, and processing orders
   ========================================================= */

const API_URL = "https://api.blegab.com/api";
let currentPage = 1;
let ordersPerPage = 10;
let allOrders = [];
let selectedOrderId = null;

document.addEventListener('DOMContentLoaded', function () {
  initOrderManagement();
});

/**
 * Initialize order management
 */
function initOrderManagement() {
  loadOrders();

  // Search & filter
  document.getElementById('order-search')?.addEventListener('input', debounce(filterOrders, 300));
  document.getElementById('status-filter')?.addEventListener('change', filterOrders);
  document.getElementById('date-filter')?.addEventListener('change', filterOrders);

  // Modal close buttons
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
}

/**
 * Load orders from backend
 */
async function loadOrders() {
  try {
    const response = await fetch(`${API_URL}/orders?page=${currentPage}&limit=${ordersPerPage}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      loadDemoOrders();
      return;
    }

    const data = await response.json();
    allOrders = data.orders || [];
    renderOrdersList(allOrders);
    renderPagination(data.totalPages || 1);
  } catch (error) {
    console.error('Error loading orders:', error);
    loadDemoOrders();
  }
}

/**
 * Load demo orders for development
 */
function loadDemoOrders() {
  allOrders = [
    {
      id: 'ORD-001',
      customer: 'Jane Doe',
      email: 'jane@example.com',
      total: 165.00,
      status: 'processing',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      itemsCount: 1,
      shippingAddress: '123 Main St, NY 10001'
    },
    {
      id: 'ORD-002',
      customer: 'John Smith',
      email: 'john@example.com',
      total: 320.50,
      status: 'pending',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      itemsCount: 2,
      shippingAddress: '456 Oak Ave, CA 90210'
    },
    {
      id: 'ORD-003',
      customer: 'Mary Johnson',
      email: 'mary@example.com',
      total: 210.00,
      status: 'shipped',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      itemsCount: 1,
      shippingAddress: '789 Pine Rd, TX 75001',
      trackingNumber: 'TRK123456789'
    }
  ];
  renderOrdersList(allOrders);
}

/**
 * Render orders table
 */
function renderOrdersList(orders) {
  const listContainer = document.getElementById('orders-list');
  if (!listContainer) return;

  if (orders.length === 0) {
    listContainer.innerHTML = `
      <div class="admin-table-row admin-table-row--empty">
        <div class="admin-table-cell" colspan="7">
          No orders found
        </div>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = orders.map(order => `
    <div class="admin-table-row" data-order-id="${order.id}">
      <div class="admin-table-cell">
        <strong>${order.id}</strong>
      </div>
      <div class="admin-table-cell">
        <div class="admin-customer-cell">
          <span class="admin-customer-name">${order.customer}</span>
          <span class="admin-customer-email">${order.email}</span>
        </div>
      </div>
      <div class="admin-table-cell">$${order.total.toFixed(2)}</div>
      <div class="admin-table-cell">${formatDate(order.date)}</div>
      <div class="admin-table-cell">
        <span class="admin-status-badge admin-status-${order.status}">
          ${formatStatus(order.status)}
        </span>
      </div>
      <div class="admin-table-cell">${order.itemsCount} item(s)</div>
      <div class="admin-table-cell admin-table-cell--actions">
        <button class="admin-action-btn" title="View Details" onclick="viewOrderDetails('${order.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * View order details
 */
function viewOrderDetails(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  selectedOrderId = orderId;

  // Fill modal
  document.getElementById('order-detail-id').textContent = order.id;
  document.getElementById('order-detail-customer').textContent = order.customer;
  document.getElementById('order-detail-email').textContent = order.email;
  document.getElementById('order-detail-total').textContent = `$${order.total.toFixed(2)}`;
  document.getElementById('order-detail-date').textContent = formatDate(order.date);
  document.getElementById('order-detail-address').textContent = order.shippingAddress;
  document.getElementById('order-detail-status').textContent = formatStatus(order.status);

  // Status selector
  const statusSelect = document.getElementById('order-status-update');
  statusSelect.value = order.status;

  // Tracking number
  const trackingInput = document.getElementById('order-tracking-number');
  trackingInput.value = order.trackingNumber || '';

  openModal('order-detail-modal');
}

/**
 * Update order status
 */
async function updateOrderStatus() {
  const newStatus = document.getElementById('order-status-update').value;
  const trackingNumber = document.getElementById('order-tracking-number').value;

  try {
    const response = await fetch(`${API_URL}/orders/${selectedOrderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        trackingNumber: trackingNumber
      })
    });

    if (!response.ok) {
      showMessage('Error updating order', 'error');
      return;
    }

    showMessage('Order updated successfully', 'success');
    closeModal(document.getElementById('order-detail-modal'));
    loadOrders();
  } catch (error) {
    console.error('Error updating order:', error);
    showMessage('Error updating order', 'error');
  }
}

/**
 * Filter orders
 */
function filterOrders() {
  const searchTerm = document.getElementById('order-search')?.value.toLowerCase() || '';
  const status = document.getElementById('status-filter')?.value || '';
  const dateRange = document.getElementById('date-filter')?.value || '';

  const filtered = allOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm) ||
                         order.customer.toLowerCase().includes(searchTerm) ||
                         order.email.toLowerCase().includes(searchTerm);
    const matchesStatus = !status || order.status === status;
    const matchesDate = !dateRange || isWithinDateRange(order.date, dateRange);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  renderOrdersList(filtered);
}

/**
 * Check if date is within range
 */
function isWithinDateRange(orderDate, range) {
  const date = new Date(orderDate);
  const now = new Date();
  
  switch (range) {
    case 'today':
      return date.toDateString() === now.toDateString();
    case 'week':
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return date >= weekAgo;
    case 'month':
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return date >= monthAgo;
    default:
      return true;
  }
}

/**
 * Render pagination
 */
function renderPagination(totalPages) {
  const pagination = document.getElementById('orders-pagination');
  if (!pagination) return;

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="admin-pagination__btn ${i === currentPage ? 'is-active' : ''}" 
              onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }

  pagination.innerHTML = html;
}

/**
 * Go to page
 */
function goToPage(page) {
  currentPage = page;
  loadOrders();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Modal utilities
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(e) {
  const modal = e.target?.closest('[data-modal]') || e;
  if (modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
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

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showMessage(message, type) {
  const container = document.createElement('div');
  container.className = `admin-message admin-message--${type}`;
  container.textContent = message;
  document.body.appendChild(container);
  
  setTimeout(() => container.remove(), 3000);
}

function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
