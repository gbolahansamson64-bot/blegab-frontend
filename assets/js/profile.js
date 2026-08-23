/* =========================================================
   BLEGAB LUXURY WIGS — PROFILE PAGE
   FRONTEND-ONLY VERSION
   - No backend requests
   - Country dropdown loads all countries
   - State dropdown works after country selection
   - City field works after state selection
   - Profile data saved to localStorage
   - Profile image uploads as base64 to localStorage
   ========================================================= */


var PROFILE_API_URL = "https://api.blegab.com/api/auth/profile";

var ME_API_URL = "https://api.blegab.com/api/auth/me";

var AUTH_API_URL = "https://api.blegab.com/api/auth";

var Country = null;
var State = null;
var City = null;

var ALL_COUNTRIES = [];

/* =========================================================
   COUNTRY / STATE / CITY LIBRARY
   ========================================================= */

async function loadLocationLibrary() {
  try {
    var csc = await import(
      "https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/+esm"
    );

    Country = csc.Country;
    State = csc.State;
    City = csc.City;

    ALL_COUNTRIES = Country.getAllCountries() || [];

    initLocationFields();

  } catch (error) {
    console.error(
      "BLEGAB: country-state-city failed to load.",
      error
    );

    /*
     * Do not leave the country dropdown empty if the CDN
     * fails. Use the browser's Intl region list as fallback.
     */
    loadFallbackCountries();
    initLocationFields();
  }
}


/* =========================================================
   FALLBACK COUNTRY LIST
   ========================================================= */

