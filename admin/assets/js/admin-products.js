/* ADMIN PRODUCTS PAGE JS — delegated events, idempotent init */

const API_BASE = "https://backend-6j62.onrender.com/api";

const CATEGORY_API = "https://backend-6j62.onrender.com/api/categories";

const PRODUCT_API_URL = "https://backend-6j62.onrender.com/api/products";



async function loadCategories() {

    try {

        const data = await getCategories();

        prdCategories = data.categories.map(function(category){

            return {

                id: category._id,

                name: category.name,

                slug: category.slug

            };

        });

    } catch(err){

        console.error(err);

    }

}

async function loadProducts() {

    try {

        const data = await getProducts();

        prdProducts = data.products.map(mapProduct);

    } catch (err) {

        console.error(err);

    }

}

function mapProduct(product) {

    return {

        id: product._id,

        name: product.name,

        sku: product.sku || "",

        slug: product.slug || "",

        description: product.description || "",

        price: product.price,

        stock: product.stock,

        badge: product.badge || "",

        image: product.images?.[0] || "",

        images: product.images || [],

        categoryId: product.category?._id || "",

        length: product.length || "",

        density: product.density || "",

        laceType: product.laceType || "",

        status: product.status || "in-stock"

    };

}

async function getCategories() {
    const res = await fetch(CATEGORY_API, {
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch categories");
    }

    return res.json();
}

async function createCategory(data) {
    const res = await fetch(CATEGORY_API, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
}

async function updateCategory(id, data) {
    const res = await fetch(`${CATEGORY_API}/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
}

async function deleteCategory(id) {
    const res = await fetch(`${CATEGORY_API}/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    return res.json();
}

async function getProducts() {
    const res = await fetch(PRODUCT_API_URL, {
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch products");
    }

    return res.json();
}

async function getProduct(id) {

    const res = await fetch(`${API_BASE}/products/${id}`, {
        credentials: "include"
    });

    const data = await res.json();

    console.log("GET SINGLE PRODUCT RESPONSE:", data);

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch product");
    }

    return data;

}

async function createProduct(data) {

    const res = await fetch(`${API_BASE}/products`, {

        method: "POST",

        credentials: "include",

        body:data

    });

    const result = await res.json();

    if (!res.ok) {

        throw new Error(result.message);

    }

    return result.product;

}

async function updateProduct(id, data) {

    const res = await fetch(`${API_BASE}/products/${id}`, {

        method: "PUT",

        credentials: "include",

        body:data

    });

    const result = await res.json();

    if (!res.ok) {

        throw new Error(result.message);

    }

    return result.product;

}

async function deleteProduct(id) {

    const res = await fetch(`${API_BASE}/products/${id}`, {

        method: "DELETE",

        credentials: "include"

    });

    const result = await res.json();

    if (!res.ok) {

        throw new Error(result.message);

    }

    return result;

}




if (!window.__prdBooted) {
window.__prdBooted = true;

var prdCategories = [];
var prdProducts = [];
var prdModalImages = [];
var prdViewProductId = null;
var prdDragSrcId = null;
var prdSelectedIds = new Set();

function prdGetBatchSize() {
  var w = window.innerWidth;
  if (w < 640) return 3;
  if (w < 1024) return 6;
  return 10;
}

var prdState = {
  categoryId: 'all',
  status: 'all',
  search: '',
  sort: 'default',
  priceMin: null,
  priceMax: null,
  stockMin: null,
  stockMax: null,
  length: 'all',
  density: 'all',
  laceType: 'all',
  visibleCount: prdGetBatchSize()
};

var PRD_STATUS_MAP = {
  'in-stock':     { label: 'In Stock',     className: 'admin-status--delivered' },
  'low-stock':    { label: 'Low Stock',    className: 'admin-status--pending'   },
  'out-of-stock': { label: 'Out of Stock', className: 'admin-status--cancelled' }
};

function initProductSearch() {

    var searchInput = document.querySelector("[data-prd-search-input]");

    if (!searchInput) {
        console.warn("Product search input not found.");
        return;
    }

    searchInput.value = prdState.search || "";

    searchInput.addEventListener("input", function () {

        prdState.search = this.value.trim().toLowerCase();

        prdState.visibleCount = prdGetBatchSize();

        renderProducts();

    });

}

document.addEventListener("DOMContentLoaded", async function () {

    await Promise.all([
        loadCategories(),
        loadProducts()
    ]);

    renderCategorySidebar();

    renderCategoryDropdownMenu();

    renderProducts();

    bindAllEvents();

    initProductSearch();

    initCategoryDragReorder();

});

/* =========================================================
   Viewport "wall" — after any dropdown/panel opens, check if
   it's poking past the left or right edge of the screen and,
   if so, nudge it back in with a horizontal shift. Works for
   any element regardless of how it's positioned in CSS, and
   is reset whenever that element closes so the shift never
   carries over to the next time it opens.
   ========================================================= */
function prdClampToViewport(el) {
  if (!el) return;
  el.style.transform = '';

  requestAnimationFrame(function () {
    var rect = el.getBoundingClientRect();
    var margin = 10; // minimum gap to keep from the screen edge
    var shift = 0;

    if (rect.right > window.innerWidth - margin) {
      shift = (window.innerWidth - margin) - rect.right;
    } else if (rect.left < margin) {
      shift = margin - rect.left;
    }

    if (shift !== 0) {
      el.style.transform = 'translateX(' + shift + 'px)';
    }
  });
}

function prdResetClamp(el) {
  if (el) el.style.transform = '';
}

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

function prdEscapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderCategorySidebar() {
  var list = document.querySelector('[data-prd-category-list]');
  if (!list) return;

  var rows = [
    { id: "all", name: "All Categories", pinned: true }
].concat(prdCategories);

  list.innerHTML = rows.map(function (cat) {
    var isActive = prdState.categoryId === cat.id;
    var countLabel;
    if (cat.id === 'all') {
      var catCount = prdCategories.length;
      var prodCount = prdProducts.length;
      countLabel = catCount + ' categor' + (catCount === 1 ? 'y' : 'ies') + ' \u2022 ' + prodCount + ' product' + (prodCount === 1 ? '' : 's');
    } else {
      var count = prdCategoryCount(cat.id);
      countLabel = count + ' product' + (count === 1 ? '' : 's');
    }
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
      '<li class="prd-category-row' + (isActive ? ' is-active' : '') + '" data-category-id="' + cat.id + '"' + (cat.pinned ? '' : ' draggable="true"') + '>' +
        (cat.pinned ? '<span class="prd-category-row__drag" aria-hidden="true"></span>' :
          '<span class="prd-category-row__drag" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>' +
          '</span>') +
        '<button type="button" class="prd-category-row__button" data-prd-select-category="' + cat.id + '">' +
          '<span class="prd-category-row__name">' + prdEscapeHtml(cat.name) + '</span>' +
          '<span class="prd-category-row__count">' + countLabel + '</span>' +
        '</button>' +
        actions +
      '</li>';
  }).join('');
}

function prdSetCategoryFilter(categoryId) {
  prdState.categoryId = categoryId;
  prdState.visibleCount = prdGetBatchSize();
  renderCategorySidebar();
  prdSyncCategoryDropdownLabel();
  renderProducts();
}

async function prdDeleteCategory(categoryId) {

    var cat = prdCategories.find(function (c) {
        return c.id === categoryId;
    });

    if (!cat) return;

    if (!confirm('Delete "' + cat.name + '"?')) {
        return;
    }

    try {

        await deleteCategory(categoryId);

        await Promise.all([
            loadCategories(),
            loadProducts()
        ]);

        renderCategorySidebar();

        renderCategoryDropdownMenu();

        renderProducts();

        prdShowToast("Category deleted");

    } catch (err) {

        console.error(err);

        alert(err.message || "Unable to delete category.");

    }

}

function initCategoryDragReorder() {
  var list = document.querySelector('[data-prd-category-list]');
  if (!list) return;

  list.addEventListener('dragstart', function (e) {
    var row = e.target.closest('.prd-category-row[draggable="true"]');
    if (!row) return;
    prdDragSrcId = row.dataset.categoryId;
    e.dataTransfer.effectAllowed = 'move';
    row.classList.add('is-dragging');
  });

  list.addEventListener('dragend', function (e) {
    var row = e.target.closest('.prd-category-row');
    if (row) row.classList.remove('is-dragging');
    list.querySelectorAll('.prd-category-row').forEach(function (r) { r.classList.remove('is-drag-over'); });
  });

  list.addEventListener('dragover', function (e) {
    var row = e.target.closest('.prd-category-row[draggable="true"]');
    if (!row) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    list.querySelectorAll('.prd-category-row').forEach(function (r) { r.classList.remove('is-drag-over'); });
    row.classList.add('is-drag-over');
  });

  list.addEventListener('drop', function (e) {
    var row = e.target.closest('.prd-category-row[draggable="true"]');
    if (!row || !prdDragSrcId) return;
    e.preventDefault();

    var targetId = row.dataset.categoryId;
    if (targetId === prdDragSrcId) return;

    var fromIndex = prdCategories.findIndex(function (c) { return c.id === prdDragSrcId; });
    var toIndex = prdCategories.findIndex(function (c) { return c.id === targetId; });
    if (fromIndex === -1 || toIndex === -1) return;

    var moved = prdCategories.splice(fromIndex, 1)[0];
    prdCategories.splice(toIndex, 0, moved);

    prdDragSrcId = null;
    renderCategorySidebar();
    renderCategoryDropdownMenu();
  });
}

function renderCategoryDropdownMenu() {
  var menu = document.querySelector('[data-prd-category-menu]');
  if (!menu) return;
  var options = [
    { id: "all", name: "All Categories" }
].concat(prdCategories);

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
  var name =
    prdState.categoryId === "all"
        ? "All Categories"
        : prdGetCategoryName(prdState.categoryId);

  menu.querySelectorAll('[data-value]').forEach(function (btn) {
    btn.classList.toggle('is-active', btn.dataset.value === prdState.categoryId);
  });
}

function prdComputeFilteredProducts() {
  var list = prdProducts.slice();

  if (prdState.categoryId !== "all") {
    list = list.filter(function (p) {
        return p.categoryId === prdState.categoryId;
    });
}
  if (prdState.status !== 'all') list = list.filter(function (p) { return p.status === prdState.status; });
  if (prdState.search) {

    var q = prdState.search.toLowerCase();

    list = list.filter(function (p) {

        var name = (p.name || "").toLowerCase();
        var sku = (p.sku || "").toLowerCase();

        return name.indexOf(q) !== -1 ||
               sku.indexOf(q) !== -1;

    });

}
var hasSoftFilters =
    (prdState.priceMin != null && !isNaN(prdState.priceMin)) ||
    (prdState.priceMax != null && !isNaN(prdState.priceMax)) ||
    (prdState.stockMin != null && !isNaN(prdState.stockMin)) ||
    (prdState.stockMax != null && !isNaN(prdState.stockMax)) ||
    prdState.length !== 'all' ||
    prdState.density !== 'all' ||
    prdState.laceType !== 'all';

  if (hasSoftFilters) {
    list = list.map(function (p) {
      var score = 0;
      if (prdState.priceMin != null && !isNaN(prdState.priceMin) && p.price >= prdState.priceMin) score++;
      if (prdState.priceMax != null && !isNaN(prdState.priceMax) && p.price <= prdState.priceMax) score++;
      if (prdState.stockMin != null && !isNaN(prdState.stockMin) && p.stock >= prdState.stockMin) score++;
      if (prdState.stockMax != null && !isNaN(prdState.stockMax) && p.stock <= prdState.stockMax) score++;
      if (prdState.length !== 'all' && p.length === prdState.length) score++;
      if (prdState.density !== 'all' && p.density === prdState.density) score++;
      if (prdState.laceType !== 'all' && p.laceType === prdState.laceType) score++;
      return { p: p, score: score };
    }).sort(function (a, b) { return b.score - a.score; }).map(function (x) { return x.p; });
  }

  switch (prdState.sort) {
    case 'name-asc':  list.sort(function (a, b) { return a.name.localeCompare(b.name); }); break;
    case 'name-desc': list.sort(function (a, b) { return b.name.localeCompare(a.name); }); break;
    case 'price-asc':  list.sort(function (a, b) { return a.price - b.price; }); break;
    case 'price-desc': list.sort(function (a, b) { return b.price - a.price; }); break;
    case 'stock-asc':  list.sort(function (a, b) { return a.stock - b.stock; }); break;
    case 'stock-desc': list.sort(function (a, b) { return b.stock - a.stock; }); break;
  }
  return list;
}

function renderProducts() {
  var filtered = prdComputeFilteredProducts();
  var totalItems = filtered.length;

  if (prdState.visibleCount > totalItems) prdState.visibleCount = totalItems;
  if (prdState.visibleCount < 1 && totalItems > 0) prdState.visibleCount = Math.min(prdGetBatchSize(), totalItems);

  var pageItems = filtered.slice(0, prdState.visibleCount);

  var totalCountEl = document.querySelector('[data-prd-total-count]');
  if (totalCountEl) totalCountEl.textContent = '(' + totalItems + ')';

  var body = document.querySelector('[data-prd-table-body]');
  var emptyState = document.querySelector('[data-prd-empty]');
  var table = document.querySelector('[data-prd-table]');
  if (body) body.innerHTML = pageItems.map(prdRenderRow).join('');
  if (emptyState) emptyState.hidden = totalItems !== 0;
  if (table) table.hidden = totalItems === 0;

  var selectAll = document.querySelector('[data-prd-select-all]');
  if (selectAll) selectAll.checked = false;

  var summary = document.querySelector('[data-prd-pagination-summary]');
  if (summary) {
    summary.textContent = totalItems === 0 ? 'No products found' :
      'Showing ' + pageItems.length + ' of ' + totalItems + ' products';
  }

  renderLoadControls(totalItems);
  prdSyncBulkBar();
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
      '<span class="prd-row__category">' +
    prdEscapeHtml(prdGetCategoryName(p.categoryId)) +
'</span>' +
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

function renderLoadControls(totalItems) {
  var actionsWrap = document.querySelector('[data-prd-load-actions]');
  var moreBtn = document.querySelector('[data-prd-load-more]');
  var moreLabel = document.querySelector('[data-prd-load-more-label]');
  var allBtn = document.querySelector('[data-prd-load-all]');
  if (!actionsWrap || !moreBtn || !allBtn) return;

  if (totalItems === 0) {
    actionsWrap.hidden = true;
    return;
  }

  actionsWrap.hidden = false;
  var allLoaded = prdState.visibleCount >= totalItems;

  moreBtn.classList.toggle('is-collapse', allLoaded);
  if (moreLabel) moreLabel.textContent = allLoaded ? 'Load Less' : 'Load More';
  allBtn.hidden = allLoaded;
}

function prdSyncBulkBar() {
  var bar = document.querySelector('[data-prd-bulk-bar]');
  var countEl = document.querySelector('[data-prd-bulk-count]');
  if (!bar || !countEl) return;

  // Drop any selected ids that no longer exist (e.g. deleted elsewhere)
  prdSelectedIds.forEach(function (id) {
    if (!prdProducts.some(function (p) { return p.id === id; })) prdSelectedIds.delete(id);
  });

  var count = prdSelectedIds.size;
  bar.hidden = count === 0;
  countEl.textContent = count + ' selected';

  document.querySelectorAll('[data-prd-row-check]').forEach(function (cb) {
    cb.checked = prdSelectedIds.has(cb.value);
  });

  prdRenderBulkCategoryMenu();
}

function prdRenderBulkCategoryMenu() {
  var menu = document.querySelector('[data-prd-bulk-category-menu]');
  if (!menu) return;
  menu.innerHTML = prdCategories.map(function (c) {
    return '<li><button type="button" class="prd-dropdown__item" data-value="' + c.id + '">' + prdEscapeHtml(c.name) + '</button></li>';
  }).join('') + '<li><button type="button" class="prd-dropdown__item" data-value="">Uncategorized</button></li>';
}

async function prdBulkDelete() {

    var count = prdSelectedIds.size;

    if (!count) return;

    if (!confirm("Delete " + count + " selected products?")) {
        return;
    }

    try {

        await Promise.all(
            Array.from(prdSelectedIds).map(function(id){
                return deleteProduct(id);
            })
        );

        prdSelectedIds.clear();

        await loadProducts();

        renderCategorySidebar();
        renderCategoryDropdownMenu();
        renderProducts();

        prdShowToast(count + " products deleted");

    } catch(err){

        console.error(err);

        alert("Failed to delete selected products.");

    }

}

function prdBulkSetStatus(status) {
  prdProducts.forEach(function (p) {
    if (prdSelectedIds.has(p.id)) p.status = status;
  });
  renderProducts();
  prdShowToast('Status updated for ' + prdSelectedIds.size + ' product' + (prdSelectedIds.size === 1 ? '' : 's'));
}

function prdBulkSetCategory(categoryId) {
  prdProducts.forEach(function (p) {
    if (prdSelectedIds.has(p.id)) p.categoryId = categoryId || null;
  });
  renderCategorySidebar();
  renderCategoryDropdownMenu();
  renderProducts();
  prdShowToast('Category updated for ' + prdSelectedIds.size + ' product' + (prdSelectedIds.size === 1 ? '' : 's'));
}

function prdBuildCategoryOptionsHtml(selectedId) {
  var html = '<option value="">-- Select Category --</option>';
  prdCategories.forEach(function (c) {
    html += '<option value="' + c.id + '"' + (c.id === selectedId ? ' selected' : '') + '>' + prdEscapeHtml(c.name) + '</option>';
  });
  return html;
}

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

async function saveCategoryFromModal() {

    var modal = document.querySelector("[data-prd-category-modal]");
    var nameInput = document.querySelector("[data-prd-category-name-input]");

    if (!modal || !nameInput) return;

    var name = nameInput.value.trim();

    if (!name) {
        nameInput.focus();
        return;
    }

    try {

        if (modal.dataset.mode === "edit") {

            await updateCategory(
                modal.dataset.categoryId,
                {
                    name: name
                }
            );

            prdShowToast("Category updated");

        } else {

            await createCategory({
                name: name
            });

            prdShowToast("Category created");

        }

        await loadCategories();

        renderCategorySidebar();

        renderCategoryDropdownMenu();

        renderProducts();

        closeCategoryModal();

    } catch (err) {

        console.error(err);

        alert(err.message || "Unable to save category.");

    }

}

function openProductModal(mode, product) {
  var overlay = document.querySelector('[data-prd-product-modal-overlay]');
  var modal = document.querySelector('[data-prd-product-modal]');
  var saveBtn = document.querySelector('[data-prd-product-modal-save]');
  var title = document.querySelector('[data-prd-product-modal-title]');
  var saveBtn = document.querySelector('[data-prd-product-modal-save]');
  if (!overlay || !modal) return;

  var nameInput = document.querySelector('[data-prd-name-input]');
var skuInput = document.querySelector('[data-prd-sku-input]');
var categorySelect = document.querySelector('[data-prd-category-select]');
var priceInput = document.querySelector('[data-prd-price-input]');
var stockInput = document.querySelector('[data-prd-stock-input]');
var statusSelect = document.querySelector('[data-prd-status-select]');
var badgeInput = document.querySelector('[data-prd-badge-input]');
var imageInput = document.querySelector('[data-prd-image-file-input]');
var descriptionInput = document.querySelector('[data-prd-description-input]');
var lengthInput = document.querySelector('[data-prd-length-input]');
var densityInput = document.querySelector('[data-prd-density-input]');
var laceTypeInput = document.querySelector('[data-prd-lacetype-input]');

  modal.dataset.mode = mode;
  modal.dataset.productId = product ? (product._id || product.id) : "";
  categorySelect.innerHTML = prdBuildCategoryOptionsHtml(product ? product.categoryId : '');

 if (mode === 'edit' && product) {
    title.textContent = 'Edit Product';
    nameInput.value = product.name;
    skuInput.value = product.sku;
    priceInput.value = product.price;
    stockInput.value = product.stock;
    statusSelect.value = product.status;
    if (badgeInput) badgeInput.value = product.badge || '';
    if (imageInput) imageInput.value = "";
    prdModalImages = product.images ? product.images.slice() : [];
    if (descriptionInput) descriptionInput.value = product.description || '';
    if (lengthInput) lengthInput.value = product.length || '';
    if (densityInput) densityInput.value = product.density || '';
    if (laceTypeInput) laceTypeInput.value = product.laceType || '';
    saveBtn.textContent = 'Save Changes';
   } else {
    title.textContent = 'Add Product';
    nameInput.value = '';
    skuInput.value = '';
    priceInput.value = '';
    stockInput.value = '';
    statusSelect.value = 'in-stock';
    if (badgeInput) badgeInput.value = '';
    prdModalImages = [];
    if (descriptionInput) descriptionInput.value = '';
    if (lengthInput) lengthInput.value = '';
    if (densityInput) densityInput.value = '';
    if (laceTypeInput) laceTypeInput.value = '';
    saveBtn.textContent = 'Save Product';
  }

  prdRenderImageUploader();
  overlay.classList.add('is-open');
  modal.classList.add('is-open');
  nameInput.focus();
}

function closeProductModal() {

    var overlay = document.querySelector('[data-prd-product-modal-overlay]');
    var modal = document.querySelector('[data-prd-product-modal]');

    if (overlay) overlay.classList.remove('is-open');
    if (modal) modal.classList.remove('is-open');

    prdModalImages = [];

}

function prdSetViewMainImage(src) {
  var img = document.querySelector('[data-prd-view-image]');
  var placeholder = document.querySelector('[data-prd-view-image-placeholder]');
  if (!img) return;
  if (src) {
    img.src = src;
    img.hidden = false;
    if (placeholder) placeholder.hidden = true;
  } else {
    img.hidden = true;
    if (placeholder) placeholder.hidden = false;
  }
}

function prdRenderViewThumbs(images, activeIndex) {
  var wrap = document.querySelector('[data-prd-view-thumbs]');
  if (!wrap) return;

  if (images.length <= 1) {
    wrap.innerHTML = '';
    return;
  }

  wrap.innerHTML = images.map(function (src, i) {
    return '<button type="button" class="prd-view-modal__thumb' + (i === activeIndex ? ' is-active' : '') + '" data-prd-view-thumb="' + i + '">' +
      '<img src="' + src + '" alt="" />' +
    '</button>';
  }).join('');
}

function openViewModal(product) {
  var overlay = document.querySelector('[data-prd-view-modal-overlay]');
  var modal = document.querySelector('[data-prd-view-modal]');
  if (!overlay || !modal) return;

  prdViewProductId = product.id;
  var status = PRD_STATUS_MAP[product.status] || { label: product.status };

  var images = product.images && product.images.length ? product.images : (product.image ? [product.image] : []);
  prdSetViewMainImage(images[0] || '');
  prdRenderViewThumbs(images, 0);

  document.querySelector('[data-prd-view-name]').textContent = product.name;
  document.querySelector('[data-prd-view-sku]').textContent = 'SKU: ' + (product.sku || '—');
  document.querySelector('[data-prd-view-category]').textContent = prdGetCategoryName(product.categoryId);
  document.querySelector('[data-prd-view-price]').textContent = formatAdminMoney(product.price);
  document.querySelector('[data-prd-view-stock]').textContent = product.stock;
  document.querySelector('[data-prd-view-status]').textContent = status.label;
  document.querySelector('[data-prd-view-length]').textContent = product.length || '—';
  document.querySelector('[data-prd-view-density]').textContent = product.density || '—';
  document.querySelector('[data-prd-view-lacetype]').textContent = product.laceType || '—';
  document.querySelector('[data-prd-view-description]').textContent = product.description || 'No description added.';

  overlay.classList.add('is-open');
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeViewModal() {
  var overlay = document.querySelector('[data-prd-view-modal-overlay]');
  var modal = document.querySelector('[data-prd-view-modal]');
  if (overlay) overlay.classList.remove('is-open');
  if (modal) modal.classList.remove('is-open');
  document.body.style.overflow = '';
  prdViewProductId = null;
}

async function saveProductFromModal() {
  var modal = document.querySelector('[data-prd-product-modal]');
  if (!modal) return;
  const saveBtn = modal.querySelector("[data-prd-product-modal-save]");

if (!saveBtn) {
    console.error("Save button not found.");
    return;
}

  var nameInput = document.querySelector('[data-prd-name-input]');
  var skuInput = document.querySelector('[data-prd-sku-input]');
  var categorySelect = document.querySelector('[data-prd-category-select]');
  var priceInput = document.querySelector('[data-prd-price-input]');
  var stockInput = document.querySelector('[data-prd-stock-input]');
  var statusSelect = document.querySelector('[data-prd-status-select]');
  var descriptionInput = document.querySelector('[data-prd-description-input]');
  var lengthInput = document.querySelector('[data-prd-length-input]');
  var densityInput = document.querySelector('[data-prd-density-input]');
  var laceTypeInput = document.querySelector('[data-prd-lacetype-input]');
  var badgeInput = document.querySelector('[data-prd-badge-input]');

  if (!nameInput.value.trim()) { nameInput.focus(); return; }
  if (!categorySelect.value) {
    alert("Please select a category.");
    categorySelect.focus();
    return;
}

  var sku = skuInput.value.trim();
  if (sku) {
    var skuTaken = prdProducts.some(function (p) {
      return p.sku.toLowerCase() === sku.toLowerCase() && p.id !== modal.dataset.productId;
    });
    if (skuTaken) {
      alert('SKU "' + sku + '" is already used by another product.');
      skuInput.focus();
      return;
    }
  }

const formData = new FormData();

formData.append("name", nameInput.value.trim());

formData.append("sku", skuInput.value.trim());

formData.append("description", descriptionInput.value.trim());

formData.append("price", priceInput.value);

formData.append("stock", stockInput.value);

formData.append("status", statusSelect.value);

formData.append("badge", badgeInput.value.trim());

formData.append("categoryId", categorySelect.value);

formData.append("length", lengthInput.value);

formData.append("density", densityInput.value);

formData.append("laceType", laceTypeInput.value);

prdModalImages.forEach(function(image){

    if(image instanceof File){

        formData.append("images", image);

    }

});

saveBtn.disabled = true;
saveBtn.textContent = "Saving...";

(async function () {
  

    try {

        if (modal.dataset.mode === "edit") {

            await updateProduct(
                modal.dataset.productId,
                formData
            );

            prdShowToast("Product updated successfully");

        } else {

            await createProduct(formData);

            prdShowToast("Product created successfully");

        }

        await Promise.all([
            loadCategories(),
            loadProducts()
        ]);

        renderCategorySidebar();

        renderCategoryDropdownMenu();

        renderProducts();

        closeProductModal();

    } catch (err) {

        console.error(err);

        alert(err.message || "Something went wrong.");

    } finally {

    saveBtn.disabled = false;

    saveBtn.textContent =
        modal.dataset.mode === "edit"
            ? "Save Changes"
            : "Save Product";

}

})();
}

/* =========================================================
   ONE delegated click/input/change listener for the whole
   page. This is what fixes both problems: nothing depends on
   an element existing at load time, and there is exactly one
   handler no matter how many times bindAllEvents() might
   accidentally be called.
   ========================================================= */
function bindAllEvents() {
  document.addEventListener("click", async function (e) {

    // --- Category sidebar ---
    var selectCat = e.target.closest('[data-prd-select-category]');
    if (selectCat) { prdSetCategoryFilter(selectCat.dataset.prdSelectCategory); return; }

    var editCat = e.target.closest('[data-prd-edit-category]');
    if (editCat) {
      var cat = prdCategories.find(function (c) { return c.id === editCat.dataset.prdEditCategory; });
      if (cat) openCategoryModal('edit', cat);
      return;
    }

    var deleteCat = e.target.closest('[data-prd-delete-category]');
    if (deleteCat) { prdDeleteCategory(deleteCat.dataset.prdDeleteCategory); return; }

    if (e.target.closest('[data-prd-add-category]')) { openCategoryModal('add', null); return; }

    // --- Category dropdown (toolbar) ---
    var catToggle = e.target.closest('[data-prd-category-toggle]');
    if (catToggle) {
      e.stopPropagation();
      var catMenu = document.querySelector('[data-prd-category-menu]');
      prdCloseAllDropdowns(catMenu);
      var catOpen = catMenu.classList.toggle('is-open');
      catToggle.setAttribute('aria-expanded', String(catOpen));
      if (catOpen) prdClampToViewport(catMenu); else prdResetClamp(catMenu);
      return;
    }
    var catItem = e.target.closest('[data-prd-category-menu] [data-value]');
    if (catItem) {
      prdSetCategoryFilter(catItem.dataset.value);
      var closedCatMenu = catItem.closest('[data-prd-category-menu]');
      closedCatMenu.classList.remove('is-open');
      prdResetClamp(closedCatMenu);
      document.querySelector('[data-prd-category-toggle]').setAttribute('aria-expanded', 'false');
      return;
    }

    // --- Status dropdown ---
    var statusToggle = e.target.closest('[data-prd-status-toggle]');
    if (statusToggle) {
      e.stopPropagation();
      var statusMenu = document.querySelector('[data-prd-status-menu]');
      prdCloseAllDropdowns(statusMenu);
      var statusOpen = statusMenu.classList.toggle('is-open');
      statusToggle.setAttribute('aria-expanded', String(statusOpen));
      if (statusOpen) prdClampToViewport(statusMenu); else prdResetClamp(statusMenu);
      return;
    }
var statusItem = e.target.closest('[data-prd-status-menu] [data-value]');
    if (statusItem) {
      prdState.status = statusItem.dataset.value;
      prdState.visibleCount = prdGetBatchSize();
      document.querySelector('[data-prd-status-label]').textContent = statusItem.textContent;
      document.querySelectorAll('[data-prd-status-menu] [data-value]').forEach(function (b) {
        b.classList.toggle('is-active', b === statusItem);
      });
      var closedStatusMenu = statusItem.closest('[data-prd-status-menu]');
      closedStatusMenu.classList.remove('is-open');
      prdResetClamp(closedStatusMenu);
      document.querySelector('[data-prd-status-toggle]').setAttribute('aria-expanded', 'false');
      renderProducts();
      return;
    }

    // --- Advanced filter panel ---
    var filterToggle = e.target.closest('[data-prd-filter-toggle]');
    if (filterToggle) {
      e.stopPropagation();
      var filterPanel = document.querySelector('[data-prd-filter-panel]');
      prdCloseAllDropdowns(filterPanel);
      var filterOpen = filterPanel.classList.toggle('is-open');
      filterToggle.setAttribute('aria-expanded', String(filterOpen));
      if (filterOpen) prdClampToViewport(filterPanel); else prdResetClamp(filterPanel);
      return;
    }
if (e.target.closest('[data-prd-filter-apply]')) {
  var sortSelect = document.querySelector('[data-prd-sort-select]');
  var minInput = document.querySelector('[data-prd-price-min]');
  var maxInput = document.querySelector('[data-prd-price-max]');
  var stockMinInput = document.querySelector('[data-prd-stock-min]');
  var stockMaxInput = document.querySelector('[data-prd-stock-max]');
  var lengthSelect = document.querySelector('[data-prd-length-filter]');
  var densitySelect = document.querySelector('[data-prd-density-filter]');
  var laceSelect = document.querySelector('[data-prd-lacetype-filter]');
  prdState.sort = sortSelect ? sortSelect.value : 'default';
  prdState.priceMin = minInput && minInput.value !== '' ? parseFloat(minInput.value) : null;
  prdState.priceMax = maxInput && maxInput.value !== '' ? parseFloat(maxInput.value) : null;
  prdState.stockMin = stockMinInput && stockMinInput.value !== '' ? parseFloat(stockMinInput.value) : null;
  prdState.stockMax = stockMaxInput && stockMaxInput.value !== '' ? parseFloat(stockMaxInput.value) : null;
  prdState.length = lengthSelect ? lengthSelect.value : 'all';
  prdState.density = densitySelect ? densitySelect.value : 'all';
prdState.laceType = laceSelect ? laceSelect.value : 'all';
  prdState.visibleCount = prdGetBatchSize();
  var appliedFilterPanel = document.querySelector('[data-prd-filter-panel]');
  appliedFilterPanel.classList.remove('is-open');
  prdResetClamp(appliedFilterPanel);
  prdState.page = 1;
  document.querySelector('[data-prd-filter-toggle]').setAttribute('aria-expanded', 'false');
  renderProducts();
  return;
}

if (e.target.closest('[data-prd-filter-reset]')) {
  prdState.sort = 'default';
prdState.priceMin = null;
  prdState.priceMax = null;
  prdState.stockMin = null;
  prdState.stockMax = null;
  prdState.length = 'all';
  prdState.density = 'all';
  prdState.laceType = 'all';
var sortSel = document.querySelector('[data-prd-sort-select]');
  var minEl = document.querySelector('[data-prd-price-min]');
  var maxEl = document.querySelector('[data-prd-price-max]');
  var stockMinEl = document.querySelector('[data-prd-stock-min]');
  var stockMaxEl = document.querySelector('[data-prd-stock-max]');
  var lengthEl = document.querySelector('[data-prd-length-filter]');
  var densityEl = document.querySelector('[data-prd-density-filter]');
  var laceEl = document.querySelector('[data-prd-lacetype-filter]');
  if (sortSel) sortSel.value = 'default';
  if (minEl) minEl.value = '';
  if (maxEl) maxEl.value = '';
  if (stockMinEl) stockMinEl.value = '';
  if (stockMaxEl) stockMaxEl.value = '';
  if (lengthEl) lengthEl.value = 'all';
  if (densityEl) densityEl.value = 'all';
if (laceEl) laceEl.value = 'all';
  prdState.visibleCount = prdGetBatchSize();
  renderProducts();
  return;
}

if (e.target.closest('[data-prd-filter-panel]')) { e.stopPropagation(); return; }

    // --- Search clear ---
    if (e.target.closest('[data-prd-search-clear]')) {
      var searchInput = document.querySelector('[data-prd-search-input]');
      if (searchInput) {
        searchInput.value = '';
        prdState.search = '';
        prdState.page = 1;
        renderProducts();
        var clearBtn = document.querySelector('[data-prd-search-clear]');
        if (clearBtn) clearBtn.hidden = true;
        searchInput.focus();
      }
      return;
    }

    // --- Select all ---
    // (handled via change listener below)

    // --- Product row edit/delete ---
    var editProduct = e.target.closest('[data-prd-edit-product]');

if (editProduct) {

    try {

        const apiProduct = await getProduct(editProduct.dataset.prdEditProduct);

const product = {
    id: apiProduct._id,
    name: apiProduct.name,
    sku: apiProduct.slug,
    description: apiProduct.description,
    price: apiProduct.price,
    stock: apiProduct.stock,
    status:
        apiProduct.stock <= 0
            ? "out-of-stock"
            : apiProduct.stock < 5
            ? "low-stock"
            : "in-stock",
    categoryId: apiProduct.category?._id || "",
    image: apiProduct.images?.[0] || "",
    images: apiProduct.images || [],
    length: apiProduct.length,
    density: apiProduct.density,
    laceType: apiProduct.laceType
};

 openProductModal("edit", mapProduct(apiProduct));

    } catch (err) {

        console.error(err);

        alert("Unable to load product.");

    }

    return;
}
var deleteProductBtn = e.target.closest('[data-prd-delete-product]');

if (deleteProductBtn) {

    var toDelete = prdProducts.find(function (p) {
        return p.id === deleteProductBtn.dataset.prdDeleteProduct;
    });

    if (!toDelete) return;

    if (!window.confirm('Delete "' + toDelete.name + '"? This can\'t be undone.')) {
        return;
    }

    (async function () {

        try {

            await deleteProduct(toDelete.id);

            await loadProducts();

            renderCategorySidebar();
            renderCategoryDropdownMenu();
            renderProducts();

            prdShowToast("Product deleted");

        } catch (err) {

            console.error(err);

            alert("Failed to delete product.");

        }

    })();

    return;

}

// --- Row checkbox: toggle selection, let native check happen too ---
    var rowCheck = e.target.closest('[data-prd-row-check]');
    if (rowCheck) {
      if (rowCheck.checked) prdSelectedIds.add(rowCheck.value);
      else prdSelectedIds.delete(rowCheck.value);
      prdSyncBulkBar();
      return;
    }

    // --- Bulk bar ---
    if (e.target.closest('[data-prd-bulk-clear]')) {
      prdSelectedIds.clear();
      prdSyncBulkBar();
      return;
    }
    if (e.target.closest('[data-prd-bulk-delete]')) { prdBulkDelete(); return; }

    var bulkStatusToggle = e.target.closest('[data-prd-bulk-status-toggle]');
    if (bulkStatusToggle) {
      e.stopPropagation();
      var bulkStatusMenu = document.querySelector('[data-prd-bulk-status-menu]');
      prdCloseAllDropdowns(bulkStatusMenu);
      var bsOpen = bulkStatusMenu.classList.toggle('is-open');
      bulkStatusToggle.setAttribute('aria-expanded', String(bsOpen));
      return;
    }
    var bulkStatusItem = e.target.closest('[data-prd-bulk-status-menu] [data-value]');
    if (bulkStatusItem) {
      prdBulkSetStatus(bulkStatusItem.dataset.value);
      bulkStatusItem.closest('[data-prd-bulk-status-menu]').classList.remove('is-open');
      return;
    }

    var bulkCatToggle = e.target.closest('[data-prd-bulk-category-toggle]');
    if (bulkCatToggle) {
      e.stopPropagation();
      var bulkCatMenu = document.querySelector('[data-prd-bulk-category-menu]');
      prdCloseAllDropdowns(bulkCatMenu);
      var bcOpen = bulkCatMenu.classList.toggle('is-open');
      bulkCatToggle.setAttribute('aria-expanded', String(bcOpen));
      return;
    }
    var bulkCatItem = e.target.closest('[data-prd-bulk-category-menu] [data-value]');
    if (bulkCatItem) {
      prdBulkSetCategory(bulkCatItem.dataset.value);
      bulkCatItem.closest('[data-prd-bulk-category-menu]').classList.remove('is-open');
      return;
    }

// --- Open view modal on row click (anywhere except the action icons) ---
var clickedRow = e.target.closest(".prd-row");

if (clickedRow && !e.target.closest(".prd-row__actions")) {

    const productId = clickedRow.dataset.productId;

    const product = prdProducts.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        console.error("Product not found:", productId);
        return;
    }

    openViewModal(product);

    return;
}

    // --- View product modal ---
    if (e.target.closest('[data-prd-view-modal-close]') || e.target === document.querySelector('[data-prd-view-modal-overlay]')) {
      closeViewModal();
      return;
    }
if (e.target.closest('[data-prd-view-edit]')) {

    closeViewModal();

    try {

        const product = await getProduct(prdViewProductId);

        openProductModal("edit", product);

    } catch (err) {

        console.error(err);

        alert("Unable to load product.");

    }

    return;

}

    if (e.target.closest('[data-prd-view-duplicate]')) {

    closeViewModal();

    try {

        const product = await getProduct(prdViewProductId);

        product._id = null;
        product.id = null;
        product.sku = "";
        product.slug = "";
        product.name += " (Copy)";

        openProductModal("add", product);

    } catch (err) {

        console.error(err);

        alert("Unable to duplicate product.");

    }

    return;

}

    var viewThumb = e.target.closest('[data-prd-view-thumb]');
    if (viewThumb) {
      var viewingProduct = prdProducts.find(function (p) { return p.id === prdViewProductId; });
      if (viewingProduct) {
        var vImages = viewingProduct.images && viewingProduct.images.length ? viewingProduct.images : (viewingProduct.image ? [viewingProduct.image] : []);
        var idx = parseInt(viewThumb.dataset.prdViewThumb, 10);
        prdSetViewMainImage(vImages[idx] || '');
        prdRenderViewThumbs(vImages, idx);
      }
      return;
    }
    if (e.target.closest('[data-prd-view-delete]')) {

    var deleteFromView = prdProducts.find(function (p) {
        return p.id === prdViewProductId;
    });

    if (!deleteFromView) return;

    if (!window.confirm('Delete "' + deleteFromView.name + '"? This can\'t be undone.')) {
        return;
    }

    (async function () {

        try {

            await deleteProduct(deleteFromView.id);

            closeViewModal();

            await loadProducts();

            renderCategorySidebar();
            renderCategoryDropdownMenu();
            renderProducts();

            prdShowToast("Product deleted");

        } catch (err) {

            console.error(err);

            alert("Failed to delete product.");

        }

    })();

    return;

}

    // --- Load more / load less / load all ---
    if (e.target.closest('[data-prd-load-more]')) {
      var totalForLoad = prdComputeFilteredProducts().length;
      if (prdState.visibleCount >= totalForLoad) {
        prdState.visibleCount = Math.min(prdGetBatchSize(), totalForLoad);
      } else {
        prdState.visibleCount = Math.min(prdState.visibleCount + prdGetBatchSize(), totalForLoad);
      }
      renderProducts();
      return;
    }
    if (e.target.closest('[data-prd-load-all]')) {
      prdState.visibleCount = prdComputeFilteredProducts().length;
      renderProducts();
      return;
    }

    // --- Category modal ---
    if (e.target.closest('[data-prd-category-modal-close]') || e.target.closest('[data-prd-category-modal-cancel]') || e.target === document.querySelector('[data-prd-category-modal-overlay]')) {
      closeCategoryModal();
      return;
    }
    if (e.target.closest('[data-prd-category-modal-save]')) { saveCategoryFromModal(); return; }

    // --- Product modal ---
    if (e.target.closest('[data-prd-add-product]')) { openProductModal('add', null); return; }
    if (e.target.closest('[data-prd-product-modal-close]') || e.target.closest('[data-prd-product-modal-cancel]') || e.target === document.querySelector('[data-prd-product-modal-overlay]')) {
      closeProductModal();
      return;
    }
    if (e.target.closest('[data-prd-product-modal-save]')) { saveProductFromModal(); return; }

if (e.target.closest('[data-prd-image-delete]')) {
      prdModalImages.shift();
      prdRenderImageUploader();
      return;
    }

    if (e.target.closest('[data-prd-image-main]') || e.target.closest('[data-prd-image-edit]')) {
      document.querySelector('[data-prd-image-file-input]').click();
      return;
    }

    if (e.target.closest('[data-prd-image-add]')) {
      document.querySelector('[data-prd-image-file-input-extra]').click();
      return;
    }

    var thumbRemove = e.target.closest('[data-prd-image-thumb-remove]');
    if (thumbRemove) {
      prdModalImages.splice(parseInt(thumbRemove.dataset.prdImageThumbRemove, 10), 1);
      prdRenderImageUploader();
      return;
    }

    // --- Close dropdowns on any other click ---
    prdCloseAllDropdowns(null);
  });

 document.addEventListener("input", function (e) {

    // ==========================
    // SEARCH
    // ==========================

    // if (e.target.matches("[data-prd-search-input]")) {

    //     prdState.search = e.target.value.trim().toLowerCase();

    //     var clearBtn = document.querySelector("[data-prd-search-clear]");

    //     if (clearBtn) {
    //         clearBtn.hidden = e.target.value.trim() === "";
    //     }

    //     renderProducts();

    // }

    // ==========================
    // AUTO STOCK STATUS
    // ==========================

    // if (e.target.matches("[data-prd-stock-input]")) {

    //     var statusSelect = document.querySelector("[data-prd-status-select]");

    //     var stock = parseInt(e.target.value, 10);

    //     if (!statusSelect) return;

    //     if (isNaN(stock)) {

    //         statusSelect.value = "in-stock";

    //     } else if (stock <= 0) {

    //         statusSelect.value = "out-of-stock";

    //     } else if (stock < 5) {

    //         statusSelect.value = "low-stock";

    //     } else {

    //         statusSelect.value = "in-stock";

    //     }

    // }

});

document.addEventListener('change', function (e) {
    if (e.target.matches('[data-prd-select-all]')) {
      var checked = e.target.checked;
      document.querySelectorAll('[data-prd-row-check]').forEach(function (cb) {
        cb.checked = checked;
        if (checked) prdSelectedIds.add(cb.value); else prdSelectedIds.delete(cb.value);
      });
      prdSyncBulkBar();
    }

    if (e.target.matches('[data-prd-image-file-input]')) {

    var file = e.target.files[0];

    if (file) {

        prdModalImages[0] = file;

        prdRenderImageUploader();

    }

    e.target.value = "";

}

    if (e.target.matches("[data-prd-image-file-input-extra]")) {

    Array.from(e.target.files).forEach(function(file){

        prdModalImages.push(file);

    });

    prdRenderImageUploader();

    e.target.value = "";

}
  });

document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var catModal = document.querySelector('[data-prd-category-modal]');
    var prodModal = document.querySelector('[data-prd-product-modal]');
    var viewModal = document.querySelector('[data-prd-view-modal]');
    if (catModal && catModal.classList.contains('is-open')) closeCategoryModal();
    if (prodModal && prodModal.classList.contains('is-open')) closeProductModal();
    if (viewModal && viewModal.classList.contains('is-open')) closeViewModal();
  });

  // Re-clamp any open dropdown/panel on resize or orientation change,
  // since a shift computed for one viewport width may no longer be
  // correct (or needed) after the screen size changes.
  window.addEventListener('resize', function () {
    document.querySelectorAll('.prd-dropdown__menu.is-open, .prd-filter-panel.is-open').forEach(function (el) {
      prdClampToViewport(el);
    });
  });



}

function prdCloseAllDropdowns(except) {
  document.querySelectorAll('.prd-dropdown__menu.is-open, .prd-filter-panel.is-open').forEach(function (el) {
    if (el !== except) {
      el.classList.remove('is-open');
      prdResetClamp(el);
    }
  });
  document.querySelectorAll('.prd-dropdown__toggle[aria-expanded="true"]').forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');
  });
}

} // end __prdBooted guard


