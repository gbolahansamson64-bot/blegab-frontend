/* =========================================================
   BLEGAB SHIPPING RULES
   Rates come from the admin dashboard (Settings > Shipping),
   fetched from the public GET /api/shipping endpoint.
   Frontend display/calculation only. Backend files are untouched.

   Any country the admin has not configured (or has marked
   unavailable) falls back to "Contact Admin for shipping fee".

   Free shipping: orders of $500+ subtotal ship free to US & Canada.
   No other country has a free-shipping threshold.
   ========================================================= */

const SHIPPING_API_URL = "https://api.blegab.com/api/shipping";
const SHIPPING_WHATSAPP_NUMBER = '14696180809';

// Free shipping threshold — only applies to countries listed here.
const FREE_SHIPPING_THRESHOLD = 500;
const FREE_SHIPPING_COUNTRIES = Object.freeze(['US', 'CA']);

// Populated by loadShippingRules(). Keyed by 2-letter country code.
let shippingRulesByCode = {};
let shippingRulesLoaded = false;

function normalizeCountryCode(countryCode) {
  return String(countryCode || '').trim().toUpperCase();
}

// Fetches the admin-configured rates once and caches them so
// getShippingRule()/calculateShipping() can stay synchronous
// for every call site that already uses them that way.
async function loadShippingRules() {
  try {
    const response = await fetch(SHIPPING_API_URL);
    const data = await response.json();
    const rules = (data && data.rules) || [];

    const map = {};
    rules.forEach(function (rule) {
      const code = normalizeCountryCode(rule.countryCode);
      if (!code) return;
      map[code] = {
        countryCode: code,
        countryName: rule.country,
        cost: Number(rule.fee) || 0
      };
    });

    shippingRulesByCode = map;
  } catch (error) {
    console.error("LOAD SHIPPING RULES ERROR:", error);
    shippingRulesByCode = {};
  } finally {
    shippingRulesLoaded = true;
  }

  return shippingRulesByCode;
}

function getShippingRule(countryCode) {
  const code = normalizeCountryCode(countryCode);
  const rule = shippingRulesByCode[code];

  if (!rule) {
    return {
      supported: false,
      countryCode: code,
      countryName: '',
      cost: null,
      contactAdmin: true
    };
  }

  return {
    supported: true,
    countryCode: rule.countryCode,
    countryName: rule.countryName,
    cost: rule.cost,
    contactAdmin: false
  };
}

function getShippingMethods(countryCode) {
  const rule = getShippingRule(countryCode);
  if (!rule.supported) return [];

  return [{
    id: 'standard',
    label: 'Standard',
    rate: rule.cost
  }];
}

function calculateShipping(subtotal, countryCode, method = 'standard') {
  const rule = getShippingRule(countryCode);
  const safeSubtotal = Number(subtotal || 0);

  if (!rule.supported) {
    return {
      supported: false,
      contactAdmin: true,
      cost: null,
      subtotal: safeSubtotal,
      country: rule.countryCode,
      method,
      error: 'Shipping fee is not available for this country. Contact Admin for shipping fee.'
    };
  }

  const freeShippingApplied = FREE_SHIPPING_COUNTRIES.includes(rule.countryCode)
    && safeSubtotal > FREE_SHIPPING_THRESHOLD;
  const cost = freeShippingApplied ? 0 : rule.cost;

  return {
    supported: true,
    contactAdmin: false,
    cost,
    subtotal: safeSubtotal,
    total: safeSubtotal + cost,
    country: rule.countryCode,
    method,
    freeShippingApplied
  };
}

function formatShippingDisplay(shippingData) {
  if (!shippingData || !shippingData.supported) {
    return 'Contact Admin for shipping fee';
  }
  return `$${Number(shippingData.cost).toFixed(2)}`;
}

function getShippingWhatsAppUrl(countryName = '') {
  const message = countryName
    ? `Hello Blegab, I need the shipping fee for ${countryName}.`
    : 'Hello Blegab, I need information about the shipping fee for my country.';
  return `https://wa.me/${SHIPPING_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function updateCheckoutShipping(
  subtotal,
  countryCode,
  method = 'standard',
  shippingDisplaySelector = '[data-checkout-shipping-display]',
  shippingCostSelector = '[data-checkout-shipping-cost]',
  totalSelector = '[data-checkout-total]'
) {
  const shippingData = calculateShipping(subtotal, countryCode, method);

  const shippingDisplay = document.querySelector(shippingDisplaySelector);
  const shippingCost = document.querySelector(shippingCostSelector);
  const total = document.querySelector(totalSelector);

  if (!shippingData.supported) {
    if (shippingDisplay) shippingDisplay.textContent = 'Contact Admin for shipping fee';
    if (shippingCost) shippingCost.textContent = 'Contact Admin for shipping fee';
    if (total) total.textContent = `$${Number(subtotal || 0).toFixed(2)}`;
    return shippingData;
  }

  if (shippingDisplay) shippingDisplay.textContent = formatShippingDisplay(shippingData);
  if (shippingCost) shippingCost.textContent = `$${shippingData.cost.toFixed(2)}`;
  if (total) total.textContent = `$${shippingData.total.toFixed(2)}`;

  return shippingData;
}

if (typeof window !== 'undefined') {
  window.BLEGAB_SHIPPING = {
    SHIPPING_WHATSAPP_NUMBER,
    normalizeCountryCode,
    loadShippingRules,
    getShippingRule,
    getShippingMethods,
    calculateShipping,
    formatShippingDisplay,
    getShippingWhatsAppUrl,
    updateCheckoutShipping
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeCountryCode,
    loadShippingRules,
    getShippingRule,
    getShippingMethods,
    calculateShipping,
    formatShippingDisplay,
    getShippingWhatsAppUrl,
    updateCheckoutShipping
  };
}