// /* =========================================================
//    BLEGAB CHECKOUT
//    - All countries available to guest checkout.
//    - All states/cities are supplied by country-state-city.
//    - Shipping rules come only from shipping-calculator.js.
//    - Backend/API endpoints are unchanged.
//    ========================================================= */

// const CHECKOUT_API_URL = "https://api.blegab.com/api";
// const LOCATION_MODULE_URL = "https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/+esm";
// const WHATSAPP_NUMBER = "14696180809";

// async function createCheckoutSession(checkoutData) {
//   const response = await fetch(`${CHECKOUT_API_URL}/orders/checkout`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(checkoutData)
//   });

//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Unable to create Stripe checkout.");
//   if (!data.url) throw new Error("Stripe checkout URL was not returned by the server.");
//   return data;
// }

// function setButtonLoading(button, loading) {
//   if (window.BLEGAB_BUTTONS && typeof window.BLEGAB_BUTTONS.setLoading === "function") {
//     window.BLEGAB_BUTTONS.setLoading(button, loading);
//   } else if (button) {
//     button.disabled = !!loading;
//   }
// }

// function getUserCountryValue(user) {
//   return user?.address?.country || user?.country || "";
// }

// function getUserStateValue(user) {
//   return user?.address?.state || user?.state || "";
// }

// function getUserCityValue(user) {
//   return user?.address?.city || user?.city || "";
// }

// function normalizeLocationValue(value, countries, finder) {
//   const raw = String(value || "").trim();
//   if (!raw) return null;
//   const lower = raw.toLowerCase();
//   return countries.find(c => String(c.isoCode).toLowerCase() === lower)
//     || countries.find(c => String(c.name).toLowerCase() === lower)
//     || (finder ? finder(raw) : null);
// }

// function initCheckoutModal() {
//   const overlay = document.querySelector('[data-checkout-modal-overlay]');
//   const modal = document.querySelector('[data-checkout-modal]');
//   const checkoutBtn = document.querySelector('[data-checkout]');
//   if (!overlay || !modal || !checkoutBtn) return;

//   const continueBtn = modal.querySelector('[data-checkout-continue]');
//   const accountCheckoutBtn = modal.querySelector('[data-checkout-option="account"]');
//   const guestCheckoutBtn = modal.querySelector('[data-checkout-option="guest"]');
//   const signupCheckoutBtn = modal.querySelector('[data-checkout-option="signup"]');
//   const closeBtns = modal.querySelectorAll('[data-checkout-modal-close]');
//   const stepIndicators = modal.querySelectorAll('[data-checkout-step-indicator]');
//   const stepPanels = modal.querySelectorAll('[data-checkout-step-panel]');
//   const checkoutUserNameEl = modal.querySelector('[data-checkout-user-name]');
//   const accountCountryPanel = modal.querySelector('[data-account-country-panel]');
//   const accountCountryEl = modal.querySelector('#checkout-account-country');
//   const accountContactAdminBtn = modal.querySelector('[data-account-contact-admin]');
//   const guestCountryEl = modal.querySelector('#checkout-country');
//   const guestStateEl = modal.querySelector('#checkout-state');
//   const guestStateListEl = modal.querySelector('[data-state-combobox-list]');
//   const guestCityEl = modal.querySelector('#checkout-city');
//   const guestCityListEl = modal.querySelector('[data-city-combobox-list]');
//   const contactAdminBtn = modal.querySelector('[data-contact-admin-shipping]');
//   const shippingRowEl = modal.querySelector('[data-checkout-shipping-row]');
//   const shippingCostEl = modal.querySelector('[data-checkout-summary-shipping]');
//   const totalEl = modal.querySelector('[data-checkout-summary-total]');
//   const subtotalEl = modal.querySelector('[data-checkout-summary-subtotal]');
//   const countEl = modal.querySelector('[data-checkout-summary-count]');
//   const ctaTotalEl = modal.querySelector('[data-checkout-cta-total]');

//   let currentStep = 1;
//   let currentCheckoutUser = null;
//   let locationData = null;
//   let subtotal = 0;
//   let currentShipping = null;
//   let accountCountryCode = "";
//   let guestStateOptions = [];
//   let guestCityOptions = [];

//   function shippingApi() {
//     return window.BLEGAB_SHIPPING || null;
//   }

//   function shippingRule(countryCode) {
//     const api = shippingApi();
//     return api ? api.getShippingRule(countryCode) : {
//       supported: false,
//       contactAdmin: true,
//       cost: null
//     };
//   }

//   function contactWhatsApp(countryName) {
//     const message = countryName
//       ? `Hello Blegab, I need the shipping fee for ${countryName}.`
//       : "Hello Blegab, I need information about the shipping fee for my country.";
//     window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
//   }

//   if (contactAdminBtn) {
//     contactAdminBtn.addEventListener("click", function (event) {
//       event.preventDefault();
//       const countryName = currentCheckoutUser
//         ? getCountryName(accountCountryCode)
//         : getCountryName(guestCountryEl?.value);
//       contactWhatsApp(countryName);
//     });
//   }

//   function getCountryName(code) {
//     const country = locationData?.countries?.find(c => c.isoCode === String(code || "").toUpperCase());
//     return country ? country.name : String(code || "");
//   }

//   function normalizeCountry(value) {
//     const country = normalizeLocationValue(value, locationData?.countries || []);
//     return country ? country.isoCode : "";
//   }

//   function normalizeState(countryCode, value) {
//     const raw = String(value || "").trim().toLowerCase();
//     if (!raw || !countryCode || !locationData) return "";
//     const states = locationData.State.getStatesOfCountry(countryCode) || [];
//     const state = states.find(s => String(s.isoCode).toLowerCase() === raw)
//       || states.find(s => String(s.name).toLowerCase() === raw);
//     return state ? state.isoCode : "";
//   }

//   async function loadLocationData() {
//     if (locationData) return locationData;
//     const module = await import(LOCATION_MODULE_URL);
//     const countries = module.Country.getAllCountries();
//     locationData = {
//       Country: module.Country,
//       State: module.State,
//       City: module.City,
//       countries
//     };
//     populateCountrySelect(guestCountryEl);
//     populateCountrySelect(accountCountryEl);
//     return locationData;
//   }

//   function populateCountrySelect(select) {
//     if (!select || !locationData) return;
//     select.innerHTML = '<option value="">Select your country</option>' +
//       locationData.countries.map(c => `<option value="${c.isoCode}">${c.name}</option>`).join("");
//   }

//   function getStates(countryCode) {
//     if (!countryCode || !locationData) return [];
//     return locationData.State.getStatesOfCountry(countryCode) || [];
//   }

//   function getCities(countryCode, stateCode) {
//     if (!countryCode || !stateCode || !locationData) return [];
//     return locationData.City.getCitiesOfState(countryCode, stateCode) || [];
//   }

//   function renderStateOptions(countryCode) {
//     guestStateOptions = getStates(countryCode);
//     if (!guestStateEl) return;

//     guestStateEl.value = "";
//     guestStateEl.disabled = false;
//     guestStateEl.placeholder =
//   guestStateOptions.length
//     ? "Search or enter your state"
//     : "Enter your state";
//     if (guestStateListEl) guestStateListEl.hidden = true;
//   }

//   function renderCityOptions(countryCode, stateCode) {
//     guestCityOptions = getCities(countryCode, stateCode);
//     if (!guestCityEl) return;

//     guestCityEl.value = "";
//     guestCityEl.disabled = !stateCode;
//     guestCityEl.placeholder = stateCode
//       ? (guestCityOptions.length ? "Search for your city" : "Enter your city")
//       : "Select state first";
//     if (guestCityListEl) guestCityListEl.hidden = true;
//   }

//   function renderComboboxList(input, list, options, key) {
//     if (!list || !input) return;
//     const query = input.value.trim().toLowerCase();
//     const filtered = query
//       ? options.filter(item => item.name.toLowerCase().includes(query))
//       : options;

//     if (!filtered.length) {
//       list.innerHTML = '<li class="checkout-combobox__empty">No matching results</li>';
//     } else {
//       list.innerHTML = filtered.slice(0, 100).map(item =>
//         `<li class="checkout-combobox__option" data-${key}-value="${item.isoCode || item.name}">${item.name}</li>`
//       ).join("");
//     }
//     list.hidden = false;
//   }

//   if (guestStateEl) {
//     guestStateEl.addEventListener("input", function () {
//       renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
//       updateGuestContinueState();
//     });
//     guestStateEl.addEventListener("focus", function () {
//       renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
//     });
//   }

//   if (guestStateListEl) {
//     guestStateListEl.addEventListener("mousedown", e => e.preventDefault());
//     guestStateListEl.addEventListener("click", function (e) {
//       const option = e.target.closest("[data-state-value]");
//       if (!option) return;
//       const stateCode = option.getAttribute("data-state-value");
//       const state = guestStateOptions.find(s => s.isoCode === stateCode);
//       if (!state) return;
//       guestStateEl.value = state.name;
//       guestStateListEl.hidden = true;
//       renderCityOptions(guestCountryEl.value, state.isoCode);
//       updateGuestContinueState();
//     });
//   }

//   if (guestCityEl) {
//     guestCityEl.addEventListener("input", function () {
//       if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
//       updateGuestContinueState();
//     });
//     guestCityEl.addEventListener("focus", function () {
//       if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
//     });
//   }

//   if (guestCityListEl) {
//     guestCityListEl.addEventListener("mousedown", e => e.preventDefault());
//     guestCityListEl.addEventListener("click", function (e) {
//       const option = e.target.closest("[data-city-value]");
//       if (!option) return;
//       guestCityEl.value = option.getAttribute("data-city-value");
//       guestCityListEl.hidden = true;
//       updateGuestContinueState();
//     });
//   }

//   if (guestCountryEl) {
//     guestCountryEl.addEventListener("change", function () {
//       renderStateOptions(guestCountryEl.value);
//       renderCityOptions(guestCountryEl.value, "");
//       updateShipping(guestCountryEl.value, false);
//       updateGuestContinueState();
//     });
//   }

//   if (accountCountryEl) {
//     accountCountryEl.addEventListener("change", function () {
//       accountCountryCode = accountCountryEl.value;
//       updateShipping(accountCountryCode, true);
//       updateAccountButtonState();
//     });
//   }

//   function getAllGuestFieldsFilled() {
//     const ids = [
//       "checkout-first-name",
//       "checkout-last-name",
//       "checkout-email",
//       "checkout-country",
//       "checkout-address",
//       "checkout-state",
//       "checkout-city",
//       "checkout-zip"
//     ];
//     return ids.every(id => {
//       const el = modal.querySelector(`#${id}`);
//       return el && String(el.value || "").trim() !== "";
//     });
//   }

//   function updateShipping(countryCode, isAccount) {
//   const rule = shippingRule(countryCode);
//   currentShipping = rule;

//   if (shippingRowEl) {
//     shippingRowEl.classList.remove("is-contact-required");
//   }

//   if (contactAdminBtn) {
//     contactAdminBtn.hidden = true;
//   }

//   // Hide the account-country contact message by default.
//   if (accountContactAdminBtn) {
//     accountContactAdminBtn.hidden = true;
//   }

//   if (!countryCode) {
//     if (shippingCostEl) {
//       shippingCostEl.textContent = "Select country";
//     }

//     if (totalEl) {
//       totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (ctaTotalEl) {
//       ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     return rule;
//   }

//   // Country has no registered shipping fee.
//   if (!rule.supported) {
//     if (shippingCostEl) {
//       shippingCostEl.textContent = "Contact Admin for shipping fee";
//     }

//     if (totalEl) {
//       totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (ctaTotalEl) {
//       ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (shippingRowEl) {
//       shippingRowEl.classList.add("is-contact-required");
//     }

//     // Existing contact button in the order summary.
//     if (contactAdminBtn) {
//       contactAdminBtn.hidden = false;
//       contactAdminBtn.href =
//         `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
//         )}`;
//     }

//     // NEW:
//     // Show the clickable message directly underneath
//     // the country selector for logged-in/account checkout.
//     if (isAccount && accountContactAdminBtn) {
//       accountContactAdminBtn.hidden = false;
//       accountContactAdminBtn.href =
//         `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
//         )}`;
//     }

//     return rule;
//   }

//   // Country has a registered shipping fee.
//   const shipping = Number(rule.cost || 0);
//   const total = subtotal + shipping;

//   if (shippingCostEl) {
//     shippingCostEl.textContent = `$${shipping.toFixed(2)}`;
//   }

//   if (totalEl) {
//     totalEl.textContent = `$${total.toFixed(2)}`;
//   }

//   if (ctaTotalEl) {
//     ctaTotalEl.textContent = `$${total.toFixed(2)}`;
//   }

//   return rule;
// }

// function updateAccountButtonState() {
//   if (!accountCheckoutBtn) return;

//   const supported = !!accountCountryCode && !!currentShipping?.supported;
//   const needsCountry = !accountCountryCode;

//   // Keep the country selector visible at all times.
//   // The user may want to change/reselect their country.
//   if (accountCountryPanel) {
//     accountCountryPanel.hidden = false;
//   }

//   // The "Continue as username" button is only enabled
//   // when a valid/supported country has been selected.
//   accountCheckoutBtn.disabled = !supported;
//   accountCheckoutBtn.classList.toggle("is-disabled", !supported);

//   if (needsCountry) {
//     accountCheckoutBtn.setAttribute("aria-disabled", "true");
//   } else {
//     accountCheckoutBtn.removeAttribute("aria-disabled");
//   }
// }