function loadFallbackCountries() {

  var fallback = [
    ["AF","Afghanistan"],
    ["AL","Albania"],
    ["DZ","Algeria"],
    ["AD","Andorra"],
    ["AO","Angola"],
    ["AG","Antigua and Barbuda"],
    ["AR","Argentina"],
    ["AM","Armenia"],
    ["AU","Australia"],
    ["AT","Austria"],
    ["AZ","Azerbaijan"],
    ["BS","Bahamas"],
    ["BH","Bahrain"],
    ["BD","Bangladesh"],
    ["BB","Barbados"],
    ["BY","Belarus"],
    ["BE","Belgium"],
    ["BZ","Belize"],
    ["BJ","Benin"],
    ["BT","Bhutan"],
    ["BO","Bolivia"],
    ["BA","Bosnia and Herzegovina"],
    ["BW","Botswana"],
    ["BR","Brazil"],
    ["BN","Brunei"],
    ["BG","Bulgaria"],
    ["BF","Burkina Faso"],
    ["BI","Burundi"],
    ["CV","Cabo Verde"],
    ["KH","Cambodia"],
    ["CM","Cameroon"],
    ["CA","Canada"],
    ["CF","Central African Republic"],
    ["TD","Chad"],
    ["CL","Chile"],
    ["CN","China"],
    ["CO","Colombia"],
    ["KM","Comoros"],
    ["CG","Congo"],
    ["CD","Democratic Republic of the Congo"],
    ["CR","Costa Rica"],
    ["CI","Côte d'Ivoire"],
    ["HR","Croatia"],
    ["CU","Cuba"],
    ["CY","Cyprus"],
    ["CZ","Czech Republic"],
    ["DK","Denmark"],
    ["DJ","Djibouti"],
    ["DM","Dominica"],
    ["DO","Dominican Republic"],
    ["EC","Ecuador"],
    ["EG","Egypt"],
    ["SV","El Salvador"],
    ["GQ","Equatorial Guinea"],
    ["ER","Eritrea"],
    ["EE","Estonia"],
    ["SZ","Eswatini"],
    ["ET","Ethiopia"],
    ["FJ","Fiji"],
    ["FI","Finland"],
    ["FR","France"],
    ["GA","Gabon"],
    ["GM","Gambia"],
    ["GE","Georgia"],
    ["DE","Germany"],
    ["GH","Ghana"],
    ["GR","Greece"],
    ["GD","Grenada"],
    ["GT","Guatemala"],
    ["GN","Guinea"],
    ["GW","Guinea-Bissau"],
    ["GY","Guyana"],
    ["HT","Haiti"],
    ["HN","Honduras"],
    ["HU","Hungary"],
    ["IS","Iceland"],
    ["IN","India"],
    ["ID","Indonesia"],
    ["IR","Iran"],
    ["IQ","Iraq"],
    ["IE","Ireland"],
    ["IL","Israel"],
    ["IT","Italy"],
    ["JM","Jamaica"],
    ["JP","Japan"],
    ["JO","Jordan"],
    ["KZ","Kazakhstan"],
    ["KE","Kenya"],
    ["KI","Kiribati"],
    ["KP","North Korea"],
    ["KR","South Korea"],
    ["KW","Kuwait"],
    ["KG","Kyrgyzstan"],
    ["LA","Laos"],
    ["LV","Latvia"],
    ["LB","Lebanon"],
    ["LS","Lesotho"],
    ["LR","Liberia"],
    ["LY","Libya"],
    ["LI","Liechtenstein"],
    ["LT","Lithuania"],
    ["LU","Luxembourg"],
    ["MG","Madagascar"],
    ["MW","Malawi"],
    ["MY","Malaysia"],
    ["MV","Maldives"],
    ["ML","Mali"],
    ["MT","Malta"],
    ["MH","Marshall Islands"],
    ["MR","Mauritania"],
    ["MU","Mauritius"],
    ["MX","Mexico"],
    ["FM","Micronesia"],
    ["MD","Moldova"],
    ["MC","Monaco"],
    ["MN","Mongolia"],
    ["ME","Montenegro"],
    ["MA","Morocco"],
    ["MZ","Mozambique"],
    ["MM","Myanmar"],
    ["NA","Namibia"],
    ["NR","Nauru"],
    ["NP","Nepal"],
    ["NL","Netherlands"],
    ["NZ","New Zealand"],
    ["NI","Nicaragua"],
    ["NE","Niger"],
    ["NG","Nigeria"],
    ["MK","North Macedonia"],
    ["NO","Norway"],
    ["OM","Oman"],
    ["PK","Pakistan"],
    ["PW","Palau"],
    ["PA","Panama"],
    ["PG","Papua New Guinea"],
    ["PY","Paraguay"],
    ["PE","Peru"],
    ["PH","Philippines"],
    ["PL","Poland"],
    ["PT","Portugal"],
    ["QA","Qatar"],
    ["RO","Romania"],
    ["RU","Russia"],
    ["RW","Rwanda"],
    ["KN","Saint Kitts and Nevis"],
    ["LC","Saint Lucia"],
    ["VC","Saint Vincent and the Grenadines"],
    ["WS","Samoa"],
    ["SM","San Marino"],
    ["ST","Sao Tome and Principe"],
    ["SA","Saudi Arabia"],
    ["SN","Senegal"],
    ["RS","Serbia"],
    ["SC","Seychelles"],
    ["SL","Sierra Leone"],
    ["SG","Singapore"],
    ["SK","Slovakia"],
    ["SI","Slovenia"],
    ["SB","Solomon Islands"],
    ["SO","Somalia"],
    ["ZA","South Africa"],
    ["SS","South Sudan"],
    ["ES","Spain"],
    ["LK","Sri Lanka"],
    ["SD","Sudan"],
    ["SR","Suriname"],
    ["SE","Sweden"],
    ["CH","Switzerland"],
    ["SY","Syria"],
    ["TW","Taiwan"],
    ["TJ","Tajikistan"],
    ["TZ","Tanzania"],
    ["TH","Thailand"],
    ["TL","Timor-Leste"],
    ["TG","Togo"],
    ["TO","Tonga"],
    ["TT","Trinidad and Tobago"],
    ["TN","Tunisia"],
    ["TR","Turkey"],
    ["TM","Turkmenistan"],
    ["TV","Tuvalu"],
    ["UG","Uganda"],
    ["UA","Ukraine"],
    ["AE","United Arab Emirates"],
    ["GB","United Kingdom"],
    ["US","United States"],
    ["UY","Uruguay"],
    ["UZ","Uzbekistan"],
    ["VU","Vanuatu"],
    ["VA","Vatican City"],
    ["VE","Venezuela"],
    ["VN","Vietnam"],
    ["YE","Yemen"],
    ["ZM","Zambia"],
    ["ZW","Zimbabwe"]
  ];

  ALL_COUNTRIES = fallback.map(function (item) {
    return {
      isoCode: item[0],
      name: item[1]
    };
  });
}


/* =========================================================
   HELPERS
   ========================================================= */

function refreshCustomSelect(select) {

  if (
    window.BlegabSearchableSelect &&
    typeof window.BlegabSearchableSelect.refresh === "function"
  ) {
    window.BlegabSearchableSelect.refresh(select);
  }
}


