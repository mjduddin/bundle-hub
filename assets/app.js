/* ==========================================================================
   Bundle Hub — app.js
   Rendering, anonymous analytics, and feedback/survey submission.
   Design rule: the UI NEVER breaks or blocks if logging fails.
   ========================================================================== */
"use strict";

/* ----------------------- CONFIGURE ME ----------------------- */
const CONFIG = {
  SITE_NAME: "5E/4F Bundle Hub",
  SUPABASE_URL: "https://swtlpjvsihuyfcduogkb.supabase.co",
  // Publishable key — safe to ship client-side ONLY because Row-Level Security
  // is enabled with INSERT-only policies and no public SELECT (verified).
  SUPABASE_ANON_KEY: "sb_publishable_cOzE2PeI4vxBiL_vc30HOQ_9IK2dusz",
  BACKEND_MODE: "supabase",   // "supabase" or "netlify-forms"
  PILOT_UNITS: ["5E", "4F"]
};
/* ------------------------------------------------------------- */

const SECTION_ORDER = [
  ["trigger", "Trigger", "⚠️"],
  ["supplies", "Supplies", "🧰"],
  ["rnActions", "RN Actions", "🩺"],
  ["ancillaryActions", "Ancillary Actions", "🤝"],
  ["documentation", "Documentation", "📝"],
  ["escalation", "Escalation", "🚨"],
  ["auditItem", "Audit Item", "✅"]
];

/* ---------- helpers ---------- */
function qs(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function sessionId() {
  try {
    let id = sessionStorage.getItem("bh_session");
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID()
            : String(Date.now()) + "-" + Math.random().toString(36).slice(2));
      sessionStorage.setItem("bh_session", id);
    }
    return id;
  } catch (e) { return "no-storage"; }
}

function deviceType() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function backendReady() {
  return CONFIG.BACKEND_MODE === "netlify-forms" ||
    (CONFIG.SUPABASE_URL !== "TBD" && CONFIG.SUPABASE_ANON_KEY !== "TBD");
}

/* Fire-and-forget insert. Never throws to the caller. */
function insertRow(table, row) {
  try {
    if (!backendReady()) { console.info("[BundleHub] backend not configured; skipped:", table, row); return; }
    if (CONFIG.BACKEND_MODE === "netlify-forms") {
      const body = new URLSearchParams({ "form-name": table, ...flatten(row) }).toString();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
        keepalive: true
      }).catch(function () {});
      return;
    }
    fetch(CONFIG.SUPABASE_URL + "/rest/v1/" + table, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": CONFIG.SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + CONFIG.SUPABASE_ANON_KEY,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(row),
      keepalive: true
    }).catch(function () {});
  } catch (e) { /* analytics must never break the UI */ }
}

function flatten(obj) {
  const out = {};
  Object.keys(obj).forEach(function (k) {
    if (obj[k] !== null && obj[k] !== undefined) out[k] = String(obj[k]);
  });
  return out;
}

function logEvent(type, props) {
  props = props || {};
  insertRow("events", {
    event_type: type,
    bundle_id: props.bundle_id || null,
    source: props.source || qs("src") || "direct",
    location_tag: props.location_tag || qs("loc") || null,
    unit: props.unit || qs("unit") || "unknown",
    device_type: deviceType(),
    dwell_seconds: props.dwell_seconds || null,
    session_id: sessionId()
  });
}

function submitSurvey(payload) {
  insertRow("survey_responses", payload);
}

/* Very light client-side PHI guard for free text (warn, not diagnose). */
function looksLikePHI(text) {
  if (!text) return false;
  const ssn = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/;
  const mrn = /\b(mrn|med(ical)? record|ssn|dob|date of birth)\b/i;
  const room = /\b(room|rm|bed)\s*#?\s*\d{2,4}\b/i;
  return ssn.test(text) || mrn.test(text) || room.test(text);
}

/* ---------- data ---------- */
/* Bundle content is loaded via a <script src="../bundles.js"> tag, which works
   both on the live site AND when files are opened directly from a computer
   (file://), where fetch() of local JSON is blocked by browsers. */