//   function updateGuestContinueState() {
//     if (!continueBtn || currentCheckoutUser) return;
//     const countryCode = guestCountryEl?.value || "";
//     const rule = shippingRule(countryCode);
//     const ready = getAllGuestFieldsFilled() && rule.supported;
//     continueBtn.disabled = !ready;
//     continueBtn.classList.toggle("is-disabled", !ready);
//   }

//   function setAccountCountryFromUser(user) {
//     const raw = getUserCountryValue(user);
//     accountCountryCode = normalizeCountry(raw);
//     if (accountCountryEl) accountCountryEl.value = accountCountryCode;
//     updateShipping(accountCountryCode, true);
//     updateAccountButtonState();
//   }

//   function fillGuestFromUser(user) {
//     const fields = {
//       "checkout-first-name": user?.firstName || "",
//       "checkout-last-name": user?.lastName || "",
//       "checkout-email": user?.email || "",
//       "checkout-phone": user?.phone || "",
//       "checkout-address": user?.address?.street || "",
//       "checkout-zip": user?.address?.postalCode || ""
//     };
//     Object.entries(fields).forEach(([id, value]) => {
//       const el = modal.querySelector(`#${id}`);
//       if (el) el.value = value;
//     });
//   }

//   async function renderOrderSummary() {
//     const itemsEl = modal.querySelector("[data-checkout-summary-items]");
//     if (!itemsEl) return;

//     const response = await window.BLEGAB_CART.getCart();
//     if (!response || !response.success || !response.cart) throw new Error(response?.message || "Failed to load cart");

//     itemsEl.innerHTML = "";
//     (response.cart.items || []).forEach(item => {
//       const product = item.product;
//       if (!product) return;
//       const image = product.images?.[0]
//         ? (String(product.images[0]).startsWith("http") ? product.images[0] : `/assets/images/products/${product.images[0]}`)
//         : "/assets/images/placeholder.png";
//       itemsEl.insertAdjacentHTML("beforeend", `
//         <div class="checkout-summary__item">
//           <img src="${image}" alt="${product.name || "Product"}">
//           <div class="checkout-summary__item-info">
//             <span class="name">${product.name || "Product"}</span>
//             <span class="meta">×${item.quantity}</span>
//           </div>
//           <span class="checkout-summary__item-price">$${Number(item.lineTotal || 0).toFixed(2)}</span>
//         </div>`);
//     });

//     subtotal = Number(response.subtotal || 0);
//     if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     if (countEl) countEl.textContent = response.totalItems || 0;

//     updateShipping(currentCheckoutUser ? accountCountryCode : guestCountryEl?.value || "", !!currentCheckoutUser);
//   }

//   function goToStep(step) {
//     currentStep = step;
//     modal.classList.toggle("checkout-modal--step-2", step === 2);
//     stepPanels.forEach(panel => {
//       panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
//     });
//     stepIndicators.forEach(indicator => {
//       const num = indicator.dataset.checkoutStepIndicator;
//       indicator.classList.toggle("is-active", num === String(step));
//       indicator.classList.toggle("is-done", Number(num) < step);
//     });
//     const body = modal.querySelector(".checkout-modal__body");
//     if (body) body.scrollTop = 0;
//   }

//   function openModal() {
//     modal.classList.add("is-open");
//     overlay.classList.add("is-open");
//     modal.setAttribute("aria-hidden", "false");
//     document.body.classList.add("checkout-open");
//   }

//   function closeModal() {
//     modal.classList.remove("is-open");
//     overlay.classList.remove("is-open");
//     modal.setAttribute("aria-hidden", "true");
//     document.body.classList.remove("checkout-open");
//   }

//   checkoutBtn.addEventListener("click", async function () {
//     try {
//       const cart = await window.BLEGAB_CART.getCart();
//       if (!cart?.cart?.items?.length) {
//         alert("Your cart is empty.");
//         return;
//       }

//       await loadLocationData();
//       await renderOrderSummary();

//       let user = null;
//       try {
//         const response = await fetch(`${CHECKOUT_API_URL}/auth/me`, { credentials: "include" });
//         if (response.ok) {
//           const data = await response.json();
//           user = data.user || null;
//         }
//       } catch (error) {
//         console.error("Unable to check logged-in customer:", error);
//       }

//       currentCheckoutUser = user;

//       if (user) {
//         const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Account";
//         if (checkoutUserNameEl) checkoutUserNameEl.textContent = displayName;
//         if (accountCheckoutBtn) accountCheckoutBtn.hidden = false;
//         if (guestCheckoutBtn) guestCheckoutBtn.hidden = true;
//         if (signupCheckoutBtn) signupCheckoutBtn.hidden = true;
//         fillGuestFromUser(user);
//         setAccountCountryFromUser(user);
//         goToStep(1);
//       } else {
//         currentCheckoutUser = null;
//         if (accountCheckoutBtn) accountCheckoutBtn.hidden = true;
//         if (guestCheckoutBtn) guestCheckoutBtn.hidden = false;
//         if (signupCheckoutBtn) signupCheckoutBtn.hidden = false;
//         if (continueBtn) continueBtn.disabled = true;
//         goToStep(1);
//         updateShipping("", false);
//       }

//       openModal();
//     } catch (error) {
//       console.error("Checkout initialization failed:", error);
//       alert(error.message || "Unable to open checkout.");
//     }
//   });

//   closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
//   overlay.addEventListener("click", closeModal);
//   document.addEventListener("keydown", e => {
//     if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
//   });

//   if (guestCheckoutBtn) {
//     guestCheckoutBtn.addEventListener("click", async function () {
//       currentCheckoutUser = null;
//       const guestSection = modal.querySelector("[data-guest-only]");
//       if (guestSection) guestSection.hidden = false;
//       ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-phone", "checkout-country", "checkout-address", "checkout-city", "checkout-state", "checkout-zip"].forEach(id => {
//         const el = modal.querySelector(`#${id}`);
//         if (el) el.value = "";
//       });
//       renderStateOptions("");
//       renderCityOptions("", "");
//       updateShipping("", false);
//       goToStep(2);
//       updateGuestContinueState();
//     });
//   }

//   if (signupCheckoutBtn) signupCheckoutBtn.addEventListener("click", () => { window.location.href = "signup.html"; });

//   if (accountCheckoutBtn) {
//     accountCheckoutBtn.addEventListener("click", async function () {
//       if (!currentCheckoutUser || accountCheckoutBtn.disabled) return;

//       const rule = shippingRule(accountCountryCode);
//       if (!rule.supported) return;

//       setButtonLoading(accountCheckoutBtn, true);
//       try {
//         const cart = await window.BLEGAB_CART.getCart();
//         const address = currentCheckoutUser.address || {};
//         const data = await createCheckoutSession({
//           firstName: currentCheckoutUser.firstName || "",
//           lastName: currentCheckoutUser.lastName || "",
//           email: currentCheckoutUser.email || "",
//           phone: currentCheckoutUser.phone || "",
//           country: getCountryName(accountCountryCode),
//           state: getUserStateValue(currentCheckoutUser),
//           city: getUserCityValue(currentCheckoutUser),
//           address: address.street || "",
//           postalCode: address.postalCode || "",
//           shippingCost: Number(rule.cost),
//           cart
//         });
//         window.location.assign(data.url);
//       } catch (error) {
//         alert(error.message || "Unable to continue to Stripe.");
//         setButtonLoading(accountCheckoutBtn, false);
//       }
//     });
//   }

//   ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-address", "checkout-city", "checkout-state", "checkout-zip", "checkout-phone"].forEach(id => {
//     const input = modal.querySelector(`#${id}`);
//     if (!input) return;
//     input.addEventListener("input", updateGuestContinueState);
//     input.addEventListener("change", updateGuestContinueState);
//   });

//   if (country) {
//     countryWrapper.style.display = "block";
// }

//   if (continueBtn) {
//     continueBtn.addEventListener("click", async function () {
//       if (currentCheckoutUser || continueBtn.disabled) return;
//       const countryCode = guestCountryEl?.value || "";
//       const rule = shippingRule(countryCode);
//       if (!rule.supported || !getAllGuestFieldsFilled()) {
//         updateGuestContinueState();
//         return;
//       }

//       setButtonLoading(continueBtn, true);
//       try {
//         const cart = await window.BLEGAB_CART.getCart();
//         const data = await createCheckoutSession({
//           firstName: modal.querySelector("#checkout-first-name").value.trim(),
//           lastName: modal.querySelector("#checkout-last-name").value.trim(),
//           email: modal.querySelector("#checkout-email").value.trim(),
//           phone: modal.querySelector("#checkout-phone").value.trim(),
//           country: getCountryName(countryCode),
//           state: modal.querySelector("#checkout-state").value.trim(),
//           city: modal.querySelector("#checkout-city").value.trim(),
//           address: modal.querySelector("#checkout-address").value.trim(),
//           postalCode: modal.querySelector("#checkout-zip").value.trim(),
//           shippingCost: Number(rule.cost),
//           cart
//         });
//         window.location.assign(data.url);
//       } catch (error) {
//         alert(error.message || "Unable to continue to Stripe.");
//         setButtonLoading(continueBtn, false);
//       }
//     });
//   }

//   // Keep guest country list available even before the first checkout click if the modal is opened by other code.
//   loadLocationData().catch(error => console.error("Unable to load country/state data:", error));
// }

// document.addEventListener("DOMContentLoaded", initCheckoutModal);


// /* =========================================================
//    BLEGAB CHECKOUT
//    - All countries available to guest checkout.
//    - All states/cities are supplied by country-state-city.
//    - Shipping rules come only from shipping-calculator.js.
//    - Backend/API endpoints are unchanged.
//    ========================================================= */

// const CHECKOUT_API_URL = "https://api.blegab.com/api";
// const LOCATION_MODULE_URL = "https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/+esm";
// const WHATSAPP_NUMBER = "14696180809";

// async function createCheckoutSession(checkoutData) {
//   const response = await fetch(`${CHECKOUT_API_URL}/orders/checkout`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(checkoutData)
//   });

//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Unable to create Stripe checkout.");
//   if (!data.url) throw new Error("Stripe checkout URL was not returned by the server.");
//   return data;
// }

// function setButtonLoading(button, loading) {
//   if (window.BLEGAB_BUTTONS && typeof window.BLEGAB_BUTTONS.setLoading === "function") {
//     window.BLEGAB_BUTTONS.setLoading(button, loading);
//   } else if (button) {
//     button.disabled = !!loading;
//   }
// }

// function getUserCountryValue(user) {
//   return user?.address?.country || user?.country || "";
// }

// function getUserStateValue(user) {
//   return user?.address?.state || user?.state || "";
// }

// function getUserCityValue(user) {
//   return user?.address?.city || user?.city || "";
// }

// function normalizeLocationValue(value, countries, finder) {
//   const raw = String(value || "").trim();
//   if (!raw) return null;
//   const lower = raw.toLowerCase();
//   return countries.find(c => String(c.isoCode).toLowerCase() === lower)
//     || countries.find(c => String(c.name).toLowerCase() === lower)
//     || (finder ? finder(raw) : null);
// }

// function initCheckoutModal() {
//   const overlay = document.querySelector('[data-checkout-modal-overlay]');
//   const modal = document.querySelector('[data-checkout-modal]');
//   const checkoutBtn = document.querySelector('[data-checkout]');
//   if (!overlay || !modal || !checkoutBtn) return;

//   const continueBtn = modal.querySelector('[data-checkout-continue]');
//   const accountCheckoutBtn = modal.querySelector('[data-checkout-option="account"]');
//   const guestCheckoutBtn = modal.querySelector('[data-checkout-option="guest"]');
//   const signupCheckoutBtn = modal.querySelector('[data-checkout-option="signup"]');
//   const closeBtns = modal.querySelectorAll('[data-checkout-modal-close]');
//   const stepIndicators = modal.querySelectorAll('[data-checkout-step-indicator]');
//   const stepPanels = modal.querySelectorAll('[data-checkout-step-panel]');
//   const checkoutUserNameEl = modal.querySelector('[data-checkout-user-name]');
//   const accountCountryPanel = modal.querySelector('[data-account-country-panel]');
//   const accountCountryEl = modal.querySelector('#checkout-account-country');
//   const accountContactAdminBtn = modal.querySelector('[data-account-contact-admin]');
//   const guestCountryEl = modal.querySelector('#checkout-country');
//   const guestStateEl = modal.querySelector('#checkout-state');
//   const guestStateListEl = modal.querySelector('[data-state-combobox-list]');
//   const guestCityEl = modal.querySelector('#checkout-city');
//   const guestCityListEl = modal.querySelector('[data-city-combobox-list]');
//   const contactAdminBtn = modal.querySelector('[data-contact-admin-shipping]');
//   const shippingRowEl = modal.querySelector('[data-checkout-shipping-row]');
//   const shippingCostEl = modal.querySelector('[data-checkout-summary-shipping]');
//   const totalEl = modal.querySelector('[data-checkout-summary-total]');
//   const subtotalEl = modal.querySelector('[data-checkout-summary-subtotal]');
//   const countEl = modal.querySelector('[data-checkout-summary-count]');
//   const ctaTotalEl = modal.querySelector('[data-checkout-cta-total]');

//   let currentStep = 1;
//   let currentCheckoutUser = null;
//   let locationData = null;
//   let subtotal = 0;
//   let currentShipping = null;
//   let accountCountryCode = "";
//   let guestStateOptions = [];
//   let guestCityOptions = [];

//   function shippingApi() {
//     return window.BLEGAB_SHIPPING || null;
//   }

//   function shippingRule(countryCode) {
//     const api = shippingApi();
//     return api ? api.getShippingRule(countryCode) : {
//       supported: false,
//       contactAdmin: true,
//       cost: null
//     };
//   }

