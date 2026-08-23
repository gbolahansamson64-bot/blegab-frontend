/* ===== Help & Guide — Search ===== */
/* Builds a search index straight from the existing guide markup           */
/* (no hardcoded content), then lets the admin jump to any matching        */
/* section/subheading by typing, using suggestions, or pressing Enter.     */

(function () {
  'use strict';

  var INDEX = [];
  var searchWrap, input, clearBtn, panel;
  var currentResults = [];
  var activeIndex = -1;
  var highlightTimer = null;
  var inputDebounceTimer = null;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initBackToTop();

    searchWrap = document.getElementById('guideSearch');
    input = document.getElementById('guideSearchInput');
    clearBtn = document.getElementById('guideSearchClear');
    panel = document.getElementById('guideSearchPanel');

    if (!searchWrap || !input || !panel) return; // search markup not present

    INDEX = buildIndex();

    input.addEventListener('input', function (e) {
      var val = e.target.value;
      toggleClearButton(val);
      clearTimeout(inputDebounceTimer);
      inputDebounceTimer = setTimeout(function () {
        handleTyping(val);
      }, 120);
    });

    input.addEventListener('keydown', handleKeydown);
    input.addEventListener('focus', function () {
      if (input.value.trim() && currentResults.length) showPanel();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        toggleClearButton('');
        hidePanel();
        input.focus();
      });
    }

    panel.addEventListener('click', function (e) {
      var item = e.target.closest('.guide-search__item');
      if (!item) return;
      var idx = Number(item.getAttribute('data-index'));
      if (currentResults[idx]) goToBlock(currentResults[idx].block);
    });

    document.addEventListener('click', function (e) {
      if (!searchWrap.contains(e.target)) hidePanel();
    });
  }

  /* ---------------------------- Back to top ------------------------------ */

  function initBackToTop() {
    var btn = document.getElementById('guideBackToTop');
    if (!btn) return;

    var SHOW_AFTER = 400; // px scrolled before the button appears
    var ticking = false;

    function updateVisibility() {
      var scrolled = window.pageYOffset || document.documentElement.scrollTop;
      btn.classList.toggle('is-visible', scrolled > SHOW_AFTER);
      ticking = false;
    }

    btn.hidden = false; // let CSS opacity/transform control visibility
    updateVisibility();

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Build search index from existing DOM ---------------- */

  function buildIndex() {
    var blocks = [];
    var sections = document.querySelectorAll('.guide-content .guide-section');

    sections.forEach(function (section) {
      var titleEl = section.querySelector('.guide-section__title');
      var bodyEl = section.querySelector('.guide-section__body');
      if (!titleEl || !bodyEl) return;

      var rawTitle = titleEl.textContent.trim();
      var cleanTitle = rawTitle.replace(/^\d+\.\s*/, '');
      var sectionText = bodyEl.textContent;

      // Coarse block: whole section, keyed by its title
      var coarseHeadingNorm = normalize(cleanTitle);
      var coarseContentNorm = normalize(rawTitle + ' ' + sectionText);
      blocks.push({
        heading: cleanTitle,
        headingNorm: coarseHeadingNorm,
        headingWords: tokenize(coarseHeadingNorm),
        contentNorm: coarseContentNorm,
        contentWords: tokenize(coarseContentNorm),
        target: section,
        context: null
      });

      // Fine-grained blocks: each subheading + the content under it
      var headings = bodyEl.querySelectorAll('h2, h3, h4');
      headings.forEach(function (hEl) {
        var headingText = hEl.textContent.trim();
        var contentParts = [];
        var node = hEl.nextElementSibling;
        while (node && !/^H[234]$/.test(node.tagName) && node.tagName !== 'HR') {
          contentParts.push(node.textContent);
          node = node.nextElementSibling;
        }
        var fineHeadingNorm = normalize(headingText);
        var fineContentNorm = normalize(headingText + ' ' + contentParts.join(' '));
        blocks.push({
          heading: headingText,
          headingNorm: fineHeadingNorm,
          headingWords: tokenize(fineHeadingNorm),
          contentNorm: fineContentNorm,
          contentWords: tokenize(fineContentNorm),
          target: hEl,
          context: cleanTitle
        });
      });
    });

    return blocks;
  }

  /* ---------------------------- Text helpers ----------------------------- */

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function wordVariants(word) {
    var variants = [word];
    if (word.length > 3) {
      if (word.charAt(word.length - 1) === 's') variants.push(word.slice(0, -1));
      else variants.push(word + 's');
    }
    return variants;
  }

  function hasWordBoundaryMatch(text, word) {
    var variants = wordVariants(word);
    for (var i = 0; i < variants.length; i++) {
      var re = new RegExp('\\b' + escapeRegExp(variants[i]) + '\\b');
      if (re.test(text)) return true;
    }
    return false;
  }

  // Lightweight stem match so "edit" matches "editing", "delete" matches
  // "deleting"/"deleted", "product" matches "products", etc. Only kicks in
  // for words of 4+ letters, comparing the shared leading stem.
  function tokenize(text) {
    return text.split(' ').filter(Boolean);
  }

  function hasStemMatch(textWords, queryWord) {
    for (var i = 0; i < textWords.length; i++) {
      var token = textWords[i];
      if (token === queryWord) return true;
      if (queryWord.length >= 4) {
        var stemLen = Math.min(queryWord.length, 5);
        if (token.length >= stemLen && token.slice(0, stemLen) === queryWord.slice(0, stemLen)) {
          return true;
        }
      }
    }
    return false;
  }

  /* ------------------------------ Scoring -------------------------------- */

  function scoreBlock(block, query, queryWords) {
    var h = block.headingNorm;
    var c = block.contentNorm;
    var score = 0;

    if (h === query) {
      score += 100;
    } else if (hasWordBoundaryMatch(h, query)) {
      score += 80;
    } else if (h.indexOf(query) !== -1) {
      score += 65;
    } else {
      var matched = 0;
      queryWords.forEach(function (w) {
        if (hasStemMatch(block.headingWords, w)) matched++;
      });
      if (matched === queryWords.length && queryWords.length > 1) {
        score += 55;
      } else {
        score += matched * 18;
      }
    }

    if (score > 0) {
      // Slightly favor shorter, more specific headings
      score += Math.max(0, 20 - h.length / 4);

      // Prefer headings containing the exact searched word(s) over ones
      // that only match via stemming (e.g. "products" over "product")
      queryWords.forEach(function (w) {
        if (block.headingWords.indexOf(w) !== -1) score += 3;
      });
    }

    if (c.indexOf(query) !== -1) score += 12;
    var contentMatched = 0;
    queryWords.forEach(function (w) {
      if (hasStemMatch(block.contentWords, w)) contentMatched++;
    });
    score += contentMatched * 4;

    return score;
  }

  function searchBlocks(rawQuery) {
    var query = normalize(rawQuery);
    if (!query) return [];
    var queryWords = query.split(' ').filter(Boolean);

    var results = INDEX.map(function (block) {
      return { block: block, score: scoreBlock(block, query, queryWords) };
    }).filter(function (r) {
      return r.score > 0;
    }).sort(function (a, b) {
      return b.score - a.score;
    });

    return results;
  }

  /* ------------------------------ Rendering ------------------------------ */

  function handleTyping(rawValue) {
    if (!rawValue.trim()) {
      currentResults = [];
      hidePanel();
      return;
    }
    currentResults = dedupeResults(searchBlocks(rawValue));
    activeIndex = -1;
    renderPanel(rawValue);
  }

  function dedupeResults(results) {
    var seen = {};
    var out = [];
    results.forEach(function (r) {
      var key = r.block.heading.toLowerCase() + '|' + (r.block.context || '');
      if (seen[key]) return;
      seen[key] = true;
      out.push(r);
    });
    return out;
  }

  function renderPanel(rawQuery) {
    var top = currentResults.slice(0, 6);

    if (!top.length) {
      panel.innerHTML = '<div class="guide-search__empty">No matching section found.</div>';
      showPanel();
      return;
    }

    var queryWords = normalize(rawQuery).split(' ').filter(Boolean);
    var html = top.map(function (r, idx) {
      var titleHtml = highlightMatch(r.block.heading, queryWords);
      var contextHtml = r.block.context
        ? '<span class="guide-search__item-context">' + escapeHtml(r.block.context) + '</span>'
        : '';
      return (
        '<button type="button" class="guide-search__item" role="option" data-index="' + idx + '">' +
          '<span class="guide-search__item-title">' + titleHtml + '</span>' +
          contextHtml +
        '</button>'
      );
    }).join('');

    panel.innerHTML = html;
    showPanel();
  }

  function highlightMatch(text, queryWords) {
    var escaped = escapeHtml(text);
    if (!queryWords.length) return escaped;

    var variants = [];
    queryWords.forEach(function (w) {
      wordVariants(w).forEach(function (v) {
        if (v) variants.push(v);
      });
    });
    if (!variants.length) return escaped;

    var pattern = variants
      .sort(function (a, b) { return b.length - a.length; })
      .map(escapeRegExp)
      .join('|');

    var re = new RegExp('(' + pattern + ')', 'ig');
    return escaped.replace(re, '<mark>$1</mark>');
  }

  function updateActiveItem() {
    var items = panel.querySelectorAll('.guide-search__item');
    items.forEach(function (item, idx) {
      var isActive = idx === activeIndex;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) item.scrollIntoView({ block: 'nearest' });
    });
  }

  function showPanel() {
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function hidePanel() {
    panel.hidden = true;
    panel.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  }

  function toggleClearButton(value) {
    if (!clearBtn) return;
    clearBtn.hidden = value.length === 0;
  }

  /* ------------------------------ Navigation ------------------------------ */

  function goToBlock(block) {
    hidePanel();
    input.value = block.heading;
    toggleClearButton(block.heading);

    var target = block.target;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    target.classList.remove('guide-search-highlight');
    // Force reflow so the animation restarts if the same section is re-searched
    void target.offsetWidth;
    target.classList.add('guide-search-highlight');

    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(function () {
      target.classList.remove('guide-search-highlight');
    }, 2500);
  }

  /* ------------------------------- Keyboard -------------------------------- */

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && currentResults[activeIndex]) {
        goToBlock(currentResults[activeIndex].block);
        return;
      }
      var value = input.value;
      if (!value.trim()) return;
      var results = dedupeResults(searchBlocks(value));
      if (results.length) {
        goToBlock(results[0].block);
      } else {
        currentResults = [];
        renderPanel(value);
      }
    } else if (e.key === 'ArrowDown') {
      if (!currentResults.length || panel.hidden) return;
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, Math.min(currentResults.length, 6) - 1);
      updateActiveItem();
    } else if (e.key === 'ArrowUp') {
      if (!currentResults.length || panel.hidden) return;
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActiveItem();
    } else if (e.key === 'Escape') {
      hidePanel();
    }
  }

})();