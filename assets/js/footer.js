/* =========================================================
   FOOTER (self-contained, no fetch, no server required)

   TO ADD THE FOOTER TO A NEW PAGE:
     1. Put <div data-site-footer></div> right before </body>
     2. Right after it, add: <script src="assets/js/footer.js"></script>
     3. Load assets/css/footer.css in that page's <head>

   TO EDIT THE FOOTER: change the HTML string below, ONE place,
   and it updates on every page that includes this file.
   ========================================================= */

(function () {
  var mount = document.querySelector('[data-site-footer]');
  if (!mount) return;

  mount.outerHTML = `  <footer class="site-footer">
    <div class="container footer-main">

      <div class="footer-brand">
        <a href="index.html" class="footer-brand__logo" aria-label="Blegab Luxury Wigs — Home">
          <img src="assets/images/logo.png" alt="Blegab Luxury Wigs" class="footer-brand__logo-image" />
        </a>
        <p class="footer-brand__text">
          Luxury human hair wigs crafted for women who value beauty, confidence, and excellence.
        </p>
        <div class="footer-brand__socials">

        <a href="https://wa.me/14696180809" target="_blank" rel="noopener noreferrer" class="footer-brand__social-link" aria-label="WhatsApp">
            <svg class="footer-brand__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3z" stroke-linejoin="round"/>
              <path d="M8.5 8.5c-.3 1 .1 2.3 1.3 3.7 1.4 1.5 2.7 2 3.7 1.7.5-.1.8-.6.9-1.1l.1-.4c.1-.3-.1-.6-.4-.7l-1.2-.5c-.3-.1-.6 0-.8.3l-.2.3c-.6-.2-1.3-.7-1.8-1.3-.5-.6-.8-1.2-1-1.8l.3-.2c.3-.2.4-.5.3-.8l-.5-1.2c-.1-.3-.4-.5-.7-.4z" fill="currentColor" stroke="none"/>
            </svg>
        </a>


          <a href="https://www.instagram.com/blegabluxurywigs" target="_blank" rel="noopener noreferrer" class="footer-brand__social-link" aria-label="Instagram">
            <svg class="footer-brand__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="https://www.tiktok.com/@blegabluxurywigs?_r=1&_t=ZT-977pvnDZJ9y" target="_blank" rel="noopener noreferrer" class="footer-brand__social-link" aria-label="TikTok">
            <svg class="footer-brand__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M14 4v10.5a3.5 3.5 0 1 1-3-3.46" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 4c.5 2.5 2.2 4 4.5 4.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <a href="https://www.facebook.com/share/17mMm9UsND/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" class="footer-brand__social-link" aria-label="Facebook">
            <svg class="footer-brand__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M14 21v-7h2.5l.5-3H14V9c0-.9.3-1.5 1.7-1.5H17V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9V11H8.5v3H11v7z" stroke-linejoin="round"/>
            </svg>
          </a>

        </div>
      </div>

      <div class="footer-links">

        <div class="footer-col">
          <h3 class="footer-col__title">Shop</h3>
          <ul class="footer-col__list">
            <li><a href="shop.html" class="footer-col__link">All Wigs</a></li>
            <li><a href="shop.html?category=lace" class="footer-col__link">Lace Wigs</a></li>
            <li><a href="shop.html"?category=bonestraight class="footer-col__link">Bone Straight</a></li>
            <li><a href="shop.html?category=curly" class="footer-col__link">Curly Wigs</a></li>
            <li><a href="shop.html?category=bob" class="footer-col__link">Bob Wigs</a></li>
            <li><a href="shop.html?category=custom" class="footer-col__link">Custom Wigs</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3 class="footer-col__title">Help</h3>
          <ul class="footer-col__list">
            <li><a href="about-us.html" class="footer-col__link">About Us</a></li>
            <li><a href="contact-us.html#faq-section" class="footer-col__link">FAQs</a></li>
            <li><a href="contact-us.html" class="footer-col__link">Contact Us</a></li>
            <li><a href="privacy.html" class="footer-col__link">Privacy Policy</a></li>
            <li><a href="terms.html" class="footer-col__link">Terms of Service</a></li>
            <li><a href="#" data-open-cookie-settings class="footer-col__link">Cookie Settings</a></li>
          </ul>
        </div>

        <div class="footer-col footer-col--contact">
          <h3 class="footer-col__title">Contact</h3>
          <ul class="footer-col__list">
            <li class="footer-col__contact-item">Email: info@blegab.com</li>
            <li class="footer-col__contact-item">Phone: +1 469-618-0809</li>
            <li class="footer-col__contact-item">Dallas, Texas, USA</li>
          </ul>
        </div>

      </div>
    </div>

    <div class="container footer-bottom">
      <p class="footer-bottom__copyright">&copy; 2026 Blegab Luxury Wigs. All Rights Reserved.</p>
    </div>
  </footer>

  <button type="button" class="footer-back-to-top" data-back-to-top aria-label="Back to top">
    <svg class="footer-back-to-top__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 19V5M6 11l6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>`;

  initBackToTop();
})();

/* -----------------------------
   Back-to-top button — shows after scrolling down, scrolls up on click
   ----------------------------- */
function initBackToTop() {
  var btn = document.querySelector('[data-back-to-top]');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}