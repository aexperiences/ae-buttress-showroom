/* THE SHEET WALL — Buttress OS · Accelerated Experiences LLC · Oct 20 2026.
   Anthony: "Fix buttress so that is pimp i need to blast." Sheet Sets was a list of sheet numbers; an architect's set is
   drawings. Each sheet on the index is drawn as a small sheet: the drawing its sheet-type digit calls for (1 plans,
   2 elevations, 3 sections, 4 large-scale, 5 details, 6 schedules), a right-hand title block carrying the project, the
   sheet number, the title, the revision and the set it last went out in. All of it read from the sheet record; the
   line art is drawn here in code, in the skin's own ink and brass.
   window.BSheetWall.render(el, sheets, opts)   opts: { limit, firm } */
(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function rng(seed) { var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
  var L = function (x1, y1, x2, y2, c) { return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="' + (c || "sw-l") + '"/>'; };
  var Rc = function (x, y, w, h, c) { return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" class="' + (c || "sw-l") + '"/>'; };

  /* the drawing field is 10..170 × 10..110 — the title block sits at 176..236 */
  var ART = {
    "1": function (R) { /* plan: an outline, interior walls, doors swinging, a grid bubble row */
      var s = Rc(22, 22, 136, 78, "sw-w"), cols = 2 + Math.floor(R() * 2), rows = 2;
      for (var i = 1; i < cols; i++) s += L(22 + i * 136 / cols, 22, 22 + i * 136 / cols, 100, "sw-wi");
      s += L(22, 22 + 78 / rows, 158, 22 + 78 / rows, "sw-wi");
      for (var d = 0; d < cols; d++) { var dx = 30 + d * 136 / cols; s += '<path d="M' + dx + ' ' + (61) + ' a10 10 0 0 1 10 -10" class="sw-door"/>'; }
      for (var g = 0; g <= 4; g++) { var gx = 22 + g * 34; s += L(gx, 14, gx, 22, "sw-grid") + '<circle cx="' + gx + '" cy="11" r="3.4" class="sw-bub"/>'; }
      return s + '<path d="M150 106 l6 -10 l6 10 z" class="sw-n"/>';
    },
    "2": function (R) { /* elevation: a building face, glazing, the ground line, level datums */
      var w = 110 + R() * 20, x = 90 - w / 2, h = 50 + R() * 16, s = L(14, 100, 166, 100, "sw-g");
      s += Rc(x, 100 - h, w, h, "sw-w") + L(x - 6, 100 - h, x + w + 6, 100 - h, "sw-w");
      var n = 5 + Math.floor(R() * 3);
      for (var i = 0; i < n; i++) s += Rc(x + 6 + i * (w - 12) / n, 100 - h + 10, (w - 12) / n - 4, h * .45, "sw-gl");
      s += Rc(x + w / 2 - 7, 100 - 22, 14, 22, "sw-acc");
      return s + L(10, 100 - h, 16, 100 - h, "sw-acc") + '<text x="10" y="' + (96 - h) + '" class="sw-t">LVL 2</text>';
    },
    "3": function (R) { /* building section: floors, roof, the cut in heavy line, people for scale */
      var s = L(14, 100, 166, 100, "sw-g");
      s += '<path d="M28 100 V38 L90 22 L152 38 V100" class="sw-w"/>' + L(28, 68, 152, 68, "sw-w") + L(28, 40, 152, 40, "sw-wi");
      for (var i = 0; i < 3; i++) s += '<circle cx="' + (50 + i * 34) + '" cy="88" r="2.2" class="sw-l"/>' + L(50 + i * 34, 90, 50 + i * 34, 99);
      return s + '<path d="M100 100 v8 h12 v-8" class="sw-hatch"/>';
    },
    "4": function (R) { return ART["1"](R) + Rc(60, 40, 48, 36, "sw-acc"); },
    "5": function (R) { /* wall section detail: layered wall, insulation batt, footing, a leader with a tag */
      var s = "";
      ["sw-w", "sw-wi", "sw-ins", "sw-wi", "sw-w"].forEach(function (c, i) { s += Rc(70 + i * 8, 18, 8, 72, c); });
      s += '<path d="M86 22 q4 4 0 8 q-4 4 0 8 q4 4 0 8 q-4 4 0 8 q4 4 0 8 q-4 4 0 8 q4 4 0 8 q-4 4 0 8" class="sw-ins2"/>';
      s += Rc(58, 90, 64, 12, "sw-w") + L(40, 104, 140, 104, "sw-g");
      s += L(118, 40, 146, 30, "sw-acc") + '<circle cx="152" cy="28" r="7" class="sw-bub"/><text x="148.5" y="31" class="sw-t">3</text>';
      return s;
    },
    "6": function (R) { /* schedule: a ruled table with a header band */
      var s = Rc(20, 18, 140, 84, "sw-w") + Rc(20, 18, 140, 10, "sw-hd");
      for (var r = 1; r < 8; r++) s += L(20, 28 + r * 9.3, 160, 28 + r * 9.3, "sw-wi");
      [52, 86, 112, 136].forEach(function (x) { s += L(x, 18, x, 102, "sw-wi"); });
      return s;
    }
  };
  ART["0"] = ART["6"]; ART["9"] = ART["2"];

  function cut(t, n) { t = String(t || ""); return t.length > n ? t.slice(0, n - 1).replace(/[\s&·,-]+$/, "") + "…" : t; }
  function sheet(x, firm) {
    var digit = String(x.num || "").replace(/^[A-Z]+-?/, "").charAt(0) || "1", R = rng(String(x.id || x.num));
    var art = (ART[digit] || ART["1"])(R);
    var revs = Math.max(0, Number(x.rev) || 0), clouds = "";
    for (var i = 0; i < Math.min(revs, 3); i++) clouds += '<path d="M' + (182 + i * 14) + ' 22 l5 -8 l5 8 z" class="sw-rev"/><text x="' + (185.2 + i * 14) + '" y="21" class="sw-rt">' + (revs - i) + '</text>';
    return '<svg viewBox="0 0 240 120" class="sw-svg" role="img" aria-label="' + esc(x.num + " " + x.title + ", " + x.project) + '">' +
      '<rect x="2" y="2" width="236" height="116" class="sw-sheet"/>' + Rc(6, 6, 228, 108, "sw-border") + art +
      L(176, 6, 176, 114, "sw-border") + clouds +
      '<text x="181" y="40" class="sw-firm">' + esc(firm) + '</text>' +
      '<text x="181" y="52" class="sw-proj">' + esc(cut(x.project, 19)) + '</text>' +
      L(176, 58, 234, 58, "sw-border") +
      '<text x="181" y="70" class="sw-tt">' + esc(cut(x.title, 17)) + '</text>' +
      '<text x="181" y="80" class="sw-set">' + esc(x.issued || "") + '</text>' +
      L(176, 86, 234, 86, "sw-border") +
      '<text x="205" y="106" class="sw-num">' + esc(x.num) + '</text></svg>';
  }

  var CSS = '' +
    '.sw-wall{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;margin-top:12px}' +
    '.sw-item{margin:0}.sw-svg{display:block;width:100%;height:auto;border-radius:6px;box-shadow:var(--sh);background:var(--card)}' +
    '.sw-cap{display:flex;justify-content:space-between;gap:8px;margin-top:6px;font-size:12px;color:var(--mut)}.sw-cap b{color:var(--ink);font-weight:650}' +
    '.sw-sheet{fill:var(--card);stroke:var(--line);stroke-width:1}.sw-border{fill:none;stroke:var(--ink);stroke-width:.9}' +
    '.sw-l,.sw-wi,.sw-w,.sw-g,.sw-gl,.sw-acc,.sw-hatch,.sw-door,.sw-ins,.sw-ins2,.sw-hd,.sw-grid,.sw-bub,.sw-n{fill:none;stroke-linejoin:round}' +
    '.sw-l{stroke:var(--ink);stroke-width:.8}.sw-w{stroke:var(--ink);stroke-width:1.8}.sw-wi{stroke:var(--ink);stroke-width:.8}' +
    '.sw-g{stroke:var(--ink);stroke-width:1.4}.sw-gl{stroke:var(--a-coord);stroke-width:.9;fill:var(--a-coord);fill-opacity:.12}' +
    '.sw-acc{stroke:var(--brass);stroke-width:1.2}.sw-door{stroke:var(--mut);stroke-width:.7;stroke-dasharray:2 1.5}' +
    '.sw-grid{stroke:var(--mut);stroke-width:.5;stroke-dasharray:3 2}.sw-bub{stroke:var(--ink);stroke-width:.8;fill:var(--card)}' +
    '.sw-n{fill:var(--ink);stroke:none}.sw-hatch{stroke:var(--mut);stroke-width:.8}.sw-ins{stroke:var(--ink);stroke-width:.6;fill:var(--brass-wash)}' +
    '.sw-ins2{stroke:var(--brass);stroke-width:.8}.sw-hd{stroke:var(--ink);stroke-width:.8;fill:var(--sunk)}' +
    '.sw-rev{fill:none;stroke:var(--bad);stroke-width:.9}.sw-rt{font:700 5.5px var(--sans);fill:var(--bad)}' +
    '.sw-t{font:600 5px var(--sans);fill:var(--mut)}.sw-firm{font:700 5.4px var(--sans);fill:var(--mut);letter-spacing:.06em;text-transform:uppercase}' +
    '.sw-proj{font:600 5.6px var(--sans);fill:var(--ink)}.sw-tt{font:700 6px var(--sans);fill:var(--ink)}.sw-set{font:600 5px var(--sans);fill:var(--brass)}' +
    '.sw-num{font:800 13px var(--sans);fill:var(--ink);text-anchor:middle;letter-spacing:-.02em}' +
    '@media(max-width:560px){.sw-wall{grid-template-columns:1fr 1fr;gap:10px}.sw-cap{font-size:11px;flex-direction:column;gap:0}}';

  function render(el, list, opts) {
    opts = opts || {};
    if (!document.getElementById("sw-css")) { var st = document.createElement("style"); st.id = "sw-css"; st.textContent = CSS; document.head.appendChild(st); }
    var items = (list || []).slice(0, opts.limit || 999);
    el.innerHTML = '<div class="sw-wall">' + items.map(function (x) {
      return '<figure class="sw-item">' + sheet(x, opts.firm || "Your firm") +
        '<figcaption class="sw-cap"><span><b>' + esc(x.num) + '</b> ' + esc(x.title) + '</span><span>Rev ' + esc(x.rev) + ' · ' + esc(x.date || "") + '</span></figcaption></figure>';
    }).join("") + '</div>';
  }
  window.BSheetWall = { render: render, sheet: sheet };
})();
