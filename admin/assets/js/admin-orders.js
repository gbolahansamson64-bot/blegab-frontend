// assets/js/admin-orders.js
/* =========================================================
   ADMIN ORDERS PAGE JS
   Renders orders list with expandable detail modal.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initOrdersPage();
  initOrderModal();
  initOrdersFilter();
});



/* -----------------------------
   Status labels
   ----------------------------- */
var ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

/* -----------------------------
   Country name -> short code
   Add more as needed; falls back to the full name if not listed.
   ----------------------------- */
var COUNTRY_CODES = {
  'United States': 'USA',
  'Canada': 'CA',
  'United Kingdom': 'UK',
  'Nigeria': 'NG',
  'Ghana': 'GH',
  'South Africa': 'ZA',
  'Australia': 'AU'
};

function shortCountry(country) {
  return COUNTRY_CODES[country] || country;
}

async function fetchOrders() {

    try {

        const response = await fetch(
            "https://api.blegab.com/api/admin/orders",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load orders");
        }

        window.BLEGAB_ADMIN_ORDERS = data.orders.map(function (order) {

    return {

        id: order._id,

        productName: order.orderItems[0]?.name || "Product",

        productImage:
    order.orderItems[0]?.image ||
    order.orderItems[0]?.product?.images?.[0] ||
    "assets/images/product-placeholder.webp",

        customerName:
            order.shippingAddress.firstName +
            " " +
            order.shippingAddress.lastName,

        customerEmail: order.customerEmail,

        customerPhone: order.shippingAddress.phone,

        country: order.shippingAddress.country,

        state: order.shippingAddress.state,

        city: order.shippingAddress.city,

        streetAddress: order.shippingAddress.address,

        zipCode: order.shippingAddress.postalCode,

        apartment: "",

        total: order.total,

        quantity: order.orderItems.reduce(function (total, item) {
         return total + item.quantity;
        }, 0),

        items: order.orderItems.map(function(item){

    return {

        productId: item.product?._id,

        name: item.name,

        image:
         item.image ||
          item.product?.images?.[0] ||
         "assets/images/product-placeholder.webp",

        quantity: item.quantity,

        price: item.price,

        description: item.product?.description || "",

        sku: item.product?.sku || "",

        category:
         item.product?.category?.name || "",

        length: item.product?.length || "",

        density: item.product?.density || "",

        laceType: item.product?.laceType || ""

    };

}),

        paymentMethod: order.paymentMethod,

        paymentDate: new Date(order.createdAt).toLocaleDateString(),

        paymentTime: new Date(order.createdAt).toLocaleTimeString(),

        orderDate: new Date(order.createdAt).toLocaleDateString(),

        status:
    order.orderStatus
        .toLowerCase()
        .trim(),

        productDescription:
    order.orderItems[0]?.product?.description || "",

productSku:
    order.orderItems[0]?.product?.sku || "",

category:
    order.orderItems[0]?.product?.category?.name || "",

length:
    order.orderItems[0]?.product?.length || "",

density:
    order.orderItems[0]?.product?.density || "",

laceType:
    order.orderItems[0]?.product?.laceType || ""

    };

});

        applyOrdersFilter(currentOrderFilter);

    } catch (error) {

        console.error(error);

        renderOrders([]);

    }

}

/* -----------------------------
   Render orders list
   ----------------------------- */
async function initOrdersPage() {

    await fetchOrders();

}

window.addEventListener('resize', function () {
  ordCurrentPage = 1;
  renderOrders(currentOrders);
});

var currentOrders = [];
var selectedOrderIds = new Set();
var ordCurrentPage = 1;

// Remember the currently selected status filter
var currentOrderFilter = 'all';

function ordGetPageSize() {
  return window.matchMedia('(max-width: 1023.98px)').matches ? 5 : 10;
}

