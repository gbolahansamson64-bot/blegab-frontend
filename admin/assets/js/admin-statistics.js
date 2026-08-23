/* =========================================================
   ADMIN STATISTICS PAGE JS
   Renders everything from window.BLEGAB_ADMIN_STATISTICS
   (admin-statistics-data.js). Sidebar / topbar / notifications /
   theme toggle are already handled by admin.js, which is safe
   to load on this page too — every selector it queries either
   matches shared shell markup or simply isn't found here.

   NOTE: formatAdminMoney(), formatLocalISODate() and
   parseISODate() are defined in admin.js and reused here as
   globals — admin.js is loaded before this file.
   ========================================================= */

   let statisticsData = null;

document.addEventListener("DOMContentLoaded", async function () {

  await loadStatistics();

  initStxDatePicker();

  renderStxStatCards();

  initChartGranularityTabs();

  renderBreakdownChart();

  initTransactionHistory();

  initDownloadPanel();

  initQuickExportScroll();

});

async function loadStatistics() {
  try {
    const response = await fetch(
  "https://api.blegab.com/api/admin/statistics",
  {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  }
);

    console.log("STATISTICS RESPONSE STATUS:", response.status);

    const data = await response.json();

    console.log("========== STATISTICS DATA ==========");
    console.log(data);
    console.log("EARNINGS:", data.earnings);
    console.log("CHART:", data.chart);
    console.log("DAILY:", data.chart?.daily);
    console.log("WEEKLY:", data.chart?.weekly);
    console.log("MONTHLY:", data.chart?.monthly);
    console.log("BREAKDOWN:", data.breakdown);
    console.log("TRANSACTIONS:", data.transactions);
    console.log("=====================================");

    if (!data.success) {
      throw new Error("Failed to load statistics.");
    }

    statisticsData = data;

    window.BLEGAB_ADMIN_STATISTICS = data;

  } catch (error) {
    console.error("STATISTICS LOAD ERROR:", error);

    alert("Unable to load statistics.");
  }
}

/* -----------------------------
   "As of" date picker in the page head
   ----------------------------- */
function initStxDatePicker() {
  var input = document.querySelector('[data-stx-date-picker-input]');
  var label = document.querySelector('[data-stx-date-picker-label]');
  if (!input || !label) return;

  var params = new URLSearchParams(window.location.search);
  var initialDate = params.get('date') || formatLocalISODate(new Date());

  input.value = initialDate;
  updateStxDateLabel(initialDate);

  input.addEventListener('change', function () {
    if (input.value) updateStxDateLabel(input.value);
    // Swap in a real fetch here once the backend exists, e.g.
    //   fetch('/api/admin/statistics?date=' + input.value)...
  });

  function updateStxDateLabel(isoDateString) {
    label.textContent = parseISODate(isoDateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

/* -----------------------------
   Stat cards (Today / Week / Month / Year)
   ----------------------------- */
function renderStxStatCards() {
  var data = statisticsData;
  if (!data || !data.earnings) return;

  Object.keys(data.earnings).forEach(function (key) {
    var entry = data.earnings[key];

    var valueEl = document.querySelector('[data-stx-stat="' + key + '"]');
    if (valueEl) valueEl.textContent = formatAdminMoney(entry.value);

    var deltaEl = document.querySelector('[data-stx-delta="' + key + '"]');
    if (!deltaEl) return;

    var directionClass = entry.direction === 'down' ? 'admin-stat-card__delta--down' : 'admin-stat-card__delta--up';
    deltaEl.className = 'admin-stat-card__delta ' + directionClass;
    deltaEl.innerHTML = Math.abs(entry.deltaPct).toFixed(1) + '%' +
      '<span class="admin-stat-card__delta-note">&nbsp;vs last period</span>';
  });
}

/* -----------------------------
   Revenue chart (Chart.js) with Daily / Weekly / Monthly tabs
   ----------------------------- */
var stxRevenueChartInstance = null;

function initChartGranularityTabs() {
  var tabs = document.querySelectorAll('[data-chart-granularity-tabs] .stx-period-tabs__btn');
  if (!tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      renderRevenueChart(tab.dataset.granularity);
    });
  });

  renderRevenueChart('daily');
}

