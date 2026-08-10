// assets/js/admin-customers.js
/* =========================================================
   ADMIN CUSTOMERS PAGE JS
   Renders the customers list with an expandable detail modal.
   Mirrors admin-orders.js patterns (selection, filter,
   pagination, download menu). Each customer (and the whole
   list) can be downloaded as PDF, DOC, or CSV.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initCustomersPage();
  initCustomerModal();
  initCustomersFilter();
});

/* -----------------------------
   Customers data — swap for an API call later.
   The backend just needs to populate this array with the same
   shape (id, name, image, status, email, phone, country, state)
   and call renderCustomers(window.BLEGAB_ADMIN_CUSTOMERS).
   ----------------------------- */
window.BLEGAB_ADMIN_CUSTOMERS = [];

/* -----------------------------
   Status labels
   ----------------------------- */
var CUSTOMER_STATUS_LABELS = {
  online: 'Online',
  offline: 'Offline'
};

/* -----------------------------
   Country name -> short code
   ----------------------------- */
var CUSTOMER_COUNTRY_CODES = {
  'United States': 'USA',
  'Canada': 'CA',
  'United Kingdom': 'UK',
  'Nigeria': 'NG',
  'Ghana': 'GH',
  'South Africa': 'ZA',
  'Australia': 'AU'
};

function cusShortCountry(country) {
  return CUSTOMER_COUNTRY_CODES[country] || country;
}

/* -----------------------------
   Load customers from backend
   ----------------------------- */
