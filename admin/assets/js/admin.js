/* =========================================================
   ADMIN DASHBOARD JS
   Sidebar toggle, settings submenu, and rendering the
   overview page from window.BLEGAB_ADMIN_* (admin-data.js).
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initAdminSidebar();
  initSettingsSubmenu();
  renderStatCards();
  renderLowStock();
  renderRecentOrders();
  initAddProductShortcut();
  initNotifications();
  initThemeToggle();
  initViewStatsLinks();
});

/* -----------------------------
   Money formatting — "$1,600.00"
   ----------------------------- */
function formatAdminMoney(amount) {
  var fixed = Number(amount).toFixed(2);
  var parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + parts.join('.');
}

/* -----------------------------
   Sidebar (mobile drawer + desktop static)
   ----------------------------- */
function initAdminSidebar() {
  var sidebar = document.querySelector('[data-admin-sidebar]');
  var overlay = document.querySelector('[data-admin-sidebar-overlay]');
  var toggle = document.querySelector('[data-admin-menu-toggle]');
  if (!sidebar || !overlay || !toggle) return;

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    sidebar.style.transform = '';
    sidebar.classList.remove('is-dragging');
  }

  toggle.addEventListener('click', function () {
    sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) closeSidebar();
  });

  // ---- Swipe-to-close (touch devices only) — drawer opens from the
  // LEFT, so swipe LEFT to close it.
  var touchStartX = 0;
  var touchStartY = 0;
  var touchCurrentX = 0;
  var isDragging = false;
  var gestureDirection = null;
  var directionLockThreshold = 10;
  var swipeThreshold = 80;

  sidebar.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchCurrentX = touchStartX;
    isDragging = true;
    gestureDirection = null;
  }, { passive: true });

  sidebar.addEventListener('touchmove', function (event) {
    if (!isDragging) return;

    touchCurrentX = event.touches[0].clientX;
    var touchCurrentY = event.touches[0].clientY;
    var deltaX = touchCurrentX - touchStartX;
    var deltaY = touchCurrentY - touchStartY;

    if (gestureDirection === null) {
      if (Math.abs(deltaX) > directionLockThreshold || Math.abs(deltaY) > directionLockThreshold) {
        gestureDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
        if (gestureDirection === 'horizontal') {
          sidebar.classList.add('is-dragging');
        }
      }
    }

    if (gestureDirection !== 'horizontal') return;

    // Only allow dragging LEFT (toward closed)
    if (deltaX < 0) {
      sidebar.style.transform = 'translateX(' + deltaX + 'px)';
    }
  }, { passive: true });

  sidebar.addEventListener('touchend', function () {
    if (!isDragging) return;
    isDragging = false;

    if (gestureDirection === 'horizontal') {
      sidebar.classList.remove('is-dragging');
      sidebar.style.transform = '';

      var deltaX = touchCurrentX - touchStartX;
      if (deltaX < -swipeThreshold) {
        closeSidebar();
      }
    }

    gestureDirection = null;
  });
}

/* -----------------------------
   Settings submenu (accordion in sidebar)
   ----------------------------- */
function initSettingsSubmenu() {
  initAccordionToggle('[data-settings-toggle]', '[data-settings-submenu]');
  initAccordionToggle('[data-admin-auth-toggle]', '[data-admin-auth-submenu]');
}