function renderRevenueChart(granularity) {

  console.log("========== RENDER REVENUE CHART ==========");
console.log("GRANULARITY:", granularity);
console.log("STATISTICS DATA:", statisticsData);
console.log("CHART DATA:", statisticsData?.chart);
console.log("SELECTED SERIES:", statisticsData?.chart?.[granularity]);
console.log("CHART.JS:", typeof Chart);
  var canvas = document.querySelector('[data-revenue-chart]');
  var data = statisticsData;
  if (!canvas || !data || !data.chart || typeof Chart === 'undefined') return;

  var series = data.chart[granularity] || data.chart.daily;
  var styles = getComputedStyle(document.body);
  var gold = styles.getPropertyValue('--color-gold').trim() || '#D4AF37';
  var textMuted = styles.getPropertyValue('--color-text-muted').trim() || '#b9b4ab';
  var borderDark = styles.getPropertyValue('--color-border-dark').trim() || '#2b2a27';
  var bgAlt = styles.getPropertyValue('--color-bg-dark-alt').trim() || '#161513';

  if (stxRevenueChartInstance) {
    stxRevenueChartInstance.destroy();
  }

  stxRevenueChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [{
        label: 'Revenue',
        data: series.values,
        borderColor: gold,
        backgroundColor: 'rgba(212, 175, 55, 0.14)',
        pointBackgroundColor: gold,
        pointBorderColor: bgAlt,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: bgAlt,
          borderColor: borderDark,
          borderWidth: 1,
          titleColor: '#ffffff',
          bodyColor: textMuted,
          padding: 10,
          callbacks: {
            label: function (context) { return formatAdminMoney(context.parsed.y); }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textMuted, font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: borderDark },
          ticks: {
            color: textMuted,
            font: { size: 11 },
            callback: function (value) { return formatAdminMoney(value); }
          }
        }
      }
    }
  });
}

/* -----------------------------
   Earnings-by-category donut + legend
   ----------------------------- */
function renderBreakdownChart() {
  var canvas = document.querySelector('[data-breakdown-chart]');
  var legendList = document.querySelector('[data-breakdown-legend]');
  var totalEl = document.querySelector('[data-breakdown-total]');
  var data = statisticsData;
  if (!canvas || !data || !data.breakdown) return;

  var breakdown = data.breakdown;
  var total = breakdown.reduce(function (sum, item) { return sum + item.value; }, 0);
  if (totalEl) totalEl.textContent = formatAdminMoney(total);

  if (legendList) {
    legendList.innerHTML = breakdown.map(function (item) {
      var pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
      return '' +
        '<li class="stx-legend-row">' +
          '<span class="stx-legend-dot" style="background-color:' + item.color + '"></span>' +
          '<span class="stx-legend-label">' + item.label + '</span>' +
          '<span class="stx-legend-value">' + pct + '%</span>' +
        '</li>';
    }).join('');
  }

  if (typeof Chart === 'undefined') return;

  var styles = getComputedStyle(document.body);
  var bgAlt = styles.getPropertyValue('--color-bg-dark-alt').trim() || '#161513';
  var textMuted = styles.getPropertyValue('--color-text-muted').trim() || '#b9b4ab';
  var borderDark = styles.getPropertyValue('--color-border-dark').trim() || '#2b2a27';

  new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: breakdown.map(function (i) { return i.label; }),
      datasets: [{
        data: breakdown.map(function (i) { return i.value; }),
        backgroundColor: breakdown.map(function (i) { return i.color; }),
        borderColor: bgAlt,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: bgAlt,
          borderColor: borderDark,
          borderWidth: 1,
          titleColor: '#ffffff',
          bodyColor: textMuted,
          padding: 10,
          callbacks: {
            label: function (context) { return context.label + ': ' + formatAdminMoney(context.parsed); }
          }
        }
      }
    }
  });
}

/* -----------------------------
   Transaction history — client-side pagination placeholder.
   Swap the slice-based paging below for real backend pagination
   (e.g. /api/admin/statistics/transactions?page=2) once it exists.
   ----------------------------- */
var STX_PAGE_SIZE = 6;
var stxVisibleCount = STX_PAGE_SIZE;

var STX_STATUS_MAP = {
  paid:     { label: 'Paid',     className: 'admin-status--delivered' },
  pending:  { label: 'Pending',  className: 'admin-status--pending'   },
  refunded: { label: 'Refunded', className: 'admin-status--cancelled' }
};

function initTransactionHistory() {
  var loadMoreBtn = document.querySelector('[data-stx-load-more]');
  renderTransactionHistory();

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      stxVisibleCount += STX_PAGE_SIZE;
      renderTransactionHistory();
    });
  }
}