//   function contactWhatsApp(countryName) {
//     const message = countryName
//       ? `Hello Blegab, I need the shipping fee for ${countryName}.`
//       : "Hello Blegab, I need information about the shipping fee for my country.";
//     window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
//   }

//   if (contactAdminBtn) {
//     contactAdminBtn.addEventListener("click", function (event) {
//       event.preventDefault();
//       const countryName = currentCheckoutUser
//         ? getCountryName(accountCountryCode)
//         : getCountryName(guestCountryEl?.value);
//       contactWhatsApp(countryName);
//     });
//   }

//   function getCountryName(code) {
//     const country = locationData?.countries?.find(c => c.isoCode === String(code || "").toUpperCase());
//     return country ? country.name : String(code || "");
//   }

//   function normalizeCountry(value) {
//     const country = normalizeLocationValue(value, locationData?.countries || []);
//     return country ? country.isoCode : "";
//   }

//   function normalizeState(countryCode, value) {
//     const raw = String(value || "").trim().toLowerCase();
//     if (!raw || !countryCode || !locationData) return "";
//     const states = locationData.State.getStatesOfCountry(countryCode) || [];
//     const state = states.find(s => String(s.isoCode).toLowerCase() === raw)
//       || states.find(s => String(s.name).toLowerCase() === raw);
//     return state ? state.isoCode : "";
//   }

//   async function loadLocationData() {
//     if (locationData) return locationData;
//     const module = await import(LOCATION_MODULE_URL);
//     const countries = module.Country.getAllCountries();
//     locationData = {
//       Country: module.Country,
//       State: module.State,
//       City: module.City,
//       countries
//     };
//     populateCountrySelect(guestCountryEl);
//     populateCountrySelect(accountCountryEl);
//     return locationData;
//   }

//   function populateCountrySelect(select) {
//     if (!select || !locationData) return;
//     select.innerHTML = '<option value="">Select your country</option>' +
//       locationData.countries.map(c => `<option value="${c.isoCode}">${c.name}</option>`).join("");
//   }

//   function getStates(countryCode) {
//     if (!countryCode || !locationData) return [];
//     return locationData.State.getStatesOfCountry(countryCode) || [];
//   }

//   function getCities(countryCode, stateCode) {
//     if (!countryCode || !stateCode || !locationData) return [];
//     return locationData.City.getCitiesOfState(countryCode, stateCode) || [];
//   }

//   function renderStateOptions(countryCode) {
//     guestStateOptions = getStates(countryCode);
//     if (!guestStateEl) return;

//     guestStateEl.value = "";
//     guestStateEl.disabled = false;
//     guestStateEl.placeholder =
//   guestStateOptions.length
//     ? "Search or enter your state"
//     : "Enter your state";
//     if (guestStateListEl) guestStateListEl.hidden = true;
//   }

//   function renderCityOptions(countryCode, stateCode) {
//     guestCityOptions = getCities(countryCode, stateCode);
//     if (!guestCityEl) return;

//     guestCityEl.value = "";
//     guestCityEl.disabled = !stateCode;
//     guestCityEl.placeholder = stateCode
//       ? (guestCityOptions.length ? "Search for your city" : "Enter your city")
//       : "Select state first";
//     if (guestCityListEl) guestCityListEl.hidden = true;
//   }

//   function renderComboboxList(input, list, options, key) {
//     if (!list || !input) return;
//     const query = input.value.trim().toLowerCase();
//     const filtered = query
//       ? options.filter(item => item.name.toLowerCase().includes(query))
//       : options;

//     if (!filtered.length) {
//       list.innerHTML = '<li class="checkout-combobox__empty">No matching results</li>';
//     } else {
//       list.innerHTML = filtered.slice(0, 100).map(item =>
//         `<li class="checkout-combobox__option" data-${key}-value="${item.isoCode || item.name}">${item.name}</li>`
//       ).join("");
//     }
//     list.hidden = false;
//   }

//   if (guestStateEl) {
//     guestStateEl.addEventListener("input", function () {
//       renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
//       updateGuestContinueState();
//     });
//     guestStateEl.addEventListener("focus", function () {
//       renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
//     });
//   }

//   if (guestStateListEl) {
//     guestStateListEl.addEventListener("mousedown", e => e.preventDefault());
//     guestStateListEl.addEventListener("click", function (e) {
//       const option = e.target.closest("[data-state-value]");
//       if (!option) return;
//       const stateCode = option.getAttribute("data-state-value");
//       const state = guestStateOptions.find(s => s.isoCode === stateCode);
//       if (!state) return;
//       guestStateEl.value = state.name;
//       guestStateListEl.hidden = true;
//       renderCityOptions(guestCountryEl.value, state.isoCode);
//       updateGuestContinueState();
//     });
//   }

//   if (guestCityEl) {
//     guestCityEl.addEventListener("input", function () {
//       if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
//       updateGuestContinueState();
//     });
//     guestCityEl.addEventListener("focus", function () {
//       if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
//     });
//   }

//   if (guestCityListEl) {
//     guestCityListEl.addEventListener("mousedown", e => e.preventDefault());
//     guestCityListEl.addEventListener("click", function (e) {
//       const option = e.target.closest("[data-city-value]");
//       if (!option) return;
//       guestCityEl.value = option.getAttribute("data-city-value");
//       guestCityListEl.hidden = true;
//       updateGuestContinueState();
//     });
//   }

//   if (guestCountryEl) {
//     guestCountryEl.addEventListener("change", function () {
//       renderStateOptions(guestCountryEl.value);
//       renderCityOptions(guestCountryEl.value, "");
//       updateShipping(guestCountryEl.value, false);
//       updateGuestContinueState();
//     });
//   }

//   if (accountCountryEl) {
//     accountCountryEl.addEventListener("change", function () {
//       accountCountryCode = accountCountryEl.value;
//       updateShipping(accountCountryCode, true);
//       updateAccountButtonState();
//     });
//   }

//   function getAllGuestFieldsFilled() {
//     const ids = [
//       "checkout-first-name",
//       "checkout-last-name",
//       "checkout-email",
//       "checkout-country",
//       "checkout-address",
//       "checkout-state",
//       "checkout-city",
//       "checkout-zip"
//     ];
//     return ids.every(id => {
//       const el = modal.querySelector(`#${id}`);
//       return el && String(el.value || "").trim() !== "";
//     });
//   }

//   function updateShipping(countryCode, isAccount) {
//   const rule = shippingRule(countryCode);
//   currentShipping = rule;

//   if (shippingRowEl) {
//     shippingRowEl.classList.remove("is-contact-required");
//   }

//   if (contactAdminBtn) {
//     contactAdminBtn.hidden = true;
//   }

//   // Hide the account-country contact message by default.
//   if (accountContactAdminBtn) {
//     accountContactAdminBtn.hidden = true;
//   }

//   if (!countryCode) {
//     if (shippingCostEl) {
//       shippingCostEl.textContent = "Select country";
//     }

//     if (totalEl) {
//       totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (ctaTotalEl) {
//       ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     return rule;
//   }

//   // Country has no registered shipping fee.
//   if (!rule.supported) {
//     if (shippingCostEl) {
//       shippingCostEl.textContent = "Contact Admin for shipping fee";
//     }

//     if (totalEl) {
//       totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (ctaTotalEl) {
//       ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (shippingRowEl) {
//       shippingRowEl.classList.add("is-contact-required");
//     }

//     // Existing contact button in the order summary.
//     if (contactAdminBtn) {
//       contactAdminBtn.hidden = false;
//       contactAdminBtn.href =
//         `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
//         )}`;
//     }

//     // NEW:
//     // Show the clickable message directly underneath
//     // the country selector for logged-in/account checkout.
//     if (isAccount && accountContactAdminBtn) {
//       accountContactAdminBtn.hidden = false;
//       accountContactAdminBtn.href =
//         `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
//         )}`;
//     }

//     return rule;
//   }

//   // Country has a registered shipping fee.
//   const shipping = Number(rule.cost || 0);
//   const total = subtotal + shipping;

//   if (shippingCostEl) {
//     shippingCostEl.textContent = `$${shipping.toFixed(2)}`;
//   }

//   if (totalEl) {
//     totalEl.textContent = `$${total.toFixed(2)}`;
//   }

//   if (ctaTotalEl) {
//     ctaTotalEl.textContent = `$${total.toFixed(2)}`;
//   }

//   return rule;
// }

// function updateAccountButtonState() {
//   if (!accountCheckoutBtn) return;

//   const supported = !!accountCountryCode && !!currentShipping?.supported;
//   const needsCountry = !accountCountryCode;

//   // Keep the country selector visible at all times.
//   // The user may want to change/reselect their country.
//   if (accountCountryPanel) {
//     accountCountryPanel.hidden = false;
//   }

//   // The "Continue as username" button is only enabled
//   // when a valid/supported country has been selected.
//   accountCheckoutBtn.disabled = !supported;
//   accountCheckoutBtn.classList.toggle("is-disabled", !supported);

//   if (needsCountry) {
//     accountCheckoutBtn.setAttribute("aria-disabled", "true");
//   } else {
//     accountCheckoutBtn.removeAttribute("aria-disabled");
//   }
// }

//   function updateGuestContinueState() {
//     if (!continueBtn || currentCheckoutUser) return;
//     const countryCode = guestCountryEl?.value || "";
//     const rule = shippingRule(countryCode);
//     const ready = getAllGuestFieldsFilled() && rule.supported;
//     continueBtn.disabled = !ready;
//     continueBtn.classList.toggle("is-disabled", !ready);
//   }

//   function setAccountCountryFromUser(user) {
//     const raw = getUserCountryValue(user);
//     accountCountryCode = normalizeCountry(raw);
//     if (accountCountryEl) accountCountryEl.value = accountCountryCode;
//     updateShipping(accountCountryCode, true);
//     updateAccountButtonState();
//   }

//   function fillGuestFromUser(user) {
//     const fields = {
//       "checkout-first-name": user?.firstName || "",
//       "checkout-last-name": user?.lastName || "",
//       "checkout-email": user?.email || "",
//       "checkout-phone": user?.phone || "",
//       "checkout-address": user?.address?.street || "",
//       "checkout-zip": user?.address?.postalCode || ""
//     };
//     Object.entries(fields).forEach(([id, value]) => {
//       const el = modal.querySelector(`#${id}`);
//       if (el) el.value = value;
//     });
//   }

//   async function renderOrderSummary() {
//     const itemsEl = modal.querySelector("[data-checkout-summary-items]");
//     if (!itemsEl) return;

//     const response = await window.BLEGAB_CART.getCart();
//     if (!response || !response.success || !response.cart) throw new Error(response?.message || "Failed to load cart");

//     itemsEl.innerHTML = "";
//     (response.cart.items || []).forEach(item => {
//       const product = item.product;
//       if (!product) return;
//       const image = product.images?.[0]
//         ? (String(product.images[0]).startsWith("http") ? product.images[0] : `/assets/images/products/${product.images[0]}`)
//         : "/assets/images/placeholder.png";
//       itemsEl.insertAdjacentHTML("beforeend", `
//         <div class="checkout-summary__item">
//           <img src="${image}" alt="${product.name || "Product"}">
//           <div class="checkout-summary__item-info">
//             <span class="name">${product.name || "Product"}</span>
//             <span class="meta">×${item.quantity}</span>
//           </div>
//           <span class="checkout-summary__item-price">$${Number(item.lineTotal || 0).toFixed(2)}</span>
//         </div>`);
//     });

//     subtotal = Number(response.subtotal || 0);
//     if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     if (countEl) countEl.textContent = response.totalItems || 0;

//     updateShipping(currentCheckoutUser ? accountCountryCode : guestCountryEl?.value || "", !!currentCheckoutUser);
//   }

//   function goToStep(step) {
//     currentStep = step;
//     modal.classList.toggle("checkout-modal--step-2", step === 2);
//     stepPanels.forEach(panel => {
//       panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
//     });
//     stepIndicators.forEach(indicator => {
//       const num = indicator.dataset.checkoutStepIndicator;
//       indicator.classList.toggle("is-active", num === String(step));
//       indicator.classList.toggle("is-done", Number(num) < step);
//     });
//     const body = modal.querySelector(".checkout-modal__body");
//     if (body) body.scrollTop = 0;
//   }

//   function openModal() {
//     modal.classList.add("is-open");
//     overlay.classList.add("is-open");
//     modal.setAttribute("aria-hidden", "false");
//     document.body.classList.add("checkout-open");
//   }

//   function closeModal() {
//     modal.classList.remove("is-open");
//     overlay.classList.remove("is-open");
//     modal.setAttribute("aria-hidden", "true");
//     document.body.classList.remove("checkout-open");
//   }

//   checkoutBtn.addEventListener("click", async function () {
//     try {
//       const cart = await window.BLEGAB_CART.getCart();
//       if (!cart?.cart?.items?.length) {
//         alert("Your cart is empty.");
//         return;
//       }

//       await loadLocationData();
//       await renderOrderSummary();

//       let user = null;
//       try {
//         const response = await fetch(`${CHECKOUT_API_URL}/auth/me`, { credentials: "include" });
//         if (response.ok) {
//           const data = await response.json();
//           user = data.user || null;
//         }
//       } catch (error) {
//         console.error("Unable to check logged-in customer:", error);
//       }

//       currentCheckoutUser = user;

