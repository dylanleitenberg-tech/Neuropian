/* Members globe (side piece in #members): member CLUSTERS (members within 450 km merged into one dot, sized by
   a count bucket), each member first placed at their city rounded to 0.5 degree (about 50 km), from the static /assets/members-geo.json (members_geo.py). No names, ids or links reach the browser; a dot carries
   nothing but a rounded latitude, longitude and size bucket. A bone-white sphere with bone-grey lines and land dots and bright
   near-white member points, so it reads on the paper page. Turning the globe (spin or drag) turns the "Our team."
   carousel in step: motion only, one full turn runs through every card; no card is ever tied to a dot or a place.
   It starts once #members is shown (hidden until the carousel loads) and near the screen. Hand-rolled
   orthographic projection: no libraries. */
(function () {
  "use strict";
  var fig = document.getElementById("geo"), cv = fig && fig.querySelector("canvas");
  if (!fig || !cv || !cv.getContext || !window.fetch) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SPIN_DEG_PER_SEC = 1.5;   /* auto-spin speed; the carousel it drives moves with it (360 deg = the whole track) */
  var DOT_SCALE = [1, 1.4, 1.85, 2.35, 2.8];   /* member dot size by cluster bucket: 1, 2-3, 4-7, 8-15, 16+ members */
  var RAD = Math.PI / 180, started = false;
  var GRAT = "140,126,100", LAND = "168,152,120", SHADE = "112,96,68", TINT = "196,182,150";   /* bone greys */

  function start() {
    if (started) return; started = true;
    fetch("/assets/members-geo.json?v=20261027c").then(function (r) { if (!r.ok) throw r; return r.json(); })
      .then(run).catch(function () { fig.classList.add("geo-off"); });
  }
  function prep(lat, lon) { return [Math.cos(lat * RAD), Math.sin(lat * RAD), lon * RAD]; }

  /* the carousel follows the globe: degrees turned -> pixels scrolled (360 degrees = the whole track), looping.
     Someone using the carousel themselves (arrows, swipe, wheel, keys) gets it back, snapping as usual, for a moment. */
  var track = document.getElementById("mq-track"), pos = null, hold = 0;
  function handBack() {
    hold = performance.now() + 1600; pos = null;
    if (track) { track.style.scrollSnapType = ""; track.style.scrollBehavior = ""; }
  }
  if (track) {
    var sec = track.closest("section") || track.parentNode;
    ["pointerdown", "wheel", "touchstart", "touchmove", "keydown"].forEach(function (ev) {
      sec.addEventListener(ev, function (e) { if (!fig.contains(e.target)) handBack(); }, { passive: true, capture: true });
    });
  }
  function follow(dl) {
    if (!track || !dl || performance.now() < hold) return;
    var max = track.scrollWidth - track.clientWidth; if (max <= 0) return;
    if (track.style.scrollSnapType !== "none") { track.style.scrollSnapType = "none"; track.style.scrollBehavior = "auto"; }
    if (pos === null || Math.abs(pos - track.scrollLeft) > 3) pos = track.scrollLeft;
    pos += dl * max / 360;
    if (pos > max) pos -= max; else if (pos < 0) pos += max;   /* past the last card: back to the first, and the reverse */
    track.scrollLeft = pos;
  }

  function run(data) {
    var ctx = cv.getContext("2d"), land = [], pts = [], grat = [], i, j;
    for (i = 0; i + 1 < data.land.length; i += 2) land.push(prep(data.land[i] / 10, data.land[i + 1] / 10));
    (data.points || []).forEach(function (p, k) { var q = prep(p[0], p[1]); q.push(k * 2.399, DOT_SCALE[p[2] | 0] || 1); pts.push(q); });
    for (i = -180; i < 180; i += 20) { var m = []; for (j = -80; j <= 80; j += 4) m.push(prep(j, i)); grat.push(m); }
    for (i = -60; i <= 60; i += 20) { var pl = []; for (j = -180; j <= 180; j += 4) pl.push(prep(i, j)); grat.push(pl); }

    var lam = reduce ? 10 : -70, phi = 18, size = 0, dpr = 1, cx = 0, R = 0, halo = null, bloom = null;
    var hover = false, drag = null, onScreen = true, last = 0, raf = 0, t0 = performance.now();

    function sprite(stops) {
      var g = document.createElement("canvas"), n = Math.round(40 * dpr), c = g.getContext("2d"), rg;
      g.width = g.height = n; rg = c.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      stops.forEach(function (s) { rg.addColorStop(s[0], s[1]); }); c.fillStyle = rg; c.fillRect(0, 0, n, n); return g;
    }
    function resize() {
      var w = Math.round(cv.getBoundingClientRect().width); if (!w) return;
      dpr = Math.min(2, window.devicePixelRatio || 1); size = w; cx = w / 2; R = w / 2 * 0.84;
      cv.width = cv.height = Math.round(w * dpr);
      halo = sprite([[0, "rgba(" + SHADE + ",.42)"], [0.3, "rgba(" + SHADE + ",.18)"], [1, "rgba(" + SHADE + ",0)"]]);  /* soft shadow */
      bloom = sprite([[0, "rgba(255,253,247,1)"], [0.35, "rgba(255,252,242,.6)"], [1, "rgba(255,252,242,0)"]]);        /* glow */
      draw(performance.now());
    }
    function setLam(v) { var d = v - lam; lam = v; follow(d); }
    function draw(now) {
      if (!size) return;
      var l0 = lam * RAD, sp = Math.sin(phi * RAD), cp = Math.cos(phi * RAD), s = size / 400, t = (now - t0) / 1000, g;
      function proj(q) {                                   /* -> [x, y, cos c]; cos c < 0 is the far side */
        var d = q[2] - l0, cd = Math.cos(d);
        return [cx + R * q[0] * Math.sin(d), cx - R * (cp * q[1] - sp * q[0] * cd), sp * q[1] + cp * q[0] * cd];
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size); ctx.globalAlpha = 1;
      /* bone-white sphere with a soft drop shadow */
      g = ctx.createRadialGradient(cx - R * 0.35, cx - R * 0.42, R * 0.05, cx, cx, R);
      g.addColorStop(0, "#F8F4EA"); g.addColorStop(0.65, "#EDE6D6"); g.addColorStop(1, "#DCD2BE");
      ctx.save(); ctx.shadowColor = "rgba(60,50,32,.24)"; ctx.shadowBlur = 26 * s; ctx.shadowOffsetY = 10 * s;
      ctx.beginPath(); ctx.arc(cx, cx, R, 0, 2 * Math.PI); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      /* HUD ring: ticks every 5 degrees, longer every 30, turning with the globe */
      ctx.strokeStyle = "rgba(" + GRAT + ",.38)"; ctx.lineWidth = 1; ctx.beginPath();
      for (i = 0; i < 72; i++) {
        var a = i * 5 * RAD + l0 * 0.5, r1 = R * 1.04, r2 = R * (i % 6 ? 1.065 : 1.095);
        ctx.moveTo(cx + r1 * Math.cos(a), cx + r1 * Math.sin(a)); ctx.lineTo(cx + r2 * Math.cos(a), cx + r2 * Math.sin(a));
      }
      ctx.stroke();
      /* graticule, the far side faintly through the glass */
      var front = new Path2D(), back = new Path2D();
      grat.forEach(function (line) {
        var p0 = proj(line[0]);
        for (var k = 1; k < line.length; k++) { var p1 = proj(line[k]), P = (p0[2] > 0 && p1[2] > 0) ? front : back; P.moveTo(p0[0], p0[1]); P.lineTo(p1[0], p1[1]); p0 = p1; }
      });
      ctx.lineWidth = 0.7; ctx.strokeStyle = "rgba(" + GRAT + ",.08)"; ctx.stroke(back);
      ctx.strokeStyle = "rgba(" + GRAT + ",.22)"; ctx.stroke(front);
      /* dotted land in darker bone, four bands by distance from the limb */
      var bands = [new Path2D(), new Path2D(), new Path2D(), new Path2D()], far = new Path2D(), d0 = 1.7 * s + 0.4;
      land.forEach(function (q) {
        var p = proj(q);
        if (p[2] < 0) { far.rect(p[0] - 0.5, p[1] - 0.5, 1, 1); return; }
        var b = Math.min(3, Math.floor(p[2] * 4)), d = d0 * (0.55 + 0.45 * p[2]);
        bands[b].rect(p[0] - d / 2, p[1] - d / 2, d, d);
      });
      ctx.fillStyle = "rgba(" + LAND + ",.12)"; ctx.fill(far);
      [0.32, 0.45, 0.56, 0.66].forEach(function (al, k) { ctx.fillStyle = "rgba(" + LAND + "," + al + ")"; ctx.fill(bands[k]); });
      /* holographic edge: a warm tint inside the rim, an ivory rim highlight, a thin bone-grey outline */
      g = ctx.createRadialGradient(cx, cx, R * 0.72, cx, cx, R);
      g.addColorStop(0, "rgba(" + TINT + ",0)"); g.addColorStop(1, "rgba(" + TINT + ",.22)");
      ctx.beginPath(); ctx.arc(cx, cx, R, 0, 2 * Math.PI); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cx, R - 1.5, -2.7, -0.9); ctx.strokeStyle = "rgba(255,253,247,.95)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cx, R + 0.5, 0, 2 * Math.PI); ctx.strokeStyle = "rgba(" + GRAT + ",.42)"; ctx.lineWidth = 0.8; ctx.stroke();
      /* sweep: a faint band of light passing down the sphere */
      if (!reduce) {
        var y = cx - R + ((t * 0.12) % 1.6) * 2 * R, band = ctx.createLinearGradient(0, y - 28 * s, 0, y + 28 * s);
        band.addColorStop(0, "rgba(255,252,242,0)"); band.addColorStop(0.5, "rgba(255,252,242,.35)"); band.addColorStop(1, "rgba(255,252,242,0)");
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cx, R, 0, 2 * Math.PI); ctx.clip(); ctx.fillStyle = band; ctx.fillRect(0, y - 28 * s, size, 56 * s); ctx.restore();
      }
      /* sheen, upper left */
      g = ctx.createRadialGradient(cx - R * 0.42, cx - R * 0.48, 0, cx - R * 0.42, cx - R * 0.48, R * 0.55);
      g.addColorStop(0, "rgba(255,253,247,.5)"); g.addColorStop(1, "rgba(255,253,247,0)");
      ctx.beginPath(); ctx.arc(cx, cx, R, 0, 2 * Math.PI); ctx.fillStyle = g; ctx.fill();
      /* members: soft shadow, glow, near-white core with a thin bone-grey edge */
      var hs = 22 * Math.max(0.8, s), bs = 30 * Math.max(0.8, s), cr = 3 * Math.max(0.85, s), near = [];
      pts.forEach(function (q) {
        var p = proj(q);
        if (p[2] < 0) { ctx.globalAlpha = 1; ctx.fillStyle = "rgba(" + SHADE + ",.16)"; ctx.fillRect(p[0] - 1, p[1] - 1, 2, 2); return; }
        p.push(q[3], q[4]); near.push(p);
      });
      near.sort(function (a, b) { return b[4] - a[4]; });                     /* big clusters first, small on top */
      near.forEach(function (p) { var h = hs * p[4]; ctx.globalAlpha = 0.5 + 0.5 * Math.min(1, p[2] * 3); ctx.drawImage(halo, p[0] - h / 2, p[1] - h / 2 + 1.5, h, h); });
      near.forEach(function (p) {
        var tw = reduce ? 1 : 0.8 + 0.2 * Math.sin(t * 2.2 + p[3]), e = Math.min(1, p[2] * 3);
        var b = bs * p[4]; ctx.globalAlpha = tw; ctx.drawImage(bloom, p[0] - b / 2, p[1] - b / 2, b, b);
        ctx.globalAlpha = 0.6 + 0.4 * e; ctx.beginPath(); ctx.arc(p[0], p[1], cr * p[4] * (0.7 + 0.3 * e), 0, 2 * Math.PI);
        ctx.fillStyle = "#FFFDF7"; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = "rgba(" + SHADE + ",.6)"; ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    function tick(now) {
      raf = 0;
      var dt = last ? Math.min(64, now - last) : 0; last = now;
      if (!hover && !drag && dt) setLam(lam + dt * SPIN_DEG_PER_SEC / 1000);   /* land drifts left like the cards */
      draw(now);
      if (onScreen && !document.hidden) raf = requestAnimationFrame(tick); else last = 0;
    }
    function go() { if (!reduce && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick); }

    /* drag turns it (and the cards); touch-action:pan-y keeps vertical swipes scrolling the page */
    cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, l: lam, p: phi }; hold = 0; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var k = 180 / size;
      setLam(drag.l - (e.clientX - drag.x) * k); phi = Math.max(-60, Math.min(60, drag.p + (e.clientY - drag.y) * k));
      if (reduce) draw(performance.now());
    });
    function up() { drag = null; }
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hover = true; });
    cv.addEventListener("pointerleave", function () { hover = false; });

    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen) { last = 0; go(); } }).observe(cv);
    document.addEventListener("visibilitychange", function () { last = 0; go(); });
    window.addEventListener("resize", resize);
    fig.classList.add("geo-on");
    resize(); go();
  }

  /* #members is hidden until its cards load; the observer fires once it is shown and near the screen */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: "400px 0px" });
    io.observe(fig);
  } else start();
})();
