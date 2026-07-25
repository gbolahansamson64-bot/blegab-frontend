/* =========================================================
   AUTH PAGES JS — shared by signup.html & login.html
   Password show/hide + form submission.

   NOTE: there's no backend yet, so "Create Account" / "Sign In"
   just call BLEGAB_AUTH.signIn(...) (defined in main.js) and send
   the person home signed in. Swap the body of handleSignup /
   handleLogin for a real API call when the backend is ready —
   everything else (header state, icon, dropdown) already reacts
   to BLEGAB_AUTH automatically.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initPasswordToggles();
  initPasswordChecklists();
  initSignupForm();
  initLoginForm();
  initGoogleButtons();
  initForgotPasswordForm();
  initVerifyCodeForm();
  initResetPasswordForm();
  initVerifyCodeRestriction();
});

/* -----------------------------
   Show/hide password
   ----------------------------- */
function initPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var field = btn.closest('.auth__field');
      var input = field ? field.querySelector('input') : null;
      if (!input) return;

      var isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(isHidden));
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });
}


function initVerifyCodeRestriction() {
  var codeInput = document.getElementById('verify-code');
  if (!codeInput) return;

  var invalidEl = document.querySelector('[data-code-invalid]');

  codeInput.addEventListener('input', function () {
    var value = codeInput.value;

    var badChar = null;
    for (var i = 0; i < value.length; i++) {
      if (!/[0-9]/.test(value[i])) {
        badChar = value[i];
        break;
      }
    }

    if (badChar && invalidEl) {
      invalidEl.textContent = 'Invalid "' + badChar + '" — only numbers are allowed. Please enter the code sent to your email.';
      invalidEl.classList.add('is-visible');
    } else if (invalidEl) {
      invalidEl.textContent = '';
      invalidEl.classList.remove('is-visible');
    }

    var cleaned = value.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleaned !== value) codeInput.value = cleaned;
  });
}

/* -----------------------------
   Signup form (signup.html)
   ----------------------------- */
function initSignupForm() {
  var form = document.getElementById('signup-form');
  if (!form) return;

  var errorEl = form.querySelector('[data-auth-error]');
  var submitBtn = form.querySelector('.auth__submit');
  var checkboxLabel = form.querySelector('.auth__checkbox');
  var checkbox = checkboxLabel.querySelector('input');

  var requiredFields = [
    form.querySelector('#signup-first-name'),
    form.querySelector('#signup-email'),
    form.querySelector('#signup-password'),
    form.querySelector('#signup-confirm-password')
  ];

  function isFormComplete() {
    var filled = requiredFields.every(function (input) {
      return input.value.trim() !== '';
    });
    return filled && checkbox.checked;
  }

  function updateSubmitState() {
    submitBtn.classList.toggle('is-disabled', !isFormComplete());
  }

  function showFieldError(input, message) {
    var wrapper = input.closest('.auth__field');
    if (!wrapper) return;
    wrapper.classList.add('auth__field--invalid');

    var errorSpan = wrapper.querySelector('.auth__field-error');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'auth__field-error';
      wrapper.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
    errorSpan.classList.add('is-visible');
  }

  function clearFieldError(input) {
    var wrapper = input.closest('.auth__field');
    if (!wrapper) return;
    wrapper.classList.remove('auth__field--invalid');
    var errorSpan = wrapper.querySelector('.auth__field-error');
    if (errorSpan) errorSpan.classList.remove('is-visible');
  }

  requiredFields.forEach(function (input) {
    input.addEventListener('input', function () {
      clearFieldError(input);
      updateSubmitState();
    });
  });

  checkbox.addEventListener('change', function () {
    checkboxLabel.classList.remove('auth__checkbox--invalid');
    updateSubmitState();
  });

  updateSubmitState(); // dim the button right away since the form starts empty

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var firstInvalid = null;

    requiredFields.forEach(function (input) {
      if (input.value.trim() === '') {
        showFieldError(input, 'This field is required.');
        if (!firstInvalid) firstInvalid = input;
      } else {
        clearFieldError(input);
      }
    });

    if (!checkbox.checked) {
      checkboxLabel.classList.add('auth__checkbox--invalid');
      showError(errorEl, 'Please agree to the Terms of Service and Privacy Policy to continue.');
      if (!firstInvalid) firstInvalid = checkbox;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var firstName = form.querySelector('#signup-first-name').value.trim();
    var lastName = form.querySelector('#signup-last-name').value.trim();
    var password = form.querySelector('#signup-password').value;
    var confirmPassword = form.querySelector('#signup-confirm-password').value;

if (!isPasswordFullyValid(password) || !isPasswordFullyValid(confirmPassword)) {
  showError(errorEl, 'Please meet all password requirements below.');
  return;
}

    hideError(errorEl);

    var name = (firstName + ' ' + lastName).trim() || 'there';
    window.BLEGAB_AUTH.signIn({ name: name });
    window.location.href = 'index.html';
  });
}

