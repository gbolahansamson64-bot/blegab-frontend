/* =========================================================
   ADMIN DASHBOARD JS
   Sidebar toggle, settings submenu, and rendering the
   overview page from window.BLEGAB_ADMIN_* (admin-data.js).
   ========================================================= */

   async function checkAdminAuth() {

    try {

        const res = await fetch("http://localhost:5000/api/admin/me", {
            credentials: "include"
        });

        return res.ok;

    } catch (err) {

        return false;

    }

}

async function loadDashboard() {

    try {

        const res = await fetch("http://localhost:5000/api/admin/dashboard", {
            credentials: "include"
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        renderStatCards(data.overview);

        renderLowStock(data.lowStockProducts);

        renderRecentOrders(data.recentOrders);

    } catch (err) {

        console.log(err);

    }

}

document.addEventListener("DOMContentLoaded", async () => {

    const loggedIn = await checkAdminAuth();

    if (!loggedIn) {
        window.location.href = "admin-login.html";
        return;
    }

    initAdminSidebar();

    initSettingsSubmenu();

    initAddProductShortcut();

    await initNotifications();

    initThemeToggle();

    initViewStatsLinks();

    await loadDashboard();

    await renderAdminAuthState();

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
function renderStatCards(data) {

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

  setStat(
  "sales-today",
  formatAdminMoney(data.stats.salesToday)
);

setStat(
  "sales-week",
  formatAdminMoney(data.stats.salesWeek)
);

setStat(
  "sales-month",
  formatAdminMoney(data.stats.salesMonth)
);

setStat(
  "orders-total",
  data.stats.ordersTotal
);

setStat(
  "orders-pending",
  data.stats.ordersPending
);
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

/* -----------------------------
   Keep the 3 "View Stats" links pointed at whatever date is
   currently picked in the calendar
   ----------------------------- */
function initViewStatsLinks() {
  var links = document.querySelectorAll('[data-view-stats]');
  var input = document.querySelector('[data-date-picker-input]');
  if (!links.length) return;

  function updateLinks() {
    var date = input?.value || "";
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
function renderLowStock(items) {

    var list = document.querySelector("[data-low-stock-list]");

    if (!list) return;

    items = items || [];

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

function renderRecentOrders(orders) {

    var body = document.querySelector("[data-recent-orders-list]");

    if (!body) return;

    orders = orders || [];

  body.innerHTML = orders.map(function (order) {
    var statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

    return '' +
      '<div class="admin-order-row order-row" data-order-id="' + order.id + '" role="row">' +
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
      '</div>';
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
/* -----------------------------
   Notifications
   ----------------------------- */

var SHOW_DEFAULT_GREETING = false;
var adminNotifications = [];


/* -----------------------------
   Greeting
   ----------------------------- */

function getAdminGreeting() {
  var hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning, Admin!';
  }

  if (hour < 18) {
    return 'Good afternoon, Admin!';
  }

  return 'Good evening, Admin!';
}


/* -----------------------------
   Load notifications
   ----------------------------- */

async function loadAdminNotifications() {

  try {

    const res = await fetch(
      "http://localhost:5000/api/admin/notifications",
      {
        method: "GET",
        credentials: "include"
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load notifications");
    }

    const data = await res.json();

    if (
      data.success &&
      Array.isArray(data.notifications)
    ) {

      adminNotifications = data.notifications;

    } else {

      adminNotifications = [];

    }

    renderNotifications();

    await loadUnreadNotificationCount();

  } catch (error) {

    console.error(
      "LOAD ADMIN NOTIFICATIONS ERROR:",
      error
    );

    adminNotifications = [];

    renderNotifications();

  }

}


/* -----------------------------
   Load unread count
   ----------------------------- */

async function loadUnreadNotificationCount() {

  try {

    const res = await fetch(
      "http://localhost:5000/api/admin/notifications/unread-count",
      {
        method: "GET",
        credentials: "include"
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load unread count");
    }

    const data = await res.json();

    const countEl =
      document.querySelector("[data-notif-count]");

    if (!countEl) return;

    const count =
      Number(data.count) || 0;

    countEl.textContent = count;

    countEl.hidden = count === 0;

  } catch (error) {

    console.error(
      "LOAD UNREAD NOTIFICATION COUNT ERROR:",
      error
    );

  }

}


/* -----------------------------
   Initialize notifications
   ----------------------------- */

async function initNotifications() {

  const menu =
    document.querySelector("[data-notif-menu]");

  const toggle =
    document.querySelector("[data-notif-toggle]");

  const dropdown =
    document.querySelector("[data-notif-dropdown]");

  const overlay =
    document.querySelector("[data-notif-overlay]");

  const clearAllBtn =
    document.querySelector("[data-notif-clear-all]");


  if (!menu || !toggle || !dropdown) {
    return;
  }


  /* Load notifications */

  await loadAdminNotifications();


  /* -----------------------------
     Open dropdown
     ----------------------------- */

  function openDropdown() {

    dropdown.classList.add("is-open");

    toggle.setAttribute(
      "aria-expanded",
      "true"
    );

    if (overlay) {
      overlay.classList.add("is-visible");
    }

  }


  /* -----------------------------
     Close dropdown
     ----------------------------- */

  function closeDropdown() {

    dropdown.classList.remove("is-open");

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

    if (overlay) {
      overlay.classList.remove("is-visible");
    }

  }


  /* -----------------------------
     Notification bell
     ----------------------------- */

  toggle.addEventListener(
    "click",
    function (e) {

      e.stopPropagation();

      if (
        dropdown.classList.contains("is-open")
      ) {

        closeDropdown();

      } else {

        openDropdown();

      }

    }
  );


  /* -----------------------------
     Overlay
     ----------------------------- */

  if (overlay) {

    overlay.addEventListener(
      "click",
      function (e) {

        e.preventDefault();

        closeDropdown();

      }
    );

  }


  /* -----------------------------
     Escape
     ----------------------------- */

  document.addEventListener(
    "keydown",
    function (e) {

      if (e.key === "Escape") {

        closeDropdown();

      }

    }
  );


  /* -----------------------------
     Clear all
     ----------------------------- */

  if (clearAllBtn) {

    clearAllBtn.addEventListener(
      "click",
      async function () {

        try {

          const res = await fetch(
            "http://localhost:5000/api/admin/notifications",
            {
              method: "DELETE",
              credentials: "include"
            }
          );

          if (!res.ok) {
            throw new Error(
              "Failed to clear notifications"
            );
          }

          adminNotifications = [];

          renderNotifications();

          await loadUnreadNotificationCount();

        } catch (error) {

          console.error(
            "CLEAR NOTIFICATIONS ERROR:",
            error
          );

          alert(
            "Unable to clear notifications."
          );

        }

      }
    );

  }


  /* -----------------------------
     Notification item clicks
     ----------------------------- */

  dropdown.addEventListener(
    "click",
    async function (e) {


      /* -----------------------------
         Dismiss notification
         ----------------------------- */

      const closeBtn =
        e.target.closest(
          "[data-notif-dismiss]"
        );


      if (closeBtn) {

        e.stopPropagation();

        const notificationId =
          closeBtn.dataset.notifDismiss;


        /* Greeting is frontend-only */

        if (notificationId === "greeting") {

          adminNotifications =
            adminNotifications.filter(
              function (notification) {

                return notification.id !== "greeting";

              }
            );

          renderNotifications();

          return;

        }


        await dismissAdminNotification(
          notificationId
        );

        return;

      }


      /* -----------------------------
         Open notification
         ----------------------------- */

      const openTarget =
        e.target.closest(
          "[data-notif-open]"
        );


      if (openTarget) {

        const notificationId =
          openTarget.dataset.notifOpen;


        await markNotificationAsRead(
          notificationId
        );


        openNotifModal(
          notificationId
        );

      }

    }
  );


  /* -----------------------------
     Notification modal
     ----------------------------- */

  initNotifModal();


  /* -----------------------------
     Mobile swipe
     ----------------------------- */

  initNotifDropdownSwipe(
    dropdown,
    closeDropdown
  );


  /* -----------------------------
     Remove dropdown overlay
     when modal opens
     ----------------------------- */

  document.addEventListener(
    "click",
    function (e) {

      const openTarget =
        e.target.closest(
          "[data-notif-open]"
        );

      if (
        openTarget &&
        overlay
      ) {

        overlay.classList.remove(
          "is-visible"
        );

      }

    }
  );

}


/* -----------------------------
   Mark notification as read
   ----------------------------- */

async function markNotificationAsRead(id) {

  if (id === "greeting") {
    return;
  }


  try {

    const res = await fetch(
      "http://localhost:5000/api/admin/notifications/" +
      id +
      "/read",
      {
        method: "PATCH",
        credentials: "include"
      }
    );


    if (!res.ok) {

      throw new Error(
        "Failed to mark notification as read"
      );

    }


    /* Update local state */

    const notification =
      adminNotifications.find(
        function (notification) {

          return notification.id === id;

        }
      );


    if (notification) {

      notification.read = true;

    }


    renderNotifications();

    await loadUnreadNotificationCount();


  } catch (error) {

    console.error(
      "MARK NOTIFICATION READ ERROR:",
      error
    );

  }

}


/* -----------------------------
   Dismiss notification
   ----------------------------- */

async function dismissAdminNotification(id) {

  try {

    const res = await fetch(
      "http://localhost:5000/api/admin/notifications/" +
      id,
      {
        method: "DELETE",
        credentials: "include"
      }
    );


    if (!res.ok) {

      throw new Error(
        "Failed to dismiss notification"
      );

    }


    adminNotifications =
      adminNotifications.filter(
        function (notification) {

          return notification.id !== id;

        }
      );


    renderNotifications();

    await loadUnreadNotificationCount();


  } catch (error) {

    console.error(
      "DISMISS ADMIN NOTIFICATION ERROR:",
      error
    );

  }

}


/* -----------------------------
   Swipe-to-close
   ----------------------------- */

function initNotifDropdownSwipe(
  dropdown,
  closeFn
) {

  if (!dropdown) return;


  var touchStartX = 0;
  var touchStartY = 0;
  var touchCurrentX = 0;

  var isDragging = false;
  var gestureDirection = null;

  var directionLockThreshold = 10;
  var swipeThreshold = 80;


  dropdown.addEventListener(
    "touchstart",
    function (event) {

      if (
        event.target.closest("button")
      ) {
        return;
      }


      touchStartX =
        event.touches[0].clientX;

      touchStartY =
        event.touches[0].clientY;

      touchCurrentX =
        touchStartX;

      isDragging = true;

      gestureDirection = null;

    },
    {
      passive: true
    }
  );


  dropdown.addEventListener(
    "touchmove",
    function (event) {

      if (!isDragging) return;


      touchCurrentX =
        event.touches[0].clientX;

      var touchCurrentY =
        event.touches[0].clientY;


      var deltaX =
        touchCurrentX -
        touchStartX;

      var deltaY =
        touchCurrentY -
        touchStartY;


      if (
        gestureDirection === null
      ) {

        if (
          Math.abs(deltaX) >
            directionLockThreshold ||
          Math.abs(deltaY) >
            directionLockThreshold
        ) {

          gestureDirection =
            Math.abs(deltaX) >
            Math.abs(deltaY)
              ? "horizontal"
              : "vertical";


          if (
            gestureDirection ===
            "horizontal"
          ) {

            dropdown.classList.add(
              "is-dragging"
            );

          }

        }

      }


      if (
        gestureDirection !==
        "horizontal"
      ) {
        return;
      }


      dropdown.style.transform =
        "translateX(" +
        deltaX +
        "px)";


      dropdown.style.opacity =
        String(
          Math.max(
            1 -
              Math.abs(deltaX) /
                200,
            0.3
          )
        );

    },
    {
      passive: true
    }
  );


  dropdown.addEventListener(
    "touchend",
    function () {

      if (!isDragging) return;

      isDragging = false;


      if (
        gestureDirection ===
        "horizontal"
      ) {

        dropdown.classList.remove(
          "is-dragging"
        );


        var deltaX =
          touchCurrentX -
          touchStartX;


        if (
          Math.abs(deltaX) >
          swipeThreshold
        ) {

          closeFn();

        }


        dropdown.style.transform = "";

        dropdown.style.opacity = "";

      }


      gestureDirection = null;

    }
  );

}


/* -----------------------------
   Notification modal
   ----------------------------- */

function initNotifModal() {

  var overlay =
    document.querySelector(
      "[data-notif-modal-overlay]"
    );

  var modal =
    document.querySelector(
      "[data-notif-modal]"
    );

  var closeBtn =
    document.querySelector(
      "[data-notif-modal-close]"
    );


  if (!overlay || !modal) {
    return;
  }


  function close() {

    modal.classList.remove(
      "is-open"
    );

    overlay.classList.remove(
      "is-open"
    );

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  overlay.addEventListener(
    "click",
    close
  );


  if (closeBtn) {

    closeBtn.addEventListener(
      "click",
      close
    );

  }


  document.addEventListener(
    "keydown",
    function (e) {

      if (e.key === "Escape") {
        close();
      }

    }
  );

}


/* -----------------------------
   Open notification modal
   ----------------------------- */

function openNotifModal(id) {

  var overlay =
    document.querySelector(
      "[data-notif-modal-overlay]"
    );

  var modal =
    document.querySelector(
      "[data-notif-modal]"
    );


  if (!overlay || !modal) {
    return;
  }


  var all =
    adminNotifications.slice();


  if (SHOW_DEFAULT_GREETING) {

    all.unshift({

      id: "greeting",

      title: getAdminGreeting(),

      message:
        "Here's what's happening with your store today.",

      time: "Just now",

      read: true

    });

  }


  var notif =
    all.find(
      function (notification) {

        return notification.id === id;

      }
    );


  if (!notif) {
    return;
  }


  modal.querySelector(
    "[data-notif-modal-title]"
  ).textContent =
    notif.title || "";


  modal.querySelector(
    "[data-notif-modal-message]"
  ).textContent =
    notif.message || "";


  modal.querySelector(
    "[data-notif-modal-time]"
  ).textContent =
    notif.time || "";


  var dropdown =
    document.querySelector(
      "[data-notif-dropdown]"
    );

  var toggle =
    document.querySelector(
      "[data-notif-toggle]"
    );


  if (dropdown) {
    dropdown.classList.remove(
      "is-open"
    );
  }


  if (toggle) {

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

  }


  modal.classList.add(
    "is-open"
  );

  overlay.classList.add(
    "is-open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


/* -----------------------------
   Render notifications
   ----------------------------- */

function renderNotifications() {

  var list =
    document.querySelector(
      "[data-notif-list]"
    );

  var emptyEl =
    document.querySelector(
      "[data-notif-empty]"
    );


  if (!list) {
    return;
  }


  var items =
    adminNotifications.slice();


  if (SHOW_DEFAULT_GREETING) {

    items.unshift({

      id: "greeting",

      title: getAdminGreeting(),

      message:
        "Here's what's happening with your store today.",

      time: "Just now",

      read: true

    });

  }


  /* Empty state */

  if (items.length === 0) {

    list.innerHTML = "";

    if (emptyEl) {
      emptyEl.hidden = false;
    }

  } else {

    if (emptyEl) {
      emptyEl.hidden = true;
    }


    list.innerHTML =
      items.map(
        function (n) {

          return (
            '<li class="admin-notif-item' +
            (n.read
              ? " is-read"
              : " is-unread") +
            '">' +

              '<div ' +
                'class="admin-notif-item__body" ' +
                'data-notif-open="' +
                n.id +
                '">' +

                '<p class="admin-notif-item__title">' +
                  escapeNotificationHTML(
                    n.title
                  ) +
                '</p>' +

                '<p class="admin-notif-item__message">' +
                  escapeNotificationHTML(
                    n.message
                  ) +
                '</p>' +

                '<span class="admin-notif-item__time">' +
                  escapeNotificationHTML(
                    n.time
                  ) +
                '</span>' +

              '</div>' +

              '<button ' +
                'type="button" ' +
                'class="admin-notif-item__close" ' +
                'data-notif-dismiss="' +
                n.id +
                '" ' +
                'aria-label="Dismiss notification">' +

                '<svg viewBox="0 0 24 24" ' +
                  'fill="none" ' +
                  'stroke="currentColor" ' +
                  'stroke-width="2" ' +
                  'aria-hidden="true">' +

                  '<path ' +
                    'd="M6 6l12 12M18 6L6 18" ' +
                    'stroke-linecap="round"/>' +

                '</svg>' +

              '</button>' +

            '</li>'
          );

        }
      ).join("");

  }

}


/* -----------------------------
   Escape notification HTML
   ----------------------------- */

function escapeNotificationHTML(value) {

  var div =
    document.createElement("div");

  div.textContent =
    value == null
      ? ""
      : String(value);

  return div.innerHTML;

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
/* -----------------------------
   Admin auth state (mock, frontend-only for now).
   Once a real backend is wired up, call:
     BLEGAB_ADMIN_AUTH.signIn({ name, email })   // on successful login/signup
     BLEGAB_ADMIN_AUTH.signOut()                 // on logout
   and the sidebar (on every admin page) updates itself
   automatically — Sign In/Sign Up flip to Sign Out.
   ----------------------------- */
window.BLEGAB_ADMIN_AUTH = {

  async getUser() {

    try {

      const res = await fetch("http://localhost:5000/api/admin/me", {
        credentials: "include"
      });

      if (!res.ok) return null;

      const data = await res.json();

      return data.admin;

    } catch (err) {

      return null;

    }

  },



  async signOut() {

    try {

        const res = await fetch(
            "http://localhost:5000/api/admin/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );

        return res.ok;

    } catch (err) {

        return false;

    }

}

};

async function renderAdminAuthState() {

    var submenu = document.querySelector('[data-admin-auth-submenu]');

    if (!submenu) return;

    var user = await window.BLEGAB_ADMIN_AUTH.getUser();

  if (user) {
    submenu.innerHTML =
      '<li class="admin-nav__sublink admin-nav__sublink--static">Signed in as ' + (user.name || user.email) + '</li>' +
      '<li>' +
        '<button type="button" class="admin-nav__sublink admin-nav__sublink--btn" data-admin-signout>' +
          '<svg class="admin-nav__sublink-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
            '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M10 17l-5-5 5-5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M15 12H3" stroke-linecap="round"/>' +
          '</svg>' +
          'Sign Out' +
        '</button>' +
      '</li>';
  } else {
    submenu.innerHTML =
      '<li>' +
        '<a href="admin-login.html" class="admin-nav__sublink">' +
          '<svg class="admin-nav__sublink-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
            '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M16 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M21 12H9" stroke-linecap="round"/>' +
          '</svg>' +
          'Admin Sign In' +
        '</a>' +
      '</li>' +
      '<li>' +
        '<a href="admin-signup.html" class="admin-nav__sublink">' +
          '<svg class="admin-nav__sublink-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
            '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M10 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M15 12H3" stroke-linecap="round"/>' +
          '</svg>' +
          'Admin Sign Up' +
        '</a>' +
      '</li>';
  }
}

document.addEventListener("click", async function (e) {

    var signOutBtn = e.target.closest("[data-admin-signout]");

    if (!signOutBtn) return;

    var success = await window.BLEGAB_ADMIN_AUTH.signOut();

    if (success) {
        window.location.href = "admin-login.html";
    } else {
        alert("Unable to log out. Please try again.");
    }

});