//       if (user) {
//         const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Account";
//         if (checkoutUserNameEl) checkoutUserNameEl.textContent = displayName;
//         if (accountCheckoutBtn) accountCheckoutBtn.hidden = false;
//         if (guestCheckoutBtn) guestCheckoutBtn.hidden = true;
//         if (signupCheckoutBtn) signupCheckoutBtn.hidden = true;
//         fillGuestFromUser(user);
//         setAccountCountryFromUser(user);
//         goToStep(1);
//       } else {
//         currentCheckoutUser = null;
//         if (accountCheckoutBtn) accountCheckoutBtn.hidden = true;
//         if (guestCheckoutBtn) guestCheckoutBtn.hidden = false;
//         if (signupCheckoutBtn) signupCheckoutBtn.hidden = false;
//         if (continueBtn) continueBtn.disabled = true;
//         goToStep(1);
//         updateShipping("", false);
//       }

//       openModal();
//     } catch (error) {
//       console.error("Checkout initialization failed:", error);
//       alert(error.message || "Unable to open checkout.");
//     }
//   });

//   closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
//   overlay.addEventListener("click", closeModal);
//   document.addEventListener("keydown", e => {
//     if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
//   });

//   if (guestCheckoutBtn) {
//     guestCheckoutBtn.addEventListener("click", async function () {
//       currentCheckoutUser = null;
//       const guestSection = modal.querySelector("[data-guest-only]");
//       if (guestSection) guestSection.hidden = false;
//       ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-phone", "checkout-country", "checkout-address", "checkout-city", "checkout-state", "checkout-zip"].forEach(id => {
//         const el = modal.querySelector(`#${id}`);
//         if (el) el.value = "";
//       });
//       renderStateOptions("");
//       renderCityOptions("", "");
//       updateShipping("", false);
//       goToStep(2);
//       updateGuestContinueState();
//     });
//   }

//   if (signupCheckoutBtn) signupCheckoutBtn.addEventListener("click", () => { window.location.href = "signup.html"; });

//   if (accountCheckoutBtn) {
//     accountCheckoutBtn.addEventListener("click", async function () {
//       if (!currentCheckoutUser || accountCheckoutBtn.disabled) return;

//       const rule = shippingRule(accountCountryCode);
//       if (!rule.supported) return;

//       setButtonLoading(accountCheckoutBtn, true);
//       try {
//         const cart = await window.BLEGAB_CART.getCart();
//         const address = currentCheckoutUser.address || {};
//         const data = await createCheckoutSession({
//           firstName: currentCheckoutUser.firstName || "",
//           lastName: currentCheckoutUser.lastName || "",
//           email: currentCheckoutUser.email || "",
//           phone: currentCheckoutUser.phone || "",
//           country: getCountryName(accountCountryCode),
//           state: getUserStateValue(currentCheckoutUser),
//           city: getUserCityValue(currentCheckoutUser),
//           address: address.street || "",
//           postalCode: address.postalCode || "",
//           shippingCost: Number(rule.cost),
//           cart
//         });
//         window.location.assign(data.url);
//       } catch (error) {
//         alert(error.message || "Unable to continue to Stripe.");
//         setButtonLoading(accountCheckoutBtn, false);
//       }
//     });
//   }

//   ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-address", "checkout-city", "checkout-state", "checkout-zip", "checkout-phone"].forEach(id => {
//     const input = modal.querySelector(`#${id}`);
//     if (!input) return;
//     input.addEventListener("input", updateGuestContinueState);
//     input.addEventListener("change", updateGuestContinueState);
//   });

//   if (country) {
//     countryWrapper.style.display = "block";
// }

//   if (continueBtn) {
//     continueBtn.addEventListener("click", async function () {
//       if (currentCheckoutUser || continueBtn.disabled) return;
//       const countryCode = guestCountryEl?.value || "";
//       const rule = shippingRule(countryCode);
//       if (!rule.supported || !getAllGuestFieldsFilled()) {
//         updateGuestContinueState();
//         return;
//       }

//       setButtonLoading(continueBtn, true);
//       try {
//         const cart = await window.BLEGAB_CART.getCart();
//         const data = await createCheckoutSession({
//           firstName: modal.querySelector("#checkout-first-name").value.trim(),
//           lastName: modal.querySelector("#checkout-last-name").value.trim(),
//           email: modal.querySelector("#checkout-email").value.trim(),
//           phone: modal.querySelector("#checkout-phone").value.trim(),
//           country: getCountryName(countryCode),
//           state: modal.querySelector("#checkout-state").value.trim(),
//           city: modal.querySelector("#checkout-city").value.trim(),
//           address: modal.querySelector("#checkout-address").value.trim(),
//           postalCode: modal.querySelector("#checkout-zip").value.trim(),
//           shippingCost: Number(rule.cost),
//           cart
//         });
//         window.location.assign(data.url);
//       } catch (error) {
//         alert(error.message || "Unable to continue to Stripe.");
//         setButtonLoading(continueBtn, false);
//       }
//     });
//   }

//   // Keep guest country list available even before the first checkout click if the modal is opened by other code.
//   loadLocationData().catch(error => console.error("Unable to load country/state data:", error));
// }

// document.addEventListener("DOMContentLoaded", initCheckoutModal);


// /* =========================================================
//    BLEGAB CHECKOUT
//    - All countries available to guest checkout.
//    - All states/cities are supplied by country-state-city.
//    - Shipping rules come only from shipping-calculator.js.
//    - Backend/API endpoints are unchanged.
//    ========================================================= */

// const CHECKOUT_API_URL = "https://api.blegab.com/api";
// const LOCATION_MODULE_URL = "https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/+esm";
// const WHATSAPP_NUMBER = "14696180809";

// async function createCheckoutSession(checkoutData) {
//   const response = await fetch(`${CHECKOUT_API_URL}/orders/checkout`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(checkoutData)
//   });

//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Unable to create Stripe checkout.");
//   if (!data.url) throw new Error("Stripe checkout URL was not returned by the server.");
//   return data;
// }

// function setButtonLoading(button, loading) {
//   if (window.BLEGAB_BUTTONS && typeof window.BLEGAB_BUTTONS.setLoading === "function") {
//     window.BLEGAB_BUTTONS.setLoading(button, loading);
//   } else if (button) {
//     button.disabled = !!loading;
//   }
// }

// function getUserCountryValue(user) {
//   return user?.address?.country || user?.country || "";
// }

// function getUserStateValue(user) {
//   return user?.address?.state || user?.state || "";
// }

// function getUserCityValue(user) {
//   return user?.address?.city || user?.city || "";
// }

// function normalizeLocationValue(value, countries, finder) {
//   const raw = String(value || "").trim();
//   if (!raw) return null;
//   const lower = raw.toLowerCase();
//   return countries.find(c => String(c.isoCode).toLowerCase() === lower)
//     || countries.find(c => String(c.name).toLowerCase() === lower)
//     || (finder ? finder(raw) : null);
// }

// function initCheckoutModal() {
//   const overlay = document.querySelector('[data-checkout-modal-overlay]');
//   const modal = document.querySelector('[data-checkout-modal]');
//   const checkoutBtn = document.querySelector('[data-checkout]');
//   if (!overlay || !modal || !checkoutBtn) return;

//   const continueBtn = modal.querySelector('[data-checkout-continue]');
//   const accountCheckoutBtn = modal.querySelector('[data-checkout-option="account"]');
//   const guestCheckoutBtn = modal.querySelector('[data-checkout-option="guest"]');
//   const signupCheckoutBtn = modal.querySelector('[data-checkout-option="signup"]');
//   const closeBtns = modal.querySelectorAll('[data-checkout-modal-close]');
//   const stepIndicators = modal.querySelectorAll('[data-checkout-step-indicator]');
//   const stepPanels = modal.querySelectorAll('[data-checkout-step-panel]');
//   const checkoutUserNameEl = modal.querySelector('[data-checkout-user-name]');
//   const accountCountryPanel = modal.querySelector('[data-account-country-panel]');
//   const accountCountryEl = modal.querySelector('#checkout-account-country');
//   const accountContactAdminBtn = modal.querySelector('[data-account-contact-admin]');
//   const guestCountryEl = modal.querySelector('#checkout-country');
//   const guestStateEl = modal.querySelector('#checkout-state');
//   const guestStateListEl = modal.querySelector('[data-state-combobox-list]');
//   const guestCityEl = modal.querySelector('#checkout-city');
//   const guestCityListEl = modal.querySelector('[data-city-combobox-list]');
//   const contactAdminBtn = modal.querySelector('[data-contact-admin-shipping]');
//   const shippingRowEl = modal.querySelector('[data-checkout-shipping-row]');
//   const shippingCostEl = modal.querySelector('[data-checkout-summary-shipping]');
//   const totalEl = modal.querySelector('[data-checkout-summary-total]');
//   const subtotalEl = modal.querySelector('[data-checkout-summary-subtotal]');
//   const countEl = modal.querySelector('[data-checkout-summary-count]');
//   const ctaTotalEl = modal.querySelector('[data-checkout-cta-total]');

//   let currentStep = 1;
//   let currentCheckoutUser = null;
//   let locationData = null;
//   let subtotal = 0;
//   let currentShipping = null;
//   let accountCountryCode = "";
//   let guestStateOptions = [];
//   let guestCityOptions = [];

//   function shippingApi() {
//     return window.BLEGAB_SHIPPING || null;
//   }

//   function shippingRule(countryCode) {
//     const api = shippingApi();
//     return api ? api.getShippingRule(countryCode) : {
//       supported: false,
//       contactAdmin: true,
//       cost: null
//     };
//   }

//   function contactWhatsApp(countryName) {
//     const message = countryName
//       ? `Hello Blegab, I need the shipping fee for ${countryName}.`
//       : "Hello Blegab, I need information about the shipping fee for my country.";
//     window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
//   }

//   if (contactAdminBtn) {
//     contactAdminBtn.addEventListener("click", function (event) {
//       event.preventDefault();
//       const countryName = currentCheckoutUser
//         ? getCountryName(accountCountryCode)
//         : getCountryName(guestCountryEl?.value);
//       contactWhatsApp(countryName);
//     });
//   }

//   function getCountryName(code) {
//     const country = locationData?.countries?.find(c => c.isoCode === String(code || "").toUpperCase());
//     return country ? country.name : String(code || "");
//   }

//   function normalizeCountry(value) {
//     const country = normalizeLocationValue(value, locationData?.countries || []);
//     return country ? country.isoCode : "";
//   }

//   function normalizeState(countryCode, value) {
//     const raw = String(value || "").trim().toLowerCase();
//     if (!raw || !countryCode || !locationData) return "";
//     const states = locationData.State.getStatesOfCountry(countryCode) || [];
//     const state = states.find(s => String(s.isoCode).toLowerCase() === raw)
//       || states.find(s => String(s.name).toLowerCase() === raw);
//     return state ? state.isoCode : "";
//   }

//   async function loadLocationData() {
//     if (locationData) return locationData;
//     const module = await import(LOCATION_MODULE_URL);
//     const countries = module.Country.getAllCountries();
//     locationData = {
//       Country: module.Country,
//       State: module.State,
//       City: module.City,
//       countries
//     };
//     populateCountrySelect(guestCountryEl);
//     populateCountrySelect(accountCountryEl);
//     return locationData;
//   }

//   function populateCountrySelect(select) {
//     if (!select || !locationData) return;
//     select.innerHTML = '<option value="">Select your country</option>' +
//       locationData.countries.map(c => `<option value="${c.isoCode}">${c.name}</option>`).join("");
//   }

//   function getStates(countryCode) {
//     if (!countryCode || !locationData) return [];
//     return locationData.State.getStatesOfCountry(countryCode) || [];
//   }

//   function getCities(countryCode, stateCode) {
//     if (!countryCode || !stateCode || !locationData) return [];
//     return locationData.City.getCitiesOfState(countryCode, stateCode) || [];
//   }

//   function renderStateOptions(countryCode) {
//     guestStateOptions = getStates(countryCode);
//     if (!guestStateEl) return;

//     guestStateEl.value = "";
//     guestStateEl.disabled = false;
//     guestStateEl.placeholder =
//   guestStateOptions.length
//     ? "Search or enter your state"
//     : "Enter your state";
//     if (guestStateListEl) guestStateListEl.hidden = true;
//   }

//   function renderCityOptions(countryCode, stateCode) {
//     guestCityOptions = getCities(countryCode, stateCode);
//     if (!guestCityEl) return;

//     guestCityEl.value = "";
//     guestCityEl.disabled = !stateCode;
//     guestCityEl.placeholder = stateCode
//       ? (guestCityOptions.length ? "Search for your city" : "Enter your city")
//       : "Select state first";
//     if (guestCityListEl) guestCityListEl.hidden = true;
//   }

//   function renderComboboxList(input, list, options, key) {
//     if (!list || !input) return;
//     const query = input.value.trim().toLowerCase();
//     const filtered = query
//       ? options.filter(item => item.name.toLowerCase().includes(query))
//       : options;

//     if (!filtered.length) {
//       list.innerHTML = '<li class="checkout-combobox__empty">No matching results</li>';
//     } else {
//       list.innerHTML = filtered.slice(0, 100).map(item =>
//         `<li class="checkout-combobox__option" data-${key}-value="${item.isoCode || item.name}">${item.name}</li>`
//       ).join("");
//     }
//     list.hidden = false;
//   }

//   if (guestStateEl) {
//     guestStateEl.addEventListener("input", function () {
//       renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
//       updateGuestContinueState();
//     });
//     guestStateEl.addEventListener("focus", function () {
//       renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
//     });
//   }

//   if (guestStateListEl) {
//     guestStateListEl.addEventListener("mousedown", e => e.preventDefault());
//     guestStateListEl.addEventListener("click", function (e) {
//       const option = e.target.closest("[data-state-value]");
//       if (!option) return;
//       const stateCode = option.getAttribute("data-state-value");
//       const state = guestStateOptions.find(s => s.isoCode === stateCode);
//       if (!state) return;
//       guestStateEl.value = state.name;
//       guestStateListEl.hidden = true;
//       renderCityOptions(guestCountryEl.value, state.isoCode);
//       updateGuestContinueState();
//     });
//   }

