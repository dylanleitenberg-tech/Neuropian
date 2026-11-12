/* Interview invite (2026-11-11: "a special page only available to the accounts we offer. They connect git, open
   interview page from some pop up"). When a signed-in member has a pending recorded interview, this shows one pop-up
   ("Start" opens /interview, "Later" hides it for 12 hours) and adds an "Your interview" link to the account card (home,
   Talent, Hire) or the members-app nav. Everyone else sees nothing: the `interview` function answers {invited:false}
   unless the caller's GitHub identity matches an invite. Never runs inside the sign-in frame or on /interview itself. */
(function () {
  "use strict";
  if (window.top !== window || /^\/interview(\.html)?\/?$/.test(location.pathname)) return;
  var K = "sb-qggduzzwvdkmekihwuav-auth-token", API = "https://qggduzzwvdkmekihwuav.supabase.co",
      KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZ2R1enp3dmRrbWVraWh3dWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTAyNzgsImV4cCI6MjA5MzM4NjI3OH0.xoF8SE1dg-L-nh0SErgLPm9dWpSFAa1O-9bqduyijkw";
  var LATER = "np_iv_later", LATER_MS = 12 * 3600 * 1000;
  var invite = null, checkedFor = null, busy = false, pop = null, fails = 0;

  function stored() {
    try { var s = JSON.parse(localStorage.getItem(K) || "null"); s = s && (s.currentSession || s); return s && s.access_token && s.user && s.user.id ? s : null; }
    catch (e) { return null; }
  }
  // The members app keeps its session fresh (supabase-js); elsewhere use the saved session if it hasn't expired.
  function token() {
    try {
      if (typeof sb !== "undefined" && sb && sb.auth && sb.auth.getSession)
        return sb.auth.getSession().then(function (r) { var s = r && r.data && r.data.session; return s ? { t: s.access_token, u: s.user.id } : null; });
    } catch (e) {}
    var s = stored();
    if (!s || (s.expires_at && s.expires_at * 1000 < Date.now() + 30000)) return Promise.resolve(null);
    return Promise.resolve({ t: s.access_token, u: s.user.id });
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function forWhat(d) { return d.role ? d.role + " at " + d.company : d.company; }

  function check() {
    var s = stored(), uid = s ? s.user.id : null;
    if (!uid) { if (checkedFor || invite) { checkedFor = null; invite = null; clear(); } return; }
    if (busy || uid === checkedFor || fails > 4) return;
    busy = true;
    token().then(function (tk) {
      if (!tk) return null;
      return fetch(API + "/functions/v1/interview", {
        method: "POST", headers: { "Content-Type": "application/json", apikey: KEY, Authorization: "Bearer " + tk.t },
        body: JSON.stringify({ action: "invite" })
      }).then(function (r) { if (!r.ok) { if (r.status !== 401) fails++; return null; } return r.json().then(function (d) { return { u: tk.u, d: d }; }); });
    }).then(function (x) {
      busy = false;
      if (!x) return;
      checkedFor = x.u; fails = 0;
      invite = x.d && x.d.invited ? x.d : null;
      if (invite) { links(); offer(); } else clear();
    }).catch(function () { busy = false; fails++; });
  }

  function later(uid) { try { var v = JSON.parse(localStorage.getItem(LATER) || "null"); return v && v.u === uid && Date.now() - v.t < LATER_MS; } catch (e) { return false; } }
  function setLater() { try { localStorage.setItem(LATER, JSON.stringify({ u: checkedFor, t: Date.now() })); } catch (e) {} }

  function css() {
    if (document.getElementById("npiv-css")) return;
    var st = document.createElement("style"); st.id = "npiv-css";
    st.textContent =
      ".npiv-ov{position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding:76px 16px 16px;overflow:auto;background:rgba(236,232,227,.7);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}" +
      ".npiv{position:relative;width:min(440px,100%);background:#ECE8E3;color:#2B2A28;border:1px solid rgba(43,42,40,.2);box-shadow:0 30px 80px rgba(0,0,0,.35);padding:26px 28px 22px;font-family:'EB Garamond',Garamond,Georgia,serif}" +
      ".npiv:focus{outline:none}" +
      ".npiv-k{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:rgba(43,42,40,.76);margin:0}" +
      ".npiv h2{font-family:'DM Serif Display',Georgia,serif;font-weight:400;text-transform:none;font-size:clamp(26px,5vw,32px);line-height:1.12;margin:10px 0 0;letter-spacing:-.01em;color:inherit;max-width:none;width:auto}" +
      ".npiv p.npiv-t{margin:12px 0 0;font-size:17px;line-height:1.5;color:rgba(43,42,40,.82)}" +
      ".npiv-b{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}" +
      ".npiv-b a,.npiv-b button{font:inherit;font-size:18px;font-weight:500;padding:11px 24px;border-radius:0;cursor:pointer;text-decoration:none;border:1px solid #2B4C7E}" +
      ".npiv-go{background:#2B4C7E;color:#F3F0EB}.npiv-no{background:transparent;color:#2B2A28;border-color:rgba(43,42,40,.35)!important}" +
      ".npiv a:focus-visible,.npiv button:focus-visible{outline:2px solid #2B4C7E;outline-offset:2px}" +
      ".npiv-nav{display:inline-block;margin-right:.6rem;padding:.25rem .6rem;border:1px solid #2B4C7E;color:#2B4C7E;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:.46rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase}" +
      ".npiv-mnav{display:block;padding:.9rem 1.6rem;color:#2B4C7E;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase}" +
      "@media (max-width:560px){.npiv-b a,.npiv-b button{flex:1 1 100%;text-align:center}}";
    document.head.appendChild(st);
  }

  // The pop-up. Waits while another dialog that must come first is up (the app's terms step or sign-in box).
  function offer() {
    if (!invite || pop || later(checkedFor)) return;
    var tg = document.getElementById("terms-gate"), ag = document.getElementById("auth-gate");
    var pm = document.getElementById("set-password-modal");
    var busyUi = (tg && getComputedStyle(tg).display !== "none") || (ag && ag.classList.contains("show")) ||
                 (pm && getComputedStyle(pm).display === "flex");
    if (busyUi) { setTimeout(offer, 1500); return; }
    css();
    var d = invite;
    pop = document.createElement("div"); pop.className = "npiv-ov";
    pop.innerHTML = '<div class="npiv" role="dialog" aria-modal="true" aria-labelledby="npiv-h" tabindex="-1">' +
      '<p class="npiv-k">' + (d.started ? "Interview in progress" : "Interview invitation") + '</p>' +
      '<h2 id="npiv-h">You’re invited to a ~' + esc(d.minutes) + '-minute recorded interview for ' + esc(forWhat(d)) + '.</h2>' +
      '<p class="npiv-t">' + (d.started ? "You can pick up where you left off." : "Do it whenever suits you: the questions appear one at a time once recording starts. You’ll need a camera and microphone.") + '</p>' +
      '<div class="npiv-b"><a class="npiv-go" href="/interview">' + (d.started ? "Continue" : "Start") + '</a><button type="button" class="npiv-no">Later</button></div></div>';
    document.body.appendChild(pop);
    pop.addEventListener("click", function (e) { if (e.target === pop || e.target.closest(".npiv-no")) { setLater(); unpop(); } });
    pop.querySelector(".npiv").focus({ preventScroll: true });
  }
  function unpop() { if (pop) { pop.remove(); pop = null; } }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && pop) { setLater(); unpop(); } });

  // Link in the account card (home / Talent / Hire) and in the members-app nav, while the invite is pending.
  function cardLink(root) {
    var l = root.querySelector && root.querySelector(".npac-l");
    if (!l || l.querySelector(".npiv-cl")) return;
    var a = document.createElement("a"); a.className = "npiv-cl"; a.href = "/interview";
    a.innerHTML = "Your interview<span>~" + esc(invite.minutes) + " minutes, recorded, for " + esc(forWhat(invite)) + "</span>";
    l.insertBefore(a, l.firstChild);
  }
  function links() {
    if (!invite) return;
    css();
    document.querySelectorAll(".npac-ov").forEach(cardLink);
    var nu = document.getElementById("nav-user");
    if (nu && !document.getElementById("npiv-nav")) {
      var a = document.createElement("a"); a.id = "npiv-nav"; a.className = "npiv-nav"; a.href = "/interview"; a.textContent = "Your interview";
      nu.parentNode.insertBefore(a, nu);
    }
    var mu = document.getElementById("mobile-nav-user");
    if (mu && !document.getElementById("npiv-mnav")) {
      var m = document.createElement("a"); m.id = "npiv-mnav"; m.className = "npiv-mnav"; m.href = "/interview"; m.textContent = "Your interview";
      mu.parentNode.insertBefore(m, mu);
    }
  }
  function clear() {
    unpop();
    document.querySelectorAll(".npiv-cl,#npiv-nav,#npiv-mnav").forEach(function (el) { el.remove(); });
  }
  new MutationObserver(function (ms) {
    if (!invite) return;
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1 && n.classList.contains("npac-ov")) cardLink(n); }); });
  }).observe(document.body, { childList: true });

  window.addEventListener("storage", function (e) { if (e.key === K) check(); });
  window.addEventListener("message", function (e) { if (e.origin === location.origin && e.data && e.data.type === "np-auth-done") setTimeout(check, 400); });
  setInterval(check, 3000);
  check();
})();
