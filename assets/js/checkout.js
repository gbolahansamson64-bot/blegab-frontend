/* =========================================================
   CHECKOUT MODAL JS
   Opens from the cart page's "Proceed to Checkout" button.
   Step 1: shipping info + payment method choice.
   Step 2: shows the panel matching whichever method was
   selected in step 1 (card fields / GPay / Stripe / Apple Pay / AfterPay).
   ========================================================= */

   const CHECKOUT_API_URL = "https://backend-6j62.onrender.com/api";

async function createCheckoutSession(checkoutData) {

    const response = await fetch(`${CHECKOUT_API_URL}/orders/checkout`, {

        method: "POST",

        credentials: "include",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(checkoutData)

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.message);

    }

    return data;

}

document.addEventListener('DOMContentLoaded', function () {
  initCheckoutModal();
});

function initCheckoutModal() {
  var overlay = document.querySelector('[data-checkout-modal-overlay]');
  var modal = document.querySelector('[data-checkout-modal]');
  var checkoutBtn = document.querySelector('[data-checkout]');
  if (!overlay || !modal || !checkoutBtn) return;

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

    // Whatever ZIP was showing belonged to the old state/city — clear it
    // before autoFillZip() re-fills it (or leaves it blank for UK/manual entry).
    if (zipEl) zipEl.value = '';
    autoFillZip();
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

    autoFillZip(value);
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

    // Country changed, so whatever postal code was filled/typed no longer applies.
    if (zipEl) {
      zipEl.value = '';
      var zipWrapper = zipEl.closest('.checkout-field');
      var zipErrorEl = modal.querySelector('[data-field-error="zip"]');
      if (zipWrapper) zipWrapper.classList.remove('checkout-field--invalid');
      if (zipErrorEl) zipErrorEl.classList.remove('is-visible');
    }
  });
}

var COUNTRY_DIAL_CODES = {
  'Nigeria': '+234',
  'United States': '+1',
  'United Kingdom': '+44',
  'Canada': '+1'
};

var phoneEl = modal.querySelector('#checkout-phone');
if (phoneEl) {
  var PHONE_LOCAL_LENGTH = 10;
  phoneEl.setAttribute('maxlength', String(PHONE_LOCAL_LENGTH + 2));

  function stripCountryCode(digits) {
    var country = countryEl ? countryEl.value : '';
    var dialCode = (COUNTRY_DIAL_CODES[country] || '').replace('+', '');
    if (!dialCode) return digits;

    var codeFound = false;

    if (digits.indexOf('00' + dialCode) === 0) {
      digits = digits.slice(2 + dialCode.length);
      codeFound = true;
    } else if (digits.indexOf(dialCode) === 0) {
      digits = digits.slice(dialCode.length);
      codeFound = true;
    }

    if (codeFound && digits.charAt(0) === '0') digits = digits.slice(1);

    return digits;
  }

  function formatPhoneDisplay(digits) {
    var groups = [];
    if (digits.length > 6) {
      groups.push(digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10));
    } else if (digits.length > 3) {
      groups.push(digits.slice(0, 3), digits.slice(3, 6));
    } else {
      groups.push(digits);
    }
    return groups.filter(function (g) { return g.length; }).join(' ');
  }

  phoneEl.addEventListener('input', function () {
    var digitsOnly = phoneEl.value.replace(/\D/g, '').slice(0, PHONE_LOCAL_LENGTH);
    phoneEl.value = formatPhoneDisplay(digitsOnly);
  });

  phoneEl.addEventListener('keydown', function (e) {
    var allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    var hasSelection = phoneEl.selectionStart !== phoneEl.selectionEnd;
    var digitsOnly = phoneEl.value.replace(/\D/g, '');
    if (!hasSelection && digitsOnly.length >= PHONE_LOCAL_LENGTH) {
      e.preventDefault();
    }
  });

  phoneEl.addEventListener('paste', function (e) {
    e.preventDefault();
    var pasted = (e.clipboardData || window.clipboardData).getData('text');
    var digitsOnly = stripCountryCode(pasted.replace(/\D/g, '')).slice(0, PHONE_LOCAL_LENGTH);
    phoneEl.value = formatPhoneDisplay(digitsOnly);
  });
}

if (phoneEl) {
  var phoneWrap = document.createElement('div');
  phoneWrap.className = 'checkout-phone-wrap';

  var codeBadge = document.createElement('span');
  codeBadge.className = 'checkout-phone-code';

  phoneEl.parentNode.insertBefore(phoneWrap, phoneEl);
  phoneWrap.appendChild(codeBadge);
  phoneWrap.appendChild(phoneEl);

  function updatePhoneCode() {
    var country = countryEl ? countryEl.value : '';
    codeBadge.textContent = COUNTRY_DIAL_CODES[country] || '+';
  }

  updatePhoneCode();
  if (countryEl) countryEl.addEventListener('change', updatePhoneCode);
}