//   if (guestCityEl) {
//     guestCityEl.addEventListener("input", function () {
//       if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
//       updateGuestContinueState();
//     });
//     guestCityEl.addEventListener("focus", function () {
//       if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
//     });
//   }

//   if (guestCityListEl) {
//     guestCityListEl.addEventListener("mousedown", e => e.preventDefault());
//     guestCityListEl.addEventListener("click", function (e) {
//       const option = e.target.closest("[data-city-value]");
//       if (!option) return;
//       guestCityEl.value = option.getAttribute("data-city-value");
//       guestCityListEl.hidden = true;
//       updateGuestContinueState();
//     });
//   }

//   if (guestCountryEl) {
//     guestCountryEl.addEventListener("change", function () {
//       renderStateOptions(guestCountryEl.value);
//       renderCityOptions(guestCountryEl.value, "");
//       updateShipping(guestCountryEl.value, false);
//       updateGuestContinueState();
//     });
//   }

//   if (accountCountryEl) {
//     accountCountryEl.addEventListener("change", function () {
//       accountCountryCode = accountCountryEl.value;
//       updateShipping(accountCountryCode, true);
//       updateAccountButtonState();
//     });
//   }

//   function getAllGuestFieldsFilled() {
//     const ids = [
//       "checkout-first-name",
//       "checkout-last-name",
//       "checkout-email",
//       "checkout-country",
//       "checkout-address",
//       "checkout-state",
//       "checkout-city",
//       "checkout-zip"
//     ];
//     return ids.every(id => {
//       const el = modal.querySelector(`#${id}`);
//       return el && String(el.value || "").trim() !== "";
//     });
//   }

//   function updateShipping(countryCode, isAccount) {
//   const rule = shippingRule(countryCode);
//   currentShipping = rule;

//   if (shippingRowEl) {
//     shippingRowEl.classList.remove("is-contact-required");
//   }

//   if (contactAdminBtn) {
//     contactAdminBtn.hidden = true;
//   }

//   // Hide the account-country contact message by default.
//   if (accountContactAdminBtn) {
//     accountContactAdminBtn.hidden = true;
//   }

//   if (!countryCode) {
//     if (shippingCostEl) {
//       shippingCostEl.textContent = "Select country";
//     }

//     if (totalEl) {
//       totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (ctaTotalEl) {
//       ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     return rule;
//   }

//   // Country has no registered shipping fee.
//   if (!rule.supported) {
//     if (shippingCostEl) {
//       shippingCostEl.textContent = "Contact Admin for shipping fee";
//     }

//     if (totalEl) {
//       totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (ctaTotalEl) {
//       ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (shippingRowEl) {
//       shippingRowEl.classList.add("is-contact-required");
//     }

//     // Existing contact button in the order summary.
//     if (contactAdminBtn) {
//       contactAdminBtn.hidden = false;
//       contactAdminBtn.href =
//         `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
//         )}`;
//     }

//     // NEW:
//     // Show the clickable message directly underneath
//     // the country selector for logged-in/account checkout.
//     if (isAccount && accountContactAdminBtn) {
//       accountContactAdminBtn.hidden = false;
//       accountContactAdminBtn.href =
//         `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
//         )}`;
//     }

//     return rule;
//   }

//   // Country has a registered shipping fee.
//   const shipping = Number(rule.cost || 0);
//   const total = subtotal + shipping;

//   if (shippingCostEl) {
//     shippingCostEl.textContent = `$${shipping.toFixed(2)}`;
//   }

//   if (totalEl) {
//     totalEl.textContent = `$${total.toFixed(2)}`;
//   }

//   if (ctaTotalEl) {
//     ctaTotalEl.textContent = `$${total.toFixed(2)}`;
//   }

//   return rule;
// }

// function updateAccountButtonState() {
//   if (!accountCheckoutBtn) return;

//   const supported = !!accountCountryCode && !!currentShipping?.supported;
//   const needsCountry = !accountCountryCode;

//   // Keep the country selector visible at all times.
//   // The user may want to change/reselect their country.
//   if (accountCountryPanel) {
//     accountCountryPanel.hidden = false;
//   }

//   // The "Continue as username" button is only enabled
//   // when a valid/supported country has been selected.
//   accountCheckoutBtn.disabled = !supported;
//   accountCheckoutBtn.classList.toggle("is-disabled", !supported);

//   if (needsCountry) {
//     accountCheckoutBtn.setAttribute("aria-disabled", "true");
//   } else {
//     accountCheckoutBtn.removeAttribute("aria-disabled");
//   }
// }

//   function updateGuestContinueState() {
//     if (!continueBtn || currentCheckoutUser) return;
//     const countryCode = guestCountryEl?.value || "";
//     const rule = shippingRule(countryCode);
//     const ready = getAllGuestFieldsFilled() && rule.supported;
//     continueBtn.disabled = !ready;
//     continueBtn.classList.toggle("is-disabled", !ready);
//   }

//   function setAccountCountryFromUser(user) {
//     const raw = getUserCountryValue(user);
//     accountCountryCode = normalizeCountry(raw);
//     if (accountCountryEl) accountCountryEl.value = accountCountryCode;
//     updateShipping(accountCountryCode, true);
//     updateAccountButtonState();
//   }

//   function fillGuestFromUser(user) {
//     const fields = {
//       "checkout-first-name": user?.firstName || "",
//       "checkout-last-name": user?.lastName || "",
//       "checkout-email": user?.email || "",
//       "checkout-phone": user?.phone || "",
//       "checkout-address": user?.address?.street || "",
//       "checkout-zip": user?.address?.postalCode || ""
//     };
//     Object.entries(fields).forEach(([id, value]) => {
//       const el = modal.querySelector(`#${id}`);
//       if (el) el.value = value;
//     });
//   }

//   async function renderOrderSummary() {
//     const itemsEl = modal.querySelector("[data-checkout-summary-items]");
//     if (!itemsEl) return;

//     const response = await window.BLEGAB_CART.getCart();
//     if (!response || !response.success || !response.cart) throw new Error(response?.message || "Failed to load cart");

//     itemsEl.innerHTML = "";
//     (response.cart.items || []).forEach(item => {
//       const product = item.product;
//       if (!product) return;
//       const image = product.images?.[0]
//         ? (String(product.images[0]).startsWith("http") ? product.images[0] : `/assets/images/products/${product.images[0]}`)
//         : "/assets/images/placeholder.png";
//       itemsEl.insertAdjacentHTML("beforeend", `
//         <div class="checkout-summary__item">
//           <img src="${image}" alt="${product.name || "Product"}">
//           <div class="checkout-summary__item-info">
//             <span class="name">${product.name || "Product"}</span>
//             <span class="meta">×${item.quantity}</span>
//           </div>
//           <span class="checkout-summary__item-price">$${Number(item.lineTotal || 0).toFixed(2)}</span>
//         </div>`);
//     });

//     subtotal = Number(response.subtotal || 0);
//     if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     if (countEl) countEl.textContent = response.totalItems || 0;

//     updateShipping(currentCheckoutUser ? accountCountryCode : guestCountryEl?.value || "", !!currentCheckoutUser);
//   }

//   function goToStep(step) {
//     currentStep = step;
//     modal.classList.toggle("checkout-modal--step-2", step === 2);
//     stepPanels.forEach(panel => {
//       panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
//     });
//     stepIndicators.forEach(indicator => {
//       const num = indicator.dataset.checkoutStepIndicator;
//       indicator.classList.toggle("is-active", num === String(step));
//       indicator.classList.toggle("is-done", Number(num) < step);
//     });
//     const body = modal.querySelector(".checkout-modal__body");
//     if (body) body.scrollTop = 0;
//   }

//   function openModal() {
//     modal.classList.add("is-open");
//     overlay.classList.add("is-open");
//     modal.setAttribute("aria-hidden", "false");
//     document.body.classList.add("checkout-open");
//   }

//   function closeModal() {
//     modal.classList.remove("is-open");
//     overlay.classList.remove("is-open");
//     modal.setAttribute("aria-hidden", "true");
//     document.body.classList.remove("checkout-open");
//   }

//   checkoutBtn.addEventListener("click", async function () {
//     try {
//       const cart = await window.BLEGAB_CART.getCart();
//       if (!cart?.cart?.items?.length) {
//         alert("Your cart is empty.");
//         return;
//       }

//       await loadLocationData();
//       await renderOrderSummary();

//       let user = null;
//       try {
//         const response = await fetch(`${CHECKOUT_API_URL}/auth/me`, { credentials: "include" });
//         if (response.ok) {
//           const data = await response.json();
//           user = data.user || null;
//         }
//       } catch (error) {
//         console.error("Unable to check logged-in customer:", error);
//       }

//       currentCheckoutUser = user;

//       if (user) {
//         const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Account";
//         if (checkoutUserNameEl) checkoutUserNameEl.textContent = displayName;
//         if (accountCheckoutBtn) accountCheckoutBtn.hidden = false;
//         if (guestCheckoutBtn) guestCheckoutBtn.hidden = true;
//         if (signupCheckoutBtn) signupCheckoutBtn.hidden = true;
//         fillGuestFromUser(user);
//         setAccountCountryFromUser(user);
//         goToStep(1);
//       } else {
//         currentCheckoutUser = null;
//         if (accountCheckoutBtn) accountCheckoutBtn.hidden = true;
//         if (guestCheckoutBtn) guestCheckoutBtn.hidden = false;
//         if (signupCheckoutBtn) signupCheckoutBtn.hidden = false;
//         if (continueBtn) continueBtn.disabled = true;
//         goToStep(1);
//         updateShipping("", false);
//       }

//       openModal();
//     } catch (error) {
//       console.error("Checkout initialization failed:", error);
//       alert(error.message || "Unable to open checkout.");
//     }
//   });

//   closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
//   overlay.addEventListener("click", closeModal);
//   document.addEventListener("keydown", e => {
//     if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
//   });

//   if (guestCheckoutBtn) {
//     guestCheckoutBtn.addEventListener("click", async function () {
//       currentCheckoutUser = null;
//       const guestSection = modal.querySelector("[data-guest-only]");
//       if (guestSection) guestSection.hidden = false;
//       ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-phone", "checkout-country", "checkout-address", "checkout-city", "checkout-state", "checkout-zip"].forEach(id => {
//         const el = modal.querySelector(`#${id}`);
//         if (el) el.value = "";
//       });
//       renderStateOptions("");
//       renderCityOptions("", "");
//       updateShipping("", false);
//       goToStep(2);
//       updateGuestContinueState();
//     });
//   }

//   if (signupCheckoutBtn) signupCheckoutBtn.addEventListener("click", () => { window.location.href = "signup.html"; });

//   if (accountCheckoutBtn) {
//     accountCheckoutBtn.addEventListener("click", async function () {
//       if (!currentCheckoutUser || accountCheckoutBtn.disabled) return;

//       const rule = shippingRule(accountCountryCode);
//       if (!rule.supported) return;

//       setButtonLoading(accountCheckoutBtn, true);
//       try {
//         const cart = await window.BLEGAB_CART.getCart();
//         const address = currentCheckoutUser.address || {};
//         const data = await createCheckoutSession({
//           firstName: currentCheckoutUser.firstName || "",
//           lastName: currentCheckoutUser.lastName || "",
//           email: currentCheckoutUser.email || "",
//           phone: currentCheckoutUser.phone || "",
//           country: getCountryName(accountCountryCode),
//           state: getUserStateValue(currentCheckoutUser),
//           city: getUserCityValue(currentCheckoutUser),
//           address: address.street || "",
//           postalCode: address.postalCode || "",
//           shippingCost: Number(rule.cost),
//           cart
//         });
//         window.location.assign(data.url);
//       } catch (error) {
//         alert(error.message || "Unable to continue to Stripe.");
//         setButtonLoading(accountCheckoutBtn, false);
//       }
//     });
//   }

//   ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-address", "checkout-city", "checkout-state", "checkout-zip", "checkout-phone"].forEach(id => {
//     const input = modal.querySelector(`#${id}`);
//     if (!input) return;
//     input.addEventListener("input", updateGuestContinueState);
//     input.addEventListener("change", updateGuestContinueState);
//   });

//   if (country) {
//     countryWrapper.style.display = "block";
// }

//   if (continueBtn) {
//     continueBtn.addEventListener("click", async function () {
//       if (currentCheckoutUser || continueBtn.disabled) return;
//       const countryCode = guestCountryEl?.value || "";
//       const rule = shippingRule(countryCode);
//       if (!rule.supported || !getAllGuestFieldsFilled()) {
//         updateGuestContinueState();
//         return;
//       }

//       setButtonLoading(continueBtn, true);
//       try {
//         const cart = await window.BLEGAB_CART.getCart();
//         const data = await createCheckoutSession({
//           firstName: modal.querySelector("#checkout-first-name").value.trim(),
//           lastName: modal.querySelector("#checkout-last-name").value.trim(),
//           email: modal.querySelector("#checkout-email").value.trim(),
//           phone: modal.querySelector("#checkout-phone").value.trim(),
//           country: getCountryName(countryCode),
//           state: modal.querySelector("#checkout-state").value.trim(),
//           city: modal.querySelector("#checkout-city").value.trim(),
//           address: modal.querySelector("#checkout-address").value.trim(),
//           postalCode: modal.querySelector("#checkout-zip").value.trim(),
//           shippingCost: Number(rule.cost),
//           cart
//         });
//         window.location.assign(data.url);
//       } catch (error) {
//         alert(error.message || "Unable to continue to Stripe.");
//         setButtonLoading(continueBtn, false);
//       }
//     });
//   }