function normalizeCountry(value) {

  var raw = String(value || "")
    .trim()
    .toLowerCase();

  if (!raw) return "";

  var match = ALL_COUNTRIES.find(function (country) {

    return (
      String(country.isoCode).toLowerCase() === raw ||
      String(country.name).toLowerCase() === raw
    );

  });

  return match
    ? match.isoCode
    : "";
}


function normalizeState(countryIso, value) {

  if (!countryIso || !value || !State) {
    return "";
  }

  var raw = String(value)
    .trim()
    .toLowerCase();

  var states =
    State.getStatesOfCountry(countryIso) || [];

  var match = states.find(function (state) {

    return (
      String(state.isoCode || "").toLowerCase() === raw ||
      String(state.name || "").toLowerCase() === raw
    );

  });

  return match
    ? match.isoCode
    : "";
}


/* =========================================================
   LOCATION FIELDS
   ========================================================= */

function initLocationFields() {

  var phoneCodeSelect =
    document.getElementById("phoneCode");

  var countrySelect =
    document.getElementById("country");

  var stateSelect =
    document.getElementById("state");

  var citySelect =
    document.getElementById("city");

  var cityList =
    document.getElementById("cityList");


  if (
    !countrySelect ||
    !stateSelect ||
    !citySelect
  ) {
    return;
  }


  /* =====================================================
     COUNTRY DROPDOWN
     ===================================================== */

  countrySelect.innerHTML =
    '<option value="">Select a country</option>' +

    ALL_COUNTRIES
      .slice()
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      })
      .map(function (country) {

        return (
          '<option value="' +
          country.isoCode +
          '">' +
          country.name +
          "</option>"
        );

      })
      .join("");


  countrySelect.disabled = false;

  refreshCustomSelect(countrySelect);


  /* =====================================================
     PHONE COUNTRY CODE
     ===================================================== */

  if (phoneCodeSelect) {

    phoneCodeSelect.innerHTML =
      '<option value="">Country</option>' +

      ALL_COUNTRIES
        .filter(function (country) {
          return !!country.phonecode;
        })
        .map(function (country) {

          return (
            '<option value="' +
            country.isoCode +
            '" data-phonecode="' +
            country.phonecode +
            '">' +
            country.name +
            "</option>"
          );

        })
        .join("");


    phoneCodeSelect.disabled = false;

    refreshCustomSelect(phoneCodeSelect);


    phoneCodeSelect.addEventListener(
      "change",
      function () {

        var option =
          phoneCodeSelect.selectedOptions[0];

        var code =
          option
            ? option.dataset.phonecode
            : "";


        var phonePrefix =
          document.querySelector(
            "[data-phone-prefix]"
          );

        var phoneInput =
          document.getElementById("phone");


        if (
          code &&
          phonePrefix &&
          phoneInput
        ) {

          phonePrefix.textContent =
            "+" + code;

          phonePrefix.hidden = false;

          phoneInput.classList.add(
            "has-prefix"
          );

        } else if (
          phonePrefix &&
          phoneInput
        ) {

          phonePrefix.hidden = true;

          phoneInput.classList.remove(
            "has-prefix"
          );
        }


        if (phoneCodeSelect.value) {

          countrySelect.value =
            phoneCodeSelect.value;

          fillStates(
            countrySelect.value
          );

          refreshCustomSelect(
            countrySelect
          );
        }

      }
    );
  }


  /* =====================================================
     COUNTRY CHANGE
     ===================================================== */

  countrySelect.addEventListener(
    "change",
    function () {

      var country =
        countrySelect.value;


      fillStates(country);


      citySelect.value = "";

      clearCities();


      refreshCustomSelect(
        countrySelect
      );

    }
  );


  /* =====================================================
     STATE CHANGE
     ===================================================== */

  stateSelect.addEventListener(
    "change",
    function () {

      fillCities(
        countrySelect.value,
        stateSelect.value
      );


      refreshCustomSelect(
        stateSelect
      );

    }
  );


  /* =====================================================
     FILL STATES
     ===================================================== */

  function fillStates(countryIso) {

    /*
     * ALWAYS reset first.
     */
    stateSelect.innerHTML =
      '<option value="">Select a state / region</option>';

stateSelect.disabled = false;

refreshCustomSelect(stateSelect);

if (!countryIso) {

      clearCities();

      return;
    }


    var states = [];


    if (State) {

      states =
        State.getStatesOfCountry(
          countryIso
        ) || [];

    }


    /*
     * If the selected country has states,
     * populate and ENABLE the dropdown.
     */

    if (states.length) {

      stateSelect.innerHTML =
        '<option value="">Select a state / region</option>' +

        states
          .slice()
          .sort(function (a, b) {
            return a.name.localeCompare(b.name);
          })
          .map(function (state) {

            return (
              '<option value="' +
              state.isoCode +
              '">' +
              state.name +
              "</option>"
            );

          })
          .join("");


      stateSelect.disabled = false;


    } else {

      /*
       * Countries without states should NOT leave
       * the field permanently dead.
       *
       * Keep it usable as a free-text state/region field.
       */

      stateSelect.innerHTML =
        '<option value="">Enter state / region</option>';

      stateSelect.disabled = false;
    }


    refreshCustomSelect(stateSelect);

  }


  /* =====================================================
     CLEAR CITIES
     ===================================================== */

  function clearCities() {

    citySelect.value = "";

    citySelect.disabled = true;

    citySelect.placeholder =
      "Select a state first";


    if (cityList) {
      cityList.innerHTML = "";
    }

  }


  /* =====================================================
     FILL CITIES
     ===================================================== */

  function fillCities(
    countryIso,
    stateIso
  ) {

    if (
      !countryIso ||
      !stateIso ||
      !City
    ) {

      citySelect.disabled = false;

      citySelect.placeholder =
        "Enter your city";

      if (cityList) {
        cityList.innerHTML = "";
      }

      return;
    }


    var cities =
      City.getCitiesOfState(
        countryIso,
        stateIso
      ) || [];


    if (cityList) {

      cityList.innerHTML =
        cities
          .slice()
          .sort(function (a, b) {
            return a.name.localeCompare(b.name);
          })
          .map(function (city) {

            return (
              '<option value="' +
              String(city.name)
                .replace(/"/g, "&quot;") +
              '"></option>'
            );

          })
          .join("");
    }


    citySelect.disabled = false;

    citySelect.placeholder =
      cities.length
        ? "Select or type a city"
        : "Enter your city";

  }


  /*
   * Expose these for profile loading.
   */

  window.BLEGAB_FILL_STATES =
    fillStates;

  window.BLEGAB_FILL_CITIES =
    fillCities;

  window.BLEGAB_NORMALIZE_COUNTRY =
    normalizeCountry;

  window.BLEGAB_NORMALIZE_STATE =
    normalizeState;


  refreshCustomSelect(countrySelect);
  refreshCustomSelect(stateSelect);

  if (phoneCodeSelect) {
    refreshCustomSelect(phoneCodeSelect);
  }
}


