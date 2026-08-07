document.addEventListener("DOMContentLoaded", () => {
  initFaqAccordion();
  initContactForm();
  initBackToTop();
});

function initFaqAccordion() {
  const toggles = document.querySelectorAll("[data-faq-toggle]");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const item = toggle.closest(".faq-item");
      const isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("is-open"));
      if (!isOpen) item.classList.add("is-open");
    });
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const errorEl = form.querySelector("[data-contact-error]");
  const successEl = form.querySelector("[data-contact-success]");
  const submitBtn = form.querySelector("[data-contact-submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorEl.classList.remove("is-visible");
    successEl.classList.remove("is-visible");

    submitBtn.disabled = true;

    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        successEl.textContent = "Message sent successfully! We'll get back to you soon.";
        successEl.classList.add("is-visible");
        form.reset();
      } else {
        errorEl.textContent = result.message || "Failed to send message.";
        errorEl.classList.add("is-visible");
      }

    } catch (error) {
      errorEl.textContent = "Something went wrong. Please try again.";
      errorEl.classList.add("is-visible");
    }

    submitBtn.disabled = false;
  });
}

function initBackToTop() {
  const btn = document.querySelector("[data-back-to-top]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