function getBundles() {
  if (window.BUNDLES_DATA && window.BUNDLES_DATA.bundles) {
    return Promise.resolve(window.BUNDLES_DATA);
  }
  return Promise.reject(new Error("bundles.js not loaded"));
}

function visibleBundles(data) {
  const preview = qs("preview") === "1";
  return data.bundles.filter(function (b) { return preview || !b.draft; });
}

function escapeHTML(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

/* ---------- page: landing ---------- */
function initLanding() {
  logEvent("landing_view");
  const grid = document.getElementById("bundle-grid");
  const filterBar = document.getElementById("filter-bar");
  const errBox = document.getElementById("load-error");

  getBundles().then(function (data) {
    const bundles = visibleBundles(data);
    let activeUnit = "ALL";

    function render() {
      grid.innerHTML = "";
      bundles
        .filter(function (b) { return activeUnit === "ALL" || (b.units || []).indexOf(activeUnit) !== -1; })
        .forEach(function (b) {
          const a = document.createElement("a");
          a.className = "card bundle-card" + (b.id === "palliative" ? " accent-gold" : "");
          a.href = "bundle.html?id=" + encodeURIComponent(b.id) + "&src=landing";
          a.innerHTML =
            '<span class="units-tag">' + escapeHTML((b.units || []).join(" · ")) + "</span>" +
            "<h3>" + escapeHTML(b.name) + "</h3>" +
            '<span class="phrase">“' + escapeHTML(b.phrase) + '”</span>' +
            '<p>' + escapeHTML(b.goal || "") + "</p>" +
            '<span class="cta">Open bundle →</span>';
          grid.appendChild(a);
        });
      if (!grid.children.length) {
        grid.innerHTML = '<p>No bundles published for this unit yet.</p>';
      }
    }

    ["ALL"].concat(CONFIG.PILOT_UNITS).forEach(function (u) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn";
      btn.textContent = u === "ALL" ? "All units" : "Unit " + u;
      btn.setAttribute("aria-pressed", u === "ALL" ? "true" : "false");
      btn.addEventListener("click", function () {
        activeUnit = u;
        filterBar.querySelectorAll(".filter-btn").forEach(function (b2) {
          b2.setAttribute("aria-pressed", "false");
        });
        btn.setAttribute("aria-pressed", "true");
        render();
      });
      filterBar.appendChild(btn);
    });

    render();
  }).catch(function () {
    if (errBox) errBox.hidden = false;
  });
}