/* =========================================================
   VALIDATION
   ========================================================= */

var EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

var REQUIRED_FIELD_KEYS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "country",
  "state",
  "city",
  "address"
];

var touchedFields = {};


function validateFields() {

  var allValid = true;


  document
    .querySelectorAll("[data-field]")
    .forEach(function (el) {

      var key =
        el.dataset.field;

      var value =
        (el.value || "").trim();

      var isRequired =
        REQUIRED_FIELD_KEYS.indexOf(key) !== -1;

      var isMissing =
        isRequired && value === "";

      var isBadEmail =
        key === "email" &&
        value !== "" &&
        !EMAIL_REGEX.test(value);

      var hasError =
        isMissing || isBadEmail;


      if (hasError) {
        allValid = false;
      }


      var wrap =
        el.closest(".field");


      if (wrap) {

        wrap.classList.toggle(
          "has-error",
          hasError &&
          !!touchedFields[key]
        );

      }


      if (key === "email") {

        var errorEl =
          document.querySelector(
            '[data-field-error="email"]'
          );


        if (errorEl) {

          errorEl.textContent =
            isMissing
              ? "Email is required"
              : "Enter a valid email address";


          errorEl.hidden =
            !(hasError &&
              touchedFields[key]);
        }
      }

    });


  return allValid;
}


/* =========================================================
   PROFILE FORM
   ========================================================= */

