/* =========================================================
   ADMIN PRODUCTS MANAGEMENT JS
   Handles adding, editing, deleting, and displaying products
   ========================================================= */

const API_URL = "https://api.blegab.com/api";
let currentPage = 1;
let productsPerPage = 10;
let allProducts = [];
let selectedProductId = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', function () {
  initProductManagement();
});

/**
 * Initialize product management interface
 */
function initProductManagement() {
  // Load products
  loadProducts();

  // Search & filter
  document.getElementById('product-search')?.addEventListener('input', debounce(filterAndSearch, 300));
  document.getElementById('category-filter')?.addEventListener('change', filterAndSearch);

  // Add product button
  document.querySelector('[data-add-product]')?.addEventListener('click', openAddProductModal);

  // Form submission
  document.getElementById('product-form')?.addEventListener('submit', handleProductSubmit);

  // Add variant button
  document.getElementById('add-variant-btn')?.addEventListener('click', addVariantRow);

  // Modal close buttons
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Select all checkbox
  document.getElementById('select-all')?.addEventListener('change', handleSelectAll);

  // Confirm delete
  document.getElementById('confirm-delete-btn')?.addEventListener('click', confirmDelete);
}

/**
 * Load products from backend
 */
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products?page=${currentPage}&limit=${productsPerPage}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      loadDemoProducts();
      return;
    }

    const data = await response.json();
    allProducts = data.products || [];
    renderProductsList(allProducts);
    renderPagination(data.totalPages || 1);
  } catch (error) {
    console.error('Error loading products:', error);
    loadDemoProducts();
  }
}

/**
 * Load demo products for development
 */
function loadDemoProducts() {
  allProducts = [
    {
      id: '1',
      name: 'Body Wave Lace Wig',
      sku: 'BW-20-MC',
      category: 'body-wave',
      price: 150,
      stock: 25,
      status: 'active',
      image: 'assets/images/shopimage/wig-1.webp'
    },
    {
      id: '2',
      name: 'Straight Lace Wig',
      sku: 'ST-18-LC',
      category: 'bone-straight',
      price: 165,
      stock: 15,
      status: 'active',
      image: 'assets/images/shopimage/wig-2.webp'
    },
    {
      id: '3',
      name: 'Curly Lace Wig',
      sku: 'CL-16-SC',
      category: 'curly',
      price: 180,
      stock: 8,
      status: 'active',
      image: 'assets/images/shopimage/wig-3.webp'
    }
  ];
  renderProductsList(allProducts);
}

/**
 * Render products table
 */
function renderProductsList(products) {
  const listContainer = document.getElementById('products-list');
  if (!listContainer) return;

  if (products.length === 0) {
    listContainer.innerHTML = `
      <div class="admin-table-row admin-table-row--empty">
        <div class="admin-table-cell" colspan="8">
          No products found
        </div>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = products.map(product => `
    <div class="admin-table-row" data-product-id="${product.id}">
      <div class="admin-table-cell admin-table-cell--checkbox">
        <input type="checkbox" class="product-checkbox" />
      </div>
      <div class="admin-table-cell admin-table-cell--product">
        <div class="admin-product-cell">
          <img src="${product.image || 'assets/images/placeholder.webp'}" alt="${product.name}" />
          <span>${product.name}</span>
        </div>
      </div>
      <div class="admin-table-cell">${product.sku}</div>
      <div class="admin-table-cell">${formatCategory(product.category)}</div>
      <div class="admin-table-cell">$${product.price.toFixed(2)}</div>
      <div class="admin-table-cell">
        <span class="admin-stock-badge ${getStockClass(product.stock)}">
          ${product.stock} units
        </span>
      </div>
      <div class="admin-table-cell">
        <span class="admin-status-badge admin-status-${product.status}">
          ${product.status}
        </span>
      </div>
      <div class="admin-table-cell admin-table-cell--actions">
        <button class="admin-action-btn" title="Edit" onclick="editProduct('${product.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="admin-action-btn admin-action-btn--danger" title="Delete" onclick="openDeleteModal('${product.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Filter and search products
 */
function filterAndSearch() {
  const searchTerm = document.getElementById('product-search')?.value.toLowerCase() || '';
  const category = document.getElementById('category-filter')?.value || '';

  const filtered = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                         product.sku.toLowerCase().includes(searchTerm);
    const matchesCategory = !category || product.category === category;
    return matchesSearch && matchesCategory;
  });

  renderProductsList(filtered);
}

/**
 * Open add product modal
 */
function openAddProductModal() {
  isEditMode = false;
  selectedProductId = null;
  document.getElementById('product-modal-title').textContent = 'Add New Product';
  document.getElementById('form-submit-text').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('variants-list').innerHTML = '';
  addVariantRow(); // Add one empty variant
  openModal('product-modal');
}

/**
 * Edit product
 */
function editProduct(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  isEditMode = true;
  selectedProductId = productId;

  // Fill form
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-sku').value = product.sku;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-status').value = product.status;
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-cost').value = product.cost || '';
  document.getElementById('product-stock').value = product.stock;
  document.getElementById('product-low-stock').value = product.lowStockAlert || 10;

  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('form-submit-text').textContent = 'Update Product';

  openModal('product-modal');
}

