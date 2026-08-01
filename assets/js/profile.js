/* =========================================================
   BLEGAB LUXURY WIGS — PROFILE PAGE
   Runs after main.js (needs window.BLEGAB_AUTH to exist).
   ========================================================= */

/* -----------------------------
   Profile store.

   Mirrors the same pattern as window.BLEGAB_AUTH in main.js:
   a small object with get/save, backed by localStorage for now.
   Keyed per signed-in user, so the same customer's details come
   back whether they sign out and back in on this device or (once
   a real backend replaces localStorage) on any device.

   TO CONNECT A REAL BACKEND:
     1. In get(user), replace the localStorage read with something like:
          return fetch('/api/customers/' + user.id + '/profile')
            .then(function (res) { return res.json(); });
        (get() must keep returning a plain object / Promise<object>
        shaped like { firstName, lastName, email, phone, dob, gender,
        address, city, state, postalCode, country, newsletter, image })
     2. In save(user, profile), replace the localStorage write with:
          return fetch('/api/customers/' + user.id + '/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
          }).then(function (res) { return res.json(); });
     3. The profile photo is currently stored inline as a base64 data
        URL in profile.image, which works for this mock but is heavy
        for a real database. Once there's an upload endpoint, upload
        the File object from data-avatar-input separately (multipart/
        form-data), and store the returned image URL string in
        profile.image instead of the base64 data.
   ----------------------------- */

import { Country, State, City } from 'https://cdn.jsdelivr.net/npm/country-state-city@3/+esm';
   
window.BLEGAB_PROFILE = {
  _keyFor: function (user) {
    var id = (user && (user.email || user.id || user.name)) || 'guest';
    return 'blegab_profile_' + id;
  },
  get: function (user) {
    try {
      var raw = localStorage.getItem(this._keyFor(user));
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },
  save: function (user, profile) {
    localStorage.setItem(this._keyFor(user), JSON.stringify(profile));
    return Promise.resolve(profile);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  var user = window.BLEGAB_AUTH && window.BLEGAB_AUTH.getUser();
  if (!user) {
    // Belt-and-braces: the inline <head> script already redirects,
    // this just stops the rest of the page script from doing anything
    // if it somehow still runs.
    return;
  }

  initLocationFields();
  initStrictInputs();
  initProfileForm(user);
});




function initStrictInputs() {
  var phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }
}

var EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
var REQUIRED_FIELD_KEYS = ['firstName', 'lastName', 'email', 'phone', 'country', 'state', 'city', 'address'];
var touchedFields = {};

function validateFields() {
  var allValid = true;

  document.querySelectorAll('[data-field]').forEach(function (el) {
    var key = el.dataset.field;
    var value = (el.value || '').trim();
    var isRequired = REQUIRED_FIELD_KEYS.indexOf(key) !== -1;
    var isMissing = isRequired && value === '';
    var isBadEmail = key === 'email' && value !== '' && !EMAIL_REGEX.test(value);
    var hasError = isMissing || isBadEmail;

    if (hasError) allValid = false;

    var wrap = el.closest('.field');
    if (wrap) wrap.classList.toggle('has-error', hasError && !!touchedFields[key]);

    if (key === 'email') {
      var errorEl = document.querySelector('[data-field-error="email"]');
      if (errorEl) {
        errorEl.textContent = isMissing ? 'Email is required' : 'Enter a valid email address (e.g. name@example.com)';
        errorEl.hidden = !(hasError && touchedFields[key]);
      }
    }
  });

  return allValid;
}

function isFormValid() {
  return validateFields();
}

var ALL_COUNTRIES = Country.getAllCountries();