/* ---------- page: bundle ---------- */
function initBundle() {
  const id = qs("id");
  const container = document.getElementById("bundle-content");
  const notFound = document.getElementById("not-found");
  const titleEl = document.getElementById("bundle-title");

  getBundles().then(function (data) {
    const bundle = visibleBundles(data).find(function (b) { return b.id === id; });
    if (!bundle) {
      notFound.hidden = false;
      container.hidden = true;
      document.title = "Bundle not found | " + CONFIG.SITE_NAME;
      return;
    }

    document.title = bundle.name + " | " + CONFIG.SITE_NAME;
    titleEl.textContent = bundle.name;
    document.getElementById("phrase-text").textContent = "“" + bundle.phrase + "”";
    document.getElementById("bundle-goal").textContent = bundle.goal || "";
    document.getElementById("bundle-units").textContent = "Units: " + (bundle.units || []).join(", ");

    const secWrap = document.getElementById("sections");
    SECTION_ORDER.forEach(function (def) {
      const key = def[0], label = def[1], icon = def[2];
      const sec = document.createElement("section");
      sec.className = "bundle-section" + (key === "escalation" ? " escalation" : "");
      sec.innerHTML =
        '<h2><span class="sec-icon" aria-hidden="true">' + icon + "</span>" + escapeHTML(label) + "</h2>" +
        "<p>" + escapeHTML(bundle[key] || "") + "</p>";
      secWrap.appendChild(sec);
    });

    /* related bundles */
    const relWrap = document.getElementById("related");
    visibleBundles(data)
      .filter(function (b) { return b.id !== id; })
      .slice(0, 3)
      .forEach(function (b) {
        const a = document.createElement("a");
        a.href = "bundle.html?id=" + encodeURIComponent(b.id) + "&src=landing";
        a.textContent = b.name;
        const li = document.createElement("li");
        li.appendChild(a);
        relWrap.appendChild(li);
      });

    logEvent("bundle_view", { bundle_id: id });

    /* dwell tracking */
    const t0 = Date.now();
    let dwellSent = false;
    function sendDwell() {
      if (dwellSent) return;
      dwellSent = true;
      logEvent("bundle_dwell", { bundle_id: id, dwell_seconds: Math.round((Date.now() - t0) / 1000) });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") sendDwell();
    });
    window.addEventListener("pagehide", sendDwell);

    /* quick feedback */
    const fbYes = document.getElementById("fb-yes");
    const fbNo = document.getElementById("fb-no");
    const fbComment = document.getElementById("fb-comment");
    const fbSend = document.getElementById("fb-send");
    const fbThanks = document.getElementById("fb-thanks");
    const fbErr = document.getElementById("fb-phi-warn");
    let helpful = null;

    function pick(val, btnOn, btnOff) {
      helpful = val;
      btnOn.setAttribute("aria-pressed", "true");
      btnOff.setAttribute("aria-pressed", "false");
      logEvent("feedback_click", { bundle_id: id });
    }
    fbYes.addEventListener("click", function () { pick(true, fbYes, fbNo); });
    fbNo.addEventListener("click", function () { pick(false, fbNo, fbYes); });

    fbSend.addEventListener("click", function () {
      const comment = fbComment.value.trim();
      fbErr.hidden = true;
      if (comment && looksLikePHI(comment)) {
        fbErr.hidden = false;
        fbComment.focus();
        return;
      }
      if (helpful === null && !comment) {
        fbThanks.textContent = "Tap thumbs up or down, or add a comment, then send.";
        fbThanks.hidden = false;
        return;
      }
      submitSurvey({
        survey_type: "quick",
        bundle_id: id,
        helpful: helpful,
        unit: qs("unit") || null,
        comment: comment || null
      });
      fbThanks.textContent = "Thank you — your feedback was recorded.";
      fbThanks.hidden = false;
      fbComment.value = "";
    });
  }).catch(function () {
    notFound.hidden = false;
    container.hidden = true;
  });
}

/* ---------- page: survey ---------- */
function initSurvey() {
  const form = document.getElementById("survey-form");
  const doneBox = document.getElementById("survey-done");
  const phiWarn = document.getElementById("sv-phi-warn");
  const typeField = document.getElementById("survey-type");
  typeField.value = qs("survey_type") === "post" ? "post" : "baseline";
  document.getElementById("survey-type-label").textContent =
    typeField.value === "post" ? "Post-pilot survey" : "Baseline survey";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    phiWarn.hidden = true;
    const fd = new FormData(form);
    const comment = String(fd.get("comment") || "").trim();
    if (comment && looksLikePHI(comment)) {
      phiWarn.hidden = false;
      return;
    }
    submitSurvey({
      survey_type: typeField.value,
      role: fd.get("role") || null,
      unit: fd.get("unit") || null,
      ease_likert: fd.get("ease") ? Number(fd.get("ease")) : null,
      burden_likert: fd.get("burden") ? Number(fd.get("burden")) : null,
      found_needed: fd.get("found") === null ? null : fd.get("found") === "yes",
      comment: comment || null
    });
    form.hidden = true;
    doneBox.hidden = false;
    doneBox.focus();
  });
}

/* ---------- dispatch ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const page = document.body.dataset.page;
  try {
    if (page === "landing") initLanding();
    else if (page === "bundle") initBundle();
    else if (page === "survey") initSurvey();
  } catch (e) {
    console.error("[BundleHub]", e); /* never block the content */
  }
});
