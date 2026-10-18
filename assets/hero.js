/* Neuropian hero: one light per person Falcon found (aggregate counts by project; no names, no profiles). */
(function () {
  "use strict";
  var G = [["LLVM",350],["vLLM",347],["Rust",171],["llama.cpp",101],["Godot",93],["CPython",92],["ClickHouse",80],["Ray",69],["DuckDB",59],["Transformers",51],["pandas",48],["Ruff",45],["Neovim",42],["Ladybird",32],["SymPy",31],["Triton",30],["Polars",29],["JAX",23],["NumPy",23],["Arrow",23],["Deno",18],["SciPy",16],["Tokio",16],["Julia",15],["tinygrad",15],["Helix",13],["scikit-learn",11],["Matplotlib",8],["Numba",3],["Dask",2],["mathlib",1]], TOTAL = 1857;
  var hero = document.querySelector(".hero"), cv = hero && hero.querySelector("canvas.field");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d"), lab = hero.querySelector(".field-label");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, DPR = 1, pts = [], clusters = [], mouse = { x: -1e4, y: -1e4 }, hot = -1, pulse = -1, pulseT = 0, running = false, raf = 0;
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function gauss() { return Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(6.2832 * rnd()); }

  function layout() {
    var r = hero.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed = 7; pts = []; clusters = [];
    var narrow = W < 760, x0 = narrow ? W * 0.06 : W * 0.46, x1 = W * 0.97, y0 = H * 0.1, y1 = H * 0.92, scale = Math.sqrt((x1 - x0) * (y1 - y0)) / 70;
    // place clusters biggest first, keeping them apart
    G.forEach(function (g, k) {
      var rad = Math.max(10, Math.sqrt(g[1]) * scale * 0.55), best = null, bestD = -1;
      for (var t = 0; t < 40; t++) {
        var c = { x: x0 + rad + rnd() * (x1 - x0 - 2 * rad), y: y0 + rad + rnd() * (y1 - y0 - 2 * rad) }, d = 1e9;
        clusters.forEach(function (o) { d = Math.min(d, Math.hypot(o.x - c.x, o.y - c.y) - o.r - rad); });
        if (d > bestD) { bestD = d; best = c; }
      }
      best.r = rad; best.name = g[0]; best.n = g[1]; best.k = k; clusters.push(best);
      for (var i = 0; i < g[1]; i++) {
        var a = rnd() * 6.2832, d2 = Math.abs(gauss()) * rad * 0.5;
        pts.push({ c: k, bx: best.x + Math.cos(a) * d2, by: best.y + Math.sin(a) * d2, ph: rnd() * 6.2832, sp: 0.4 + rnd() * 0.8, s: 0.8 + rnd() * 1.1 });
      }
    });
    // one link per point to its nearest neighbour in the same cluster (a faint web)
    var byC = {};
    pts.forEach(function (p, i) { (byC[p.c] = byC[p.c] || []).push(i); });
    Object.keys(byC).forEach(function (c) {
      var ids = byC[c];
      ids.forEach(function (i) {
        var p = pts[i], bd = 1e9, bj = -1;
        for (var q = 0; q < ids.length; q += Math.max(1, (ids.length / 60) | 0)) {
          var j = ids[q]; if (j === i) continue;
          var dd = (pts[j].bx - p.bx) * (pts[j].bx - p.bx) + (pts[j].by - p.by) * (pts[j].by - p.by);
          if (dd < bd) { bd = dd; bj = j; }
        }
        p.link = bj;
      });
    });
  }

  function frame(t) {
    var tt = t / 1000;
    ctx.clearRect(0, 0, W, H);
    hot = -1;
    clusters.forEach(function (c) { if (Math.hypot(mouse.x - c.x, mouse.y - c.y) < c.r * 1.1 + 14) hot = c.k; });
    if (!reduce && tt - pulseT > 2.6) { pulseT = tt; pulse = (Math.random() * Math.min(12, clusters.length)) | 0; }
    var lit = hot >= 0 ? hot : pulse, fade = hot >= 0 ? 1 : Math.max(0, 1 - (tt - pulseT) / 2.4);
    ctx.lineWidth = 0.6;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], m = reduce ? 0 : 1;
      p.x = p.bx + m * Math.sin(tt * p.sp + p.ph) * 3.2; p.y = p.by + m * Math.cos(tt * p.sp * 0.8 + p.ph) * 3.2;
      var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 9000) { var f = (1 - d2 / 9000) * 10; p.x += dx / Math.sqrt(d2 + 1) * f; p.y += dy / Math.sqrt(d2 + 1) * f; }
    }
    for (i = 0; i < pts.length; i++) {
      p = pts[i]; if (p.link < 0) continue; var o = pts[p.link], on = p.c === lit;
      ctx.strokeStyle = on ? "rgba(159,239,255," + (0.18 + 0.4 * fade) + ")" : "rgba(111,214,247,0.07)";
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(o.x, o.y); ctx.stroke();
    }
    for (i = 0; i < pts.length; i++) {
      p = pts[i]; on = p.c === lit;
      var tw = reduce ? 0.75 : 0.55 + 0.45 * Math.sin(tt * 2 * p.sp + p.ph);
      ctx.fillStyle = on ? "rgba(214,248,255," + (0.55 + 0.45 * fade) + ")" : "rgba(111,214,247," + (0.25 + 0.45 * tw) + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, on ? p.s * (1 + 0.6 * fade) : p.s, 0, 6.2832); ctx.fill();
    }
    if (lab) {
      var c = clusters[lit];
      if (c && (hot >= 0 || fade > 0.05)) {
        lab.textContent = c.name + " · " + c.n + (c.n === 1 ? " person" : " people");
        lab.style.opacity = hot >= 0 ? 1 : fade;
        var lw = lab.offsetWidth || 150, lx = c.x + c.r + 10; if (lx + lw > W - 8) lx = Math.max(8, c.x - c.r - 10 - lw);
        lab.style.transform = "translate(" + Math.round(lx) + "px," + Math.round(Math.min(H - 40, Math.max(8, c.y - 10))) + "px)";
      } else lab.style.opacity = 0;
    }
    if (running && !reduce) raf = requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  layout(); frame(0);
  if (!reduce) {
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(hero);
    else start();
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }
  hero.addEventListener("pointermove", function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; if (reduce) frame(performance.now()); });
  hero.addEventListener("pointerleave", function () { mouse.x = mouse.y = -1e4; });
  var rt = 0; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { layout(); frame(performance.now()); }, 150); });
})();