/* -----------------------------
   Login form (login.html)
   ----------------------------- */
function initLoginForm() {
  var form = document.getElementById('login-form');
  if (!form) return;

  var errorEl = form.querySelector('[data-auth-error]');
  var submitBtn = form.querySelector('.auth__submit');

  var requiredFields = [
    form.querySelector('#login-email'),
    form.querySelector('#login-password')
  ];

function isFormComplete() {
  var filled = requiredFields.every(function (input) {
    return input.value.trim() !== '';
  });
  var passwordInput = document.getElementById('login-password');
  var passwordValid = passwordInput && isPasswordFullyValid(passwordInput.value);
  return filled && passwordValid;
}

  function updateSubmitState() {
    submitBtn.classList.toggle('is-disabled', !isFormComplete());
  }

  function showFieldError(input, message) {
    var wrapper = input.closest('.auth__field');
    if (!wrapper) return;
    wrapper.classList.add('auth__field--invalid');

    var errorSpan = wrapper.querySelector('.auth__field-error');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'auth__field-error';
      wrapper.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
    errorSpan.classList.add('is-visible');
  }

  function clearFieldError(input) {
    var wrapper = input.closest('.auth__field');
    if (!wrapper) return;
    wrapper.classList.remove('auth__field--invalid');
    var errorSpan = wrapper.querySelector('.auth__field-error');
    if (errorSpan) errorSpan.classList.remove('is-visible');
  }

  requiredFields.forEach(function (input) {
    input.addEventListener('input', function () {
      clearFieldError(input);
      updateSubmitState();
    });
  });

  updateSubmitState(); // dim the button right away since the form starts empty

form.addEventListener('submit', function (event) {
  event.preventDefault();

  var firstInvalid = null;

  requiredFields.forEach(function (input) {
    if (input.value.trim() === '') {
      showFieldError(input, 'This field is required.');
      if (!firstInvalid) firstInvalid = input;
    } else {
      clearFieldError(input);
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  var passwordValue = form.querySelector('#login-password').value;

  if (!isPasswordFullyValid(passwordValue)) {
    showError(errorEl, 'Please meet all password requirements above.');
    return;
  }

  hideError(errorEl);

  var email = form.querySelector('#login-email').value.trim();
  var name = email.split('@')[0] || 'there';

  window.BLEGAB_AUTH.signIn({ name: name });
  window.location.href = 'index.html';
});
}

/* -----------------------------
   Forgot password form (forgot-password.html)
   ----------------------------- */
function initForgotPasswordForm() {
  var form = document.getElementById('forgot-password-form');
  if (!form) return;

  var errorEl = form.querySelector('[data-auth-error]');
  var emailInput = form.querySelector('#forgot-password-email');

  // If the person got here via "Edit email" on verify-code.html,
  // bring back whatever they'd already typed.
  var prefillEmail = new URLSearchParams(window.location.search).get('email');
  if (prefillEmail && emailInput) emailInput.value = prefillEmail;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var email = emailInput.value.trim();

    var emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    if (!emailPattern.test(email)) {
      showError(errorEl, 'Please enter a valid email address.');
      return;
    }

    hideError(errorEl);

    // NOTE: no backend yet — swap this for a real "send reset code" API
    // call once ready. For now, hand the email to verify-code.html via
    // the URL so it can show which address the code was sent to.
    window.location.href = 'verify-code.html?email=' + encodeURIComponent(email);
  });
}

/* -----------------------------
   Verify code form (verify-code.html)
   ----------------------------- */
function initVerifyCodeForm() {
  var form = document.getElementById('verify-code-form');
  if (!form) return;

  var errorEl = form.querySelector('[data-auth-error]');
  var emailInput = document.getElementById('verify-email');
  var editBtn = document.querySelector('[data-edit-email]');
  var submitBtn = form.querySelector('[data-verify-submit]');
  var submitText = submitBtn ? submitBtn.querySelector('.auth__submit-text') : null;
  var spinner = form.querySelector('[data-verify-spinner]');

  var email = new URLSearchParams(window.location.search).get('email') || '';
  if (emailInput) emailInput.value = email;

  if (editBtn) {
    editBtn.addEventListener('click', function () {
      window.location.href = 'forgot-password.html' + (email ? '?email=' + encodeURIComponent(email) : '');
    });
  }

  function setLoading(isLoading) {
    if (submitBtn) submitBtn.disabled = isLoading;
    if (spinner) spinner.hidden = !isLoading;
    if (submitText) submitText.textContent = isLoading ? 'Verifying...' : 'Continue';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var code = form.querySelector('#verify-code').value.trim();

    if (code === '') {
      showError(errorEl, 'Please enter the code we sent you.');
      return;
    }

      if (!/^\d{4}$/.test(code)) {
      showError(errorEl, 'Please enter the 4-digit code we sent you.');
      return;
    }

    hideError(errorEl);
    setLoading(true);

    // NOTE: no backend yet — swap this block for a real "verify reset
    // code" API call once ready. Resolve on a valid code and move on to
    // reset-password.html; reject (call setLoading(false) + showError)
    // on an invalid/expired one. The setTimeout below just simulates
    // the round-trip so the spinner has something to show.
    setTimeout(function () {
      window.location.href = 'reset-password.html' + (email ? '?email=' + encodeURIComponent(email) : '');
    }, 900);
  });
}

