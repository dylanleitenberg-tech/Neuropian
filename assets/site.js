/* Neuropian: small touches. Everything on the page is readable without this file. */
(function () {
  "use strict";
  /* only once this script runs do reveals hide and the orbit become a tall scroll stage; if it fails, the page is static */
  document.documentElement.classList.add("js", "ready");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  /* Type text in, once, when it scrolls into view. The text is in the HTML; this only replays it. */
  function typeInto(el, text, speed, done) {
    if (reduce) { el.textContent = text; if (done) done(); return; }
    el.classList.add("typing"); el.textContent = "";
    var i = 0;
    (function step() {
      i += Math.max(1, Math.round(text.length / 60));
      el.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(step, speed);
      else { el.classList.remove("typing"); el.style.minHeight = ""; if (done) done(); }
    })();
  }

  var typed = document.querySelectorAll("[data-type], .kicker, section:not(.hero) h2");
  if (io && !reduce) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        typeInto(e.target, e.target.getAttribute("data-text"), 22);
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

  /* Brain: lobes light in turn while it is on screen; hover or focus picks one; lobes and bubbles link to projects. */
  var mind = document.getElementById("mind");
  if (mind) {
    var order = ["frontal", "parietal", "occipital", "temporal", "cerebellum"], at = 0, timer = null, held = false;
    var parts = mind.querySelectorAll("[data-lobe]");
    var setOn = function (k) { parts.forEach(function (el) { el.classList.toggle("on", el.getAttribute("data-lobe") === k); }); };
    var tick = function () { if (!held) { setOn(order[at % order.length]); at++; } };
    parts.forEach(function (el) {
      var k = el.getAttribute("data-lobe");
      el.addEventListener("mouseenter", function () { held = true; setOn(k); });
      el.addEventListener("mouseleave", function () { held = false; });
      el.addEventListener("focusin", function () { held = true; setOn(k); });
      el.addEventListener("focusout", function () { held = false; });
    });
    if (io) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { mind.classList.add("in"); if (!timer && !reduce) { tick(); timer = setInterval(tick, 2600); } }
          else if (timer) { clearInterval(timer); timer = null; }
        });
      }, { threshold: 0.2 }).observe(mind);
      if (reduce) setOn("frontal");
    } else { mind.classList.add("in"); setOn("frontal"); }
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