async function fetchCustomers() {

  try {

    const response = await fetch(
      "http://localhost:5000/api/admin/customers",
      {
        method: "GET",
        credentials: "include"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load customers");
    }

    allCustomers = data.customers || [];

    renderCustomers(allCustomers);

  } catch (error) {

    console.error(error);

    renderCustomers([]);

  }

}

/* -----------------------------
   Render customers list
   ----------------------------- */
function initCustomersPage() {

  fetchCustomers();

}

window.addEventListener('resize', function () {
  cusCurrentPage = 1;
  renderCustomers(currentCustomers);
});

var allCustomers = [];
var currentCustomers = [];
var selectedCustomerIds = new Set();
var cusCurrentPage = 1;

function cusGetPageSize() {
  return window.matchMedia('(max-width: 1023.98px)').matches ? 5 : 10;
}

function renderCustomers(customers) {
  currentCustomers = customers || [];
  var list = document.querySelector('[data-customers-list]');
  if (!list) return;

  if (currentCustomers.length === 0) {
    list.innerHTML = '' +
      '<div class="admin-customers-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
          '<circle cx="9" cy="8" r="3.2"/>' +
          '<path d="M3.5 19c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" stroke-linecap="round"/>' +
        '</svg>' +
        '<p class="admin-customers-empty__title">No customers found</p>' +
        '<p class="admin-customers-empty__text">Registered customers will appear here.</p>' +
      '</div>';
    renderCustomersPagination(0, 0, cusGetPageSize());
    return;
  }

  var cusPageSize = cusGetPageSize();
  var cusTotalPages = Math.max(1, Math.ceil(currentCustomers.length / cusPageSize));
  if (cusCurrentPage > cusTotalPages) cusCurrentPage = cusTotalPages;
  if (cusCurrentPage < 1) cusCurrentPage = 1;
  var pageItems = currentCustomers.slice((cusCurrentPage - 1) * cusPageSize, cusCurrentPage * cusPageSize);

  list.innerHTML = pageItems.map(function (customer) {
    var statusLabel = CUSTOMER_STATUS_LABELS[customer.status] || customer.status;

    return '' +
      '<div class="customer-row" data-customer-id="' + customer.id + '">' +
        '<div class="customer-row__profile">' +
          '<button type="button" class="customer-row__check' + (selectedCustomerIds.has(customer.id) ? ' is-checked' : '') + '" data-row-check aria-label="Select customer">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
              '<path d="M5 12l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</button>' +
          '<img src="' + customer.image + '" alt="' + customer.name + '" class="customer-row__avatar" />' +
          '<div class="customer-row__info">' +
            '<span class="customer-row__name">' + customer.name + '</span>' +
            '<span class="customer-row__id">#' + customer.id + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="customer-row__status-wrap">' +
          '<span class="customer-status customer-status--' + customer.status + '">' + statusLabel + '</span>' +
        '</div>' +
        '<span class="customer-row__email">' + customer.email + '</span>' +
        '<span class="customer-row__phone">' + customer.phone + '</span>' +
        '<div class="customer-row__location">' +
          '<span class="customer-row__state">' + customer.state + '</span>' +
          '<span class="customer-row__country">' + cusShortCountry(customer.country) + '</span>' +
        '</div>' +
        '<div class="customer-row__actions">' +
          '<button type="button" class="customer-row__view" data-download-toggle aria-label="Customer actions">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<circle cx="12" cy="12" r="1.5"/>' +
              '<circle cx="12" cy="5" r="1.5"/>' +
              '<circle cx="12" cy="19" r="1.5"/>' +
            '</svg>' +
          '</button>' +
          '<div class="download-menu" data-download-menu>' +
            '<button type="button" class="download-menu__item" data-download-pdf="' + customer.id + '">Download as PDF</button>' +
            '<button type="button" class="download-menu__item" data-download-doc="' + customer.id + '">Download as DOC</button>' +
            '<button type="button" class="download-menu__item" data-download-csv="' + customer.id + '">Download as CSV</button>' +
            '<button type="button" class="download-menu__item download-menu__item--delete" data-delete-customer="' + customer.id + '">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }).join('');

  updateDeleteSelectedUI();
  renderCustomersPagination(cusTotalPages, currentCustomers.length, cusPageSize);
}

function renderCustomersPagination(totalPages, totalItems, pageSize) {
  var wrap = document.querySelector('[data-customers-pagination]');
  var summary = document.querySelector('[data-customers-pagination-summary]');
  var pages = document.querySelector('[data-customers-pagination-pages]');
  if (!wrap || !pages) return;

  if (totalItems === 0 || totalPages <= 1) {
    wrap.hidden = true;
    pages.innerHTML = '';
    return;
  }
  wrap.hidden = false;

  var start = (cusCurrentPage - 1) * pageSize + 1;
  var end = Math.min(cusCurrentPage * pageSize, totalItems);
  if (summary) summary.textContent = 'Showing ' + start + '\u2013' + end + ' of ' + totalItems + ' customers';

  var html = '<button type="button" class="cus-page-btn" data-cus-page="prev"' + (cusCurrentPage === 1 ? ' disabled' : '') + ' aria-label="Previous page">\u2039</button>';
  for (var i = 1; i <= totalPages; i++) {
    html += '<button type="button" class="cus-page-btn' + (i === cusCurrentPage ? ' is-active' : '') + '" data-cus-page="' + i + '">' + i + '</button>';
  }
  html += '<button type="button" class="cus-page-btn" data-cus-page="next"' + (cusCurrentPage === totalPages ? ' disabled' : '') + ' aria-label="Next page">\u203a</button>';
  pages.innerHTML = html;
}

function updateDeleteSelectedUI() {
  var btn = document.querySelector('[data-delete-selected]');
  if (btn) {
    var count = selectedCustomerIds.size;
    btn.hidden = count === 0;
    var countLabel = btn.querySelector('[data-delete-selected-count]');
    if (countLabel) countLabel.textContent = 'Delete Selected (' + count + ')';
  }

  var selectAllBtn = document.querySelector('[data-select-all-toggle]');
  if (selectAllBtn) {
    var allSelected = currentCustomers.length > 0 && currentCustomers.every(function (c) { return selectedCustomerIds.has(c.id); });
    selectAllBtn.classList.toggle('is-checked', allSelected);
  }
}

function toggleCustomerSelection(id) {
  if (selectedCustomerIds.has(id)) {
    selectedCustomerIds.delete(id);
  } else {
    selectedCustomerIds.add(id);
  }
  var rowCheck = document.querySelector('.customer-row[data-customer-id="' + id + '"] [data-row-check]');
  if (rowCheck) rowCheck.classList.toggle('is-checked', selectedCustomerIds.has(id));
  updateDeleteSelectedUI();
}

function setAllSelected(select) {
  selectedCustomerIds.clear();
  if (select) {
    currentCustomers.forEach(function (c) { selectedCustomerIds.add(c.id); });
  }
  document.querySelectorAll('[data-row-check]').forEach(function (el) {
    var id = el.closest('.customer-row').dataset.customerId;
    el.classList.toggle('is-checked', selectedCustomerIds.has(id));
  });
  updateDeleteSelectedUI();
}

function applyCustomersFilter(status) {
  if (!status || status === 'all') {
    renderCustomers(allCustomers);
  } else {
    renderCustomers(allCustomers.filter(function (c) { return c.status === status; }));
  }
}

async function deleteCustomerById(id) {

    try {

        const response = await fetch(
            `http://localhost:5000/api/admin/customers/${id}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete customer");
        }

        allCustomers = allCustomers.filter(function (c) {
            return c._id !== id;
        });

        selectedCustomerIds.delete(id);

        var toggleBtn = document.querySelector(
            "[data-customers-filter-toggle]"
        );

        applyCustomersFilter(
            toggleBtn
                ? toggleBtn.dataset.customersFilterValue
                : "all"
        );

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

function deleteSelectedCustomers() {
  if (selectedCustomerIds.size === 0) return;
  allCustomers = allCustomers.filter(function (c) {
    return !selectedCustomerIds.has(c.id);
});
  selectedCustomerIds.clear();
  var toggleBtn = document.querySelector('[data-customers-filter-toggle]');
  applyCustomersFilter(toggleBtn ? toggleBtn.dataset.customersFilterValue : 'all');
}

/* -----------------------------
   Customer detail modal
   ----------------------------- */
function initCustomerModal() {
  var overlay = document.querySelector('[data-customer-modal-overlay]');
  var modal = document.querySelector('[data-customer-modal]');
  var closeBtn = document.querySelector('[data-customer-modal-close]');

  if (!overlay || !modal) return;

  var currentModalCustomer = null;

  // Row click opens the modal; the dots button opens the download menu;
  // pagination buttons page.
  document.addEventListener('click', function (e) {
    var pageBtn = e.target.closest('[data-cus-page]');
    var toggleBtn = e.target.closest('[data-download-toggle]');
    var pdfBtn = e.target.closest('[data-download-pdf]');
    var docBtn = e.target.closest('[data-download-doc]');
    var csvBtn = e.target.closest('[data-download-csv]');
    var row = e.target.closest('.customer-row');

    var rowCheckBtn = e.target.closest('[data-row-check]');
    var selectAllBtn = e.target.closest('[data-select-all-toggle]');
    var deleteCustomerBtn = e.target.closest('[data-delete-customer]');
    var deleteSelectedBtn = e.target.closest('[data-delete-selected]');

    if (pageBtn) {
      e.stopPropagation();
      var val = pageBtn.dataset.cusPage;
      if (val === 'prev') cusCurrentPage--;
      else if (val === 'next') cusCurrentPage++;
      else cusCurrentPage = parseInt(val, 10);
      renderCustomers(currentCustomers);
      return;
    }

    if (rowCheckBtn) {
      e.stopPropagation();
      var checkRow = rowCheckBtn.closest('.customer-row');
      if (checkRow) toggleCustomerSelection(checkRow.dataset.customerId);
      return;
    }

    if (selectAllBtn) {
      e.stopPropagation();
      var allCurrentlySelected = currentCustomers.length > 0 && currentCustomers.every(function (c) { return selectedCustomerIds.has(c.id); });
      setAllSelected(!allCurrentlySelected);
      return;
    }

    if (deleteCustomerBtn) {
      e.stopPropagation();
      var delId = deleteCustomerBtn.dataset.deleteCustomer;
      if (confirm('Delete this customer? This cannot be undone.')) {
        deleteCustomerById(delId);
      }
      closeAllDownloadMenus();
      return;
    }

    if (deleteSelectedBtn) {
      e.stopPropagation();
      if (confirm('Delete ' + selectedCustomerIds.size + ' selected customer(s)? This cannot be undone.')) {
        deleteSelectedCustomers();
      }
      return;
    }

    if (toggleBtn) {
      e.stopPropagation();
      var menu = toggleBtn.nextElementSibling;
      var isOpen = menu.classList.contains('is-open');
      closeAllDownloadMenus();
      if (!isOpen) {
        positionFloatingMenu(toggleBtn, menu);
        menu.classList.add('is-open');
      }
      return;
    }

    if (pdfBtn) {
      e.stopPropagation();
      var pdfVal = pdfBtn.dataset.downloadPdf;
      if (pdfVal === 'all') {
        downloadCustomersPdf(currentCustomers, 'customers-export', 'Customers Report');
      } else {
        var pdfCustomer = allCustomers.find(function (c) {
        return c.id === pdfVal;
        });
        if (pdfCustomer) downloadCustomerPdf(pdfCustomer);
      }
      closeAllDownloadMenus();
      return;
    }

    if (docBtn) {
      e.stopPropagation();
      var docVal = docBtn.dataset.downloadDoc;
      if (docVal === 'all') {
        downloadDocFile('customers-export', customersTableHtml(currentCustomers, 'Customers Report'));
      } else {
        var docCustomer = allCustomers.find(function (c) {
        return c.id === docVal;
       });
        if (docCustomer) downloadDocFile('customer-' + docCustomer.id, customerDetailHtml(docCustomer));
      }
      closeAllDownloadMenus();
      return;
    }

    if (csvBtn) {
      e.stopPropagation();
      var csvVal = csvBtn.dataset.downloadCsv;
      if (csvVal === 'all') {
        downloadCustomersCsv(currentCustomers, 'customers-export');
      } else {
        var csvCustomer = allCustomers.find(function (c) {
         return c.id === csvVal;
        });
        if (csvCustomer) downloadCustomerCsv(csvCustomer);
      }
      closeAllDownloadMenus();
      return;
    }

    if (row) {
      var customerId = row.dataset.customerId;
      var customer = allCustomers.find(function (c) {
      return c.id === customerId;
      });
      if (customer) openCustomerModal(customer);
      return;
    }

    if (!toggleBtn && !e.target.closest('[data-download-menu]')) {
      closeAllDownloadMenus();
    }
  });

  var modalPdfBtn = document.querySelector('[data-modal-download-pdf]');
  var modalDocBtn = document.querySelector('[data-modal-download-doc]');
  var modalCsvBtn = document.querySelector('[data-modal-download-csv]');

  if (modalPdfBtn) {
    modalPdfBtn.addEventListener('click', function () {
      if (currentModalCustomer) downloadCustomerPdf(currentModalCustomer);
    });
  }
  if (modalDocBtn) {
    modalDocBtn.addEventListener('click', function () {
      if (currentModalCustomer) downloadDocFile('customer-' + currentModalCustomer.id, customerDetailHtml(currentModalCustomer));
    });
  }
  if (modalCsvBtn) {
    modalCsvBtn.addEventListener('click', function () {
      if (currentModalCustomer) downloadCustomerCsv(currentModalCustomer);
    });
  }

  function openCustomerModal(customer) {
    currentModalCustomer = customer;
    var body = document.querySelector('[data-customer-modal-body]');
    if (!body) return;

    var statusLabel = CUSTOMER_STATUS_LABELS[customer.status] || customer.status;

    body.innerHTML = '' +
      '<div class="customer-detail-section">' +
        '<h3 class="customer-detail-section__title">Account</h3>' +
        '<div class="customer-detail-grid">' +
          '<div class="customer-detail-item">' +
            '<span class="customer-detail-item__label">Customer ID</span>' +
            '<span class="customer-detail-item__value">#' + customer.id + '</span>' +
          '</div>' +
          '<div class="customer-detail-item">' +
            '<span class="customer-detail-item__label">Status</span>' +
            '<span class="customer-status customer-status--' + customer.status + '">' + statusLabel + '</span>' +
          '</div>' +
          '<div class="customer-detail-item customer-detail-item--full">' +
            '<span class="customer-detail-item__label">Full Name</span>' +
            '<span class="customer-detail-item__value">' + customer.name + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="customer-detail-section">' +
        '<h3 class="customer-detail-section__title">Contact Details</h3>' +
        '<div class="customer-detail-grid">' +
          '<div class="customer-detail-item">' +
            '<span class="customer-detail-item__label">Email</span>' +
            '<span class="customer-detail-item__value">' + customer.email + '</span>' +
          '</div>' +
          '<div class="customer-detail-item">' +
            '<span class="customer-detail-item__label">Phone</span>' +
            '<span class="customer-detail-item__value">' + customer.phone + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="customer-detail-section">' +
        '<h3 class="customer-detail-section__title">Location</h3>' +
        '<div class="customer-detail-grid">' +
          '<div class="customer-detail-item">' +
            '<span class="customer-detail-item__label">State</span>' +
            '<span class="customer-detail-item__value">' + customer.state + '</span>' +
          '</div>' +
          '<div class="customer-detail-item">' +
            '<span class="customer-detail-item__label">Country</span>' +
            '<span class="customer-detail-item__value">' + customer.country + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';

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
function initCustomersFilter() {
  var wrap = document.querySelector('[data-customers-filter-custom]');
  var toggleBtn = document.querySelector('[data-customers-filter-toggle]');
  var menu = document.querySelector('[data-customers-filter-menu]');
  var label = document.querySelector('[data-customers-filter-label]');
  if (!wrap || !toggleBtn || !menu) return;

  toggleBtn.dataset.customersFilterValue = 'all';

  toggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    wrap.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', wrap.classList.contains('is-open'));
  });

  menu.querySelectorAll('[data-value]').forEach(function (option) {
    option.addEventListener('click', function () {
      var value = option.dataset.value;
      toggleBtn.dataset.customersFilterValue = value;
      label.textContent = option.textContent;

      menu.querySelectorAll('.admin-customers-filter__option').forEach(function (o) {
        o.classList.remove('is-selected');
      });
      option.classList.add('is-selected');

      selectedCustomerIds.clear();
      cusCurrentPage = 1;
      applyCustomersFilter(value);

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

// Positions a fixed-position dropdown against its trigger button so it
// always renders on top, in the viewport, and is never clipped by the
// table's overflow.
function positionFloatingMenu(anchorBtn, menu) {
  var rect = anchorBtn.getBoundingClientRect();
  var margin = 8;
  var viewportWidth = window.innerWidth;

  // Default: right edge of menu aligned to right edge of button.
  var left = rect.right - menu.offsetWidth + 40;

  // Clamp so it never spills past the right edge of the screen...
  if (left + menu.offsetWidth > viewportWidth - margin) {
    left = viewportWidth - menu.offsetWidth - margin;
  }
  // ...or off the left edge either.
  if (left < margin) {
    left = margin;
  }

  menu.style.top = rect.bottom + 6 + 'px';
  menu.style.left = left + 'px';
}

function customerDetailHtml(customer) {
  var statusLabel = CUSTOMER_STATUS_LABELS[customer.status] || customer.status;
  var labelStyle = 'color:#888;font-size:11px;text-transform:uppercase;margin-bottom:2px;';
  var valueStyle = 'font-size:13px;margin-bottom:10px;';

  function item(label, value) {
    return '<div style="' + labelStyle + '">' + label + '</div>' +
           '<div style="' + valueStyle + '">' + value + '</div>';
  }

  return '<div style="font-family:Arial,sans-serif;color:#111;">' +
    '<h1 style="font-size:18px;">Customer #' + customer.id + '</h1>' +
    item('Full Name', customer.name) +
    item('Status', statusLabel) +
    item('Email', customer.email) +
    item('Phone', customer.phone) +
    item('State', customer.state) +
    item('Country', customer.country) +
  '</div>';
}

function customersTableHtml(customers, title) {
  var pageBreak = '<br clear="all" style="page-break-before:always;">';

  var sections = customers.map(function (customer, index) {
    return (index > 0 ? pageBreak : '') + customerDetailHtml(customer);
  }).join('');

  return '<h1 style="font-family:Arial,sans-serif;font-size:20px;">' + title + '</h1>' + sections;
}

function downloadDocFile(filename, innerHtml) {
  var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><title>' + filename + '</title></head>' +
    '<body>' + innerHtml + '</body></html>';

  var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  triggerBlobDownload(blob, filename + '.doc');
}

/* -----------------------------
   PDF builders
   ----------------------------- */
function customerPdfLines(customer) {
  var statusLabel = CUSTOMER_STATUS_LABELS[customer.status] || customer.status;
  return [
    'Full Name: ' + customer.name,
    'Status: ' + statusLabel,
    'Email: ' + customer.email,
    'Phone: ' + customer.phone,
    'State: ' + customer.state,
    'Country: ' + customer.country
  ];
}

function buildCustomerPdfDoc(customer) {
  var doc = new window.jspdf.jsPDF();
  var y = 20;
  doc.setFontSize(16);
  doc.text('Customer #' + customer.id, 14, y); y += 10;
  doc.setFontSize(11);
  customerPdfLines(customer).forEach(function (line) {
    doc.text(line, 14, y);
    y += 8;
  });
  return doc;
}

function buildCustomersPdfDoc(customers, title) {
  var doc = new window.jspdf.jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  customers.forEach(function (customer, index) {
    if (index > 0) doc.addPage();
    var y = 20;
    doc.setFontSize(14);
    doc.text('Customer #' + customer.id, 14, y); y += 10;
    doc.setFontSize(11);
    customerPdfLines(customer).forEach(function (line) {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 8;
    });
  });
  return doc;
}

function downloadCustomerPdf(customer) {
  buildCustomerPdfDoc(customer).save('customer-' + customer.id + '.pdf');
}

function downloadCustomersPdf(customers, filename, title) {
  buildCustomersPdfDoc(customers, title).save(filename + '.pdf');
}

/* -----------------------------
   CSV builders
   ----------------------------- */
function csvEscape(value) {
  value = String(value === null || value === undefined ? '' : value);
  if (/[",\n]/.test(value)) {
    value = '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function customerToCsvRow(customer) {
  var statusLabel = CUSTOMER_STATUS_LABELS[customer.status] || customer.status;
  return [customer.id, customer.name, statusLabel, customer.email, customer.phone, customer.state, customer.country]
    .map(csvEscape)
    .join(',');
}

function customersToCsv(customers) {
  var header = ['Customer ID', 'Name', 'Status', 'Email', 'Phone', 'State', 'Country'].join(',');
  var rows = customers.map(customerToCsvRow);
  return [header].concat(rows).join('\r\n');
}

function downloadCustomerCsv(customer) {
  var csv = customersToCsv([customer]);
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, 'customer-' + customer.id + '.csv');
}

function downloadCustomersCsv(customers, filename) {
  var csv = customersToCsv(customers);
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, filename + '.csv');
}

/* -----------------------------
   Blob download helper
   ----------------------------- */
function triggerBlobDownload(blob, filename) {
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* -----------------------------
   Backend-ready structure
   Replace window.BLEGAB_ADMIN_CUSTOMERS with a fetch call:

   fetch('/api/admin/customers')
     .then(res => res.json())
     .then(data => {
       window.BLEGAB_ADMIN_CUSTOMERS = data;
       renderCustomers(data);
     });

   The rest of the code stays the same.
   ----------------------------- */