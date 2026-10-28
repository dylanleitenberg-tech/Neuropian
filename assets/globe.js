/* Members globe (#where): one bone-white point per member, at their city rounded to 0.5 degree (about 50 km), from
   the static /assets/members-geo.json (members_geo.py). No names, ids or links reach the browser; points carry
   nothing but a rounded latitude and longitude. A hologram on a dark disc, so it reads on paper and in the dark.
   Hand-rolled orthographic projection: no libraries. Without JS the caption says it all. */
(function () {
  "use strict";
  var fig = document.getElementById("geo"), cv = fig && fig.querySelector("canvas");
  if (!fig || !cv || !cv.getContext || !window.fetch) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var RAD = Math.PI / 180, started = false;

  function start() {
    if (started) return; started = true;
    fetch("/assets/members-geo.json?v=20261027b").then(function (r) { if (!r.ok) throw r; return r.json(); })
      .then(run).catch(function () { fig.classList.add("geo-off"); });
  }

  function prep(lat, lon) { return [Math.cos(lat * RAD), Math.sin(lat * RAD), lon * RAD]; }

  function run(data) {
    var ctx = cv.getContext("2d"), holo = (getComputedStyle(fig).getPropertyValue("--holo").trim() || "237,230,214");
    var land = [], pts = [], grat = [], i, j;
    for (i = 0; i + 1 < data.land.length; i += 2) land.push(prep(data.land[i] / 10, data.land[i + 1] / 10));
    (data.points || []).forEach(function (p, k) { var q = prep(p[0], p[1]); q.push(k * 2.399); pts.push(q); });
    for (i = -180; i < 180; i += 20) { var m = []; for (j = -80; j <= 80; j += 4) m.push(prep(j, i)); grat.push(m); }
    for (i = -60; i <= 60; i += 20) { var pl = []; for (j = -180; j <= 180; j += 4) pl.push(prep(i, j)); grat.push(pl); }

    var lam = reduce ? 10 : -70, phi = 18, size = 0, dpr = 1, cx = 0, R = 0, glow = null;
    var hover = false, drag = null, onScreen = true, last = 0, raf = 0, t0 = performance.now();

    function sprite() {                                   /* soft bloom for one member point */
      var g = document.createElement("canvas"), n = Math.round(28 * dpr), c = g.getContext("2d"), rg;
      g.width = g.height = n; rg = c.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      rg.addColorStop(0, "rgba(255,252,244,1)"); rg.addColorStop(0.16, "rgba(" + holo + ",.95)");
      rg.addColorStop(0.42, "rgba(" + holo + ",.28)"); rg.addColorStop(1, "rgba(" + holo + ",0)");
      c.fillStyle = rg; c.fillRect(0, 0, n, n); return g;
    }
    function resize() {
      var w = Math.round(cv.getBoundingClientRect().width); if (!w) return;
      dpr = Math.min(2, window.devicePixelRatio || 1); size = w; cx = w / 2; R = w / 2 * 0.9;
      cv.width = cv.height = Math.round(w * dpr); glow = sprite(); draw(performance.now());
    }
    function draw(now) {
      if (!size) return;
      var l0 = lam * RAD, sp = Math.sin(phi * RAD), cp = Math.cos(phi * RAD), s = size / 480, t = (now - t0) / 1000;
      function proj(q) {                                   /* -> [x, y, cos c]; cos c < 0 is the far side */
        var d = q[2] - l0, cd = Math.cos(d);
        return [cx + R * q[0] * Math.sin(d), cx - R * (cp * q[1] - sp * q[0] * cd), sp * q[1] + cp * q[0] * cd];
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      /* dark disc, so bone white reads on light paper */
      var bg = ctx.createRadialGradient(cx - R * 0.25, cx - R * 0.3, R * 0.1, cx, cx, R * 1.1);
      bg.addColorStop(0, "rgba(38,43,52,.97)"); bg.addColorStop(1, "rgba(12,14,18,.98)");
      ctx.beginPath(); ctx.arc(cx, cx, size / 2 - 1, 0, 2 * Math.PI); ctx.fillStyle = bg; ctx.fill();
      /* HUD ring: ticks every 5 degrees, longer every 30, turning with the globe */
      ctx.strokeStyle = "rgba(" + holo + ",.32)"; ctx.lineWidth = 1; ctx.beginPath();
      for (i = 0; i < 72; i++) {
        var a = i * 5 * RAD + l0 * 0.5, r1 = R * 1.035, r2 = R * (i % 6 ? 1.06 : 1.085);
        ctx.moveTo(cx + r1 * Math.cos(a), cx + r1 * Math.sin(a)); ctx.lineTo(cx + r2 * Math.cos(a), cx + r2 * Math.sin(a));
      }
      ctx.stroke();
      /* graticule: front lines, and the far side faintly through the glass */
      var front = new Path2D(), back = new Path2D();
      grat.forEach(function (line) {
        var p0 = proj(line[0]);
        for (var k = 1; k < line.length; k++) { var p1 = proj(line[k]), P = (p0[2] > 0 && p1[2] > 0) ? front : back; P.moveTo(p0[0], p0[1]); P.lineTo(p1[0], p1[1]); p0 = p1; }
      });
      ctx.lineWidth = 0.7; ctx.strokeStyle = "rgba(" + holo + ",.05)"; ctx.stroke(back);
      ctx.strokeStyle = "rgba(" + holo + ",.15)"; ctx.stroke(front);
      /* dotted land, four brightness bands by distance from the limb, far side faint */
      var bands = [new Path2D(), new Path2D(), new Path2D(), new Path2D()], far = new Path2D(), d0 = 1.5 * s + 0.4;
      land.forEach(function (q) {
        var p = proj(q);
        if (p[2] < 0) { far.rect(p[0] - 0.5, p[1] - 0.5, 1, 1); return; }
        var b = Math.min(3, Math.floor(p[2] * 4)), d = d0 * (0.55 + 0.45 * p[2]);
        bands[b].rect(p[0] - d / 2, p[1] - d / 2, d, d);
      });
      ctx.fillStyle = "rgba(" + holo + ",.07)"; ctx.fill(far);
      [0.22, 0.38, 0.52, 0.64].forEach(function (al, k) { ctx.fillStyle = "rgba(" + holo + "," + al + ")"; ctx.fill(bands[k]); });
      /* rim glow */
      ctx.save(); ctx.shadowColor = "rgba(" + holo + ",.55)"; ctx.shadowBlur = 16 * s;
      ctx.beginPath(); ctx.arc(cx, cx, R, 0, 2 * Math.PI); ctx.strokeStyle = "rgba(" + holo + ",.55)"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
      /* sweep: a faint band of light passing down the sphere */
      if (!reduce) {
        var y = cx - R + ((t * 0.12) % 1.6) * 2 * R, band = ctx.createLinearGradient(0, y - 30 * s, 0, y + 30 * s);
        band.addColorStop(0, "rgba(" + holo + ",0)"); band.addColorStop(0.5, "rgba(" + holo + ",.07)"); band.addColorStop(1, "rgba(" + holo + ",0)");
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cx, R, 0, 2 * Math.PI); ctx.clip(); ctx.fillStyle = band; ctx.fillRect(0, y - 30 * s, size, 60 * s); ctx.restore();
      }
      /* members: bloom, brighter where they cluster (additive) */
      ctx.globalCompositeOperation = "lighter";
      var gs = 26 * Math.max(0.8, s);
      pts.forEach(function (q) {
        var p = proj(q), tw = reduce ? 1 : 0.82 + 0.18 * Math.sin(t * 2.2 + q[3]);
        if (p[2] < 0) { ctx.globalAlpha = 0.14; ctx.drawImage(glow, p[0] - gs / 4, p[1] - gs / 4, gs / 2, gs / 2); return; }
        ctx.globalAlpha = tw * (0.45 + 0.55 * Math.min(1, p[2] * 3));
        ctx.drawImage(glow, p[0] - gs / 2, p[1] - gs / 2, gs, gs);
      });
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    function tick(now) {
      raf = 0;
      var dt = last ? Math.min(64, now - last) : 0; last = now;
      if (!hover && !drag) lam -= dt * 0.006;            /* 6 degrees a second, west to east like the Earth */
      draw(now);
      if (onScreen && !document.hidden) raf = requestAnimationFrame(tick); else last = 0;
    }
    function go() { if (!reduce && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick); }

    /* drag turns it; touch-action:pan-y keeps vertical swipes scrolling the page */
    cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, l: lam, p: phi }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var k = 180 / size;
      lam = drag.l - (e.clientX - drag.x) * k; phi = Math.max(-60, Math.min(60, drag.p + (e.clientY - drag.y) * k));
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

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: "400px 0px" });
    io.observe(fig);
  } else start();
})();