//   // Keep guest country list available even before the first checkout click if the modal is opened by other code.
//   loadLocationData().catch(error => console.error("Unable to load country/state data:", error));
// }

// document.addEventListener("DOMContentLoaded", initCheckoutModal);


// /* =========================================================
//    BLEGAB CHECKOUT
//    - All countries available to guest checkout.
//    - All states/cities are supplied by country-state-city.
//    - Shipping rules come only from shipping-calculator.js.
//    - Backend/API endpoints are unchanged.
//    ========================================================= */

// const CHECKOUT_API_URL = "https://api.blegab.com/api";
// const LOCATION_MODULE_URL = "https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/+esm";
// const WHATSAPP_NUMBER = "14696180809";

// async function createCheckoutSession(checkoutData) {
//   const response = await fetch(`${CHECKOUT_API_URL}/orders/checkout`, {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(checkoutData)
//   });

//   const data = await response.json();
//   if (!response.ok) throw new Error(data.message || "Unable to create Stripe checkout.");
//   if (!data.url) throw new Error("Stripe checkout URL was not returned by the server.");
//   return data;
// }

// function setButtonLoading(button, loading) {
//   if (window.BLEGAB_BUTTONS && typeof window.BLEGAB_BUTTONS.setLoading === "function") {
//     window.BLEGAB_BUTTONS.setLoading(button, loading);
//   } else if (button) {
//     button.disabled = !!loading;
//   }
// }

// function getUserCountryValue(user) {
//   return user?.address?.country || user?.country || "";
// }

// function getUserStateValue(user) {
//   return user?.address?.state || user?.state || "";
// }

// function getUserCityValue(user) {
//   return user?.address?.city || user?.city || "";
// }

// function normalizeLocationValue(value, countries, finder) {
//   const raw = String(value || "").trim();
//   if (!raw) return null;
//   const lower = raw.toLowerCase();
//   return countries.find(c => String(c.isoCode).toLowerCase() === lower)
//     || countries.find(c => String(c.name).toLowerCase() === lower)
//     || (finder ? finder(raw) : null);
// }

// function initCheckoutModal() {
//   const overlay = document.querySelector('[data-checkout-modal-overlay]');
//   const modal = document.querySelector('[data-checkout-modal]');
//   const checkoutBtn = document.querySelector('[data-checkout]');
//   if (!overlay || !modal || !checkoutBtn) return;

//   const continueBtn = modal.querySelector('[data-checkout-continue]');
//   const accountCheckoutBtn = modal.querySelector('[data-checkout-option="account"]');
//   const guestCheckoutBtn = modal.querySelector('[data-checkout-option="guest"]');
//   const signupCheckoutBtn = modal.querySelector('[data-checkout-option="signup"]');
//   const closeBtns = modal.querySelectorAll('[data-checkout-modal-close]');
//   const stepIndicators = modal.querySelectorAll('[data-checkout-step-indicator]');
//   const stepPanels = modal.querySelectorAll('[data-checkout-step-panel]');
//   const checkoutUserNameEl = modal.querySelector('[data-checkout-user-name]');
//   const accountCountryPanel = modal.querySelector('[data-account-country-panel]');
//   const accountCountryEl = modal.querySelector('#checkout-account-country');
//   const accountContactAdminBtn = modal.querySelector('[data-account-contact-admin]');
//   const guestCountryEl = modal.querySelector('#checkout-country');
//   const guestStateEl = modal.querySelector('#checkout-state');
//   const guestStateListEl = modal.querySelector('[data-state-combobox-list]');
//   const guestCityEl = modal.querySelector('#checkout-city');
//   const guestCityListEl = modal.querySelector('[data-city-combobox-list]');
//   const contactAdminBtn = modal.querySelector('[data-contact-admin-shipping]');
//   const shippingRowEl = modal.querySelector('[data-checkout-shipping-row]');
//   const shippingCostEl = modal.querySelector('[data-checkout-summary-shipping]');
//   const totalEl = modal.querySelector('[data-checkout-summary-total]');
//   const subtotalEl = modal.querySelector('[data-checkout-summary-subtotal]');
//   const countEl = modal.querySelector('[data-checkout-summary-count]');
//   const ctaTotalEl = modal.querySelector('[data-checkout-cta-total]');

//   let currentStep = 1;
//   let currentCheckoutUser = null;
//   let locationData = null;
//   let subtotal = 0;
//   let currentShipping = null;
//   let accountCountryCode = "";
//   let guestStateOptions = [];
//   let guestCityOptions = [];

//   function shippingApi() {
//     return window.BLEGAB_SHIPPING || null;
//   }

//   function shippingRule(countryCode) {
//     const api = shippingApi();
//     return api ? api.getShippingRule(countryCode) : {
//       supported: false,
//       contactAdmin: true,
//       cost: null
//     };
//   }

//   function contactWhatsApp(countryName) {
//     const message = countryName
//       ? `Hello Blegab, I need the shipping fee for ${countryName}.`
//       : "Hello Blegab, I need information about the shipping fee for my country.";
//     window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
//   }

//   if (contactAdminBtn) {
//     contactAdminBtn.addEventListener("click", function (event) {
//       event.preventDefault();
//       const countryName = currentCheckoutUser
//         ? getCountryName(accountCountryCode)
//         : getCountryName(guestCountryEl?.value);
//       contactWhatsApp(countryName);
//     });
//   }

//   function getCountryName(code) {
//     const country = locationData?.countries?.find(c => c.isoCode === String(code || "").toUpperCase());
//     return country ? country.name : String(code || "");
//   }

//   function normalizeCountry(value) {
//     const country = normalizeLocationValue(value, locationData?.countries || []);
//     return country ? country.isoCode : "";
//   }

//   function normalizeState(countryCode, value) {
//     const raw = String(value || "").trim().toLowerCase();
//     if (!raw || !countryCode || !locationData) return "";
//     const states = locationData.State.getStatesOfCountry(countryCode) || [];
//     const state = states.find(s => String(s.isoCode).toLowerCase() === raw)
//       || states.find(s => String(s.name).toLowerCase() === raw);
//     return state ? state.isoCode : "";
//   }

//   async function loadLocationData() {
//     if (locationData) return locationData;
//     const module = await import(LOCATION_MODULE_URL);
//     const countries = module.Country.getAllCountries();
//     locationData = {
//       Country: module.Country,
//       State: module.State,
//       City: module.City,
//       countries
//     };
//     populateCountrySelect(guestCountryEl);
//     populateCountrySelect(accountCountryEl);
//     return locationData;
//   }

//   function populateCountrySelect(select) {
//     if (!select || !locationData) return;
//     select.innerHTML = '<option value="">Select your country</option>' +
//       locationData.countries.map(c => `<option value="${c.isoCode}">${c.name}</option>`).join("");
//   }

//   function getStates(countryCode) {
//     if (!countryCode || !locationData) return [];
//     return locationData.State.getStatesOfCountry(countryCode) || [];
//   }

//   function getCities(countryCode, stateCode) {
//     if (!countryCode || !stateCode || !locationData) return [];
//     return locationData.City.getCitiesOfState(countryCode, stateCode) || [];
//   }

//   function renderStateOptions(countryCode) {
//     guestStateOptions = getStates(countryCode);
//     if (!guestStateEl) return;

//     guestStateEl.value = "";
//     guestStateEl.disabled = false;
//     guestStateEl.placeholder =
//   guestStateOptions.length
//     ? "Search or enter your state"
//     : "Enter your state";
//     if (guestStateListEl) guestStateListEl.hidden = true;
//   }

//   function renderCityOptions(countryCode, stateCode) {
//     guestCityOptions = getCities(countryCode, stateCode);
//     if (!guestCityEl) return;

//     guestCityEl.value = "";
//     guestCityEl.disabled = !stateCode;
//     guestCityEl.placeholder = stateCode
//       ? (guestCityOptions.length ? "Search for your city" : "Enter your city")
//       : "Select state first";
//     if (guestCityListEl) guestCityListEl.hidden = true;
//   }

//   function renderComboboxList(input, list, options, key) {
//     if (!list || !input) return;
//     const query = input.value.trim().toLowerCase();
//     const filtered = query
//       ? options.filter(item => item.name.toLowerCase().includes(query))
//       : options;

//     if (!filtered.length) {
//       list.innerHTML = '<li class="checkout-combobox__empty">No matching results</li>';
//     } else {
//       list.innerHTML = filtered.slice(0, 100).map(item =>
//         `<li class="checkout-combobox__option" data-${key}-value="${item.isoCode || item.name}">${item.name}</li>`
//       ).join("");
//     }
//     list.hidden = false;
//   }

//   if (guestStateEl) {
//     guestStateEl.addEventListener("input", function () {
//       renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
//       updateGuestContinueState();
//     });
//     guestStateEl.addEventListener("focus", function () {
//       renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
//     });
//   }

//   if (guestStateListEl) {
//     guestStateListEl.addEventListener("mousedown", e => e.preventDefault());
//     guestStateListEl.addEventListener("click", function (e) {
//       const option = e.target.closest("[data-state-value]");
//       if (!option) return;
//       const stateCode = option.getAttribute("data-state-value");
//       const state = guestStateOptions.find(s => s.isoCode === stateCode);
//       if (!state) return;
//       guestStateEl.value = state.name;
//       guestStateListEl.hidden = true;
//       renderCityOptions(guestCountryEl.value, state.isoCode);
//       updateGuestContinueState();
//     });
//   }

//   if (guestCityEl) {
//     guestCityEl.addEventListener("input", function () {
//       if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
//       updateGuestContinueState();
//     });
//     guestCityEl.addEventListener("focus", function () {
//       if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
//     });
//   }

//   if (guestCityListEl) {
//     guestCityListEl.addEventListener("mousedown", e => e.preventDefault());
//     guestCityListEl.addEventListener("click", function (e) {
//       const option = e.target.closest("[data-city-value]");
//       if (!option) return;
//       guestCityEl.value = option.getAttribute("data-city-value");
//       guestCityListEl.hidden = true;
//       updateGuestContinueState();
//     });
//   }

//   if (guestCountryEl) {
//     guestCountryEl.addEventListener("change", function () {
//       renderStateOptions(guestCountryEl.value);
//       renderCityOptions(guestCountryEl.value, "");
//       updateShipping(guestCountryEl.value, false);
//       updateGuestContinueState();
//     });
//   }

//   if (accountCountryEl) {
//     accountCountryEl.addEventListener("change", function () {
//       accountCountryCode = accountCountryEl.value;
//       updateShipping(accountCountryCode, true);
//       updateAccountButtonState();
//     });
//   }

//   function getAllGuestFieldsFilled() {
//     const ids = [
//       "checkout-first-name",
//       "checkout-last-name",
//       "checkout-email",
//       "checkout-country",
//       "checkout-address",
//       "checkout-state",
//       "checkout-city",
//       "checkout-zip"
//     ];
//     return ids.every(id => {
//       const el = modal.querySelector(`#${id}`);
//       return el && String(el.value || "").trim() !== "";
//     });
//   }

//   function updateShipping(countryCode, isAccount) {
//   const rule = shippingRule(countryCode);
//   currentShipping = rule;

//   if (shippingRowEl) {
//     shippingRowEl.classList.remove("is-contact-required");
//   }

//   if (contactAdminBtn) {
//     contactAdminBtn.hidden = true;
//   }

//   // Hide the account-country contact message by default.
//   if (accountContactAdminBtn) {
//     accountContactAdminBtn.hidden = true;
//   }

//   if (!countryCode) {
//     if (shippingCostEl) {
//       shippingCostEl.textContent = "Select country";
//     }

//     if (totalEl) {
//       totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (ctaTotalEl) {
//       ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     return rule;
//   }

//   // Country has no registered shipping fee.
//   if (!rule.supported) {
//     if (shippingCostEl) {
//       shippingCostEl.textContent = "Contact Admin for shipping fee";
//     }

//     if (totalEl) {
//       totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (ctaTotalEl) {
//       ctaTotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     }

//     if (shippingRowEl) {
//       shippingRowEl.classList.add("is-contact-required");
//     }

//     // Existing contact button in the order summary.
//     if (contactAdminBtn) {
//       contactAdminBtn.hidden = false;
//       contactAdminBtn.href =
//         `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
//         )}`;
//     }

//     // NEW:
//     // Show the clickable message directly underneath
//     // the country selector for logged-in/account checkout.
//     if (isAccount && accountContactAdminBtn) {
//       accountContactAdminBtn.hidden = false;
//       accountContactAdminBtn.href =
//         `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
//         )}`;
//     }

//     return rule;
//   }

//   // Country has a registered shipping fee.
//   const shipping = Number(rule.cost || 0);
//   const total = subtotal + shipping;

//   if (shippingCostEl) {
//     shippingCostEl.textContent = `$${shipping.toFixed(2)}`;
//   }

//   if (totalEl) {
//     totalEl.textContent = `$${total.toFixed(2)}`;
//   }

//   if (ctaTotalEl) {
//     ctaTotalEl.textContent = `$${total.toFixed(2)}`;
//   }

//   return rule;
// }

// function updateAccountButtonState() {
//   if (!accountCheckoutBtn) return;

//   const supported = !!accountCountryCode && !!currentShipping?.supported;
//   const needsCountry = !accountCountryCode;

//   // Keep the country selector visible at all times.
//   // The user may want to change/reselect their country.
//   if (accountCountryPanel) {
//     accountCountryPanel.hidden = false;
//   }