function initAccordionToggle(toggleSelector, submenuSelector) {
  var toggle = document.querySelector(toggleSelector);
  var submenu = document.querySelector(submenuSelector);
  if (!toggle || !submenu) return;

  toggle.addEventListener('click', function () {
    var isOpen = submenu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* -----------------------------
   Stat cards — recalculated live from BLEGAB_ADMIN_RECENT_ORDERS
   for whatever date is picked in the calendar. Swap the order
   source for a real API response later; the math stays the same.
   ----------------------------- */
function renderStatCards() {
  var data = window.BLEGAB_ADMIN_OVERVIEW;
  if (!data) return;

var initialDate = data.defaultDate || formatLocalISODate(new Date());
  var input = document.querySelector('[data-date-picker-input]');
  if (input) {
    input.value = initialDate;
    input.addEventListener('change', function () {
      if (input.value) updateDateLabel(input.value);
    });
  }
  updateDateLabel(initialDate);

  setStat('sales-today', formatAdminMoney(rolloverPeriodIfExpired('today')));
  setStat('sales-week', formatAdminMoney(rolloverPeriodIfExpired('week')));
  setStat('sales-month', formatAdminMoney(rolloverPeriodIfExpired('month')));
  setStat('orders-total', data.stats.ordersTotal);
  setStat('orders-pending', data.stats.ordersPending);
}

// Local-timezone equivalent of toISOString().slice(0,10) — avoids the
// UTC date rollover mismatch near midnight.
function formatLocalISODate(date) {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// Parses "YYYY-MM-DD" as a LOCAL date, avoiding the off-by-one-day
// shift `new Date('YYYY-MM-DD')` causes in some timezones.
function parseISODate(isoString) {
  var parts = isoString.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function updateDateLabel(isoDateString) {
  var dateLabelEl = document.querySelector('[data-date-picker-label]');
  if (dateLabelEl) {
    dateLabelEl.textContent = parseISODate(isoDateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

function setStat(key, value) {
  var el = document.querySelector('[data-stat="' + key + '"]');
  if (el) el.textContent = value;
}

/* -----------------------------
   Stat period rollover — Today (24h), Week (7d), Month (real
   calendar length: 28/29/30/31 days depending which month the
   period started in). Each period's running total lives in
   localStorage as a stand-in "backend" until a real one exists.
   Once a period expires, its total is archived (see
   archiveStatToBackend) then reset to 0 and the clock restarts.

   Nothing currently increments these totals since there's no live
   checkout/order pipeline yet — once one exists, call:
     BLEGAB_ADMIN_STATS.addSale(amount)
   whenever a real sale completes, and today/week/month all update
   together automatically.
   ----------------------------- */
var STAT_PERIODS = {
  today: { key: 'blegab_admin_period_today', durationMs: function () { return 24 * 60 * 60 * 1000; } },
  week:  { key: 'blegab_admin_period_week',  durationMs: function () { return 7 * 24 * 60 * 60 * 1000; } },
  month: { key: 'blegab_admin_period_month', durationMs: function (start) { return daysInMonth(start) * 24 * 60 * 60 * 1000; } }
};

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function loadPeriod(periodKey) {
  var raw = localStorage.getItem(STAT_PERIODS[periodKey].key);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  var fresh = { start: new Date().toISOString(), value: 0 };
  localStorage.setItem(STAT_PERIODS[periodKey].key, JSON.stringify(fresh));
  return fresh;
}

function savePeriod(periodKey, period) {
  localStorage.setItem(STAT_PERIODS[periodKey].key, JSON.stringify(period));
}

// Stand-in for a real backend call, e.g.:
//   fetch('/api/admin/stats/archive', { method: 'POST', body: JSON.stringify({ period, total, periodStart, periodEnd }) })
// Meanwhile it's saved into localStorage so the Statistics page has
// something real to read, and nothing is lost before a backend exists.
function archiveStatToBackend(periodKey, total, periodStart, periodEnd) {
  var history = [];
  try { history = JSON.parse(localStorage.getItem('blegab_admin_stats_archive')) || []; } catch (e) {}
  history.push({ period: periodKey, total: total, start: periodStart, end: periodEnd });
  localStorage.setItem('blegab_admin_stats_archive', JSON.stringify(history));
}

function rolloverPeriodIfExpired(periodKey) {
  var conf = STAT_PERIODS[periodKey];
  var period = loadPeriod(periodKey);
  var startDate = new Date(period.start);
  var elapsed = Date.now() - startDate.getTime();

  if (elapsed >= conf.durationMs(startDate)) {
    archiveStatToBackend(periodKey, period.value, period.start, new Date().toISOString());
    period = { start: new Date().toISOString(), value: 0 };
    savePeriod(periodKey, period);
  }

  return period.value;
}

window.BLEGAB_ADMIN_STATS = {
  addSale: function (amount) {
    ['today', 'week', 'month'].forEach(function (key) {
      var period = loadPeriod(key);
      period.value += amount;
      savePeriod(key, period);
    });
    renderStatCards();
  }
};

/* -----------------------------
   Keep the 3 "View Stats" links pointed at whatever date is
   currently picked in the calendar
   ----------------------------- */
function initViewStatsLinks() {
  var links = document.querySelectorAll('[data-view-stats]');
  var input = document.querySelector('[data-date-picker-input]');
  if (!links.length) return;

  function updateLinks() {
    var date = (input && input.value) || (window.BLEGAB_ADMIN_OVERVIEW && window.BLEGAB_ADMIN_OVERVIEW.defaultDate) || '';
    links.forEach(function (link) {
      link.href = 'admin-statistics.html?period=' + link.dataset.viewStats + (date ? '&date=' + date : '');
    });
  }

  updateLinks();
  if (input) input.addEventListener('change', updateLinks);
}

/* -----------------------------
   Low stock list
   ----------------------------- */
function renderLowStock() {
  var list = document.querySelector('[data-low-stock-list]');
  var items = window.BLEGAB_ADMIN_LOW_STOCK;
  if (!list || !items) return;

  list.innerHTML = items.map(function (item) {
    return '' +
      '<li class="admin-stock-row">' +
        '<span class="admin-stock-row__dot" aria-hidden="true"></span>' +
        '<img src="' + item.image + '" alt="' + item.name + '" class="admin-stock-row__image" />' +
        '<div class="admin-stock-row__info">' +
          '<p class="admin-stock-row__name">' + item.name + '</p>' +
          '<p class="admin-stock-row__meta">' + item.meta + '</p>' +
        '</div>' +
        '<span class="admin-stock-row__left">' + item.left + ' left</span>' +
      '</li>';
  }).join('');
}

/* -----------------------------
   Recent orders table
   ----------------------------- */
var ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

function renderRecentOrders() {
  var body = document.querySelector('[data-recent-orders-list]');
  var orders = window.BLEGAB_ADMIN_RECENT_ORDERS;
  if (!body || !orders) return;

  body.innerHTML = orders.map(function (order) {
    var statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

    return '' +
      '<a href="admin-order-detail.html?id=' + order.id + '" class="admin-order-row" role="row">' +
        '<span class="admin-order-row__id-wrap" role="cell">' +
          '<span class="admin-order-row__icon">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
              '<path d="M6 8h12l-1.2 11H7.2z" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round"/>' +
            '</svg>' +
          '</span>' +
          '<span class="admin-order-row__id-text">' +
            '<span class="admin-order-row__id">#' + order.id + '</span>' +
            '<span class="admin-order-row__date">' + order.date + '</span>' +
          '</span>' +
        '</span>' +
        '<span class="admin-order-row__customer" role="cell">' + order.customer + '</span>' +
        '<span role="cell"><span class="admin-status admin-status--' + order.status + '">' + statusLabel + '</span></span>' +
        '<span class="admin-order-row__total" role="cell">' + formatAdminMoney(order.total) + '</span>' +
        '<svg class="admin-order-row__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
          '<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</a>';
  }).join('');
}

/* -----------------------------
   "Add Product" shortcut button
   ----------------------------- */
function initAddProductShortcut() {
  var btns = document.querySelectorAll('[data-open-add-product]');
  if (!btns.length) return;

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.location.href = 'admin-products.html?action=new';
    });
  });
}

/* -----------------------------
   Notifications dropdown
   ----------------------------- */

// Set to false later to retire the default greeting notification.
var SHOW_DEFAULT_GREETING = true;

var adminNotifications = (window.BLEGAB_ADMIN_NOTIFICATIONS || []).slice();

function getAdminGreeting() {
  var hour = new Date().getHours();
  if (hour < 12) return 'Good morning, Admin!';
  if (hour < 18) return 'Good afternoon, Admin!';
  return 'Good evening, Admin!';
}

function initNotifications() {
  var menu = document.querySelector('[data-notif-menu]');
  var toggle = document.querySelector('[data-notif-toggle]');
  var dropdown = document.querySelector('[data-notif-dropdown]');
  var overlay = document.querySelector('[data-notif-overlay]');
  var clearAllBtn = document.querySelector('[data-notif-clear-all]');
  if (!menu || !toggle || !dropdown) return;

  renderNotifications();

  function openDropdown() {
    dropdown.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.classList.add('is-visible');
  }

  function closeDropdown() {
    dropdown.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.classList.remove('is-visible');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdown.classList.contains('is-open') ? closeDropdown() : openDropdown();
  });

  // The overlay sits above everything else and swallows the click
  // entirely — so whatever's underneath (another button, a link,
  // etc.) never receives it. This one click ONLY closes the dropdown.
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      e.preventDefault();
      closeDropdown();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDropdown();
  });

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function () {
      adminNotifications = [];
      renderNotifications();
    });
  }

