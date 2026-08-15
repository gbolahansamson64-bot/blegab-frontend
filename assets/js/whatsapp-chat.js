/* =========================================================
   WHATSAPP LIVE CHAT WIDGET (self-contained, no fetch, no storage)

   TO ADD TO ANOTHER PAGE LATER:
     1. Load assets/css/whatsapp-chat.css in that page's <head>
     2. Put <div data-whatsapp-widget></div> right before </body>
     3. Right after it, add:
        <script src="assets/js/whatsapp-chat.js"></script>

   TO EDIT: change the number/name/greeting/avatar constants below.
   Nothing is ever saved — every time the box is opened it shows
   only the fresh greeting, never past messages.
   ========================================================= */

(function () {
  var WHATSAPP_NUMBER = '14696180809'; // digits only, no + no spaces
  var WHATSAPP_NAME = 'Blegab Luxury Wigs';
  var WHATSAPP_GREETING = 'Welcome to Blegab. Need help finding your perfect wig? we are here to assist';
  var WHATSAPP_AVATAR = 'assets/images/whatsappchatimg.webp'; // used if the photo above is missing

  var mount = document.querySelector('[data-whatsapp-widget]');
  if (!mount) return;

  mount.outerHTML =
    '<button type="button" class="whatsapp-widget__button" data-whatsapp-toggle aria-label="Chat with us on WhatsApp" aria-expanded="false">' +
      '<svg class="whatsapp-widget__button-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5.1-1.3c1.5.8 3.2 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.1c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3C4.2 15 3.8 13.5 3.8 12c0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.7 8.1-8.2 8.1zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.4.5.2 1 .3 1.3.4.5.2 1 .1 1.4.1.4-.1 1.5-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z"/>' +
      '</svg>' +
      '<svg class="whatsapp-widget__button-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>' +
      '</svg>' +
    '</button>' +
    '<div class="whatsapp-widget__box" data-whatsapp-box role="dialog" aria-label="Chat with ' + WHATSAPP_NAME + '">' +
      '<div class="whatsapp-widget__header">' +
        '<img src="' + WHATSAPP_AVATAR + '" alt="' + WHATSAPP_NAME + '" class="whatsapp-widget__avatar" data-whatsapp-avatar />' +
        '<div class="whatsapp-widget__header-text">' +
          '<p class="whatsapp-widget__name">' + WHATSAPP_NAME + '</p>' +
          '<p class="whatsapp-widget__status">Typically replies within an hour</p>' +
        '</div>' +
        '<button type="button" class="whatsapp-widget__close" data-whatsapp-close aria-label="Close chat">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
            '<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="whatsapp-widget__body">' +
        '<div class="whatsapp-widget__bubble" data-whatsapp-greeting>' +
          WHATSAPP_GREETING +
          '<span class="whatsapp-widget__time" data-whatsapp-time></span>' +
        '</div>' +
      '</div>' +
      '<form class="whatsapp-widget__form" data-whatsapp-form>' +
        '<input type="text" class="whatsapp-widget__input" data-whatsapp-input placeholder="Type a message..." autocomplete="off" />' +
        '<button type="submit" class="whatsapp-widget__send" aria-label="Send on WhatsApp">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
            '<path d="M3 20l18-8L3 4v6l12 2-12 2z"/>' +
          '</svg>' +
        '</button>' +
      '</form>' +
    '</div>';

  var toggleBtn = document.querySelector('[data-whatsapp-toggle]');
  var box = document.querySelector('[data-whatsapp-box]');
  var closeBtn = document.querySelector('[data-whatsapp-close]');
  var form = document.querySelector('[data-whatsapp-form]');
  var input = document.querySelector('[data-whatsapp-input]');
  var avatar = document.querySelector('[data-whatsapp-avatar]');
  var timeEl = document.querySelector('[data-whatsapp-time]');

  if (avatar) {
    avatar.addEventListener('error', function () {
      avatar.src = WHATSAPP_AVATAR_FALLBACK;
    });
  }

  function stampTime() {
    if (!timeEl) return;
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    timeEl.textContent = hours + ':' + minutes + ' ' + suffix;
  }

  function openChat() {
    box.classList.add('is-open');
    toggleBtn.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    stampTime();
    if (input) {
      input.value = '';
      setTimeout(function () { input.focus(); }, 150);
    }
  }

  function closeChat() {
    box.classList.remove('is-open');
    toggleBtn.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', function () {
    var isOpen = box.classList.contains('is-open');
    isOpen ? closeChat() : openChat();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  // Click outside the box (and outside the toggle button) closes it
  document.addEventListener('click', function (event) {
    if (!box.classList.contains('is-open')) return;
    if (box.contains(event.target) || toggleBtn.contains(event.target)) return;
    closeChat();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeChat();
  });

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var message = input ? input.value.trim() : '';
      if (message === '') {
        if (input) input.focus();
        return;
      }
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
      window.open(url, '_blank', 'noopener,noreferrer');
      if (input) input.value = ''; // nothing kept around after handing off
      closeChat();
    });
  }
})();