function initLocationFields() {
  var phoneCodeSelect = document.getElementById('phoneCode');
  var countrySelect = document.getElementById('country');
  var stateSelect = document.getElementById('state');
  var citySelect = document.getElementById('city');
  if (!countrySelect || !stateSelect || !citySelect) return;

  countrySelect.innerHTML = '<option value="">Select a country</option>' +
    ALL_COUNTRIES.map(function (c) {
      return '<option value="' + c.isoCode + '">' + c.name + '</option>';
    }).join('');

  var phonePrefix = document.querySelector('[data-phone-prefix]');
  var phoneInputEl = document.getElementById('phone');

  if (phoneCodeSelect) {
    phoneCodeSelect.innerHTML = '<option value="">Country</option>' + ALL_COUNTRIES
      .filter(function (c) { return !!c.phonecode; })
      .map(function (c) {
        return '<option value="' + c.isoCode + '" data-phonecode="' + c.phonecode + '">' + c.name + '</option>';
      }).join('');

    phoneCodeSelect.addEventListener('change', function () {
      var opt = phoneCodeSelect.selectedOptions[0];
      var code = opt ? opt.dataset.phonecode : '';

      if (code) {
        phonePrefix.textContent = '+' + code;
        phonePrefix.hidden = false;
        phoneInputEl.classList.add('has-prefix');
      } else {
        phonePrefix.hidden = true;
        phoneInputEl.classList.remove('has-prefix');
      }

      countrySelect.value = phoneCodeSelect.value;
      countrySelect.dispatchEvent(new Event('change'));
    });
  }

  countrySelect.addEventListener('change', function () {
    fillStates(countrySelect.value);
    stateSelect.value = '';
    citySelect.innerHTML = '<option value="">Select a state first</option>';
    citySelect.disabled = true;
  });

  stateSelect.addEventListener('change', function () {
    fillCities(countrySelect.value, stateSelect.value);
  });

  function fillStates(countryIso) {
    if (!countryIso) {
      stateSelect.innerHTML = '<option value="">Select a country first</option>';
      stateSelect.disabled = true;
      return;
    }
    var states = State.getStatesOfCountry(countryIso);
    stateSelect.innerHTML = '<option value="">Select a state</option>' +
      states.map(function (s) {
        return '<option value="' + s.isoCode + '">' + s.name + '</option>';
      }).join('');
    stateSelect.disabled = false;
  }

  function fillCities(countryIso, stateIso) {
    if (!countryIso || !stateIso) {
      citySelect.innerHTML = '<option value="">Select a state first</option>';
      citySelect.disabled = true;
      return;
    }
    var cities = City.getCitiesOfState(countryIso, stateIso);
    citySelect.innerHTML = '<option value="">Select a city</option>' +
      cities.map(function (c) {
        return '<option value="' + c.name + '">' + c.name + '</option>';
      }).join('');
    citySelect.disabled = false;
  }

  // exposed so loadProfile() can re-run the cascade for saved values
  window.BLEGAB_FILL_STATES = fillStates;
  window.BLEGAB_FILL_CITIES = fillCities;
}

/* -----------------------------
   Profile form: load, avatar upload, dirty tracking, save
   ----------------------------- */
