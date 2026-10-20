/* BUTTRESS VISUALS — Accelerated Experiences LLC · Oct 20 2026.
   Anthony: "Make it pretty. Just get it done." The four rooms that opened on number tiles now open on a picture of the
   same numbers, read from the same records:
     BVis.feeSplit(el, d)   Fee & Proposal — the proposal that is out, its fee split across the AIA phases (B.PHASES)
     BVis.ballBoard(el, d)  CA Desk — every open RFI / submittal / ASI in the lane of whoever holds the ball, aged
     BVis.arAging(el, d)    Billing — unpaid invoices stacked by age bucket, and each invoice as a bar
     BVis.dials(el)         Multipliers — each firm KPI on a dial against its sourced target band (B.kpis, B.BENCH)
   Colors come from the skin's tokens, so every skin repaints them. */
(function () {
  var B = window.Buttress;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var money = function (n) { return B && B.money ? B.money(n) : "$" + Math.round(n).toLocaleString("en-US"); };
  var PH = ["var(--a-pursuits)", "var(--a-studio)", "var(--a-coord)", "var(--brass)", "var(--a-standards)", "var(--a-ca)"];

  var CSS = '' +
    '.bv-card{margin-bottom:14px}.bv-sub{color:var(--mut);font-size:13px;margin:4px 0 12px}' +
    '.bv-split{display:flex;height:46px;border-radius:10px;overflow:hidden;box-shadow:var(--sh)}' +
    '.bv-split div{display:flex;align-items:center;justify-content:center;color:#fff;font:700 12px var(--sans);min-width:0;white-space:nowrap;overflow:hidden}' +
    '.bv-legend{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:12px}' +
    '.bv-leg{display:grid;grid-template-columns:12px 1fr;gap:4px 8px;font-size:12.5px}.bv-leg i{width:12px;height:12px;border-radius:3px;margin-top:3px}' +
    '.bv-leg b{font-size:14px;font-variant-numeric:tabular-nums}.bv-leg span{grid-column:2;color:var(--mut)}' +
    '.bv-lanes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}' +
    '.bv-lane{background:var(--sunk);border-radius:12px;padding:10px;min-height:120px}' +
    '.bv-lane h4{margin:0 0 8px;font:700 11px var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--mut);display:flex;justify-content:space-between}' +
    '.bv-lane.us{outline:2px solid var(--brass);outline-offset:-2px}.bv-lane.us h4{color:var(--brass)}' +
    '.bv-item{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--good);border-radius:8px;padding:8px 9px;margin-bottom:8px;box-shadow:var(--sh)}' +
    '.bv-item.watch{border-left-color:var(--watch)}.bv-item.bad{border-left-color:var(--bad)}' +
    '.bv-item b{font:700 11px var(--sans);letter-spacing:.04em;color:var(--mut)}.bv-item div{font-size:12.5px;font-weight:600;line-height:1.3;margin-top:2px}' +
    '.bv-age{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;color:var(--mut)}.bv-age em{flex:1;height:5px;border-radius:5px;background:var(--sunk);overflow:hidden;font-style:normal}' +
    '.bv-age em i{display:block;height:100%;background:currentColor}' +
    '.bv-bars{display:grid;gap:8px;margin-top:14px}.bv-bar{display:grid;grid-template-columns:minmax(0,200px) minmax(0,1fr) 84px;gap:10px;align-items:center;font-size:12.5px}' +
    '.bv-bar>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bv-bar em{height:16px;border-radius:5px;background:var(--sunk);overflow:hidden;font-style:normal}' +
    '.bv-bar em i{display:block;height:100%}.bv-bar b{text-align:right;font-variant-numeric:tabular-nums}' +
    '.bv-dials{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}' +
    '.bv-dial{background:var(--sunk);border-radius:14px;padding:12px 12px 10px;text-align:center}.bv-dial svg{width:100%;max-width:190px;height:auto;display:block;margin:0 auto}' +
    '.bv-dial b{display:block;font-size:13px}.bv-dial span{display:block;font-size:11.5px;color:var(--mut);margin-top:2px}' +
    '.bv-track{fill:none;stroke:var(--line);stroke-width:12;stroke-linecap:round}.bv-band{fill:none;stroke:var(--good);stroke-opacity:.35;stroke-width:12}' +
    '.bv-needle{stroke:var(--ink);stroke-width:2.6;stroke-linecap:round}.bv-hub{fill:var(--ink)}' +
    '.bv-big{font:800 24px var(--sans);letter-spacing:-.02em;margin:-4px 0 2px;font-variant-numeric:tabular-nums}.bv-val{font:800 20px var(--sans);fill:var(--ink);text-anchor:middle}.bv-tick{font:600 9px var(--sans);fill:var(--mut);text-anchor:middle}' +
    '@media(max-width:720px){.bv-dials{grid-template-columns:1fr 1fr;gap:8px}.bv-big{font-size:19px}.bv-lanes{grid-template-columns:1fr 1fr}.bv-bar{grid-template-columns:minmax(0,1fr) 84px}.bv-bar em{grid-column:1/-1;grid-row:2}}';
  function css() { if (!document.getElementById("bv-css")) { var st = document.createElement("style"); st.id = "bv-css"; st.textContent = CSS; document.head.appendChild(st); } }

  /* Fee & Proposal — the pursuit whose proposal is out, its fee split by phase */
  function feeSplit(el, d) {
    css();
    var out = (d.pursuits || []).filter(function (g) { return /proposal/i.test(g.stage || ""); })[0] || (d.pursuits || [])[0];
    var phases = (B.PHASES || []).filter(function (p) { return p.pct > 0; });
    var fee = out ? Number(out.value) || 0 : 0;
    el.innerHTML = '<h2>Where the fee goes</h2>' +
      '<div class="bv-sub">' + (out ? esc(out.name) + ' · ' + money(fee) + ' fee, split across the AIA phases at the house\'s standard shares.' : 'The house\'s standard fee split by AIA phase.') + '</div>' +
      '<div class="bv-split" role="img" aria-label="Fee split by phase">' + phases.map(function (p, i) {
        return '<div style="flex:' + p.pct + ';background:' + PH[i % PH.length] + '">' + (p.pct >= 10 ? esc(p.k) + ' ' + p.pct + '%' : '') + '</div>';
      }).join("") + '</div>' +
      '<div class="bv-legend">' + phases.map(function (p, i) {
        return '<div class="bv-leg"><i style="background:' + PH[i % PH.length] + '"></i><b>' + (fee ? money(fee * p.pct / 100) : p.pct + '%') + '</b><span>' + esc(p.name) + ' · ' + p.pct + '%</span></div>';
      }).join("") + '</div>';
  }

  /* CA Desk — open items in the lane of whoever holds the ball, aged against their due date */
  function ballBoard(el, d) {
    css();
    var LANES = ["Architect", "Consultant", "Contractor", "Owner"];
    var open = (d.ca || []).filter(function (x) { return x.status === "Open" || x.status === "In Review"; });
    var maxDays = Math.max(10, Math.max.apply(null, open.map(function (x) { return Number(x.days) || 0; }).concat([0])));
    el.innerHTML = '<h2>Ball in court</h2>' +
      '<div class="bv-sub">Every open RFI, submittal and instruction, in the lane of whoever has to move next. The edge goes amber past five days and red past ten, the line this desk holds.</div>' +
      '<div class="bv-lanes">' + LANES.map(function (ln) {
        var items = open.filter(function (x) { return x.ball === ln; });
        return '<div class="bv-lane' + (ln === "Architect" ? " us" : "") + '"><h4><span>' + (ln === "Architect" ? "On us" : esc(ln)) + '</span><span>' + items.length + '</span></h4>' +
          (items.length ? items.map(function (x) {
            var days = Number(x.days) || 0, cls = days > 10 ? "bad" : days > 5 ? "watch" : "";
            var col = cls === "bad" ? "var(--bad)" : cls === "watch" ? "var(--watch)" : "var(--good)";
            return '<div class="bv-item ' + cls + '"><b>' + esc(x.num) + '</b><div>' + esc(x.subject) + '</div>' +
              '<div class="bv-age" style="color:' + col + '"><em><i style="width:' + Math.round(days / maxDays * 100) + '%"></i></em><span style="color:var(--mut)">' + days + ' d</span></div></div>';
          }).join("") : '<div style="font-size:12px;color:var(--mut)">Nothing waiting.</div>') + '</div>';
      }).join("") + '</div>';
  }

  /* Billing — unpaid invoices stacked by age, then each one as a bar */
  function arAging(el, d) {
    css();
    var open = (d.invoices || []).filter(function (x) { return x.status !== "Paid"; });
    var amt = function (x) { return (Number(x.amount) || 0) + (Number(x.reimb) || 0) + (Number(x.consultant) || 0); };
    var BK = [["0–30 days", 0, 30, "var(--good)"], ["31–60 days", 31, 60, "var(--watch)"], ["61–90 days", 61, 90, "var(--a-ca)"], ["Over 90", 91, 1e9, "var(--bad)"]];
    var sums = BK.map(function (b) { return open.filter(function (x) { return x.age >= b[1] && x.age <= b[2]; }).reduce(function (s, x) { return s + amt(x); }, 0); });
    var total = sums.reduce(function (a, b) { return a + b; }, 0) || 1, max = Math.max.apply(null, open.map(amt).concat([1]));
    var col = function (age) { for (var i = 0; i < BK.length; i++) if (age >= BK[i][1] && age <= BK[i][2]) return BK[i][3]; return "var(--mut)"; };
    el.innerHTML = '<h2>What is owed, and how old it is</h2>' +
      '<div class="bv-sub">' + money(total === 1 ? 0 : total) + ' invoiced and unpaid, fee plus reimbursables and consultant pass-throughs.</div>' +
      '<div class="bv-split" role="img" aria-label="Unpaid invoices by age">' + BK.map(function (b, i) {
        return sums[i] ? '<div style="flex:' + sums[i] + ';background:' + b[3] + '">' + Math.round(sums[i] / total * 100) + '%</div>' : "";
      }).join("") + '</div>' +
      '<div class="bv-legend">' + BK.map(function (b, i) { return '<div class="bv-leg"><i style="background:' + b[3] + '"></i><b>' + money(sums[i]) + '</b><span>' + b[0] + '</span></div>'; }).join("") + '</div>' +
      '<div class="bv-bars">' + open.sort(function (a, b) { return b.age - a.age; }).map(function (x) {
        return '<div class="bv-bar"><span><b style="text-align:left">' + esc(x.num) + '</b> ' + esc(x.project) + ' · ' + x.age + ' d</span>' +
          '<em><i style="width:' + Math.round(amt(x) / max * 100) + '%;background:' + col(x.age) + '"></i></em><b>' + money(amt(x)) + '</b></div>';
      }).join("") + '</div>';
  }

  /* Multipliers — each KPI on a dial; the green arc is the sourced target band */
  function dial(k) {
    var b = k.bench || {}, t = b.target || [0, 0];
    var lo = 0, hi = k.k === "netMultiplier" ? 5 : k.k === "backlog" ? 18 : k.k === "collection" ? 120 : 100;
    var ang = function (v) { var f = Math.max(0, Math.min(1, (v - lo) / (hi - lo))); return Math.PI * (1 - f); };
    var P = function (v, r) { var a = ang(v); return [100 + r * Math.cos(a), 100 - r * Math.sin(a)]; };
    var arc = function (v1, v2, r) { var a = P(v1, r), z = P(v2, r); return 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + z[0].toFixed(1) + ' ' + z[1].toFixed(1); };
    var n = P(k.value, 62), unit = (b.unit || "").trim();
    var shown = k.fmt === "x" ? k.value.toFixed(2) + "×" : k.fmt === "mo" ? k.value.toFixed(1) + " mo" : k.fmt === "days" ? Math.round(k.value) + " d" : Math.round(k.value) + "%";
    var needle = k.band === "bad" ? "var(--bad)" : k.band === "watch" ? "var(--watch)" : "var(--ink)";
    return '<div class="bv-dial"><svg viewBox="0 0 200 122" role="img" aria-label="' + esc(k.label + " " + shown) + '">' +
      '<path d="' + arc(lo, hi, 78) + '" class="bv-track"/>' +
      '<path d="' + arc(t[0], t[1], 78) + '" class="bv-band"/>' +
      '<line x1="100" y1="100" x2="' + n[0].toFixed(1) + '" y2="' + n[1].toFixed(1) + '" class="bv-needle" style="stroke:' + needle + '"/><circle cx="100" cy="100" r="5" class="bv-hub"/>' +
      '<text x="22" y="117" class="bv-tick">' + lo + '</text><text x="178" y="117" class="bv-tick">' + hi + (unit === "%" ? "%" : "") + '</text></svg>' +
      '<div class="bv-big" style="color:' + needle + '">' + esc(shown) + '</div><b>' + esc(k.label) + '</b><span>Target ' + t[0] + '–' + t[1] + (b.unit || "") + '</span></div>';
  }
  function dials(el) {
    css();
    var ks = (B.kpis ? B.kpis() : []).filter(function (k) { return k.bench && k.bench.target; });
    el.innerHTML = '<h2>The firm on one dial each</h2>' +
      '<div class="bv-sub">The needle is this firm today; the green arc is the sourced target band. An amber or red needle is one the engine flags.</div>' +
      '<div class="bv-dials">' + ks.map(dial).join("") + '</div>';
  }

  window.BVis = { feeSplit: feeSplit, ballBoard: ballBoard, arAging: arAging, dials: dials, css: css };
})();
