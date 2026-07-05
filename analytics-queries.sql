-- ============================================================
-- Bundle Hub — QI analytics queries
-- Run these in Supabase → SQL Editor, then Export as CSV
-- for Excel run charts. Report only in aggregate.
-- ============================================================

-- 1. Weekly scan/view run chart (QI Measure #1)
select date_trunc('week', created_at)::date as week,
       count(*) filter (where event_type = 'bundle_view') as bundle_views,
       count(*) filter (where event_type = 'landing_view') as landing_views
from events
group by 1 order by 1;

-- 2. Views per bundle per week — bundle reach (QI Measure #2)
select date_trunc('week', created_at)::date as week,
       bundle_id,
       count(*) as views
from events
where event_type = 'bundle_view'
group by 1, 2 order by 1, 3 desc;

-- 3. QR scan vs. landing-page tap (QI Measure #3)
select source, count(*) as views
from events
where event_type = 'bundle_view'
group by source order by views desc;

-- 4. Which physical QR placements drive use
select location_tag, count(*) as scans
from events
where source = 'qr'
group by location_tag order by scans desc;

-- 5. Average time on each bundle page ("did they read it")
select bundle_id,
       round(avg(dwell_seconds)) as avg_seconds,
       count(*) as reads
from events
where event_type = 'bundle_dwell' and dwell_seconds between 1 and 1800
group by bundle_id order by avg_seconds desc;

-- 6. Use by unit and shift (day = 0700-1859, night = rest)
select unit,
       case when extract(hour from created_at at time zone 'America/Chicago') between 7 and 18
            then 'day' else 'night' end as shift,
       count(*) as views
from events
where event_type = 'bundle_view'
group by 1, 2 order by 1, 2;

-- 7. Per-bundle helpfulness (quick thumbs feedback)
select bundle_id,
       count(*) filter (where helpful) as thumbs_up,
       count(*) filter (where helpful = false) as thumbs_down
from survey_responses
where survey_type = 'quick'
group by bundle_id order by bundle_id;

-- 8. Baseline vs. post survey — ease & burden (QI Measures #5, #6)
select survey_type,
       round(avg(ease_likert), 2) as avg_ease,
       round(avg(burden_likert), 2) as avg_burden,
       count(*) filter (where found_needed) as found_yes,
       count(*) filter (where found_needed = false) as found_no,
       count(*) as responses
from survey_responses
where survey_type in ('baseline', 'post')
group by survey_type;

-- 9. Recent free-text comments for feedback triage (2-business-day SLA)
select created_at::date as day, survey_type, bundle_id, comment
from survey_responses
where comment is not null
order by created_at desc
limit 50;

-- 10. Unique anonymous sessions per week (rough adoption proxy)
select date_trunc('week', created_at)::date as week,
       count(distinct session_id) as unique_sessions
from events
group by 1 order by 1;