dropdown.addEventListener('click', function (e) {
    var closeBtn = e.target.closest('[data-notif-dismiss]');
    if (closeBtn) {
      e.stopPropagation(); // keep the dropdown open — only remove this one item
      adminNotifications = adminNotifications.filter(function (n) {
        return n.id !== closeBtn.dataset.notifDismiss;
      });
      renderNotifications();
      return;
    }

    var openTarget = e.target.closest('[data-notif-open]');
    if (openTarget) {
      openNotifModal(openTarget.dataset.notifOpen);
    }
  });

  initNotifModal();
  initNotifDropdownSwipe(dropdown, closeDropdown);

  // openNotifModal() closes the dropdown behind it directly, so make
  // sure the overlay comes down too in that case.
  document.addEventListener('click', function (e) {
    var openTarget = e.target.closest('[data-notif-open]');
    if (openTarget && overlay) overlay.classList.remove('is-visible');
  });
}

/* -----------------------------
   Swipe-to-close the notification dropdown — drag it left OR
   right past the threshold to dismiss it, snaps back otherwise.
   ----------------------------- */
function initNotifDropdownSwipe(dropdown, closeFn) {
  if (!dropdown) return;

  var touchStartX = 0;
  var touchStartY = 0;
  var touchCurrentX = 0;
  var isDragging = false;
  var gestureDirection = null;
  var directionLockThreshold = 10;
  var swipeThreshold = 80;

  dropdown.addEventListener('touchstart', function (event) {
    if (event.target.closest('button')) return;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchCurrentX = touchStartX;
    isDragging = true;
    gestureDirection = null;
  }, { passive: true });

  dropdown.addEventListener('touchmove', function (event) {
    if (!isDragging) return;

    touchCurrentX = event.touches[0].clientX;
    var touchCurrentY = event.touches[0].clientY;
    var deltaX = touchCurrentX - touchStartX;
    var deltaY = touchCurrentY - touchStartY;

    if (gestureDirection === null) {
      if (Math.abs(deltaX) > directionLockThreshold || Math.abs(deltaY) > directionLockThreshold) {
        gestureDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
        if (gestureDirection === 'horizontal') {
          dropdown.classList.add('is-dragging');
        }
      }
    }

    if (gestureDirection !== 'horizontal') return;

    dropdown.style.transform = 'translateX(' + deltaX + 'px)';
    dropdown.style.opacity = String(Math.max(1 - Math.abs(deltaX) / 200, 0.3));
  }, { passive: true });

  dropdown.addEventListener('touchend', function () {
    if (!isDragging) return;
    isDragging = false;

    if (gestureDirection === 'horizontal') {
      dropdown.classList.remove('is-dragging');

      var deltaX = touchCurrentX - touchStartX;
      if (Math.abs(deltaX) > swipeThreshold) {
        closeFn();
      }

      dropdown.style.transform = '';
      dropdown.style.opacity = '';
    }

    gestureDirection = null;
  });
}