function showSuccess(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
}

function hideSuccess(el) {
  if (!el) return;
  el.textContent = '';
  el.classList.remove('is-visible');
}

/* -----------------------------
   "Sign in/up with Google" buttons — REAL Google OAuth popup.

   This opens Google's own consent screen and gets the person's
   actual name/email back from Google's userinfo endpoint. What's
   still missing (because there's no backend yet) is a real,
   secure server-side session — right now BLEGAB_AUTH.signIn()
   just drops the returned name into localStorage the same way
   the email/password forms do, purely so the header UI has
   something to react to.

   TO GO FULLY LIVE:
     1. Create an OAuth 2.0 Client ID at
        https://console.cloud.google.com/apis/credentials
        (Application type: "Web application"), and add your real
        domain(s) under "Authorized JavaScript origins".
     2. Paste that client ID into GOOGLE_CLIENT_ID below.
     3. Once a backend exists, send the access_token (or switch
        this to the "code" flow and send the auth code) to your
        server, verify it there, create/find the user, and issue
        a real session — don't trust localStorage for that part.
   ----------------------------- */
var GOOGLE_CLIENT_ID = 'PASTE_YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE.apps.googleusercontent.com';

function initGoogleButtons() {
  var buttons = document.querySelectorAll('[data-google-auth]');
  if (!buttons.length) return;

  if (GOOGLE_CLIENT_ID.indexOf('PASTE_YOUR') === 0) {
    // No client ID configured yet — tell the developer plainly instead
    // of silently faking a sign-in.
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        console.warn('Google Sign-In is not configured yet. Set GOOGLE_CLIENT_ID in auth.js.');
        alert('Google Sign-In isn\'t set up yet. Please use email sign in/up for now.');
      });
    });
    return;
  }

  if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
    // The Google script (loaded in <head>) hasn't finished loading yet
    // or failed to load (e.g. blocked network) — fail loudly, not silently.
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        alert('Could not reach Google right now. Please check your connection and try again.');
      });
    });
    return;
  }

  var tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    callback: function (tokenResponse) {
      if (!tokenResponse || tokenResponse.error) {
        alert('Google sign-in was cancelled or failed. Please try again.');
        return;
      }
      fetchGoogleProfile(tokenResponse.access_token);
    }
  });

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // This is what actually opens Google's real account picker /
      // consent popup — nothing is faked from here on.
      tokenClient.requestAccessToken();
    });
  });
}

function fetchGoogleProfile(accessToken) {
  fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: 'Bearer ' + accessToken }
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to fetch Google profile');
      return res.json();
    })
    .then(function (profile) {
      // profile.name / profile.email / profile.picture come straight
      // from Google — this is a real signed-in Google account, not a
      // placeholder. Swap this localStorage call for a real backend
      // session once the API exists.
      window.BLEGAB_AUTH.signIn({
        name: profile.name || (profile.email ? profile.email.split('@')[0] : 'there'),
        email: profile.email,
        picture: profile.picture,
        provider: 'google'
      });
      window.location.href = 'index.html';
    })
    .catch(function () {
      alert('Something went wrong finishing Google sign-in. Please try again.');
    });
}

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
}