function initProfileForm(user) {
  var form = document.querySelector('[data-profile-form]');
  if (!form) return;

  var fieldEls = form.querySelectorAll('[data-field]');
  var saveBtn = form.querySelector('[data-save-btn]');
  var saveStatus = form.querySelector('[data-save-status]');
  var backBtn = document.querySelector('[data-back-btn]');

  var uploader = document.querySelector('[data-avatar-uploader]');
  var dropzone = document.querySelector('[data-avatar-dropzone]');
  var avatarInput = document.querySelector('[data-avatar-input]');
  var avatarImage = document.querySelector('[data-avatar-image]');
  var avatarActions = document.querySelector('[data-avatar-actions]');
  var avatarEditBtn = document.querySelector('[data-avatar-edit]');
  var avatarDeleteBtn = document.querySelector('[data-avatar-delete]');
  var avatarHint = document.querySelector('[data-avatar-hint]');
  var defaultHintText = avatarHint ? avatarHint.textContent : '';

  var currentImage = null; // base64 data URL, or null
  var savedSnapshot = '';  // JSON string of the last-saved state, used for dirty checking
  var maxFileSizeBytes = 5 * 1024 * 1024; // 5MB

  loadProfile();
  wireAvatarUploader();
  wireFieldChangeTracking();
  wireSave();
  wireBack();

  /* ---- Load existing profile into the form ---- */
  function loadProfile() {
    var profile = window.BLEGAB_PROFILE.get(user) || {};

    fieldEls.forEach(function (el) {
      var key = el.dataset.field;
      if (!(key in profile) || key === 'state' || key === 'city') return;
      if (el.type === 'checkbox') {
        el.checked = !!profile[key];
      } else {
        el.value = profile[key];
      }
    });

        if (profile.phoneCode) {
      document.getElementById('phoneCode').dispatchEvent(new Event('change'));
    }

    if (profile.country && window.BLEGAB_FILL_STATES) {
      window.BLEGAB_FILL_STATES(profile.country);
      if (profile.state) {
        document.getElementById('state').value = profile.state;
        if (window.BLEGAB_FILL_CITIES) {
          window.BLEGAB_FILL_CITIES(profile.country, profile.state);
          if (profile.city) document.getElementById('city').value = profile.city;
        }
      }
    }

    if (profile.image) {
      setAvatarImage(profile.image);
    }

    savedSnapshot = getCurrentSnapshot();
    updateSaveButtonState();
  }

  /* ---- Avatar uploader ---- */
  function wireAvatarUploader() {
    if (!dropzone || !avatarInput) return;

    dropzone.addEventListener('click', function () {
      avatarInput.click();
    });

    avatarInput.addEventListener('change', function () {
      var file = avatarInput.files && avatarInput.files[0];
      if (!file) return;
      handleFile(file);
      avatarInput.value = ''; // allow re-selecting the same file later
    });

    if (avatarEditBtn) {
      avatarEditBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        avatarInput.click();
      });
    }

    if (avatarDeleteBtn) {
      avatarDeleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        clearAvatarImage();
        updateSaveButtonState();
      });
    }
  }

  function handleFile(file) {
    if (!file.type || file.type.indexOf('image/') !== 0) {
      showAvatarHint('Please choose an image file.', true);
      return;
    }
    if (file.size > maxFileSizeBytes) {
      showAvatarHint('That image is over 5MB — please choose a smaller one.', true);
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      setAvatarImage(e.target.result);
      showAvatarHint(defaultHintText, false);
      updateSaveButtonState();
    };
    reader.readAsDataURL(file);
  }

  function setAvatarImage(dataUrl) {
    currentImage = dataUrl;
    if (avatarImage) {
      avatarImage.src = dataUrl;
      avatarImage.hidden = false;
    }
    if (uploader) uploader.classList.add('has-image');
    if (avatarActions) avatarActions.hidden = false;
  }

  function clearAvatarImage() {
    currentImage = null;
    if (avatarImage) {
      avatarImage.hidden = true;
      avatarImage.removeAttribute('src');
    }
    if (uploader) uploader.classList.remove('has-image');
    if (avatarActions) avatarActions.hidden = true;
  }

  function showAvatarHint(text, isError) {
    if (!avatarHint) return;
    avatarHint.textContent = text;
    avatarHint.classList.toggle('is-error', !!isError);
  }

  /* ---- Dirty tracking: Save stays disabled until a field or the image changes ---- */
function wireFieldChangeTracking() {
  fieldEls.forEach(function (el) {
    el.addEventListener('input', updateSaveButtonState);
    el.addEventListener('change', updateSaveButtonState);
    el.addEventListener('blur', function () {
      touchedFields[el.dataset.field] = true;
      updateSaveButtonState();
    });
  });
}

  function getCurrentSnapshot() {
    var data = collectFieldData();
    data.image = currentImage;
    return JSON.stringify(data);
  }

  function updateSaveButtonState() {
    if (!saveBtn) return;
    var isDirty = getCurrentSnapshot() !== savedSnapshot;
    saveBtn.disabled = !(isDirty && isFormValid());
  }

  function collectFieldData() {
    var data = {};
    fieldEls.forEach(function (el) {
      var key = el.dataset.field;
      data[key] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return data;
  }

  /* ---- Save ---- */
  function wireSave() {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (saveBtn.disabled) return;

      var profile = collectFieldData();
      profile.image = currentImage;

      window.BLEGAB_PROFILE.save(user, profile).then(function () {
        savedSnapshot = getCurrentSnapshot();
        updateSaveButtonState();

        if (saveStatus) {
          saveStatus.textContent = 'Saved';
          saveStatus.classList.add('is-visible');
          window.clearTimeout(saveStatus._hideTimer);
          saveStatus._hideTimer = window.setTimeout(function () {
            saveStatus.classList.remove('is-visible');
          }, 2500);
        }
      });
    });
  }

  /* ---- Back button: return to wherever they came from ---- */
  function wireBack() {
    if (!backBtn) return;
    backBtn.addEventListener('click', function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
  }
}