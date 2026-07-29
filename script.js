(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- theme toggle ---------------- */
  (function themeToggle() {
    var root = document.documentElement;
    var btn = document.getElementById("themeToggle");
    var icon = document.getElementById("themeIcon");
    var label = document.getElementById("themeLabel");
    var STORE_KEY = "verif-guide-theme";

    function apply(mode) {
      if (mode === "dark") {
        root.setAttribute("data-theme", "dark");
        icon.textContent = "●";
        label.textContent = "Dark";
        btn.setAttribute("aria-pressed", "true");
      } else if (mode === "light") {
        root.setAttribute("data-theme", "light");
        icon.textContent = "○";
        label.textContent = "Light";
        btn.setAttribute("aria-pressed", "true");
      } else {
        root.removeAttribute("data-theme");
        icon.textContent = "◐";
        label.textContent = "Auto";
        btn.setAttribute("aria-pressed", "false");
      }
    }

    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    apply(saved);

    btn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || "auto";
      var next = current === "auto" ? "dark" : current === "dark" ? "light" : "auto";
      apply(next);
      try {
        if (next === "auto") localStorage.removeItem(STORE_KEY);
        else localStorage.setItem(STORE_KEY, next);
      } catch (e) {}
    });
  })();

  /* ---------------- scroll-spy top nav ---------------- */
  (function scrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll("#topnav a"));
    if (!links.length) return;
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = "#" + entry.target.id;
          var link = links.find(function (a) { return a.getAttribute("href") === id; });
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (a) { a.classList.remove("active"); });
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { io.observe(s); });
  })();

  /* ---------------- tabs (flow-tabs, hack-tabs) ---------------- */
  // flow tabs
  (function () {
    var tabs = document.querySelectorAll(".flow-tabs button");
    var panels = document.querySelectorAll(".flow-panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        var target = tab.getAttribute("data-target");
        panels.forEach(function (p) {
          var match = p.id === target;
          p.classList.toggle("active", match);
          p.hidden = !match;
        });
      });
    });
  })();

  // hack tabs
  (function () {
    var tabs = document.querySelectorAll(".hack-tabs button");
    var panels = { server: document.getElementById("hack-server"), local: document.getElementById("hack-local") };
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        var key = tab.getAttribute("data-hack");
        Object.keys(panels).forEach(function (k) {
          var match = k === key;
          panels[k].classList.toggle("active", match);
          panels[k].hidden = !match;
        });
      });
    });
  })();

  /* ---------------- step-through flow component ---------------- */
  function initFlow(flowEl) {
    var stage = flowEl.querySelector(".flow__stage");
    var stepEls = Array.prototype.slice.call(stage.querySelectorAll("[data-step]"));
    var maxStep = stepEls.reduce(function (m, el) {
      return Math.max(m, parseInt(el.getAttribute("data-step"), 10));
    }, 0);
    var n = maxStep + 1;

    var stepsList = flowEl.parentElement.querySelector(".flow-steps");
    var items = stepsList ? Array.prototype.slice.call(stepsList.children) : [];

    var captionNo = flowEl.querySelector(".flow__caption .step-no");
    var captionTxt = flowEl.querySelector(".flow__caption .txt");
    var dotsWrap = flowEl.querySelector(".flow__dots");
    var prevBtn = flowEl.querySelector(".prev");
    var nextBtn = flowEl.querySelector(".next");

    var current = 0;

    // build dots
    dotsWrap.innerHTML = "";
    for (var i = 0; i < n; i++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to step " + (i + 1) + " of " + n);
      (function (idx) {
        dot.addEventListener("click", function () { render(idx); });
      })(i);
      dotsWrap.appendChild(dot);
    }

    function render(idx) {
      current = Math.max(0, Math.min(n - 1, idx));

      stepEls.forEach(function (el) {
        var step = parseInt(el.getAttribute("data-step"), 10);
        el.classList.remove("done", "on", "warn-on", "danger-on");
        if (step < current) {
          el.classList.add("done");
        } else if (step === current) {
          var emphasis = el.getAttribute("data-emphasis") || "on";
          el.classList.add(emphasis === "warn" ? "warn-on" : emphasis === "danger" ? "danger-on" : "on");
        }
      });

      if (items[current]) {
        captionTxt.innerHTML = items[current].innerHTML;
      }
      captionNo.textContent = String(current + 1);

      Array.prototype.slice.call(dotsWrap.children).forEach(function (d, i) {
        d.classList.toggle("active", i === current);
      });

      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === n - 1;
      nextBtn.textContent = current === n - 1 ? "Done ✓" : "Next →";
    }

    prevBtn.addEventListener("click", function () { render(current - 1); });
    nextBtn.addEventListener("click", function () { render(current + 1); });

    flowEl.setAttribute("tabindex", "0");
    flowEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { render(current + 1); }
      if (e.key === "ArrowLeft") { render(current - 1); }
    });

    render(0);
  }

  Array.prototype.slice.call(document.querySelectorAll(".flow[data-flow]")).forEach(initFlow);

  /* ---------------- hero micro-demo ---------------- */
  (function microDemo() {
    var btn = document.getElementById("microDemoBtn");
    var stateA = document.getElementById("md-a-state");
    var stateB = document.getElementById("md-b-state");
    var edge = document.getElementById("md-edge");
    var caption = document.getElementById("md-caption");
    var boxA = document.querySelector("#md-a rect");
    var boxB = document.querySelector("#md-b rect");
    if (!btn) return;

    var verified = false;
    function setState(v) {
      verified = v;
      if (v) {
        stateA.textContent = "verified ✓";
        stateB.textContent = "verified ✓";
        stateA.setAttribute("fill", "var(--accent)");
        stateB.setAttribute("fill", "var(--accent)");
        edge.classList.add("on");
        caption.textContent = "keys match — signed";
        boxA.classList.add("on");
        boxB.classList.add("on");
        btn.textContent = "Reset demo";
      } else {
        stateA.textContent = "not verified";
        stateB.textContent = "not verified";
        stateA.setAttribute("fill", "var(--ink-dim)");
        stateB.setAttribute("fill", "var(--ink-dim)");
        edge.classList.remove("on");
        caption.textContent = "keys match?";
        boxA.classList.remove("on");
        boxB.classList.remove("on");
        btn.textContent = "Compare keys";
      }
    }
    setState(false);
    btn.addEventListener("click", function () { setState(!verified); });
  })();

  /* ---------------- fake row demo (illustrative only) ---------------- */
  (function fakeRowDemo() {
    var btn = document.getElementById("fakeRowBtn");
    var log = document.getElementById("fakeRowLog");
    if (!btn) return;

    var lines = [
      { text: "$ admin inserts a row into e2e_cross_signing_keys …", cls: "dim" },
      { text: "row saved. keydata = arbitrary bytes, no matching private key.", cls: "dim" },
      { text: "a real client fetches it and checks the signature chain…", cls: "dim" },
      { text: "✕ signature does not verify against any known identity", cls: "bad" },
      { text: "result: client shows this as untrusted / broken — never “verified”.", cls: "ok" }
    ];

    var running = false;
    btn.addEventListener("click", function () {
      if (running) return;
      running = true;
      btn.disabled = true;
      log.innerHTML = "";
      var delay = 0;
      lines.forEach(function (l, i) {
        setTimeout(function () {
          var div = document.createElement("div");
          div.className = "line " + l.cls;
          div.textContent = l.text;
          if (reduceMotion) { div.style.animation = "none"; div.style.opacity = "1"; }
          log.appendChild(div);
          if (i === lines.length - 1) {
            running = false;
            btn.disabled = false;
            btn.textContent = "Run it again";
          }
        }, reduceMotion ? 0 : delay);
        delay += 550;
      });
    });
  })();

  /* ---------------- Oct 2026 countdown ---------------- */
  (function countdown() {
    var el = document.getElementById("countdownNum");
    if (!el) return;
    var deadline = new Date(Date.UTC(2026, 9, 31, 23, 59, 59)); // end of October 2026
    var now = new Date();
    var days = Math.max(0, Math.ceil((deadline - now) / 86400000));
    var label = el.querySelector("span");
    el.childNodes[0].nodeValue = String(days);
    if (!label) return;
  })();
})();
