/* =========================================================
   ADMIN PRODUCTS PAGE JS
   Renders + fully drives the Products page from the mock data in
   admin-products-data.js (window.BLEGAB_ADMIN_CATEGORIES /
   window.BLEGAB_ADMIN_PRODUCTS). Everything here — category
   filtering, status filtering, search, sorting, price range,
   pagination, category add/edit/delete, product edit/delete — runs
   against the in-memory copies below (prdCategories / prdProducts),
   so it all keeps working once a real backend swaps in: just
   replace the two array assignments below with the fetched data
   and keep every render/filter function as-is.

   The one exception is "Add Product": per spec it only opens the
   dialog for now — Save intentionally does not create anything yet
   (see openProductModal / bindProductModalEvents).

   NOTE: formatAdminMoney(), formatLocalISODate() are defined in
   admin.js and reused here as globals — admin.js is loaded before
   this file.
   ========================================================= */

// Working copies — mutated in place as the admin adds/edits/deletes.
var prdCategories = (window.BLEGAB_ADMIN_CATEGORIES || []).map(function (c) {
  return { id: c.id, name: c.name };
});
var prdProducts = (window.BLEGAB_ADMIN_PRODUCTS || []).map(function (p) {
  return {
    id: p.id, name: p.name, sku: p.sku, categoryId: p.categoryId,
    price: p.price, stock: p.stock, status: p.status, image: p.image
  };
});

var prdState = {
  categoryId: 'all',   // 'all' | 'uncategorized' | category id
  status: 'all',       // 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  search: '',
  sort: 'default',     // default | name-asc | name-desc | price-asc | price-desc | stock-asc | stock-desc
  priceMin: null,
  priceMax: null,
  page: 1,
  pageSize: 8
};

var PRD_STATUS_MAP = {
  'in-stock':     { label: 'In Stock',     className: 'admin-status--delivered' },
  'low-stock':    { label: 'Low Stock',    className: 'admin-status--pending'   },
  'out-of-stock': { label: 'Out of Stock', className: 'admin-status--cancelled' }
};

document.addEventListener('DOMContentLoaded', function () {
  renderCategorySidebar();
  renderCategoryDropdownMenu();
  renderProducts();

  initCategorySidebarEvents();
  initCategoryDropdownEvents();
  initStatusDropdownEvents();
  initFilterPanelEvents();
  initSearchEvents();
  initSelectAllEvents();
  initTableActionEvents();
  initPaginationContainerEvents();
  initCategoryModal();
  initProductModal();
  initGlobalDropdownDismiss();
});

/* =========================================================
   Helpers
   ========================================================= */
function prdGetCategoryName(categoryId) {
  if (!categoryId) return 'Uncategorized';
  var cat = prdCategories.find(function (c) { return c.id === categoryId; });
  return cat ? cat.name : 'Uncategorized';
}

function prdCategoryCount(categoryId) {
  if (categoryId === 'all') return prdProducts.length;
  if (categoryId === 'uncategorized') return prdProducts.filter(function (p) { return !p.categoryId; }).length;
  return prdProducts.filter(function (p) { return p.categoryId === categoryId; }).length;
}

function prdHasUncategorized() {
  return prdProducts.some(function (p) { return !p.categoryId; });
}

function prdEscapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* =========================================================
   Categories sidebar
   ========================================================= */