function hideError(el) {
  if (!el) return;
  el.textContent = '';
  el.classList.remove('is-visible');
}

/* -----------------------------
   Reset password form (reset-password.html)
   ----------------------------- */
function initResetPasswordForm() {
  var form = document.getElementById('reset-password-form');
  if (!form) return;
  var errorEl = form.querySelector('[data-auth-error]');
  var messageEl = document.querySelector('[data-reset-message]');
  var modal = document.querySelector('[data-success-modal]');
  var modalContinueBtn = document.querySelector('[data-modal-continue]');
  var submitBtn = form.querySelector('[data-reset-submit]');
  var submitText = submitBtn ? submitBtn.querySelector('.auth__submit-text') : null;
  var spinner = form.querySelector('[data-reset-spinner]');

  function setLoading(isLoading) {
    if (submitBtn) submitBtn.disabled = isLoading;
    if (spinner) spinner.hidden = !isLoading;
    if (submitText) submitText.textContent = isLoading ? 'Resetting...' : 'Reset Password';
  }

if (messageEl) {
  var params = new URLSearchParams(window.location.search);
  var email = params.get('email');
  messageEl.textContent = email
    ? "Create a new password for " + email + "."
    : "Create a new password for your account.";
}
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var newPassword = form.querySelector('#reset-new-password').value;
    var confirmPassword = form.querySelector('#reset-confirm-password').value;
if (!isPasswordFullyValid(newPassword) || !isPasswordFullyValid(confirmPassword)) {
  showError(errorEl, 'Please meet all password requirements below.');
  return;
}
    if (newPassword !== confirmPassword) {
      showError(errorEl, "Those passwords don't match.");
      return;
    }
    hideError(errorEl);
    setLoading(true);

    // NOTE: no backend yet — swap this for a real "set new password"
    // API call once ready. For now, show the confirmation modal.
    setTimeout(function () {
      setLoading(false);
      if (modal) modal.hidden = false;
    }, 900);
  });
  if (modalContinueBtn) {
    modalContinueBtn.addEventListener('click', function () {
      window.location.href = 'login.html';
    });
  }
  // Clicking the dimmed/blurred backdrop (outside the modal box) does the
  // same thing as the button — there's no separate close (X) icon by design.
  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        window.location.href = 'login.html';
      }
    });
  }
}

/* -----------------------------
   Live password requirement checklist
   ----------------------------- */
function initPasswordChecklists() {
  var allowedPattern = /^[^\s]*$/;
  var symbolPattern = /[^A-Za-z0-9]/;

  document.querySelectorAll('[data-pw-checklist]').forEach(function (checklist) {
    var fieldId = checklist.dataset.pwChecklist;
    var input = document.getElementById(fieldId);
    if (!input) return;

    var invalidEl = checklist.querySelector('[data-pw-invalid]');

    input.addEventListener('focus', function () {
      checklist.classList.add('is-active');
    });

    input.addEventListener('blur', function () {
      checklist.classList.remove('is-active');
    });

    input.addEventListener('input', function () {
      var value = input.value;

      var badChar = null;
      for (var i = 0; i < value.length; i++) {
        if (!allowedPattern.test(value[i])) {
          badChar = value[i];
          break;
        }
      }

if (badChar) {
  invalidEl.textContent = badChar === ' ' ? 'No space allowed' : 'Invalid "' + badChar + '"';
  invalidEl.classList.add('is-visible');
} else {
  invalidEl.textContent = '';
  invalidEl.classList.remove('is-visible');
}

      var cleaned = value.split('').filter(function (ch) {
        return allowedPattern.test(ch);
      }).join('');
      if (cleaned !== value) {
        input.value = cleaned;
        value = cleaned;
      }

      setCheck(checklist, 'uppercase', /[A-Z]/.test(value));
      setCheck(checklist, 'lowercase', /[a-z]/.test(value));
      setCheck(checklist, 'number', /[0-9]/.test(value));
      setCheck(checklist, 'length', value.length >= 8);
      setCheck(checklist, 'symbol', symbolPattern.test(value));
    });
  });

  function setCheck(checklist, key, isValid) {
    var item = checklist.querySelector('[data-check="' + key + '"]');
    if (item) item.classList.toggle('is-valid', isValid);
  }

}

function isPasswordFullyValid(value) {
  return /[A-Z]/.test(value) &&
         /[a-z]/.test(value) &&
         /[0-9]/.test(value) &&
         /[^A-Za-z0-9]/.test(value) &&
         value.length >= 8 &&
         /^[^\s]+$/.test(value);
}