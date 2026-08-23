/* =========================================================
   BLEGAB LUXURY WIGS — ADMIN SETTINGS
   Connected to the real backend API.

   Handles:
   - Business Profile
   - Shipping Rules
   - Add Shipping Country
   - Edit Shipping Rule
   - Delete Shipping Rule
   - Enable / Disable Shipping Country
   - Admin Security Settings
   - Save All Settings

   Backend:
   http://localhost:5000/api/admin
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector("[data-settings-form]");

    if (!form) {
        return;
    }

    /* =========================================================
       API
       ========================================================= */

    const API_BASE = "https://api.blegab.com/api/admin";

    const SETTINGS_URL = `${API_BASE}/settings`;
    const SHIPPING_URL = `${API_BASE}/shipping`;
    const ADMIN_ME_URL = `${API_BASE}/me`;

    /* =========================================================
       SVG ICONS
       ========================================================= */

    const ICON_EDIT =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M12 20h9" stroke-linecap="round"/>' +
        '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>';

    const ICON_CHECK =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M4 12l5 5 11-11" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>';

    const ICON_TRASH =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M3 6h18" stroke-linecap="round"/>' +
        '<path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>';

    const ICON_CLOSE =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>' +
        '</svg>';

    /* =========================================================
       HELPERS
       ========================================================= */

    async function apiRequest(url, options = {}) {

        const config = {
            credentials: "include",
            ...options,
            headers: {
                ...(options.headers || {})
            }
        };

        if (
            config.body &&
            typeof config.body !== "string"
        ) {
            config.headers["Content-Type"] = "application/json";
            config.body = JSON.stringify(config.body);
        }

        let response;

        try {

            response = await fetch(url, config);

        } catch (error) {

            console.error("ADMIN SETTINGS API ERROR:", error);

            throw new Error(
                "Unable to connect to the backend. Make sure the API server is running on https://api.blegab.com."
            );

        }

        let data = {};

        try {

            data = await response.json();

        } catch (error) {

            data = {};

        }

        if (!response.ok) {

            if (response.status === 401) {

                throw new Error(
                    data.message ||
                    "Your admin session has expired. Please sign in again."
                );

            }

            throw new Error(
                data.message ||
                "The server could not complete this request."
            );

        }

        return data;

    }


    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatFee(amount) {

        const numericAmount = Number(amount);

        return "$" +
            (
                Number.isFinite(numericAmount)
                    ? numericAmount
                    : 0
            ).toFixed(2);

    }


    function slugify(text) {

        return String(text || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

    }


    function flashSaved(button) {

        if (!button) {
            return;
        }

        const label = button.querySelector("[data-btn-label]");

        if (!label) {
            return;
        }

        const originalText = label.textContent;

        label.textContent = "Saved!";

        button.disabled = true;

        setTimeout(function () {

            label.textContent = originalText;

            button.disabled = false;

        }, 1400);

    }


    function showMessage(message, type = "success") {

        let messageEl =
            document.querySelector("[data-settings-message]");

        if (!messageEl) {

            messageEl = document.createElement("div");

            messageEl.setAttribute(
                "data-settings-message",
                ""
            );

            messageEl.style.marginBottom = "20px";
            messageEl.style.padding = "12px 16px";
            messageEl.style.borderRadius = "8px";
            messageEl.style.fontSize = "14px";

            const pageHead =
                document.querySelector(".admin-page-head");

            if (pageHead) {

                pageHead.insertAdjacentElement(
                    "afterend",
                    messageEl
                );

            } else {

                form.prepend(messageEl);

            }

        }

        messageEl.textContent = message;

        if (type === "error") {

            messageEl.style.background = "#3a1717";
            messageEl.style.border = "1px solid #8b3030";
            messageEl.style.color = "#ffb4b4";

        } else {

            messageEl.style.background = "#182d20";
            messageEl.style.border = "1px solid #315f42";
            messageEl.style.color = "#9ee2b4";

        }

        clearTimeout(messageEl._hideTimer);

        messageEl._hideTimer = setTimeout(function () {

            messageEl.remove();

        }, 3500);

    }


    /* =========================================================
       SESSION / ADMIN AUTH CHECK
       ========================================================= */

    async function verifyAdminSession() {

        try {

            const data =
                await apiRequest(ADMIN_ME_URL);

            if (!data.success || !data.admin) {

                throw new Error(
                    "Admin session could not be verified."
                );

            }

            return data.admin;

        } catch (error) {

            console.error(
                "ADMIN SESSION CHECK:",
                error
            );

            if (
                error.message &&
                error.message.toLowerCase().includes("session")
            ) {

                showMessage(
                    error.message,
                    "error"
                );

            }

            return null;

        }

    }


    /* =========================================================
       CUSTOM DROPDOWN
       ========================================================= */

    function closeAllDropdowns(except) {

        document
            .querySelectorAll(
                ".settings-dropdown__menu.is-open"
            )
            .forEach(function (menu) {

                if (menu === except) {
                    return;
                }

                menu.classList.remove("is-open");

                const toggle =
                    menu.previousElementSibling;

                if (toggle) {

                    toggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            });

    }


    function selectDropdownItem(root, item) {

        if (!root || !item) {
            return;
        }

        const menu =
            root.querySelector(
                ".settings-dropdown__menu"
            );

        const toggle =
            root.querySelector(
                ".settings-dropdown__toggle"
            );

        const label =
            root.querySelector(
                "[data-dropdown-label]"
            );

        const hidden =
            root.querySelector(
                "[data-dropdown-value]"
            );

        if (!menu) {
            return;
        }

        menu
            .querySelectorAll(
                ".settings-dropdown__item"
            )
            .forEach(function (element) {

                element.classList.remove(
                    "is-active"
                );

            });

        item.classList.add("is-active");

        if (label) {

            label.textContent =
                item.textContent.trim();

        }

        if (hidden) {

            hidden.value =
                item.dataset.value || "";

            hidden.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )
            );

        }

        menu.classList.remove("is-open");

        if (toggle) {

            toggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }


    function initDropdown(root) {

        const toggle =
            root.querySelector(
                ".settings-dropdown__toggle"
            );

        const menu =
            root.querySelector(
                ".settings-dropdown__menu"
            );

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const isOpen =
                    menu.classList.contains(
                        "is-open"
                    );

                closeAllDropdowns();

                if (!isOpen) {

                    menu.classList.add(
                        "is-open"
                    );

                    toggle.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            }
        );

        menu.addEventListener(
            "click",
            function (event) {

                const item =
                    event.target.closest(
                        ".settings-dropdown__item"
                    );

                if (item) {

                    selectDropdownItem(
                        root,
                        item
                    );

                }

            }
        );

    }


    form
        .querySelectorAll(".settings-dropdown")
        .forEach(initDropdown);


    document.addEventListener(
        "click",
        function () {

            closeAllDropdowns();

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeAllDropdowns();

            }

        }
    );


    /* =========================================================
       BUSINESS PROFILE
       ========================================================= */

    const profileFields =
        form.querySelectorAll(
            ".settings-card--profile [data-field]"
        );

    const saveProfileBtn =
        form.querySelector(
            "[data-save-profile]"
        );


    function getProfilePayload() {

        const payload = {};

        profileFields.forEach(
            function (field) {

                payload[field.dataset.field] =
                    field.value.trim();

            }
        );

        return payload;

    }


    function applyProfile(settings) {

        if (!settings) {
            return;
        }

        profileFields.forEach(
            function (field) {

                const key =
                    field.dataset.field;

                if (
                    settings[key] !== undefined &&
                    settings[key] !== null
                ) {

                    field.value =
                        settings[key];

                }

            }
        );

    }


    async function loadProfile() {

        try {

            const data =
                await apiRequest(
                    SETTINGS_URL
                );

            if (data.settings) {

                applyProfile(
                    data.settings
                );

            }

            return data;

        } catch (error) {

            console.error(
                "LOAD STORE SETTINGS:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            return null;

        }

    }


    async function saveProfile() {

        const payload =
            getProfilePayload();

        if (!payload.storeName) {

            showMessage(
                "Store name is required.",
                "error"
            );

            return;

        }

        if (!payload.supportEmail) {

            showMessage(
                "Support email is required.",
                "error"
            );

            return;

        }

        if (!payload.storeAddress) {

            showMessage(
                "Store address is required.",
                "error"
            );

            return;

        }

        if (saveProfileBtn) {

            saveProfileBtn.disabled = true;

        }

        try {

            await apiRequest(
                SETTINGS_URL,
                {
                    method: "PUT",
                    body: {
                        storeName:
                            payload.storeName,

                        supportEmail:
                            payload.supportEmail,

                        storeAddress:
                            payload.storeAddress
                    }
                }
            );

            flashSaved(
                saveProfileBtn
            );

            showMessage(
                "Business profile saved successfully."
            );

        } catch (error) {

            console.error(
                "SAVE BUSINESS PROFILE:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            if (saveProfileBtn) {

                saveProfileBtn.disabled = false;

            }

        }

    }


    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            saveProfile
        );

    }


    /* =========================================================
       SECURITY
       ========================================================= */

    const adminEmailInput =
        form.querySelector(
            '[data-field="adminEmail"]'
        );

    const sessionTimeoutInput =
        form.querySelector(
            '[data-dropdown-value][data-field="sessionTimeout"]'
        );

    const saveSecurityBtn =
        form.querySelector(
            "[data-save-security]"
        );


    function applySecurity(settings, admin) {

        if (adminEmailInput && admin) {

            adminEmailInput.value =
                admin.email || "";

        }

        if (
            sessionTimeoutInput &&
            settings &&
            settings.sessionTimeoutMinutes !== undefined &&
            settings.sessionTimeoutMinutes !== null
        ) {

            const root =
                sessionTimeoutInput.closest(
                    ".settings-dropdown"
                );

            if (root) {

                const timeoutValue =
    settings.sessionTimeoutMinutes === null
        ? "never"
        : String(settings.sessionTimeoutMinutes);

const item =
    root.querySelector(
        `.settings-dropdown__item[data-value="${CSS.escape(timeoutValue)}"]`
    );

                if (item) {

                    selectDropdownItem(
                        root,
                        item
                    );

                }

            }

        }

    }


    async function loadSecurity() {

        try {

            const admin =
                await verifyAdminSession();

            const settingsData =
                await apiRequest(
                    SETTINGS_URL
                );

            applySecurity(
                settingsData.settings,
                admin
            );

        } catch (error) {

            console.error(
                "LOAD SECURITY SETTINGS:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

        }

    }


    async function saveSecurity() {

        if (!sessionTimeoutInput) {
            return;
        }

        const sessionTimeout =
            sessionTimeoutInput.value;

        const adminEmail =
            adminEmailInput
                ? adminEmailInput.value.trim()
                : "";


        if (!adminEmail) {

            showMessage(
                "Admin email is required.",
                "error"
            );

            return;

        }


        if (!sessionTimeout) {

            showMessage(
                "Please select a session timeout.",
                "error"
            );

            return;

        }


        if (saveSecurityBtn) {

            saveSecurityBtn.disabled = true;

        }


       try {

    // Update admin email through the admin email endpoint
    await apiRequest(
        `${API_BASE}/email`,
        {
            method: "PATCH",
            body: {
                email: adminEmail
            }
        }
    );

    // Convert the dropdown value into the number
    // expected by SettingsController.js
    const sessionTimeoutMinutes =
    sessionTimeout === "never"
        ? null
        : Number(sessionTimeout);

if (
    sessionTimeoutMinutes !== null &&
    (
        !Number.isFinite(sessionTimeoutMinutes) ||
        sessionTimeoutMinutes < 1
    )
) {
    throw new Error(
        "Session timeout must be a valid number of minutes."
    );
}

    // Update session timeout through store settings
    await apiRequest(
        SETTINGS_URL,
        {
            method: "PUT",
            body: {
                sessionTimeoutMinutes
            }
        }
    );

    flashSaved(
        saveSecurityBtn
    );

    showMessage(
        "Security settings saved successfully."
    );

        } catch (error) {

            console.error(
                "SAVE SECURITY SETTINGS:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            if (saveSecurityBtn) {

                saveSecurityBtn.disabled = false;

            }

        }

    }


    if (saveSecurityBtn) {

        saveSecurityBtn.addEventListener(
            "click",
            saveSecurity
        );

    }


    /* =========================================================
       SHIPPING RULES
       ========================================================= */

    const tbody =
        form.querySelector(
            "[data-shipping-tbody]"
        );

    const addCountryBtn =
        form.querySelector(
            "[data-add-country-rule]"
        );


    function renderShippingRows(rules) {

        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";

        if (
            !Array.isArray(rules) ||
            rules.length === 0
        ) {

            const emptyRow =
                document.createElement("tr");

            emptyRow.innerHTML = `
                <td colspan="5" style="text-align:center;">
                    No shipping rules have been configured.
                </td>
            `;

            tbody.appendChild(
                emptyRow
            );

            return;

        }


        rules.forEach(
            function (rule) {

                appendShippingRow(
                    rule
                );

            }
        );

    }


    function appendShippingRow(rule) {

        const row =
            document.createElement("tr");

        row.setAttribute(
            "data-country-row",
            ""
        );

        row.dataset.id =
            rule._id || "";

        const active =
            rule.available !== false;

        row.innerHTML = `
            <td data-cell="country">
                ${escapeHtml(rule.country)}
            </td>

            <td data-cell="code">
                ${escapeHtml(rule.countryCode)}
            </td>

            <td
                data-cell="fee"
                data-fee="${Number(rule.fee) || 0}"
            >
                ${formatFee(rule.fee)}
            </td>

            <td data-cell="status">

                <button
                    type="button"
                    class="status-badge ${active ? "is-active" : ""}"
                    data-status-badge
                    aria-pressed="${active ? "true" : "false"}"
                >

                    <span class="status-dot"></span>

                    <span data-status-label>
                        ${active ? "Active" : "Inactive"}
                    </span>

                </button>

            </td>

            <td class="shipping-table__actions">

                <button
                    type="button"
                    class="icon-btn"
                    data-edit-row
                    aria-label="Edit country"
                >
                    ${ICON_EDIT}
                </button>

                <button
                    type="button"
                    class="icon-btn icon-btn--danger"
                    data-delete-row
                    aria-label="Delete country"
                >
                    ${ICON_TRASH}
                </button>

            </td>
        `;

        tbody.appendChild(row);

        wireShippingRow(
            row
        );

    }


    async function loadShippingRules() {

        try {

            const data =
                await apiRequest(
                    SHIPPING_URL
                );

            renderShippingRows(
                data.rules || []
            );

        } catch (error) {

            console.error(
                "LOAD SHIPPING RULES:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

        }

    }


    function wireShippingRow(row) {

        const editBtn =
            row.querySelector(
                "[data-edit-row]"
            );

        const deleteBtn =
            row.querySelector(
                "[data-delete-row]"
            );

        const statusBadge =
            row.querySelector(
                "[data-status-badge]"
            );


        if (editBtn) {

            editBtn.addEventListener(
                "click",
                function () {

                    enterEditMode(
                        row
                    );

                }
            );

        }


        if (deleteBtn) {

            deleteBtn.addEventListener(
                "click",
                async function () {

                    await deleteShippingRule(
                        row
                    );

                }
            );

        }


        if (statusBadge) {

            statusBadge.addEventListener(
                "click",
                async function () {

                    await toggleShippingStatus(
                        row
                    );

                }
            );

        }

    }


    function enterEditMode(row) {

        if (
            row.classList.contains(
                "is-editing"
            )
        ) {

            return;

        }

        row.classList.add(
            "is-editing"
        );


        const countryCell =
            row.querySelector(
                '[data-cell="country"]'
            );

        const codeCell =
            row.querySelector(
                '[data-cell="code"]'
            );

        const feeCell =
            row.querySelector(
                '[data-cell="fee"]'
            );


        const currentCountry =
            countryCell.textContent.trim();

        const currentCode =
            codeCell.textContent.trim();

        const currentFee =
            feeCell.dataset.fee || "0";


        countryCell.innerHTML = `
            <input
                type="text"
                class="shipping-table__cell-input"
                data-edit-country
                value="${escapeHtml(currentCountry)}"
            />
        `;


        codeCell.innerHTML = `
            <input
                type="text"
                class="shipping-table__cell-input"
                data-edit-code
                maxlength="2"
                value="${escapeHtml(currentCode)}"
            />
        `;


        feeCell.innerHTML = `
            <input
                type="number"
                class="shipping-table__cell-input"
                data-edit-fee
                min="0"
                step="0.01"
                value="${escapeHtml(currentFee)}"
            />
        `;


        const codeInput =
            row.querySelector(
                "[data-edit-code]"
            );

        if (codeInput) {

            codeInput.addEventListener(
                "input",
                function () {

                    codeInput.value =
                        codeInput.value
                            .replace(
                                /[^a-zA-Z]/g,
                                ""
                            )
                            .toUpperCase()
                            .slice(0, 2);

                }
            );

        }


        buildEditActions(
            row
        );

    }


    function buildEditActions(row) {

        const actionCell =
            row.querySelector(
                ".shipping-table__actions"
            );

        if (!actionCell) {
            return;
        }

        actionCell.innerHTML = "";


        const saveBtn =
            document.createElement("button");

        saveBtn.type = "button";

        saveBtn.className =
            "icon-btn icon-btn--confirm";

        saveBtn.setAttribute(
            "aria-label",
            "Save country"
        );

        saveBtn.innerHTML =
            ICON_CHECK;


        const cancelBtn =
            document.createElement("button");

        cancelBtn.type = "button";

        cancelBtn.className =
            "icon-btn icon-btn--danger";

        cancelBtn.setAttribute(
            "aria-label",
            "Cancel"
        );

        cancelBtn.innerHTML =
            ICON_CLOSE;


        saveBtn.addEventListener(
            "click",
            async function () {

                await saveEditedShippingRule(
                    row,
                    saveBtn
                );

            }
        );


        cancelBtn.addEventListener(
            "click",
            function () {

                loadShippingRules();

            }
        );


        actionCell.appendChild(
            saveBtn
        );

        actionCell.appendChild(
            cancelBtn
        );

    }


    async function saveEditedShippingRule(
        row,
        button
    ) {

        const ruleId =
            row.dataset.id;

        const countryInput =
            row.querySelector(
                "[data-edit-country]"
            );

        const codeInput =
            row.querySelector(
                "[data-edit-code]"
            );

        const feeInput =
            row.querySelector(
                "[data-edit-fee]"
            );


        if (
            !ruleId ||
            !countryInput ||
            !codeInput ||
            !feeInput
        ) {

            return;

        }


        const country =
            countryInput.value.trim();

        const countryCode =
            codeInput.value
                .trim()
                .toUpperCase();

        const fee =
            Number(
                feeInput.value
            );


        if (!country) {

            showMessage(
                "Country name is required.",
                "error"
            );

            countryInput.focus();

            return;

        }


        if (
            !/^[A-Z]{2}$/.test(
                countryCode
            )
        ) {

            showMessage(
                "Country code must contain exactly 2 letters.",
                "error"
            );

            codeInput.focus();

            return;

        }


        if (
            !Number.isFinite(fee) ||
            fee < 0
        ) {

            showMessage(
                "Shipping fee must be zero or greater.",
                "error"
            );

            feeInput.focus();

            return;

        }


        button.disabled = true;


        try {

           

            await apiRequest(
                `${SHIPPING_URL}/${encodeURIComponent(ruleId)}`,
                {
                    method: "PUT",

                    body: {
                        country,
                        countryCode,
                        fee
                    }
                }
            );


            await loadShippingRules();

            showMessage(
                `${country} shipping fee updated successfully.`
            );

        } catch (error) {

            console.error(
                "UPDATE SHIPPING RULE:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            button.disabled = false;

        }

    }


    async function toggleShippingStatus(row) {

        const ruleId =
            row.dataset.id;

        const statusBadge =
            row.querySelector(
                "[data-status-badge]"
            );

        if (!ruleId || !statusBadge) {
            return;
        }


        const currentlyActive =
            statusBadge.classList.contains(
                "is-active"
            );

        const newStatus =
            !currentlyActive;


        statusBadge.disabled =
            true;


        try {

            await apiRequest(
                `${SHIPPING_URL}/${encodeURIComponent(ruleId)}`,
                {
                    method: "PUT",

                    body: {
                        available:
                            newStatus
                    }
                }
            );


            statusBadge.classList.toggle(
                "is-active",
                newStatus
            );

            statusBadge.setAttribute(
                "aria-pressed",
                String(newStatus)
            );


            const label =
                statusBadge.querySelector(
                    "[data-status-label]"
                );

            if (label) {

                label.textContent =
                    newStatus
                        ? "Active"
                        : "Inactive";

            }


            showMessage(
                newStatus
                    ? "Shipping country enabled."
                    : "Shipping country disabled."
            );

        } catch (error) {

            console.error(
                "TOGGLE SHIPPING RULE:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

        } finally {

            statusBadge.disabled =
                false;

        }

    }


    async function deleteShippingRule(row) {

        const ruleId =
            row.dataset.id;

        const country =
            row
                .querySelector(
                    '[data-cell="country"]'
                )
                ?.textContent
                .trim();


        if (!ruleId) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete the shipping rule for ${country || "this country"}?`
            );


        if (!confirmed) {
            return;
        }


        const deleteBtn =
            row.querySelector(
                "[data-delete-row]"
            );

        if (deleteBtn) {

            deleteBtn.disabled =
                true;

        }


        try {

            await apiRequest(
                `${SHIPPING_URL}/${encodeURIComponent(ruleId)}`,
                {
                    method: "DELETE"
                }
            );


            row.remove();

            showMessage(
                `${country || "Shipping rule"} deleted successfully.`
            );


            if (
                !tbody.querySelector(
                    "tr[data-country-row]"
                )
            ) {

                await loadShippingRules();

            }

        } catch (error) {

            console.error(
                "DELETE SHIPPING RULE:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            if (deleteBtn) {

                deleteBtn.disabled =
                    false;

            }

        }

    }


    /* =========================================================
       ADD COUNTRY MODAL
       ========================================================= */

    const addCountryModal =
        document.querySelector(
            "[data-add-country-modal]"
        );

    const modalCountryInput =
        addCountryModal?.querySelector(
            '[data-modal-field="country"]'
        );

    const modalCodeInput =
        addCountryModal?.querySelector(
            '[data-modal-field="code"]'
        );

    const modalFeeInput =
        addCountryModal?.querySelector(
            '[data-modal-field="fee"]'
        );

    const modalActiveInput =
        addCountryModal?.querySelector(
            '[data-modal-field="active"]'
        );

    const modalStatusLabel =
        addCountryModal?.querySelector(
            "[data-status-toggle-label]"
        );

    const modalError =
        addCountryModal?.querySelector(
            "[data-modal-error]"
        );

    const modalSubmitBtn =
        addCountryModal?.querySelector(
            "[data-modal-submit]"
        );


    function openAddCountryModal() {

        if (!addCountryModal) {
            return;
        }

        addCountryModal.hidden =
            false;

        document.body.style.overflow =
            "hidden";


        if (modalCountryInput) {
            modalCountryInput.value =
                "";
        }

        if (modalCodeInput) {
            modalCodeInput.value =
                "";
        }

        if (modalFeeInput) {
            modalFeeInput.value =
                "";
        }

        if (modalActiveInput) {
            modalActiveInput.checked =
                true;
        }

        if (modalStatusLabel) {

            modalStatusLabel.textContent =
                "Active";

        }

        if (modalError) {

            modalError.hidden =
                true;

        }


        setTimeout(
            function () {

                if (modalCountryInput) {

                    modalCountryInput.focus();

                }

            },
            30
        );

    }


    function closeAddCountryModal() {

        if (!addCountryModal) {
            return;
        }

        addCountryModal.hidden =
            true;

        document.body.style.overflow =
            "";

    }


    if (addCountryBtn) {

        addCountryBtn.addEventListener(
            "click",
            openAddCountryModal
        );

    }


    if (addCountryModal) {

        addCountryModal
            .querySelectorAll(
                "[data-modal-close]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        closeAddCountryModal
                    );

                }
            );


        addCountryModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    addCountryModal
                ) {

                    closeAddCountryModal();

                }

            }
        );


        if (modalCodeInput) {

            modalCodeInput.addEventListener(
                "input",
                function () {

                    modalCodeInput.value =
                        modalCodeInput.value
                            .replace(
                                /[^a-zA-Z]/g,
                                ""
                            )
                            .toUpperCase()
                            .slice(0, 2);

                }
            );

        }


        if (modalActiveInput) {

            modalActiveInput.addEventListener(
                "change",
                function () {

                    if (modalStatusLabel) {

                        modalStatusLabel.textContent =
                            modalActiveInput.checked
                                ? "Active"
                                : "Inactive";

                    }

                }
            );

        }


        if (modalSubmitBtn) {

            modalSubmitBtn.addEventListener(
                "click",
                async function () {

                    await createShippingRule();

                }
            );

        }

    }


    async function createShippingRule() {

        const country =
            modalCountryInput
                ? modalCountryInput.value.trim()
                : "";

        const countryCode =
            modalCodeInput
                ? modalCodeInput.value
                    .trim()
                    .toUpperCase()
                : "";

        const fee =
            modalFeeInput
                ? Number(
                    modalFeeInput.value
                )
                : 0;

        const available =
            modalActiveInput
                ? modalActiveInput.checked
                : true;


        if (!country || !countryCode) {

            if (modalError) {

                modalError.hidden =
                    false;

                modalError.textContent =
                    "Please enter a country name and 2-letter country code.";

            }

            if (!country) {

                modalCountryInput?.focus();

            } else {

                modalCodeInput?.focus();

            }

            return;

        }


        if (
            !/^[A-Z]{2}$/.test(
                countryCode
            )
        ) {

            if (modalError) {

                modalError.hidden =
                    false;

                modalError.textContent =
                    "Country code must contain exactly 2 letters.";

            }

            modalCodeInput?.focus();

            return;

        }


        if (
            !Number.isFinite(fee) ||
            fee < 0
        ) {

            if (modalError) {

                modalError.hidden =
                    false;

                modalError.textContent =
                    "Shipping fee must be zero or greater.";

            }

            modalFeeInput?.focus();

            return;

        }


        if (modalSubmitBtn) {

            modalSubmitBtn.disabled =
                true;

        }


        try {

            await apiRequest(
                SHIPPING_URL,
                {
                    method: "POST",

                    body: {
                        country,
                        countryCode,
                        fee,
                        available
                    }
                }
            );


            closeAddCountryModal();

            await loadShippingRules();

            showMessage(
                `${country} shipping rule added successfully.`
            );

        } catch (error) {

            console.error(
                "CREATE SHIPPING RULE:",
                error
            );

            if (modalError) {

                modalError.hidden =
                    false;

                modalError.textContent =
                    error.message;

            }

        } finally {

            if (modalSubmitBtn) {

                modalSubmitBtn.disabled =
                    false;

            }

        }

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                addCountryModal &&
                !addCountryModal.hidden
            ) {

                closeAddCountryModal();

            }

        }
    );


    /* =========================================================
       SAVE ALL SETTINGS
       ========================================================= */

    const saveAllBtn =
        form.querySelector(
            'button[type="submit"]'
        );


    async function saveAllSettings(event) {

        event.preventDefault();

        if (saveAllBtn) {

            saveAllBtn.disabled =
                true;

        }


        try {

            const profilePayload =
                getProfilePayload();

            const sessionTimeout =
    sessionTimeoutInput
        ? sessionTimeoutInput.value
        : "";

const sessionTimeoutMinutes =
    sessionTimeout === "never"
        ? null
        : Number(sessionTimeout);

            const adminEmail =
                adminEmailInput
                    ? adminEmailInput.value.trim()
                    : "";

                    if (
    sessionTimeoutMinutes !== null &&
    (
        !Number.isFinite(sessionTimeoutMinutes) ||
        sessionTimeoutMinutes < 1
    )
) {
    throw new Error(
        "Session timeout must be a valid number of minutes."
    );
}


            if (!profilePayload.storeName) {

                throw new Error(
                    "Store name is required."
                );

            }


            if (!profilePayload.supportEmail) {

                throw new Error(
                    "Support email is required."
                );

            }


            if (!profilePayload.storeAddress) {

                throw new Error(
                    "Store address is required."
                );

            }


            if (!adminEmail) {

                throw new Error(
                    "Admin email is required."
                );

            }


            if (!sessionTimeout) {

                throw new Error(
                    "Session timeout is required."
                );

            }


            /*
             * One request updates the store settings.
             *
             * The backend settings controller will validate
             * which fields are allowed.
             */

            await apiRequest(
                SETTINGS_URL,
                {
                    method: "PUT",

                    body: {
                        storeName:
                            profilePayload.storeName,

                        supportEmail:
                            profilePayload.supportEmail,

                        storeAddress:
                            profilePayload.storeAddress,

                        adminEmail,

                        sessionTimeoutMinutes
                    }
                }
            );


            flashSaved(
                saveAllBtn
            );


            showMessage(
                "All settings saved successfully."
            );


        } catch (error) {

            console.error(
                "SAVE ALL SETTINGS:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            if (saveAllBtn) {

                saveAllBtn.disabled =
                    false;

            }

        }

    }


    form.addEventListener(
        "submit",
        saveAllSettings
    );


    /* =========================================================
       INITIAL LOAD
       ========================================================= */

    async function initializeSettingsPage() {

        /*
         * These requests run independently.
         * If shipping works but settings API has not yet
         * been created, shipping will still load.
         */

        await Promise.allSettled([
            loadShippingRules(),
            loadProfile(),
            loadSecurity()
        ]);

    }


    initializeSettingsPage();

});