/* -----------------------------
   Notification detail modal
   ----------------------------- */
function initNotifModal() {
  var overlay = document.querySelector('[data-notif-modal-overlay]');
  var modal = document.querySelector('[data-notif-modal]');
  var closeBtn = document.querySelector('[data-notif-modal-close]');
  if (!overlay || !modal) return;

  function close() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  overlay.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
}

function openNotifModal(id) {
  var overlay = document.querySelector('[data-notif-modal-overlay]');
  var modal = document.querySelector('[data-notif-modal]');
  if (!overlay || !modal) return;

  var all = adminNotifications.slice();
  if (SHOW_DEFAULT_GREETING) {
    all.unshift({
      id: 'greeting',
      title: getAdminGreeting(),
      message: "Here's what's happening with your store today.",
      time: 'Just now'
    });
  }

  var notif = all.find(function (n) { return n.id === id; });
  if (!notif) return;

  modal.querySelector('[data-notif-modal-title]').textContent = notif.title;
  modal.querySelector('[data-notif-modal-message]').textContent = notif.message;
  modal.querySelector('[data-notif-modal-time]').textContent = notif.time;

  // Close the dropdown behind it
  var dropdown = document.querySelector('[data-notif-dropdown]');
  var toggle = document.querySelector('[data-notif-toggle]');
  if (dropdown) dropdown.classList.remove('is-open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');

  modal.classList.add('is-open');
  overlay.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function renderNotifications() {
  var list = document.querySelector('[data-notif-list]');
  var emptyEl = document.querySelector('[data-notif-empty]');
  var countEl = document.querySelector('[data-notif-count]');
  if (!list) return;

  var items = adminNotifications.slice();
  if (SHOW_DEFAULT_GREETING) {
    items.unshift({
      id: 'greeting',
      title: getAdminGreeting(),
      message: "Here's what's happening with your store today.",
      time: 'Just now'
    });
  }

  if (items.length === 0) {
    list.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
  } else {
    if (emptyEl) emptyEl.hidden = true;
    list.innerHTML = items.map(function (n) {
 return '' +
        '<li class="admin-notif-item">' +
          '<div class="admin-notif-item__body" data-notif-open="' + n.id + '">' +
            '<p class="admin-notif-item__title">' + n.title + '</p>' +
            '<p class="admin-notif-item__message">' + n.message + '</p>' +
            '<span class="admin-notif-item__time">' + n.time + '</span>' +
          '</div>' +
          '<button type="button" class="admin-notif-item__close" data-notif-dismiss="' + n.id + '" aria-label="Dismiss notification">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
              '<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>' +
            '</svg>' +
          '</button>' +
        '</li>';
    }).join('');
  }

  if (countEl) {
    countEl.textContent = items.length;
    countEl.hidden = items.length === 0;
  }
}

/* -----------------------------
   Theme toggle (light/dark)
   ----------------------------- */
function initThemeToggle() {
  var body = document.querySelector('.admin-body');
  var toggle = document.querySelector('[data-theme-toggle]');
  var label = document.querySelector('[data-theme-toggle-label]');
  if (!body || !toggle) return;

  var saved = localStorage.getItem('blegab_admin_theme');
  if (saved === 'light') applyTheme(true);

  toggle.addEventListener('click', function () {
    var isLight = body.classList.toggle('theme-light');
    localStorage.setItem('blegab_admin_theme', isLight ? 'light' : 'dark');
    if (label) label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
  });

  function applyTheme(isLight) {
    body.classList.toggle('theme-light', isLight);
    if (label) label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
  }
}