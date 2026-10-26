/* The language menu in the top bar of the home pages, /app and /talent (2026-10-25), and the explicit language choice.
   Markup (static in each page, so the links work without this file):
     <div class="np-lang"><button type="button" class="np-lang-btn" aria-expanded="false" aria-controls="np-lang-list"
       aria-label="Language">…<span>EN</span></button><ul class="np-lang-list" id="np-lang-list" hidden>…<a hreflang>…</ul></div>
   The button opens the list (aria-expanded); Escape or a click outside closes it, and Escape puts focus back on the
   button. Clicking any language link (this menu or a footer list) stores the visitor's choice: localStorage
   np_lang_choice (en, fr, es, he, hi, zh; it stops the home page's automatic language), and np_lang_pref, which /app and
   /talent use to keep the language (removed for English). On /app and /talent the page sets the button's label to the
   language in use (window.__npLang). Storage blocked: the links still work, nothing is remembered. */
(function () {
  'use strict';
  var NAMES = { en: 'EN', fr: 'FR', es: 'ES', he: 'HE', hi: 'HI', zh: 'ZH' };
  var WORD = { en: 'Language', fr: 'Langue', es: 'Idioma', he: 'שפה', hi: 'भाषा', zh: '语言' };
  function code(a) { var h = String(a.getAttribute('hreflang') || '').toLowerCase().split('-')[0]; return NAMES[h] ? h : null; }
  function choose(c) {
    try {
      localStorage.setItem('np_lang_choice', c);
      if (c === 'en') localStorage.removeItem('np_lang_pref'); else localStorage.setItem('np_lang_pref', c);
    } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.np-lang a[hreflang], .langs a[hreflang], .m-langs a[hreflang]');
    if (a && code(a)) choose(code(a));
  }, true);

  function wire(box) {
    var btn = box.querySelector('.np-lang-btn'), list = box.querySelector('.np-lang-list');
    if (!btn || !list || box.dataset.wired) return;
    box.dataset.wired = '1';
    // /app and /talent (data-dynamic): one static markup, labelled here with the language the page is in
    if (box.hasAttribute('data-dynamic')) {
      var cur = window.__npLang || 'en';
      var lab = btn.querySelector('span'); if (lab) lab.textContent = NAMES[cur];
      btn.setAttribute('aria-label', WORD[cur]);
      list.querySelectorAll('a[hreflang]').forEach(function (a) {
        if (code(a) === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    function open(v) {
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      list.hidden = !v;
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(list.hidden); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !list.hidden) { e.stopPropagation(); open(false); btn.focus(); }
    });
    document.addEventListener('click', function (e) { if (!list.hidden && !box.contains(e.target)) open(false); });
    box.addEventListener('focusout', function (e) { if (!list.hidden && e.relatedTarget && !box.contains(e.relatedTarget)) open(false); });
  }
  function init() { document.querySelectorAll('.np-lang').forEach(wire); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
