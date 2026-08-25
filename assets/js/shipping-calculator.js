/* =========================================================
   BLEGAB SHIPPING RULES
   Frontend display/calculation only. Backend files are untouched.

   Supported destinations from the checkout wireframe:
   United States  -> $20
   Canada         -> $20
   Nigeria        -> $50
   United Kingdom -> $50

   Every other country requires the customer to contact Admin.

   Free shipping: orders of $500+ subtotal ship free to US & Canada.
   No other supported country has a free-shipping threshold.
   ========================================================= */

const SHIPPING_RATES = Object.freeze({
  US: { cost: 20, daysMin: 5, daysMax: 7 },
  CA: { cost: 20, daysMin: 7, daysMax: 10 },
  NG: { cost: 50, daysMin: 14, daysMax: 21 },
  GB: { cost: 50, daysMin: 5, daysMax: 7 }
});

const SHIPPING_COUNTRIES = Object.freeze({
  US: 'United States',
  CA: 'Canada',
  NG: 'Nigeria',
  GB: 'United Kingdom'
});

const SHIPPING_WHATSAPP_NUMBER = '14696180809';

// Free shipping threshold — only applies to countries listed here.
const FREE_SHIPPING_THRESHOLD = 500;
const FREE_SHIPPING_COUNTRIES = Object.freeze(['US', 'CA']);

function normalizeCountryCode(countryCode) {
  return String(countryCode || '').trim().toUpperCase();
}

function getShippingRule(countryCode) {
  const code = normalizeCountryCode(countryCode);
  const rule = SHIPPING_RATES[code];

  if (!rule) {
    return {
      supported: false,
      countryCode: code,
      countryName: SHIPPING_COUNTRIES[code] || '',
      cost: null,
      contactAdmin: true
    };
  }

  return {
    supported: true,
    countryCode: code,
    countryName: SHIPPING_COUNTRIES[code],
    cost: rule.cost,
    daysMin: rule.daysMin,
    daysMax: rule.daysMax,
    contactAdmin: false
  };
}

function getShippingMethods(countryCode) {
  const rule = getShippingRule(countryCode);
  if (!rule.supported) return [];

  return [{
    id: 'standard',
    label: 'Standard',
    rate: rule.cost,
    daysMin: rule.daysMin,
    daysMax: rule.daysMax
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
    && safeSubtotal >= FREE_SHIPPING_THRESHOLD;
  const cost = freeShippingApplied ? 0 : rule.cost;

  return {
    supported: true,
    contactAdmin: false,
    cost,
    subtotal: safeSubtotal,
    total: safeSubtotal + cost,
    country: rule.countryCode,
    method,
    daysMin: rule.daysMin,
    daysMax: rule.daysMax,
    estimatedDelivery: getEstimatedDeliveryDate(rule.daysMin, rule.daysMax),
    freeShippingApplied
  };
}

function getEstimatedDeliveryDate(daysMin, daysMax) {
  const today = new Date();
  const minDate = new Date(today);
  const maxDate = new Date(today);

  minDate.setDate(minDate.getDate() + Number(daysMin || 0));
  maxDate.setDate(maxDate.getDate() + Number(daysMax || 0));

  return {
    min: minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    max: maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    display: `${minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
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
    SHIPPING_RATES,
    SHIPPING_COUNTRIES,
    SHIPPING_WHATSAPP_NUMBER,
    normalizeCountryCode,
    getShippingRule,
    getShippingMethods,
    calculateShipping,
    getEstimatedDeliveryDate,
    formatShippingDisplay,
    getShippingWhatsAppUrl,
    updateCheckoutShipping
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SHIPPING_RATES,
    SHIPPING_COUNTRIES,
    getShippingRule,
    getShippingMethods,
    calculateShipping,
    getEstimatedDeliveryDate,
    formatShippingDisplay,
    getShippingWhatsAppUrl,
    updateCheckoutShipping
  };
}