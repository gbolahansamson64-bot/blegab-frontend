/* =========================================================
   ADMIN STATISTICS PAGE — PLACEHOLDER DATA
   Same pattern as admin-data.js: swap for a live fetch once
   the backend/admin API exists, e.g.

     fetch('/api/admin/statistics?range=month')
       .then(res => res.json())
       .then(data => { window.BLEGAB_ADMIN_STATISTICS = data; renderRevenueChart(); ... });

   Everything below (earnings totals, chart series, category
   breakdown, transaction history) is mock data standing in for
   what the real ledger/orders API would return.
   ========================================================= */

window.BLEGAB_ADMIN_STATISTICS = {

  /* Stat cards — each figure + its % change vs. the previous
     equivalent period (yesterday / last week / last month / last year). */
  earnings: {
    today: { value: 0,    deltaPct: 0.0, direction: 'up'   },
    week:  { value: 0,   deltaPct: 0.0,  direction: 'up'   },
    month: { value: 0,  deltaPct: 0.0, direction: 'up' },
    year:  { value: 0, deltaPct: 0.0, direction: 'up'   }
  },

  /* Revenue chart series, one per granularity tab. */
  chart: {
    daily: {
      labels: ['Jul 13','Jul 14','Jul 15','Jul 16','Jul 17','Jul 18','Jul 19','Jul 20','Jul 21','Jul 22','Jul 23','Jul 24','Jul 25','Jul 26'],
      values: [540, 610, 480, 720, 890, 1040, 760, 615, 705, 940, 1120, 880, 690, 812.5]
    },
    weekly: {
      labels: ['Wk 1','Wk 2','Wk 3','Wk 4','Wk 5','Wk 6','Wk 7','Wk 8'],
      values: [3120, 3480, 2950, 4010, 4360, 3890, 4520, 4360]
    },
    monthly: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      values: [9800, 11200, 10450, 13600, 15200, 16800, 18420.75, 0, 0, 0, 0, 0]
    }
  },

  /* Revenue split by wig category — feeds the donut + legend. */
  breakdown: [
    { label: 'Straight Wigs', value: 6200, color: '#D4AF37' },
    { label: 'Wavy Wigs',     value: 4800, color: '#6fa8dc' },
    { label: 'Curly Wigs',    value: 3900, color: '#b39ddb' },
    { label: 'Kinky Wigs',    value: 2100, color: '#6fcf78' },
    { label: 'Custom Units',  value: 1420.75, color: '#e57373' }
  ],

  /* Transaction / earnings history — most recent first.
     status: 'paid' | 'pending' | 'refunded' */
  transactions: [
    { id: 'TXN-10467', reference: 'BLG-1256', description: 'Order payment — Sarah Johnson',    date: '2025-05-24', amount: 650.00, status: 'pending'  },
    { id: 'TXN-10466', reference: 'BLG-1255', description: 'Order payment — Amanda Brown',     date: '2025-05-24', amount: 420.00, status: 'paid'     },
    { id: 'TXN-10465', reference: 'BLG-1254', description: 'Order payment — Jessica Williams', date: '2025-05-24', amount: 380.00, status: 'paid'     },
    { id: 'TXN-10464', reference: 'BLG-1253', description: 'Order payment — Brittany Davis',   date: '2025-05-23', amount: 720.00, status: 'paid'     },
    { id: 'TXN-10463', reference: 'BLG-1252', description: 'Order payment — Olivia Martinez',  date: '2025-05-23', amount: 510.00, status: 'refunded' },
    { id: 'TXN-10462', reference: 'BLG-1251', description: 'Order payment — Monique Anderson', date: '2025-05-23', amount: 610.00, status: 'paid'     },
    { id: 'TXN-10461', reference: 'BLG-1250', description: 'Order payment — Tiffany Thomas',   date: '2025-05-23', amount: 450.00, status: 'paid'     },
    { id: 'TXN-10460', reference: 'BLG-1249', description: 'Order payment — Danielle Harris',  date: '2025-05-23', amount: 330.00, status: 'pending'  },
    { id: 'TXN-10459', reference: 'BLG-1248', description: 'Order payment — Lauren White',     date: '2025-05-23', amount: 560.00, status: 'paid'     },
    { id: 'TXN-10458', reference: 'BLG-1247', description: 'Order payment — Kayla Thompson',   date: '2025-05-23', amount: 700.00, status: 'paid'     },
    { id: 'TXN-10457', reference: 'BLG-1246', description: 'Order payment — Chelsea Moore',    date: '2025-05-22', amount: 390.00, status: 'paid'     },
    { id: 'TXN-10456', reference: 'BLG-1245', description: 'Order payment — Destiny Clark',    date: '2025-05-22', amount: 480.00, status: 'paid'     }
  ]
};