function renderCategorySidebar() {
  var list = document.querySelector('[data-prd-category-list]');
  if (!list) return;

  var rows = [{ id: 'all', name: 'All Categories', pinned: true }].concat(prdCategories);
  if (prdHasUncategorized()) rows.push({ id: 'uncategorized', name: 'Uncategorized', pinned: true });

  list.innerHTML = rows.map(function (cat) {
    var isActive = prdState.categoryId === cat.id;
    var count = prdCategoryCount(cat.id);
    var actions = cat.pinned ? '' : (
      '<span class="prd-category-row__actions">' +
        '<button type="button" class="prd-icon-btn" data-prd-edit-category="' + cat.id + '" aria-label="Rename category">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9" stroke-linecap="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<button type="button" class="prd-icon-btn prd-icon-btn--danger" data-prd-delete-category="' + cat.id + '" aria-label="Delete category">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</span>'
    );

    return '' +
      '<li class="prd-category-row' + (isActive ? ' is-active' : '') + '" data-category-id="' + cat.id + '">' +
        (cat.pinned ? '<span class="prd-category-row__drag" aria-hidden="true"></span>' :
          '<span class="prd-category-row__drag" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>' +
          '</span>') +
        '<button type="button" class="prd-category-row__button" data-prd-select-category="' + cat.id + '">' +
          '<span class="prd-category-row__name">' + prdEscapeHtml(cat.name) + '</span>' +
          '<span class="prd-category-row__count">' + count + ' product' + (count === 1 ? '' : 's') + '</span>' +
        '</button>' +
        actions +
      '</li>';
  }).join('');
}

function initCategorySidebarEvents() {
  var list = document.querySelector('[data-prd-category-list]');
  if (!list) return;

  list.addEventListener('click', function (e) {
    var selectBtn = e.target.closest('[data-prd-select-category]');
    if (selectBtn) {
      prdSetCategoryFilter(selectBtn.dataset.prdSelectCategory);
      return;
    }

    var editBtn = e.target.closest('[data-prd-edit-category]');
    if (editBtn) {
      var cat = prdCategories.find(function (c) { return c.id === editBtn.dataset.prdEditCategory; });
      if (cat) openCategoryModal('edit', cat);
      return;
    }

    var deleteBtn = e.target.closest('[data-prd-delete-category]');
    if (deleteBtn) {
      prdDeleteCategory(deleteBtn.dataset.prdDeleteCategory);
    }
  });

  var addBtn = document.querySelector('[data-prd-add-category]');
  if (addBtn) addBtn.addEventListener('click', function () { openCategoryModal('add', null); });
}

function prdSetCategoryFilter(categoryId) {
  prdState.categoryId = categoryId;
  prdState.page = 1;
  renderCategorySidebar();
  prdSyncCategoryDropdownLabel();
  renderProducts();
}

function prdDeleteCategory(categoryId) {
  var cat = prdCategories.find(function (c) { return c.id === categoryId; });
  if (!cat) return;

  var count = prdCategoryCount(categoryId);
  var msg = 'Delete "' + cat.name + '"?' + (count > 0 ? ' ' + count + ' product' + (count === 1 ? '' : 's') + ' will be moved to Uncategorized.' : '');
  if (!window.confirm(msg)) return;

  prdProducts.forEach(function (p) {
    if (p.categoryId === categoryId) p.categoryId = null;
  });
  prdCategories = prdCategories.filter(function (c) { return c.id !== categoryId; });

  if (prdState.categoryId === categoryId) prdState.categoryId = 'all';

  renderCategorySidebar();
  renderCategoryDropdownMenu();
  renderProducts();
}

/* =========================================================
   Category filter dropdown (in the products toolbar) — mirrors
   the sidebar selection so either control drives the same state.
   ========================================================= */
function renderCategoryDropdownMenu() {
  var menu = document.querySelector('[data-prd-category-menu]');
  if (!menu) return;

  var options = [{ id: 'all', name: 'All Categories' }].concat(prdCategories);
  if (prdHasUncategorized()) options.push({ id: 'uncategorized', name: 'Uncategorized' });

  menu.innerHTML = options.map(function (opt) {
    var isActive = prdState.categoryId === opt.id;
    return '<li><button type="button" class="prd-dropdown__item' + (isActive ? ' is-active' : '') + '" data-value="' + opt.id + '">' + prdEscapeHtml(opt.name) + '</button></li>';
  }).join('');

  prdSyncCategoryDropdownLabel();
}

