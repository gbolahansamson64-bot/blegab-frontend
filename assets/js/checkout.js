/* =========================================================
   CHECKOUT MODAL JS
   Opens from the cart page's "Proceed to Checkout" button.
   Step 1: shipping info + payment method choice.
   Step 2: shows the panel matching whichever method was
   selected in step 1 (card fields / GPay / Stripe / Apple Pay / AfterPay).
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initCheckoutModal();
});

function initCheckoutModal() {
  var overlay = document.querySelector('[data-checkout-modal-overlay]');
  var modal = document.querySelector('[data-checkout-modal]');
  var checkoutBtn = document.querySelector('[data-checkout]');
  if (!overlay || !modal || !checkoutBtn) return;

  var selectedMethod = 'card';
  var currentStep = 1;
  var scrollLockY = 0;
  var mainEl = document.querySelector('main');

  var countryEl = modal.querySelector('#checkout-country');
  var stateEl = modal.querySelector('#checkout-state');
  var stateListEl = modal.querySelector('[data-state-combobox-list]');
  var currentStateOptions = [];
  var filteredStateOptions = [];
  var activeStateIndex = -1;

  var cityEl = modal.querySelector('#checkout-city');
  var cityListEl = modal.querySelector('[data-city-combobox-list]');
  var currentCityOptions = [];
  var filteredCityOptions = [];
  var activeCityIndex = -1;
  

  var COUNTRY_STATES = {
    'Nigeria': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Abuja (FCT)'],
    'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon']
  };

  // Cities available for each state/province, grouped by country.
  var STATE_CITIES = {
    'Nigeria': {
      'Abia': ['Umuahia', 'Aba', 'Ohafia', 'Arochukwu'],
      'Adamawa': ['Yola', 'Mubi', 'Numan', 'Ganye'],
      'Akwa Ibom': ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'],
      'Anambra': ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'],
      'Bauchi': ['Bauchi', 'Azare', 'Misau', "Jama'are"],
      'Bayelsa': ['Yenagoa', 'Ogbia', 'Sagbama', 'Brass'],
      'Benue': ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala'],
      'Borno': ['Maiduguri', 'Biu', 'Bama', 'Dikwa'],
      'Cross River': ['Calabar', 'Ogoja', 'Ikom', 'Obudu'],
      'Delta': ['Asaba', 'Warri', 'Sapele', 'Ughelli'],
      'Ebonyi': ['Abakaliki', 'Afikpo', 'Onueke', 'Ezza'],
      'Edo': ['Benin City', 'Auchi', 'Ekpoma', 'Uromi'],
      'Ekiti': ['Ado-Ekiti', 'Ikere-Ekiti', 'Ise-Ekiti', 'Ilawe-Ekiti'],
      'Enugu': ['Enugu', 'Nsukka', 'Awgu', 'Oji River'],
      'Gombe': ['Gombe', 'Kumo', 'Dukku', 'Billiri'],
      'Imo': ['Owerri', 'Orlu', 'Okigwe', 'Mbaise'],
      'Jigawa': ['Dutse', 'Hadejia', 'Gumel', 'Birnin Kudu'],
      'Kaduna': ['Kaduna', 'Zaria', 'Kafanchan', 'Sabon Gari'],
      'Kano': ['Kano', 'Wudil', 'Gwarzo', 'Rano'],
      'Katsina': ['Katsina', 'Funtua', 'Daura', 'Malumfashi'],
      'Kebbi': ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'],
      'Kogi': ['Lokoja', 'Okene', 'Idah', 'Kabba'],
      'Kwara': ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba'],
      'Lagos': ['Ikeja', 'Lagos Island', 'Lekki', 'Surulere', 'Badagry', 'Epe'],
      'Nasarawa': ['Lafia', 'Keffi', 'Akwanga', 'Nasarawa'],
      'Niger': ['Minna', 'Bida', 'Kontagora', 'Suleja'],
      'Ogun': ['Abeokuta', 'Sagamu', 'Ijebu-Ode', 'Ota'],
      'Ondo': ['Akure', 'Ondo City', 'Owo', 'Ikare'],
      'Osun': ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede'],
      'Oyo': ['Ibadan', 'Ogbomoso', 'Iseyin', 'Oyo Town'],
      'Plateau': ['Jos', 'Bukuru', 'Pankshin', 'Shendam'],
      'Rivers': ['Port Harcourt', 'Bonny', 'Ahoada', 'Okrika'],
      'Sokoto': ['Sokoto', 'Wurno', 'Tambuwal', 'Illela'],
      'Taraba': ['Jalingo', 'Wukari', 'Bali', 'Gembu'],
      'Yobe': ['Damaturu', 'Potiskum', 'Nguru', 'Gashua'],
      'Zamfara': ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Zurmi'],
      'Abuja (FCT)': ['Abuja', 'Gwagwalada', 'Kuje', 'Bwari']
    },
    'United States': {
      'Alabama': ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile'],
      'Alaska': ['Anchorage', 'Fairbanks', 'Juneau'],
      'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale'],
      'Arkansas': ['Little Rock', 'Fayetteville', 'Fort Smith'],
      'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
      'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Boulder'],
      'Connecticut': ['Hartford', 'New Haven', 'Stamford'],
      'Delaware': ['Wilmington', 'Dover', 'Newark'],
      'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
      'Georgia': ['Atlanta', 'Savannah', 'Augusta', 'Athens'],
      'Hawaii': ['Honolulu', 'Hilo', 'Kailua'],
      'Idaho': ['Boise', 'Idaho Falls', 'Nampa'],
      'Illinois': ['Chicago', 'Springfield', 'Naperville'],
      'Indiana': ['Indianapolis', 'Fort Wayne', 'Bloomington'],
      'Iowa': ['Des Moines', 'Cedar Rapids', 'Iowa City'],
      'Kansas': ['Wichita', 'Topeka', 'Overland Park'],
      'Kentucky': ['Louisville', 'Lexington', 'Bowling Green'],
      'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport'],
      'Maine': ['Portland', 'Augusta', 'Bangor'],
      'Maryland': ['Baltimore', 'Annapolis', 'Rockville'],
      'Massachusetts': ['Boston', 'Worcester', 'Cambridge'],
      'Michigan': ['Detroit', 'Grand Rapids', 'Ann Arbor'],
      'Minnesota': ['Minneapolis', 'Saint Paul', 'Duluth'],
      'Mississippi': ['Jackson', 'Gulfport', 'Biloxi'],
      'Missouri': ['Kansas City', 'St. Louis', 'Springfield'],
      'Montana': ['Billings', 'Missoula', 'Helena'],
      'Nebraska': ['Omaha', 'Lincoln', 'Bellevue'],
      'Nevada': ['Las Vegas', 'Reno', 'Henderson'],
      'New Hampshire': ['Manchester', 'Nashua', 'Concord'],
      'New Jersey': ['Newark', 'Jersey City', 'Trenton'],
      'New Mexico': ['Albuquerque', 'Santa Fe', 'Las Cruces'],
      'New York': ['New York City', 'Buffalo', 'Albany', 'Rochester'],
      'North Carolina': ['Charlotte', 'Raleigh', 'Durham'],
      'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks'],
      'Ohio': ['Columbus', 'Cleveland', 'Cincinnati'],
      'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman'],
      'Oregon': ['Portland', 'Salem', 'Eugene'],
      'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Harrisburg'],
      'Rhode Island': ['Providence', 'Warwick', 'Cranston'],
      'South Carolina': ['Charleston', 'Columbia', 'Greenville'],
      'South Dakota': ['Sioux Falls', 'Rapid City', 'Pierre'],
      'Tennessee': ['Nashville', 'Memphis', 'Knoxville'],
      'Texas': ['Houston', 'Austin', 'Dallas', 'San Antonio'],
      'Utah': ['Salt Lake City', 'Provo', 'Ogden'],
      'Vermont': ['Burlington', 'Montpelier', 'Rutland'],
      'Virginia': ['Virginia Beach', 'Richmond', 'Norfolk'],
      'Washington': ['Seattle', 'Spokane', 'Tacoma'],
      'West Virginia': ['Charleston', 'Huntington', 'Morgantown'],
      'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay'],
      'Wyoming': ['Cheyenne', 'Casper', 'Laramie']
    },
    'United Kingdom': {
      'England': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'],
      'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
      'Wales': ['Cardiff', 'Swansea', 'Newport'],
      'Northern Ireland': ['Belfast', 'Derry', 'Lisburn']
    },
    'Canada': {
      'Alberta': ['Calgary', 'Edmonton', 'Red Deer'],
      'British Columbia': ['Vancouver', 'Victoria', 'Surrey'],
      'Manitoba': ['Winnipeg', 'Brandon'],
      'New Brunswick': ['Fredericton', 'Saint John', 'Moncton'],
      'Newfoundland and Labrador': ["St. John's", 'Corner Brook'],
      'Nova Scotia': ['Halifax', 'Sydney'],
      'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'],
      'Prince Edward Island': ['Charlottetown', 'Summerside'],
      'Quebec': ['Montreal', 'Quebec City', 'Laval'],
      'Saskatchewan': ['Regina', 'Saskatoon'],
      'Northwest Territories': ['Yellowknife'],
      'Nunavut': ['Iqaluit'],
      'Yukon': ['Whitehorse']
    }
  };

  function populateStates(country) {
    if (!stateEl) return;
    currentStateOptions = COUNTRY_STATES[country] || [];
    stateEl.value = '';
    closeStateList();

    // Country changed, so whatever city was picked no longer applies.
    populateCities(null);

    if (currentStateOptions.length === 0) {
      stateEl.disabled = true;
      stateEl.placeholder = 'Select country first';
      return;
    }

    stateEl.disabled = false;
    stateEl.placeholder = 'Search for your state';
  }

  function populateCities(state) {
    if (!cityEl) return;
    var country = countryEl ? countryEl.value : '';
    var citiesForCountry = STATE_CITIES[country] || {};
    currentCityOptions = (state && citiesForCountry[state]) || [];
    cityEl.value = '';
    closeCityList();

    if (!state) {
      cityEl.disabled = true;
      cityEl.placeholder = 'Select state first';
      return;
    }

    // Some states/provinces have no preset list — let the shopper type their city.
    if (currentCityOptions.length === 0) {
      cityEl.disabled = false;
      cityEl.placeholder = 'Enter your city';
      return;
    }

    cityEl.disabled = false;
    cityEl.placeholder = 'Search for your city';
  }

  function filterStateOptions() {
    var query = stateEl.value.trim().toLowerCase();
    filteredStateOptions = query === ''
      ? currentStateOptions.slice()
      : currentStateOptions.filter(function (s) { return s.toLowerCase().indexOf(query) !== -1; });
    activeStateIndex = -1;
    renderStateList();
  }

  function renderStateList() {
    if (!stateListEl) return;
    if (filteredStateOptions.length === 0) {
      stateListEl.innerHTML = '<li class="checkout-combobox__empty">No matching states</li>';
      return;
    }
    stateListEl.innerHTML = filteredStateOptions.map(function (state, i) {
      return '<li class="checkout-combobox__option' + (i === activeStateIndex ? ' is-active' : '') +
        '" data-state-value="' + state + '">' + state + '</li>';
    }).join('');
  }

  function openStateList() {
    if (!stateListEl || stateEl.disabled) return;
    filterStateOptions();
    stateListEl.hidden = false;
    scheduleComboboxScroll(stateEl, stateListEl);
  }

  function closeStateList() {
    if (!stateListEl) return;
    stateListEl.hidden = true;
    activeStateIndex = -1;
  }

  function selectState(value) {
    stateEl.value = value;
    closeStateList();
    var wrapper = stateEl.closest('.checkout-field');
    var errorEl = modal.querySelector('[data-field-error="state"]');
    if (wrapper) wrapper.classList.remove('checkout-field--invalid');
    if (errorEl) errorEl.classList.remove('is-visible');

    populateCities(value);
  }

  function scrollActiveStateIntoView() {
    if (!stateListEl) return;
    var activeItem = stateListEl.querySelector('.is-active');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
  }

  // ---------- Keep an open combobox list visible above the on-screen keyboard ----------
  // On mobile/tablet, focusing the input opens the virtual keyboard, which shrinks the
  // visible viewport from the bottom. The dropdown list can then end up hidden behind
  // (or clipped by) the keyboard. This nudges the scrollable modal body up just enough
  // so the whole list sits above the keyboard, still below the input itself.
  function scrollComboboxAboveKeyboard(inputEl, listEl) {
    var scrollContainer = modal.querySelector('.checkout-modal__body');
    if (!scrollContainer || !inputEl) return;

    var viewportHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    var reference = (listEl && !listEl.hidden) ? listEl : inputEl;
    var rect = reference.getBoundingClientRect();
    var buffer = 16; // small breathing room above the keyboard
    var overflow = rect.bottom - viewportHeight + buffer;

    if (overflow > 0) {
      scrollContainer.scrollTop += overflow;
    }
  }

  // Runs the check right away (covers desktop/no-keyboard cases and instant layouts)
  // and again after a short delay, since the mobile keyboard animates in and the
  // visualViewport doesn't finish resizing immediately on focus.
  function scheduleComboboxScroll(inputEl, listEl) {
    requestAnimationFrame(function () {
      scrollComboboxAboveKeyboard(inputEl, listEl);
    });
    setTimeout(function () {
      scrollComboboxAboveKeyboard(inputEl, listEl);
    }, 320);
  }

  function repositionActiveCombobox() {
    if (stateListEl && !stateListEl.hidden) {
      scrollComboboxAboveKeyboard(stateEl, stateListEl);
    } else if (cityListEl && !cityListEl.hidden) {
      scrollComboboxAboveKeyboard(cityEl, cityListEl);
    }
  }

  // Keeps the list correctly positioned if the keyboard height changes while
  // the list is open (e.g. switching between number/text keyboards, or rotation).
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', repositionActiveCombobox);
  }

  function filterCityOptions() {
    var query = cityEl.value.trim().toLowerCase();
    filteredCityOptions = query === ''
      ? currentCityOptions.slice()
      : currentCityOptions.filter(function (c) { return c.toLowerCase().indexOf(query) !== -1; });
    activeCityIndex = -1;
    renderCityList();
  }

  function renderCityList() {
    if (!cityListEl) return;
    if (filteredCityOptions.length === 0) {
      cityListEl.innerHTML = '<li class="checkout-combobox__empty">No matching cities — you can type your own</li>';
      return;
    }
    cityListEl.innerHTML = filteredCityOptions.map(function (city, i) {
      return '<li class="checkout-combobox__option' + (i === activeCityIndex ? ' is-active' : '') +
        '" data-city-value="' + city + '">' + city + '</li>';
    }).join('');
  }

  function openCityList() {
    if (!cityListEl || cityEl.disabled || currentCityOptions.length === 0) return;
    filterCityOptions();
    cityListEl.hidden = false;
    scheduleComboboxScroll(cityEl, cityListEl);
  }

  function closeCityList() {
    if (!cityListEl) return;
    cityListEl.hidden = true;
    activeCityIndex = -1;
  }

  function selectCity(value) {
    cityEl.value = value;
    closeCityList();
    var wrapper = cityEl.closest('.checkout-field');
    var errorEl = modal.querySelector('[data-field-error="city"]');
    if (wrapper) wrapper.classList.remove('checkout-field--invalid');
    if (errorEl) errorEl.classList.remove('is-visible');
  }

  function scrollActiveCityIntoView() {
    if (!cityListEl) return;
    var activeItem = cityListEl.querySelector('.is-active');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
  }

  if (stateEl) {
    stateEl.addEventListener('input', openStateList);
    stateEl.addEventListener('focus', openStateList);

    stateEl.addEventListener('keydown', function (e) {
      if (stateEl.disabled) return;

      if (stateListEl.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        openStateList();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeStateIndex = Math.min(activeStateIndex + 1, filteredStateOptions.length - 1);
        renderStateList();
        scrollActiveStateIntoView();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeStateIndex = Math.max(activeStateIndex - 1, 0);
        renderStateList();
        scrollActiveStateIntoView();
      } else if (e.key === 'Enter') {
        if (!stateListEl.hidden && activeStateIndex > -1 && filteredStateOptions[activeStateIndex]) {
          e.preventDefault();
          selectState(filteredStateOptions[activeStateIndex]);
        }
      } else if (e.key === 'Escape') {
        closeStateList();
      }
    });

    stateEl.addEventListener('blur', function () {
      // Delay so a click on a list option registers before the list closes.
      setTimeout(closeStateList, 150);
    });
  }

  if (stateListEl) {
    stateListEl.addEventListener('mousedown', function (e) {
      e.preventDefault(); // keep focus on the input so blur doesn't fire first
    });
    stateListEl.addEventListener('click', function (e) {
      var option = e.target.closest('[data-state-value]');
      if (!option) return;
      selectState(option.getAttribute('data-state-value'));
    });
  }

  if (cityEl) {
    cityEl.addEventListener('input', openCityList);
    cityEl.addEventListener('focus', openCityList);

    cityEl.addEventListener('keydown', function (e) {
      if (cityEl.disabled || currentCityOptions.length === 0) return;

      if (cityListEl.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        openCityList();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeCityIndex = Math.min(activeCityIndex + 1, filteredCityOptions.length - 1);
        renderCityList();
        scrollActiveCityIntoView();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeCityIndex = Math.max(activeCityIndex - 1, 0);
        renderCityList();
        scrollActiveCityIntoView();
      } else if (e.key === 'Enter') {
        if (!cityListEl.hidden && activeCityIndex > -1 && filteredCityOptions[activeCityIndex]) {
          e.preventDefault();
          selectCity(filteredCityOptions[activeCityIndex]);
        }
      } else if (e.key === 'Escape') {
        closeCityList();
      }
    });

    cityEl.addEventListener('blur', function () {
      // Delay so a click on a list option registers before the list closes.
      setTimeout(closeCityList, 150);
    });
  }

  if (cityListEl) {
    cityListEl.addEventListener('mousedown', function (e) {
      e.preventDefault(); // keep focus on the input so blur doesn't fire first
    });
    cityListEl.addEventListener('click', function (e) {
      var option = e.target.closest('[data-city-value]');
      if (!option) return;
      selectCity(option.getAttribute('data-city-value'));
    });
  }

  if (countryEl) {
    countryEl.addEventListener('change', function () {
      populateStates(countryEl.value);
      var wrapper = stateEl ? stateEl.closest('.checkout-field') : null;
      var errorEl = modal.querySelector('[data-field-error="state"]');
      if (wrapper) wrapper.classList.remove('checkout-field--invalid');
      if (errorEl) errorEl.classList.remove('is-visible');
    });
  }

  function lockPageScroll() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  function unlockPageScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollLockY);
  }

  function lockBackground() {
    if (!mainEl) return;
    Array.prototype.forEach.call(mainEl.children, function (child) {
      if (child !== overlay && child !== modal) {
        child.inert = true;
      }
    });
  }

  function unlockBackground() {
    if (!mainEl) return;
    Array.prototype.forEach.call(mainEl.children, function (child) {
      child.inert = false;
    });
  }

  var continueBtn = modal.querySelector('[data-checkout-continue]');
  var backBtn = modal.querySelector('[data-checkout-back]');
  var closeBtns = modal.querySelectorAll('[data-checkout-modal-close]');
  var stepIndicators = modal.querySelectorAll('[data-checkout-step-indicator]');
  var stepPanels = modal.querySelectorAll('[data-checkout-step-panel]');
  var paymentPanels = modal.querySelectorAll('[data-payment-panel]');
  var methodOptions = modal.querySelectorAll('.checkout-payment-option');

  checkoutBtn.addEventListener('click', function () {
    if (window.BLEGAB_CART && window.BLEGAB_CART.getCount() === 0) return;
    renderOrderSummary();
    goToStep(1);
    openModal();
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;
      if (isMobileOrTablet && currentStep === 2) {
        goToStep(1);
      } else {
        closeModal();
      }
    });
  });
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Payment method selection (step 1)
  methodOptions.forEach(function (option) {
    option.addEventListener('click', function () {
      methodOptions.forEach(function (o) { o.classList.remove('is-active'); });
      option.classList.add('is-active');
      var radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      selectedMethod = option.dataset.paymentMethod;
    });
  });

  function showOrderConfirmation() {
    var note = document.createElement('div');
    note.className = 'checkout-order-toast';
    note.textContent = 'Order placed! Redirecting you to the homepage...';
    document.body.appendChild(note);

    setTimeout(function () {
      window.location.href = 'index.html';
    }, 2200);
  }

  continueBtn.addEventListener('click', function () {
    if (currentStep === 1) {
      if (!validateShippingFields()) return;
      goToStep(2);
    } else {
      // No real payment backend yet — placeholder confirmation.
      closeModal();
      showOrderConfirmation();
    }
  });

  backBtn.addEventListener('click', function () {
    goToStep(1);
  });

  ['checkout-first-name', 'checkout-last-name', 'checkout-email', 'checkout-phone', 'checkout-country', 'checkout-address', 'checkout-city', 'checkout-state', 'checkout-zip'].forEach(function (id) {
    var input = modal.querySelector('#' + id);
    if (!input) return;
    var eventName = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, function () {
      var wrapper = input.closest('.checkout-field');
      var errorEl = wrapper ? wrapper.querySelector('.checkout-field-error') : null;
      if (input.value.trim() !== '') {
        if (wrapper) wrapper.classList.remove('checkout-field--invalid');
        if (errorEl) errorEl.classList.remove('is-visible');
      }
    });
  });

  function validateShippingFields() {
    var fields = [
      { input: modal.querySelector('#checkout-first-name'), key: 'first-name', message: 'First name is required.' },
      { input: modal.querySelector('#checkout-last-name'), key: 'last-name', message: 'Last name is required.' },
      { input: modal.querySelector('#checkout-email'), key: 'email', message: 'Email address is required.' },
      { input: modal.querySelector('#checkout-country'), key: 'country', message: 'Country / region is required.' },
      { input: modal.querySelector('#checkout-address'), key: 'address', message: 'Street address is required.' },
      { input: modal.querySelector('#checkout-city'), key: 'city', message: 'City is required.' },
      { input: modal.querySelector('#checkout-state'), key: 'state', message: 'State is required.' },
      { input: modal.querySelector('#checkout-zip'), key: 'zip', message: 'ZIP code is required.' }
    ];

    var allFilled = true;
    var firstInvalidInput = null;

    fields.forEach(function (field) {
      var errorEl = modal.querySelector('[data-field-error="' + field.key + '"]');
      var wrapper = field.input ? field.input.closest('.checkout-field') : null;
      var isEmpty = !field.input || field.input.value.trim() === '';

      if (isEmpty) {
        allFilled = false;
        if (!firstInvalidInput) firstInvalidInput = field.input;
        if (errorEl) {
          errorEl.textContent = field.message;
          errorEl.classList.add('is-visible');
        }
        if (wrapper) wrapper.classList.add('checkout-field--invalid');
      } else {
        if (errorEl) errorEl.classList.remove('is-visible');
        if (wrapper) wrapper.classList.remove('checkout-field--invalid');
      }
    });

    if (!allFilled && firstInvalidInput) {
      firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidInput.focus({ preventScroll: true });
    }

    return allFilled;
  }

  function goToStep(step) {
    currentStep = step;

    modal.classList.toggle('checkout-modal--step-2', step === 2);

    stepPanels.forEach(function (panel) {
      panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
    });

    stepIndicators.forEach(function (indicator) {
      var num = indicator.dataset.checkoutStepIndicator;
      indicator.classList.toggle('is-active', num === String(step));
      indicator.classList.toggle('is-done', Number(num) < step);
    });

    if (step === 1) {
      backBtn.hidden = true;
      continueBtn.querySelector('.btn-text') ? (continueBtn.querySelector('.btn-text').textContent = 'Continue to Payment') : (continueBtn.textContent = 'Continue to Payment');
    } else {
      backBtn.hidden = false;
      paymentPanels.forEach(function (panel) {
        panel.hidden = panel.dataset.paymentPanel !== selectedMethod;
      });
      updateAfterpayBreakdown();
      var label = selectedMethod === 'card' ? 'Complete Order' : 'Confirm & Pay';
      continueBtn.querySelector('.btn-text') ? (continueBtn.querySelector('.btn-text').textContent = label) : (continueBtn.textContent = label);
    }

    var modalBody = modal.querySelector('.checkout-modal__body');
    if (modalBody) {
      modalBody.scrollTop = 0;
      modalBody.scrollLeft = 0;
    }
  }

  function openModal() {
    modal.classList.add('is-open');
    overlay.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockPageScroll();
    lockBackground();
    var modalBody = modal.querySelector('.checkout-modal__body');
    if (modalBody) modalBody.scrollLeft = 0;
  }

  function closeModal() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    unlockPageScroll();
    unlockBackground();
  }

  function formatMoney(amount) {
    var fixed = Number(amount).toFixed(2);
    var parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '$' + parts.join('.');
  }

  function updateAfterpayBreakdown() {
    var el = modal.querySelector('[data-afterpay-breakdown]');
    if (!el || !window.BLEGAB_CART) return;
    var items = window.BLEGAB_CART.getItems();
    var products = window.BLEGAB_SHOP_PRODUCTS || [];
    var total = items.reduce(function (sum, item) {
      var product = products.find(function (p) { return p.id === item.id; });
      return product ? sum + product.price * item.qty : sum;
    }, 0);
    var installment = total / 4;
    el.innerHTML = [1, 2, 3, 4].map(function (n) {
      return '<div><span class="label">Payment ' + n + '</span><span class="amount">' + formatMoney(installment) + '</span></div>';
    }).join('');
  }

  function renderOrderSummary() {
    var itemsEl = modal.querySelector('[data-checkout-summary-items]');
    var subtotalEl = modal.querySelector('[data-checkout-summary-subtotal]');
    var totalEl = modal.querySelector('[data-checkout-summary-total]');
    var countEl = modal.querySelector('[data-checkout-summary-count]');
    var ctaTotalEl = modal.querySelector('[data-checkout-cta-total]');
    if (!itemsEl || !window.BLEGAB_CART) return;

    var items = window.BLEGAB_CART.getItems();
    var products = window.BLEGAB_SHOP_PRODUCTS || [];
    var subtotal = 0;

    itemsEl.innerHTML = items.map(function (item) {
      var product = products.find(function (p) { return p.id === item.id; });
      if (!product) return '';
      var lineTotal = product.price * item.qty;
      subtotal += lineTotal;
      return '' +
        '<div class="checkout-summary__item">' +
          '<img src="' + product.image + '" alt="' + product.name + '" />' +
          '<div class="checkout-summary__item-info">' +
            '<span class="name">' + product.name + '</span>' +
            '<span class="meta">&times;' + item.qty + '</span>' +
          '</div>' +
          '<span class="checkout-summary__item-price">' + formatMoney(lineTotal) + '</span>' +
        '</div>';
    }).join('');

    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (totalEl) totalEl.textContent = formatMoney(subtotal);
    if (countEl) countEl.textContent = window.BLEGAB_CART.getCount();
    if (ctaTotalEl) ctaTotalEl.textContent = formatMoney(subtotal);
  }
}