/**
 * Handle product form submission
 */
async function handleProductSubmit(e) {
  e.preventDefault();

  const formData = new FormData(document.getElementById('product-form'));
  const productData = Object.fromEntries(formData);

  try {
    const url = isEditMode 
      ? `${API_URL}/products/${selectedProductId}`
      : `${API_URL}/products`;
    
    const method = isEditMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      showMessage('Error saving product', 'error');
      return;
    }

    showMessage(isEditMode ? 'Product updated' : 'Product added', 'success');
    closeModal('product-modal');
    loadProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    showMessage('Error saving product', 'error');
  }
}

/**
 * Add variant row
 */
function addVariantRow() {
  const variantsList = document.getElementById('variants-list');
  const variantCount = variantsList.children.length;

  const variantRow = document.createElement('div');
  variantRow.className = 'admin-variant-row';
  variantRow.innerHTML = `
    <input type="text" placeholder="Size (e.g., 18&quot;)" name="variant_size" />
    <input type="text" placeholder="Color" name="variant_color" />
    <input type="number" placeholder="Stock" name="variant_stock" min="0" />
    <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
  `;

  variantsList.appendChild(variantRow);
}

/**
 * Handle select all checkbox
 */
function handleSelectAll(e) {
  document.querySelectorAll('.product-checkbox').forEach(checkbox => {
    checkbox.checked = e.target.checked;
  });
}

/**
 * Open delete modal
 */
function openDeleteModal(productId) {
  selectedProductId = productId;
  openModal('delete-modal');
}

/**
 * Confirm delete
 */
async function confirmDelete() {
  try {
    const response = await fetch(`${API_URL}/products/${selectedProductId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      showMessage('Error deleting product', 'error');
      return;
    }

    showMessage('Product deleted', 'success');
    closeModal('delete-modal');
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    showMessage('Error deleting product', 'error');
  }
}

/**
 * Render pagination
 */
function renderPagination(totalPages) {
  const pagination = document.getElementById('products-pagination');
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
  loadProducts();
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
  const modal = e.target.closest('[data-modal]') || document.getElementById(e.target.dataset.modal);
  if (modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

/**
 * Utility functions
 */
function formatCategory(category) {
  const labels = {
    'lace-wigs': 'Lace Wigs',
    'bone-straight': 'Bone Straight',
    'body-wave': 'Body Wave',
    'curly': 'Curly',
    'custom': 'Custom'
  };
  return labels[category] || category;
}

function getStockClass(stock) {
  if (stock > 20) return 'high';
  if (stock > 5) return 'medium';
  return 'low';
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