function renderTransactionHistory() {
  var list = document.querySelector('[data-stx-history-list]');
  var countEl = document.querySelector('[data-stx-history-count]');
  var loadMoreBtn = document.querySelector('[data-stx-load-more]');
  var data = statisticsData;
  if (!list || !data || !data.transactions) return;

  var all = data.transactions;
  var visible = all.slice(0, stxVisibleCount);

  list.innerHTML = visible.map(function (txn) {
    var status = STX_STATUS_MAP[txn.status] || { label: txn.status, className: 'admin-status--pending' };
    var amountClass = txn.status === 'refunded' ? 'stx-history-amount stx-history-amount--refunded' : 'stx-history-amount';
    var amountPrefix = txn.status === 'refunded' ? '-' : '';

    return '' +
      '<div class="stx-history-row stx-history-item" role="row">' +
        '<span class="stx-history-reference" role="cell">' + txn.reference + '</span>' +
        '<span class="stx-history-description" role="cell">' + txn.description + '</span>' +
        '<span class="stx-history-date" role="cell">' + formatStxDisplayDate(txn.date) + '</span>' +
        '<span class="' + amountClass + '" role="cell">' + amountPrefix + formatAdminMoney(txn.amount) + '</span>' +
        '<span role="cell"><span class="admin-status ' + status.className + '">' + status.label + '</span></span>' +
      '</div>';
  }).join('');

  if (countEl) countEl.textContent = visible.length + ' of ' + all.length;
  if (loadMoreBtn) loadMoreBtn.hidden = stxVisibleCount >= all.length;
}

