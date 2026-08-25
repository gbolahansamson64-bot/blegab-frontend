/* =========================================================
   BLEGAB CHECKOUT
   - All countries available to guest checkout.
   - All states/cities are supplied by country-state-city.
   - Shipping rules come only from shipping-calculator.js.
   - Backend/API endpoints are unchanged.
   ========================================================= */

const CHECKOUT_API_URL = "https://api.blegab.com/api";
const LOCATION_MODULE_URL =
  "https://cdn.jsdelivr.net/npm/@countrystatecity/countries-browser@1.0.4/+esm";
const WHATSAPP_NUMBER = "14696180809";

async function createCheckoutSession(checkoutData) {
  // --------------------------------------------------
  // Convert the frontend cart response into the format
  // expected by the backend guest checkout.
  //
  // Backend expects:
  //
  // items: [
  //   {
  //     productId: "...",
  //     quantity: 2
  //   }
  // ]
  // --------------------------------------------------

  const payload = {
    ...checkoutData,
  };

  if (!Array.isArray(payload.items) && payload.cart?.cart?.items) {
    payload.items = payload.cart.cart.items
      .filter(function (item) {
        return item.product && item.product._id;
      })
      .map(function (item) {
        return {
          productId: item.product._id,
          quantity: Number(item.quantity),
        };
      });
  }

  // The backend does not need the full frontend cart object.
  delete payload.cart;

  const response = await fetch(`${CHECKOUT_API_URL}/orders/checkout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create Stripe checkout.");
  }

  if (!data.url) {
    throw new Error("Stripe checkout URL was not returned by the server.");
  }

  return data;
}

function setButtonLoading(button, loading) {
  if (
    window.BLEGAB_BUTTONS &&
    typeof window.BLEGAB_BUTTONS.setLoading === "function"
  ) {
    window.BLEGAB_BUTTONS.setLoading(button, loading);
  } else if (button) {
    button.disabled = !!loading;
  }
}

function getUserCountryValue(user) {
  return user?.address?.country || user?.country || "";
}

function getUserStateValue(user) {
  return user?.address?.state || user?.state || "";
}

function getUserCityValue(user) {
  return user?.address?.city || user?.city || "";
}

// Fields a registered user needs saved on their profile before we can
// checkout using their account info (country is handled separately
// via the account country selector in the modal).
function getMissingProfileFields(user) {
  const address = user?.address || {};
  const missing = [];
  if (!String(address.street || "").trim()) missing.push("street address");
  if (!String(getUserStateValue(user) || "").trim()) missing.push("state");
  if (!String(getUserCityValue(user) || "").trim()) missing.push("city");
  if (!String(address.postalCode || "").trim()) missing.push("postal code");
  return missing;
}

function normalizeLocationValue(value, countries, finder) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  return (
    countries.find((c) => String(c.isoCode).toLowerCase() === lower) ||
    countries.find((c) => String(c.name).toLowerCase() === lower) ||
    (finder ? finder(raw) : null)
  );
}

function initCheckoutModal() {
  const overlay = document.querySelector("[data-checkout-modal-overlay]");
  const modal = document.querySelector("[data-checkout-modal]");
  const checkoutBtn = document.querySelector("[data-checkout]");
  if (!overlay || !modal || !checkoutBtn) return;

  const continueBtn = modal.querySelector("[data-checkout-continue]");
  const accountCheckoutBtn = modal.querySelector(
    '[data-checkout-option="account"]',
  );
  const guestCheckoutBtn = modal.querySelector(
    '[data-checkout-option="guest"]',
  );
  const signupCheckoutBtn = modal.querySelector(
    '[data-checkout-option="signup"]',
  );
  const closeBtns = modal.querySelectorAll("[data-checkout-modal-close]");
  const stepIndicators = modal.querySelectorAll(
    "[data-checkout-step-indicator]",
  );
  const stepPanels = modal.querySelectorAll("[data-checkout-step-panel]");
  const checkoutUserNameEl = modal.querySelector("[data-checkout-user-name]");
  const accountCountryPanel = modal.querySelector(
    "[data-account-country-panel]",
  );
  const accountCountryEl = modal.querySelector("#checkout-account-country");
  const accountContactAdminBtn = modal.querySelector(
    "[data-account-contact-admin]",
  );
  const accountIncompleteProfileEl = modal.querySelector(
    "[data-account-incomplete-profile]",
  );
  const accountIncompleteProfileTextEl = modal.querySelector(
    "[data-account-incomplete-profile-text]",
  );
  const guestCountryEl = modal.querySelector("#checkout-country");
  const guestContactAdminBtn = modal.querySelector(
    "[data-guest-contact-admin]",
  );
  const guestStateEl = modal.querySelector("#checkout-state");
  const guestStateListEl = modal.querySelector("[data-state-combobox-list]");
  const guestCityEl = modal.querySelector("#checkout-city");
  const guestCityListEl = modal.querySelector("[data-city-combobox-list]");
  const contactAdminBtn = modal.querySelector("[data-contact-admin-shipping]");
  const shippingRowEl = modal.querySelector("[data-checkout-shipping-row]");
  const shippingCostEl = modal.querySelector(
    "[data-checkout-summary-shipping]",
  );
  const totalEl = modal.querySelector("[data-checkout-summary-total]");
  const subtotalEl = modal.querySelector("[data-checkout-summary-subtotal]");
  const countEl = modal.querySelector("[data-checkout-summary-count]");
  const ctaTotalEl = modal.querySelector("[data-checkout-cta-total]");

  let currentStep = 1;
  let currentCheckoutUser = null;
  let locationData = null;
  let subtotal = 0;
  let currentShipping = null;
  let accountCountryCode = "";
  let guestStateOptions = [];
  let guestCityOptions = [];
  let currentProfileMissingFields = [];

  function shippingApi() {
    return window.BLEGAB_SHIPPING || null;
  }

  function shippingRule(countryCode) {
    const api = shippingApi();
    return api
      ? api.getShippingRule(countryCode)
      : {
          supported: false,
          contactAdmin: true,
          cost: null,
        };
  }

  function contactWhatsApp(countryName) {
    const message = countryName
      ? `Hello Blegab, I need the shipping fee for ${countryName}.`
      : "Hello Blegab, I need information about the shipping fee for my country.";
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  if (contactAdminBtn) {
    contactAdminBtn.addEventListener("click", function (event) {
      event.preventDefault();
      const countryName = currentCheckoutUser
        ? getCountryName(accountCountryCode)
        : getCountryName(guestCountryEl?.value);
      contactWhatsApp(countryName);
    });
  }

  function getCountryName(code) {
    const country = locationData?.countries?.find(
      (c) => c.isoCode === String(code || "").toUpperCase(),
    );
    return country ? country.name : String(code || "");
  }

  function normalizeCountry(value) {
    const country = normalizeLocationValue(
      value,
      locationData?.countries || [],
    );
    return country ? country.isoCode : "";
  }

  async function normalizeState(countryCode, value) {
    const raw = String(value || "")
      .trim()
      .toLowerCase();

    if (!raw || !countryCode || !locationData) {
      return "";
    }

    const states = await locationData.getStatesOfCountry(countryCode);

    const state =
      states.find(
        (s) => String(s.isoCode || s.iso2 || "").toLowerCase() === raw,
      ) || states.find((s) => String(s.name || "").toLowerCase() === raw);

    return state ? state.isoCode || state.iso2 || "" : "";
  }

  async function loadLocationData() {
    if (locationData) return locationData;

    const module = await import(LOCATION_MODULE_URL);

    const countries = await module.getCountries();

    locationData = {
      countries,

      getStatesOfCountry: module.getStatesOfCountry,

      getCitiesOfState: module.getCitiesOfState,
    };

    populateCountrySelect(guestCountryEl);
    populateCountrySelect(accountCountryEl);

    return locationData;
  }

  function populateCountrySelect(select) {
    if (!select || !locationData) return;
    select.innerHTML =
      '<option value="">Select your country</option>' +
      locationData.countries
        .map((c) => `<option value="${c.isoCode}">${c.name}</option>`)
        .join("");
  }

  async function getStates(countryCode) {
    if (!countryCode || !locationData) return [];

    return await locationData.getStatesOfCountry(countryCode);
  }

  async function getCities(countryCode, stateCode) {
    if (!countryCode || !stateCode || !locationData) return [];

    return await locationData.getCitiesOfState(countryCode, stateCode);
  }

  async function renderStateOptions(countryCode) {
    guestStateOptions = await getStates(countryCode);

    if (!guestStateEl) return;

    guestStateEl.value = "";
    guestStateEl.disabled = false;

    guestStateEl.placeholder = guestStateOptions.length
      ? "Search or enter your state"
      : "Enter your state";

    if (guestStateListEl) {
      guestStateListEl.hidden = true;
    }
  }

  async function renderCityOptions(countryCode, stateCode) {
    guestCityOptions = await getCities(countryCode, stateCode);

    if (!guestCityEl) return;

    guestCityEl.value = "";
    guestCityEl.disabled = !stateCode;

    guestCityEl.placeholder = stateCode
      ? guestCityOptions.length
        ? "Search for your city"
        : "Enter your city"
      : "Select state first";

    if (guestCityListEl) {
      guestCityListEl.hidden = true;
    }
  }

  function renderComboboxList(input, list, options, key) {
    if (!list || !input) return;
    const query = input.value.trim().toLowerCase();
    const filtered = query
      ? options.filter((item) => item.name.toLowerCase().includes(query))
      : options;

    if (!filtered.length) {
      list.innerHTML =
        '<li class="checkout-combobox__empty">No matching results</li>';
    } else {
      list.innerHTML = filtered
        .slice(0, 100)
        .map(
          (item) =>
            `<li class="checkout-combobox__option" data-${key}-value="${item.isoCode || item.name}">${item.name}</li>`,
        )
        .join("");
    }
    list.hidden = false;
  }

  if (guestStateEl) {
    guestStateEl.addEventListener("input", function () {
      renderComboboxList(
        guestStateEl,
        guestStateListEl,
        guestStateOptions,
        "state",
      );
      updateGuestContinueState();
    });
    guestStateEl.addEventListener("focus", function () {
      renderComboboxList(
        guestStateEl,
        guestStateListEl,
        guestStateOptions,
        "state",
      );
    });
  }

  if (guestStateListEl) {
    guestStateListEl.addEventListener("mousedown", (e) => e.preventDefault());
    guestStateListEl.addEventListener("click", function (e) {
      const option = e.target.closest("[data-state-value]");
      if (!option) return;
      const stateCode = option.getAttribute("data-state-value");
      const state = guestStateOptions.find((s) => s.isoCode === stateCode);
      if (!state) return;
      guestStateEl.value = state.name;
      guestStateListEl.hidden = true;
      renderCityOptions(guestCountryEl.value, state.isoCode).catch(
        console.error,
      );
      updateGuestContinueState();
    });
  }

  if (guestCityEl) {
    guestCityEl.addEventListener("input", function () {
      if (guestCityOptions.length)
        renderComboboxList(
          guestCityEl,
          guestCityListEl,
          guestCityOptions,
          "city",
        );
      updateGuestContinueState();
    });
    guestCityEl.addEventListener("focus", function () {
      if (guestCityOptions.length)
        renderComboboxList(
          guestCityEl,
          guestCityListEl,
          guestCityOptions,
          "city",
        );
    });
  }

  if (guestCityListEl) {
    guestCityListEl.addEventListener("mousedown", (e) => e.preventDefault());
    guestCityListEl.addEventListener("click", function (e) {
      const option = e.target.closest("[data-city-value]");
      if (!option) return;
      guestCityEl.value = option.getAttribute("data-city-value");
      guestCityListEl.hidden = true;
      updateGuestContinueState();
    });
  }

  if (guestCountryEl) {
    guestCountryEl.addEventListener("change", async function () {
      await renderStateOptions(guestCountryEl.value);
      await renderCityOptions(guestCountryEl.value, "");

      updateShipping(guestCountryEl.value, false);
      updateGuestContinueState();
    });
  }

  if (accountCountryEl) {
    accountCountryEl.addEventListener("change", function () {
      accountCountryCode = accountCountryEl.value;
      updateShipping(accountCountryCode, true);
      updateAccountButtonState();
    });
  }

  function getAllGuestFieldsFilled() {
    const ids = [
      "checkout-first-name",
      "checkout-last-name",
      "checkout-email",
      "checkout-country",
      "checkout-address",
      "checkout-state",
      "checkout-city",
      "checkout-zip",
    ];
    return ids.every((id) => {
      const el = modal.querySelector(`#${id}`);
      return el && String(el.value || "").trim() !== "";
    });
  }

  function updateShipping(countryCode, isAccount) {
    const rule = shippingRule(countryCode);
    currentShipping = rule;

    if (shippingRowEl) {
      shippingRowEl.classList.remove("is-contact-required");
    }

    if (contactAdminBtn) {
      contactAdminBtn.hidden = true;
    }

    if (accountContactAdminBtn) {
      accountContactAdminBtn.hidden = true;
    }

    if (guestContactAdminBtn) {
      guestContactAdminBtn.hidden = true;
    }

    // --------------------------------------------------
    // NO COUNTRY SELECTED
    // --------------------------------------------------

    if (!countryCode) {
      if (shippingCostEl) {
        shippingCostEl.textContent = "Select country";
      }

      if (totalEl) {
        totalEl.textContent = `$${subtotal.toFixed(2)}`;
      }

      if (ctaTotalEl) {
        ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
      }

      return rule;
    }

    // --------------------------------------------------
    // COUNTRY NOT SUPPORTED
    // --------------------------------------------------

    if (!rule.supported) {
      if (shippingCostEl) {
        shippingCostEl.textContent = "Contact Admin for shipping fee";
      }

      if (totalEl) {
        totalEl.textContent = `$${subtotal.toFixed(2)}`;
      }

      if (ctaTotalEl) {
        ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
      }

      if (shippingRowEl) {
        shippingRowEl.classList.add("is-contact-required");
      }

      // Guest checkout contact button
      if (contactAdminBtn) {
        contactAdminBtn.hidden = false;

        contactAdminBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`,
        )}`;
      }

      // Guest checkout contact button, inline right under the country field
      if (!isAccount && guestContactAdminBtn) {
        guestContactAdminBtn.hidden = false;

        guestContactAdminBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`,
        )}`;
      }

      // Registered customer contact button
      if (isAccount && accountContactAdminBtn) {
        accountContactAdminBtn.hidden = false;

        accountContactAdminBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`,
        )}`;
      }

      return rule;
    }

    // --------------------------------------------------
    // NORMAL SHIPPING FEE
    // --------------------------------------------------

    let shipping = Number(rule.cost || 0);

    const normalizedCountryCode = String(countryCode || "").toUpperCase();

    // --------------------------------------------------
    // FREE SHIPPING PROMOTION
    //
    // USA + Canada
    // Subtotal >= $500
    // --------------------------------------------------

    const qualifiesForFreeShipping =
      subtotal > 500 &&
      (normalizedCountryCode === "US" || normalizedCountryCode === "CA");

    if (qualifiesForFreeShipping) {
      shipping = 0;

      if (shippingCostEl) {
        shippingCostEl.textContent = "Free Shipping";
      }
    } else {
      if (shippingCostEl) {
        shippingCostEl.textContent = `$${shipping.toFixed(2)}`;
      }
    }

    // --------------------------------------------------
    // UPDATE TOTAL
    // --------------------------------------------------

    const total = subtotal + shipping;

    if (totalEl) {
      totalEl.textContent = `$${total.toFixed(2)}`;
    }

    if (ctaTotalEl) {
      ctaTotalEl.textContent = `$${total.toFixed(2)}`;
    }

    return {
      ...rule,
      cost: shipping,
      freeShipping: qualifiesForFreeShipping,
    };
  }

  function updateAccountButtonState() {
    if (!accountCheckoutBtn) return;

    const countrySupported =
      !!accountCountryCode && !!currentShipping?.supported;
    const profileComplete = currentProfileMissingFields.length === 0;
    const supported = countrySupported && profileComplete;
    const needsCountry = !accountCountryCode;

    // Keep the country selector visible at all times.
    // The user may want to change/reselect their country.
    if (accountCountryPanel) {
      accountCountryPanel.hidden = false;
    }

    // The "Continue as username" button is only enabled
    // when a valid/supported country has been selected AND
    // the saved profile has the address details we need.
    accountCheckoutBtn.disabled = !supported;
    accountCheckoutBtn.classList.toggle("is-disabled", !supported);

    if (needsCountry) {
      accountCheckoutBtn.setAttribute("aria-disabled", "true");
    } else {
      accountCheckoutBtn.removeAttribute("aria-disabled");
    }

    // Tell the user their profile is missing details instead of
    // silently sending them to Stripe with a blank address.
    if (accountIncompleteProfileEl) {
      accountIncompleteProfileEl.hidden = profileComplete;
      if (!profileComplete && accountIncompleteProfileTextEl) {
        accountIncompleteProfileTextEl.textContent = `Your saved profile is missing your ${currentProfileMissingFields.join(", ")}. Please complete your profile before checking out with your account.`;
      }
    }
  }

  function updateGuestContinueState() {
    if (!continueBtn || currentCheckoutUser) return;
    const countryCode = guestCountryEl?.value || "";
    const rule = shippingRule(countryCode);
    const ready = getAllGuestFieldsFilled() && rule.supported;
    continueBtn.disabled = !ready;
    continueBtn.classList.toggle("is-disabled", !ready);
  }

  function setAccountCountryFromUser(user) {
    const raw = getUserCountryValue(user);
    accountCountryCode = normalizeCountry(raw);
    if (accountCountryEl) accountCountryEl.value = accountCountryCode;
    updateShipping(accountCountryCode, true);
    updateAccountButtonState();
  }

  function fillGuestFromUser(user) {
    const fields = {
      "checkout-first-name": user?.firstName || "",
      "checkout-last-name": user?.lastName || "",
      "checkout-email": user?.email || "",
      "checkout-phone": user?.phone || "",
      "checkout-address": user?.address?.street || "",
      "checkout-zip": user?.address?.postalCode || "",
    };
    Object.entries(fields).forEach(([id, value]) => {
      const el = modal.querySelector(`#${id}`);
      if (el) el.value = value;
    });
  }

  async function renderOrderSummary() {
    const itemsEl = modal.querySelector("[data-checkout-summary-items]");
    if (!itemsEl) return;

    const response = await window.BLEGAB_CART.getCart();
    if (!response || !response.success || !response.cart)
      throw new Error(response?.message || "Failed to load cart");

    itemsEl.innerHTML = "";
    (response.cart.items || []).forEach((item) => {
      const product = item.product;
      if (!product) return;
      const image = product.images?.[0]
        ? String(product.images[0]).startsWith("http")
          ? product.images[0]
          : `/assets/images/products/${product.images[0]}`
        : "/assets/images/placeholder.png";
      itemsEl.insertAdjacentHTML(
        "beforeend",
        `
        <div class="checkout-summary__item">
          <img src="${image}" alt="${product.name || "Product"}">
          <div class="checkout-summary__item-info">
            <span class="name">${product.name || "Product"}</span>
            <span class="meta">×${item.quantity}</span>
          </div>
          <span class="checkout-summary__item-price">$${Number(item.lineTotal || 0).toFixed(2)}</span>
        </div>`,
      );
    });

    subtotal = Number(response.subtotal || 0);
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (countEl) countEl.textContent = response.totalItems || 0;

    updateShipping(
      currentCheckoutUser ? accountCountryCode : guestCountryEl?.value || "",
      !!currentCheckoutUser,
    );
  }

  function goToStep(step) {
    currentStep = step;
    modal.classList.toggle("checkout-modal--step-2", step === 2);
    stepPanels.forEach((panel) => {
      panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
    });
    stepIndicators.forEach((indicator) => {
      const num = indicator.dataset.checkoutStepIndicator;
      indicator.classList.toggle("is-active", num === String(step));
      indicator.classList.toggle("is-done", Number(num) < step);
    });
    const body = modal.querySelector(".checkout-modal__body");
    if (body) body.scrollTop = 0;
  }

  function openModal() {
    modal.classList.add("is-open");
    overlay.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("checkout-open");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    overlay.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("checkout-open");
  }

  checkoutBtn.addEventListener("click", async function () {
    try {
      const cart = await window.BLEGAB_CART.getCart();
      if (!cart?.cart?.items?.length) {
        alert("Your cart is empty.");
        return;
      }

      await loadLocationData();
      await renderOrderSummary();

      let user = null;
      try {
        const response = await fetch(`${CHECKOUT_API_URL}/auth/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          user = data.user || null;
        }
      } catch (error) {
        console.error("Unable to check logged-in customer:", error);
      }

      currentCheckoutUser = user;

      if (user) {
        const displayName =
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email ||
          "Account";
        if (checkoutUserNameEl) checkoutUserNameEl.textContent = displayName;
        if (accountCheckoutBtn) accountCheckoutBtn.hidden = false;
        if (guestCheckoutBtn) guestCheckoutBtn.hidden = true;
        if (signupCheckoutBtn) signupCheckoutBtn.hidden = true;
        currentProfileMissingFields = getMissingProfileFields(user);
        fillGuestFromUser(user);
        setAccountCountryFromUser(user);
        goToStep(1);
      } else {
        currentCheckoutUser = null;
        if (accountCheckoutBtn) accountCheckoutBtn.hidden = true;
        if (guestCheckoutBtn) guestCheckoutBtn.hidden = false;
        if (signupCheckoutBtn) signupCheckoutBtn.hidden = false;
        if (continueBtn) continueBtn.disabled = true;
        goToStep(1);
        updateShipping("", false);
      }

      openModal();
    } catch (error) {
      console.error("Checkout initialization failed:", error);
      alert(error.message || "Unable to open checkout.");
    }
  });

  closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));
  overlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  if (guestCheckoutBtn) {
    guestCheckoutBtn.addEventListener("click", async function () {
      currentCheckoutUser = null;
      const guestSection = modal.querySelector("[data-guest-only]");
      if (guestSection) guestSection.hidden = false;
      [
        "checkout-first-name",
        "checkout-last-name",
        "checkout-email",
        "checkout-phone",
        "checkout-country",
        "checkout-address",
        "checkout-city",
        "checkout-state",
        "checkout-zip",
      ].forEach((id) => {
        const el = modal.querySelector(`#${id}`);
        if (el) el.value = "";
      });
      renderStateOptions("");
      renderCityOptions("", "");
      updateShipping("", false);
      goToStep(2);
      updateGuestContinueState();
    });
  }

  if (signupCheckoutBtn)
    signupCheckoutBtn.addEventListener("click", () => {
      window.location.href = "signup.html";
    });

  if (accountCheckoutBtn) {
    accountCheckoutBtn.addEventListener("click", async function () {
      if (!currentCheckoutUser || accountCheckoutBtn.disabled) return;

      const rule = shippingRule(accountCountryCode);
      if (!rule.supported) return;

      // Defense in depth: the button is disabled while the profile is
      // incomplete, but never let a stale click through to Stripe.
      if (currentProfileMissingFields.length) return;

      setButtonLoading(accountCheckoutBtn, true);
      try {
        const cart = await window.BLEGAB_CART.getCart();
        const address = currentCheckoutUser.address || {};
        const data = await createCheckoutSession({
          firstName: currentCheckoutUser.firstName || "",
          lastName: currentCheckoutUser.lastName || "",
          email: currentCheckoutUser.email || "",
          phone: currentCheckoutUser.phone || "",
          country: getCountryName(accountCountryCode),
          state: getUserStateValue(currentCheckoutUser),
          city: getUserCityValue(currentCheckoutUser),
          address: address.street || "",
          postalCode: address.postalCode || "",
          // shippingCost: Number(rule.cost),
          cart,
        });
        window.location.assign(data.url);
      } catch (error) {
        alert(error.message || "Unable to continue to Stripe.");
        setButtonLoading(accountCheckoutBtn, false);
      }
    });
  }

  [
    "checkout-first-name",
    "checkout-last-name",
    "checkout-email",
    "checkout-address",
    "checkout-city",
    "checkout-state",
    "checkout-zip",
    "checkout-phone",
  ].forEach((id) => {
    const input = modal.querySelector(`#${id}`);
    if (!input) return;
    input.addEventListener("input", updateGuestContinueState);
    input.addEventListener("change", updateGuestContinueState);
  });

  //   if (country) {
  //     countryWrapper.style.display = "block";
  // }

  if (continueBtn) {
    continueBtn.addEventListener("click", async function () {
      if (currentCheckoutUser || continueBtn.disabled) return;
      const countryCode = guestCountryEl?.value || "";
      const rule = shippingRule(countryCode);
      if (!rule.supported || !getAllGuestFieldsFilled()) {
        updateGuestContinueState();
        return;
      }

      setButtonLoading(continueBtn, true);
      try {
        const cart = await window.BLEGAB_CART.getCart();
        const data = await createCheckoutSession({
          firstName: modal.querySelector("#checkout-first-name").value.trim(),
          lastName: modal.querySelector("#checkout-last-name").value.trim(),
          email: modal.querySelector("#checkout-email").value.trim(),
          phone: modal.querySelector("#checkout-phone").value.trim(),
          country: getCountryName(countryCode),
          state: modal.querySelector("#checkout-state").value.trim(),
          city: modal.querySelector("#checkout-city").value.trim(),
          address: modal.querySelector("#checkout-address").value.trim(),
          postalCode: modal.querySelector("#checkout-zip").value.trim(),
          // shippingCost: Number(rule.cost),
          cart,
        });
        window.location.assign(data.url);
      } catch (error) {
        alert(error.message || "Unable to continue to Stripe.");
        setButtonLoading(continueBtn, false);
      }
    });
  }

  // Keep guest country list available even before the first checkout click if the modal is opened by other code.
  loadLocationData().catch((error) =>
    console.error("Unable to load country/state data:", error),
  );
}

document.addEventListener("DOMContentLoaded", initCheckoutModal);