function prdSyncCategoryDropdownLabel() {
  var label = document.querySelector('[data-prd-category-label]');
  var menu = document.querySelector('[data-prd-category-menu]');
  if (!label || !menu) return;

  var name = prdState.categoryId === 'all' ? 'All Categories' : prdGetCategoryName(prdState.categoryId === 'uncategorized' ? null : prdState.categoryId);
  label.textContent = name;

  menu.querySelectorAll('[data-value]').forEach(function (btn) {
    btn.classList.toggle('is-active', btn.dataset.value === prdState.categoryId);
  });
}

function initCategoryDropdownEvents() {
  var dropdown = document.querySelector('[data-prd-category-dropdown]');
  var toggle = document.querySelector('[data-prd-category-toggle]');
  var menu = document.querySelector('[data-prd-category-menu]');
  if (!dropdown || !toggle || !menu) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    prdCloseAllDropdowns(menu);
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.addEventListener('click', function (e) {
    var item = e.target.closest('[data-value]');
    if (!item) return;
    prdSetCategoryFilter(item.dataset.value);
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
}

/* =========================================================
   Status filter dropdown
   ========================================================= */
var PRD_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' }
];

function initStatusDropdownEvents() {
  var toggle = document.querySelector('[data-prd-status-toggle]');
  var menu = document.querySelector('[data-prd-status-menu]');
  var label = document.querySelector('[data-prd-status-label]');
  if (!toggle || !menu || !label) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    prdCloseAllDropdowns(menu);
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.addEventListener('click', function (e) {
    var item = e.target.closest('[data-value]');
    if (!item) return;
    prdState.status = item.dataset.value;
    prdState.page = 1;
    label.textContent = item.textContent;
    menu.querySelectorAll('[data-value]').forEach(function (b) { b.classList.toggle('is-active', b === item); });
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    renderProducts();
  });
}

/* =========================================================
   Advanced filter panel (sort + price range)
   ========================================================= */
function initFilterPanelEvents() {
  var toggle = document.querySelector('[data-prd-filter-toggle]');
  var panel = document.querySelector('[data-prd-filter-panel]');
  var sortSelect = document.querySelector('[data-prd-sort-select]');
  var minInput = document.querySelector('[data-prd-price-min]');
  var maxInput = document.querySelector('[data-prd-price-max]');
  var applyBtn = document.querySelector('[data-prd-filter-apply]');
  var resetBtn = document.querySelector('[data-prd-filter-reset]');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    prdCloseAllDropdowns(panel);
    var isOpen = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  panel.addEventListener('click', function (e) { e.stopPropagation(); });

  if (applyBtn) {
    applyBtn.addEventListener('click', function () {
      prdState.sort = sortSelect ? sortSelect.value : 'default';
      prdState.priceMin = minInput && minInput.value !== '' ? parseFloat(minInput.value) : null;
      prdState.priceMax = maxInput && maxInput.value !== '' ? parseFloat(maxInput.value) : null;
      prdState.page = 1;
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      renderProducts();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      prdState.sort = 'default';
      prdState.priceMin = null;
      prdState.priceMax = null;
      if (sortSelect) sortSelect.value = 'default';
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
      prdState.page = 1;
      renderProducts();
    });
  }
}

/* =========================================================
   Search
   ========================================================= */
function initSearchEvents() {
  var input = document.querySelector('[data-prd-search-input]');
  if (!input) return;

  input.addEventListener('input', function () {
    prdState.search = input.value.trim().toLowerCase();
    prdState.page = 1;
    renderProducts();
  });
}

/* =========================================================
   Shared dropdown helpers
   ========================================================= */
function prdCloseAllDropdowns(except) {
  document.querySelectorAll('.prd-dropdown__menu.is-open, .prd-filter-panel.is-open').forEach(function (el) {
    if (el !== except) el.classList.remove('is-open');
  });
  document.querySelectorAll('.prd-dropdown__toggle[aria-expanded="true"]').forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');
  });
}

