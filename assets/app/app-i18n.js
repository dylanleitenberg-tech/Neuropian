/* Neuropian members app (/app) and Talent (/talent) in French, Spanish, Hebrew, Hindi and Chinese (2026-10-25).
   The sign-up / log-in pop-up, the terms step and the set-password box are done by auth-i18n.js; this file does the rest:
   members home, profile builder, Projects, Opportunities, the profile modal, the nav and drawer, RoundTable's chrome,
   and the Talent page. The strings live in assets/app/i18n/<lang>.js (window.__npAppDict), loaded just before this file.
   Same idiom as auth-i18n.js: every visible English string is looked up by its exact English text (whitespace collapsed);
   a sentence with links or emphasis inside is one entry with bare inline tags (<a>..</a>), whose attributes go back on in
   order; a MutationObserver translates what the app writes later, so app.html / talent.html keep writing English.
   Wording choices as on the home pages (~/neuropian-tools/runs/i18n-2026-10-24/NOTES.md): fr = vous, es = tú,
   he = plural, hi = आप, zh = 你; Neuropian, RoundTable, Talent, Falcon, EagleEyes, GitHub stay in Latin script.
   Never translated: what people write (messages, project titles and details, server, channel and role names, bios,
   profile text), member names, the Terms and Privacy text. Those spots are listed in SKIP below; an exact table match
   is the only way anything changes, so a stray user string that happens to equal a UI label is the worst case.
   Strings with no entry stay English and are listed in window.__npAppMiss (for testing). Bump ?v= in app.html and
   talent.html when this file or a table changes (Safari caches hard). */