function renderOrders(orders) {
  currentOrders = orders || [];
  var list = document.querySelector('[data-orders-list]');
  if (!list) return;

  if (currentOrders.length === 0) {
    list.innerHTML = '' +
      '<div class="admin-orders-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
          '<path d="M7 3h10l1 4H6z" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M5 7h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<p class="admin-orders-empty__title">No orders found</p>' +
        '<p class="admin-orders-empty__text">Orders will appear here when customers make purchases.</p>' +
      '</div>';
    renderOrdersPagination(0, 0, ordGetPageSize());
    return;
  }

  var ordPageSize = ordGetPageSize();
  var ordTotalPages = Math.max(1, Math.ceil(currentOrders.length / ordPageSize));
  if (ordCurrentPage > ordTotalPages) ordCurrentPage = ordTotalPages;
  if (ordCurrentPage < 1) ordCurrentPage = 1;
  var pageItems = currentOrders.slice((ordCurrentPage - 1) * ordPageSize, ordCurrentPage * ordPageSize);

  list.innerHTML = pageItems.map(function (order) {
    var statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

    return '' +
      '<div class="order-row" data-order-id="' + order.id + '">' +
        '<div class="order-row__id-section">' +
          '<button type="button" class="order-row__check' + (selectedOrderIds.has(order.id) ? ' is-checked' : '') + '" data-row-check aria-label="Select order">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
              '<path d="M5 12l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</button>' +
          '<span class="order-row__id">#' + order.id + '</span>' +
        '</div>' +
        '<div class="order-row__product">' +
          '<img src="' + order.productImage + '" alt="' + order.productName + '" class="order-row__product-image" />' +
          '<div class="order-row__product-info">' +
            '<span class="order-row__product-name">' + order.productName + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="order-row__customer">' +
          '<span class="order-row__customer-name">' + order.customerName + '</span>' +
          '<span class="order-row__customer-country">' + shortCountry(order.country) + '</span>' +
        '</div>' +
        '<span class="order-row__state">' + order.state + '</span>' +
        '<span class="order-row__total">$' + order.total.toFixed(2) + '</span>' +
        '<div class="order-row__status-wrap">' +
          '<span class="order-status order-status--' + order.status + '">' + statusLabel + '</span>' +
        '</div>' +
        '<span class="order-row__date">' + order.orderDate + '</span>' +
        '<div class="order-row__actions">' +
          '<button type="button" class="order-row__view" data-download-toggle aria-label="Order actions">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<circle cx="12" cy="12" r="1.5"/>' +
              '<circle cx="12" cy="5" r="1.5"/>' +
              '<circle cx="12" cy="19" r="1.5"/>' +
            '</svg>' +
          '</button>' +
          '<div class="download-menu" data-download-menu>' +
            '<button type="button" class="download-menu__item" data-download-pdf="' + order.id + '">Download as PDF</button>' +
            '<button type="button" class="download-menu__item" data-download-doc="' + order.id + '">Download as DOC</button>' +
            '<button type="button" class="download-menu__item download-menu__item--delete" data-delete-order="' + order.id + '">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }).join('');

  updateDeleteSelectedUI();
  renderOrdersPagination(ordTotalPages, currentOrders.length, ordPageSize);
}

function renderOrdersPagination(totalPages, totalItems, pageSize) {
  var wrap = document.querySelector('[data-orders-pagination]');
  var summary = document.querySelector('[data-orders-pagination-summary]');
  var pages = document.querySelector('[data-orders-pagination-pages]');
  if (!wrap || !pages) return;

  if (totalItems === 0 || totalPages <= 1) {
    wrap.hidden = true;
    pages.innerHTML = '';
    return;
  }
  wrap.hidden = false;

  var start = (ordCurrentPage - 1) * pageSize + 1;
  var end = Math.min(ordCurrentPage * pageSize, totalItems);
  if (summary) summary.textContent = 'Showing ' + start + '\u2013' + end + ' of ' + totalItems + ' orders';

  var html = '<button type="button" class="ord-page-btn" data-ord-page="prev"' + (ordCurrentPage === 1 ? ' disabled' : '') + ' aria-label="Previous page">\u2039</button>';
  for (var i = 1; i <= totalPages; i++) {
    html += '<button type="button" class="ord-page-btn' + (i === ordCurrentPage ? ' is-active' : '') + '" data-ord-page="' + i + '">' + i + '</button>';
  }
  html += '<button type="button" class="ord-page-btn" data-ord-page="next"' + (ordCurrentPage === totalPages ? ' disabled' : '') + ' aria-label="Next page">\u203a</button>';
  pages.innerHTML = html;
}

function updateDeleteSelectedUI() {
  var btn = document.querySelector('[data-delete-selected]');
  if (btn) {
    var count = selectedOrderIds.size;
    btn.hidden = count === 0;
    var countLabel = btn.querySelector('[data-delete-selected-count]');
    if (countLabel) countLabel.textContent = 'Delete Selected (' + count + ')';
  }

  var selectAllBtn = document.querySelector('[data-select-all-toggle]');
  if (selectAllBtn) {
    var allSelected = currentOrders.length > 0 && currentOrders.every(function (o) { return selectedOrderIds.has(o.id); });
    selectAllBtn.classList.toggle('is-checked', allSelected);
  }
}

function toggleOrderSelection(id) {
  if (selectedOrderIds.has(id)) {
    selectedOrderIds.delete(id);
  } else {
    selectedOrderIds.add(id);
  }
  var rowCheck = document.querySelector('.order-row[data-order-id="' + id + '"] [data-row-check]');
  if (rowCheck) rowCheck.classList.toggle('is-checked', selectedOrderIds.has(id));
  updateDeleteSelectedUI();
}

function setAllSelected(select) {
  selectedOrderIds.clear();
  if (select) {
    currentOrders.forEach(function (o) { selectedOrderIds.add(o.id); });
  }
  document.querySelectorAll('[data-row-check]').forEach(function (el) {
    var id = el.closest('.order-row').dataset.orderId;
    el.classList.toggle('is-checked', selectedOrderIds.has(id));
  });
  updateDeleteSelectedUI();
}

function applyOrdersFilter(status) {

  status = String(status || 'all').toLowerCase().trim();

  console.log("FILTER SELECTED:", status);

  var allOrders = window.BLEGAB_ADMIN_ORDERS || [];

  if (status === 'all') {

    renderOrders(allOrders);

    return;
  }

  var filteredOrders = allOrders.filter(function (order) {

    var orderStatus = String(order.status || '')
      .toLowerCase()
      .trim();

    console.log(
      "Checking order:",
      order.id,
      "Status:",
      orderStatus,
      "Against:",
      status
    );

    return orderStatus === status;

  });

  console.log("FILTERED ORDERS:", filteredOrders);

  renderOrders(filteredOrders);
}

async function deleteOrderById(id) {

    try {

        const response = await fetch(

            "https://api.blegab.com/api/admin/orders/" + id,

            {
                method: "DELETE",
                credentials: "include"
            }

        );

        const data = await response.json();

        console.log("ADMIN ORDERS API RESPONSE:", data);

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete order");
        }

        selectedOrderIds.delete(id);

        await fetchOrders();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

async function deleteSelectedOrders() {

    if (selectedOrderIds.size === 0) return;

    try {

        const response = await fetch(

            "https://api.blegab.com/api/admin/orders",

            {
                method: "DELETE",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    orderIds: Array.from(selectedOrderIds)
                })

            }

        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete orders");
        }

        selectedOrderIds.clear();

        await fetchOrders();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

async function updateOrderStatus(orderId, status) {

    try {

        const response = await fetch(

            "https://api.blegab.com/api/admin/orders/" + orderId + "/status",

            {

                method: "PATCH",

                credentials: "include",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    orderStatus: status

                })

            }

        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Failed to update order");

        }

        await fetchOrders();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

/* -----------------------------
   Order detail modal
   ----------------------------- */
function initOrderModal() {
  var overlay = document.querySelector('[data-order-modal-overlay]');
  var modal = document.querySelector('[data-order-modal]');
  var closeBtn = document.querySelector('[data-order-modal-close]');

  if (!overlay || !modal) return;

  var currentModalOrder = null;

  // Row click opens modal; dots button opens the download menu instead;
  // pagination buttons move between pages.
  document.addEventListener('click', async function (e) {
    var pageBtn = e.target.closest('[data-ord-page]');
    var toggleBtn = e.target.closest('[data-download-toggle]');
    var pdfBtn = e.target.closest('[data-download-pdf]');
    var docBtn = e.target.closest('[data-download-doc]');
    var row = e.target.closest('.order-row');

    var rowCheckBtn = e.target.closest('[data-row-check]');
    var selectAllBtn = e.target.closest('[data-select-all-toggle]');
    var deleteOrderBtn = e.target.closest('[data-delete-order]');
    var deleteSelectedBtn = e.target.closest('[data-delete-selected]');

    if (pageBtn) {
      e.stopPropagation();
      var val = pageBtn.dataset.ordPage;
      if (val === 'prev') ordCurrentPage--;
      else if (val === 'next') ordCurrentPage++;
      else ordCurrentPage = parseInt(val, 10);
      renderOrders(currentOrders);
      return;
    }

    if (rowCheckBtn) {
      e.stopPropagation();
      var checkRow = rowCheckBtn.closest('.order-row');
      if (checkRow) toggleOrderSelection(checkRow.dataset.orderId);
      return;
    }

    if (selectAllBtn) {
      e.stopPropagation();
      var allCurrentlySelected = currentOrders.length > 0 && currentOrders.every(function (o) { return selectedOrderIds.has(o.id); });
      setAllSelected(!allCurrentlySelected);
      return;
    }

    if (deleteOrderBtn) {

    e.stopPropagation();

    var delId = deleteOrderBtn.dataset.deleteOrder;

    if (confirm("Delete this order? This cannot be undone.")) {

        await deleteOrderById(delId);

    }

    closeAllDownloadMenus();

    return;

}

    if (deleteSelectedBtn) {

    e.stopPropagation();

    if (confirm(
        "Delete " +
        selectedOrderIds.size +
        " selected order(s)? This cannot be undone."
    )) {

        await deleteSelectedOrders();

    }

    return;

}

    if (toggleBtn) {
      e.stopPropagation();
      var menu = toggleBtn.nextElementSibling;
      var isOpen = menu.classList.contains('is-open');
      closeAllDownloadMenus();
      if (!isOpen) menu.classList.add('is-open');
      return;
    }

    if (pdfBtn) {
      e.stopPropagation();
      var pdfVal = pdfBtn.dataset.downloadPdf;
      if (pdfVal === 'all') {
        downloadOrdersPdf(currentOrders, 'orders-export', 'Orders Report');
      } else {
        var pdfOrder = window.BLEGAB_ADMIN_ORDERS.find(function (o) { return o.id === pdfVal; });
        if (pdfOrder) downloadOrderPdf(pdfOrder);
      }
      closeAllDownloadMenus();
      return;
    }

    if (docBtn) {
      e.stopPropagation();
      var docVal = docBtn.dataset.downloadDoc;
      if (docVal === 'all') {
        downloadDocFile('orders-export', ordersTableHtml(currentOrders, 'Orders Report'));
      } else {
        var docOrder = window.BLEGAB_ADMIN_ORDERS.find(function (o) { return o.id === docVal; });
        if (docOrder) downloadDocFile('order-' + docOrder.id, orderDetailHtml(docOrder));
      }
      closeAllDownloadMenus();
      return;
    }

    if (row) {
      var orderId = row.dataset.orderId;
      var order = window.BLEGAB_ADMIN_ORDERS.find(function (o) { return o.id === orderId; });
      if (order) openOrderModal(order);
      return;
    }

    if (!toggleBtn && !e.target.closest('[data-download-menu]')) {
      closeAllDownloadMenus();
    }
  });

  var modalPdfBtn = document.querySelector('[data-modal-download-pdf]');
  var modalDocBtn = document.querySelector('[data-modal-download-doc]');

  if (modalPdfBtn) {
    modalPdfBtn.addEventListener('click', function () {
      if (currentModalOrder) downloadOrderPdf(currentModalOrder);
    });
  }
  if (modalDocBtn) {
    modalDocBtn.addEventListener('click', function () {
      if (currentModalOrder) downloadDocFile('order-' + currentModalOrder.id, orderDetailHtml(currentModalOrder));
    });
  }

  function openOrderModal(order) {
    currentModalOrder = order;
    var body = document.querySelector('[data-order-modal-body]');
    if (!body) return;

    var statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

    var productsHtml = order.items.map(function(item){

    return ''

    + '<div class="order-product-card">'

        + '<div class="order-product-card__image">'

            + '<img src="' + item.image + '" alt="' + item.name + '">'

        + '</div>'

        + '<div class="order-product-card__content">'

            + '<h4>' + item.name + '</h4>'

            + '<div><strong>SKU:</strong> ' + (item.sku || "—") + '</div>'

            + '<div><strong>Category:</strong> ' + (item.category || "—") + '</div>'

            + '<div><strong>Description:</strong> ' + (item.description || "—") + '</div>'

            + '<div><strong>Length:</strong> ' + (item.length || "—") + '</div>'

            + '<div><strong>Density:</strong> ' + (item.density || "—") + '</div>'

            + '<div><strong>Lace Type:</strong> ' + (item.laceType || "—") + '</div>'

            + '<div><strong>Quantity:</strong> ' + item.quantity + '</div>'

            + '<div><strong>Price:</strong> $' + item.price.toFixed(2) + '</div>'

        + '</div>'

    + '</div>';

}).join("");

    body.innerHTML = '' +
      '<div class="order-detail-section">' +
        '<h3 class="order-detail-section__title">Order Information</h3>' +
        '<div class="order-detail-grid">' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Order ID</span>' +
            '<span class="order-detail-item__value">#' + order.id + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
     '<span class="order-detail-item__label">Order Status</span>' +

     '<select class="order-status-select" data-order-status="' + order.id + '">' +

        '<option value="Pending"' +
        (order.status === "pending" ? " selected" : "") +
        '>Pending</option>' +

        '<option value="Processing"' +
        (order.status === "processing" ? " selected" : "") +
        '>Processing</option>' +

        '<option value="Shipped"' +
        (order.status === "shipped" ? " selected" : "") +
        '>Shipped</option>' +

        '<option value="Delivered"' +
        (order.status === "delivered" ? " selected" : "") +
        '>Delivered</option>' +

        '<option value="Cancelled"' +
        (order.status === "cancelled" ? " selected" : "") +
        '>Cancelled</option>' +

     '</select>' +

     '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Payment Date</span>' +
            '<span class="order-detail-item__value">' + order.paymentDate + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Payment Time</span>' +
            '<span class="order-detail-item__value">' + order.paymentTime + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Payment Method</span>' +
            '<span class="order-detail-item__value">' + order.paymentMethod + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Total</span>' +
            '<span class="order-detail-item__value" style="color:var(--color-gold);font-weight:700;">$' + order.total.toFixed(2) + '</span>' +
          '</div>' +
        '</div>' +
       '</div>' +


       '<div class="order-detail-section">' +

        '<h3 class="order-detail-section__title">Products</h3>' +

           productsHtml +

         '</div>' +

      //  '<div class="order-detail-section">' +
      //   '<h3 class="order-detail-section__title">Product Details</h3>' +
      //   '<div class="order-detail-grid">' +
      //     '<div class="order-detail-item order-detail-item--full">' +
      //       '<span class="order-detail-item__label">Product Name</span>' +
      //       '<span class="order-detail-item__value">' + order.productName + '</span>' +
      //     '</div>' +
      //     '<div class="order-detail-item order-detail-item--full">' +
      //       '<span class="order-detail-item__label">Description</span>' +
      //       '<span class="order-detail-item__value">' + order.productDescription + '</span>' +
      //     '</div>' +
      //     '<div class="order-detail-item">' +
      //       '<span class="order-detail-item__label">SKU Number</span>' +
      //       '<span class="order-detail-item__value" style="color:var(--color-gold);">' + order.productSku + '</span>' +
      //     '</div>' +
      //     '<div class="order-detail-item">' +
      //       '<span class="order-detail-item__label">Category</span>' +
      //       '<span class="order-detail-item__value">' + order.category + '</span>' +
      //     '</div>' +
      //     '<div class="order-detail-item">' +
      //       '<span class="order-detail-item__label">Quantity</span>' +
      //       '<span class="order-detail-item__value">' + order.quantity + '</span>' +
      //     '</div>' +
      //     '<div class="order-detail-item">' +
      //       '<span class="order-detail-item__label">Length</span>' +
      //       '<span class="order-detail-item__value">' + order.length + '</span>' +
      //     '</div>' +
      //     '<div class="order-detail-item">' +
      //       '<span class="order-detail-item__label">Density</span>' +
      //       '<span class="order-detail-item__value">' + order.density + '</span>' +
      //     '</div>' +
      //     '<div class="order-detail-item">' +
      //       '<span class="order-detail-item__label">Lace Type</span>' +
      //       '<span class="order-detail-item__value">' + order.laceType + '</span>' +
      //     '</div>' +
      //   '</div>' +
      // '</div>' +

      '<div class="order-detail-section">' +
        '<h3 class="order-detail-section__title">Customer Details</h3>' +
        '<div class="order-detail-grid">' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Full Name</span>' +
            '<span class="order-detail-item__value">' + order.customerName + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Email</span>' +
            '<span class="order-detail-item__value">' + order.customerEmail + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Phone</span>' +
            '<span class="order-detail-item__value">' + order.customerPhone + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Country</span>' +
            '<span class="order-detail-item__value">' + order.country + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Street Address</span>' +
            '<span class="order-detail-item__value">' + order.streetAddress + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">Apartment</span>' +
            '<span class="order-detail-item__value">' + (order.apartment || '\u2014') + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">City</span>' +
            '<span class="order-detail-item__value">' + order.city + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">State</span>' +
            '<span class="order-detail-item__value">' + order.state + '</span>' +
          '</div>' +
          '<div class="order-detail-item">' +
            '<span class="order-detail-item__label">ZIP Code</span>' +
            '<span class="order-detail-item__value">' + order.zipCode + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';

      var statusSelect = body.querySelector("[data-order-status]");

      if (statusSelect) {

      statusSelect.addEventListener("change", async function () {

        await updateOrderStatus(

            statusSelect.dataset.orderStatus,

            statusSelect.value

        );

       });

     }

    modal.classList.add('is-open');
    overlay.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/* -----------------------------
   Filter by status
   ----------------------------- */
function initOrdersFilter() {
  var wrap = document.querySelector('[data-orders-filter-custom]');
  var toggleBtn = document.querySelector('[data-orders-filter-toggle]');
  var menu = document.querySelector('[data-orders-filter-menu]');
  var label = document.querySelector('[data-orders-filter-label]');
  if (!wrap || !toggleBtn || !menu) return;

  toggleBtn.dataset.ordersFilterValue = 'all';

  toggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    wrap.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', wrap.classList.contains('is-open'));
  });

  menu.querySelectorAll('[data-value]').forEach(function (option) {
    option.addEventListener('click', function () {
      var value = option.dataset.value;
      toggleBtn.dataset.ordersFilterValue = value;
      label.textContent = option.textContent;

      menu.querySelectorAll('.admin-orders-filter__option').forEach(function (o) {
        o.classList.remove('is-selected');
      });
      option.classList.add('is-selected');

      selectedOrderIds.clear();
      ordCurrentPage = 1;
      applyOrdersFilter(value);

      wrap.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* -----------------------------
   Download menu helpers
   ----------------------------- */
function closeAllDownloadMenus() {
  document.querySelectorAll('.download-menu.is-open').forEach(function (m) {
    m.classList.remove('is-open');
  });
}

function orderDetailHtml(order) {

    var statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

    var labelStyle =
        'color:#888;font-size:11px;text-transform:uppercase;margin-bottom:2px;';

    var valueStyle =
        'font-size:13px;margin-bottom:10px;';

    function item(label, value) {

        return '<div style="' + labelStyle + '">' + label + '</div>' +
               '<div style="' + valueStyle + '">' + value + '</div>';

    }

    // Build all products
    var productsHtml = "";

    order.items.forEach(function(itemData, index){

        productsHtml +=
            '<h2 style="font-size:14px;margin-top:16px;">Product ' +
            (index + 1) +
            '</h2>' +

            item("Product Name", itemData.name) +
            item("Description", itemData.description || "—") +
            item("SKU", itemData.sku || "—") +
            item("Category", itemData.category || "—") +
            item("Quantity", itemData.quantity) +
            item("Price", "$" + itemData.price.toFixed(2)) +
            item("Length", itemData.length || "—") +
            item("Density", itemData.density || "—") +
            item("Lace Type", itemData.laceType || "—");

    });

    return '<div style="font-family:Arial,sans-serif;color:#111;">' +

        '<h1 style="font-size:18px;">Order #' + order.id + '</h1>' +

        item('Status', statusLabel) +
        item('Total', '$' + order.total.toFixed(2)) +
        item('Payment Date', order.paymentDate) +
        item('Payment Time', order.paymentTime) +
        item('Payment Method', order.paymentMethod) +

        productsHtml +

        '<h2 style="font-size:14px;margin-top:16px;">Customer</h2>' +

        item('Full Name', order.customerName) +
        item('Email', order.customerEmail) +
        item('Phone', order.customerPhone) +
        item(
            'Address',
            order.streetAddress +
            (order.apartment ? ', ' + order.apartment : '') +
            ', ' +
            order.city +
            ', ' +
            order.state +
            ' ' +
            order.zipCode
        ) +

    '</div>';

}

function ordersTableHtml(orders, title) {
  var pageBreak = '<br clear="all" style="page-break-before:always;">';

  var sections = orders.map(function (order, index) {
    return (index > 0 ? pageBreak : '') + orderDetailHtml(order);
  }).join('');

  return '<h1 style="font-family:Arial,sans-serif;font-size:20px;">' + title + '</h1>' + sections;
}

function downloadDocFile(filename, innerHtml) {
  var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><title>' + filename + '</title></head>' +
    '<body>' + innerHtml + '</body></html>';

  var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename + '.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadOrderPdf(order) {
  var doc = new window.jspdf.jsPDF();
  var statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
  var y = 20;

  doc.setFontSize(16);
  doc.text('Order #' + order.id, 14, y); y += 10;
  doc.setFontSize(11);

  [
    'Status: ' + statusLabel,
    'Total: $' + order.total.toFixed(2),
    'Payment Date: ' + order.paymentDate,
    'Payment Time: ' + order.paymentTime,
    'Payment Method: ' + order.paymentMethod,
    '',
    'Product: ' + order.productName,
    'SKU: ' + order.productSku,
    'Category: ' + order.category,
    'Quantity: ' + order.quantity,
    'Length: ' + order.length,
    'Density: ' + order.density,
    'Lace Type: ' + order.laceType,
    '',
    'Customer: ' + order.customerName,
    'Email: ' + order.customerEmail,
    'Phone: ' + order.customerPhone,
    'Address: ' + order.streetAddress + (order.apartment ? ', ' + order.apartment : '') + ', ' + order.city + ', ' + order.state + ' ' + order.zipCode
  ].forEach(function (line) {
    doc.text(line, 14, y);
    y += 8;
  });

  doc.save('order-' + order.id + '.pdf');
}

function downloadOrdersPdf(orders, filename, title) {

    var doc = new window.jspdf.jsPDF();

    orders.forEach(function(order, orderIndex){

        if(orderIndex > 0){

            doc.addPage();

        }

        var y = 20;

        var statusLabel =
            ORDER_STATUS_LABELS[order.status] || order.status;

        doc.setFontSize(16);

        doc.text("Order #" + order.id, 14, y);

        y += 10;

        doc.setFontSize(11);

        [
            "Status: " + statusLabel,
            "Total: $" + order.total.toFixed(2),
            "Payment Date: " + order.paymentDate,
            "Payment Time: " + order.paymentTime,
            "Payment Method: " + order.paymentMethod
        ].forEach(function(line){

            doc.text(line, 14, y);

            y += 8;

        });

        y += 5;

        order.items.forEach(function(item, index){

            if(y > 260){

                doc.addPage();

                y = 20;

            }

            doc.setFont(undefined, "bold");

            doc.text("Product " + (index + 1), 14, y);

            y += 8;

            doc.setFont(undefined, "normal");

            [

                "Name: " + item.name,

                "Description: " + (item.description || "—"),

                "SKU: " + (item.sku || "—"),

                "Category: " + (item.category || "—"),

                "Quantity: " + item.quantity,

                "Price: $" + item.price.toFixed(2),

                "Length: " + (item.length || "—"),

                "Density: " + (item.density || "—"),

                "Lace Type: " + (item.laceType || "—")

            ].forEach(function(line){

                if(y > 280){

                    doc.addPage();

                    y = 20;

                }

                doc.text(line, 14, y);

                y += 8;

            });

            y += 5;

        });

        if(y > 250){

            doc.addPage();

            y = 20;

        }

        doc.setFont(undefined, "bold");

        doc.text("Customer", 14, y);

        y += 8;

        doc.setFont(undefined, "normal");

        [

            "Full Name: " + order.customerName,

            "Email: " + order.customerEmail,

            "Phone: " + order.customerPhone,

            "Address: " +
            order.streetAddress +
            (order.apartment ? ", " + order.apartment : "") +
            ", " +
            order.city +
            ", " +
            order.state +
            " " +
            order.zipCode

        ].forEach(function(line){

            doc.text(line, 14, y);

            y += 8;

        });

    });

    doc.save(filename + ".pdf");

}

/* -----------------------------
   Backend-ready structure
   Replace window.BLEGAB_ADMIN_ORDERS with a fetch call:

   fetch('/api/admin/orders')
     .then(res => res.json())
     .then(data => {
       window.BLEGAB_ADMIN_ORDERS = data;
       renderOrders(data);
     });

   The rest of the code stays the same.
   ----------------------------- */