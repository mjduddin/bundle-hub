/* Leadership stats page — reads ONLY the aggregate v_stats_* views.
   The public key cannot read the raw events/survey tables (RLS insert-only). */
"use strict";

const SUPABASE_URL = "https://swtlpjvsihuyfcduogkb.supabase.co";
const SUPABASE_KEY = "sb_publishable_cOzE2PeI4vxBiL_vc30HOQ_9IK2dusz";
const NAMES = {skin:"Skin Protection",falls:"Fall Prevention",infection:"Infection Prevention",palliative:"Palliative Comfort",admission:"Admission Readiness",discharge:"Discharge Readiness",lines:"Lines/Tubes/Devices",mobility:"Mobility",behavior:"Behavior & Safety"};

function get(view) {
  return fetch(SUPABASE_URL + "/rest/v1/" + view + "?select=*", {
    headers: { "apikey": SUPABASE_KEY, "Authorization": "Bearer " + SUPABASE_KEY }
  }).then(function (r) { if (!r.ok) throw new Error(view + " HTTP " + r.status); return r.json(); });
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function barList(container, rows, labelKey, valueKey, color) {
  container.textContent = "";
  if (!rows.length) { container.appendChild(el("p", "empty-note", "No data yet.")); return; }
  const max = Math.max.apply(null, rows.map(function (r) { return Number(r[valueKey]) || 0; })) || 1;
  rows.forEach(function (r) {
    const row = el("div", "barrow");
    const lbl = el("div", "lbl");
    lbl.appendChild(el("strong", null, String(r[labelKey])));
    lbl.appendChild(el("span", null, String(r[valueKey])));
    const bar = el("div", "bar" + (color ? " " + color : ""));
    const fill = el("span");
    fill.style.width = Math.max(2, Math.round(100 * (Number(r[valueKey]) || 0) / max)) + "%";
    bar.appendChild(fill);
    row.appendChild(lbl); row.appendChild(bar);
    container.appendChild(row);
  });
}

function table(container, heads, rows, emptyMsg) {
  container.textContent = "";
  if (!rows.length) { container.appendChild(el("p", "empty-note", emptyMsg || "No data yet.")); return; }
  const t = el("table", "stat-table");
  const tr = el("tr");
  heads.forEach(function (h) { tr.appendChild(el("th", null, h)); });
  t.appendChild(tr);
  rows.forEach(function (r) {
    const row = el("tr");
    r.forEach(function (c, i) { row.appendChild(el("td", i > 0 ? "num" : null, String(c))); });
    t.appendChild(row);
  });
  container.appendChild(t);
}

Promise.all([
  get("v_stats_weekly"), get("v_stats_bundle"), get("v_stats_source"),
  get("v_stats_placement"), get("v_stats_unit_shift"), get("v_stats_helpful"),
  get("v_stats_survey")
]).then(function (res) {
  const weekly = res[0].sort(function (a, b) { return a.week < b.week ? -1 : 1; });
  const bundle = res[1].sort(function (a, b) { return b.views - a.views; });
  const source = res[2], placement = res[3], shift = res[4], helpful = res[5], survey = res[6];

  /* KPIs */
  const totalViews = bundle.reduce(function (s, r) { return s + Number(r.views); }, 0);
  const sessions = weekly.reduce(function (s, r) { return s + Number(r.unique_sessions); }, 0);
  const qrViews = source.filter(function (r) { return r.source === "qr"; })
                        .reduce(function (s, r) { return s + Number(r.views); }, 0);
  const up = helpful.reduce(function (s, r) { return s + Number(r.thumbs_up); }, 0);
  const down = helpful.reduce(function (s, r) { return s + Number(r.thumbs_down); }, 0);

  document.getElementById("k-views").textContent = totalViews;
  document.getElementById("k-sessions").textContent = sessions;
  document.getElementById("k-qr").textContent = totalViews ? Math.round(100 * qrViews / totalViews) + "%" : "–";
  document.getElementById("k-reach").textContent = bundle.length;
  document.getElementById("k-helpful").textContent = (up + down) ? Math.round(100 * up / (up + down)) + "%" : "–";

  /* Weekly run chart */
  barList(document.getElementById("w-weekly"),
    weekly.map(function (r) { return { l: "Week of " + r.week, v: r.bundle_views }; }), "l", "v");

  /* Per bundle */
  barList(document.getElementById("w-bundle"),
    bundle.map(function (r) { return { l: NAMES[r.bundle_id] || r.bundle_id, v: r.views }; }), "l", "v");

  /* Source */
  table(document.getElementById("w-source"), ["Source · Device", "Views"],
    source.sort(function (a, b) { return b.views - a.views; })
          .map(function (r) { return [r.source + " · " + r.device_type, r.views]; }),
    "No views yet.");

  /* Placement */
  table(document.getElementById("w-placement"), ["Placement", "QR scans"],
    placement.sort(function (a, b) { return b.scans - a.scans; })
             .map(function (r) { return [r.location_tag, r.scans]; }),
    "No QR scans yet — codes not placed.");

  /* Unit & shift */
  table(document.getElementById("w-shift"), ["Unit", "Shift", "Views"],
    shift.sort().map(function (r) { return [r.unit, r.shift, r.views]; }),
    "No views yet.");

  /* Helpful */
  barList(document.getElementById("w-helpful"),
    helpful.map(function (r) {
      return { l: (NAMES[r.bundle_id] || r.bundle_id) + "  (👍" + r.thumbs_up + " / 👎" + r.thumbs_down + ")", v: r.thumbs_up };
    }), "l", "v", "gold");

  /* Survey */
  table(document.getElementById("w-survey"),
    ["Survey", "Responses", "Avg ease (goal ≥ 4.0)", "Avg burden (higher = less burden)", "Found what they needed (yes/no)"],
    survey.map(function (r) {
      return [r.survey_type, r.responses, r.avg_ease || "–", r.avg_burden || "–", r.found_yes + " / " + r.found_no];
    }),
    "No baseline or post-pilot survey responses yet.");

  document.getElementById("updated").textContent =
    "Live data · updated " + new Date().toLocaleString() + " · refresh the page for the latest numbers.";
}).catch(function (e) {
  document.getElementById("updated").textContent =
    "Could not load live data (" + e.message + "). Refresh to retry.";
});
