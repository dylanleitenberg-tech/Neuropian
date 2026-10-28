/* Neuropian: small touches. Everything on the page is readable without this file. */
(function () {
  "use strict";
  /* only once this script runs do reveals hide and the orbit become a tall scroll stage; if it fails, the page is static */
  document.documentElement.classList.add("js", "ready");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  /* Type text in, once, when it scrolls into view. The text is in the HTML; this only replays it.
     The untyped rest stays in place, invisible, so every line break is final from the first letter and no
     half-typed word jumps to the next line (Dylan, 2026-10-25). The cursor floats (position:absolute at its
     static spot), so it takes no room either. */
  function typeInto(el, text, speed, done) {
    if (reduce) { el.textContent = text; if (done) done(); return; }
    var shown = document.createTextNode(""), rest = document.createElement("span");
    rest.style.visibility = "hidden"; rest.setAttribute("aria-hidden", "true");
    el.textContent = ""; el.appendChild(shown);
    if (el.hasAttribute("data-type")) {
      var caret = document.createElement("span");
      caret.textContent = "\u258C"; caret.setAttribute("aria-hidden", "true");
      caret.style.cssText = "position:absolute;margin-left:2px;color:var(--acc);animation:blink 1s steps(1) infinite";
      el.appendChild(caret);
    }
    el.appendChild(rest);
    var i = 0;
    (function step() {
      i += Math.max(1, Math.round(text.length / 60));
      shown.data = text.slice(0, i); rest.textContent = text.slice(i);
      if (i < text.length) setTimeout(step, speed);
      else { el.textContent = text; el.style.minHeight = ""; if (done) done(); }
    })();
  }

  var typed = document.querySelectorAll("[data-type], .kicker, section:not(.hero) h2");
  if (io && !reduce) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        typeInto(e.target, e.target.getAttribute("data-text"), 45);
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    typed.forEach(function (el) {
      el.setAttribute("data-text", el.textContent.trim());
      el.style.minHeight = el.offsetHeight + "px";      /* no layout jump while it types */
      obs.observe(el);
    });
  }

  /* Fade-up reveals. */
  var reveals = document.querySelectorAll(".reveal");
  if (io && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { ro.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("in"); });

  /* Videos play only while on screen. */
  document.querySelectorAll("video").forEach(function (v) {
    if (!io || reduce) { v.setAttribute("controls", ""); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () { v.setAttribute("controls", ""); }); }
        else v.pause();
      });
    }, { threshold: 0.35 }).observe(v);
  });

  /* Hero: the headline types in on load. */
  var h1 = document.querySelector(".hero h1");
  if (h1 && !reduce) {
    var t1 = h1.textContent.trim(), h1html = h1.innerHTML;          /* typing uses plain text; the coloured word comes back after */
    h1.style.minHeight = h1.offsetHeight + "px";
    h1.setAttribute("data-type", "");                               /* show the cursor while it types (Dylan 2026-10-28: bring the type-out back, visibly) */
    setTimeout(function () { typeInto(h1, t1, 75, function () { h1.removeAttribute("data-type"); h1.innerHTML = h1html; }); }, 400);
  }

  /* The last run: lines type out one after another when the terminal comes into view. */
  var term = document.querySelector(".term");
  if (term && io && !reduce) term.classList.add("armed");     /* hide lines only when this script will type them */
  if (term) {
    var lis = Array.prototype.slice.call(term.querySelectorAll("li"));
    var played = false;
    var play = function () {
      if (played) return; played = true;
      var k = 0;
      (function next() {
        if (k >= lis.length) return;
        var li = lis[k++], txt = li.textContent;
        li.classList.add("shown");
        if (reduce) { next(); return; }
        typeInto(li, txt, li.classList.contains("t-cmd") ? 26 : 8, function () { setTimeout(next, li.classList.contains("t-cmd") ? 260 : 90); });
      })();
    };
    if (io && !reduce) {
      var to = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { to.disconnect(); play(); } }, { threshold: 0.3 });
      to.observe(term);
      var fold = term.closest("details");                                   /* folded away: start as soon as it is opened */
      if (fold) fold.addEventListener("toggle", function () { if (fold.open) { to.disconnect(); play(); } });
    } else lis.forEach(function (li) { li.classList.add("shown"); });
  }

  /* Plain numbers count up when they come into view. */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = +el.getAttribute("data-count"), pre = el.getAttribute("data-prefix") || "";
    var fmt = function (v) { return pre + Math.round(v).toLocaleString("en-US"); };
    if (!io || reduce) { el.textContent = fmt(end); return; }
    el.textContent = fmt(0);
    var co = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      co.disconnect();
      var t0 = null, dur = 1400;
      (function step(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(end * e);
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    }, { threshold: 0.6 });
    co.observe(el);
  });

  /* Charts draw in when they scroll into view. */
  document.querySelectorAll(".chart").forEach(function (c) {
    if (!io || reduce) { c.classList.add("in"); return; }
    c.classList.add("armed");
    c.querySelectorAll(".ur-dots").forEach(function (row) {                /* one person at a time */
      Array.prototype.forEach.call(row.children, function (d, k) { d.style.transitionDelay = Math.min(k * 4, 1400) + "ms"; });
    });
    var co = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { c.classList.add("in"); co.disconnect(); } }, { threshold: 0.4 });
    co.observe(c);
  });

  /* Project index: hovering a row floats its preview beside the cursor (the miner row plays the orbit). */
  var pindex = document.getElementById("pindex"), prev = document.querySelector(".pprev");
  if (pindex && prev && window.matchMedia("(hover: hover)").matches) {
    var pimg = prev.querySelector("img"), px = 0, py = 0, tx = 0, ty = 0, raf = null, spin = null;
    var orbitEl = document.getElementById("orbit");
    var frame = function (i) { return orbitEl.dataset.path + (i < 10 ? "0" : "") + i + ".webp"; };
    var follow = function () {
      px += (tx - px) * 0.18; py += (ty - py) * 0.18;
      prev.style.transform = "translate(" + px + "px," + py + "px)";
      raf = Math.abs(tx - px) + Math.abs(ty - py) > 0.5 ? requestAnimationFrame(follow) : null;
    };
    var show = function (a, x, y) {
      clearInterval(spin);
      if (a.hasAttribute("data-orbit") && orbitEl) {
        var f = 0, n = +orbitEl.dataset.frames;
        pimg.src = frame(0);
        spin = setInterval(function () { f = (f + 1) % n; pimg.src = frame(f); }, 70);
      } else pimg.src = a.getAttribute("data-preview");
      tx = x; ty = y; if (!prev.classList.contains("on")) { px = tx; py = ty; }
      prev.classList.add("on"); if (!raf) raf = requestAnimationFrame(follow);
    };
    pindex.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("mouseenter", function (e) { show(a, e.clientX + 56, e.clientY - 90); });
      a.addEventListener("mousemove", function (e) { tx = e.clientX + 56; ty = e.clientY - 90; if (!raf) raf = requestAnimationFrame(follow); });
      a.addEventListener("focus", function () { var r = a.getBoundingClientRect(); show(a, r.right - prev.offsetWidth - 8, r.top - 40); });
      a.addEventListener("blur", function () { prev.classList.remove("on"); clearInterval(spin); });
    });
    pindex.addEventListener("mouseleave", function () { prev.classList.remove("on"); clearInterval(spin); });
  }

  /* Astroworm orbit: scroll turns it (72 pre-rendered frames, a 120-degree sweep), drag turns it within that sweep,
     the second half switches to a cyan "hologram" style (a CSS filter over the same frames). */
  var orbit = document.getElementById("orbit");
  if (!orbit) return;
  var canvas = orbit.querySelector("canvas"), ctx = canvas.getContext("2d");
  var N = +orbit.dataset.frames, path = orbit.dataset.path, az0 = +orbit.dataset.az0, az1 = +orbit.dataset.az1;
  var frames = new Array(N), loaded = 0, started = false;
  var azEl = orbit.querySelector(".hud-az"), modeLabel = orbit.querySelector(".hud-mode-label"), modeBtn = orbit.querySelector(".hud-mode");
  var notes = Array.prototype.slice.call(orbit.querySelectorAll(".hud-notes li"));
  var drag = 0, manualMode = null, current = -1;

  function pad(i) { return (i < 10 ? "0" : "") + i; }
  function load() {
    if (started) return; started = true;
    /* every 6th frame first, so scrubbing works at once; then the rest */
    var order = [];
    for (var s = 0; s < 6; s++) for (var i = s; i < N; i += 6) order.push(i);
    order.forEach(function (i) {
      var im = new Image(); im.decoding = "async";
      im.onload = function () { frames[i] = im; loaded++; if (current < 0 || Math.abs(i - current) < 6) draw(true); };
      im.src = path + pad(i) + ".webp";
    });
  }
  function nearest(i) {
    if (frames[i]) return frames[i];
    for (var d = 1; d < N; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; }
    return null;
  }
  function progress() {
    var r = orbit.getBoundingClientRect(), h = r.height - window.innerHeight;
    return Math.min(1, Math.max(0, -r.top / (h > 0 ? h : 1)));
  }
  function draw(force) {
    var p = progress();
    var f = Math.max(0, Math.min(N - 1, Math.round(p * (N - 1) + drag)));
    if (f !== current || force) {
      var im = nearest(f);
      if (im) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(im, 0, 0, canvas.width, canvas.height); }
      current = f;
      if (azEl) azEl.textContent = "Camera " + ("00" + Math.round(az0 + (az1 - az0) * f / (N - 1))).slice(-3) + "°";
    }
    var holo = manualMode === null ? p > 0.5 : manualMode;
    orbit.classList.toggle("holo", holo);
    if (modeLabel) modeLabel.textContent = holo ? "Hologram style" : "Render";
    if (modeBtn) modeBtn.textContent = holo ? "Render style" : "Hologram style";
    notes.forEach(function (li) {
      if (!li.dataset.shown && p >= +li.dataset.at) { li.dataset.shown = "1"; li.parentNode.classList.add("has"); typeInto(li, li.dataset.note, 18); }
    });
  }

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; draw(); }); } }
  if (io) new IntersectionObserver(function (es) { if (es[0].isIntersecting) load(); }, { rootMargin: "100% 0px" }).observe(orbit);
  else load();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* drag to spin (mouse or touch, horizontal only so vertical swipes still scroll) */
  var x0 = null, d0 = 0;
  canvas.addEventListener("pointerdown", function (e) { x0 = e.clientX; d0 = drag; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", function (e) {
    if (x0 === null) return;
    var p = progress() * (N - 1);                            /* keep the dragged frame inside the rendered sweep */
    drag = Math.max(-p, Math.min(N - 1 - p, d0 - (e.clientX - x0) / 12)); draw();
  });
  canvas.addEventListener("pointerup", function () { x0 = null; });
  canvas.addEventListener("pointercancel", function () { x0 = null; });
  if (modeBtn) modeBtn.addEventListener("click", function () { manualMode = !orbit.classList.contains("holo"); draw(true); });
  draw(true);
})();
