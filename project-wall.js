/* THE PROJECT WALL — Buttress OS · Accelerated Experiences LLC · Oct 19 2026.
   Anthony: "those pages are a lot of numbers ... in Sleeves we added tattoos into the system. HUGE!"
   An architecture firm's work is buildings, so the Commissions room opens on the buildings: one card per
   commission with an elevation drawing of that building type, its phase on the AIA rail
   (PD · SD · DD · CD · BID · CA) and how far through the job it is. The drawings are drawn here in code,
   seeded by the commission, in the skin's own ink and brass — original line art, no stock photos.
   window.BProjectWall.render(el, commissions, selId, onPick) */
(function () {
  var RAIL = ["PD", "SD", "DD", "CD", "BID", "CA"];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function rng(seed) { var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }

  /* windows in a grid */
  function grid(x, y, w, h, cols, rows, gap) {
    var s = "", cw = (w - gap * (cols + 1)) / cols, ch = (h - gap * (rows + 1)) / rows;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++)
      s += '<rect x="' + (x + gap + c * (cw + gap)).toFixed(1) + '" y="' + (y + gap + r * (ch + gap)).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ch.toFixed(1) + '" class="pw-g"/>';
    return s;
  }
  function tree(x, g, r) { return '<line x1="' + x + '" y1="' + g + '" x2="' + x + '" y2="' + (g - r * 1.2) + '" class="pw-l"/><circle cx="' + x + '" cy="' + (g - r * 1.9) + '" r="' + r + '" class="pw-t"/>'; }

  /* one elevation per building type — 320 × 180, ground line at 150 */
  var DRAW = {
    Civic: function (R) {
      var w = 150 + R() * 40, x = 160 - w / 2, h = 70 + R() * 15;
      return '<rect x="' + x + '" y="' + (150 - h) + '" width="' + w + '" height="' + h + '" class="pw-b"/>' +
        '<polygon points="' + (x - 8) + ',' + (150 - h) + ' 160,' + (150 - h - 30) + ' ' + (x + w + 8) + ',' + (150 - h) + '" class="pw-r"/>' +
        [0, 1, 2, 3, 4].map(function (i) { var cx = x + 14 + i * (w - 28) / 4; return '<rect x="' + (cx - 4) + '" y="' + (150 - h + 10) + '" width="8" height="' + (h - 10) + '" class="pw-c"/>'; }).join("") +
        '<rect x="148" y="' + (150 - 34) + '" width="24" height="34" class="pw-d"/>' + tree(x - 24, 150, 10) + tree(x + w + 26, 150, 12);
    },
    Healthcare: function (R) {
      var x = 70, w = 180, h = 84;
      return '<rect x="' + x + '" y="' + (150 - h) + '" width="' + w + '" height="' + h + '" class="pw-b"/>' +
        grid(x + 6, 150 - h + 6, w - 12, h - 34, 7, 2, 5) +
        '<rect x="' + (x - 6) + '" y="' + (150 - 26) + '" width="' + (w + 12) + '" height="6" class="pw-r"/>' +
        '<rect x="140" y="' + (150 - 22) + '" width="40" height="22" class="pw-d"/>' +
        '<path d="M206 ' + (150 - h - 14) + 'h8v-8h8v8h8v8h-8v8h-8v-8h-8z" class="pw-a"/>' + tree(46, 150, 11) + tree(276, 150, 9);
    },
    Residential: function (R) {
      var x = 92, w = 120 + R() * 20, h = 52, pk = 40 + R() * 12;
      return '<rect x="' + x + '" y="' + (150 - h) + '" width="' + w + '" height="' + h + '" class="pw-b"/>' +
        '<polygon points="' + (x - 10) + ',' + (150 - h) + ' ' + (x + w * 0.38) + ',' + (150 - h - pk) + ' ' + (x + w + 10) + ',' + (150 - h) + '" class="pw-r"/>' +
        '<rect x="' + (x + w * 0.55) + '" y="' + (150 - h + 10) + '" width="' + (w * 0.36) + '" height="' + (h - 10) + '" class="pw-g"/>' +
        '<rect x="' + (x + 14) + '" y="' + (150 - 30) + '" width="16" height="30" class="pw-d"/>' +
        '<rect x="' + (x + 40) + '" y="' + (150 - h + 12) + '" width="18" height="16" class="pw-g"/>' +
        '<path d="M20 162 Q90 154 160 162 T300 162" class="pw-w"/>' + tree(64, 150, 12) + tree(258, 150, 14);
    },
    Education: function (R) {
      return '<rect x="40" y="96" width="150" height="54" class="pw-b"/>' + grid(44, 100, 142, 30, 6, 1, 5) +
        '<rect x="190" y="74" width="90" height="76" class="pw-b pw-new"/>' + grid(194, 80, 82, 40, 3, 2, 5) +
        '<rect x="100" y="126" width="24" height="24" class="pw-d"/>' +
        '<line x1="236" y1="74" x2="236" y2="48" class="pw-l"/><path d="M236 48h18l-4 5 4 5h-18z" class="pw-a"/>' + tree(22, 150, 9);
    },
    Commercial: function (R) {
      var floors = 4 + Math.floor(R() * 2), fh = 18, top = 150 - floors * fh - 26;
      var s = '<rect x="80" y="' + top + '" width="160" height="' + (150 - top) + '" class="pw-b"/>';
      for (var f = 0; f < floors; f++) s += grid(84, top + 4 + f * fh, 152, fh, 6, 1, 4);
      return s + '<rect x="80" y="124" width="160" height="26" class="pw-g pw-store"/>' +
        '<rect x="74" y="118" width="172" height="6" class="pw-r"/>' + tree(54, 150, 10) + tree(268, 150, 10);
    }
  };
  DRAW.Other = DRAW.Commercial;

  function drawing(x) {
    var R = rng(String(x.id || x.name)), f = DRAW[x.type] || DRAW.Other;
    var done = x.phase === "CA" && Number(x.pctComplete) >= 100;
    /* the drawing gets more "built" as the job moves: SD is a sketch, CD is a full line set, CA is filled in */
    var stage = { PD: "pw-s0", SD: "pw-s1", DD: "pw-s2", CD: "pw-s3", BID: "pw-s3", CA: done ? "pw-s5" : "pw-s4" }[x.phase] || "pw-s2";
    var grid = "";
    for (var gx = 0; gx <= 320; gx += 20) grid += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="180" class="pw-grid"/>';
    for (var gy = 0; gy <= 180; gy += 20) grid += '<line x1="0" y1="' + gy + '" x2="320" y2="' + gy + '" class="pw-grid"/>';
    return '<svg viewBox="0 0 320 180" class="pw-svg ' + stage + '" role="img" aria-label="' + esc(x.type + " building elevation, " + x.name) + '">' +
      grid + '<line x1="10" y1="150" x2="310" y2="150" class="pw-ground"/>' + f(R) + '</svg>';
  }

  function rail(x) {
    var at = RAIL.indexOf(x.phase), done = x.phase === "CA" && Number(x.pctComplete) >= 100;
    return '<div class="pw-rail">' + RAIL.map(function (k, i) {
      var cls = i < at || done ? "past" : i === at ? "now" : "";
      return '<span class="' + cls + '">' + k + '</span>';
    }).join("") + '</div>';
  }

  var CSS = '' +
    '.pw-wall{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin-top:12px}' +
    '.pw-card{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden;cursor:pointer;box-shadow:var(--sh);transition:transform .15s,box-shadow .15s;text-align:left;padding:0;font:inherit;color:inherit}' +
    '.pw-card:hover,.pw-card:focus-visible{transform:translateY(-2px);box-shadow:var(--sh-lg)}' +
    '.pw-card.sel{outline:2px solid var(--brass);outline-offset:-2px}' +
    '.pw-art{background:var(--sunk);position:relative}.pw-svg{display:block;width:100%;height:auto}' +
    '.pw-no{position:absolute;top:8px;left:10px;font:600 11px/1 var(--sans);letter-spacing:.12em;color:var(--mut)}' +
    '.pw-type{position:absolute;top:6px;right:8px;font:600 10px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;background:var(--card);color:var(--mut);border:1px solid var(--line);border-radius:20px;padding:4px 8px}' +
    '.pw-body{padding:10px 12px 12px}.pw-name{font-weight:650;font-size:15px;line-height:1.2}.pw-sub{color:var(--mut);font-size:12.5px;margin-top:2px}' +
    '.pw-rail{display:flex;gap:3px;margin-top:10px}.pw-rail span{flex:1;text-align:center;font:600 10px/1 var(--sans);letter-spacing:.06em;padding:6px 0;border-radius:5px;background:var(--sunk);color:var(--mut)}' +
    '.pw-rail span.past{background:var(--brass-wash);color:var(--brass)}.pw-rail span.now{background:var(--brass);color:#fff}' +
    '.pw-foot{display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--mut)}.pw-foot b{color:var(--ink)}' +
    /* line art in the skin's own colors */
    '.pw-grid{stroke:var(--line);stroke-width:.5;opacity:.7}.pw-ground{stroke:var(--ink);stroke-width:1.6}' +
    '.pw-svg .pw-b,.pw-svg .pw-r,.pw-svg .pw-c,.pw-svg .pw-d,.pw-svg .pw-g{stroke:var(--ink);stroke-width:1.3;fill:none;stroke-linejoin:round}' +
    '.pw-svg .pw-l{stroke:var(--ink);stroke-width:1.2}.pw-svg .pw-t{stroke:var(--good);stroke-width:1.2;fill:none}.pw-svg .pw-w{stroke:var(--a-coord);stroke-width:1.4;fill:none}' +
    '.pw-svg .pw-a{fill:var(--brass);stroke:none}' +
    /* SD: a loose sketch — dashed, light */
    '.pw-s0 .pw-b,.pw-s0 .pw-r,.pw-s0 .pw-c,.pw-s0 .pw-d,.pw-s0 .pw-g,.pw-s1 .pw-b,.pw-s1 .pw-r,.pw-s1 .pw-c,.pw-s1 .pw-d,.pw-s1 .pw-g{stroke-dasharray:5 3;opacity:.75}' +
    '.pw-s0 .pw-g,.pw-s1 .pw-g{opacity:.35}' +
    /* DD/CD: crisp line set; CD adds the brass detail lines */
    '.pw-s3 .pw-r,.pw-s3 .pw-d{stroke:var(--brass)}' +
    /* CA: going up — glass tinted; done: fully rendered */
    '.pw-s4 .pw-g,.pw-s5 .pw-g{fill:var(--a-coord);fill-opacity:.38}.pw-s4 .pw-b,.pw-s5 .pw-b{fill:var(--card)}' +
    '.pw-s4 .pw-r,.pw-s5 .pw-r{fill:var(--brass);fill-opacity:.35}.pw-s5 .pw-t{fill:var(--good);fill-opacity:.25}.pw-s4 .pw-new{stroke-dasharray:4 2}' +
    '.pw-key{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;font-size:12px;color:var(--mut)}' +
    '@media(max-width:560px){.pw-wall{grid-template-columns:1fr 1fr;gap:10px}.pw-body{padding:8px 9px 10px}.pw-name{font-size:13.5px}.pw-sub{font-size:11.5px}.pw-rail{gap:2px}.pw-rail span{font-size:8.5px;padding:5px 0;letter-spacing:0}.pw-foot{flex-direction:column;gap:2px;font-size:11px}.pw-type{display:none}}';

  function css() { if (!document.getElementById("pw-css")) { var st = document.createElement("style"); st.id = "pw-css"; st.textContent = CSS; document.head.appendChild(st); } }
  function render(el, list, selId, onPick) {
    css();
    el.innerHTML = '<div class="pw-wall">' + list.map(function (x) {
      var pct = Math.max(0, Math.min(100, Number(x.pctComplete) || 0));
      return '<button type="button" class="pw-card' + (x.id === selId ? " sel" : "") + '" data-id="' + esc(x.id) + '">' +
        '<div class="pw-art">' + drawing(x) + '<span class="pw-no">' + esc(x.number) + '</span><span class="pw-type">' + esc(x.type) + '</span></div>' +
        '<div class="pw-body"><div class="pw-name">' + esc(x.name) + '</div><div class="pw-sub">' + esc(x.client) + ' · ' + esc(x.lead) + '</div>' +
        rail(x) +
        '<div class="pw-foot"><span><b>' + pct + '%</b> through the job</span><span>Permit: <b>' + esc(x.permit || "—") + '</b></span></div></div></button>';
    }).join("") + '</div>' +
      '<div class="pw-key"><span>Dashed = schematic sketch</span><span>Brass lines = construction documents</span><span>Filled = in construction</span></div>';
    Array.prototype.forEach.call(el.querySelectorAll(".pw-card"), function (b) {
      b.addEventListener("click", function () { onPick && onPick(b.getAttribute("data-id")); });
    });
  }
  window.BProjectWall = { render: render, drawing: drawing, css: css };
})();
