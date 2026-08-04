// assets/js/admin-auth.js
/* =========================================================
   ADMIN LOGIN / SIGNUP PAGE LOGIC
   Frontend-only mock — validates the form, then calls
   window.BLEGAB_ADMIN_AUTH.signIn() (defined in admin.js) and
   redirects to admin.html. Swap the checks marked below for
   real API calls once the backend exists.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  // Already signed in? Skip straight past the auth page.
  if (window.BLEGAB_ADMIN_AUTH && window.BLEGAB_ADMIN_AUTH.getUser()) {
    window.location.href = 'admin.html';
    return;
  }

  initPasswordToggles();
  initAdminLoginForm();
  initAdminSignupForm();
  initAdminForgotForm();
  initAdminVerifyForm();
  initAdminResetForm();
  initPasswordChecklistDropdowns();
});

/* -----------------------------
   Shared helpers
   ----------------------------- */
function showAuthError(message) {
  var el = document.querySelector('[data-auth-error]');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function hideAuthError() {
  var el = document.querySelector('[data-auth-error]');
  if (!el) return;
  el.hidden = true;
  el.textContent = '';
}

function isValidAccessCode(code) {
  return /^\d{8}$/.test(code);
}

function setSubmitLoading(form, isLoading) {
  var btn = form.querySelector('[data-submit-btn]');
  var text = btn.querySelector('.admin-auth-submit-text');
  var spinner = btn.querySelector('[data-submit-spinner]');
  btn.disabled = isLoading;
  text.hidden = isLoading;
  spinner.hidden = !isLoading;
}

function initPasswordToggles() {
  // Live-strip non-digits and cap at 8 chars as the person types
  document.querySelectorAll('[data-access-code-input]').forEach(function (input) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, 8);
    });
  });

  // Wire up the show/hide (eye icon) buttons next to password fields
  document.querySelectorAll('[data-password-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('input');
      if (!input) return;
      var isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });
}

/* -----------------------------
   Sign in
   ----------------------------- */
function initAdminLoginForm() {
  var form = document.querySelector('[data-admin-login-form]');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideAuthError();

    var email = form.email.value.trim();
    var password = form.password.value;
    var accessCode = form.accessCode.value.trim();
    var masterSecret = form.masterSecret.value.trim();

    if (!email || !password || !accessCode || !masterSecret) {
      showAuthError('Please fill in every field, including your admin access code.');
      return;
    }
    if (!isValidAccessCode(accessCode)) {
      showAuthError('Admin access code must be exactly 8 digits (numbers only).');
      return;
    }

    // TODO (backend): replace this whole block with a real API call —
    // this mock just checks against the one account signup stored locally.
    var account = null;
    try { account = JSON.parse(localStorage.getItem('blegab_admin_account')); } catch (err) {}

    if (!account) {
      showAuthError('No admin account found — please sign up first.');
      return;
    }
    if (email !== account.email || password !== account.password) {
      showAuthError('Incorrect email or password.');
      return;
    }
  if (accessCode !== account.accessCode) {
      showAuthError('Incorrect admin access code.');
      return;
    }
    if (masterSecret !== account.masterSecret) {
      showAuthError('Incorrect master admin secret.');
      return;
    }

    setSubmitLoading(form, true);
    setTimeout(function () {
      window.BLEGAB_ADMIN_AUTH.signIn({ name: account.name, email: account.email });
      window.location.href = 'admin.html';
    }, 2000);
  });
}

/* -----------------------------
   Sign up
   ----------------------------- */
function initAdminSignupForm() {
  var form = document.querySelector('[data-admin-signup-form]');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideAuthError();

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var password = form.password.value;
    var confirmPassword = form.confirmPassword.value;
    var accessCode = form.accessCode.value.trim();
    var masterSecret = form.masterSecret.value.trim();

    if (!name || !email || !password || !confirmPassword || !accessCode || !masterSecret) {
      showAuthError('Please fill in every field.');
      return;
    }
    if (!isStrongAdminPassword(password)) {
      showAuthError('Password does not meet the requirements below.');
      return;
    }
    if (password !== confirmPassword) {
      showAuthError('Passwords do not match.');
      return;
    }
    if (!isValidAccessCode(accessCode)) {
      showAuthError('Admin access code must be exactly 8 digits (numbers only).');
      return;
    }

    // TODO (backend): replace with a real account-creation call and
    // hash the password + access code server-side before storing them.
    var account = { name: name, email: email, password: password, accessCode: accessCode, masterSecret: masterSecret };
    localStorage.setItem('blegab_admin_account', JSON.stringify(account));

    setSubmitLoading(form, true);
    setTimeout(function () {
      window.BLEGAB_ADMIN_AUTH.signIn({ name: name, email: email });
      window.location.href = 'admin.html';
    }, 2000);
  });
}

/* -----------------------------
   Forgot password / access code
   (admin-forgot-password.html)
   ----------------------------- */
