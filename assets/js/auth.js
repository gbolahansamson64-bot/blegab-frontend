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
const API_URL = "https://api.blegab.com.com/api";

document.addEventListener('DOMContentLoaded', async function () {
  await loadCurrentUser();
  initPasswordToggles();
  initPasswordChecklists();
  initSignupForm();
  initLoginForm();
  initGoogleButtons();
  initForgotPasswordForm();
  initVerifyCodeForm();
  initResetPasswordForm();
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

/* -----------------------------
   Signup form (signup.html)
   ----------------------------- */
function initSignupForm() {
  var form = document.getElementById("signup-form");
  if (!form) return;

  var errorEl = form.querySelector("[data-auth-error]");
  var submitBtn = form.querySelector(".auth__submit");
  var checkboxLabel = form.querySelector(".auth__checkbox");
  var checkbox = checkboxLabel.querySelector("input");

  var requiredFields = [
    form.querySelector("#signup-first-name"),
    form.querySelector("#signup-email"),
    form.querySelector("#signup-password"),
    form.querySelector("#signup-confirm-password"),
  ];

  function isFormComplete() {
    var filled = requiredFields.every(function (input) {
      return input.value.trim() !== "";
    });

    return filled && checkbox.checked;
  }

  function updateSubmitState() {
    submitBtn.classList.toggle("is-disabled", !isFormComplete());
  }

  function showFieldError(input, message) {
    var wrapper = input.closest(".auth__field");
    if (!wrapper) return;

    wrapper.classList.add("auth__field--invalid");

    var errorSpan = wrapper.querySelector(".auth__field-error");

    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "auth__field-error";
      wrapper.appendChild(errorSpan);
    }

    errorSpan.textContent = message;
    errorSpan.classList.add("is-visible");
  }

  function clearFieldError(input) {
    var wrapper = input.closest(".auth__field");

    if (!wrapper) return;

    wrapper.classList.remove("auth__field--invalid");

    var errorSpan = wrapper.querySelector(".auth__field-error");

    if (errorSpan) {
      errorSpan.classList.remove("is-visible");
    }
  }

  requiredFields.forEach(function (input) {
    input.addEventListener("input", function () {
      clearFieldError(input);
      updateSubmitState();
    });
  });

  checkbox.addEventListener("change", function () {
    checkboxLabel.classList.remove("auth__checkbox--invalid");
    updateSubmitState();
  });

  updateSubmitState();

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    hideError(errorEl);

    var firstInvalid = null;

    requiredFields.forEach(function (input) {
      if (input.value.trim() === "") {
        showFieldError(input, "This field is required.");

        if (!firstInvalid) {
          firstInvalid = input;
        }
      } else {
        clearFieldError(input);
      }
    });

    if (!checkbox.checked) {
      checkboxLabel.classList.add("auth__checkbox--invalid");

      showError(
        errorEl,
        "Please agree to the Terms of Service and Privacy Policy."
      );

      if (!firstInvalid) {
        firstInvalid = checkbox;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var firstName = form.querySelector("#signup-first-name").value.trim();
    var lastName = form.querySelector("#signup-last-name").value.trim();
    var email = form.querySelector("#signup-email").value.trim();
    var password = form.querySelector("#signup-password").value;
    var confirmPassword =
      form.querySelector("#signup-confirm-password").value;

    if (password.length < 8) {
      showError(errorEl, "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showError(errorEl, "Passwords do not match.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      const response = await fetch(API_URL + "/auth/register", {

    method: "POST",

    credentials: "include",

    headers: {

        "Content-Type": "application/json"

    },

    body: JSON.stringify({

        firstName,

        lastName,

        email,

        password

    })

});

      const data = await response.json();

      if (!response.ok) {
        showError(errorEl, data.message || "Registration failed.");

        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";

        return;
      }

      // Save User
      await loadCurrentUser();

      window.location.href = "index.html";

    } catch (error) {
      console.error(error);

      showError(
        errorEl,
        "Unable to connect to the server."
      );

      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
}

/* -----------------------------
   Login form (login.html)
----------------------------- */
function initLoginForm() {
  var form = document.getElementById("login-form");
  if (!form) return;

  var errorEl = form.querySelector("[data-auth-error]");
  var submitBtn = form.querySelector(".auth__submit");

  var requiredFields = [
    form.querySelector("#login-email"),
    form.querySelector("#login-password"),
  ];

  function isFormComplete() {
    return requiredFields.every(function (input) {
      return input.value.trim() !== "";
    });
  }

  function updateSubmitState() {
    submitBtn.classList.toggle("is-disabled", !isFormComplete());
  }

  function showFieldError(input, message) {
    var wrapper = input.closest(".auth__field");
    if (!wrapper) return;

    wrapper.classList.add("auth__field--invalid");

    var errorSpan = wrapper.querySelector(".auth__field-error");

    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "auth__field-error";
      wrapper.appendChild(errorSpan);
    }

    errorSpan.textContent = message;
    errorSpan.classList.add("is-visible");
  }

  function clearFieldError(input) {
    var wrapper = input.closest(".auth__field");
    if (!wrapper) return;

    wrapper.classList.remove("auth__field--invalid");

    var errorSpan = wrapper.querySelector(".auth__field-error");

    if (errorSpan) {
      errorSpan.classList.remove("is-visible");
    }
  }

  requiredFields.forEach(function (input) {
    input.addEventListener("input", function () {
      clearFieldError(input);
      updateSubmitState();
    });
  });

  updateSubmitState();

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    var firstInvalid = null;

    requiredFields.forEach(function (input) {
      if (input.value.trim() === "") {
        showFieldError(input, "This field is required.");

        if (!firstInvalid) {
          firstInvalid = input;
        }
      } else {
        clearFieldError(input);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    hideError(errorEl);

    var email = form.querySelector("#login-email").value.trim();
    var password = form.querySelector("#login-password").value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing In...";

    try {
      const response = await fetch(`${API_URL}/auth/login`, {

  method: "POST",

  credentials: "include",

  headers: {
    "Content-Type": "application/json",
  },

  body: JSON.stringify({

    email,
    password

  })

});

      const data = await response.json();

      if (!response.ok) {
        showError(errorEl, data.message || "Login failed.");

        submitBtn.disabled = false;
        submitBtn.textContent = "Sign In";
        return;
      }

      // Save User
      await loadCurrentUser();

      window.location.href = "index.html";

    } catch (error) {

      console.error(error);

      showError(
        errorEl,
        "Unable to connect to the server."
      );

      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
}

/* -----------------------------
   Forgot password form (forgot-password.html)
   ----------------------------- */
function initForgotPasswordForm() {

    var form = document.getElementById("forgot-password-form");

    if (!form) return;

    var errorEl = form.querySelector("[data-auth-error]");

    var emailInput = form.querySelector("#forgot-password-email");

    var prefillEmail =
        new URLSearchParams(window.location.search)
        .get("email");

    if (prefillEmail && emailInput) {
        emailInput.value = prefillEmail;
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        var email = emailInput.value.trim();

        var emailPattern =
            /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

        if (!emailPattern.test(email)) {

            showError(
                errorEl,
                "Please enter a valid email address."
            );

            return;
        }

        hideError(errorEl);

        fetch(API_URL + "/auth/forgot-password", {

            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email
            })

        })

        .then(function(response){

            return response.json();

        })

        .then(function(data){

            if(
                data.message ===
                "Password reset code sent successfully"
            ){

                window.location.href =
                    "verify-code.html?email=" +
                    encodeURIComponent(email);

            }else{

                showError(errorEl, data.message);

            }

        })

        .catch(function(){

            showError(
                errorEl,
                "Something went wrong. Please try again."
            );

        });

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

  form.addEventListener("submit", async function (event) {

    event.preventDefault();

    var code = form.querySelector("#verify-code").value.trim();

    if (code === "") {

        showError(errorEl, "Please enter the code we sent you.");

        return;

    }

    hideError(errorEl);

    setLoading(true);

    try {

        const response = await fetch(

           API_URL + "/auth/verify-reset-code",

            {

                method: "POST",

                credentials: "include",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    email: email,

                    otp: code

                })

            }

        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message);

        }

        window.location.href =

            "reset-password.html?email=" +

            encodeURIComponent(email);

    }

    catch (error) {

        showError(errorEl, error.message);

    }

    finally {

        setLoading(false);

    }

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

function initGoogleButtons() {

    var buttons = document.querySelectorAll("[data-google-auth]");

    if (!buttons.length) return;

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            window.location.assign(
                API_URL + "/auth/google"
            );

        });

    });

}

async function loadCurrentUser() {

    try {

        const response = await fetch(

            API_URL + "/auth/me",

            {

                credentials: "include"

            }

        );

        if (!response.ok) {

            return null;

        }

        const data = await response.json();

        localStorage.setItem(

            "user",

            JSON.stringify(data.user)

        );

        if (window.BLEGAB_AUTH) {

            window.BLEGAB_AUTH.signIn({

                name:
                    data.user.firstName +
                    " " +
                    data.user.lastName,

                email: data.user.email,

                picture: data.user.avatar || ""

            });

        }

        return data.user;

    }

    catch (error) {

        console.error(error);

        return null;

    }

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
    if (newPassword.length < 8) {
      showError(errorEl, "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(errorEl, "Those passwords don't match.");
      return;
    }
    hideError(errorEl);
    setLoading(true);

fetch(API_URL + "/auth/reset-password", {

  method: "POST",

  credentials:"include",

  headers: {
    "Content-Type": "application/json"
  },

  body: JSON.stringify({

    email: email,

    password: newPassword

  })

})

.then(function (response) {

  return response.json().then(function (data) {

    return {
      ok: response.ok,
      data: data
    };

  });

})

.then(function (result) {

  setLoading(false);

  if (!result.ok) {

    showError(errorEl, result.data.message);

    return;

  }

  if (modal) {

    modal.hidden = false;

  }

})

.catch(function () {

  setLoading(false);

  showError(

    errorEl,

    "Something went wrong. Please try again."

  );

});
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