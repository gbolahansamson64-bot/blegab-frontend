/* =========================================================
   ADMIN AUTHENTICATION
   Handles:
   - Login
   - Register
   - Forgot Password
   - Verify Reset Code
   - Reset Password

   Communicates with the Express backend API.
========================================================= */

const API_BASE = "https://backend-6j62.onrender.com";

document.addEventListener("DOMContentLoaded", async function () {

    try {

        const response = await fetch(`${API_BASE}/api/admin/me`, {
            method: "GET",
            credentials: "include"
        });

        if (response.ok) {
            window.location.href = "admin.html";
            return;
        }

    } catch (error) {
        // Not logged in, stay on authentication pages.
    }

    initPasswordToggles();
    initAdminLoginForm();
    initAdminSignupForm();
    initAdminForgotForm();
    initAdminVerifyForm();
    initAdminResetForm();
    initPasswordChecklistDropdowns();

    const params = new URLSearchParams(window.location.search);

if (params.get("reset") === "success") {

    const errorBox = document.querySelector("[data-auth-error]");

    if (errorBox) {

        errorBox.hidden = false;

        errorBox.textContent =
            "Password reset successfully. Please sign in with your new credentials.";

        errorBox.style.color = "#16a34a";
        errorBox.style.background = "#dcfce7";
        errorBox.style.border = "1px solid #86efac";

    }

}

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

    if (!email || !password || !accessCode) {
      showAuthError('Please fill in every field, including your admin access code.');
      return;
    }
    if (!isValidAccessCode(accessCode)) {
      showAuthError('Admin access code must be exactly 8 digits (numbers only).');
      return;
    }

    setSubmitLoading(form, true);

   fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email,
        password,
        accessCode
    })
   })
    .then(res => res.json())
    .then(data => {

    setSubmitLoading(form,false);

    if(!data.success){
        showAuthError(data.message);
        return;
    }

    window.location.href="admin.html";

})
.catch(err=>{

    setSubmitLoading(form,false);

    showAuthError("Something went wrong.");

});
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

    setSubmitLoading(form, true);

fetch(`${API_BASE}/api/admin/register`, {

    method: "POST",

    headers: {

        "Content-Type": "application/json"

    },

    credentials: "include",

    body: JSON.stringify({

        name,

        email,

        password,

        accessCode,
        
        masterSecret

    })

})
.then(async (res)=>{

    const data = await res.json();

    if(!res.ok){

        setSubmitLoading(form,false);

        return showAuthError(data.message);

    }

    window.location.href="admin.html";

})
.catch(()=>{

    setSubmitLoading(form,false);

    showAuthError("Unable to register.");

});
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

    setSubmitLoading(form, true);

fetch(`${API_BASE}/api/admin/forgot-password`, {

    method: "POST",

    credentials: "include",

    headers: {

        "Content-Type":"application/json"

    },

    body: JSON.stringify({

        email,

        type: typeInput.value

    })

})
.then(async(res)=>{

    const data = await res.json();

    if(!res.ok){

        setSubmitLoading(form,false);

        return showAuthError(data.message);

    }

    window.location.href=
        "admin-verify-code.html?type="
        +typeInput.value+
        "&email="+encodeURIComponent(email);

})
.catch(()=>{

    setSubmitLoading(form,false);

    showAuthError("Unable to send code.");

});
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

    setSubmitLoading(form,true);

fetch(`${API_BASE}/api/admin/verify-reset-code`,{

    method:"POST",

    credentials:"include",

    headers:{

        "Content-Type":"application/json"

    },

    body:JSON.stringify({

        email,

        type,

        code:enteredCode

    })

})
.then(async(res)=>{

    const data=await res.json();

    if(!res.ok){

        setSubmitLoading(form,false);

        return showAuthError(data.message);

    }

    window.location.href =
     "admin-reset-password.html?type="
     + type
     + "&email="
     + encodeURIComponent(email)
     + "&code="
     + encodeURIComponent(enteredCode);

    })
.catch(()=>{

    setSubmitLoading(form,false);

    showAuthError("Verification failed.");

});
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


    setSubmitLoading(form, true);

const params = new URLSearchParams(window.location.search);

const email = params.get("email");
const code = params.get("code");

if (!email || !code) {
    setSubmitLoading(form, false);
    return showAuthError("Invalid or expired reset link.");
}

const body = {
    email,
    type,
    code
};

if (type === "password") {

    const newPassword = form.newPassword.value;
    const confirmNewPassword = form.confirmNewPassword.value;

    if (!newPassword || !confirmNewPassword) {
        setSubmitLoading(form, false);
        return showAuthError("Please fill in all password fields.");
    }

    if (!isStrongAdminPassword(newPassword)) {
        setSubmitLoading(form, false);
        return showAuthError("Password does not meet the requirements.");
    }

    if (newPassword !== confirmNewPassword) {
        setSubmitLoading(form, false);
        return showAuthError("Passwords do not match.");
    }

    body.newPassword = newPassword;

} else {

    const newAccessCode = form.newAccessCode.value.trim();
    const confirmAccessCode = form.confirmAccessCode.value.trim();

    if (!newAccessCode || !confirmAccessCode) {
        setSubmitLoading(form, false);
        return showAuthError("Please fill in all access code fields.");
    }

    if (!isValidAccessCode(newAccessCode)) {
        setSubmitLoading(form, false);
        return showAuthError("Access code must be exactly 8 digits.");
    }

    if (newAccessCode !== confirmAccessCode) {
        setSubmitLoading(form, false);
        return showAuthError("Access codes do not match.");
    }

    body.newAccessCode = newAccessCode;

}

fetch(`${API_BASE}/api/admin/reset-password`, {

    method: "POST",

    credentials: "include",

    headers: {

        "Content-Type":"application/json"

    },

    body: JSON.stringify(body)

})
.then(async(res)=>{

    const data = await res.json();

    if(!res.ok){

        setSubmitLoading(form,false);

        return showAuthError(data.message);

    }

    setSubmitLoading(form, false);

    window.location.href = "admin-login.html?reset=success";

})
.catch(()=>{

    setSubmitLoading(form,false);

    showAuthError("Unable to reset credentials.");

});
  });
}