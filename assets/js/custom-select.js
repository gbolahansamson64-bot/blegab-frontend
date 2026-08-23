/* =========================================================
   BLEGAB LUXURY WIGS — SEARCHABLE CUSTOM SELECT

   - Uses the EXISTING dropdown
   - NO second/top input
   - Search box is INSIDE the opened dropdown panel
   - Click dropdown -> search field appears inside it
   - Type -> options filter immediately
   - Click option -> selects it
   - Supports dynamically populated country/state selects
   ========================================================= */

(function () {
  'use strict';

  function enhance(select) {

    if (select.dataset.customSelectReady) {
      return select._blegabCustomSelect || null;
    }

    select.dataset.customSelectReady = 'true';

    /* =====================================================
       WRAPPER
       ===================================================== */

    var wrap = document.createElement('div');
    wrap.className = 'select-wrap';

    if (select.disabled) {
      wrap.classList.add('is-disabled');
    }

    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    select.classList.add('select-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');


    /* =====================================================
       TRIGGER
       ===================================================== */

    var trigger = document.createElement('button');

    trigger.type = 'button';
    trigger.className = 'select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.disabled = select.disabled;

    if (select.id) {
      trigger.setAttribute(
        'aria-label',
        select.getAttribute('aria-label') || select.id
      );
    }


    var labelSpan = document.createElement('span');
    labelSpan.className = 'select-trigger__label';

    trigger.appendChild(labelSpan);


    var chevron = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );

    chevron.setAttribute(
      'viewBox',
      '0 0 24 24'
    );

    chevron.setAttribute(
      'class',
      'select-trigger__chevron'
    );

    chevron.setAttribute(
      'aria-hidden',
      'true'
    );

    chevron.innerHTML =
      '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

    trigger.appendChild(chevron);

    wrap.appendChild(trigger);


    /* =====================================================
       DROPDOWN PANEL
       ===================================================== */

    var panel = document.createElement('div');

    panel.className = 'select-panel';

    panel.setAttribute(
      'role',
      'listbox'
    );

    panel.tabIndex = -1;

    wrap.appendChild(panel);


    /* =====================================================
       SEARCH AREA — INSIDE THE SAME DROPDOWN
       ===================================================== */

    var searchWrap = document.createElement('div');

    searchWrap.className =
      'select-panel__search';


    var searchIcon = document.createElement('span');

    searchIcon.className =
      'select-panel__search-icon';

    searchIcon.innerHTML = '⌕';


    var searchInput = document.createElement('input');

    searchInput.type = 'text';

    searchInput.className =
      'select-panel__search-input';

    searchInput.placeholder =
      'Type to search...';

    searchInput.autocomplete =
      'off';

    searchInput.spellcheck =
      false;

    searchInput.setAttribute(
      'aria-label',
      'Search options'
    );


    searchWrap.appendChild(searchIcon);
    searchWrap.appendChild(searchInput);

    panel.appendChild(searchWrap);


    /* =====================================================
       OPTIONS CONTAINER
       ===================================================== */

    var optionsContainer =
      document.createElement('div');

    optionsContainer.className =
      'select-panel__options';

    panel.appendChild(
      optionsContainer
    );


    var activeIndex = -1;


    /* =====================================================
       SYNC LABEL
       ===================================================== */

    function syncLabel() {

      var opt =
        select.options[
          select.selectedIndex
        ];


      labelSpan.textContent =
        opt ? opt.textContent : '';


      labelSpan.classList.toggle(
        'is-placeholder',
        !!opt && opt.value === ''
      );


      Array.prototype.forEach.call(
        optionsContainer.children,
        function (item) {

          var optionIndex =
            Number(
              item.dataset.index
            );

          item.classList.toggle(
            'is-selected',
            optionIndex ===
              select.selectedIndex
          );

        }
      );


      activeIndex =
        select.selectedIndex;

    }


    /* =====================================================
       BUILD OPTIONS
       ===================================================== */

    function buildOptions(
      searchTerm
    ) {

      optionsContainer.innerHTML =
        '';


      var options =
        Array.prototype.slice.call(
          select.options
        );


      var term =
        String(
          searchTerm || ''
        )
          .trim()
          .toLowerCase();


      var visibleCount = 0;


      options.forEach(
        function (opt, i) {

          /*
           * Hide placeholder from search results.
           */
          if (
            !opt.value
          ) {

            return;

          }


          var text =
            opt.textContent.trim();


          /*
           * FILTER
           */
          if (
            term &&
            text
              .toLowerCase()
              .indexOf(term) === -1
          ) {

            return;

          }


          visibleCount++;


          var li =
            document.createElement('div');


          li.className =
            'select-option';


          li.setAttribute(
            'role',
            'option'
          );


          li.dataset.index =
            String(i);


          li.textContent =
            text;


          if (opt.disabled) {

            li.classList.add(
              'is-disabled'
            );

          }


          if (
            i ===
            select.selectedIndex
          ) {

            li.classList.add(
              'is-selected'
            );

            activeIndex =
              i;

          }


          li.addEventListener(
            'mousedown',
            function (e) {

              /*
               * Prevent search input from
               * losing focus before selection.
               */
              e.preventDefault();

            }
          );


          li.addEventListener(
            'click',
            function () {

              if (
                opt.disabled
              ) {

                return;

              }


              selectIndex(i);

              close();

              trigger.focus();

            }
          );


          optionsContainer.appendChild(
            li
          );

        }
      );


      /*
       * No results
       */

      if (
        visibleCount === 0
      ) {

        var empty =
          document.createElement('div');

        empty.className =
          'select-option select-option--empty';

        empty.textContent =
          'No matches found';

        optionsContainer.appendChild(
          empty
        );

      }


      syncLabel();

    }


    /* =====================================================
       SELECT OPTION
       ===================================================== */

    function selectIndex(i) {

      if (
        i < 0 ||
        i >= select.options.length
      ) {

        return;

      }


      if (
        select.options[i].disabled
      ) {

        return;

      }


      var changed =
        select.selectedIndex !== i;


      select.selectedIndex =
        i;


      syncLabel();


      if (changed) {

        select.dispatchEvent(
          new Event(
            'change',
            {
              bubbles: true
            }
          )
        );

      }

    }


    /* =====================================================
       OPEN
       ===================================================== */

    function open() {

      if (
        trigger.disabled
      ) {

        return;

      }


      /*
       * Always rebuild because country/state
       * options can change dynamically.
       */
      searchInput.value = '';

      buildOptions('');


      wrap.classList.add(
        'is-open'
      );


      trigger.setAttribute(
        'aria-expanded',
        'true'
      );


      /*
       * Put cursor directly inside the
       * SEARCH FIELD that is INSIDE
       * the opened dropdown.
       */
      setTimeout(
        function () {

          searchInput.focus();

        },
        0
      );


      document.addEventListener(
        'click',
        onDocClick,
        true
      );


      document.addEventListener(
        'keydown',
        onKeyDown
      );

    }


    /* =====================================================
       CLOSE
       ===================================================== */

    function close() {

      wrap.classList.remove(
        'is-open'
      );


      trigger.setAttribute(
        'aria-expanded',
        'false'
      );


      searchInput.value =
        '';


      document.removeEventListener(
        'click',
        onDocClick,
        true
      );


      document.removeEventListener(
        'keydown',
        onKeyDown
      );

    }


    /* =====================================================
       OUTSIDE CLICK
       ===================================================== */

    function onDocClick(e) {

      if (
        !wrap.contains(
          e.target
        )
      ) {

        close();

      }

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    searchInput.addEventListener(
      'input',
      function () {

        buildOptions(
          searchInput.value
        );

      }
    );


    searchInput.addEventListener(
      'click',
      function (e) {

        e.stopPropagation();

      }
    );


    searchInput.addEventListener(
      'mousedown',
      function (e) {

        e.stopPropagation();

      }
    );


    /* =====================================================
       KEYBOARD
       ===================================================== */

    function moveActive(delta) {

      var items =
        Array.prototype.filter.call(
          optionsContainer.children,
          function (li) {

            return (
              !li.classList.contains(
                'is-disabled'
              ) &&
              !li.classList.contains(
                'select-option--empty'
              )
            );

          }
        );


      if (
        !items.length
      ) {

        return;

      }


      var current =
        optionsContainer.querySelector(
          '.is-active'
        );


      var idx =
        current
          ? items.indexOf(current)
          : -1;


      idx =
        (
          idx +
          delta +
          items.length
        ) %
        items.length;


      items.forEach(
        function (li) {

          li.classList.remove(
            'is-active'
          );

        }
      );


      items[idx].classList.add(
        'is-active'
      );


      items[idx].scrollIntoView({
        block: 'nearest'
      });

    }


    function selectActive() {

      var active =
        optionsContainer.querySelector(
          '.is-active'
        );


      if (active) {

        selectIndex(
          Number(
            active.dataset.index
          )
        );

        close();

        trigger.focus();

        return;

      }


      /*
       * If only one result remains,
       * Enter selects it.
       */

      var items =
        optionsContainer.querySelectorAll(
          '.select-option:not(.select-option--empty):not(.is-disabled)'
        );


      if (
        items.length === 1
      ) {

        selectIndex(
          Number(
            items[0].dataset.index
          )
        );

        close();

        trigger.focus();

      }

    }


    function onKeyDown(e) {

      switch (
        e.key
      ) {

        case 'ArrowDown':

          e.preventDefault();

          moveActive(1);

          break;


        case 'ArrowUp':

          e.preventDefault();

          moveActive(-1);

          break;


        case 'Enter':

          e.preventDefault();

          selectActive();

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


    /* =====================================================
       TRIGGER CLICK
       ===================================================== */

    trigger.addEventListener(
      'click',
      function () {

        if (
          wrap.classList.contains(
            'is-open'
          )
        ) {

          close();

        } else {

          open();

        }

      }
    );


    /* =====================================================
       REFRESH
       ===================================================== */

    function refresh() {

      trigger.disabled =
        select.disabled;


      wrap.classList.toggle(
        'is-disabled',
        select.disabled
      );


      /*
       * If options changed while open,
       * rebuild them.
       */

      if (
        wrap.classList.contains(
          'is-open'
        )
      ) {

        buildOptions(
          searchInput.value
        );

      } else {

        buildOptions('');

      }


      if (
        select.disabled
      ) {

        close();

      }

    }


    /* =====================================================
       OBSERVE SELECT CHANGES
       ===================================================== */

    var observer =
      new MutationObserver(
        function () {

          refresh();

        }
      );


    observer.observe(
      select,
      {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          'disabled',
          'selected'
        ]
      }
    );


    /* =====================================================
       PROGRAMMATIC VALUE CHANGES
       ===================================================== */

    var proto =
      Object.getPrototypeOf(
        select
      );


    var valueDescriptor =
      Object.getOwnPropertyDescriptor(
        proto,
        'value'
      ) ||
      Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value'
      );


    if (
      valueDescriptor &&
      valueDescriptor.configurable
    ) {

      Object.defineProperty(
        select,
        'value',
        {

          get: function () {

            return valueDescriptor.get.call(
              select
            );

          },


          set: function (v) {

            valueDescriptor.set.call(
              select,
              v
            );


            syncLabel();

          },


          configurable: true

        }
      );

    }


    /* =====================================================
       NATIVE CHANGE
       ===================================================== */

    select.addEventListener(
      'change',
      function () {

        syncLabel();

      }
    );


    /* =====================================================
       INITIAL BUILD
       ===================================================== */

    buildOptions('');


    /* =====================================================
       API
       ===================================================== */

    var api = {

      refresh: refresh,

      open: open,

      close: close,

      trigger: trigger,

      panel: panel

    };


    select._blegabCustomSelect =
      api;


    return api;

  }


  /* =========================================================
     INITIALIZE ALL SELECTS
     ========================================================= */

  function init(root) {

    var scope =
      root || document;


    scope
      .querySelectorAll(
        'select:not([data-no-enhance])'
      )
      .forEach(
        enhance
      );

  }


  /* =========================================================
     REFRESH
     ========================================================= */

  function refresh(select) {

    if (!select) {
      return;
    }


    var instance =
      select._blegabCustomSelect;


    if (instance) {

      instance.refresh();

    } else {

      enhance(select);

    }

  }


  /* =========================================================
     START
     ========================================================= */

  function start() {

    init(document);

  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      start
    );

  } else {

    start();

  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.BlegabCustomSelect = {

    enhance: enhance,

    init: init,

    refresh: refresh

  };

})();