function initGlobalDropdownDismiss() {
  document.addEventListener('click', function () {
    prdCloseAllDropdowns(null);
  });
}

/* =========================================================
   Filtering + sorting + pagination
   ========================================================= */
function prdComputeFilteredProducts() {
  var list = prdProducts.slice();

  if (prdState.categoryId === 'uncategorized') {
    list = list.filter(function (p) { return !p.categoryId; });
  } else if (prdState.categoryId !== 'all') {
    list = list.filter(function (p) { return p.categoryId === prdState.categoryId; });
  }

  if (prdState.status !== 'all') {
    list = list.filter(function (p) { return p.status === prdState.status; });
  }

  if (prdState.search) {
    var q = prdState.search;
    list = list.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 || p.sku.toLowerCase().indexOf(q) !== -1;
    });
  }

  if (prdState.priceMin != null && !isNaN(prdState.priceMin)) {
    list = list.filter(function (p) { return p.price >= prdState.priceMin; });
  }
  if (prdState.priceMax != null && !isNaN(prdState.priceMax)) {
    list = list.filter(function (p) { return p.price <= prdState.priceMax; });
  }

  switch (prdState.sort) {
    case 'name-asc':  list.sort(function (a, b) { return a.name.localeCompare(b.name); }); break;
    case 'name-desc': list.sort(function (a, b) { return b.name.localeCompare(a.name); }); break;
    case 'price-asc':  list.sort(function (a, b) { return a.price - b.price; }); break;
    case 'price-desc': list.sort(function (a, b) { return b.price - a.price; }); break;
    case 'stock-asc':  list.sort(function (a, b) { return a.stock - b.stock; }); break;
    case 'stock-desc': list.sort(function (a, b) { return b.stock - a.stock; }); break;
    default: break; // 'default' = keep catalog order
  }

  return list;
}

function renderProducts() {
  var filtered = prdComputeFilteredProducts();
  var totalItems = filtered.length;
  var totalPages = Math.max(1, Math.ceil(totalItems / prdState.pageSize));
  if (prdState.page > totalPages) prdState.page = totalPages;

  var start = (prdState.page - 1) * prdState.pageSize;
  var pageItems = filtered.slice(start, start + prdState.pageSize);

  var totalCountEl = document.querySelector('[data-prd-total-count]');
  if (totalCountEl) totalCountEl.textContent = '(' + totalItems + ')';

  var body = document.querySelector('[data-prd-table-body]');
  var emptyState = document.querySelector('[data-prd-empty]');
  var table = document.querySelector('[data-prd-table]');

  if (body) {
    body.innerHTML = pageItems.map(prdRenderRow).join('');
  }

  if (emptyState) emptyState.hidden = totalItems !== 0;
  if (table) table.hidden = totalItems === 0;

  var selectAll = document.querySelector('[data-prd-select-all]');
  if (selectAll) selectAll.checked = false;

  renderPagination(totalItems, totalPages, start, pageItems.length);
}

function prdRenderRow(p) {
  var status = PRD_STATUS_MAP[p.status] || { label: p.status, className: 'admin-status--pending' };
  return '' +
    '<div class="prd-row" role="row" data-product-id="' + p.id + '">' +
      '<span class="prd-row__check" role="cell"><input type="checkbox" data-prd-row-check value="' + p.id + '" aria-label="Select ' + prdEscapeHtml(p.name) + '" /></span>' +
      '<span class="prd-row__product" role="cell">' +
        '<img src="' + p.image + '" alt="" class="prd-row__image" onerror="this.style.visibility=\'hidden\'" />' +
        '<span class="prd-row__info">' +
          '<span class="prd-row__name">' + prdEscapeHtml(p.name) + '</span>' +
          '<span class="prd-row__sku">SKU: ' + prdEscapeHtml(p.sku) + '</span>' +
        '</span>' +
      '</span>' +
      '<span class="prd-row__category" role="cell">' + prdEscapeHtml(prdGetCategoryName(p.categoryId)) + '</span>' +
      '<span class="prd-row__price" role="cell">' + formatAdminMoney(p.price) + '</span>' +
      '<span class="prd-row__stock" role="cell">' + p.stock + '</span>' +
      '<span class="prd-row__status" role="cell"><span class="admin-status ' + status.className + '">' + status.label + '</span></span>' +
      '<span class="prd-row__actions" role="cell">' +
        '<button type="button" class="prd-icon-btn" data-prd-edit-product="' + p.id + '" aria-label="Edit product">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9" stroke-linecap="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<button type="button" class="prd-icon-btn prd-icon-btn--danger" data-prd-delete-product="' + p.id + '" aria-label="Delete product">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</span>' +
    '</div>';
}

