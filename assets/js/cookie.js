/* =========================================================
   BLEGAB LUXURY WIGS — COOKIE CONSENT SYSTEM
   Self-contained: injects its own markup (no fetch, no server).

   TO ADD TO A PAGE:
     1. Load assets/css/cookie-consent.css in <head>, after base.css
     2. Add <script src="assets/js/cookie-consent.js"></script>
        near the end of <body> (after header.js is fine, order vs
        main.js doesn't matter)

   TO REOPEN PREFERENCES FROM ANYWHERE (e.g. the footer's
   "Cookie Policy" link):
     - add the attribute  data-open-cookie-settings  to any
       link/button, e.g.:
         <a href="#" data-open-cookie-settings>Cookie Policy</a>
       Clicks on it are caught automatically, no extra JS needed.
     - or call  window.BLEGAB_COOKIES.openPreferences()  directly.

   TO GATE A SCRIPT BEHIND CONSENT (analytics/marketing), add
   your loader inside loadAnalyticsScripts() / loadMarketingScripts()
   below — they already run at the right time.
   ========================================================= */

(function () {
  var STORAGE_KEY = 'blegab_cookie_consent';

  // How long a saved choice stays valid before we ask again.
  var CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

  var CATEGORIES = ['essential', 'analytics', 'marketing', 'preferences'];

  var bannerEl = null;
  var overlayEl = null;
  var modalEl = null;
  var lastFocusedEl = null;
  var analyticsLoaded = false;
  var marketingLoaded = false;

  /* -----------------------------
     Consent storage
     ----------------------------- */
  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      var consent = JSON.parse(raw);

      // Expire old consent so returning visitors are asked again periodically.
      if (consent && consent.timestamp) {
        var age = Date.now() - new Date(consent.timestamp).getTime();
        if (age > CONSENT_MAX_AGE_MS) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
      }

      return consent;
    } catch (e) {
      return null;
    }
  }

  function defaultConsent() {
    return { essential: true, analytics: false, marketing: false, preferences: false };
  }

  function saveConsent(partial) {
    var consent = defaultConsent();
    consent.essential = true;
    if (partial) {
      consent.analytics = !!partial.analytics;
      consent.marketing = !!partial.marketing;
      consent.preferences = !!partial.preferences;
    }
    consent.timestamp = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch (e) {}
    applyConsent(consent);
    hideBanner();
    closeModal();
    return consent;
  }

  function hasChosen() {
    return !!getConsent();
  }

  /* -----------------------------
     Placeholders: only load these scripts once the
     relevant category has been consented to.
     ----------------------------- */
  function loadAnalyticsScripts() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    // e.g. inject Google Analytics / GA4 <script> tag here.
  }

  function loadMarketingScripts() {
    if (marketingLoaded) return;
    marketingLoaded = true;
    // e.g. inject Meta Pixel / TikTok Pixel <script> tag here.
  }

  function applyConsent(consent) {
    if (!consent) return;
    if (consent.analytics) loadAnalyticsScripts();
    if (consent.marketing) loadMarketingScripts();
  }

  /* -----------------------------
     Markup
     ----------------------------- */
  function bannerHTML() {
    return (
      '<div class="cookie-banner" id="cookie-banner" role="region" aria-label="Cookie consent" hidden>' +
        '<div class="cookie-banner__inner">' +
          '<div class="cookie-banner__main">' +
            '<span class="cookie-banner__icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                '<circle cx="12" cy="12" r="8.5"/>' +
                '<circle cx="9.3" cy="9.6" r="1" fill="currentColor" stroke="none"/>' +
                '<circle cx="14.2" cy="8.8" r="1" fill="currentColor" stroke="none"/>' +
                '<circle cx="15.2" cy="13.8" r="1" fill="currentColor" stroke="none"/>' +
                '<circle cx="10.2" cy="15.2" r="1" fill="currentColor" stroke="none"/>' +
              '</svg>' +
            '</span>' +
            '<div>' +
              '<p class="cookie-banner__heading">We value your privacy</p>' +
              '<p class="cookie-banner__text">We use cookies to improve your browsing experience, personalize your shopping experience, and analyze website traffic. By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies.</p>' +
              '<a href="privacy.html" class="cookie-banner__learn-more">Learn More</a>' +
            '</div>' +
          '</div>' +
          '<div class="cookie-banner__actions">' +
            '<button type="button" class="cc-btn cc-btn--gold" data-cc-accept-all>Accept All</button>' +
            '<button type="button" class="cc-btn cc-btn--outline" data-cc-reject-banner>Reject Non-Essential</button>' +
            '<button type="button" class="cc-btn cc-btn--text" data-cc-open-settings>' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
                '<circle cx="12" cy="12" r="2.6"/>' +
                '<path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.66 6.34l-1.42 1.42M7.76 16.24l-1.42 1.42M17.66 17.66l-1.42-1.42M7.76 7.76L6.34 6.34" stroke-linecap="round"/>' +
              '</svg>' +
              'Cookie Settings' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function categoryHTML(opts) {
    var toggle = opts.locked
      ? '<span class="cc-category__always-on">Always Active</span>'
      : '<button type="button" class="cc-switch" role="switch" aria-checked="false" data-cc-toggle="' + opts.key + '" aria-label="' + opts.title + '"></button>';

    return (
      '<div class="cc-category' + (opts.locked ? ' cc-category--essential' : '') + '">' +
        '<span class="cc-category__icon" aria-hidden="true">' + opts.icon + '</span>' +
        '<div class="cc-category__body">' +
          '<div class="cc-category__title-row">' +
            '<span class="cc-category__title">' + opts.title + '</span>' +
            toggle +
          '</div>' +
          '<p class="cc-category__desc">' + opts.desc + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  var ICON_SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l7 3v5.5c0 4.6-3 8.2-7 9.5-4-1.3-7-4.9-7-9.5V6l7-3z" stroke-linejoin="round"/><path d="M9 12.2l2 2 4-4.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_CHART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 20V10M12 20V4M19 20v-7" stroke-linecap="round"/></svg>';
  var ICON_MEGAPHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10v4h3l6 4V6l-6 4H3z" stroke-linejoin="round"/><path d="M17 9.5a3.5 3.5 0 0 1 0 5" stroke-linecap="round"/></svg>';
  var ICON_SLIDERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h9M17 7h3M4 17h3M11 17h9" stroke-linecap="round"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function modalHTML() {
    return (
      '<div class="cookie-modal-overlay" id="cookie-modal-overlay" hidden>' +
        '<div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title" aria-describedby="cookie-modal-subtitle" id="cookie-modal">' +
          '<button type="button" class="cookie-modal__close" data-cc-close aria-label="Close cookie preferences">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
          '</button>' +
          '<div class="cookie-modal__header">' +
            '<span class="cookie-modal__header-icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8.5"/><circle cx="9.3" cy="9.6" r="1" fill="currentColor" stroke="none"/><circle cx="14.2" cy="8.8" r="1" fill="currentColor" stroke="none"/><circle cx="15.2" cy="13.8" r="1" fill="currentColor" stroke="none"/><circle cx="10.2" cy="15.2" r="1" fill="currentColor" stroke="none"/></svg>' +
            '</span>' +
            '<div>' +
              '<h2 class="cookie-modal__title" id="cookie-modal-title">Cookie Preferences</h2>' +
              '<p class="cookie-modal__subtitle" id="cookie-modal-subtitle">Choose which types of cookies you want to allow. Your preferences will be saved and can be changed anytime.</p>' +
            '</div>' +
          '</div>' +
          '<div class="cookie-modal__body">' +
            '<div class="cookie-modal__categories">' +
              categoryHTML({ key: 'essential', locked: true, icon: ICON_SHIELD, title: 'Essential Cookies', desc: 'Required for website functionality including secure checkout, shopping cart, and login.' }) +
              categoryHTML({ key: 'analytics', icon: ICON_CHART, title: 'Analytics Cookies', desc: 'Help us understand how visitors interact with our website to improve performance.' }) +
              categoryHTML({ key: 'marketing', icon: ICON_MEGAPHONE, title: 'Marketing Cookies', desc: 'Used for personalized advertisements and campaign performance.' }) +
              categoryHTML({ key: 'preferences', icon: ICON_SLIDERS, title: 'Preference Cookies', desc: 'Remember language, currency, and shopping preferences.' }) +
            '</div>' +
            '<div class="cookie-modal__info">' +
              '<p class="cookie-modal__info-title">Essential Cookies</p>' +
              '<p class="cookie-modal__info-desc">These cookies are necessary for the website to function properly and cannot be disabled.</p>' +
              '<ul class="cc-example-list">' +
                '<li>' + ICON_CHECK + 'Keep you logged in</li>' +
                '<li>' + ICON_CHECK + 'Remember items in your shopping cart</li>' +
                '<li>' + ICON_CHECK + 'Secure checkout</li>' +
                '<li>' + ICON_CHECK + 'Fraud prevention</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="cookie-modal__footer">' +
            '<button type="button" class="cc-btn cc-btn--outline" data-cc-reject-modal>Reject Non-Essential</button>' +
            '<button type="button" class="cc-btn cc-btn--gold" data-cc-save>Save Preferences</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* -----------------------------
     Banner show/hide
     ----------------------------- */
  function showBanner() {
    if (bannerEl) bannerEl.hidden = false;
  }

  function hideBanner() {
    if (bannerEl) bannerEl.hidden = true;
  }

  /* -----------------------------
     Modal open/close
     ----------------------------- */
  function setToggle(key, checked) {
    var btn = modalEl.querySelector('[data-cc-toggle="' + key + '"]');
    if (btn) btn.setAttribute('aria-checked', checked ? 'true' : 'false');
  }

  function getToggleState(key) {
    var btn = modalEl.querySelector('[data-cc-toggle="' + key + '"]');
    return btn ? btn.getAttribute('aria-checked') === 'true' : false;
  }

  function populateModal() {
    var consent = getConsent() || defaultConsent();
    setToggle('analytics', consent.analytics);
    setToggle('marketing', consent.marketing);
    setToggle('preferences', consent.preferences);
  }

  function focusableElements() {
    return Array.prototype.slice.call(
      modalEl.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.disabled; });
  }

  function handleModalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      var items = focusableElements();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openModal() {
    populateModal();
    lastFocusedEl = document.activeElement;
    overlayEl.hidden = false;
    document.addEventListener('keydown', handleModalKeydown);
    var closeBtn = modalEl.querySelector('[data-cc-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!overlayEl || overlayEl.hidden) return;
    overlayEl.hidden = true;
    document.removeEventListener('keydown', handleModalKeydown);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
  }

  /* -----------------------------
     Wiring
     ----------------------------- */
  function wireEvents() {
    bannerEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-cc-accept-all]')) {
        saveConsent({ analytics: true, marketing: true, preferences: true });
      } else if (e.target.closest('[data-cc-reject-banner]')) {
        saveConsent(defaultConsent());
      } else if (e.target.closest('[data-cc-open-settings]')) {
        openModal();
      }
    });

    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) closeModal();
    });

    modalEl.addEventListener('click', function (e) {
      var toggleBtn = e.target.closest('[data-cc-toggle]');
      if (toggleBtn) {
        var checked = toggleBtn.getAttribute('aria-checked') === 'true';
        toggleBtn.setAttribute('aria-checked', checked ? 'false' : 'true');
        return;
      }
      if (e.target.closest('[data-cc-close]')) {
        closeModal();
      } else if (e.target.closest('[data-cc-reject-modal]')) {
        saveConsent(defaultConsent());
      } else if (e.target.closest('[data-cc-save]')) {
        saveConsent({
          analytics: getToggleState('analytics'),
          marketing: getToggleState('marketing'),
          preferences: getToggleState('preferences')
        });
      }
    });

    // Any element anywhere on the page (e.g. footer "Cookie Policy"
    // link) can reopen preferences by adding this attribute.
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-open-cookie-settings]');
      if (trigger) {
        e.preventDefault();
        openModal();
      }
    });
  }

  /* -----------------------------
     Init
     ----------------------------- */
  function init() {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = bannerHTML() + modalHTML();
    while (wrapper.firstChild) document.body.appendChild(wrapper.firstChild);

    bannerEl = document.getElementById('cookie-banner');
    overlayEl = document.getElementById('cookie-modal-overlay');
    modalEl = document.getElementById('cookie-modal');

    wireEvents();

    var existingConsent = getConsent();
    if (existingConsent) {
      applyConsent(existingConsent);
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BLEGAB_COOKIES = {
    getConsent: getConsent,
    hasConsent: function (category) {
      var c = getConsent();
      return !!(c && c[category]);
    },
    acceptAll: function () { saveConsent({ analytics: true, marketing: true, preferences: true }); },
    rejectNonEssential: function () { saveConsent(defaultConsent()); },
    openPreferences: function () { openModal(); }
  };
})();