function prdRenderImageUploader() {
  var mainImg = document.querySelector('[data-prd-image-preview]');
  var placeholder = document.querySelector('[data-prd-image-placeholder]');
  var thumbsWrap = document.querySelector('[data-prd-image-thumbs]');
  if (!mainImg || !thumbsWrap) return;

  if (prdModalImages[0]) {
    mainImg.src =
    typeof prdModalImages[0] === "string"
        ? prdModalImages[0]
        : prdPreviewImage(prdModalImages[0]);
    mainImg.hidden = false;
    placeholder.hidden = true;
  } else {
    mainImg.hidden = true;
    placeholder.hidden = false;
  }

  var extraHtml = prdModalImages.slice(1).map(function (src, i) {
    return '<div class="prd-image-thumb" data-thumb-index="' + (i + 1) + '">' +
      '<img src="' +

(
typeof src === "string"
? src
: prdPreviewImage(src)

)

+ '" alt="" />' +
      '<button type="button" class="prd-image-thumb__remove" data-prd-image-thumb-remove="' + (i + 1) + '" aria-label="Remove image">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
      '</button>' +
    '</div>';
  }).join('');

  thumbsWrap.innerHTML = extraHtml +
    '<button type="button" class="prd-image-add" data-prd-image-add aria-label="Add another image">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>' +
    '</button>';
}

function prdPreviewImage(file) {

    if (file.__previewUrl) {
        return file.__previewUrl;
    }

    file.__previewUrl = URL.createObjectURL(file);

    return file.__previewUrl;

}

var prdToastTimer = null;
function prdShowToast(message) {
  var toast = document.querySelector('[data-prd-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(function () { toast.classList.add('is-visible'); });

  clearTimeout(prdToastTimer);
  prdToastTimer = setTimeout(function () {
    toast.classList.remove('is-visible');
    setTimeout(function () { toast.hidden = true; }, 300);
  }, 2200);
}