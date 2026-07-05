# ACM Learning Hub + 5E/4F Bundle Hub

One static, mobile-first site with two connected parts, deployed from GitHub to Netlify:

1. **ACM Learning Hub** (site root) — the QR destination that routes Acute Care Medicine nurses to VA TMS 2.0 (Talent Management System).
2. **5E/4F Bundle Hub** (`/bundles/`) — bedside standard-work bundles for the Standards Reliability and Bundle Set Program pilot on units 5E (med-surg) and 4F (palliative care), with anonymous usage analytics and staff surveys.

**Hard rules:** no protected health information (PHI) anywhere; only approved clinical content is published; all analytics/surveys are anonymous and insert-only.

---

## File map

| File | Purpose |
|---|---|
| `index.html` | ACM Learning Hub landing (master QR target for TMS access) |
| `how-to.html` | TMS sign-in steps (phone + workstation) |
| `help.html` | TMS troubleshooting FAQ and contacts |
| `bundles/index.html` | Bundle Hub landing — lists all published bundles, unit filter (master bundle QR target) |
| `bundles/bundle.html` | Renders ANY bundle via `?id=` (per-bundle QR target) |
| `bundles/survey.html` | Anonymous baseline/post survey (`?survey_type=post` for post-pilot) |
| `bundles/admin.html` | Instructions-only page for administrators (no data reads in the app) |
| `bundles.js` | **Single source of truth** for all bundle content (JSON wrapped in one line of JavaScript so pages also work when opened directly from a computer, not just on the live site) |
| `assets/app.js` | Rendering, analytics logging, feedback/survey submission |
| `assets/img/va-seal.png` | VA seal shown on every page — **see "Logo" below** |
| `styles.css` | Shared stylesheet, official VA.gov Design System colors |
| `netlify.toml` | Clean URLs (`/skin` → skin bundle) + security headers |

## Logo (action needed)

`assets/img/va-seal.png` is currently a **temporary placeholder**. Replace it with the official VA seal image (the file you have), keeping the same filename — every page picks it up automatically. Use of VA insignia requires facility authorization; confirm through your approval process.

## Backend status: CONFIGURED ✔

Supabase is live and wired into `assets/app.js` (project `swtlpjvsihuyfcduogkb`, org "VA Medical Center Memphis"):

- `events` and `survey_responses` tables created
- Row-Level Security enabled, INSERT-only for the public key, **no public SELECT** (verified: anon insert succeeds, anon select returns zero rows)
- The publishable key in `app.js` is safe to ship client-side only under this configuration — re-verify after any Supabase change

Still TBD from the implementation plan: PILOT_GO_LIVE_DATE, PILOT_END_DATE, UNIT_ROSTER_5E, UNIT_ROSTER_4F, custom domain, hosting approval (ISSO/Privacy), backend vendor approval.

## Supabase setup (ALREADY DONE — kept for rebuild/spread)

The steps below were completed on 07/04/2026. Keep them for disaster recovery or when spreading to a new facility project.

1. Create a project at supabase.com (shared departmental account).
2. SQL Editor → run:

```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  event_type text,
  bundle_id text,
  source text,
  location_tag text,
  unit text,
  device_type text,
  dwell_seconds int,
  session_id text
);

create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  survey_type text,
  bundle_id text,
  helpful bool,
  ease_likert int,
  burden_likert int,
  found_needed bool,
  role text,
  unit text,
  comment text
);

-- CRITICAL security model: INSERT-only for the public anon key, NO public reads.
alter table events enable row level security;
alter table survey_responses enable row level security;

create policy "anon can insert events" on events
  for insert to anon with check (true);

create policy "anon can insert surveys" on survey_responses
  for insert to anon with check (true);

-- Deliberately NO select policy for anon. Verify with a test:
-- inserting works from the site; selecting via the anon key returns nothing.
```

3. Copy Project URL + anon key into `assets/app.js`.
4. **Verify before launch:** RLS enabled on both tables, insert works, public select fails. This is the single most important backend step — the anon key is safe in a public site **only** under this configuration.

**Reading data:** Supabase console → Table Editor → CSV export (weekly run charts in Excel). The public app never reads data back. Ready-made QI queries (weekly run chart, bundle reach, dwell time, shift breakdown, survey averages) are in `analytics-queries.sql` — paste any of them into the Supabase SQL Editor.

**Netlify Forms fallback:** if Supabase isn't approved, set `BACKEND_MODE: "netlify-forms"` and add two hidden HTML forms named `events` and `survey_responses` (see Netlify Forms docs); submissions appear in the Netlify dashboard.

## Deploy (GitHub → Netlify)

1. Push this folder to a GitHub repository (shared departmental account).
2. Netlify → Add new site → Import from GitHub → select repo.
3. No build command; publish directory = root. Deploy.
4. HTTPS is automatic. Add the custom domain if/when approved.
5. Every future `git push` redeploys automatically.

## Update content (no reprint ever)

- Edit `bundles.js` → commit → push. The site updates; QR codes stay valid. Everything between the outer braces is standard JSON — only the first line (`window.BUNDLES_DATA =`) and the final semicolon must stay.
- Unapproved bundle? Set `"draft": true` — it disappears from the site. Reviewers can still see it by adding `?preview=1` to any URL. (The Behavior & Safety bundle ships as draft: it is TO BE AUTHORED.)
- Add a unit: add it to the bundle `units` arrays and to `PILOT_UNITS` in `app.js`.

## QR codes

- **Master (TMS hub):** `https://YOUR-SITE/?src=qr&loc=huddle`
- **Master (Bundle Hub):** `https://YOUR-SITE/bundles/?src=qr&loc=huddle`
- **Per bundle:** `https://YOUR-SITE/skin?src=qr&loc=bin` (clean URLs via netlify.toml) — vary `loc` by placement: `bin`, `huddle`, `badge`, `cart`.
- Generate at error-correction level H, dark-on-white, with quiet-zone margin. ≥1×1 in for cards, ≥2×2 in for signage. PNG for print docs, SVG for large signage. Always print a caption + the short URL as a backup, ≥14 pt.
- Test every code on iOS and Android, on Wi-Fi and cellular, and confirm each scan logs an event.

## Accessibility (Section 508 / WCAG 2.1 AA) — implemented

Semantic landmarks and one `h1` per page; logical heading order; skip-to-content links; full keyboard operability with visible gold focus indicators; text contrast ≥ 4.5:1 (verified); meaning never conveyed by color alone (thumbs feedback uses text + icon); all images have alt text; form fields have labels with errors tied via `aria-describedby`; tap targets ≥ 44×44 px; responsive to 320 px and readable at 200% zoom; `prefers-reduced-motion` respected; no auto-playing motion.

## Governance reminders (from the implementation plan)

Before go-live: ISSO/Privacy approval for public hosting, QI-vs-research determination for the survey, nursing standards approval for every bundle, backend vendor approval, 508 conformance check, network coverage check. No PHI, ever.
