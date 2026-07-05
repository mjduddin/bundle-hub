/* SINGLE SOURCE OF TRUTH for all bundle content.
   Edit ONLY the data between the braces — it is standard JSON.
   Set "draft": true to hide a bundle until approved. */
window.BUNDLES_DATA = {
  "meta": {
    "program": "Standards Reliability and Bundle Set Program",
    "pilotUnits": [
      "5E",
      "4F"
    ],
    "version": "1.0-DRAFT",
    "lastUpdated": "MM/DD/YYYY",
    "contentStatus": "DRAFT — every bundle must be validated against local (VA) policy and the official nursing standards approval process before publishing.",
    "structure": [
      "trigger",
      "supplies",
      "rnActions",
      "ancillaryActions",
      "documentation",
      "escalation",
      "auditItem"
    ]
  },
  "bundles": [
    {
      "id": "skin",
      "name": "Skin Protection Bundle",
      "phrase": "Turn, Float, Document.",
      "units": [
        "5E",
        "4F"
      ],
      "goal": "Reduce missed turns, heel pressure, and documentation gaps.",
      "trigger": "Braden risk, limited mobility, incontinence, poor nutrition, end-of-life status, LEAF placement, or existing skin concern.",
      "supplies": "LEAF, Prevalon boots, wedges, pillows, barrier cream, moisture supplies.",
      "rnActions": "Assess skin, review Braden score, set turn plan, verify LEAF use, assess pain before turning.",
      "ancillaryActions": "Turn/reposition as assigned, float heels, apply wedges correctly, report refusal or skin change.",
      "documentation": "Braden interventions, turns, heel offloading, refusal, pain, skin findings.",
      "escalation": "Repeated missed turns, new redness, device pressure, refusal, uncontrolled pain.",
      "auditItem": "LEAF compliance, heels floated, wedges used correctly, documentation complete."
    },
    {
      "id": "falls",
      "name": "Fall Prevention Bundle",
      "phrase": "Low Bed, Clear Path, Call Light, Toileting Plan.",
      "units": [
        "5E",
        "4F"
      ],
      "goal": "Improve reliable fall-risk interventions.",
      "trigger": "Fall risk score, confusion, weakness, new medications, toileting urgency, prior fall, post-procedure status.",
      "supplies": "Bed alarm, chair alarm if used, yellow socks/signage per local policy, gait belt, assistive device.",
      "rnActions": "Assess fall risk, review medications, update care plan, communicate risk during handoff.",
      "ancillaryActions": "Keep call light close, answer call lights promptly, assist with toileting, keep room clear.",
      "documentation": "Fall-risk score, interventions, patient education, post-fall note if applicable.",
      "escalation": "Repeated attempts to get up, new confusion, alarm refusal, family concern.",
      "auditItem": "Bed low, alarm active if ordered, call light within reach, room clear, toileting plan present."
    },
    {
      "id": "infection",
      "name": "Infection Prevention Bundle",
      "phrase": "Sign, Supplies, PPE, Clean Equipment.",
      "units": [
        "5E",
        "4F"
      ],
      "goal": "Improve isolation, hand hygiene, device care, and PPE use.",
      "trigger": "Isolation order, wounds, invasive devices, diarrhea, respiratory symptoms, multidrug-resistant organism history.",
      "supplies": "PPE, isolation sign, hand hygiene supplies, disinfectant wipes, dedicated equipment when required.",
      "rnActions": "Verify isolation status, educate patient/family, review device necessity, ensure correct specimen collection.",
      "ancillaryActions": "Use PPE correctly, clean shared equipment, maintain room setup, report supply gaps.",
      "documentation": "Isolation education, device care, symptoms, specimen collection, wound/device assessment.",
      "escalation": "Missing PPE, unclear isolation status, new symptoms, device no longer needed, breach in precautions.",
      "auditItem": "Sign posted, PPE available, hand hygiene observed, equipment cleaned, device need reviewed."
    },
    {
      "id": "palliative",
      "name": "Palliative Comfort Bundle",
      "phrase": "Comfort First, Skin Protected, Family Informed.",
      "units": [
        "4F"
      ],
      "goal": "Balance comfort, dignity, symptom control, and safety.",
      "trigger": "Comfort measures, end-of-life care, high pain burden, dyspnea, family distress, limited turning tolerance.",
      "supplies": "Wedges, pillows, oral care supplies, skin supplies, fan if available, comfort items, suction setup if ordered.",
      "rnActions": "Assess pain, dyspnea, anxiety, secretions, skin risk, goals of care, medication timing.",
      "ancillaryActions": "Gentle repositioning, oral care, linen comfort, heel offloading, report distress or family concern.",
      "documentation": "Comfort assessment, repositioning tolerance, modified turn plan, family communication, symptom response.",
      "escalation": "Uncontrolled pain, dyspnea, agitation, family concern, rapid decline, inability to tolerate standard turns.",
      "auditItem": "Comfort plan clear, skin protection addressed, symptoms reassessed, family concerns escalated."
    },
    {
      "id": "admission",
      "name": "Admission Readiness Bundle",
      "phrase": "Assess, Verify, Protect, Document.",
      "units": [
        "5E",
        "4F"
      ],
      "goal": "Standardize first-shift admission tasks.",
      "trigger": "New admission, transfer from another unit, direct admit.",
      "supplies": "Admission packet, fall supplies, skin supplies, vitals equipment, medication reconciliation workflow.",
      "rnActions": "Initial assessment, medication review, code status verification, fall/skin risk, orders review.",
      "ancillaryActions": "Vitals, weight, belongings, room setup, call light orientation, fall-risk setup.",
      "documentation": "Admission assessment, care plan, skin assessment, belongings, education.",
      "escalation": "Missing orders, unclear code status, abnormal vitals, pressure injury on arrival, medication discrepancy.",
      "auditItem": "Admission assessment complete, fall/skin bundle started, code status verified, orders reviewed."
    },
    {
      "id": "discharge",
      "name": "Discharge Readiness Bundle",
      "phrase": "Teach, Confirm, Remove Barriers.",
      "units": [
        "5E",
        "4F"
      ],
      "goal": "Reduce missed education and discharge delays.",
      "trigger": "Expected discharge within 24 to 48 hours.",
      "supplies": "Education materials, medication list, wound supplies if needed, transport plan, follow-up instructions.",
      "rnActions": "Review discharge orders, teach-back education, medication instructions, follow-up needs.",
      "ancillaryActions": "Belongings check, final vitals if required, mobility support, room readiness after discharge.",
      "documentation": "Discharge education, teach-back, belongings, transportation, patient questions.",
      "escalation": "No ride, unclear medication instructions, unsafe home plan, missing equipment, family concern.",
      "auditItem": "Education complete, teach-back documented, discharge barriers escalated early."
    },
    {
      "id": "lines",
      "name": "Lines/Tubes/Devices Bundle",
      "phrase": "Need It, Clean It, Secure It, Remove It.",
      "units": [
        "5E",
        "4F"
      ],
      "goal": "Improve daily review, care, and removal readiness.",
      "trigger": "Foley catheter, central line, peripheral intravenous line, drain, feeding tube, oxygen device.",
      "supplies": "Securement device, dressing supplies, caps, disinfectant, catheter care supplies.",
      "rnActions": "Assess necessity, site condition, dressing status, order status, removal readiness.",
      "ancillaryActions": "Prevent pulling/tension, report leakage, report discomfort, assist with hygiene.",
      "documentation": "Device assessment, care completed, provider notification, removal if ordered.",
      "escalation": "No clear indication, redness, drainage, pain, leakage, dislodgement, dressing issue.",
      "auditItem": "Device indication clear, dressing intact, care documented, removal need reviewed."
    },
    {
      "id": "mobility",
      "name": "Mobility and Deconditioning Bundle",
      "phrase": "Know the Level, Move Safely, Report Change.",
      "units": [
        "5E"
      ],
      "goal": "Increase safe mobility and reduce bedrest-related decline.",
      "trigger": "Med-surg patient with weakness, prolonged bedrest, fall risk, new assistive device, post-procedure status.",
      "supplies": "Gait belt, walker, non-skid socks, chair alarm if required, mobility aid.",
      "rnActions": "Assess mobility level, review restrictions, coordinate PT/OT when indicated.",
      "ancillaryActions": "Assist to chair, ambulate as assigned, report weakness or dizziness.",
      "documentation": "Mobility level, assistance required, tolerance, refusal, safety concerns.",
      "escalation": "New weakness, dizziness, unsafe transfer, change in mental status, repeated refusal.",
      "auditItem": "Mobility plan known, patient out of bed if appropriate, assistance level documented."
    },
    {
      "id": "behavior",
      "name": "Behavior and Safety Bundle",
      "phrase": "TO BE AUTHORED",
      "units": [
        "5E",
        "4F"
      ],
      "goal": "Standardize response to confusion, agitation, elopement risk, and sitter needs.",
      "trigger": "TO BE AUTHORED — validate against local policy before publishing.",
      "supplies": "TO BE AUTHORED.",
      "rnActions": "TO BE AUTHORED.",
      "ancillaryActions": "TO BE AUTHORED.",
      "documentation": "TO BE AUTHORED.",
      "escalation": "TO BE AUTHORED.",
      "auditItem": "TO BE AUTHORED.",
      "draft": true
    }
  ]
};
