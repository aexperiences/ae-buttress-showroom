/* ============================================================================
   BUTTRESS OS — SHOWROOM ENGINE
   Architecture Practice OS · Powered by Accelerated Experiences LLC

   BROWSER-ONLY SHOWROOM. No backend, no network. Everything lives in this
   browser tab's sessionStorage and resets when the visitor leaves or idles.
   Faithful to real AEHub canon: Founder -> COO -> DH -> AE -> Event Bus ->
   Pacemaker -> Triad (2 opposing lenses + Pacemaker), confidence-gated release,
   LIVE/ESTIMATE/ASSUMPTION source tags, the Fences (drafts only, nothing sent).

   Industry grounding (researched, sourced — see BENCH):
   AIA B101 phases + fee split · G-series CA forms · NCS sheet numbering ·
   CSI MasterFormat · reimbursables at cost+10% · A/E KPI benchmarks.
   ============================================================================ */
(function (global) {
  "use strict";

  /* ------------------------------------------------------------------ store */
  var KEY = "buttress_showroom_v1";
  var IDLE_MS = 20 * 60 * 1000;         // reset the floor 20 min after they walk away
  var STORE = sessionStorage;

  function now() { return Date.now(); }
  function read() {
    try { var d = JSON.parse(STORE.getItem(KEY)); return d || null; } catch (e) { return null; }
  }
  function write(d) { d._t = now(); try { STORE.setItem(KEY, JSON.stringify(d)); } catch (e) {} }

  function fresh() {
    return {
      _t: now(), started: now(),
      tier: "grandsuite",   // the package they're standing in
      adds: [],             // departments added ON TOP of that package
      offs: [],             // departments taken OFF that package
      commissions: clone(SEED.commissions),
      ca:          clone(SEED.ca),
      sheets:      clone(SEED.sheets),
      specs:       clone(SEED.specs),
      consultants: clone(SEED.consultants),
      permits:     clone(SEED.permits),
      pursuits:    clone(SEED.pursuits),
      labor:       clone(SEED.labor),
      invoices:    clone(SEED.invoices),
      team:        clone(SEED.team),
      systems:     clone(SEED.systems),
      matters:     clone(SEED.matters),
      bus: [],
      approvals:   clone(SEED.approvals),
      seq: 1
    };
  }
  function clone(a){ return JSON.parse(JSON.stringify(a)); }
  function db() {
    var d = read();
    if (!d) { d = fresh(); write(d); return d; }
    if (now() - (d._t || 0) > IDLE_MS) { d = fresh(); write(d); }
    return d;
  }
  function save(mut) { var d = db(); mut(d); write(d); return d; }
  function resetFloor() { var d = fresh(); write(d); return d; }

  /* ====================================================================
     INDUSTRY CANON — the real vocabulary. Not invented.
     ==================================================================== */

  /* AIA B101 Basic Services phases + the typical fee split.
     Sources: AIA "Defining the Architect's Basic Services"; Monograph &
     Siana fee-by-phase guides (two independent sources agree on the split). */
  var PHASES = [
    { k:"PD",  name:"Pre-Design",              pct:0,  note:"Programming. Often an additional service, not in Basic." },
    { k:"SD",  name:"Schematic Design",        pct:15, note:"Typical range 10–25% of fee." },
    { k:"DD",  name:"Design Development",      pct:20, note:"Typical range 10–25% of fee." },
    { k:"CD",  name:"Construction Documents",  pct:40, note:"Typical range 35–50% — the heaviest phase." },
    { k:"BID", name:"Bidding & Negotiation",   pct:5,  note:"Typical range 3–5%." },
    { k:"CA",  name:"Construction Administration", pct:20, note:"Typical range 15–30%. The phase firms most often under-fee." }
  ];

  /* The G-series. Every CA artifact maps to a real AIA form — this is the
     vocabulary that makes a principal believe we've done this before. */
  var CA_TYPES = [
    { k:"RFI",        label:"RFI",                       form:"G716", desc:"Request for Information from the contractor." },
    { k:"SUBMITTAL",  label:"Submittal",                 form:"G712", desc:"Shop drawing & sample record — the submittal log." },
    { k:"ASI",        label:"ASI",                       form:"G710", desc:"Architect's Supplemental Instructions. No cost or time change." },
    { k:"PR",         label:"Proposal Request",          form:"G709", desc:"Asks the contractor to price a proposed change." },
    { k:"CCD",        label:"Construction Change Directive", form:"G714", desc:"Directs a change before price is agreed." },
    { k:"CO",         label:"Change Order",              form:"G701", desc:"Executed change to contract sum or time." },
    { k:"FIELD",      label:"Field Report",              form:"G711", desc:"Architect's site visit / observation report." },
    { k:"TRANSMITTAL",label:"Transmittal",               form:"—",    desc:"What was sent, to whom, when. The liability paper trail." }
  ];
  var CA_STATUS  = ["Open", "In Review", "Answered", "Closed"];
  var BALL       = ["Architect", "Owner", "Contractor", "Consultant", "AHJ"];
  var SUBMITTAL_ACTIONS = ["Approved", "Approved as Noted", "Revise & Resubmit", "Rejected", "For Record Only"];

  /* US National CAD Standard discipline designators + sheet-type digits.
     Source: US National CAD Standard / Archtoolbox sheet numbering. */
  var DISCIPLINES = [
    { k:"G", name:"General" }, { k:"C", name:"Civil" }, { k:"L", name:"Landscape" },
    { k:"S", name:"Structural" }, { k:"A", name:"Architectural" }, { k:"I", name:"Interiors" },
    { k:"F", name:"Fire Protection" }, { k:"P", name:"Plumbing" }, { k:"M", name:"Mechanical" },
    { k:"E", name:"Electrical" }
  ];
  var SHEET_TYPES = [
    { d:0, name:"General (symbols, notes)" }, { d:1, name:"Plans" }, { d:2, name:"Elevations" },
    { d:3, name:"Sections" }, { d:4, name:"Large-scale views" }, { d:5, name:"Details" },
    { d:6, name:"Schedules & diagrams" }, { d:9, name:"3D representations" }
  ];
  /* Issue sets: addenda modify bid docs PRE-award; ASIs/bulletins are POST-award.
     Getting this distinction right is a tell that we know the business. */
  var ISSUE_SETS = ["SD Set", "DD Set", "Permit Set", "Bid Set", "Addendum", "Construction Set", "Bulletin", "Record Set"];

  /* CSI MasterFormat — the 50 divisions (00–49). Showing the ones a building
     project actually touches; the submittal log auto-builds from Part 1. */
  var MF_DIVISIONS = [
    { n:"00", name:"Procurement & Contracting Requirements" },
    { n:"01", name:"General Requirements" },
    { n:"03", name:"Concrete" },
    { n:"04", name:"Masonry" },
    { n:"05", name:"Metals" },
    { n:"06", name:"Wood, Plastics & Composites" },
    { n:"07", name:"Thermal & Moisture Protection" },
    { n:"08", name:"Openings" },
    { n:"09", name:"Finishes" },
    { n:"10", name:"Specialties" },
    { n:"14", name:"Conveying Equipment" },
    { n:"21", name:"Fire Suppression" },
    { n:"22", name:"Plumbing" },
    { n:"23", name:"HVAC" },
    { n:"26", name:"Electrical" },
    { n:"31", name:"Earthwork" },
    { n:"32", name:"Exterior Improvements" }
  ];

  /* A/E financial benchmarks. EVERY number here is sourced and tagged — the
     honesty rule means we show where it came from, never assert it. */
  var BENCH = {
    utilization:   { target:[58,65],  median:61,   unit:"%",  src:"Deltek Clarity (arch, 2023 median); Northstar target band" },
    netMultiplier: { target:[2.75,3.25], median:3.1, unit:"x", src:"BQE A/E benchmarks (avg 3.1); Northstar target band" },
    overhead:      { target:[150,175], median:162,  unit:"%",  src:"Deltek Clarity (arch, 2023)" },
    realization:   { target:[90,100],  median:83,   unit:"%",  src:"BQE (avg 83%, high performers ≥90%)" },
    backlog:       { target:[6,12],    median:7.6,  unit:" mo",src:"Deltek Clarity (arch, 2023)" },
    collection:    { target:[30,60],   median:81,   unit:" days", src:"Deltek Clarity 81 days; BQE reports 49.4 — sources conflict, both shown" },
    opProfit:      { target:[15,25],   median:21.4, unit:"%",  src:"Deltek Clarity 46th Annual (2025) — a 10-year high" },
    revPerHead:    { target:[150,200], median:164.9,unit:"k",  src:"Deltek Clarity (arch, 2023): $164,935 net revenue/employee" }
  };

  /* The pain we're selling against. Sourced, used in the pitch copy. */
  var PAIN = [
    { stat:"1 in 3", claim:"firms now spend under half their time on actual design work", src:"Total Synergy 2026 Benchmark" },
    { stat:"Only 1 in 4", claim:"firms track utilization consistently", src:"Total Synergy 2026 Benchmark" },
    { stat:"49%", claim:"don't track realization rate — or aren't sure if they do", src:"Total Synergy 2026 Benchmark" },
    { stat:"56%", claim:"get paid more than 30 days after invoicing", src:"Total Synergy 2026 Benchmark" },
    { stat:"$6–18k/yr", claim:"is what a 10-seat Newforma project-info license runs — before onboarding", src:"ITQlick third-party estimate (vendor does not publish)" }
  ];

  /* What Buttress OS replaces. The "worth" argument from Article X. */
  var REPLACES = [
    { tool:"Newforma Project Center", job:"Project info, transmittals, RFI/submittal logs", cost:"~$6–18k/yr for 10 users (third-party est.)" },
    { tool:"Monograph / BQE Core / Ajera", job:"Time, phase billing, WIP, project accounting", cost:"$25–490/mo published range; Ajera est. ~$200/user/mo + $5–20k implementation" },
    { tool:"Unanet CRM by Cosential", job:"Pursuit pipeline, go/no-go, SF330", cost:"Quote-only — no published price" },
    { tool:"Spreadsheets + Outlook folders", job:"The submittal log, the fee tracker, the permit comments", cost:"Free, and it's costing you the 49% realization blind spot" },
    { tool:"A part-time bookkeeper / PM admin", job:"Invoicing, AR chase, filing", cost:"Headcount" }
  ];

  /* --------------------------------------------------------------- seed data */
  var SEED = {
    /* The spine: the Commission. Phase-native, fee-native, so percent-complete
       billing and phase profitability fall out instead of being reconstructed. */
    commissions: [
      { id:"p1", name:"Riverside Branch Library", number:"24-018", client:"City of Coeur d'Alene",
        type:"Civic", phase:"CD", pctComplete:72, fee:480000, billed:320000, lead:"Dana Whitfield",
        construction:6400000, feeBasis:"7.5% of Cost of the Work", target:"2026-11-30",
        permit:"In review", consultants:["Summit Structural","Cascade MEP"],
        laborCost:96400, writeOff:4200, note:"Waterfront civic. LEED Silver target." },
      { id:"p2", name:"Hayden Medical Office", number:"25-004", client:"Panhandle Health",
        type:"Healthcare", phase:"DD", pctComplete:45, fee:260000, billed:96000, lead:"Marcus Lang",
        construction:3100000, feeBasis:"Stipulated sum", target:"2027-03-15",
        permit:"Not submitted", consultants:["Cascade MEP"],
        laborCost:41200, writeOff:2600, note:"Two-story MOB. Owner wants a GMP early." },
      { id:"p3", name:"Lakeside Residence", number:"25-011", client:"The Abernathys",
        type:"Residential", phase:"SD", pctComplete:20, fee:88000, billed:12000, lead:"Dana Whitfield",
        construction:1150000, feeBasis:"Hourly, NTE $88,000", target:"2026-12-20",
        permit:"Not submitted", consultants:[],
        laborCost:9800, writeOff:1900, note:"Custom lakefront. Shoreline setback variance likely." },
      { id:"p4", name:"Fernan Elementary Addition", number:"24-022", client:"CDA School District",
        type:"Education", phase:"CA", pctComplete:95, fee:540000, billed:500000, lead:"Priya Anand",
        construction:7200000, feeBasis:"7.5% of Cost of the Work", target:"2026-08-30",
        permit:"Issued", consultants:["Summit Structural","Cascade MEP","Terra Civil"],
        laborCost:118000, writeOff:1500, note:"6-classroom addition on an occupied campus. Phased occupancy." },
      { id:"p5", name:"Sherman Ave Mixed-Use", number:"25-019", client:"Northwest Development",
        type:"Commercial", phase:"PD", pctComplete:5, fee:0, billed:0, lead:"Marcus Lang",
        construction:9800000, feeBasis:"TBD — proposal out", target:"2027-06-01",
        permit:"Not submitted", consultants:[],
        laborCost:4100, writeOff:600, note:"Retail + 24 residential units. Fee letter with the owner." },
      { id:"p6", name:"Midtown Fire Station 3", number:"24-009", client:"Kootenai County",
        type:"Civic", phase:"CA", pctComplete:100, fee:610000, billed:610000, lead:"Priya Anand",
        construction:8100000, feeBasis:"7.5% of Cost of the Work", target:"2026-05-15",
        permit:"Issued", consultants:["Summit Structural","Cascade MEP","Terra Civil"],
        laborCost:131500, writeOff:0, note:"Complete and occupied. Warranty walk at 11 months." }
    ],

    /* The CA log — one engine for RFI / submittal / ASI / PR / CCD / CO / field
       report / transmittal, with ball-in-court and aging. This is the room that
       replaces Newforma + a spreadsheet + an Outlook folder. */
    ca: [
      { id:"t1", num:"RFI-014", type:"RFI", subject:"Curtain wall head flashing at Grid B",
        project:"Riverside Branch Library", ball:"Architect", status:"Open", days:6, due:"2026-07-28",
        spec:"08 44 13", from:"Bennett Construction", costImpact:false, timeImpact:false,
        note:"GC needs the head condition where the CW meets the canopy soffit." },
      { id:"t2", num:"SUB-062", type:"SUBMITTAL", subject:"Steel joists & joist girders — shop drawings",
        project:"Fernan Elementary Addition", ball:"Consultant", status:"In Review", days:9, due:"2026-07-26",
        spec:"05 21 00", from:"Bennett Construction", action:"", costImpact:false, timeImpact:false,
        note:"With Summit Structural. Day 9 of a 14-day review window." },
      { id:"t3", num:"RFI-011", type:"RFI", subject:"Mechanical chase routing at Grid C",
        project:"Hayden Medical Office", ball:"Consultant", status:"Answered", days:2, due:"2026-07-14",
        spec:"23 31 00", from:"Bennett Construction", costImpact:false, timeImpact:false,
        note:"Cascade MEP responded. Ceiling height holds at 9'-0\"." },
      { id:"t4", num:"SUB-058", type:"SUBMITTAL", subject:"Storefront glazing — samples & finish",
        project:"Riverside Branch Library", ball:"Architect", status:"Open", days:11, due:"2026-07-25",
        spec:"08 41 13", from:"Bennett Construction", action:"", costImpact:false, timeImpact:false,
        note:"Aging past the 10-day window. Owner wants to see the sample." },
      { id:"t5", num:"ASI-003", type:"ASI", subject:"Door hardware set 4 — lever change",
        project:"Fernan Elementary Addition", ball:"Contractor", status:"Closed", days:0, due:"2026-06-30",
        spec:"08 71 00", from:"Architect", costImpact:false, timeImpact:false,
        note:"Clarification only. No cost or time change — that's what makes it an ASI, not a PR." },
      { id:"t6", num:"PR-002", type:"PR", subject:"Add roof-mounted PV conduit rough-in",
        project:"Fernan Elementary Addition", ball:"Contractor", status:"Open", days:4, due:"2026-07-30",
        spec:"26 05 33", from:"Architect", costImpact:true, timeImpact:false,
        note:"Owner-requested. Pricing back from the GC, then it becomes a CO." },
      { id:"t7", num:"FR-021", type:"FIELD", subject:"Site observation — masonry veneer, east elevation",
        project:"Fernan Elementary Addition", ball:"Architect", status:"Closed", days:0, due:"2026-07-16",
        spec:"04 21 13", from:"Architect", costImpact:false, timeImpact:false,
        note:"Weep spacing corrected on site. Photos filed to the project record." },
      { id:"t8", num:"TR-045", type:"TRANSMITTAL", subject:"SD set issued to owner for review",
        project:"Lakeside Residence", ball:"Owner", status:"Open", days:5, due:"2026-07-22",
        spec:"—", from:"Architect", costImpact:false, timeImpact:false,
        note:"12 sheets. Awaiting owner comments before we open DD." }
    ],

    /* Sheet sets — NCS numbering, issue history, permit-vs-bid set control. */
    sheets: [
      { id:"s1", num:"A-101", title:"Level 1 Floor Plan",        project:"Riverside Branch Library", disc:"A", rev:3, issued:"Permit Set",     date:"2026-06-18" },
      { id:"s2", num:"A-201", title:"Exterior Elevations",       project:"Riverside Branch Library", disc:"A", rev:2, issued:"Permit Set",     date:"2026-06-18" },
      { id:"s3", num:"A-501", title:"Wall Sections & Details",   project:"Riverside Branch Library", disc:"A", rev:4, issued:"Addendum",       date:"2026-07-09" },
      { id:"s4", num:"A-601", title:"Door & Window Schedules",   project:"Riverside Branch Library", disc:"A", rev:2, issued:"Permit Set",     date:"2026-06-18" },
      { id:"s5", num:"S-201", title:"Framing Plans",             project:"Riverside Branch Library", disc:"S", rev:1, issued:"Permit Set",     date:"2026-06-18" },
      { id:"s6", num:"A-102", title:"Level 2 Floor Plan",        project:"Fernan Elementary Addition", disc:"A", rev:5, issued:"Construction Set", date:"2026-03-02" },
      { id:"s7", num:"A-505", title:"Roof & Parapet Details",    project:"Fernan Elementary Addition", disc:"A", rev:6, issued:"Bulletin",      date:"2026-07-11" },
      { id:"s8", num:"A-100", title:"Site Plan",                 project:"Lakeside Residence",       disc:"A", rev:1, issued:"SD Set",         date:"2026-07-17" }
    ],

    /* Specs — MasterFormat sections, and the submittal requirements each one
       generates. The log auto-builds from Part 1. That's the Ferrari move. */
    specs: [
      { id:"sp1", sec:"04 21 13", title:"Brick Masonry",            div:"04", project:"Riverside Branch Library", status:"Issued",  submittals:["Product data","Samples — 3 blends","Mock-up panel"] },
      { id:"sp2", sec:"05 21 00", title:"Steel Joist Framing",      div:"05", project:"Fernan Elementary Addition", status:"Issued",  submittals:["Shop drawings","Certified calcs","Mill certs"] },
      { id:"sp3", sec:"07 54 23", title:"TPO Roofing",              div:"07", project:"Riverside Branch Library", status:"Issued",  submittals:["Product data","Warranty — 20 yr","Installer cert"] },
      { id:"sp4", sec:"08 41 13", title:"Aluminum Storefront",      div:"08", project:"Riverside Branch Library", status:"Issued",  submittals:["Shop drawings","Finish samples","Structural calcs"] },
      { id:"sp5", sec:"08 71 00", title:"Door Hardware",            div:"08", project:"Fernan Elementary Addition", status:"Issued",  submittals:["Hardware schedule","Keying schedule","Product data"] },
      { id:"sp6", sec:"09 51 13", title:"Acoustical Panel Ceilings",div:"09", project:"Hayden Medical Office",    status:"Draft",   submittals:["Product data","Samples","Seismic details"] },
      { id:"sp7", sec:"23 31 00", title:"HVAC Ducts & Casings",     div:"23", project:"Hayden Medical Office",    status:"Draft",   submittals:["Shop drawings","Coordination drawings"] }
    ],

    /* Consultants under C401, plus the AHJ. The coordination room. */
    consultants: [
      { id:"k1", name:"Summit Structural", disc:"Structural", contact:"R. Alvarez", agreement:"C401", fee:64000, paid:41000, projects:["Riverside Branch Library","Fernan Elementary Addition"], nextDue:"Foundation package — 2026-08-04", status:"Current" },
      { id:"k2", name:"Cascade MEP",       disc:"Mechanical / Electrical / Plumbing", contact:"J. Okonkwo", agreement:"C401", fee:88000, paid:52000, projects:["Riverside Branch Library","Hayden Medical Office"], nextDue:"DD MEP set — 2026-08-11", status:"Current" },
      { id:"k3", name:"Terra Civil",       disc:"Civil / Site", contact:"M. Bishop", agreement:"C401", fee:37000, paid:37000, projects:["Fernan Elementary Addition"], nextDue:"—", status:"Complete" },
      { id:"k4", name:"Larch Landscape",   disc:"Landscape", contact:"S. Ferris", agreement:"C401 pending", fee:0, paid:0, projects:["Sherman Ave Mixed-Use"], nextDue:"Scope + fee proposal", status:"Not engaged" }
    ],

    /* AHJ permit comment cycles — the thing no tool at this size tracks. */
    permits: [
      { id:"pm1", project:"Riverside Branch Library", ahj:"City of Coeur d'Alene — Building", submitted:"2026-06-18", cycle:2, comments:7, resolved:5, status:"In review", due:"2026-08-01", note:"Cycle 2 comments: egress width at the reading room, and the fire-rated ceiling assembly." },
      { id:"pm2", project:"Fernan Elementary Addition", ahj:"City of Coeur d'Alene — Building", submitted:"2026-01-20", cycle:3, comments:14, resolved:14, status:"Issued", due:"—", note:"Permit issued 2026-03-01." },
      { id:"pm3", project:"Hayden Medical Office", ahj:"Kootenai County — Planning", submitted:"—", cycle:0, comments:0, resolved:0, status:"Not submitted", due:"2026-09-15", note:"Pre-application meeting scheduled." },
      { id:"pm4", project:"Lakeside Residence", ahj:"Kootenai County — Shoreline", submitted:"—", cycle:0, comments:0, resolved:0, status:"Not submitted", due:"2026-10-01", note:"Shoreline setback variance likely required." }
    ],

    /* Pursuits — the pipeline. Replaces the spreadsheet + the principal's head. */
    pursuits: [
      { id:"g1", name:"Post Falls Community Center", client:"City of Post Falls", type:"Civic", stage:"RFQ submitted", value:390000, construction:5200000, due:"2026-08-08", probability:45, decision:"GO", owner:"Dana Whitfield", note:"QBS selection. Shortlist interviews late August." },
      { id:"g2", name:"Silver Lake Dental TI",       client:"Vireo Dental Group", type:"Interiors", stage:"Proposal out", value:42000, construction:520000, due:"2026-07-31", probability:70, decision:"GO", owner:"Marcus Lang", note:"Repeat client type. Fast, clean TI." },
      { id:"g3", name:"Hayden Self-Storage Campus",  client:"NW Storage Partners", type:"Commercial", stage:"Qualifying", value:118000, construction:2900000, due:"2026-08-20", probability:25, decision:"HOLD", owner:"Marcus Lang", note:"Developer wants design-build; we'd be a sub. Margin unclear." },
      { id:"g4", name:"Coeur d'Alene Airport Hangar", client:"Kootenai County", type:"Civic", stage:"Lead", value:210000, construction:3400000, due:"2026-09-05", probability:20, decision:"HOLD", owner:"Priya Anand", note:"Needs an aviation reference we don't have. Teaming?" },
      { id:"g5", name:"Sandpoint Boutique Hotel",    client:"Selkirk Hospitality", type:"Commercial", stage:"Lead", value:520000, construction:11000000, due:"2026-09-30", probability:15, decision:"NO-GO", owner:"Dana Whitfield", note:"Out of county, out of our staffing depth this year." }
    ],

    /* Labor — what drives utilization, net multiplier, realization. */
    labor: [
      { id:"l1", name:"Dana Whitfield",  role:"Principal",         rate:215, cost:78,  hours:148, billable:78,  target:45 },
      { id:"l2", name:"Marcus Lang",     role:"Project Architect", rate:165, cost:56,  hours:160, billable:112, target:65 },
      { id:"l3", name:"Priya Anand",     role:"Project Architect", rate:165, cost:54,  hours:156, billable:118, target:65 },
      { id:"l4", name:"Theo Barnes",     role:"Designer",          rate:120, cost:38,  hours:160, billable:126, target:70 },
      { id:"l5", name:"Ines Okafor",     role:"Job Captain",       rate:135, cost:44,  hours:158, billable:121, target:70 },
      { id:"l6", name:"Ray Mendel",      role:"Admin",             rate:0,   cost:29,  hours:150, billable:0,   target:0 }
    ],

    invoices: [
      { id:"i1", num:"24-018-07", project:"Riverside Branch Library", phase:"CD", amount:48000, reimb:2140, consultant:9200, issued:"2026-06-30", status:"Open", age:24 },
      { id:"i2", num:"24-022-07", project:"Fernan Elementary Addition", phase:"CA", amount:22000, reimb:860,  consultant:0,    issued:"2026-06-30", status:"Open", age:24 },
      { id:"i3", num:"25-004-06", project:"Hayden Medical Office", phase:"DD", amount:31000, reimb:410,  consultant:6400, issued:"2026-05-31", status:"Open", age:54 },
      { id:"i4", num:"24-018-06", project:"Riverside Branch Library", phase:"CD", amount:52000, reimb:1980, consultant:8800, issued:"2026-05-31", status:"Paid", age:0 },
      { id:"i5", num:"25-011-06", project:"Lakeside Residence", phase:"SD", amount:12000, reimb:220,  consultant:0,    issued:"2026-05-31", status:"Open", age:54 }
    ],

    /* The Approval Desk is meant to be nearly EMPTY — full autonomy is the goal.
       Only real FENCES land here (send / spend / publish / pricing / a human). */
    approvals: [
      { id:"ap1", kind:"pricing", title:"Fee proposal — Post Falls Community Center", by:"Wren (Pursuits AE)",
        summary:"Submit at $390,000 (7.5% of a $5.2M cost of the work), phased SD 15 / DD 20 / CD 40 / Bid 5 / CA 20.",
        state:"Pending", why:"Setting a fee that goes to a client is the principal's call." },
      { id:"ap2", kind:"external", title:"Issue Addendum 2 — Riverside Branch Library", by:"Pell (Studio AE)",
        summary:"Three sheets revised off the AHJ cycle-2 comments. Goes to all 9 planholders.",
        state:"Pending", why:"Reaches bidders outside the office and changes the bid documents." },
      { id:"ap3", kind:"appointment", title:"Shortlist interview — Post Falls, Aug 26 2:00p", by:"Wren (Pursuits AE)",
        summary:"Selection committee set the interview. Needs a principal in the room.",
        state:"Pending", why:"Booked for a human to take; the org sets it, a person shows up." }
    ],

    /* HR — AI seats and HUMAN seats side by side, plus licensure tracking
       (the thing an architecture firm actually gets audited on). */
    team: [
      { id:"h1", name:"Dana Whitfield", role:"Principal / Architect of Record", type:"Human", status:"Active", dept:"Studio", license:"ID AR-4821 · exp 2027-12-31", ce:"18 / 24 HSW hours", note:"Seals the work. The bottleneck seat in every small firm." },
      { id:"h2", name:"Marcus Lang", role:"Project Architect", type:"Human", status:"Active", dept:"Studio", license:"ID AR-6110 · exp 2026-12-31", ce:"9 / 24 HSW hours", note:"⚠ License renews in 5 months, CE is behind pace." },
      { id:"h3", name:"Theo Barnes", role:"Designer (ARE candidate)", type:"Human", status:"Active", dept:"Studio", license:"AXP — 2,940 / 3,740 hrs", ce:"—", note:"Logging AXP hours. 4 of 6 ARE divisions passed." },
      { id:"h4", name:"Nora", role:"Chief Operating Officer", type:"AI · DeepSeek", status:"Active", dept:"Command", license:"—", ce:"—", note:"The interface machine to the principal." },
      { id:"h5", name:"Codex", role:"Head of Standards & Specs", type:"AI · DeepSeek", status:"Active", dept:"Standards", license:"—", ce:"—", note:"Owns the spec, the standard details, the code read." },
      { id:"h6", name:"Wescott", role:"Head of Construction Administration", type:"AI · DeepSeek", status:"Active", dept:"CA", license:"—", ce:"—", note:"Owns the field. Nothing sits in the log unanswered." },
      { id:"h7", name:"Ines Okafor", role:"Job Captain", type:"Human", status:"Onboarding", dept:"Studio", license:"—", ce:"—", note:"Started this month. W-4 on file, equipment issued." }
    ],

    systems: [
      { id:"sy1", name:"Model & drawing store", state:"CLEAR", metric:"1.8 TB · nightly backup verified 04:12" },
      { id:"sy2", name:"Plot / print queue",    state:"CLEAR", metric:"queue empty · large-format online" },
      { id:"sy3", name:"Consultant file exchange", state:"WATCH", metric:"storage 82% — Cascade MEP set is large" },
      { id:"sy4", name:"Auth / sessions",       state:"CLEAR", metric:"no failed logins in 30 days" },
      { id:"sy5", name:"Client portal",         state:"CLEAR", metric:"99.98% uptime · 210ms" }
    ],

    /* Law — advisory only, NOT a lawyer. Architecture-real matters. */
    matters: [
      { id:"mt1", title:"Riverside — owner requests unlimited revisions clause", state:"Open", risk:"High", ref:"B101 §3.1",
        note:"Owner's redline strikes the Additional Services trigger. That's the clause that makes scope creep billable — needs a real attorney before signature." },
      { id:"mt2", title:"Larch Landscape — C401 not executed, work started", state:"Open", risk:"High", ref:"C401",
        note:"Consultant is producing on Sherman Ave with no signed agreement. Flow-down and insurance are unconfirmed. Stop-work or paper it." },
      { id:"mt3", title:"Fernan — certificate of substantial completion timing", state:"Open", risk:"Medium", ref:"G704",
        note:"Phased occupancy means more than one G704. Confirm the warranty start date per phase." },
      { id:"mt4", title:"Lakeside — E&O coverage on shoreline variance advice", state:"Open", risk:"Medium", ref:"Standard of care",
        note:"Advising on a variance edges toward land-use counsel. Advisory only; route the opinion to the owner's attorney." }
    ]
  };

  /* ============================================================ THE PRICE BOOK
     Anthony's model: the three tiers are PACKAGES, but every department is
     priced on its own — so a deal can add a department to a lower tier or take
     one off a higher one, and the price moves with it. The package is a bundle
     discount against the à-la-carte total; showing that gap IS the sales tool.

     Command Center + the Approval Desk are the platform — they're in every
     build and aren't separately priced.

     ⚠ EVERY figure here is DRAFT. Tier prices mirror what is live on
     aexperiences.com/hubs/architecture.html today. Anthony sets all live
     pricing in the editor — nothing here goes live without him. */
  var ROOMS = {
    /* key            room                              per-month   one-time build */
    pursuits:    { label:"Pursuits · Go/No-Go",     mo:60,  build:400,
                   why:"Replaces the pipeline spreadsheet and the go/no-go argument in the hallway." },
    proposal:    { label:"Fee & Proposal",          mo:60,  build:400,
                   why:"Phase-split fees, % of Cost of the Work, and the multiplier check before the letter goes out." },
    commissions: { label:"Commissions",             mo:75,  build:500,
                   why:"The phase-native project spine. Percent-complete and phase profitability fall out of it." },
    ca:          { label:"CA Desk",                 mo:85,  build:500,
                   why:"RFI · Submittal · ASI · PR · CCD · CO · Field Report, ball-in-court and aging. Replaces Newforma at this size." },
    details:     { label:"Detail Studio",           mo:45,  build:300,
                   why:"Parametric, dimensioned details you can drop straight into a set." },
    billing:     { label:"Billing",                 mo:65,  build:300,
                   why:"Percent-complete invoices, reimbursables at cost+10%, consultant pass-throughs, AR chase." },
    sheets:      { label:"Sheet Sets",              mo:70,  build:500,
                   why:"NCS sheet index, revision history, and the permit-set vs bid-set vs addendum distinction." },
    coord:       { label:"Consultants & AHJ",       mo:85,  build:600,
                   why:"C401 scopes and deliverable dates, plus permit comment and resubmittal cycles. Nothing at this size tracks this." },
    books:       { label:"Books & Multipliers",     mo:95,  build:700,
                   why:"Utilization, net multiplier, realization, backlog, AR and WIP — computed, not reconstructed." },
    hr:          { label:"HR · People Ops",         mo:70,  build:450,
                   why:"Roster, onboarding, and licensure/CE tracking. A lapsed stamp is a stop-work event." },
    it:          { label:"IT · System Health",      mo:60,  build:400,
                   why:"CLEAR / WATCH / INTERVENE on the model store, plot queue, portal and backups." },
    org:         { label:"Agent Org · Bus",         mo:145, build:1200,
                   why:"The ten AI department chains, the event bus, and the confidence gates. This is the engine." },
    specs:       { label:"Specs · MasterFormat",    mo:120, build:900,
                   why:"50-division sections whose Part 1 requirements auto-build the submittal log." },
    law:         { label:"Law · Contracts",         mo:110, build:800,
                   why:"B101 / C401 / G-series read, advisory only, with a hard fence to a real attorney." },
    ops:         { label:"Operations",              mo:90,  build:650,
                   why:"The project filing cabinet and the follow-up calendar for the whole office." }
  };

  /* The three packages. `includes` is what ships in the box at that price. */
  var TIERS = {
    lite: { key:"lite", name:"Lite", rank:1, mo:550, build:3500,
      desc:"Core practice. Pursuits, fees, the commission spine, the CA desk, details and billing.",
      base:"Single office · up to 5 seats",
      includes:["pursuits","proposal","commissions","ca","details","billing"] },
    standard: { key:"standard", name:"Standard", rank:2, mo:1200, build:9000,
      desc:"The working firm. Adds sheet control, consultant & AHJ coordination, the multiplier board, HR, IT — and the agent org.",
      base:"Single office · up to 15 seats",
      includes:["pursuits","proposal","commissions","ca","details","billing",
                "sheets","coord","books","hr","it","org"] },
    grandsuite: { key:"grandsuite", name:"Grandsuite", rank:3, mo:2800, build:22000,
      desc:"The whole practice, nothing held back. Every department, the full ten-chain agent org, specs, contracts and operations.",
      base:"Multi-office · unlimited seats · dedicated environment · data migration",
      includes:["pursuits","proposal","commissions","ca","details","billing",
                "sheets","coord","books","hr","it","org","specs","law","ops"] }
  };

  /* Departments (nav). `room` links a nav item to its price-book entry.
     Items with no `room` are platform and always present.
     The showroom opens on the FULL Grandsuite; you subtract to fit the budget,
     and you can add a single department back to any tier at its own price.
     Never build up from a stripped base — Article X, the showroom rule. */
  var DEPTS = [
    { group:"Command", items:[
      { href:"dashboard.html",   label:"Command Center",      ic:"◎" },
      { href:"approvals.html",   label:"Approval Desk",       ic:"✓", accent:"ops" }
    ]},
    { group:"New Business", items:[
      { href:"pursuits.html",    label:"Pursuits · Go/No-Go", ic:"◆", room:"pursuits",    accent:"pursuits" },
      { href:"proposal.html",    label:"Fee & Proposal",      ic:"∑", room:"proposal",    accent:"money" }
    ]},
    { group:"The Work", items:[
      { href:"commissions.html", label:"Commissions",         ic:"▦", room:"commissions", accent:"studio" },
      { href:"ca.html",          label:"CA Desk",             ic:"⇄", room:"ca",          accent:"ca" },
      { href:"sheets.html",      label:"Sheet Sets",          ic:"▤", room:"sheets",      accent:"studio" },
      { href:"details.html",     label:"Detail Studio",       ic:"◫", room:"details",     accent:"studio" },
      { href:"specs.html",       label:"Specs · MasterFormat",ic:"§", room:"specs",       accent:"standards" }
    ]},
    { group:"The Team Outside", items:[
      { href:"coord.html",       label:"Consultants & AHJ",   ic:"⇋", room:"coord",       accent:"coord" }
    ]},
    { group:"Money", items:[
      { href:"billing.html",     label:"Billing",             ic:"◧", room:"billing",     accent:"money" },
      { href:"books.html",       label:"Books & Multipliers", ic:"◭", room:"books",       accent:"money" }
    ]},
    { group:"People", items:[
      { href:"hr.html",          label:"HR · People Ops",     ic:"☷", room:"hr",          accent:"ops" },
      { href:"ops.html",         label:"Operations",          ic:"⛭", room:"ops",         accent:"ops" }
    ]},
    { group:"Governance", items:[
      { href:"law.html",         label:"Law · Contracts",     ic:"⚖", room:"law",         accent:"law" },
      { href:"it.html",          label:"IT · System Health",  ic:"♥", room:"it",          accent:"it" }
    ]},
    { group:"The Org", items:[
      { href:"org.html",         label:"Agent Org · Bus",     ic:"❖", room:"org",         accent:"ops" }
    ]}
  ];

  /* ----------------------------------------------------------- the agent org
     Faithful to AEHub canon: each department is a chain
     DH (owns the "so what") -> AE (packages, files, sets follow-up) -> Event Bus
     -> Pacemaker (gates on a confidence bar; the ONLY voice out of the triad)
     -> two opposing Lenses that never confer.
     COO (Nora) is the apex; she routes, gates and packages — she does NOT do
     the work. She defers to the principal only behind a Fence. */
  var SEATS = {
    coo: { id:"coo", name:"Nora", role:"Chief Operating Officer", tier:"COO", dept:"Command", gate:null,
           line:"Apex seat. Makes the ordinary call; defers to the principal only behind a Fence." },
    depts: [
      { key:"pursuits", name:"New Business · Pursuits", accent:"pursuits", gate:80,
        dh:   { name:"Locke",   line:"Owns which pursuits are real — the go/no-go verdict and why." },
        ae:   { name:"Wren",    line:"Packages the RFQ/RFP response, the reference sheets, the fee letter." },
        pace: { name:"Compass", line:"Only voice out of the triad. GO at ≥80%; below that it's a HOLD with reasons." },
        lensA:{ name:"Reach",   line:"Opportunity lens — does this win, and does it build the portfolio we want?" },
        lensB:{ name:"Filter",  line:"Qualification lens — funded, in our wheelhouse, and can we actually staff it?" } },

      { key:"studio", name:"Studio · Design Production", accent:"studio", gate:80,
        dh:   { name:"Marek",   line:"Owns what goes out the door — the drawings, the phase, the deliverable." },
        ae:   { name:"Pell",    line:"Packages the phase plan, the deliverable list, and every hand-off." },
        pace: { name:"Trueline", line:"Releases the production plan at ≥80%; below the bar it holds and asks." },
        lensA:{ name:"Parti",   line:"Design lens — the strongest idea that still meets program and budget." },
        lensB:{ name:"Bearing", line:"Constructability lens — can this be drawn, detailed, and actually built?" } },

      { key:"ca", name:"Construction Administration", accent:"ca", gate:80,
        dh:   { name:"Wescott", line:"Owns the field. Nothing sits in the log unanswered." },
        ae:   { name:"Quill",   line:"Packages RFIs, submittals, ASIs and field reports; keeps ball-in-court honest." },
        pace: { name:"Plumb",   line:"Releases a CA response at ≥80%. Anything life-safety routes to the Architect of Record." },
        lensA:{ name:"Unblock", line:"Field lens — the contractor is waiting; what gets the trade moving today?" },
        lensB:{ name:"Scope",   line:"Exposure lens — does this change cost or time? Then it isn't an RFI answer, it's a PR." } },

      { key:"money", name:"Money · Accounting", accent:"money", gate:85,
        dh:   { name:"Sterling", line:"Owns the integrity of every number. A wrong figure pollutes everything downstream." },
        ae:   { name:"Marin",    line:"Packages invoices, WIP, AR aging, and the multiplier view." },
        pace: { name:"Baseline", line:"High bar (85%). A bluffed number is worse than an honest 'unsure'." },
        lensA:{ name:"Realized", line:"Collections lens — what actually cleared the bank, tagged LIVE only." },
        lensB:{ name:"Multiple", line:"Profitability lens — does this phase clear the net multiplier on real labor cost?" } },

      { key:"standards", name:"Standards & Specs", accent:"standards", gate:80,
        dh:   { name:"Codex",     line:"Owns the spec, the standard details, and the code read." },
        ae:   { name:"Section",   line:"Packages MasterFormat sections and the submittal requirements they generate." },
        pace: { name:"Verify",    line:"A code position releases at ≥80% AND with a cited source; otherwise 'confirm with the AHJ'." },
        lensA:{ name:"Precedent", line:"Library lens — have we detailed this before, and did it perform in the field?" },
        lensB:{ name:"Authority", line:"Code lens — what does the adopted code actually say, and who has jurisdiction?" } },

      { key:"coord", name:"Consultants & AHJ", accent:"coord", gate:80,
        dh:   { name:"Lattice",   line:"Owns the team outside the office — consultants, AHJ, contractor." },
        ae:   { name:"Relay",     line:"Packages C401 scopes, deliverable dates, permit comments and resubmittals." },
        pace: { name:"Interlock", line:"Releases a coordination call at ≥80%; a discipline conflict escalates." },
        lensA:{ name:"Sequence",  line:"Schedule lens — who needs what, when, to keep the set moving?" },
        lensB:{ name:"Clash",     line:"Conflict lens — where do the disciplines actually collide?" } },

      { key:"hr", name:"HR · People Ops", accent:"ops", gate:80,
        dh:   { name:"Hale",    line:"Owns the team's health — hiring, onboarding, licensure, and the hard conversations." },
        ae:   { name:"Roster",  line:"Packages offers, checklists, license/CE tracking, and the paperwork map." },
        pace: { name:"Balance", line:"Releases people decisions at ≥80%; a termination always routes to a human." },
        lensA:{ name:"Bench",   line:"Talent lens — who do we need to actually deliver the backlog?" },
        lensB:{ name:"Record",  line:"Compliance lens — is licensure, CE and paperwork current and defensible?" } },

      { key:"it", name:"IT · System Health", accent:"it", gate:80,
        dh:   { name:"Ward",   line:"Owns uptime. CLEAR / WATCH / INTERVENE — and says which, plainly." },
        ae:   { name:"Cache",  line:"Packages incident notes, the watch list, and backup verification." },
        pace: { name:"Steady", line:"Calls system health; a real outage or security event escalates to a human immediately." },
        lensA:{ name:"Access", line:"Availability lens — is the model store, the plot queue and the portal reachable?" },
        lensB:{ name:"Loss",   line:"Risk lens — where's the exposure? Which drawing set isn't backed up?" } },

      { key:"law", name:"Law · Contracts", accent:"law", gate:85,
        dh:   { name:"Barrow", line:"Owns the contract read — B101, C401, the G-series certificates. NOT a lawyer; advisory only." },
        ae:   { name:"File",   line:"Packages the matter, the risk, the sources; flags what needs a real attorney." },
        pace: { name:"Care",   line:"High bar (85%). Anything with real exposure routes to a licensed attorney." },
        lensA:{ name:"Terms",  line:"Enablement lens — how do we get to a signed agreement cleanly?" },
        lensB:{ name:"Claim",  line:"Exposure lens — what claim could arise here, and does our E&O respond?" } },

      { key:"ops", name:"Operations", accent:"ops", gate:80,
        dh:   { name:"Keystone", line:"Owns the connective tissue — the desk that keeps the office running." },
        ae:   { name:"Index",    line:"Owns the project filing cabinet and the follow-up calendar for the whole office." },
        pace: { name:"Meter",    line:"Releases at ≥80%; a cross-department conflict escalates to the COO." },
        lensA:{ name:"Method",   line:"Process lens — what's the cleanest repeatable way to run this?" },
        lensB:{ name:"Choke",    line:"Throughput lens — where's the bottleneck slowing the whole office?" } }
    ]
  };

  /* ================================================== the money & metrics spine
     Real formulas, computed off the seeded data. Nothing hard-coded, nothing
     invented — every KPI here is the same formula Deltek/BQE/Zweig publish. */

  /* Fee split by AIA phase. Returns the dollar value of each phase for a fee. */
  function feeByPhase(fee) {
    fee = Number(fee) || 0;
    return PHASES.filter(function (p) { return p.pct > 0; }).map(function (p) {
      return { k:p.k, name:p.name, pct:p.pct, amount: Math.round(fee * p.pct / 100), note:p.note };
    });
  }

  /* Fee from a percentage of the Cost of the Work (the owner's budget). */
  function feeFromConstruction(construction, pct) {
    return Math.round((Number(construction)||0) * (Number(pct)||0) / 100);
  }

  /* Percent-complete billing: what's earned to date, minus what's already billed. */
  function earnedToDate(c) {
    return Math.round((Number(c.fee)||0) * (Number(c.pctComplete)||0) / 100);
  }
  function readyToBill(c) {
    return Math.max(0, earnedToDate(c) - (Number(c.billed)||0));
  }

  /* Reimbursables: AIA B101 standard is cost + 10%. */
  var REIMB_MARKUP = 10;
  function reimbursable(cost, markup) {
    markup = (markup === undefined) ? REIMB_MARKUP : Number(markup);
    return Math.round((Number(cost)||0) * (1 + markup/100));
  }

  /* Utilization = direct (billable) hours / total hours. */
  function utilization(rows) {
    rows = rows || db().labor;
    var t = rows.reduce(function (s,r){ return s + (Number(r.hours)||0); }, 0);
    var b = rows.reduce(function (s,r){ return s + (Number(r.billable)||0); }, 0);
    return t ? (b / t) * 100 : 0;
  }

  /* Net multiplier = net revenue / direct labor cost. */
  function netMultiplier(d) {
    d = d || db();
    var rev = d.commissions.reduce(function (s,c){ return s + earnedToDate(c); }, 0);
    var lab = d.commissions.reduce(function (s,c){ return s + (Number(c.laborCost)||0); }, 0);
    return lab ? rev / lab : 0;
  }

  /* Realization = (value of billable work − what was written off) ÷ value of
     billable work. Both sides are the SAME period (this month), so the ratio is
     honest. Write-offs are a seeded field on each commission — the discounts,
     over-runs and courtesy hours a firm never invoices. That write-off number is
     exactly what most firms cannot produce, which is why 49% don't track this. */
  function billableValue(d) {
    d = d || db();
    return d.labor.reduce(function (s,r){ return s + (Number(r.billable)||0) * (Number(r.rate)||0); }, 0);
  }
  function writeOffs(d) {
    d = d || db();
    return d.commissions.reduce(function (s,c){ return s + (Number(c.writeOff)||0); }, 0);
  }
  function realization(d) {
    d = d || db();
    var worth = billableValue(d);
    if (!worth) return 0;
    return Math.max(0, Math.min(100, ((worth - writeOffs(d)) / worth) * 100));
  }

  /* Backlog in months = contracted-but-unearned fee / average monthly earned. */
  function backlogMonths(d) {
    d = d || db();
    var unearned = d.commissions.reduce(function (s,c){
      return s + Math.max(0, (Number(c.fee)||0) - earnedToDate(c));
    }, 0);
    var earned = d.commissions.reduce(function (s,c){ return s + earnedToDate(c); }, 0);
    var perMonth = earned / 12;
    return perMonth ? unearned / perMonth : 0;
  }

  /* AR aging — weighted average days outstanding on open invoices. */
  function arDays(d) {
    d = d || db();
    var open = d.invoices.filter(function (i){ return i.status === "Open"; });
    var amt = open.reduce(function (s,i){ return s + (Number(i.amount)||0); }, 0);
    if (!amt) return 0;
    var weighted = open.reduce(function (s,i){ return s + (Number(i.amount)||0) * (Number(i.age)||0); }, 0);
    return weighted / amt;
  }

  /* WIP — work performed, not yet invoiced. The number that surprises principals. */
  function wip(d) {
    d = d || db();
    return d.commissions.reduce(function (s,c){ return s + readyToBill(c); }, 0);
  }

  /* One call for the whole board, each metric tagged against its benchmark. */
  function kpis() {
    var d = db();
    var u = utilization(d.labor), nm = netMultiplier(d), rz = realization(d);
    var bl = backlogMonths(d), ar = arDays(d), w = wip(d);
    function band(v, b, higherIsBetter) {
      if (higherIsBetter === false) return v <= b.target[1] ? "good" : (v <= b.target[1] * 1.4 ? "watch" : "bad");
      if (v >= b.target[0]) return "good";
      if (v >= b.target[0] * 0.9) return "watch";
      return "bad";
    }
    return [
      { k:"utilization",   label:"Utilization",       value:u,  fmt:"pct", band:band(u, BENCH.utilization),
        bench:BENCH.utilization, help:"Billable hours ÷ total hours. Only 1 in 4 firms tracks this consistently." },
      { k:"netMultiplier", label:"Net multiplier",    value:nm, fmt:"x",   band:band(nm, BENCH.netMultiplier),
        bench:BENCH.netMultiplier, help:"Net revenue ÷ direct labor cost. Below 2.75 and overhead is eating the firm." },
      { k:"realization",   label:"Realization",       value:rz, fmt:"pct", band:band(rz, BENCH.realization),
        bench:BENCH.realization, help:"Billed ÷ what the billable work was worth. 49% of firms don't track it at all." },
      { k:"backlog",       label:"Backlog",           value:bl, fmt:"mo",  band:band(bl, BENCH.backlog),
        bench:BENCH.backlog, help:"Contracted but unearned fee, in months of work." },
      { k:"collection",    label:"AR aging",          value:ar, fmt:"days",band:band(ar, BENCH.collection, false),
        bench:BENCH.collection, help:"Weighted days outstanding. 56% of firms get paid more than 30 days out." },
      { k:"wip",           label:"WIP — unbilled",    value:w,  fmt:"money", band: w > 60000 ? "watch" : "good",
        bench:{ src:"Work performed, not yet invoiced — the number that most often surprises a principal." },
        help:"Earned but not billed. Every dollar here is work you've already paid for." }
    ];
  }

  /* ------------------------------------------------------------- the brain
     Deterministic, no LLM in the browser. Routes a question DOWN the chain and
     returns a real Output Contract: stance + confidence 0-100 + reasons tagged
     [data] / [assumption]. Below the bar OR estimate-only -> "needs a human". */
  var BRAIN = {
    pursuits: {
      match:["pursuit","rfq","rfp","go","no-go","win","proposal","fee","bid","shortlist","interview","lead","pipeline","backlog"],
      build: function (d) {
        var go = d.pursuits.filter(function (g){ return g.decision === "GO"; });
        var val = go.reduce(function (s,g){ return s + g.value; }, 0);
        var weighted = Math.round(d.pursuits.reduce(function (s,g){ return s + g.value * g.probability/100; }, 0));
        return {
          stance: go.length
            ? "Put the effort behind the " + go.length + " GO pursuits ($" + val.toLocaleString() + " of fee) and formally NO-GO Sandpoint — chasing it costs a principal week we don't have."
            : "Nothing is a clean GO right now. Qualify before spending principal hours.",
          conf: go.length >= 2 ? 84 : 66,
          reasons: [
            { t:"data", s: go.length + " pursuits are marked GO worth $" + val.toLocaleString() + " in fee; probability-weighted pipeline is $" + weighted.toLocaleString() + "." },
            { t:"data", s: "Backlog is " + backlogMonths(d).toFixed(1) + " months against a " + BENCH.backlog.median + "-month industry median — there's room, but not for a Sandpoint-scale reach." },
            { t:"assumption", s: "Post Falls is QBS (qualifications-based) — price can't be a selection factor, so the win rides on the reference sheets, not the fee." }
          ]
        };
      }
    },
    studio: {
      match:["design","phase","drawing","sheet","set","deliverable","production","schedule","sd","dd","cd","staff","capacity"],
      build: function (d) {
        var cd = d.commissions.filter(function (c){ return c.phase === "CD"; });
        var u = utilization(d.labor);
        return {
          stance: "Protect the Riverside CD set — it's the heaviest phase (40% of fee) and it's carrying the office. Hold Lakeside at SD until the shoreline variance is answered.",
          conf: 82,
          reasons: [
            { t:"data", s: cd.length + " commission(s) in CD, the 40%-of-fee phase. Riverside is " + (cd[0] ? cd[0].pctComplete : 0) + "% complete with permit cycle 2 open." },
            { t:"data", s: "Studio utilization is " + u.toFixed(0) + "% against a " + BENCH.utilization.target[0] + "–" + BENCH.utilization.target[1] + "% target band." },
            { t:"assumption", s: "Assumes Lakeside's variance goes to hearing — if it doesn't, SD reopens and the schedule slides a month." }
          ]
        };
      }
    },
    ca: {
      match:["rfi","submittal","asi","field","contractor","site","observation","ball","court","change","order","construction","log"],
      build: function (d) {
        var open = d.ca.filter(function (x){ return x.status === "Open" || x.status === "In Review"; });
        var ours = open.filter(function (x){ return x.ball === "Architect"; });
        var aged = open.filter(function (x){ return x.days > 10; });
        return {
          stance: ours.length
            ? "Clear the " + ours.length + " items sitting in our court first — SUB-058 storefront glazing is " + (aged[0] ? aged[0].days : 11) + " days out and past a normal 10-day review window."
            : "The log is clean on our side; the ball is with the contractor and consultants.",
          conf: 86,
          reasons: [
            { t:"data", s: open.length + " open items; " + ours.length + " have the ball in the Architect's court right now." },
            { t:"data", s: aged.length + " item(s) are past 10 days. Aging in our court is the one CA metric an owner will point at in a claim." },
            { t:"assumption", s: "PR-002 (PV conduit) becomes a Change Order once the GC prices it — treat it as cost impact, not an RFI answer." }
          ]
        };
      }
    },
    money: {
      match:["money","fee","invoice","billing","margin","multiplier","overhead","utilization","cash","ar","wip","collect","profit","rate"],
      build: function (d) {
        var w = wip(d), ar = arDays(d), nm = netMultiplier(d);
        return {
          stance: "Bill the $" + w.toLocaleString() + " of earned-but-unbilled work this week. Hayden and Lakeside are both " + Math.round(ar) + "+ days out — the money is already earned, it's just sitting.",
          conf: 79,   // deliberately under the 85 bar -> escalates, demonstrating the fence
          reasons: [
            { t:"data", s: "WIP is $" + w.toLocaleString() + " earned and not yet invoiced across " + d.commissions.length + " commissions." },
            { t:"data", s: "Net multiplier is " + nm.toFixed(2) + "x against a " + BENCH.netMultiplier.target[0] + "–" + BENCH.netMultiplier.target[1] + "x target (" + BENCH.netMultiplier.src + ")." },
            { t:"assumption", s: "Assumes no fee disputes on the aged invoices. Un-audited — a write-off would move realization, so this holds under the 85% Money bar." }
          ]
        };
      }
    },
    standards: {
      match:["spec","masterformat","code","detail","standard","division","section","material","assembly","egress","rated","library"],
      build: function (d) {
        var draft = d.specs.filter(function (s){ return s.status === "Draft"; });
        var subs = d.specs.reduce(function (s,x){ return s + x.submittals.length; }, 0);
        return {
          stance: "Issue the two Draft Hayden sections before DD closes — every Part 1 submittal requirement in them auto-builds the submittal log, and right now that log can't be built.",
          conf: 81,
          reasons: [
            { t:"data", s: draft.length + " section(s) still Draft; " + d.specs.length + " total sections generating " + subs + " submittal requirements." },
            { t:"data", s: "MasterFormat 50-division structure, 3-part sections — the submittal log builds from Part 1, not from memory." },
            { t:"assumption", s: "The egress-width comment on Riverside cycle 2 is a code interpretation — advisory only, confirm the position with the AHJ before we redraw." }
          ]
        };
      }
    },
    coord: {
      match:["consultant","ahj","permit","coordination","structural","mep","civil","c401","review","comment","jurisdiction","clash"],
      build: function (d) {
        var openP = d.permits.filter(function (p){ return p.status === "In review"; });
        var unresolved = openP.reduce(function (s,p){ return s + (p.comments - p.resolved); }, 0);
        var noAgreement = d.consultants.filter(function (k){ return k.agreement.indexOf("pending") >= 0; });
        return {
          stance: "Close the " + unresolved + " open AHJ comment(s) on Riverside before Addendum 2 goes out — and get Larch Landscape's C401 signed, because they're already producing.",
          conf: 83,
          reasons: [
            { t:"data", s: openP.length + " permit(s) in review, cycle " + (openP[0] ? openP[0].cycle : 0) + ", with " + unresolved + " comment(s) unresolved." },
            { t:"data", s: noAgreement.length + " consultant(s) working without an executed C401 — flow-down and insurance unconfirmed." },
            { t:"assumption", s: "Assumes cycle 3 is the last. A third round on egress would push the bid date, so the addendum has to answer it cleanly." }
          ]
        };
      }
    },
    hr: {
      match:["hire","hiring","onboard","license","licensure","ce","staff","team","people","payroll","axp","are","review","terminate"],
      build: function (d) {
        var team = d.team || [];
        var lapsing = team.filter(function (t){ return t.license && t.license.indexOf("2026") >= 0; });
        var onboarding = team.filter(function (t){ return t.status === "Onboarding"; });
        return {
          stance: lapsing.length
            ? "Marcus Lang's license renews this year and his CE is behind pace — get the HSW hours booked now. A lapsed stamp is a stop-work event, not an HR nicety."
            : "Licensure and CE are current across the team; next check is the quarterly review.",
          conf: 87,
          reasons: [
            { t:"data", s: team.filter(function(t){return t.type==="Human";}).length + " human seat(s); " + lapsing.length + " license(s) renewing this calendar year; " + onboarding.length + " mid-onboarding." },
            { t:"data", s: "Theo Barnes is at 2,940 of 3,740 AXP hours with 4 of 6 ARE divisions passed — a stampable second seat inside 18 months." },
            { t:"assumption", s: "A termination is never auto-run. It always routes to a human — flagged here, not executed." }
          ]
        };
      }
    },
    it: {
      match:["system","health","uptime","backup","outage","security","server","model","plot","storage","incident","slow","portal"],
      build: function (d) {
        var sys = d.systems || [];
        var watch = sys.filter(function (s){ return s.state !== "CLEAR"; });
        return {
          stance: watch.length
            ? "WATCH: " + watch.map(function (s){ return s.name; }).join(", ") + ". Nothing needs a human INTERVENE yet, but the consultant exchange is at 82% and a full drive during a CD push is a bad day."
            : "System is CLEAR — model store, plot queue and portal all reachable, backups verified.",
          conf: watch.length ? 84 : 89,
          reasons: [
            { t:"data", s: sys.length + " service(s) monitored; " + watch.length + " on WATCH, 0 on INTERVENE." },
            { t:"data", s: "Nightly backup of the drawing store verified at 04:12 — verified, not assumed. An unverified backup is not a backup." },
            { t:"assumption", s: "Assumes the showroom's checks mirror production. A true INTERVENE pages a person immediately." }
          ]
        };
      }
    },
    law: {
      match:["contract","legal","law","b101","c401","clause","liability","claim","insurance","e&o","agreement","terms","risk","standard of care"],
      build: function (d) {
        var open = (d.matters||[]).filter(function (m){ return m.state === "Open"; });
        var high = open.filter(function (m){ return m.risk === "High"; });
        return {
          stance: "Two matters need a licensed attorney before anyone signs: the Riverside redline that strikes the Additional Services trigger, and Larch producing with no executed C401.",
          conf: 68,   // deliberately under the 85 bar — legal caution, not a lawyer
          reasons: [
            { t:"data", s: open.length + " open matter(s) in the docket; " + high.length + " rated High risk." },
            { t:"assumption", s: "This is an advisory read, NOT legal advice. A real attorney owns the sign-off — that caps confidence under the 85% bar by design." },
            { t:"assumption", s: "Striking the Additional Services trigger in B101 §3.1 is how unlimited-revision scope creep becomes unbillable. Reads as high exposure; needs counsel to confirm." }
          ]
        };
      }
    },
    ops: {
      match:["operations","process","filing","calendar","follow","bottleneck","handoff","workflow","running","admin","record"],
      build: function (d) {
        var ours = d.ca.filter(function (x){ return x.ball === "Architect" && x.status !== "Closed"; });
        return {
          stance: "The bottleneck is the CA desk, not the studio — " + ours.length + " items sit in our court while the drawing team is fully utilized. Move a job captain to CA for two days.",
          conf: 81,
          reasons: [
            { t:"data", s: ours.length + " CA item(s) in the Architect's court; studio utilization is " + utilization(d.labor).toFixed(0) + "%." },
            { t:"data", s: "Every released conclusion is filed to the project record and gets a calendar follow-up — nothing drops silently." },
            { t:"assumption", s: "Assumes current staffing. Winning Post Falls would need a capacity review before the CD phase overlaps Riverside." }
          ]
        };
      }
    }
  };

  /* Run the org: route a question to a department, deliberate through the triad,
     gate on the Pacemaker's bar, and log every hop to the Event Bus. */
  function consult(deptKey, question) {
    var d = db();
    var dept = SEATS.depts.filter(function (x){ return x.key === deptKey; })[0];
    var brain = BRAIN[deptKey];
    if (!dept || !brain) return null;
    var verdict = brain.build(d, question || "");
    var passed = verdict.conf >= dept.gate;
    var topic = dept.key;
    var stamp = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

    var events = [
      { topic:topic+".sot.read", kind:"route", from:dept.dh.name, to:"Filing · SSOT",
        body: dept.dh.name + " is called to the Source of Truth and reads it before acting. SSOT loaded ✓ — canon, fences, and this project's record in hand.", stamp:stamp },
      { topic:topic+".ae.packaged", kind:"route", from:dept.ae.name, to:dept.pace.name,
        body: dept.ae.name + " (Administrative Executive) packages the ask, files it, and routes it down the bus to the triad: \"" + (question || "(department review)") + "\"", stamp:stamp },
      { topic:topic+".triad.finding", kind:"deliberate", from:dept.lensA.name, to:dept.pace.name,
        body: "[" + dept.lensA.name + "] " + lensTake(verdict, "A"), stamp:stamp },
      { topic:topic+".triad.finding", kind:"deliberate", from:dept.lensB.name, to:dept.pace.name,
        body: "[" + dept.lensB.name + "] " + lensTake(verdict, "B"), stamp:stamp }
    ];

    /* Lateral coordination: AEs talk ONLY to the same position in another
       department. Canon: lateral is same-position only; cross-position routes
       through the chain, never directly. */
    var COORD = {
      pursuits:  { to:"money",     why:"confirm the fee clears the net multiplier before the proposal goes out" },
      money:     { to:"pursuits",  why:"flag which pursuits are actually funded before they're forecast as backlog" },
      studio:    { to:"coord",     why:"line up consultant deliverable dates against the phase schedule" },
      ca:        { to:"standards", why:"pull the spec section behind the submittal before it's actioned" },
      standards: { to:"ca",        why:"hand the Part 1 submittal requirements to the log so it builds itself" },
      coord:     { to:"studio",    why:"get the AHJ comments into the set before the addendum is issued" },
      hr:        { to:"ops",       why:"get the new job captain onto the filing and follow-up calendar" },
      it:        { to:"ops",       why:"put the storage watch on the operations follow-up calendar" },
      law:       { to:"money",     why:"check whether the contract change moves the billing terms" },
      ops:       { to:"hr",        why:"raise the CA-desk staffing squeeze as a capacity question" }
    };
    var co = COORD[dept.key];
    if (co) {
      var peer = SEATS.depts.filter(function (x){ return x.key === co.to; })[0];
      if (peer) events.push({ topic:topic+".ae.lateral", kind:"route", from:dept.ae.name,
        to: peer.ae.name + " (" + peer.name + " AE)",
        body: dept.ae.name + " coordinates laterally with " + peer.ae.name + " to " + co.why + " — AE↔AE, same position, no chain needed.", stamp:stamp });
    }

    if (passed) {
      events.push({ topic:topic+".pacemaker.released", kind:"conclude", from:dept.pace.name, to:dept.ae.name,
        body: verdict.stance, conclusion:true, verdict:verdict, gate:dept.gate, stamp:stamp });
      events.push({ topic:topic+".ae.filed", kind:"route", from:dept.ae.name, to:dept.dh.name,
        body: dept.ae.name + " files the released conclusion to the project record and sets a follow-up on the calendar, then hands it to " + dept.dh.name + ".", stamp:stamp });
      events.push({ topic:"coo.decision", kind:"route", from:dept.dh.name, to:SEATS.coo.name + " (COO)",
        body: dept.dh.name + " carries it up to " + SEATS.coo.name + ", the interface to the principal: cleared the " + dept.gate + "% bar.", stamp:stamp });
    } else {
      events.push({ topic:"escalation.below_bar", kind:"reject", from:dept.pace.name, to:SEATS.coo.name + " → the Principal",
        body: "Held below the " + dept.gate + "% bar (" + verdict.conf + "%). Needs a human — not enough live data. " + dept.ae.name + " files the hold; " + SEATS.coo.name + " routes it up with reasons attached.",
        conclusion:true, verdict:verdict, gate:dept.gate, escalate:true, stamp:stamp });
    }

    save(function (x){
      events.forEach(function (e){ e.id = "e" + (x.seq++); e.dept = dept.key; x.bus.push(e); });
      if (x.bus.length > 60) x.bus = x.bus.slice(-60);
    });
    return { dept:dept, verdict:verdict, passed:passed, events:events };
  }

  function lensTake(v, which) {
    var pro = v.reasons.filter(function (r){ return r.t === "data"; })[0];
    var con = v.reasons.filter(function (r){ return r.t === "assumption"; })[0];
    if (which === "A") return "Argues FOR: " + (pro ? pro.s : "the evidence supports moving.");
    return "Pushes back: " + (con ? con.s : "the evidence isn't fully sourced yet.");
  }

  /* ---- The Interface: Nora (COO) as a machine of her own ----
     She does NOT do the department work. She is the single gate between the
     department heads and the principal: reads the ask, routes it, lets that
     chain work under its own bar, packages ONE clean answer back up. */
  function routeDept(question) {
    var q = String(question || "").toLowerCase();
    var best = null, bestScore = 0;
    Object.keys(BRAIN).forEach(function (k) {
      var score = BRAIN[k].match.reduce(function (s, w) { return s + (q.indexOf(w) >= 0 ? 1 : 0); }, 0);
      if (score > bestScore) { bestScore = score; best = k; }
    });
    return best || "studio";
  }

  function askNora(question) {
    var deptKey = routeDept(question);
    var dept = SEATS.depts.filter(function (x){ return x.key === deptKey; })[0];
    var stamp = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    save(function (x){
      x.bus.push({ id:"e"+(x.seq++), dept:"coo", topic:"coo.route", kind:"route",
        from: SEATS.coo.name + " (COO)", to: dept.dh.name + " (" + dept.name + ")",
        body: SEATS.coo.name + " takes the ask off the principal's desk and routes it to " + dept.name + " — she gates and packages, she doesn't do the work herself.",
        stamp: stamp });
    });
    var r = consult(deptKey, question);
    var packaged = r.passed
      ? (SEATS.coo.name + ": On track. " + dept.name + " cleared its " + dept.gate + "% bar — I'm releasing this to you. " + r.verdict.stance)
      : (SEATS.coo.name + ": Holding this off your desk. " + dept.name + " came in at " + r.verdict.conf + "%, under its " + dept.gate + "% bar — it needs a human. Here's what I have, and I've set a follow-up. " + r.verdict.stance);
    return { deptKey:deptKey, dept:dept, result:r, packaged:packaged, on_track:r.passed };
  }

  /* ----------------------------------------------------------- approval desk
     Ghost Mode gate. Goal: keep it nearly EMPTY. The org clears everything it
     honestly can; only true fences reach the principal. Approving here does
     NOT send anything — this is a showroom. */
  function approvals() { return db().approvals || []; }
  function stage(kind, title, summary, why, by) {
    var item = { id:"ap" + now(), kind:kind || "general", title:title || "Untitled",
      summary:summary || "", why:why || "Behind a fence — needs the principal.",
      by:by || "The org", state:"Pending" };
    save(function (d){ (d.approvals = d.approvals || []).push(item); });
    return item;
  }
  function decideApproval(id, decision) {
    save(function (d){ (d.approvals||[]).forEach(function (a){ if (a.id === id) a.state = decision; }); });
    return approvals();
  }

  /* ============================================== the configurator (à la carte)
     A tier is a starting package. From there the deal adds a department or
     takes one off, and the price moves by that department's own line item. */
  function tier() { return db().tier || "grandsuite"; }
  function tierRank() { return TIERS[tier()].rank; }
  function tierByRank(r){ for (var k in TIERS) if (TIERS[k].rank === r) return k; return "grandsuite"; }

  /* Switching packages resets the à-la-carte deltas — you're picking a new box. */
  function setTier(k) { save(function (d){ d.tier = k; d.adds = []; d.offs = []; }); }

  /* The rooms actually switched on right now. */
  function activeRooms() {
    var d = db();
    var inc = (TIERS[d.tier] || TIERS.grandsuite).includes.slice();
    (d.offs || []).forEach(function (k) { var i = inc.indexOf(k); if (i >= 0) inc.splice(i, 1); });
    (d.adds || []).forEach(function (k) { if (inc.indexOf(k) < 0 && ROOMS[k]) inc.push(k); });
    return inc;
  }
  function hasRoom(k) { return !k || activeRooms().indexOf(k) >= 0; }

  /* Toggle one department on or off against the current package. */
  function toggleRoom(k) {
    if (!ROOMS[k]) return;
    save(function (d) {
      var inc = (TIERS[d.tier] || TIERS.grandsuite).includes;
      d.adds = d.adds || []; d.offs = d.offs || [];
      var inPackage = inc.indexOf(k) >= 0;
      var iAdd = d.adds.indexOf(k), iOff = d.offs.indexOf(k);
      if (inPackage) {
        if (iOff >= 0) d.offs.splice(iOff, 1); else d.offs.push(k);
      } else {
        if (iAdd >= 0) d.adds.splice(iAdd, 1); else d.adds.push(k);
      }
    });
  }

  /* What the configured build costs right now, and what the bundle saves.
     Package price + adds − removes. À-la-carte total is every active room at
     list, so the discount the package represents is visible, not asserted. */
  function priceNow() {
    var d = db();
    var t = TIERS[d.tier] || TIERS.grandsuite;
    var adds = (d.adds || []).filter(function (k){ return ROOMS[k]; });
    var offs = (d.offs || []).filter(function (k){ return ROOMS[k]; });
    var addMo   = adds.reduce(function (s,k){ return s + ROOMS[k].mo; }, 0);
    var addBuild= adds.reduce(function (s,k){ return s + ROOMS[k].build; }, 0);
    var offMo   = offs.reduce(function (s,k){ return s + ROOMS[k].mo; }, 0);
    var offBuild= offs.reduce(function (s,k){ return s + ROOMS[k].build; }, 0);
    var rooms = activeRooms();
    var alaMo    = rooms.reduce(function (s,k){ return s + (ROOMS[k] ? ROOMS[k].mo : 0); }, 0);
    var alaBuild = rooms.reduce(function (s,k){ return s + (ROOMS[k] ? ROOMS[k].build : 0); }, 0);
    var mo    = Math.max(0, t.mo + addMo - offMo);
    var build = Math.max(0, t.build + addBuild - offBuild);
    return {
      tier:t, rooms:rooms, adds:adds, offs:offs,
      mo:mo, build:build,
      addMo:addMo, offMo:offMo, addBuild:addBuild, offBuild:offBuild,
      alaMo:alaMo, alaBuild:alaBuild,
      /* the platform line: seats, environment, the part that isn't a department */
      platformMo: Math.max(0, mo - alaMo),
      savingMo: Math.max(0, alaMo - mo),
      changed: adds.length > 0 || offs.length > 0
    };
  }
  function priceLabel() {
    var p = priceNow();
    return money(p.mo) + "/mo · " + money(p.build) + " build";
  }

  function el(html) { var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); }
  function money(n){ return "$" + (Math.round(Number(n)||0)).toLocaleString(); }
  function pct(n, dp){ return (Number(n)||0).toFixed(dp === undefined ? 0 : dp) + "%"; }

  function renderShell(active) {
    var side = document.createElement("aside"); side.className = "sidebar";
    side.appendChild(el(
      '<a href="dashboard.html" class="brand">' +
        '<div class="bmark" aria-hidden="true">' +
          '<svg viewBox="0 0 32 32" width="26" height="26"><g fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<path d="M4 27 L16 5 L28 27"/><path d="M9.5 27 L16 14.5 L22.5 27"/><path d="M2 27 H30"/>' +
          '</g></svg>' +
        '</div>' +
        '<div><div class="bt">Buttress OS</div><div class="bs">Architecture Practice OS</div></div>' +
      '</a>'
    ));
    var nav = document.createElement("nav"); nav.className = "nav";
    var on = activeRooms();
    DEPTS.forEach(function (grp) {
      nav.appendChild(el('<div class="nav-group">' + esc(grp.group) + '</div>'));
      grp.items.forEach(function (it) {
        var off = it.room && on.indexOf(it.room) < 0;
        var a = el('<a href="' + (off ? "javascript:void(0)" : it.href) + '" class="navlink ' +
          (it.href === active ? "active" : "") + (off ? " locked" : "") + '"' +
          (it.accent ? ' data-accent="' + it.accent + '"' : "") + '>' +
          '<span class="ic">' + it.ic + '</span><span class="lb">' + esc(it.label) + '</span>' +
          (off ? '<span class="tier-tag">+' + money(ROOMS[it.room].mo) + '</span>' : '') + '</a>');
        if (off) {
          a.title = "Not in this build — add " + ROOMS[it.room].label +
                    " for " + money(ROOMS[it.room].mo) + "/mo + " + money(ROOMS[it.room].build) + " build";
          a.addEventListener("click", function () {
            toggleRoom(it.room);
            toast(ROOMS[it.room].label + " added — " + priceLabel(), "ok");
            setTimeout(function (){ location.reload(); }, 500);
          });
        }
        nav.appendChild(a);
      });
    });
    side.appendChild(nav);
    return side;
  }

  function renderTopbar(crumb) {
    var p = priceNow();
    var bar = document.createElement("div"); bar.className = "topbar";
    bar.innerHTML =
      '<div class="crumbs">Buttress OS <span class="mono" style="opacity:.62;font-size:11px">V2.0</span> · <b>' + esc(crumb) + '</b></div>' +
      '<div class="spacer"></div>' +
      '<div class="tierpill" id="tierPill" role="button" tabindex="0">' +
        '<span class="dot"></span><div><b>' + esc(p.tier.name) + (p.changed ? ' <i class="cfg">configured</i>' : '') + '</b> ' +
        '<span class="price">' + money(p.mo) + '/mo · ' + money(p.build) + ' build</span></div>' +
        '<span class="chev">▾</span></div>' +
      '<div class="who"><div class="av">DW</div><div>Dana Whitfield<br>' +
        '<span class="muted small">Principal · Architect of Record</span></div></div>';

    var menu = document.createElement("div"); menu.className = "tiermenu"; menu.id = "tierMenu";
    menu.appendChild(el('<div class="tm-head">Start from a package, then <b>add or take off any department</b>. ' +
      'Every one is priced on its own, so the build fits the firm instead of the firm fitting the build.</div>'));

    /* the three packages */
    Object.keys(TIERS).sort(function (a,b){ return TIERS[b].rank - TIERS[a].rank; }).forEach(function (k) {
      var tt = TIERS[k];
      var opt = el('<div class="tieropt ' + (k === tier() ? "on" : "") + '">' +
        '<div class="to-top"><span class="to-name">' + esc(tt.name) + '</span>' +
        '<span class="to-price">' + money(tt.mo) + '/mo · ' + money(tt.build) + ' build</span></div>' +
        '<div class="to-desc">' + esc(tt.desc) + '</div>' +
        '<div class="to-base">' + esc(tt.base) + ' · ' + tt.includes.length + ' departments</div></div>');
      opt.addEventListener("click", function (e) { e.stopPropagation(); setTier(k); location.reload(); });
      menu.appendChild(opt);
    });

    /* the à-la-carte department list */
    menu.appendChild(el('<div class="tm-sub">Departments — toggle any one on or off</div>'));
    var on = activeRooms();
    var list = document.createElement("div"); list.className = "roomlist";
    Object.keys(ROOMS).forEach(function (k) {
      var r = ROOMS[k], isOn = on.indexOf(k) >= 0;
      var inPack = p.tier.includes.indexOf(k) >= 0;
      var row = el('<div class="roomrow ' + (isOn ? "on" : "") + '">' +
        '<span class="rr-box">' + (isOn ? "✓" : "+") + '</span>' +
        '<span class="rr-name">' + esc(r.label) +
          (isOn && !inPack ? ' <i class="rr-flag add">added</i>' : '') +
          (!isOn && inPack ? ' <i class="rr-flag off">removed</i>' : '') + '</span>' +
        '<span class="rr-price">' + money(r.mo) + '/mo<i>' + money(r.build) + ' build</i></span>' +
        '<span class="rr-why">' + esc(r.why) + '</span></div>');
      row.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleRoom(k);
        toast(r.label + (activeRooms().indexOf(k) >= 0 ? " added — " : " removed — ") + priceLabel(), "ok");
        setTimeout(function (){ location.reload(); }, 500);
      });
      list.appendChild(row);
    });
    menu.appendChild(list);

    /* the running total */
    var totalRow = '<div class="tm-total">' +
      '<div class="tt-line"><span>' + esc(p.tier.name) + ' package</span><b>' + money(p.tier.mo) + '/mo</b></div>' +
      (p.adds.length ? '<div class="tt-line add"><span>+ ' + p.adds.length + ' department' + (p.adds.length>1?"s":"") + ' added</span><b>+' + money(p.addMo) + '/mo</b></div>' : '') +
      (p.offs.length ? '<div class="tt-line off"><span>− ' + p.offs.length + ' department' + (p.offs.length>1?"s":"") + ' removed</span><b>−' + money(p.offMo) + '/mo</b></div>' : '') +
      '<div class="tt-line grand"><span>Configured</span><b>' + money(p.mo) + '/mo · ' + money(p.build) + ' build</b></div>' +
      '<div class="tt-save">' + p.rooms.length + ' department' + (p.rooms.length === 1 ? "" : "s") +
        ' at ' + money(p.alaMo) + '/mo, plus ' + money(p.platformMo) + '/mo platform — ' +
        esc(p.tier.base.toLowerCase()) + '.</div>' +
      '<div class="tt-draft">Draft pricing — Accelerated Experiences LLC sets every live price.</div>' +
      '</div>';
    menu.appendChild(el(totalRow));
    menu.addEventListener("click", function (e) { e.stopPropagation(); });

    setTimeout(function () {
      var pill = document.getElementById("tierPill");
      if (pill) pill.addEventListener("click", function (e) { e.stopPropagation(); menu.classList.toggle("open"); });
      document.addEventListener("click", function () { menu.classList.remove("open"); });
    }, 0);
    var frag = document.createDocumentFragment(); frag.appendChild(bar); frag.appendChild(menu);
    return frag;
  }

  function ribbon() {
    return el('<div class="ribbon"><span class="live">LIVE SHOWROOM</span>' +
      ' — this is the real OS, not a slideshow. Everything you type stays in your browser and resets when you leave. ' +
      '<a href="javascript:void(0)" id="resetFloor">Reset the floor</a></div>');
  }
  function footer() {
    return el('<div class="ae-credit">Powered by <b>Accelerated Experiences LLC</b> · Buttress OS is a white-label build. ' +
      'Demo data is illustrative; benchmark figures are sourced and tagged.</div>');
  }

  function mount(opts) {
    opts = opts || {};
    db();
    var app = document.createElement("div"); app.className = "app";
    var side = renderShell(opts.active);
    var main = document.createElement("div"); main.className = "main";
    main.appendChild(ribbon());
    main.appendChild(renderTopbar(opts.crumb || "Command Center"));
    var content = document.createElement("div"); content.className = "content"; content.id = "content";
    main.appendChild(content);
    main.appendChild(footer());
    app.appendChild(side); app.appendChild(main);
    document.body.innerHTML = ""; document.body.appendChild(app);
    document.body.appendChild(el('<div id="toast-wrap"></div>'));
    setTimeout(function () {
      var r = document.getElementById("resetFloor");
      if (r) r.addEventListener("click", function () {
        resetFloor(); toast("Showroom reset to a fresh floor.", "ok");
        setTimeout(function (){ location.reload(); }, 450);
      });
    }, 0);
    return content;
  }

  function toast(msg, kind) {
    var w = document.getElementById("toast-wrap"); if (!w) return;
    var t = el('<div class="toast ' + (kind || "") + '">' + esc(msg) + '</div>');
    w.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; setTimeout(function (){ t.remove(); }, 250); }, 2600);
  }

  /* Small shared view helpers so every page looks like one product. */
  function page(title, sub, actionsHTML) {
    return el('<div class="pagehead"><div><h1>' + esc(title) + '</h1>' +
      (sub ? '<p class="sub">' + sub + '</p>' : "") + '</div>' +
      '<div class="pagehead-actions">' + (actionsHTML || "") + '</div></div>');
  }
  function card(inner, cls) {
    return el('<section class="card ' + (cls || "") + '">' + inner + '</section>');
  }
  function stat(label, value, note, band) {
    return '<div class="stat ' + (band || "") + '"><div class="s-l">' + esc(label) + '</div>' +
      '<div class="s-v">' + value + '</div>' +
      (note ? '<div class="s-n">' + note + '</div>' : "") + '</div>';
  }
  function tag(text, kind) { return '<span class="tag ' + (kind || "") + '">' + esc(text) + '</span>'; }
  function srcNote(text) { return '<div class="srcnote">Source: ' + esc(text) + '</div>'; }

  document.addEventListener("visibilitychange", function () { if (!document.hidden) db(); });

  /* -------------------------------------------------------------- public API */
  global.Buttress = {
    /* store */
    db:db, save:save, resetFloor:resetFloor, fresh:fresh, SEED:SEED,
    /* industry canon */
    PHASES:PHASES, CA_TYPES:CA_TYPES, CA_STATUS:CA_STATUS, BALL:BALL,
    SUBMITTAL_ACTIONS:SUBMITTAL_ACTIONS, DISCIPLINES:DISCIPLINES, SHEET_TYPES:SHEET_TYPES,
    ISSUE_SETS:ISSUE_SETS, MF_DIVISIONS:MF_DIVISIONS, BENCH:BENCH, PAIN:PAIN, REPLACES:REPLACES,
    /* tiers, the price book, the configurator + org */
    TIERS:TIERS, ROOMS:ROOMS, DEPTS:DEPTS, SEATS:SEATS, BRAIN:BRAIN,
    tier:tier, tierRank:tierRank, setTier:setTier, tierByRank:tierByRank,
    activeRooms:activeRooms, hasRoom:hasRoom, toggleRoom:toggleRoom,
    priceNow:priceNow, priceLabel:priceLabel,
    consult:consult, askNora:askNora, routeDept:routeDept,
    /* money + metrics */
    feeByPhase:feeByPhase, feeFromConstruction:feeFromConstruction,
    earnedToDate:earnedToDate, readyToBill:readyToBill, reimbursable:reimbursable,
    REIMB_MARKUP:REIMB_MARKUP,
    utilization:utilization, netMultiplier:netMultiplier, realization:realization,
    backlogMonths:backlogMonths, arDays:arDays, wip:wip, kpis:kpis,
    /* approvals */
    approvals:approvals, stage:stage, decideApproval:decideApproval,
    /* ui */
    mount:mount, toast:toast, el:el, esc:esc, money:money, pct:pct,
    page:page, card:card, stat:stat, tag:tag, srcNote:srcNote
  };
})(window);