function initAdminForgotForm() {
  var form = document.querySelector('[data-admin-forgot-form]');
  if (!form) return;

  var typeInput = form.querySelector('[name="recoveryType"]');
  var toggleBtns = document.querySelectorAll('[data-recovery-toggle-btn]');

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      typeInput.value = btn.getAttribute('data-recovery-type');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideAuthError();

    var email = form.email.value.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showAuthError('Enter the email address on file for this admin account.');
      return;
    }

    // TODO (backend): replace with a real call that emails a one-time
    // verification code — this mock just confirms the account exists
    // locally. The actual 6-digit code is generated and verified by
    // the backend, not checked here.
    var account = null;
    try { account = JSON.parse(localStorage.getItem('blegab_admin_account')); } catch (err) {}

    if (!account || account.email !== email) {
      showAuthError('No admin account found for that email.');
      return;
    }

    setSubmitLoading(form, true);
    setTimeout(function () {
      var query = '?type=' + encodeURIComponent(typeInput.value) + '&email=' + encodeURIComponent(email);
      window.location.href = 'admin-verify-code.html' + query;
    }, 2000);
  });
}

/* -----------------------------
   Verify recovery code
   (admin-verify-code.html)
   ----------------------------- */
function initAdminVerifyForm() {
  var form = document.querySelector('[data-admin-verify-form]');
  if (!form) return;

  var params = new URLSearchParams(window.location.search);
  var type = params.get('type') === 'code' ? 'code' : 'password';
  var email = params.get('email') || '';

  var emailField = document.getElementById('admin-verify-email');
  if (emailField) emailField.value = email;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideAuthError();

    var enteredCode = form.verificationCode.value.trim();

    if (!/^\d{6}$/.test(enteredCode)) {
      showAuthError('Enter the 6-digit code sent to your email.');
      return;
    }

    // TODO (backend): send { email, type, code } to the server here and
    // only proceed on a successful response. This mock accepts any
    // correctly-formatted 6-digit code since the backend isn't wired up yet.

    setSubmitLoading(form, true);
    setTimeout(function () {
      window.location.href = 'admin-reset-password.html?type=' + encodeURIComponent(type);
    }, 1500);
  });
}

/* -----------------------------
   Password checklist dropdowns
   (admin-signup.html + admin-reset-password.html)
   ----------------------------- */
function initPasswordChecklistDropdowns() {
  document.querySelectorAll('[data-pw-checklist-input]').forEach(function (input) {
    var wrapper = input.closest('.admin-auth-field--password-dropdown');
    var checklist = wrapper ? wrapper.querySelector('.admin-pw-checklist') : null;
    if (!checklist) return;

    input.addEventListener('focus', function () {
      checklist.classList.add('is-open');
    });
    input.addEventListener('blur', function () {
      checklist.classList.remove('is-open');
    });
    input.addEventListener('input', function () {
      updateAdminPasswordChecklist(input.value);
    });
  });
}

/* -----------------------------
   Reset password / access code
   (admin-reset-password.html)
   ----------------------------- */
function isStrongAdminPassword(password) {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[#@*,.]/.test(password);
}

function updateAdminPasswordChecklist(password) {
  var checks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    length: password.length >= 8,
    symbol: /[#@*,.]/.test(password)
  };
  Object.keys(checks).forEach(function (key) {
    var item = document.querySelector('.admin-pw-checklist__item[data-check="' + key + '"]');
    if (item) item.classList.toggle('is-valid', checks[key]);
  });
}

function initAdminResetForm() {
  var form = document.querySelector('[data-admin-reset-form]');
  if (!form) return;

  var type = new URLSearchParams(window.location.search).get('type') === 'code' ? 'code' : 'password';

  var passwordFields = document.querySelector('[data-reset-password-fields]');
  var codeFields = document.querySelector('[data-reset-code-fields]');
  var title = document.querySelector('[data-reset-title]');
  var subtitle = document.querySelector('[data-reset-subtitle]');
  var submitText = document.querySelector('[data-reset-submit-text]');

  if (type === 'code') {
    if (passwordFields) passwordFields.hidden = true;
    if (codeFields) codeFields.hidden = false;
    if (title) title.textContent = 'Reset Access Code';
    if (subtitle) subtitle.textContent = 'Enter and confirm a new 8-digit admin access code.';
    if (submitText) submitText.textContent = 'Save New Access Code';
  } else {
    if (passwordFields) passwordFields.hidden = false;
    if (codeFields) codeFields.hidden = true;
    if (title) title.textContent = 'Reset Password';
    if (subtitle) subtitle.textContent = 'Enter and confirm a new admin password.';
    if (submitText) submitText.textContent = 'Save New Password';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideAuthError();

    // TODO (backend): this should verify a real recovery token/session
    // before allowing the credential update, not just edit local storage.
    var account = null;
    try { account = JSON.parse(localStorage.getItem('blegab_admin_account')); } catch (err) {}
    if (!account) {
      showAuthError('No admin account found on this device.');
      return;
    }

    if (type === 'code') {
      var newCode = form.newAccessCode.value.trim();
      var confirmCode = form.confirmAccessCode.value.trim();
      if (!isValidAccessCode(newCode)) {
        showAuthError('Access code must be exactly 8 digits (numbers only).');
        return;
      }
      if (newCode !== confirmCode) {
        showAuthError('Access codes do not match.');
        return;
      }
      account.accessCode = newCode;
    } else {
      var newPassword = form.newPassword.value;
      var confirmPassword = form.confirmNewPassword.value;
      if (!isStrongAdminPassword(newPassword)) {
        showAuthError('Password does not meet the requirements below.');
        return;
      }
      if (newPassword !== confirmPassword) {
        showAuthError('Passwords do not match.');
        return;
      }
      account.password = newPassword;
    }

    localStorage.setItem('blegab_admin_account', JSON.stringify(account));

    setSubmitLoading(form, true);
    setTimeout(function () {
      window.location.href = 'admin-login.html';
    }, 2000);
  });
}