var nameFieldIds = ['checkout-first-name', 'checkout-last-name', 'checkout-card-name'];
var namePattern = /^[A-Za-z\s'-]$/;

nameFieldIds.forEach(function (id) {
  var nameEl = modal.querySelector('#' + id);
  if (!nameEl) return;

  nameEl.addEventListener('keydown', function (e) {
    var allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey) return;
    if (!namePattern.test(e.key)) e.preventDefault();
  });

  nameEl.addEventListener('input', function () {
    var cleaned = nameEl.value.replace(/[^A-Za-z\s'-]/g, '');
    if (nameEl.value !== cleaned) nameEl.value = cleaned;
  });

  nameEl.addEventListener('paste', function (e) {
    e.preventDefault();
    var pasted = (e.clipboardData || window.clipboardData).getData('text');
    var cleaned = pasted.replace(/[^A-Za-z\s'-]/g, '');
    var start = nameEl.selectionStart;
    var end = nameEl.selectionEnd;
    nameEl.value = nameEl.value.slice(0, start) + cleaned + nameEl.value.slice(end);
  });
});

if (stateEl) {
  var statePattern = /^[A-Za-z\s'-]$/;

  stateEl.addEventListener('keydown', function (e) {
    var allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Home', 'End'];
    if (allowedKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey) return;
    if (!statePattern.test(e.key)) e.preventDefault();
  });

  stateEl.addEventListener('input', function () {
    var cleaned = stateEl.value.replace(/[^A-Za-z\s'-]/g, '');
    if (stateEl.value !== cleaned) stateEl.value = cleaned;
  });

  stateEl.addEventListener('paste', function (e) {
    e.preventDefault();
    var pasted = (e.clipboardData || window.clipboardData).getData('text');
    var cleaned = pasted.replace(/[^A-Za-z\s'-]/g, '');
    var start = stateEl.selectionStart;
    var end = stateEl.selectionEnd;
    stateEl.value = stateEl.value.slice(0, start) + cleaned + stateEl.value.slice(end);
  });
}

var cvvEl = modal.querySelector('#checkout-cvv');
if (cvvEl) {
  var CVV_MAX_DIGITS = 3;

  cvvEl.addEventListener('keydown', function (e) {
    var allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    var hasSelection = cvvEl.selectionStart !== cvvEl.selectionEnd;
    if (!hasSelection && cvvEl.value.replace(/\D/g, '').length >= CVV_MAX_DIGITS) {
      e.preventDefault();
    }
  });

  cvvEl.addEventListener('input', function () {
    var cleaned = cvvEl.value.replace(/\D/g, '').slice(0, CVV_MAX_DIGITS);
    if (cvvEl.value !== cleaned) cvvEl.value = cleaned;
  });

  cvvEl.addEventListener('paste', function (e) {
    e.preventDefault();
    var pasted = (e.clipboardData || window.clipboardData).getData('text');
    var cleaned = pasted.replace(/\D/g, '');
    var start = cvvEl.selectionStart;
    var end = cvvEl.selectionEnd;
    var existingDigits = cvvEl.value.replace(/\D/g, '');
    var merged = (existingDigits.slice(0, start) + cleaned + existingDigits.slice(end)).slice(0, CVV_MAX_DIGITS);
    cvvEl.value = merged;
    var caretPos = Math.min(start + cleaned.length, merged.length);
    cvvEl.setSelectionRange(caretPos, caretPos);
  });
}

var expiryEl = modal.querySelector('#checkout-expiry');
if (expiryEl) {
  function buildExpiryDigits(raw) {
    var source = raw.replace(/\D/g, '');
    var result = '';
    for (var i = 0; i < source.length && result.length < 4; i++) {
      var ch = source.charAt(i);
      if (result.length === 0) {
        if (ch === '0' || ch === '1') {
          result += ch;
        } else {
          result += '0' + ch;
        }
      } else if (result.length === 1) {
        var firstDigit = result.charAt(0);
        if (firstDigit === '0') {
          if (ch !== '0') result += ch;
        } else {
          if (ch >= '0' && ch <= '2') result += ch;
        }
      } else {
        result += ch;
      }
    }
    return result;
  }

  function formatExpiryDisplay(digits) {
    return digits.length <= 2 ? digits : digits.slice(0, 2) + '/' + digits.slice(2);
  }

  function expiryCaretPos(digits, digitsBeforeCaret) {
    var caretDigits = Math.min(digitsBeforeCaret, digits.length);
    var slashOffset = caretDigits > 2 ? 1 : 0;
    return Math.min(caretDigits + slashOffset, formatExpiryDisplay(digits).length);
  }

  function applyExpiryValue(digits, digitsBeforeCaret) {
    var formatted = formatExpiryDisplay(digits);
    var caretPos = expiryCaretPos(digits, digitsBeforeCaret);
    expiryEl.value = formatted;
    expiryEl.setSelectionRange(caretPos, caretPos);
  }

  expiryEl.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && expiryEl.selectionStart === expiryEl.selectionEnd) {
      var pos = expiryEl.selectionStart;
      if (pos > 0 && expiryEl.value.charAt(pos - 1) === '/') {
        e.preventDefault();
        var digitsBeforeCaret = expiryEl.value.slice(0, pos - 2).replace(/\D/g, '').length;
        var newDigits = buildExpiryDigits(expiryEl.value.slice(0, pos - 2) + expiryEl.value.slice(pos));
        applyExpiryValue(newDigits, digitsBeforeCaret);
        return;
      }
      return;
    }

    var allowedKeys = ['Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    var hasSelection = expiryEl.selectionStart !== expiryEl.selectionEnd;
    var digitsOnly = expiryEl.value.replace(/\D/g, '');
    if (!hasSelection && digitsOnly.length >= 4) {
      e.preventDefault();
    }
  });

  expiryEl.addEventListener('input', function () {
    var caret = expiryEl.selectionStart;
    var digitsBeforeCaret = expiryEl.value.slice(0, caret).replace(/\D/g, '').length;
    var digits = buildExpiryDigits(expiryEl.value);
    applyExpiryValue(digits, digitsBeforeCaret);
  });

  expiryEl.addEventListener('paste', function (e) {
    e.preventDefault();
    var pasted = (e.clipboardData || window.clipboardData).getData('text');
    var start = expiryEl.selectionStart;
    var end = expiryEl.selectionEnd;
    var existingRaw = expiryEl.value;
    var merged = existingRaw.slice(0, start) + pasted + existingRaw.slice(end);
    var digitsBeforeCaret = existingRaw.slice(0, start).replace(/\D/g, '').length +
      pasted.replace(/\D/g, '').length;
    var digits = buildExpiryDigits(merged);
    applyExpiryValue(digits, digitsBeforeCaret);
  });
}

var cardNumberEl = modal.querySelector('#checkout-card-number');
if (cardNumberEl) {
  var CARD_NUMBER_MAX_DIGITS = 16;

  function formatCardNumberDisplay(digits) {
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function reformatCardNumber(rawValue, digitsBeforeCaret) {
    var digits = rawValue.replace(/\D/g, '').slice(0, CARD_NUMBER_MAX_DIGITS);
    var formatted = formatCardNumberDisplay(digits);
    var caretDigits = Math.min(digitsBeforeCaret, digits.length);
    var spacesBeforeCaret = caretDigits > 0 ? Math.floor((caretDigits - 1) / 4) : 0;
    var caretPos = Math.min(caretDigits + spacesBeforeCaret, formatted.length);
    return { formatted: formatted, caretPos: caretPos };
  }

  cardNumberEl.addEventListener('keydown', function (e) {
    var allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    var hasSelection = cardNumberEl.selectionStart !== cardNumberEl.selectionEnd;
    var digitsOnly = cardNumberEl.value.replace(/\D/g, '');
    if (!hasSelection && digitsOnly.length >= CARD_NUMBER_MAX_DIGITS) {
      e.preventDefault();
    }
  });

  cardNumberEl.addEventListener('input', function () {
    var caret = cardNumberEl.selectionStart;
    var digitsBeforeCaret = cardNumberEl.value.slice(0, caret).replace(/\D/g, '').length;
    var result = reformatCardNumber(cardNumberEl.value, digitsBeforeCaret);
    cardNumberEl.value = result.formatted;
    cardNumberEl.setSelectionRange(result.caretPos, result.caretPos);
  });

  cardNumberEl.addEventListener('paste', function (e) {
    e.preventDefault();
    var pasted = (e.clipboardData || window.clipboardData).getData('text');
    var pastedDigits = pasted.replace(/\D/g, '');

    var start = cardNumberEl.selectionStart;
    var end = cardNumberEl.selectionEnd;
    var existingDigits = cardNumberEl.value.replace(/\D/g, '');
    var digitsBeforeStart = cardNumberEl.value.slice(0, start).replace(/\D/g, '').length;
    var digitsBeforeEnd = cardNumberEl.value.slice(0, end).replace(/\D/g, '').length;
    var digitsAfterEnd = existingDigits.slice(digitsBeforeEnd);

    var merged = (existingDigits.slice(0, digitsBeforeStart) + pastedDigits + digitsAfterEnd).slice(0, CARD_NUMBER_MAX_DIGITS);
    var caretDigits = Math.min(digitsBeforeStart + pastedDigits.length, CARD_NUMBER_MAX_DIGITS);

    var result = reformatCardNumber(merged, caretDigits);
    cardNumberEl.value = result.formatted;
    cardNumberEl.setSelectionRange(result.caretPos, result.caretPos);
  });
}

var zipEl = modal.querySelector('#checkout-zip');
if (zipEl) {
  var zipPattern = /^[A-Za-z0-9\s-]$/;

  zipEl.addEventListener('keydown', function (e) {
    var allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey) return;
    if (!zipPattern.test(e.key)) e.preventDefault();
  });

  zipEl.addEventListener('input', function () {
    var cleaned = zipEl.value.replace(/[^A-Za-z0-9\s-]/g, '');
    if (zipEl.value !== cleaned) zipEl.value = cleaned;
  });

  zipEl.addEventListener('paste', function (e) {
    e.preventDefault();
    var pasted = (e.clipboardData || window.clipboardData).getData('text');
    var cleaned = pasted.replace(/[^A-Za-z0-9\s-]/g, '');
    var start = zipEl.selectionStart;
    var end = zipEl.selectionEnd;
    zipEl.value = zipEl.value.slice(0, start) + cleaned + zipEl.value.slice(end);
  });
}

var US_STATE_ABBR = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

var CANADA_PROVINCE_ABBR = {
  'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB', 'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL', 'Nova Scotia': 'NS', 'Ontario': 'ON',
  'Prince Edward Island': 'PE', 'Quebec': 'QC', 'Saskatchewan': 'SK',
  'Northwest Territories': 'NT', 'Nunavut': 'NU', 'Yukon': 'YT'
};

var NIGERIA_STATE_ZIP = {
  'Abia': '440001', 'Adamawa': '640001', 'Akwa Ibom': '520001', 'Anambra': '420001',
  'Bauchi': '740001', 'Bayelsa': '561001', 'Benue': '970001', 'Borno': '600001',
  'Cross River': '540001', 'Delta': '320001', 'Ebonyi': '840001', 'Edo': '300001',
  'Ekiti': '360001', 'Enugu': '400001', 'Gombe': '760001', 'Imo': '460001',
  'Jigawa': '720001', 'Kaduna': '800001', 'Kano': '700001', 'Katsina': '820001',
  'Kebbi': '860001', 'Kogi': '260001', 'Kwara': '240001', 'Lagos': '100001',
  'Nasarawa': '962001', 'Niger': '920001', 'Ogun': '110001', 'Ondo': '340001',
  'Osun': '230001', 'Oyo': '200001', 'Plateau': '930001', 'Rivers': '500001',
  'Sokoto': '840001', 'Taraba': '660001', 'Yobe': '620001', 'Zamfara': '880001',
  'Abuja (FCT)': '900001'
};

function fetchZipForCity(country, state, city) {
  var url = null;

  if (country === 'United States') {
    var stateAbbr = US_STATE_ABBR[state];
    if (stateAbbr) {
      url = 'https://api.zippopotam.us/us/' + stateAbbr.toLowerCase() + '/' + encodeURIComponent(city);
    }
  } else if (country === 'Canada') {
    var provinceAbbr = CANADA_PROVINCE_ABBR[state];
    if (provinceAbbr) {
      url = 'https://api.zippopotam.us/ca/' + provinceAbbr.toLowerCase() + '/' + encodeURIComponent(city);
    }
  }

  if (!url) return Promise.resolve(null);

  return fetch(url)
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (data && data.places && data.places.length) {
        return data.places[0]['post code'] || null;
      }
      return null;
    })
    .catch(function () { return null; });
}

function autoFillZip(city) {
  if (!zipEl) return;
  var country = countryEl ? countryEl.value : '';
  var state = stateEl ? stateEl.value : '';

  if (country === 'Nigeria') {
    var code = NIGERIA_STATE_ZIP[state];
    if (code) zipEl.value = code;
    return;
  }

  if (!city) return;

  fetchZipForCity(country, state, city).then(function (code) {
    if (code) zipEl.value = code;
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
  var closeBtns = modal.querySelectorAll('[data-checkout-modal-close]');
  var stepIndicators = modal.querySelectorAll('[data-checkout-step-indicator]');
  var stepPanels = modal.querySelectorAll('[data-checkout-step-panel]');

  checkoutBtn.addEventListener("click", async function () {

    // console.log("CHECKOUT BUTTON CLICKED");

    try {

        const response = await window.BLEGAB_CART.getCart();

        if (response.totalItems === 0) {

            alert("Your cart is empty.");

            return;

        }

        await renderOrderSummary();

        goToStep(1);

        openModal();

    }

    catch(error){

        console.error(error);

    }

});

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal();
    });
  });
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // function showOrderConfirmation() {
  //   var note = document.createElement('div');
  //   note.className = 'checkout-order-toast';
  //   note.textContent = 'Order placed! Redirecting you to the homepage...';
  //   document.body.appendChild(note);

  //   setTimeout(function () {
  //     window.location.href = 'index.html';
  //   }, 2200);
  // }

  continueBtn.addEventListener('click', function () {

    if (!validateShippingFields()) return;

    var checkoutData = {

        firstName: modal.querySelector("#checkout-first-name").value.trim(),

        lastName: modal.querySelector("#checkout-last-name").value.trim(),

        email: modal.querySelector("#checkout-email").value.trim(),

        phone: modal.querySelector("#checkout-phone").value.trim(),

        country: modal.querySelector("#checkout-country").value,

        address: modal.querySelector("#checkout-address").value.trim(),

        city: modal.querySelector("#checkout-city").value.trim(),

        state: modal.querySelector("#checkout-state").value.trim(),

        postalCode: modal.querySelector("#checkout-zip").value.trim()

    };

    createCheckoutSession(checkoutData)

    .then(function(data){

        window.location.href = data.url;

    })

    .catch(function(error){

        alert(error.message);

    });

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

    stepPanels.forEach(function (panel) {
      panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
    });

    stepIndicators.forEach(function (indicator) {
      var num = indicator.dataset.checkoutStepIndicator;
      indicator.classList.toggle('is-active', num === String(step));
      indicator.classList.toggle('is-done', Number(num) < step);
    });

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

  function getProductImage(image) {

    if (!image) {
        return '/assets/images/placeholder.png';
    }

    if (
        image.startsWith('http://') ||
        image.startsWith('https://')
    ) {
        return image;
    }

    return '/assets/images/products/' + image;
}

  async function renderOrderSummary() {

    var itemsEl = modal.querySelector("[data-checkout-summary-items]");
    var subtotalEl = modal.querySelector("[data-checkout-summary-subtotal]");
    var totalEl = modal.querySelector("[data-checkout-summary-total]");
    var countEl = modal.querySelector("[data-checkout-summary-count]");
    var ctaTotalEl = modal.querySelector("[data-checkout-cta-total]");

    if (!itemsEl) return;

    try {

        const response = await window.BLEGAB_CART.getCart();

        if (!response || !response.success) {
            throw new Error(
                response?.message || "Failed to load cart"
            );
        }

        const cart = response.cart;

        if (!cart || !Array.isArray(cart.items)) {
            throw new Error("Invalid cart response");
        }

        itemsEl.innerHTML = "";

        if (!cart.items.length) {

            itemsEl.innerHTML =
                "<p>Your cart is empty.</p>";

            return;
        }

        cart.items.forEach(function (item) {

            const product = item.product;

            if (!product) return;

            const image = getProductImage(
                product.images?.[0]
            );

            itemsEl.innerHTML +=

                '<div class="checkout-summary__item">' +

                    '<img src="' +
                        image +
                        '" alt="' +
                        product.name +
                    '">' +

                    '<div class="checkout-summary__item-info">' +

                        '<span class="name">' +
                            product.name +
                        "</span>" +

                        '<span class="meta">×' +
                            item.quantity +
                        "</span>" +

                    "</div>" +

                    '<span class="checkout-summary__item-price">$' +
                        Number(item.lineTotal).toFixed(2) +
                    "</span>" +

                "</div>";
        });

        const subtotal = Number(response.subtotal || 0);

        if (subtotalEl) {
            subtotalEl.textContent =
                "$" + subtotal.toFixed(2);
        }

        if (totalEl) {
            totalEl.textContent =
                "$" + subtotal.toFixed(2);
        }

        if (ctaTotalEl) {
            ctaTotalEl.textContent =
                "$" + subtotal.toFixed(2);
        }

        if (countEl) {
            countEl.textContent =
                response.totalItems || 0;
        }

    } catch (err) {

        console.error(
            "Failed to render checkout summary:",
            err
        );
    }
}
}