(function () {
  'use strict';
  var L = window.__npLang, D = window.__npAppDict;
  var de = document.documentElement;
  function reveal() { de.classList.remove('np-i18n-wait'); }
  if (!L || !D || D.lang !== L) { reveal(); return; }
  var TALENT = /^\/talent(\.html)?\/?$/.test(location.pathname);
  var HL = { fr: 'fr', es: 'es', he: 'he', hi: 'hi', zh: 'zh-Hans' }[L], RTL = L === 'he';
  var HOME = '/' + L + '/';
  var NB = '\u00a0';

  /* English text the app builds with a value inside (a name, a number, a date, a server message). The replacement for
     each name is in the language table (rx); $1.. are the captured values, left exactly as written. */
  var P = {
    invited: /^(.+) invited you to Neuropian\.$/,
    online: /^(\d+) online$/,
    membersN: /^Members - (\d+)$/,
    rolesN: /^(\d+) roles?$/,
    subOf: /^Sub-server of: (.+)$/,
    dmTo: /^Message (.+)…$/,
    friendSent: /^Friend request sent to (.+)!$/,
    leave: /^Leave "(.+)"\? You can rejoin with an invite link\.$/,
    uploadFailed: /^Upload failed: (.*)$/,
    postFailed: /^Failed to post: (.*)$/,
    ghConnected: /^GitHub connected: (.*)\. After you publish, your profile shows "GitHub verified" and marks the work that came from GitHub\.$/,
    ghFailed: /^GitHub could not be connected: (.*)$/,
    couldNotSave: /^Could not save: (.*)$/,
    errorN: /^Error (\d+)$/,
    copied: /^Copied: (\S+)$/,
    yourLink: /^Your invite link: (\S+)$/,
    inviteStats: /^(\d+) friends? joined through your link, (\d+) published\.$/,
    claim: /^Claim (\d+) welcome credits$/,
    publishToGet: /^Publish your profile to get (\d+) welcome credits\. <a>Your profile<\/a>$/,
    credits: /^([\d,]+) credits$/,
    postedBy: /^Posted by (.+?) · ([A-Z][a-z]{2} \d{1,2})(?: · (\d+) contributors?)?$/,
    you: /^You: (.+)$/,
    reviewer: /^Reviewer: ([\s\S]*)$/,
    sendFor: /^Send for review \((\d+) submitted\)$/,
    day: /^([A-Z][a-z]{2} \d{1,2})$/,
    notEnough: /^Not enough credits: you have (\d+)$/,
    noResultsFor: /^No results for "(.*)"\.$/,
    idIs: /^ID: (\S+)$/,
    closest: /^Closest first, for “([\s\S]*)”$/,
    newest: /^(\d+) newest profiles?$/,
    ghVerified: /^GitHub verified · (\S+)$/,
    fromGh: /^Verified from GitHub · (.+)$/,
    byMember: /^Added by member · (.+)$/,
    // Talent's "Hire or contact" block: $1 is the member's name, or the page's own stand-ins "this member" / "this" / "they"
    hireIntro: /^Tell Neuropian about the role\. We pass it on to (.+) and introduce you if they want to talk\. Their email is never shown\.$/,
    hireBtn: /^Hire or contact (.+)$/,
    hireSent: /^Sent\. Neuropian will pass it on and email you if (.+?) wants? to talk\.$/,   // "if Ana wants" / "if they want"
    talentTitle: /^(.+) · Neuropian Talent$/             // the browser tab on a profile ("Member" when the name is hidden)
  };
  var NESTED = { uploadFailed: 1, postFailed: 1, ghFailed: 1, couldNotSave: 1, you: 1 };

  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var PR = window.Intl && Intl.PluralRules ? new Intl.PluralRules(HL) : null;
  var H = {
    L: L,
    // "Oct 25" (the app's en-US short date) in this language's own short form
    date: function (s) {
      var m = /^([A-Z][a-z]{2}) (\d{1,2})$/.exec(s), i = m ? MON.indexOf(m[1]) : -1;
      if (i < 0) return s;
      try { return new Date(2001, i, +m[2]).toLocaleDateString(HL, { month: 'short', day: 'numeric' }).replace(/ /g, NB); }
      catch (e) { return s; }
    },
    // plural: H.n(3, 'ami', 'amis') -> '3 amis'; one = the language's "one" category
    n: function (n, one, other) { var c = PR ? PR.select(+n) : (+n === 1 ? 'one' : 'other'); return n + (L === 'zh' ? '' : NB) + (c === 'one' ? one : other); }
  };

  var T = {}, k;
  for (k in D.t) T[norm(k)] = D.t[k];
  if (D.months) ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    .forEach(function (m, i) { T[m] = D.months[i]; });
  // names and marks that are the same in every language (not misses)
  var KEEP = new Set(['Neuropian', 'NEUROPIAN', 'Neuropian.com', 'neuropian.com', 'RoundTable', 'ROUNDTABLE', 'Talent', 'GitHub', 'GitLab',
    'Figma', 'LinkedIn', 'Falcon', 'EagleEyes', 'Neuropian · Talent', 'neuro<em>pian</em>', 'NEURO<em>PIAN</em>', 'RT', 'N', 'IMG', 'NP'].concat(D.keep || []));
  var VALS = new Set();
  for (k in T) VALS.add(norm(T[k]));
  var miss = window.__npAppMiss = new Set();
  var LETTER = /\p{L}/u;
  var INLINE = { A: 1, EM: 1, B: 1, STRONG: 1, I: 1, SPAN: 1, CODE: 1, BR: 1, BDI: 1, SMALL: 1 };
  var ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
  var DECOR_A = /^[\s\p{S}#·•]+/u, DECOR_Z = /[\s\p{S}·•]+$/u;
  var FLIP = { '←': '→', '→': '←', '▸': '◂', '◂': '▸' };

  /* never translated: the pop-up boxes (auth-i18n.js), the legal pages, the retired survey, and what members write.
     SKIPTEXT: only the element's own text nodes are someone's words (e.g. a project title next to its status tag).
     NAMES: a member's name, but the app's own stand-in ("Member", "Anonymous", "Someone") is translated. */
  var SKIP = [
    'script', 'style', 'svg', '[translate="no"]', '[contenteditable]',
    '#auth-gate', '#terms-gate', '#set-password-modal', '#page-privacy', '#page-tos', '#page-survey',
    '#profile-name-display', '#profile-email-display', '#profile-neuropian-id', '#profile-avatar-initials',
    '#uc-bio', '#uc-accomplishment', '#uc-hidden-ability', '#uc-initials', '#pf-accomplishment', '#pf-hidden-ability',
    '#sidebar-server-name', '#chat-room-name', '#server-join-code-text', '#invite-link-text', '#chat-avatar',
    '#reply-bar-preview', '#attach-bar-name', '#report-msg-preview', '#ta-project', '#nav-avatar', '#nav-friend-count', '[id$="-nav-avatar"]',
    '[id^="msg-content-"]', '[id^="att-"]', '[id^="reactions-"]', '[onclick^="jumpToMessage"]',
    '#notif-container > div > div:nth-child(-n+2)',
    '.chat-room-item', '[onclick^="switchServer"]', '[onclick^="switchRoom"] > span[style*="ellipsis"]',
    '#members-panel-list span[style*="border-radius:20px"]', '#ss-roles-list span', '#ss-members-list span[style*="font-weight:500"]',
    '#ss-members-list span[style*="border-radius:20px"]', '#ss-members-list label span', '#ss-channels-list span[style*="flex:1"]',
    '#ss-channels-list label span', '#cs-roles-list label span', '#emoji-picker',
    '.pc-sum', '.pc-proof', '.jt', '.jd', '.jtag',
    '.c-head', '.chip', '.c-work', '.p-head', '.p-sum', '.w-title', '.w-detail', '.npac-e'
  ].join(',');
  var SKIPTEXT = '.pc-top > b, .jco';
  var NAMES = '[onclick^="openUserCard"], #chat-username, #nav-user-name, #mobile-nav-user, #uc-name, #reply-bar-name, ' +
              '.pc-row > b, #friend-requests-list span, #members-panel-list div[style*="nowrap"], .c-name, .p-name, #npac-n, a.login[data-auth]';
  var STANDIN = { Member: 1, Anonymous: 1, Someone: 1, 'Log in': 1, 'Loading…': 1 };
  /* a few labels read differently in one place (D.ctx: [selector, {English: translation}], checked first) */
  var CTX = D.ctx || [];

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function letters(s) { return LETTER.test(s); }
  function has(o, key) { return Object.prototype.hasOwnProperty.call(o, key); }
  function pattern(key) {
    for (var name in P) {
      var m = P[name].exec(key);
      if (!m || !has(D.rx || {}, name)) continue;
      if (NESTED[name] && m[1] != null) { var inner = look(m[1]); if (inner != null) m[1] = inner; }
      for (var g = 1; g < m.length; g++) if (STANDIN[m[g]] && has(T, m[g])) m[g] = T[m[g]];
      var r = D.rx[name], out = typeof r === 'function' ? r(m, H) : r.replace(/\$(\d)/g, function (_, d) { return m[d] == null ? '' : m[d]; });
      VALS.add(norm(out));
      return out;
    }
    return null;
  }
  function exact(key) { return has(T, key) ? T[key] : pattern(key); }
  function look(en) {
    var key = norm(en), tr = exact(key);
    if (tr != null) return tr;
    var a = (key.match(DECOR_A) || [''])[0], z = (key.match(DECOR_Z) || [''])[0];   // "● Online", "Applied ✓", "← Back"
    if ((a || z) && a.length + z.length < key.length) {
      tr = exact(key.slice(a.length, key.length - z.length));
      if (tr != null) {
        if (RTL) { a = a.replace(/[←→▸◂]/g, function (c) { return FLIP[c]; }); z = z.replace(/[←→▸◂]/g, function (c) { return FLIP[c]; }); }
        return a + tr + z;
      }
    }
    return null;
  }
  function known(key) {
    if (VALS.has(key) || KEEP.has(key)) return true;
    var a = (key.match(DECOR_A) || [''])[0], z = (key.match(DECOR_Z) || [''])[0], c = key.slice(a.length, key.length - z.length);
    return VALS.has(c) || KEEP.has(c);
  }
  // not misses: URLs, codes, handles, initials (TE), clock times (11:09 AM), "# channel", "Role - 2" (names)
  function quiet(key) { return (/^\S+$/.test(key) && /[.\/#@_\d:]/.test(key)) || /^[A-Z]{1,3}$/.test(key) || /^\d{1,2}:\d{2}( ?[AP]M)?$/.test(key) || /^# /.test(key) || / - \d+$/.test(key); }
  function note(key) { if (!known(key) && !quiet(key)) miss.add(key); }
  function keyOf(n) {
    if (n.nodeType === 3) return n.data;
    if (n.nodeType !== 1) return '';
    var t = n.tagName.toLowerCase();
    if (t === 'br') return '<br>';
    return '<' + t + '>' + Array.prototype.map.call(n.childNodes, keyOf).join('') + '</' + t + '>';
  }
  function skipText(parent) { return parent.nodeType === 1 && parent.matches(SKIPTEXT); }
  function nameOnly(parent) { return parent.nodeType === 1 && parent.closest(NAMES); }
  function text(n) {
    var s = n.data, key = norm(s), p = n.parentNode;
    if (!key || !letters(key) || !p || skipText(p)) return;
    if (nameOnly(p) && !STANDIN[key]) return;
    if (VALS.has(key)) return;                     // already in this language
    var tr = null;
    for (var c = 0; c < CTX.length && tr == null; c++) if (has(CTX[c][1], key) && p.closest(CTX[c][0])) { tr = CTX[c][1][key]; VALS.add(norm(tr)); }
    if (tr == null) tr = look(key);
    if (tr == null) { note(key); return; }
    var v = s.match(/^\s*/)[0] + tr + s.match(/\s*$/)[0];
    if (n.data !== v) n.data = v;
  }
  function attrs(el) {
    ATTRS.forEach(function (a) {
      var v = el.getAttribute(a);
      if (v == null) return;
      var key = norm(v);
      if (!key || !letters(key)) return;
      if (a === 'title' && el.closest('[onclick^="switchServer"]')) return;    // a server's name
      var tr = look(key);
      if (tr == null) { if (!known(key) && !quiet(key)) miss.add('[' + a + '] ' + key); return; }
      if (tr !== v) el.setAttribute(a, tr);
    });
  }
  /* links: the language goes along to /app and /talent; "neuropian.com" means this language's home page */
  function withLang(u) {
    var m = /^\/(app|talent)(\.html)?(\?[^#]*)?(#.*)?$/.exec(u);
    if (!m || /[?&]lang=/.test(m[3] || '')) return null;
    return '/' + m[1] + '?lang=' + L + (m[3] ? '&' + m[3].slice(1) : '') + (m[4] || '');
  }
  function links(el) {
    if (el.tagName === 'A' && !el.hasAttribute('hreflang')) {
      var h = el.getAttribute('href');
      if (h != null) {
        var nh = h === '/' ? HOME : /^\/#/.test(h) ? HOME + h.slice(1) : withLang(h);
        if (nh && nh !== h) el.setAttribute('href', nh);
      }
    }
    var oc = el.getAttribute('onclick');
    if (oc && /location\.href='\/(talent)?'/.test(oc))
      el.setAttribute('onclick', oc.replace("location.href='/'", "location.href='" + HOME + "'").replace("location.href='/talent'", "location.href='/talent?lang=" + L + "'"));
  }
  function run(parent, nodes) {
    var mixed = nodes.some(function (n) { return n.nodeType === 3 && letters(n.data); }) &&
                nodes.some(function (n) { return n.nodeType === 1 && letters(n.textContent); });
    if (!mixed) { nodes.forEach(function (n) { if (n.nodeType === 3) text(n); else walk(n); }); return; }
    var key = norm(nodes.map(keyOf).join('')), tr = look(key);
    if (tr == null) {
      if (known(key)) return;                          // a name written in two styles (neuro<em>pian</em>)
      // no entry for the whole sentence: translate its pieces (e.g. "<b>name</b> · Accepted"); listed only if a piece is missing
      var before = miss.size;
      nodes.forEach(function (n) { if (n.nodeType === 3) text(n); else walk(n); });
      if (miss.size > before) window.__npAppMissRuns.add(key);
      return;
    }
    var tpl = document.createElement('template'), pool = {};
    tpl.innerHTML = tr;
    nodes.forEach(function add(n) {
      if (n.nodeType !== 1) return;
      (pool[n.tagName] = pool[n.tagName] || []).push(n);
      Array.prototype.forEach.call(n.children, add);
    });
    Array.prototype.forEach.call(tpl.content.querySelectorAll('*'), function (e) {
      var o = (pool[e.tagName] || []).shift();
      if (o) Array.prototype.forEach.call(o.attributes, function (a) { e.setAttribute(a.name, a.value); });
    });
    Array.prototype.forEach.call(tpl.content.querySelectorAll('a'), links);
    parent.insertBefore(tpl.content, nodes[0]);
    nodes.forEach(function (n) { if (n.parentNode === parent) parent.removeChild(n); });
  }
  function isInline(n) { return n.nodeType === 3 || (n.nodeType === 1 && INLINE[n.tagName] && !n.matches(SKIP)); }
  /* deep = also translate block children; shallow (deep false) = only this element's own runs of text and inline tags */
  function walk(el, shallow) {
    if (el.nodeType !== 1 || el.namespaceURI !== 'http://www.w3.org/1999/xhtml' || el.matches(SKIP)) return;
    attrs(el); links(el); typed(el);
    if (el.tagName === 'TEXTAREA') return;           // its placeholder only: the text inside is what someone typed
    var kids = Array.prototype.slice.call(el.childNodes), cur = [];
    for (var i = 0; i <= kids.length; i++) {
      var n = kids[i];
      if (n && isInline(n)) { cur.push(n); continue; }
      if (cur.length) { run(el, cur); cur = []; }
      if (n && n.nodeType === 1 && !shallow) walk(n);
    }
  }
  function blocked(n) { var e = n.nodeType === 1 ? n : n.parentNode; return !e || e.nodeType !== 1 || !!e.closest(SKIP) || (n.nodeType !== 1 && e.tagName === 'TEXTAREA'); }

  /* the date pickers on the profile page: day month year (年 月 日 in Chinese), as in auth-i18n.js */
  function dob() {
    var inp = document.getElementById('b-dob-in'), w = inp && inp.nextElementSibling;
    if (!w || !w.classList.contains('dob-sel') || w.dataset.np) return;
    var s = w.querySelectorAll('select');
    if (s.length !== 3) return;
    w.dataset.np = '1';
    (L === 'zh' ? [2, 0, 1] : [1, 0, 2]).forEach(function (i) { w.appendChild(s[i]); });
  }

  /* native dialogs (confirm / alert) say the same in this language */
  ['alert', 'confirm'].forEach(function (f) {
    var o = window[f];
    if (typeof o !== 'function') return;
    window[f] = function (m) {
      var a = Array.prototype.slice.call(arguments);
      if (typeof m === 'string' && letters(m)) { var t = look(m); if (t != null) a[0] = t; else note(norm(m)); }
      return o.apply(window, a);
    };
  });

  /* right to left: whole page on Talent (as on the home pages); in the app, the reading areas and boxes, while the app's
     frame (nav bar, RoundTable's columns, the message list, the drawer that slides in from the left) keeps its places */
  var RTL_APP = ['nav .nav-links', '#mobile-nav-drawer > div', '#page-home .m-home', '#page-build .m-home', '#page-projects .m-home',
    '#page-platform .plpg', '#chat-sidebar', '#members-panel', '#search-panel', '#reply-bar', '#attach-bar', '#typing-indicator', '#chat-err',
    '#profile-modal > div', '#report-modal > div', '#post-problem-modal > div', '#post-build-modal > div', '#team-assembly-modal > div',
    '#create-server-modal > div', '#join-server-modal > div', '#server-settings-modal > div', '#user-card-modal > div', '#friend-modal > div',
    '#notif-container'];
  function direction() {
    if (!RTL) return;
    if (TALENT) { de.setAttribute('dir', 'rtl'); return; }
    RTL_APP.forEach(function (s) { document.querySelectorAll(s).forEach(function (e) { e.setAttribute('dir', 'rtl'); }); });
    ['chat-room-prefix', 'chat-input'].forEach(function (id) {             // RoundTable's room header and message bar (no ids of their own)
      var e = document.getElementById(id); if (e && e.parentElement) e.parentElement.setAttribute('dir', 'rtl');
    });
  }
  /* Hebrew: where people type, the text takes its own direction (an empty field shows its Hebrew placeholder right to left, see style) */
  function typed(el) {
    if (!RTL || el.hasAttribute('dir') || !(el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|url|email|number|)$/.test(el.getAttribute('type') || '')))) return;
    if (el.closest('[dir=rtl]')) el.setAttribute('dir', 'auto');
  }

  /* he, hi, zh: the script's Noto faces after the site's Latin ones (as in auth-i18n.js and the home pages); labels set
     in caps put the script's sans first and drop the letter-spacing made for capitals. Hindi: the app's font-size-adjust
     (.46) shrinks Devanagari next to Latin words, so it is off. */
  var F = {
    he: ['"Newsreader","Noto Serif Hebrew",Garamond,Georgia,serif', '"Newsreader","Frank Ruhl Libre","Noto Serif Hebrew",Georgia,serif',
         '"Noto Sans Hebrew","IBM Plex Mono",ui-monospace,Menlo,monospace', '.02em',
         'family=Frank+Ruhl+Libre:wght@400;500;700&family=Noto+Serif+Hebrew:wght@400;500;600&family=Noto+Sans+Hebrew:wght@400;500'],
    hi: ['"Newsreader","Noto Serif Devanagari",Garamond,Georgia,serif', '"Newsreader","Tiro Devanagari Hindi","Noto Serif Devanagari",Georgia,serif',
         '"Noto Sans Devanagari","IBM Plex Mono",ui-monospace,Menlo,monospace', '0',
         'family=Tiro+Devanagari+Hindi:ital@0;1&family=Noto+Serif+Devanagari:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500'],
    zh: ['"Newsreader","Noto Serif SC",Garamond,Georgia,serif', '"Newsreader","Noto Serif SC",Georgia,serif',
         '"Noto Sans SC","IBM Plex Mono",ui-monospace,Menlo,monospace', '.06em',
         'family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500']
  }[L];
  /* Talent uses the home pages' font variables, so it gets the home pages' rules (site_i18n.py LANG_CSS) */
  var TCSS = {
    he: ':root{--serif:"Newsreader","Noto Serif Hebrew",Garamond,Georgia,serif;--display:"Newsreader","Frank Ruhl Libre","Noto Serif Hebrew",Georgia,serif;--mono:"IBM Plex Mono","Noto Sans Hebrew",ui-monospace,SFMono-Regular,Menlo,monospace}\n' +
        'body{line-height:1.55}h1,h2,h3,.npac h2{font-weight:500;font-synthesis:none}.kicker,.badge,.chip,.npac-k,.npld{letter-spacing:.02em}\n' +
        'html .npac-x{right:auto;left:12px}html .npac-l a::after{content:"\\2190"}html .npac-l a:hover{padding-left:0;padding-right:6px}\n',
    hi: ':root{--serif:"Newsreader","Noto Serif Devanagari",Garamond,Georgia,serif;--display:"Newsreader","Tiro Devanagari Hindi","Noto Serif Devanagari",Georgia,serif;--mono:"IBM Plex Mono","Noto Sans Devanagari",ui-monospace,SFMono-Regular,Menlo,monospace}\n' +
        'body{line-height:1.65}h1,h2,h3{letter-spacing:0;line-height:1.3}.kicker,.badge,.chip,.c-match,.npac-k,.npld{letter-spacing:0}html .npac h2{line-height:1.3}.kicker{font-size:14px}html .npac-k{font-size:13px}\n',
    zh: ':root{--serif:"Newsreader","Noto Serif SC",Garamond,Georgia,serif;--display:"Newsreader","Noto Serif SC",Georgia,serif;--mono:"IBM Plex Mono","Noto Sans SC",ui-monospace,SFMono-Regular,Menlo,monospace}\n' +
        'body{line-height:1.7}h1,h2,h3,.npac h2{font-weight:600;font-synthesis:none;letter-spacing:0}.kicker,.npac-k,.npld{letter-spacing:.06em}\n'
  };
  /* in a right-to-left area, what people wrote (names, titles, bios) keeps its own direction per paragraph, aligned right with the page */
  var OWN = ['.pc-sum', '.pc-top > b', '.pc-proof', '.pc-row > b', '.chat-room-item', '[onclick^="switchServer"]', '[onclick^="switchRoom"] > span',
    '#friend-requests-list span', '#members-panel-list div', '#members-panel-list span', '#ss-roles-list span', '#ss-members-list span', '#ss-channels-list span',
    '#cs-roles-list label span', '#cs-parent-label', '#uc-name', '#uc-bio', '#uc-accomplishment', '#uc-hidden-ability', '#pf-accomplishment', '#pf-hidden-ability',
    '#profile-name-display', '#profile-email-display', '#mobile-nav-user', '#notif-container > div > div', '.jt', '.jco', '.jd', '#b-pub', '#pc-inv', '#invite-link-text',
    '#np-invited', '#bio-char-count', '#chat-room-name', '#chat-room-desc', '.c-name', '.c-head', '.c-work', '.p-name', '.p-head', '.p-sum', '.w-title', '.w-detail', '.w-src', '#npac-n', '.npac-e', '.status', '.empty'];
  function style() {
    var B = 'html:not(#np-x) body', css = '';
    var CAPS = ':is([style*="text-transform:uppercase"],[style*="text-transform: uppercase"],.m-kicker,.pc-k,.pc-st)';
    if (F) {
      if (TALENT) css += TCSS[L];
      else css += B + ' :is(*:not(svg):not(svg *):not(code):not(pre):not([style*="Mono"])){font-family:' + F[0] + '!important}\n' +
             B + ' :is(h1,h2,h3,h1 *,h2 *,h3 *,.m-title,[style*="Playfair"],[style*="font-size:clamp(2"],[style*="font-size:clamp(3"]){font-family:' + F[1] + '!important;line-height:1.2}\n' +
             B + ' ' + CAPS + '{font-family:' + F[2] + '!important;letter-spacing:' + F[3] + '!important}\n' +
             (L === 'hi' ? B + ' *{font-size-adjust:none!important}\n' : '');
      var ln = document.createElement('link');
      ln.rel = 'stylesheet'; ln.href = 'https://fonts.googleapis.com/css2?' + F[4] + '&display=swap';
      document.head.appendChild(ln);
    }
    if (TALENT) {
      css += '.en-note{color:var(--faint)}\n';
      // translated nav labels: keep the phone bar on one line (as the home pages)
      css += '@media(max-width:480px){.bar .wrap{gap:12px}.nav{gap:16px;font-size:16px}.nav a.login{padding:6px 12px}}\n';
    } else {
      css += '.np-en-note{color:rgba(43,42,40,.38)}\n';
      if (RTL) css += 'html:not(#np-x) #mobile-nav-drawer > div[dir=rtl] a{text-align:right}\n' +
                      'html:not(#np-x) #page-projects [dir=rtl] .pc-ledger .d{text-align:left}\n' +
                      'html:not(#np-x) [dir=rtl] #pc-welcome{margin-left:0;margin-right:auto}\n';
    }
    if (RTL) css += (TALENT ? 'html[dir=rtl]' : 'html:not(#np-x) [dir=rtl]') + ' :is(input,textarea)[dir=auto]:placeholder-shown{direction:rtl;text-align:right}\n';
    if (RTL) css += OWN.map(function (o) { return (TALENT ? 'html[dir=rtl] ' : 'html:not(#np-x) [dir=rtl] ') + o; }).join(',') + '{unicode-bidi:plaintext;text-align:right}\n';
    var st = document.createElement('style');
    st.id = 'np-app-i18n';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* the Terms and Privacy text stays English: say so next to the links (as the home pages do) */
  function enNotes() {
    var cls = TALENT ? 'en-note' : 'np-en-note', sel = TALENT ? 'footer a[href="/privacy"]' : '#page-home .m-legal a[onclick*="privacy"]';
    document.querySelectorAll(sel).forEach(function (a) {
      if (a.nextSibling && a.nextSibling.className === cls) return;
      var s = document.createElement('span');
      s.className = cls; s.textContent = ' ' + (T['(in English)'] || '(in English)');
      a.parentNode.insertBefore(s, a.nextSibling);
    });
  }

  window.__npAppLook = function (en) { return look(en); };   // for tests and review: what a string becomes (null = stays English)

  var obs = null;
  function onMutations(recs) {
    var shallow = new Set(), deep = new Set();
    recs.forEach(function (r) {
      if (r.type === 'attributes') { if (!blocked(r.target)) { attrs(r.target); if (r.attributeName === 'href' || r.attributeName === 'onclick') links(r.target); } return; }
      if (r.type === 'characterData') { if (r.target.parentNode) shallow.add(r.target.parentNode); return; }
      shallow.add(r.target);
      r.addedNodes.forEach(function (n) { if (n.nodeType === 1) deep.add(n); });
    });
    shallow.forEach(function (e) { if (e.isConnected && !blocked(e)) walk(e, true); });
    deep.forEach(function (e) { if (e.isConnected && !blocked(e)) walk(e); });
    if (shallow.has(document.head) || recs.some(function (r) { return r.target.nodeName === 'TITLE' || (r.target.parentNode && r.target.parentNode.nodeName === 'TITLE'); })) title();
    dob();
    if (obs) obs.takeRecords();
  }
  function title() { var t = look(document.title); if (t != null && t !== document.title) document.title = t; }

  function start() {
    window.__npAppMissRuns = new Set();
    de.setAttribute('lang', HL);
    ['page-tos', 'page-privacy'].forEach(function (id) { var e = document.getElementById(id); if (e) { e.setAttribute('lang', 'en'); e.setAttribute('dir', 'ltr'); } });
    style();
    if (RTL) direction();                            // Hebrew only: every other language stays left to right
    enNotes();
    walk(document.body);
    title();
    dob();
    var cur = document.querySelector(':is(.langs,.m-langs) a[hreflang="' + HL + '"]');
    document.querySelectorAll(':is(.langs,.m-langs) a[aria-current]').forEach(function (a) { a.removeAttribute('aria-current'); });
    if (cur) cur.setAttribute('aria-current', 'true');
    obs = new MutationObserver(onMutations);
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['href', 'onclick']) });
    var tt = document.querySelector('title');
    if (tt) obs.observe(tt, { subtree: true, childList: true, characterData: true });
    reveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