//   // The "Continue as username" button is only enabled
//   // when a valid/supported country has been selected.
//   accountCheckoutBtn.disabled = !supported;
//   accountCheckoutBtn.classList.toggle("is-disabled", !supported);

//   if (needsCountry) {
//     accountCheckoutBtn.setAttribute("aria-disabled", "true");
//   } else {
//     accountCheckoutBtn.removeAttribute("aria-disabled");
//   }
// }

//   function updateGuestContinueState() {
//     if (!continueBtn || currentCheckoutUser) return;
//     const countryCode = guestCountryEl?.value || "";
//     const rule = shippingRule(countryCode);
//     const ready = getAllGuestFieldsFilled() && rule.supported;
//     continueBtn.disabled = !ready;
//     continueBtn.classList.toggle("is-disabled", !ready);
//   }

//   function setAccountCountryFromUser(user) {
//     const raw = getUserCountryValue(user);
//     accountCountryCode = normalizeCountry(raw);
//     if (accountCountryEl) accountCountryEl.value = accountCountryCode;
//     updateShipping(accountCountryCode, true);
//     updateAccountButtonState();
//   }

//   function fillGuestFromUser(user) {
//     const fields = {
//       "checkout-first-name": user?.firstName || "",
//       "checkout-last-name": user?.lastName || "",
//       "checkout-email": user?.email || "",
//       "checkout-phone": user?.phone || "",
//       "checkout-address": user?.address?.street || "",
//       "checkout-zip": user?.address?.postalCode || ""
//     };
//     Object.entries(fields).forEach(([id, value]) => {
//       const el = modal.querySelector(`#${id}`);
//       if (el) el.value = value;
//     });
//   }

//   async function renderOrderSummary() {
//     const itemsEl = modal.querySelector("[data-checkout-summary-items]");
//     if (!itemsEl) return;

//     const response = await window.BLEGAB_CART.getCart();
//     if (!response || !response.success || !response.cart) throw new Error(response?.message || "Failed to load cart");

//     itemsEl.innerHTML = "";
//     (response.cart.items || []).forEach(item => {
//       const product = item.product;
//       if (!product) return;
//       const image = product.images?.[0]
//         ? (String(product.images[0]).startsWith("http") ? product.images[0] : `/assets/images/products/${product.images[0]}`)
//         : "/assets/images/placeholder.png";
//       itemsEl.insertAdjacentHTML("beforeend", `
//         <div class="checkout-summary__item">
//           <img src="${image}" alt="${product.name || "Product"}">
//           <div class="checkout-summary__item-info">
//             <span class="name">${product.name || "Product"}</span>
//             <span class="meta">×${item.quantity}</span>
//           </div>
//           <span class="checkout-summary__item-price">$${Number(item.lineTotal || 0).toFixed(2)}</span>
//         </div>`);
//     });

//     subtotal = Number(response.subtotal || 0);
//     if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     if (countEl) countEl.textContent = response.totalItems || 0;

//     updateShipping(currentCheckoutUser ? accountCountryCode : guestCountryEl?.value || "", !!currentCheckoutUser);
//   }

//   function goToStep(step) {
//     currentStep = step;
//     modal.classList.toggle("checkout-modal--step-2", step === 2);
//     stepPanels.forEach(panel => {
//       panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
//     });
//     stepIndicators.forEach(indicator => {
//       const num = indicator.dataset.checkoutStepIndicator;
//       indicator.classList.toggle("is-active", num === String(step));
//       indicator.classList.toggle("is-done", Number(num) < step);
//     });
//     const body = modal.querySelector(".checkout-modal__body");
//     if (body) body.scrollTop = 0;
//   }

//   function openModal() {
//     modal.classList.add("is-open");
//     overlay.classList.add("is-open");
//     modal.setAttribute("aria-hidden", "false");
//     document.body.classList.add("checkout-open");
//   }

//   function closeModal() {
//     modal.classList.remove("is-open");
//     overlay.classList.remove("is-open");
//     modal.setAttribute("aria-hidden", "true");
//     document.body.classList.remove("checkout-open");
//   }

//   checkoutBtn.addEventListener("click", async function () {
//     try {
//       const cart = await window.BLEGAB_CART.getCart();
//       if (!cart?.cart?.items?.length) {
//         alert("Your cart is empty.");
//         return;
//       }

//       await loadLocationData();
//       await renderOrderSummary();

//       let user = null;
//       try {
//         const response = await fetch(`${CHECKOUT_API_URL}/auth/me`, { credentials: "include" });
//         if (response.ok) {
//           const data = await response.json();
//           user = data.user || null;
//         }
//       } catch (error) {
//         console.error("Unable to check logged-in customer:", error);
//       }

//       currentCheckoutUser = user;

//       if (user) {
//         const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Account";
//         if (checkoutUserNameEl) checkoutUserNameEl.textContent = displayName;
//         if (accountCheckoutBtn) accountCheckoutBtn.hidden = false;
//         if (guestCheckoutBtn) guestCheckoutBtn.hidden = true;
//         if (signupCheckoutBtn) signupCheckoutBtn.hidden = true;
//         fillGuestFromUser(user);
//         setAccountCountryFromUser(user);
//         goToStep(1);
//       } else {
//         currentCheckoutUser = null;
//         if (accountCheckoutBtn) accountCheckoutBtn.hidden = true;
//         if (guestCheckoutBtn) guestCheckoutBtn.hidden = false;
//         if (signupCheckoutBtn) signupCheckoutBtn.hidden = false;
//         if (continueBtn) continueBtn.disabled = true;
//         goToStep(1);
//         updateShipping("", false);
//       }

//       openModal();
//     } catch (error) {
//       console.error("Checkout initialization failed:", error);
//       alert(error.message || "Unable to open checkout.");
//     }
//   });

//   closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
//   overlay.addEventListener("click", closeModal);
//   document.addEventListener("keydown", e => {
//     if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
//   });

//   if (guestCheckoutBtn) {
//     guestCheckoutBtn.addEventListener("click", async function () {
//       currentCheckoutUser = null;
//       const guestSection = modal.querySelector("[data-guest-only]");
//       if (guestSection) guestSection.hidden = false;
//       ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-phone", "checkout-country", "checkout-address", "checkout-city", "checkout-state", "checkout-zip"].forEach(id => {
//         const el = modal.querySelector(`#${id}`);
//         if (el) el.value = "";
//       });
//       renderStateOptions("");
//       renderCityOptions("", "");
//       updateShipping("", false);
//       goToStep(2);
//       updateGuestContinueState();
//     });
//   }

//   if (signupCheckoutBtn) signupCheckoutBtn.addEventListener("click", () => { window.location.href = "signup.html"; });

//   if (accountCheckoutBtn) {
//     accountCheckoutBtn.addEventListener("click", async function () {
//       if (!currentCheckoutUser || accountCheckoutBtn.disabled) return;

//       const rule = shippingRule(accountCountryCode);
//       if (!rule.supported) return;

//       setButtonLoading(accountCheckoutBtn, true);
//       try {
//         const cart = await window.BLEGAB_CART.getCart();
//         const address = currentCheckoutUser.address || {};
//         const data = await createCheckoutSession({
//           firstName: currentCheckoutUser.firstName || "",
//           lastName: currentCheckoutUser.lastName || "",
//           email: currentCheckoutUser.email || "",
//           phone: currentCheckoutUser.phone || "",
//           country: getCountryName(accountCountryCode),
//           state: getUserStateValue(currentCheckoutUser),
//           city: getUserCityValue(currentCheckoutUser),
//           address: address.street || "",
//           postalCode: address.postalCode || "",
//           shippingCost: Number(rule.cost),
//           cart
//         });
//         window.location.assign(data.url);
//       } catch (error) {
//         alert(error.message || "Unable to continue to Stripe.");
//         setButtonLoading(accountCheckoutBtn, false);
//       }
//     });
//   }

//   ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-address", "checkout-city", "checkout-state", "checkout-zip", "checkout-phone"].forEach(id => {
//     const input = modal.querySelector(`#${id}`);
//     if (!input) return;
//     input.addEventListener("input", updateGuestContinueState);
//     input.addEventListener("change", updateGuestContinueState);
//   });

//   if (country) {
//     countryWrapper.style.display = "block";
// }

//   if (continueBtn) {
//     continueBtn.addEventListener("click", async function () {
//       if (currentCheckoutUser || continueBtn.disabled) return;
//       const countryCode = guestCountryEl?.value || "";
//       const rule = shippingRule(countryCode);
//       if (!rule.supported || !getAllGuestFieldsFilled()) {
//         updateGuestContinueState();
//         return;
//       }

//       setButtonLoading(continueBtn, true);
//       try {
//         const cart = await window.BLEGAB_CART.getCart();
//         const data = await createCheckoutSession({
//           firstName: modal.querySelector("#checkout-first-name").value.trim(),
//           lastName: modal.querySelector("#checkout-last-name").value.trim(),
//           email: modal.querySelector("#checkout-email").value.trim(),
//           phone: modal.querySelector("#checkout-phone").value.trim(),
//           country: getCountryName(countryCode),
//           state: modal.querySelector("#checkout-state").value.trim(),
//           city: modal.querySelector("#checkout-city").value.trim(),
//           address: modal.querySelector("#checkout-address").value.trim(),
//           postalCode: modal.querySelector("#checkout-zip").value.trim(),
//           shippingCost: Number(rule.cost),
//           cart
//         });
//         window.location.assign(data.url);
//       } catch (error) {
//         alert(error.message || "Unable to continue to Stripe.");
//         setButtonLoading(continueBtn, false);
//       }
//     });
//   }

//   // Keep guest country list available even before the first checkout click if the modal is opened by other code.
//   loadLocationData().catch(error => console.error("Unable to load country/state data:", error));
// }

// document.addEventListener("DOMContentLoaded", initCheckoutModal);


/* =========================================================
   BLEGAB CHECKOUT
   - All countries available to guest checkout.
   - All states/cities are supplied by country-state-city.
   - Shipping rules come only from shipping-calculator.js.
   - Backend/API endpoints are unchanged.
   ========================================================= */

const CHECKOUT_API_URL = "https://api.blegab.com/api";
const LOCATION_MODULE_URLS = [
  "https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/+esm",
  "https://esm.sh/country-state-city@3.2.1"
];
const WHATSAPP_NUMBER = "14696180809";

// The backend's /orders/checkout endpoint reads a flat "items" array
// (productId + quantity), not a "cart" object. This converts the cart
// response from window.BLEGAB_CART.getCart() into that shape.
function cartToCheckoutItems(cart) {
  const items = cart?.cart?.items || [];
  return items
    .filter(item => item?.product?._id)
    .map(item => ({
      productId: item.product._id,
      quantity: Number(item.quantity) || 1
    }));
}