async function initProfileForm() {

  var form =
    document.querySelector(
      "[data-profile-form]"
    );

  if (!form) {
    return;
  }


  var fieldEls =
    form.querySelectorAll(
      "[data-field]"
    );

  var saveBtn =
    form.querySelector(
      "[data-save-btn]"
    );

  var saveStatus =
    form.querySelector(
      "[data-save-status]"
    );

  var backBtn =
    document.querySelector(
      "[data-back-btn]"
    );


  /* =====================================================
     AVATAR
     ===================================================== */

  var uploader =
    document.querySelector(
      "[data-avatar-uploader]"
    );

  var dropzone =
    document.querySelector(
      "[data-avatar-dropzone]"
    );

  var avatarInput =
    document.querySelector(
      "[data-avatar-input]"
    );

  var avatarImage =
    document.querySelector(
      "[data-avatar-image]"
    );

  var avatarActions =
    document.querySelector(
      "[data-avatar-actions]"
    );

  var avatarEditBtn =
    document.querySelector(
      "[data-avatar-edit]"
    );

  var avatarDeleteBtn =
    document.querySelector(
      "[data-avatar-delete]"
    );

  var avatarHint =
    document.querySelector(
      "[data-avatar-hint]"
    );

  var defaultHintText =
    avatarHint
      ? avatarHint.textContent
      : "";


  var currentImage = null;

  var savedSnapshot = "";

  var maxFileSizeBytes =
    5 * 1024 * 1024;


/* =====================================================
   LOAD PROFILE FROM BACKEND
   ===================================================== */

var storedProfile = {};

async function loadProfileFromBackend() {

  try {

    var response = await fetch(
      ME_API_URL,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    var data = await response.json();

    if (!response.ok || !data.success || !data.user) {

      console.error(
        "BLEGAB: failed to load profile.",
        data
      );

      return;

    }

    var user = data.user;

    storedProfile = {

      firstName:
        user.firstName || "",

      lastName:
        user.lastName || "",

      email:
        user.email || "",

      phoneCode:
        user.phoneCode || "",

      phone:
        user.phone || "",

      dob:
        user.dob
          ? String(user.dob).slice(0, 10)
          : "",

      gender:
        user.gender || "",

      address:
        user.address?.street || "",

      country:
        user.address?.country || "",

      state:
        user.address?.state || "",

      city:
        user.address?.city || "",

      postalCode:
        user.address?.postalCode || "",

      newsletter:
        !!user.newsletter,

      image:
        user.image ||
        user.avatar ||
        ""

    };

    console.log(
      "BLEGAB: profile loaded successfully.",
      storedProfile
    );

  } catch (error) {

    console.error(
      "BLEGAB: profile request failed.",
      error
    );

  }

}


  /* =====================================================
     LOAD SAVED FIELDS
     ===================================================== */

await loadProfileFromBackend();

  fieldEls.forEach(function (el) {

    var key =
      el.dataset.field;


    if (
      !(key in storedProfile)
    ) {
      return;
    }


    if (el.type === "checkbox") {

      el.checked =
        !!storedProfile[key];

    } else {

      el.value =
        storedProfile[key];

    }

  });


  /* =====================================================
     RESTORE COUNTRY
     ===================================================== */

  var countryElement =
    document.getElementById("country");

  var stateElement =
    document.getElementById("state");

  var cityElement =
    document.getElementById("city");

  var phoneCodeElement =
    document.getElementById("phoneCode");


  var savedCountry =
    normalizeCountry(
      storedProfile.country
    );


  if (
    countryElement &&
    savedCountry
  ) {

    countryElement.value =
      savedCountry;


    fillSavedLocation();

  }


  function fillSavedLocation() {

    if (!countryElement) {
      return;
    }


    if (
      window.BLEGAB_FILL_STATES
    ) {

      window.BLEGAB_FILL_STATES(
        savedCountry
      );

    }


    refreshCustomSelect(
      countryElement
    );


    setTimeout(function () {

      var savedState =
        normalizeState(
          savedCountry,
          storedProfile.state
        );


      if (
        stateElement &&
        savedState
      ) {

        stateElement.value =
          savedState;


        if (
          window.BLEGAB_FILL_CITIES
        ) {

          window.BLEGAB_FILL_CITIES(
            savedCountry,
            savedState
          );

        }


        refreshCustomSelect(
          stateElement
        );

      }


      if (
        cityElement &&
        storedProfile.city
      ) {

        cityElement.value =
          storedProfile.city;

      }

    }, 50);

  }


  /* =====================================================
     RESTORE PHONE COUNTRY
     ===================================================== */

  if (
    phoneCodeElement &&
    storedProfile.phoneCode
  ) {

    var phoneCountry =
      normalizeCountry(
        storedProfile.phoneCode
      );


    if (phoneCountry) {

      phoneCodeElement.value =
        phoneCountry;


      var phoneEvent =
        new Event(
          "change",
          {
            bubbles: true
          }
        );


      phoneCodeElement.dispatchEvent(
        phoneEvent
      );

    }

  }


  /* =====================================================
     RESTORE IMAGE
     ===================================================== */

  if (storedProfile.image) {

    setAvatarImage(
      storedProfile.image
    );

  }


  savedSnapshot =
    getCurrentSnapshot();


  updateSaveButtonState();


  /* =====================================================
     AVATAR UPLOAD
     ===================================================== */

  if (
    dropzone &&
    avatarInput
  ) {

    dropzone.addEventListener(
      "click",
      function (event) {

        /*
         * Do not trigger the file input when
         * clicking edit/delete controls.
         */

        if (
          event.target.closest(
            "[data-avatar-actions]"
          )
        ) {
          return;
        }


        avatarInput.click();

      }
    );


    avatarInput.addEventListener(
      "change",
      function () {

        var file =
          avatarInput.files &&
          avatarInput.files[0];


        if (!file) {
          return;
        }


        handleFile(file);


        /*
         * Allows selecting the exact same
         * image again.
         */

        avatarInput.value = "";

      }
    );

  }


  if (avatarEditBtn) {

    avatarEditBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();


        if (avatarInput) {
          avatarInput.click();
        }

      }
    );

  }


  if (avatarDeleteBtn) {

    avatarDeleteBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();


        clearAvatarImage();

        updateSaveButtonState();

      }
    );

  }


  /* =====================================================
     HANDLE IMAGE
     ===================================================== */

  function handleFile(file) {

    if (
      !file.type ||
      file.type.indexOf("image/") !== 0
    ) {

      showAvatarHint(
        "Please choose an image file.",
        true
      );

      return;
    }


    if (
      file.size >
      maxFileSizeBytes
    ) {

      showAvatarHint(
        "That image is over 5MB — please choose a smaller one.",
        true
      );

      return;
    }


    var reader =
      new FileReader();


    reader.onload =
      function (event) {

        setAvatarImage(
          event.target.result
        );


        showAvatarHint(
          defaultHintText,
          false
        );


        updateSaveButtonState();

      };


    reader.onerror =
      function () {

        showAvatarHint(
          "Unable to read this image.",
          true
        );

      };


    reader.readAsDataURL(file);

  }


  function setAvatarImage(
    dataUrl
  ) {

    currentImage =
      dataUrl;


    if (avatarImage) {

      avatarImage.src =
        dataUrl;

      avatarImage.hidden =
        false;

    }


    if (uploader) {

      uploader.classList.add(
        "has-image"
      );

    }


    if (avatarActions) {

      avatarActions.hidden =
        false;

    }

  }


  function clearAvatarImage() {

    currentImage =
      null;


    if (avatarImage) {

      avatarImage.hidden =
        true;

      avatarImage.removeAttribute(
        "src"
      );

    }


    if (uploader) {

      uploader.classList.remove(
        "has-image"
      );

    }


    if (avatarActions) {

      avatarActions.hidden =
        true;

    }

  }


  function showAvatarHint(
    text,
    isError
  ) {

    if (!avatarHint) {
      return;
    }


    avatarHint.textContent =
      text;


    avatarHint.classList.toggle(
      "is-error",
      !!isError
    );

  }


  /* =====================================================
     FIELD TRACKING
     ===================================================== */

  fieldEls.forEach(function (el) {

    el.addEventListener(
      "input",
      updateSaveButtonState
    );


    el.addEventListener(
      "change",
      updateSaveButtonState
    );


    el.addEventListener(
      "blur",
      function () {

        touchedFields[
          el.dataset.field
        ] = true;


        updateSaveButtonState();

      }
    );

  });


  /* =====================================================
     COLLECT DATA
     ===================================================== */

  function collectFieldData() {

    var data = {};


    fieldEls.forEach(function (el) {

      var key =
        el.dataset.field;


      data[key] =
        el.type === "checkbox"
          ? el.checked
          : el.value;

    });


    return data;

  }


  function getCurrentSnapshot() {

    var data =
      collectFieldData();


    data.image =
      currentImage;


    return JSON.stringify(
      data
    );

  }


  /* =====================================================
     SAVE BUTTON
     ===================================================== */

  function updateSaveButtonState() {

    if (!saveBtn) {
      return;
    }


    var isDirty =
      getCurrentSnapshot() !==
      savedSnapshot;


    saveBtn.disabled =
      !(isDirty &&
        validateFields());

  }