/* -----------------------------
   Pagination
   ----------------------------- */
function renderPagination(totalItems, totalPages, start, shownCount) {
  var summary = document.querySelector('[data-prd-pagination-summary]');
  var pagesEl = document.querySelector('[data-prd-pagination-pages]');
  if (summary) {
    summary.textContent = totalItems === 0
      ? 'No products found'
      : 'Showing ' + (start + 1) + ' to ' + (start + shownCount) + ' of ' + totalItems + ' products';
  }
  if (!pagesEl) return;

  if (totalPages <= 1) {
    pagesEl.innerHTML = '';
    return;
  }

  var current = prdState.page;
  var pages = prdBuildPageList(current, totalPages);

  var html = '<button type="button" class="prd-page-btn" data-prd-page="prev" ' + (current === 1 ? 'disabled' : '') + ' aria-label="Previous page">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';

  pages.forEach(function (p) {
    if (p === '...') {
      html += '<span class="prd-page-btn is-ellipsis">&hellip;</span>';
    } else {
      html += '<button type="button" class="prd-page-btn' + (p === current ? ' is-active' : '') + '" data-prd-page="' + p + '">' + p + '</button>';
    }
  });

  html += '<button type="button" class="prd-page-btn" data-prd-page="next" ' + (current === totalPages ? 'disabled' : '') + ' aria-label="Next page">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';

  pagesEl.innerHTML = html;
}

function prdBuildPageList(current, total) {
  if (total <= 7) {
    var all = [];
    for (var i = 1; i <= total; i++) all.push(i);
    return all;
  }

  var pages = [1];
  if (current > 3) pages.push('...');
  for (var p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function initPaginationContainerEvents() {
  var pagesEl = document.querySelector('[data-prd-pagination-pages]');
  if (!pagesEl) return;

  pagesEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-prd-page]');
    if (!btn || btn.disabled) return;

    var value = btn.dataset.prdPage;
    var totalPages = Math.max(1, Math.ceil(prdComputeFilteredProducts().length / prdState.pageSize));

    if (value === 'prev') prdState.page = Math.max(1, prdState.page - 1);
    else if (value === 'next') prdState.page = Math.min(totalPages, prdState.page + 1);
    else prdState.page = parseInt(value, 10);

    renderProducts();
  });
}

/* =========================================================
   Select-all / row checkboxes (state only — ready for bulk
   actions once the catalog API + bulk endpoints exist)
   ========================================================= */
function initSelectAllEvents() {
  var selectAll = document.querySelector('[data-prd-select-all]');
  var body = document.querySelector('[data-prd-table-body]');
  if (!selectAll || !body) return;

  selectAll.addEventListener('change', function () {
    body.querySelectorAll('[data-prd-row-check]').forEach(function (cb) {
      cb.checked = selectAll.checked;
    });
  });
}

/* =========================================================
   Row action delegation — edit / delete product
   ========================================================= */