function formatStxDisplayDate(isoDateString) {
  return new Date(isoDateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* -----------------------------
   Download Earnings Statement panel
   ----------------------------- */
function initDownloadPanel() {
  var rangeDropdown = document.querySelector('[data-stx-range-dropdown]');
  var rangeToggle = document.querySelector('[data-stx-range-toggle]');
  var rangeMenu = document.querySelector('[data-stx-range-menu]');
  var rangeLabel = document.querySelector('[data-stx-range-label]');
  var customRange = document.querySelector('[data-stx-custom-range]');
  var formatToggle = document.querySelector('[data-stx-format-toggle]');
  var generateBtn = document.querySelector('[data-stx-generate]');
  var fromInput = document.querySelector('[data-stx-from]');
  var toInput = document.querySelector('[data-stx-to]');
  if (!rangeDropdown || !generateBtn) return;

  var selectedFormat = 'pdf';
  var todayISO = formatLocalISODate(new Date());
  if (fromInput) fromInput.value = todayISO;
  if (toInput) toInput.value = todayISO;

  function toggleCustomRange() {
    if (!customRange) return;
    customRange.classList.toggle('is-visible', rangeDropdown.dataset.value === 'custom');
  }
  toggleCustomRange();

  if (rangeToggle && rangeMenu) {
    rangeToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = rangeMenu.classList.toggle('is-open');
      rangeToggle.setAttribute('aria-expanded', String(isOpen));
    });

    rangeMenu.querySelectorAll('[data-value]').forEach(function (item) {
      item.addEventListener('click', function () {
        rangeMenu.querySelectorAll('[data-value]').forEach(function (i) { i.classList.remove('is-active'); });
        item.classList.add('is-active');
        rangeDropdown.dataset.value = item.dataset.value;
        if (rangeLabel) rangeLabel.textContent = item.textContent;
        rangeMenu.classList.remove('is-open');
        rangeToggle.setAttribute('aria-expanded', 'false');
        toggleCustomRange();
      });
    });

    document.addEventListener('click', function (e) {
      if (!rangeDropdown.contains(e.target)) {
        rangeMenu.classList.remove('is-open');
        rangeToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (formatToggle) {
    formatToggle.querySelectorAll('[data-format]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        formatToggle.querySelectorAll('[data-format]').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        selectedFormat = btn.dataset.format;
      });
    });
  }

  generateBtn.addEventListener('click', function () {
    var range = rangeDropdown.dataset.value;
    var fromDate = range === 'custom' && fromInput ? fromInput.value : null;
    var toDate = range === 'custom' && toInput ? toInput.value : null;
    generateStatement(range, selectedFormat, fromDate, toDate);
  });
}

/* Builds the earnings statement from the data already loaded on this
   page. This is a client-side placeholder — once the backend exists,
   the cleanest swap is usually to just fetch a ready-made file:
     fetch('/api/admin/statements/export?range=' + range + '&format=' + format)
       .then(res => res.blob())
       .then(blob => downloadBlob(blob, 'statement.' + format));
   Left as local generation for now so the button is fully usable. */
function generateStatement(range, format, fromDate, toDate) {
  var data = statisticsData;
  if (!data) return;

  var rangeLabels = { today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year', custom: 'Custom Range' };
  var periodLabel = rangeLabels[range] || range;
  if (range === 'custom' && fromDate && toDate) {
    periodLabel = formatStxDisplayDate(fromDate) + ' – ' + formatStxDisplayDate(toDate);
  }

  var transactions = filterTransactionsForRange(data.transactions, range, fromDate, toDate);
  var total = transactions.reduce(function (sum, t) { return sum + (t.status === 'refunded' ? -t.amount : t.amount); }, 0);

  if (format === 'csv') {
    downloadStatementCSV(periodLabel, total, transactions);
  } else {
    downloadStatementPDF(periodLabel, total, transactions);
  }
}

function filterTransactionsForRange(transactions, range, fromDate, toDate) {
  if (range === 'custom' && fromDate && toDate) {
    return transactions.filter(function (t) { return t.date >= fromDate && t.date <= toDate; });
  }
  // Placeholder ranges: with only a handful of mock rows on hand,
  // "today/week/month/year" all resolve to the full mock set so the
  // export always has something to show. A live backend would filter
  // this server-side against real order dates instead.
  return transactions;
}

function downloadStatementCSV(periodLabel, total, transactions) {
  var rows = [['Reference', 'Description', 'Date', 'Status', 'Amount']];
  transactions.forEach(function (t) {
    rows.push([t.reference, t.description, t.date, t.status, (t.status === 'refunded' ? '-' : '') + t.amount.toFixed(2)]);
  });
  rows.push([]);
  rows.push(['Period', periodLabel]);
  rows.push(['Total', total.toFixed(2)]);

  var csv = rows.map(function (row) {
    return row.map(function (cell) {
      var value = String(cell == null ? '' : cell);
      return /[",\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
    }).join(',');
  }).join('\n');

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'blegab-earnings-statement.csv');
}

function downloadStatementPDF(periodLabel, total, transactions) {
  if (typeof window.jspdf === 'undefined') {
    alert('PDF export library failed to load. Check your connection and try again.');
    return;
  }

  var doc = new window.jspdf.jsPDF();
  var goldRGB = [212, 175, 55];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text('BLEGAB Luxury Wigs', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text('Earnings Statement', 14, 28);
  doc.text('Period: ' + periodLabel, 14, 35);
  doc.text('Generated: ' + new Date().toLocaleString('en-US'), 14, 41);

  doc.setDrawColor.apply(doc, goldRGB);
  doc.setLineWidth(0.6);
  doc.line(14, 46, 196, 46);

  var tableBody = transactions.map(function (t) {
    return [
      t.reference,
      t.description,
      formatStxDisplayDate(t.date),
      STX_STATUS_MAP[t.status] ? STX_STATUS_MAP[t.status].label : t.status,
      (t.status === 'refunded' ? '-' : '') + formatAdminMoney(t.amount)
    ];
  });

  if (typeof doc.autoTable === 'function') {
    doc.autoTable({
      startY: 52,
      head: [['Reference', 'Description', 'Date', 'Status', 'Amount']],
      body: tableBody,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: goldRGB, textColor: [26, 26, 26] },
      alternateRowStyles: { fillColor: [246, 241, 233] }
    });

    var finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text('Total: ' + formatAdminMoney(total), 14, finalY);
  } else {
    // Fallback if the autotable plugin didn't load — plain list.
    var y = 56;
    doc.setFontSize(9);
    tableBody.forEach(function (row) {
      doc.text(row.join('   |   '), 14, y);
      y += 6;
    });
    doc.setFont('helvetica', 'bold');
    doc.text('Total: ' + formatAdminMoney(total), 14, y + 6);
  }

  doc.save('blegab-earnings-statement.pdf');
}

function triggerDownload(blob, filename) {
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
   Header "Download Statement" shortcut — scrolls to the full
   download panel and gives it a brief highlight.
   ----------------------------- */
function initQuickExportScroll() {
  var btn = document.querySelector('[data-stx-quick-export]');
  var panel = document.getElementById('download-statement');
  if (!btn || !panel) return;

  btn.addEventListener('click', function () {
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    panel.classList.remove('is-highlighted');
    // Force reflow so the animation can restart if clicked again
    void panel.offsetWidth;
    panel.classList.add('is-highlighted');
  });
}