/* =====================================================
   SAVE PROFILE TO BACKEND
   ===================================================== */

form.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    if (
      !saveBtn ||
      saveBtn.disabled
    ) {
      return;
    }

    var profile =
      collectFieldData();

    profile.image =
      currentImage;

    try {

      saveBtn.disabled = true;

      if (saveStatus) {

        saveStatus.textContent =
          "Saving...";

        saveStatus.classList.add(
          "is-visible"
        );

      }

      var response =
        await fetch(
          PROFILE_API_URL,
          {
            method: "PUT",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(profile)
          }
        );

      var data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to update profile."
        );

      }

      /*
       * Backend is now the source of truth.
       * Keep the returned user data in the
       * current profile state.
       */

      var updatedUser =
        data.user || {};

      storedProfile = {

        firstName:
          updatedUser.firstName || "",

        lastName:
          updatedUser.lastName || "",

        email:
          updatedUser.email || "",

        phoneCode:
          updatedUser.phoneCode || "",

        phone:
          updatedUser.phone || "",

        dob:
          updatedUser.dob
            ? String(
                updatedUser.dob
              ).slice(0, 10)
            : "",

        gender:
          updatedUser.gender || "",

        address:
          updatedUser.address?.street || "",

        country:
          updatedUser.address?.country || "",

        state:
          updatedUser.address?.state || "",

        city:
          updatedUser.address?.city || "",

        postalCode:
          updatedUser.address?.postalCode || "",

        newsletter:
          !!updatedUser.newsletter,

        image:
          updatedUser.image ||
          updatedUser.avatar ||
          ""
      };

      /*
       * Update the current image from the
       * backend response if one was returned.
       */

      currentImage =
        storedProfile.image || null;

      if (currentImage) {

        setAvatarImage(
          currentImage
        );

      } else {

        clearAvatarImage();

      }

      /*
       * The current state is now saved.
       */

      savedSnapshot =
        getCurrentSnapshot();

      updateSaveButtonState();

      if (saveStatus) {

        saveStatus.textContent =
          "Saved";

        saveStatus.classList.add(
          "is-visible"
        );

        window.clearTimeout(
          saveStatus._hideTimer
        );

        saveStatus._hideTimer =
          window.setTimeout(
            function () {

              saveStatus.classList.remove(
                "is-visible"
              );

            },
            2500
          );

      }

    } catch (error) {

      console.error(
        "BLEGAB: failed to save profile.",
        error
      );

      if (saveStatus) {

        saveStatus.textContent =
          error.message ||
          "Unable to save profile";

        saveStatus.classList.add(
          "is-visible"
        );

      }

      updateSaveButtonState();

    }

  }
);


  /* =====================================================
     BACK BUTTON
     ===================================================== */

  if (backBtn) {

    backBtn.addEventListener(
      "click",
      function () {

        var ref =
          document.referrer;


        var cameFromSite =
          ref &&
          ref.indexOf(
            window.location.origin
          ) === 0;


        if (cameFromSite) {

          window.location.href =
            ref;

        } else {

          window.location.href =
            "index.html";

        }

      }
    );

  }

}


/* =========================================================
   PHONE INPUT
   ========================================================= */

function initStrictInputs() {

  var phoneInput =
    document.getElementById("phone");


  if (!phoneInput) {
    return;
  }


  phoneInput.addEventListener(
    "input",
    function () {

      phoneInput.value =
        phoneInput.value
          .replace(
            /[^0-9]/g,
            ""
          )
          .slice(
            0,
            10
          );

    }
  );

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    initStrictInputs();

    /*
     * IMPORTANT:
     * Load the country/state/city library FIRST.
     * Profile loading depends on ALL_COUNTRIES,
     * State and City being ready.
     */

    await loadLocationLibrary();

    /*
     * Only initialize the profile form AFTER
     * the location library has finished loading.
     */

    await initProfileForm();

  }
);