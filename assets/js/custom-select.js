/* =========================================================
   BLEGAB LUXURY WIGS — CUSTOM SELECT
   Progressively enhances every native <select> into a fully
   styleable dropdown (see custom-select.css), while the real
   <select> stays in the DOM and keeps driving value, name,
   disabled state, and form submission exactly as before.

   Other scripts (e.g. profile.js) can keep doing:
     countrySelect.value = 'NG';
     stateSelect.disabled = false;
     select.innerHTML = optionsHtml;
   and the visible dropdown will stay in sync automatically —
   no changes needed on their end.
   ========================================================= */
(function () {
  'use strict';

  function enhance(select) {
    if (select.dataset.customSelectReady) return;
    select.dataset.customSelectReady = 'true';

    var wrap = document.createElement('div');
    wrap.className = 'select-wrap';
    if (select.disabled) wrap.classList.add('is-disabled');

    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add('select-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.disabled = select.disabled;
    if (select.id) trigger.setAttribute('aria-label', select.getAttribute('aria-label') || select.id);

    var labelSpan = document.createElement('span');
    labelSpan.className = 'select-trigger__label';
    trigger.appendChild(labelSpan);

    var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('class', 'select-trigger__chevron');
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    trigger.appendChild(chevron);

    wrap.appendChild(trigger);

    var panel = document.createElement('ul');
    panel.className = 'select-panel';
    panel.setAttribute('role', 'listbox');
    panel.tabIndex = -1;
    wrap.appendChild(panel);

    var activeIndex = -1;

    function buildOptions() {
      panel.innerHTML = '';
      Array.prototype.forEach.call(select.options, function (opt, i) {
        var li = document.createElement('li');
        li.className = 'select-option';
        li.setAttribute('role', 'option');
        li.dataset.index = String(i);
        li.textContent = opt.textContent;
        if (opt.disabled) li.classList.add('is-disabled');
        if (i === select.selectedIndex) {
          li.classList.add('is-selected');
          activeIndex = i;
        }
        li.addEventListener('click', function () {
          if (opt.disabled) return;
          selectIndex(i);
          close();
          trigger.focus();
        });
        panel.appendChild(li);
      });
      syncLabel();
    }

    function syncLabel() {
      var opt = select.options[select.selectedIndex];
      labelSpan.textContent = opt ? opt.textContent : '';
      labelSpan.classList.toggle('is-placeholder', !!opt && opt.value === '');
      Array.prototype.forEach.call(panel.children, function (li, i) {
        li.classList.toggle('is-selected', i === select.selectedIndex);
      });
      activeIndex = select.selectedIndex;
    }

    function selectIndex(i) {
      if (select.selectedIndex === i) return;
      select.selectedIndex = i;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      syncLabel();
    }

    function open() {
      if (trigger.disabled) return;
      buildOptions();
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      var activeEl = panel.children[activeIndex] || panel.children[0];
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeyDown);
    }

    function close() {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onKeyDown);
    }

    function onDocClick(e) {
      if (!wrap.contains(e.target)) close();
    }

    function moveActive(delta) {
      var items = Array.prototype.filter.call(panel.children, function (li) {
        return !li.classList.contains('is-disabled');
      });
      if (!items.length) return;
      var current = panel.children[activeIndex];
      var idx = items.indexOf(current);
      idx = (idx + delta + items.length) % items.length;
      var target = items[idx];
      activeIndex = Array.prototype.indexOf.call(panel.children, target);
      Array.prototype.forEach.call(panel.children, function (li) { li.classList.remove('is-active'); });
      target.classList.add('is-active');
      target.scrollIntoView({ block: 'nearest' });
    }

    function onKeyDown(e) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveActive(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveActive(-1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeIndex > -1) {
            selectIndex(activeIndex);
            close();
            trigger.focus();
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          trigger.focus();
          break;
        case 'Tab':
          close();
          break;
      }
    }

    trigger.addEventListener('click', function () {
      if (wrap.classList.contains('is-open')) {
        close();
      } else {
        open();
      }
    });

    // Keep in sync when another script adds/replaces <option>s
    // (e.g. country/state lists populated after a fetch) or
    // toggles the disabled attribute (e.g. state/city unlocking
    // once a country is picked).
    var observer = new MutationObserver(function (mutations) {
      var optionsChanged = false;
      mutations.forEach(function (m) {
        if (m.type === 'childList') optionsChanged = true;
        if (m.type === 'attributes' && m.attributeName === 'disabled') {
          trigger.disabled = select.disabled;
          wrap.classList.toggle('is-disabled', select.disabled);
        }
      });
      if (optionsChanged) buildOptions();
    });
    observer.observe(select, { childList: true, attributes: true, attributeFilter: ['disabled'] });

    // Keep in sync when another script sets `select.value = ...`
    // directly (a common pattern for prefilling saved data),
    // which doesn't fire a MutationObserver on its own.
    var proto = Object.getPrototypeOf(select);
    var valueDescriptor = Object.getOwnPropertyDescriptor(proto, 'value')
      || Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
    if (valueDescriptor && valueDescriptor.configurable) {
      Object.defineProperty(select, 'value', {
        get: function () {
          return valueDescriptor.get.call(select);
        },
        set: function (v) {
          valueDescriptor.set.call(select, v);
          syncLabel();
        },
        configurable: true
      });
    }

    select.addEventListener('change', syncLabel);

    buildOptions();
  }

  function init(root) {
    var scope = root || document;
    // data-no-enhance lets a specific <select> opt out if it ever needs to
    scope.querySelectorAll('select:not([data-no-enhance])').forEach(enhance);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }

  // Exposed so other scripts can (re)enhance selects added later,
  // e.g. inside content injected by header.js/footer.js.
  window.BlegabCustomSelect = { enhance: enhance, init: init };
})();