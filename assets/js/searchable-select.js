/* =========================================================
   BLEGAB SEARCHABLE SELECT
   Works with normal <select> elements.

   Behaviour:
   - Click field -> full dropdown opens
   - Type -> options filter immediately
   - Select option -> native select gets updated
   - Native change event is fired
   - Works with dynamically rebuilt state lists
   ========================================================= */

(function () {

  "use strict";


  var instances = new WeakMap();


  /* =====================================================
     CREATE
     ===================================================== */

  function create(select) {

    if (!select) return null;


    /*
     * If already converted, simply refresh it.
     */
    if (instances.has(select)) {

      refresh(select);

      return instances.get(select);

    }


    var wrapper =
      document.createElement("div");

    wrapper.className =
      "blegab-search-select";


    var input =
      document.createElement("input");

    input.type = "text";

    input.className =
      "blegab-search-select__input";

    input.autocomplete =
      "off";

    input.spellcheck =
      false;


    var arrow =
      document.createElement("span");

    arrow.className =
      "blegab-search-select__arrow";

    arrow.innerHTML =
      "⌄";


    var menu =
      document.createElement("div");

    menu.className =
      "blegab-search-select__menu";

    menu.setAttribute(
      "role",
      "listbox"
    );


    /*
     * Keep the real select in the DOM.
     * It remains the actual form value.
     */
    select.classList.add(
      "blegab-search-select__native"
    );


    select.parentNode.insertBefore(
      wrapper,
      select
    );


    wrapper.appendChild(
      input
    );

    wrapper.appendChild(
      arrow
    );

    wrapper.appendChild(
      menu
    );

    wrapper.appendChild(
      select
    );


    var instance = {

      select: select,

      wrapper: wrapper,

      input: input,

      menu: menu,

      options: []

    };


    instances.set(
      select,
      instance
    );


    /* ===================================================
       INPUT
       =================================================== */

    input.addEventListener(
      "focus",
      function () {

        open(select);

      }
    );


    input.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();

        open(select);

      }
    );


    input.addEventListener(
      "input",
      function () {

        open(select);

        render(
          select,
          input.value
        );

      }
    );


    /* ===================================================
       KEYBOARD
       =================================================== */

    input.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape"
        ) {

          close(select);

          input.blur();

          return;
        }


        if (
          event.key === "ArrowDown"
        ) {

          event.preventDefault();

          moveActive(
            select,
            1
          );

          return;
        }


        if (
          event.key === "ArrowUp"
        ) {

          event.preventDefault();

          moveActive(
            select,
            -1
          );

          return;
        }


        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          selectActive(
            select
          );

        }

      }
    );


    /*
     * Native select change.
     * This is important because your existing
     * checkout/profile code listens to change.
     */
    select.addEventListener(
      "change",
      function () {

        syncInput(select);

      }
    );


    refresh(select);


    return instance;

  }


  /* =====================================================
     REFRESH
     ===================================================== */

  function refresh(select) {

    if (!select) return;


    var instance =
      instances.get(select);


    if (!instance) {

      instance =
        create(select);

    }


    if (!instance) return;


    var options =
      Array.prototype.slice.call(
        select.options
      );


    instance.options =
      options;


    syncInput(select);


    /*
     * If dropdown is currently open,
     * rebuild its filtered results.
     */
    if (
      instance.wrapper.classList.contains(
        "is-open"
      )
    ) {

      render(
        select,
        instance.input.value
      );

    }

  }


  /* =====================================================
     OPEN
     ===================================================== */

  function open(select) {

    var instance =
      instances.get(select);

    if (!instance) return;


    if (
      select.disabled
    ) {
      return;
    }


    instance.wrapper.classList.add(
      "is-open"
    );


    /*
     * On opening with an existing selected value,
     * select all text so typing immediately replaces it.
     */
    if (
      instance.input.value
    ) {

      instance.input.select();

    }


    render(
      select,
      instance.input.value
    );

  }


  /* =====================================================
     CLOSE
     ===================================================== */

  function close(select) {

    var instance =
      instances.get(select);

    if (!instance) return;


    instance.wrapper.classList.remove(
      "is-open"
    );


    syncInput(select);

  }


  /* =====================================================
     SYNC INPUT
     ===================================================== */

  function syncInput(select) {

    var instance =
      instances.get(select);

    if (!instance) return;


    var option =
      select.options[
        select.selectedIndex
      ];


    if (
      option &&
      option.value
    ) {

      instance.input.value =
        option.textContent.trim();

    } else {

      instance.input.value =
        "";

    }


    /*
     * Disabled state follows the native select.
     */

    instance.input.disabled =
      !!select.disabled;

  }


  /* =====================================================
     RENDER FILTERED OPTIONS
     ===================================================== */

  function render(
    select,
    searchTerm
  ) {

    var instance =
      instances.get(select);

    if (!instance) return;


    var term =
      String(
        searchTerm || ""
      )
        .trim()
        .toLowerCase();


    instance.menu.innerHTML =
      "";


    var found =
      false;


    instance.options.forEach(
      function (option) {

        /*
         * Do not show the placeholder
         * as a searchable result.
         */
        if (
          !option.value
        ) {
          return;
        }


        var text =
          option.textContent
            .trim();


        if (
          term &&
          text.toLowerCase()
            .indexOf(term) === -1
        ) {

          return;

        }


        found = true;


        var button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "blegab-search-select__option";


        button.textContent =
          text;


        button.dataset.value =
          option.value;


        button.addEventListener(
          "mousedown",
          function (event) {

            /*
             * Prevent the input from
             * losing focus before selection.
             */
            event.preventDefault();

          }
        );


        button.addEventListener(
          "click",
          function (event) {

            event.preventDefault();

            choose(
              select,
              option.value
            );

          }
        );


        instance.menu.appendChild(
          button
        );

      }
    );


    if (!found) {

      var empty =
        document.createElement(
          "div"
        );

      empty.className =
        "blegab-search-select__empty";

      empty.textContent =
        "No matches found";


      instance.menu.appendChild(
        empty
      );

    }

  }


  /* =====================================================
     CHOOSE
     ===================================================== */

  function choose(
    select,
    value
  ) {

    var instance =
      instances.get(select);

    if (!instance) return;


    var exists =
      Array.prototype.some.call(
        select.options,
        function (option) {
          return option.value === value;
        }
      );


    if (!exists) {
      return;
    }


    select.value =
      value;


    syncInput(select);


    /*
     * Fire the real native change event.
     * Existing checkout/profile logic continues
     * to work without modification.
     */
    select.dispatchEvent(
      new Event(
        "change",
        {
          bubbles: true
        }
      )
    );


    close(select);

  }


  /* =====================================================
     ACTIVE OPTION
     ===================================================== */

  function moveActive(
    select,
    direction
  ) {

    var instance =
      instances.get(select);

    if (!instance) return;


    var buttons =
      instance.menu.querySelectorAll(
        ".blegab-search-select__option"
      );


    if (!buttons.length) {
      return;
    }


    var active =
      instance.menu.querySelector(
        ".is-active"
      );


    var current =
      -1;


    if (active) {

      current =
        Array.prototype.indexOf.call(
          buttons,
          active
        );

    }


    var next =
      current + direction;


    if (
      next < 0
    ) {

      next =
        buttons.length - 1;

    }


    if (
      next >= buttons.length
    ) {

      next = 0;

    }


    buttons.forEach(
      function (button) {

        button.classList.remove(
          "is-active"
        );

      }
    );


    buttons[next].classList.add(
      "is-active"
    );


    buttons[next].scrollIntoView({
      block: "nearest"
    });

  }


  /* =====================================================
     SELECT ACTIVE
     ===================================================== */

  function selectActive(
    select
  ) {

    var instance =
      instances.get(select);

    if (!instance) return;


    var active =
      instance.menu.querySelector(
        ".is-active"
      );


    if (active) {

      choose(
        select,
        active.dataset.value
      );

      return;

    }


    /*
     * If there is only one filtered result,
     * Enter selects it automatically.
     */
    var buttons =
      instance.menu.querySelectorAll(
        ".blegab-search-select__option"
      );


    if (
      buttons.length === 1
    ) {

      choose(
        select,
        buttons[0].dataset.value
      );

    }

  }


  /* =====================================================
     CLOSE WHEN CLICKING OUTSIDE
     ===================================================== */

  document.addEventListener(
    "click",
    function (event) {

      document
        .querySelectorAll(
          ".blegab-search-select.is-open"
        )
        .forEach(
          function (wrapper) {

            if (
              !wrapper.contains(
                event.target
              )
            ) {

              var select =
                wrapper.querySelector(
                  "select"
                );


              if (select) {

                close(select);

              }

            }

          }
        );

    }
  );


  /* =====================================================
     PUBLIC API
     ===================================================== */

  window.BlegabSearchableSelect = {

    create: create,

    refresh: refresh,

    open: open,

    close: close

  };


})();