function initTableActionEvents() {
  var body = document.querySelector('[data-prd-table-body]');
  if (!body) return;

  body.addEventListener('click', function (e) {
    var editBtn = e.target.closest('[data-prd-edit-product]');
    if (editBtn) {
      var product = prdProducts.find(function (p) { return p.id === editBtn.dataset.prdEditProduct; });
      if (product) openProductModal('edit', product);
      return;
    }

    var deleteBtn = e.target.closest('[data-prd-delete-product]');
    if (deleteBtn) {
      var toDelete = prdProducts.find(function (p) { return p.id === deleteBtn.dataset.prdDeleteProduct; });
      if (!toDelete) return;
      if (!window.confirm('Delete "' + toDelete.name + '"? This can\'t be undone.')) return;
      prdProducts = prdProducts.filter(function (p) { return p.id !== toDelete.id; });
      renderCategorySidebar();
      renderCategoryDropdownMenu();
      renderProducts();
    }
  });
}

/* =========================================================
   Category modal (Add / Edit) — fully functional, in-memory
   ========================================================= */
function openCategoryModal(mode, category) {
  var overlay = document.querySelector('[data-prd-category-modal-overlay]');
  var modal = document.querySelector('[data-prd-category-modal]');
  var title = document.querySelector('[data-prd-category-modal-title]');
  var nameInput = document.querySelector('[data-prd-category-name-input]');
  if (!overlay || !modal || !nameInput) return;

  modal.dataset.mode = mode;
  modal.dataset.categoryId = category ? category.id : '';
  title.textContent = mode === 'edit' ? 'Rename Category' : 'Add Category';
  nameInput.value = category ? category.name : '';

  overlay.classList.add('is-open');
  modal.classList.add('is-open');
  nameInput.focus();
}

function closeCategoryModal() {
  var overlay = document.querySelector('[data-prd-category-modal-overlay]');
  var modal = document.querySelector('[data-prd-category-modal]');
  if (overlay) overlay.classList.remove('is-open');
  if (modal) modal.classList.remove('is-open');
}

function initCategoryModal() {
  var overlay = document.querySelector('[data-prd-category-modal-overlay]');
  var modal = document.querySelector('[data-prd-category-modal]');
  var closeBtn = document.querySelector('[data-prd-category-modal-close]');
  var cancelBtn = document.querySelector('[data-prd-category-modal-cancel]');
  var saveBtn = document.querySelector('[data-prd-category-modal-save]');
  var nameInput = document.querySelector('[data-prd-category-name-input]');
  if (!overlay || !modal || !saveBtn) return;

  [overlay, closeBtn, cancelBtn].forEach(function (el) {
    if (el) el.addEventListener('click', closeCategoryModal);
  });

  saveBtn.addEventListener('click', function () {
    var name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }

    if (modal.dataset.mode === 'edit') {
      var cat = prdCategories.find(function (c) { return c.id === modal.dataset.categoryId; });
      if (cat) cat.name = name;
    } else {
      var id = 'cat-' + Date.now();
      prdCategories.push({ id: id, name: name });
    }

    renderCategorySidebar();
    renderCategoryDropdownMenu();
    renderProducts();
    closeCategoryModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeCategoryModal();
  });
}

/* =========================================================
   Product modal (Add / Edit)
   - Edit: fully functional, updates prdProducts in place.
   - Add: intentionally inert for now — opens the dialog only.
     Once the products API exists, wire this Save handler to
     POST /api/admin/products and push the response into
     prdProducts (see the note rendered inside the dialog).
   ========================================================= */
function prdBuildCategoryOptionsHtml(selectedId) {
  var html = '<option value="">Uncategorized</option>';
  prdCategories.forEach(function (c) {
    html += '<option value="' + c.id + '"' + (c.id === selectedId ? ' selected' : '') + '>' + prdEscapeHtml(c.name) + '</option>';
  });
  return html;
}