async function createCheckoutSession(checkoutData) {
  const response = await fetch(`${CHECKOUT_API_URL}/orders/checkout`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(checkoutData)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to create Stripe checkout.");
  if (!data.url) throw new Error("Stripe checkout URL was not returned by the server.");
  return data;
}

function setButtonLoading(button, loading) {
  if (window.BLEGAB_BUTTONS && typeof window.BLEGAB_BUTTONS.setLoading === "function") {
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

function normalizeLocationValue(value, countries, finder) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  return countries.find(c => String(c.isoCode).toLowerCase() === lower)
    || countries.find(c => String(c.name).toLowerCase() === lower)
    || (finder ? finder(raw) : null);
}

function initCheckoutModal() {
  const overlay = document.querySelector('[data-checkout-modal-overlay]');
  const modal = document.querySelector('[data-checkout-modal]');
  const checkoutBtn = document.querySelector('[data-checkout]');
  if (!overlay || !modal || !checkoutBtn) return;

  const continueBtn = modal.querySelector('[data-checkout-continue]');
  const accountCheckoutBtn = modal.querySelector('[data-checkout-option="account"]');
  const guestCheckoutBtn = modal.querySelector('[data-checkout-option="guest"]');
  const signupCheckoutBtn = modal.querySelector('[data-checkout-option="signup"]');
  const closeBtns = modal.querySelectorAll('[data-checkout-modal-close]');
  const stepIndicators = modal.querySelectorAll('[data-checkout-step-indicator]');
  const stepPanels = modal.querySelectorAll('[data-checkout-step-panel]');
  const checkoutUserNameEl = modal.querySelector('[data-checkout-user-name]');
  const accountCountryPanel = modal.querySelector('[data-account-country-panel]');
  const accountCountryEl = modal.querySelector('#checkout-account-country');
  const accountContactAdminBtn = modal.querySelector('[data-account-contact-admin]');
  const guestCountryEl = modal.querySelector('#checkout-country');
  const guestStateEl = modal.querySelector('#checkout-state');
  const guestStateListEl = modal.querySelector('[data-state-combobox-list]');
  const guestCityEl = modal.querySelector('#checkout-city');
  const guestCityListEl = modal.querySelector('[data-city-combobox-list]');
  const contactAdminBtn = modal.querySelector('[data-contact-admin-shipping]');
  const shippingRowEl = modal.querySelector('[data-checkout-shipping-row]');
  const shippingCostEl = modal.querySelector('[data-checkout-summary-shipping]');
  const totalEl = modal.querySelector('[data-checkout-summary-total]');
  const subtotalEl = modal.querySelector('[data-checkout-summary-subtotal]');
  const countEl = modal.querySelector('[data-checkout-summary-count]');
  const ctaTotalEl = modal.querySelector('[data-checkout-cta-total]');

  let currentStep = 1;
  let currentCheckoutUser = null;
  let locationData = null;
  let subtotal = 0;
  let currentShipping = null;
  let accountCountryCode = "";
  let guestStateOptions = [];
  let guestCityOptions = [];

  function shippingApi() {
    return window.BLEGAB_SHIPPING || null;
  }

  function shippingRule(countryCode) {
    const api = shippingApi();
    // Use calculateShipping (not getShippingRule) so the $500+
    // free-shipping promotion for US/Canada is applied here too,
    // matching services/shippingService.js on the backend.
    return api ? api.calculateShipping(subtotal, countryCode) : {
      supported: false,
      contactAdmin: true,
      cost: null
    };
  }

  function contactWhatsApp(countryName) {
    const message = countryName
      ? `Hello Blegab, I need the shipping fee for ${countryName}.`
      : "Hello Blegab, I need information about the shipping fee for my country.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
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
    const country = locationData?.countries?.find(c => c.isoCode === String(code || "").toUpperCase());
    return country ? country.name : String(code || "");
  }

  function normalizeCountry(value) {
    const country = normalizeLocationValue(value, locationData?.countries || []);
    return country ? country.isoCode : "";
  }

  function normalizeState(countryCode, value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw || !countryCode || !locationData || !locationData.State) return "";
    const states = locationData.State.getStatesOfCountry(countryCode) || [];
    const state = states.find(s => String(s.isoCode).toLowerCase() === raw)
      || states.find(s => String(s.name).toLowerCase() === raw);
    return state ? state.isoCode : "";
  }

  async function loadLocationData() {
    if (locationData) return locationData;

    // iOS Safari has intermittently failed to expose named exports (e.g.
    // module.Country) from jsdelivr's "+esm" bundle for this package, even
    // though the dynamic import() itself resolves without throwing. Try a
    // couple of CDN sources and validate the shape before using it, instead
    // of trusting the first response blindly.
    let lastError = null;
    for (const url of LOCATION_MODULE_URLS) {
      try {
        const module = await import(url);
        const CountryApi = module && module.Country;
        const StateApi = module && module.State;
        const CityApi = module && module.City;
        if (!CountryApi || typeof CountryApi.getAllCountries !== "function") {
          throw new Error("Country/state data module loaded but did not expose the expected API.");
        }
        const countries = CountryApi.getAllCountries() || [];
        locationData = {
          Country: CountryApi,
          State: StateApi,
          City: CityApi,
          countries
        };
        populateCountrySelect(guestCountryEl);
        populateCountrySelect(accountCountryEl);
        return locationData;
      } catch (error) {
        lastError = error;
        console.error("Unable to load country/state data from", url, error);
      }
    }

    // Every CDN source failed (this is the case that was silently breaking
    // the Country dropdown - see assets/js/country-fallback-data.js).
    // Degrade gracefully using a bundled, offline country list so checkout
    // still works with no network dependency. State/City have no offline
    // data source, so they fall back to free-text entry (handled by
    // renderStateOptions/renderCityOptions when State/City are null).
    console.error("All country/state data sources failed, using offline country fallback:", lastError);
    const fallbackCountries = Array.isArray(window.BLEGAB_COUNTRY_FALLBACK)
      ? window.BLEGAB_COUNTRY_FALLBACK
      : [];
    locationData = { Country: null, State: null, City: null, countries: fallbackCountries };
    populateCountrySelect(guestCountryEl);
    populateCountrySelect(accountCountryEl);
    if (guestCountryEl && window.BlegabCustomSelect) window.BlegabCustomSelect.refresh(guestCountryEl);
    if (accountCountryEl && window.BlegabCustomSelect) window.BlegabCustomSelect.refresh(accountCountryEl);
    return locationData;
  }

  function populateCountrySelect(select) {
    if (!select || !locationData) return;
    select.innerHTML = '<option value="">Select your country</option>' +
      locationData.countries.map(c => `<option value="${c.isoCode}">${c.name}</option>`).join("");
  }

  function getStates(countryCode) {
    if (!countryCode || !locationData || !locationData.State) return [];
    return locationData.State.getStatesOfCountry(countryCode) || [];
  }

  function getCities(countryCode, stateCode) {
    if (!countryCode || !stateCode || !locationData || !locationData.City) return [];
    return locationData.City.getCitiesOfState(countryCode, stateCode) || [];
  }

  function renderStateOptions(countryCode) {
    guestStateOptions = getStates(countryCode);
    if (!guestStateEl) return;

    guestStateEl.value = "";
    guestStateEl.disabled = false;
    guestStateEl.placeholder =
  guestStateOptions.length
    ? "Search or enter your state"
    : "Enter your state";
    if (guestStateListEl) guestStateListEl.hidden = true;
  }

  function renderCityOptions(countryCode, stateCode) {
    guestCityOptions = getCities(countryCode, stateCode);
    if (!guestCityEl) return;

    guestCityEl.value = "";
    guestCityEl.disabled = !stateCode;
    guestCityEl.placeholder = stateCode
      ? (guestCityOptions.length ? "Search for your city" : "Enter your city")
      : "Select state first";
    if (guestCityListEl) guestCityListEl.hidden = true;
  }

  function renderComboboxList(input, list, options, key) {
    if (!list || !input) return;
    const query = input.value.trim().toLowerCase();
    const filtered = query
      ? options.filter(item => item.name.toLowerCase().includes(query))
      : options;

    if (!filtered.length) {
      list.innerHTML = '<li class="checkout-combobox__empty">No matching results</li>';
    } else {
      list.innerHTML = filtered.slice(0, 100).map(item =>
        `<li class="checkout-combobox__option" data-${key}-value="${item.isoCode || item.name}">${item.name}</li>`
      ).join("");
    }
    list.hidden = false;
  }

  if (guestStateEl) {
    guestStateEl.addEventListener("input", function () {
      renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
      updateGuestContinueState();
    });
    guestStateEl.addEventListener("focus", function () {
      renderComboboxList(guestStateEl, guestStateListEl, guestStateOptions, "state");
    });
  }

  if (guestStateListEl) {
    guestStateListEl.addEventListener("mousedown", e => e.preventDefault());
    guestStateListEl.addEventListener("click", function (e) {
      const option = e.target.closest("[data-state-value]");
      if (!option) return;
      const stateCode = option.getAttribute("data-state-value");
      const state = guestStateOptions.find(s => s.isoCode === stateCode);
      if (!state) return;
      guestStateEl.value = state.name;
      guestStateListEl.hidden = true;
      renderCityOptions(guestCountryEl.value, state.isoCode);
      updateGuestContinueState();
    });
  }

  if (guestCityEl) {
    guestCityEl.addEventListener("input", function () {
      if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
      updateGuestContinueState();
    });
    guestCityEl.addEventListener("focus", function () {
      if (guestCityOptions.length) renderComboboxList(guestCityEl, guestCityListEl, guestCityOptions, "city");
    });
  }

  if (guestCityListEl) {
    guestCityListEl.addEventListener("mousedown", e => e.preventDefault());
    guestCityListEl.addEventListener("click", function (e) {
      const option = e.target.closest("[data-city-value]");
      if (!option) return;
      guestCityEl.value = option.getAttribute("data-city-value");
      guestCityListEl.hidden = true;
      updateGuestContinueState();
    });
  }

  if (guestCountryEl) {
    guestCountryEl.addEventListener("change", function () {
      renderStateOptions(guestCountryEl.value);
      renderCityOptions(guestCountryEl.value, "");
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
      "checkout-zip"
    ];
    return ids.every(id => {
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

  if (shippingCostEl) {
    shippingCostEl.classList.remove("free");
  }

  if (contactAdminBtn) {
    contactAdminBtn.hidden = true;
  }

  // Hide the account-country contact message by default.
  if (accountContactAdminBtn) {
    accountContactAdminBtn.hidden = true;
  }

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

  // Country has no registered shipping fee.
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

    // Existing contact button in the order summary.
    if (contactAdminBtn) {
      contactAdminBtn.hidden = false;
      contactAdminBtn.href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
        )}`;
    }

    // NEW:
    // Show the clickable message directly underneath
    // the country selector for logged-in/account checkout.
    if (isAccount && accountContactAdminBtn) {
      accountContactAdminBtn.hidden = false;
      accountContactAdminBtn.href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hello Blegab, I need the shipping fee for ${getCountryName(countryCode)}.`
        )}`;
    }

    return rule;
  }

  // Country has a registered shipping fee.
  const shipping = Number(rule.cost || 0);
  const total = subtotal + shipping;

  if (shippingCostEl) {
    shippingCostEl.textContent = rule.freeShippingApplied
      ? "Free"
      : `$${shipping.toFixed(2)}`;
    shippingCostEl.classList.toggle("free", !!rule.freeShippingApplied);
  }

  if (totalEl) {
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  if (ctaTotalEl) {
    ctaTotalEl.textContent = `$${total.toFixed(2)}`;
  }

  return rule;
}

function updateAccountButtonState() {
  if (!accountCheckoutBtn) return;

  const supported = !!accountCountryCode && !!currentShipping?.supported;
  const needsCountry = !accountCountryCode;

  // Keep the country selector visible at all times.
  // The user may want to change/reselect their country.
  if (accountCountryPanel) {
    accountCountryPanel.hidden = false;
  }

  // The "Continue as username" button is only enabled
  // when a valid/supported country has been selected.
  accountCheckoutBtn.disabled = !supported;
  accountCheckoutBtn.classList.toggle("is-disabled", !supported);

  if (needsCountry) {
    accountCheckoutBtn.setAttribute("aria-disabled", "true");
  } else {
    accountCheckoutBtn.removeAttribute("aria-disabled");
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
      "checkout-zip": user?.address?.postalCode || ""
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
    if (!response || !response.success || !response.cart) throw new Error(response?.message || "Failed to load cart");

    itemsEl.innerHTML = "";
    (response.cart.items || []).forEach(item => {
      const product = item.product;
      if (!product) return;
      const image = product.images?.[0]
        ? (String(product.images[0]).startsWith("http") ? product.images[0] : `/assets/images/products/${product.images[0]}`)
        : "/assets/images/placeholder.png";
      itemsEl.insertAdjacentHTML("beforeend", `
        <div class="checkout-summary__item">
          <img src="${image}" alt="${product.name || "Product"}">
          <div class="checkout-summary__item-info">
            <span class="name">${product.name || "Product"}</span>
            <span class="meta">×${item.quantity}</span>
          </div>
          <span class="checkout-summary__item-price">$${Number(item.lineTotal || 0).toFixed(2)}</span>
        </div>`);
    });

    subtotal = Number(response.subtotal || 0);
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (countEl) countEl.textContent = response.totalItems || 0;

    updateShipping(currentCheckoutUser ? accountCountryCode : guestCountryEl?.value || "", !!currentCheckoutUser);
  }

  function goToStep(step) {
    currentStep = step;
    modal.classList.toggle("checkout-modal--step-2", step === 2);
    stepPanels.forEach(panel => {
      panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
    });
    stepIndicators.forEach(indicator => {
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
      const api = shippingApi();
      const [cart] = await Promise.all([
        window.BLEGAB_CART.getCart(),
        api ? api.loadShippingRates() : Promise.resolve()
      ]);
      if (!cart?.cart?.items?.length) {
        alert("Your cart is empty.");
        return;
      }

      await loadLocationData();
      await renderOrderSummary();

      let user = null;
      try {
        const response = await fetch(`${CHECKOUT_API_URL}/auth/me`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          user = data.user || null;
        }
      } catch (error) {
        console.error("Unable to check logged-in customer:", error);
      }

      currentCheckoutUser = user;

      if (user) {
        const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Account";
        if (checkoutUserNameEl) checkoutUserNameEl.textContent = displayName;
        if (accountCheckoutBtn) accountCheckoutBtn.hidden = false;
        if (guestCheckoutBtn) guestCheckoutBtn.hidden = true;
        if (signupCheckoutBtn) signupCheckoutBtn.hidden = true;
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

  closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
  overlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  if (guestCheckoutBtn) {
    guestCheckoutBtn.addEventListener("click", async function () {
      currentCheckoutUser = null;
      const guestSection = modal.querySelector("[data-guest-only]");
      if (guestSection) guestSection.hidden = false;
      ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-phone", "checkout-country", "checkout-address", "checkout-city", "checkout-state", "checkout-zip"].forEach(id => {
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

  if (signupCheckoutBtn) signupCheckoutBtn.addEventListener("click", () => { window.location.href = "signup.html"; });

  if (accountCheckoutBtn) {
    accountCheckoutBtn.addEventListener("click", async function () {
      if (!currentCheckoutUser || accountCheckoutBtn.disabled) return;

      const rule = shippingRule(accountCountryCode);
      if (!rule.supported) return;

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
          shippingCost: Number(rule.cost),
          items: cartToCheckoutItems(cart)
        });
        window.location.assign(data.url);
      } catch (error) {
        alert(error.message || "Unable to continue to Stripe.");
        setButtonLoading(accountCheckoutBtn, false);
      }
    });
  }

  ["checkout-first-name", "checkout-last-name", "checkout-email", "checkout-address", "checkout-city", "checkout-state", "checkout-zip", "checkout-phone"].forEach(id => {
    const input = modal.querySelector(`#${id}`);
    if (!input) return;
    input.addEventListener("input", updateGuestContinueState);
    input.addEventListener("change", updateGuestContinueState);
  });

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
          shippingCost: Number(rule.cost),
          items: cartToCheckoutItems(cart)
        });
        window.location.assign(data.url);
      } catch (error) {
        alert(error.message || "Unable to continue to Stripe.");
        setButtonLoading(continueBtn, false);
      }
    });
  }

  // Keep guest country list available even before the first checkout click if the modal is opened by other code.
  loadLocationData().catch(error => console.error("Unable to load country/state data:", error));
}

document.addEventListener("DOMContentLoaded", initCheckoutModal);