function openProductModal(mode, product) {
  var overlay = document.querySelector('[data-prd-product-modal-overlay]');
  var modal = document.querySelector('[data-prd-product-modal]');
  var title = document.querySelector('[data-prd-product-modal-title]');
  var note = document.querySelector('[data-prd-product-modal-note]');
  var saveBtn = document.querySelector('[data-prd-product-modal-save]');
  if (!overlay || !modal) return;

  var nameInput = document.querySelector('[data-prd-name-input]');
  var skuInput = document.querySelector('[data-prd-sku-input]');
  var categorySelect = document.querySelector('[data-prd-category-select]');
  var priceInput = document.querySelector('[data-prd-price-input]');
  var stockInput = document.querySelector('[data-prd-stock-input]');
  var statusSelect = document.querySelector('[data-prd-status-select]');

  modal.dataset.mode = mode;
  modal.dataset.productId = product ? product.id : '';

  categorySelect.innerHTML = prdBuildCategoryOptionsHtml(product ? product.categoryId : '');

  if (mode === 'edit' && product) {
    title.textContent = 'Edit Product';
    nameInput.value = product.name;
    skuInput.value = product.sku;
    priceInput.value = product.price;
    stockInput.value = product.stock;
    statusSelect.value = product.status;
    note.hidden = true;
    saveBtn.textContent = 'Save Changes';
  } else {
    title.textContent = 'Add Product';
    nameInput.value = '';
    skuInput.value = '';
    priceInput.value = '';
    stockInput.value = '';
    statusSelect.value = 'in-stock';
    note.hidden = false;
    saveBtn.textContent = 'Save Product';
  }

  overlay.classList.add('is-open');
  modal.classList.add('is-open');
  nameInput.focus();
}

function closeProductModal() {
  var overlay = document.querySelector('[data-prd-product-modal-overlay]');
  var modal = document.querySelector('[data-prd-product-modal]');
  if (overlay) overlay.classList.remove('is-open');
  if (modal) modal.classList.remove('is-open');
}

function initProductModal() {
  var overlay = document.querySelector('[data-prd-product-modal-overlay]');
  var modal = document.querySelector('[data-prd-product-modal]');
  var closeBtn = document.querySelector('[data-prd-product-modal-close]');
  var cancelBtn = document.querySelector('[data-prd-product-modal-cancel]');
  var saveBtn = document.querySelector('[data-prd-product-modal-save]');
  var addTrigger = document.querySelector('[data-prd-add-product]');
  if (!overlay || !modal || !saveBtn) return;

  if (addTrigger) addTrigger.addEventListener('click', function () { openProductModal('add', null); });

  [overlay, closeBtn, cancelBtn].forEach(function (el) {
    if (el) el.addEventListener('click', closeProductModal);
  });

  saveBtn.addEventListener('click', function () {
    // Add mode is intentionally a no-op for now — see comment above
    // openProductModal(). The dialog just closes; nothing is created.
    if (modal.dataset.mode !== 'edit') {
      closeProductModal();
      return;
    }

    var product = prdProducts.find(function (p) { return p.id === modal.dataset.productId; });
    if (!product) { closeProductModal(); return; }

    var nameInput = document.querySelector('[data-prd-name-input]');
    var skuInput = document.querySelector('[data-prd-sku-input]');
    var categorySelect = document.querySelector('[data-prd-category-select]');
    var priceInput = document.querySelector('[data-prd-price-input]');
    var stockInput = document.querySelector('[data-prd-stock-input]');
    var statusSelect = document.querySelector('[data-prd-status-select]');

    if (!nameInput.value.trim()) { nameInput.focus(); return; }

    product.name = nameInput.value.trim();
    product.sku = skuInput.value.trim();
    product.categoryId = categorySelect.value || null;
    product.price = parseFloat(priceInput.value) || 0;
    product.stock = parseInt(stockInput.value, 10) || 0;
    product.status = statusSelect.value;

    renderCategorySidebar();
    renderCategoryDropdownMenu();
    renderProducts();
    closeProductModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeProductModal();
  });
}