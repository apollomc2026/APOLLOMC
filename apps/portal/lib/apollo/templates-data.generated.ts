// AUTO-GENERATED — do not edit by hand.
// Source: apps/portal/lib/apollo/templates/*.json
// Regenerate: npm run prebuild  (runs scripts/generate-packages-data.mjs)
//
// Inlines yesterday's flat templates dir so lib/apollo/templates.ts has
// zero runtime file dependencies. Same Vercel/Turbopack tracing reason
// as packages-data.generated.ts.
//
// Count at generation time: 15 templates.

/* eslint-disable */

export const TEMPLATES_RAW: Record<string, unknown> = {
  "budget-vs-actual": {
    "slug": "budget-vs-actual",
    "label": "Budget vs. Actual Report",
    "description": "Period budget-vs-actual report with revenue and expense variance analysis, threshold-based commentary, and optional forecast revision.",
    "category": "finance",
    "supports_images": false,
    "has_signature_block": false,
    "has_toc": false,
    "layout": "financial-statement",
    "fields": [
      {
        "id": "entity_name",
        "label": "Entity name (organization or department)",
        "type": "text",
        "required": true
      },
      {
        "id": "period_label",
        "label": "Period label",
        "type": "text",
        "required": true,
        "help": "e.g., \"Q1 2026\", \"March 2026\", \"YTD through April 25, 2026\"."
      },
      {
        "id": "period_start",
        "label": "Period start",
        "type": "date",
        "required": true
      },
      {
        "id": "period_end",
        "label": "Period end",
        "type": "date",
        "required": true
      },
      {
        "id": "revenue_lines",
        "label": "Revenue lines (one per line)",
        "type": "textarea",
        "required": true,
        "help": "category | budget | actual"
      },
      {
        "id": "expense_lines",
        "label": "Expense lines (one per line)",
        "type": "textarea",
        "required": true,
        "help": "category | budget | actual"
      },
      {
        "id": "variance_threshold_percent",
        "label": "Variance threshold (%)",
        "type": "number",
        "required": true,
        "default": 10,
        "help": "Variances exceeding this trigger commentary."
      },
      {
        "id": "variance_commentary",
        "label": "Variance commentary (per line)",
        "type": "textarea",
        "required": true,
        "help": "category | favorable/unfavorable | reason"
      },
      {
        "id": "forecast_revision",
        "label": "Forecast revision (optional)",
        "type": "textarea",
        "required": false,
        "help": "If outlook for the remainder of the period or fiscal year is changing."
      },
      {
        "id": "prepared_by",
        "label": "Prepared by",
        "type": "text",
        "required": true
      },
      {
        "id": "approved_by",
        "label": "Approved by (optional)",
        "type": "text",
        "required": false
      }
    ],
    "sections": [
      {
        "id": "header_masthead",
        "title": "Header"
      },
      {
        "id": "executive_summary",
        "title": "Executive Summary"
      },
      {
        "id": "revenue_performance",
        "title": "Revenue Performance"
      },
      {
        "id": "expense_performance",
        "title": "Expense Performance"
      },
      {
        "id": "summary_totals",
        "title": "Summary and Net Variance"
      },
      {
        "id": "variance_commentary",
        "title": "Variance Commentary"
      },
      {
        "id": "forecast_outlook",
        "title": "Forecast and Outlook"
      }
    ],
    "generation_notes": "Voice: FP&A analytical. Factual, numeric-first, neutral. Variances are explained without blame. Use the financial terms \"favorable\" and \"unfavorable\" rather than \"good\" and \"bad\" — these are precise FP&A terms with sign conventions:\n  - For revenue: actual ABOVE budget = favorable; actual BELOW budget = unfavorable.\n  - For expenses: actual BELOW budget = favorable; actual ABOVE budget = unfavorable.\nDo NOT swap the sign — respect FP&A convention.\n\nPIPELINE OWNS THE HEADER. The pipeline renders entity_name, period_label, prepared_by, and prepared date in a structured masthead at the top of the page. Do NOT emit a title or any cover-page treatment. Do NOT repeat the entity name, period, or prepared metadata in your output. Start directly with the Executive Summary section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nEXECUTIVE SUMMARY: One paragraph (4–6 sentences). State:\n  - The period covered (period_label, parsed from input)\n  - Total revenue: actual vs budget — give both figures and the variance ($ and %)\n  - Total expenses: actual vs budget — both figures and variance\n  - Net result (Revenue − Expenses): actual vs budget\n  - Whether overall performance is FAVORABLE or UNFAVORABLE to budget\nFormat the variance percentages with one decimal (e.g., \"+5.2%\", \"-3.4%\"). Format dollar amounts with thousand separators and no decimals for round figures, two decimals for cents-precise figures. Be neutral — no celebratory or alarmist language. Just the numbers and their interpretation.\n\nREVENUE PERFORMANCE: Render as a <table class=\"fin-table\"> with columns: Category | Budget | Actual | Variance ($) | Variance (%). Parse revenue_lines input as pipe-separated \"category | budget | actual\" per line.\nCompute for each line:\n  - Variance ($) = Actual − Budget\n  - Variance (%) = (Actual − Budget) / Budget × 100, with one decimal precision\nFor revenue lines, positive variance is favorable; show explicitly with a leading \"+\" or use accounting parentheses for negatives.\nEnd the table with a subtotal row using class \"subtotal-row\":\n  Total Revenue: [sum of budgets] | [sum of actuals] | [sum of variances] | [overall variance %]\nRight-align all numeric columns. Format currency consistently — dollar sign and thousand separators.\n\nEXPENSE PERFORMANCE: Same table structure for expense_lines input. Subtotal row labeled \"Total Expenses\".\nFor expense lines, the FP&A convention is reversed: positive variance ($) means OVER budget which is UNFAVORABLE. Display the column the same way but the Variance Commentary section will interpret the sign.\n\nSUMMARY AND NET VARIANCE: Small <table class=\"fin-table\"> with three rows:\n  Total Revenue: [budget] | [actual] | [variance $] | [variance %]\n  Total Expenses: [budget] | [actual] | [variance $] | [variance %]\n  Net (Revenue − Expenses): [budget − budget] | [actual − actual] | [variance] | [variance %]\nThe Net row uses class \"total-row\" for visual emphasis (the pipeline applies bold + top-border styling).\nAdd a one-sentence interpretation below the table: \"Net performance for [period_label] is FAVORABLE / UNFAVORABLE to budget by $[net variance] ([net variance %]).\"\n\nVARIANCE COMMENTARY: For each line where the absolute variance percentage exceeds variance_threshold_percent, render an explanatory entry. Format as a structured list:\n  <h3>[Category] — [+/-]X.X% [Favorable/Unfavorable]</h3>\n  <p>[Reason from variance_commentary input parsed for this category. State the cause factually. Do not assign blame to individuals or teams; describe the underlying business or market conditions.]</p>\nFor revenue lines, \"favorable\" = actual > budget. For expense lines, \"favorable\" = actual < budget.\nIf no variance exceeds the threshold, render a single statement: \"All revenue and expense categories performed within ±[variance_threshold_percent]% of budget for [period_label]; no material variances to report.\"\nThis section is non-negotiable — even when no variances exist, render the statement that none exist. This signals that the threshold check was performed.\n\nFORECAST AND OUTLOOK: ONLY emit if forecast_revision input is non-empty. State the changed outlook for the remainder of the period or fiscal year, drawn from forecast_revision input. Be specific: revised expectations (new total, growth rate, expense run rate), the rationale for the revision (what changed), and the expected impact on full-year results. End with: \"Outlook is provided based on information available as of [prepared_date or report date] and is subject to revision in subsequent reporting periods.\"\n\n=== LENGTH ===\n500–1000 words. The tables carry the substance; commentary is concise and analytical. Most of the document's value is in the structured numeric presentation, not the prose."
  },
  "cash-flow-forecast": {
    "slug": "cash-flow-forecast",
    "label": "Cash Flow Forecast",
    "description": "13-week (configurable) rolling cash flow forecast with weekly bridge, inflow/outflow detail, aging schedules, and threshold-based alerts.",
    "category": "finance",
    "supports_images": false,
    "has_signature_block": false,
    "has_toc": false,
    "layout": "financial-statement",
    "fields": [
      {
        "id": "entity_name",
        "label": "Entity name",
        "type": "text",
        "required": true
      },
      {
        "id": "forecast_horizon_weeks",
        "label": "Forecast horizon (weeks)",
        "type": "number",
        "required": true,
        "default": 13,
        "help": "Standard treasury practice is 13 weeks."
      },
      {
        "id": "forecast_start_date",
        "label": "Forecast start date",
        "type": "date",
        "required": true
      },
      {
        "id": "starting_cash_position",
        "label": "Starting cash position ($)",
        "type": "number",
        "required": true
      },
      {
        "id": "minimum_cash_threshold",
        "label": "Minimum cash threshold ($)",
        "type": "number",
        "required": false,
        "help": "Alert level — projected ending cash below this triggers risk alert."
      },
      {
        "id": "recurring_inflows",
        "label": "Recurring inflows (one per line)",
        "type": "textarea",
        "required": true,
        "help": "source | amount per period | frequency-weeks | start-week | end-week"
      },
      {
        "id": "recurring_outflows",
        "label": "Recurring outflows (one per line)",
        "type": "textarea",
        "required": true,
        "help": "category | amount per period | frequency-weeks | start-week | end-week"
      },
      {
        "id": "receivables_aging",
        "label": "Receivables aging (optional)",
        "type": "textarea",
        "required": false,
        "help": "customer | amount | expected-collection-week"
      },
      {
        "id": "payables_aging",
        "label": "Payables aging (optional)",
        "type": "textarea",
        "required": false,
        "help": "vendor | amount | expected-payment-week"
      },
      {
        "id": "one_time_items",
        "label": "One-time items (optional)",
        "type": "textarea",
        "required": false,
        "help": "description | amount | week | inflow/outflow"
      },
      {
        "id": "scenario_label",
        "label": "Scenario",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "base",
            "label": "Base — current run-rate continues"
          },
          {
            "value": "optimistic",
            "label": "Optimistic — upside drivers materialize"
          },
          {
            "value": "pessimistic",
            "label": "Pessimistic — downside risks crystallize"
          }
        ]
      },
      {
        "id": "assumptions",
        "label": "Assumptions",
        "type": "textarea",
        "required": true,
        "help": "Key assumptions held constant. One per line."
      },
      {
        "id": "prepared_by",
        "label": "Prepared by",
        "type": "text",
        "required": true
      }
    ],
    "sections": [
      {
        "id": "header_masthead",
        "title": "Header"
      },
      {
        "id": "assumptions_scenario",
        "title": "Assumptions and Scenario"
      },
      {
        "id": "weekly_forecast",
        "title": "Weekly Forecast"
      },
      {
        "id": "inflow_detail",
        "title": "Inflow Detail"
      },
      {
        "id": "outflow_detail",
        "title": "Outflow Detail"
      },
      {
        "id": "aging_schedules",
        "title": "Aging Schedules"
      },
      {
        "id": "risk_alerts",
        "title": "Risk Alerts and Threshold Analysis"
      }
    ],
    "generation_notes": "Voice: Treasury / CFO analytical. Forward-looking but bounded by stated assumptions. Highlight cash threshold breaches without alarmism. Use CFO-precise language: \"operating cash inflows\", \"working capital\", \"minimum cash threshold\", \"liquidity headroom\", \"draw on the line of credit\". Avoid hedge words (\"might\", \"could perhaps\") — state outcomes conditionally based on assumptions but with conviction in the math.\n\nPIPELINE OWNS THE HEADER (entity_name, scenario_label, forecast_start_date in masthead). Do NOT emit a title or section duplicating the masthead. Start your output directly with the Assumptions and Scenario section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nASSUMPTIONS AND SCENARIO: Two paragraphs.\nParagraph 1: State the scenario being modeled — Base / Optimistic / Pessimistic — drawn from scenario_label input. Briefly characterize what each scenario assumes (Base = current run-rate continues; Optimistic = upside drivers materialize; Pessimistic = downside risks crystallize). State that this forecast covers [forecast_horizon_weeks] weeks beginning [forecast_start_date].\nParagraph 2: List the key assumptions drawn from assumptions input as a numbered or bulleted list. Each assumption is a clear statement of what is being held constant or projected, e.g.:\n  - \"Customer collections continue at current 45-day average DSO.\"\n  - \"Vendor payments at standard Net 30 terms.\"\n  - \"No new financing activity (debt draws, equity raises) within the horizon.\"\n  - \"Headcount and payroll constant at current levels.\"\nEnd with: \"Material deviations from these assumptions will result in different cash trajectory; the forecast should be re-run when assumptions change.\"\n\nWEEKLY FORECAST: Large <table class=\"fin-table\"> with columns: Week | Week Ending | Starting Cash | Inflows | Outflows | Net Change | Ending Cash. One row per week from week 1 through forecast_horizon_weeks (typically 13).\nCompute each week's values:\n  - Week 1 Starting Cash = starting_cash_position\n  - Week N Starting Cash = Week N-1 Ending Cash\n  - Inflows = sum of (recurring_inflows applicable that week) + (one_time_items inflows that week) + (receivables_aging collections that week)\n  - Outflows = sum of (recurring_outflows applicable that week) + (one_time_items outflows that week) + (payables_aging payments that week)\n  - Net Change = Inflows - Outflows\n  - Ending Cash = Starting + Net Change\nFormat week ending date based on forecast_start_date + (week × 7 days), assuming week-ending convention is Friday or Sunday — note in the assumptions paragraph which is used.\nBottom rows:\n  - Total row showing summed Inflows, summed Outflows, summed Net Change across all weeks (DO NOT sum starting/ending — those are point-in-time, not flow). Use class \"subtotal-row\".\n  - Final row showing \"Forecast End Position\" with the last week's ending cash. Use class \"total-row\".\nRight-align all numeric columns. Format currency consistently. Highlight any week where Ending Cash falls below minimum_cash_threshold (the pipeline supports row class \"alert-row\" — apply if useful).\n\nINFLOW DETAIL: Three sub-tables rendered as <h3>:\n  <h3>Recurring Inflows</h3> — <table class=\"fin-table\"> with columns Source | Amount per Period | Frequency (weeks) | Start Week | End Week | Total over Horizon. Parse recurring_inflows input.\n  <h3>Receivables Collections (Aging)</h3> — only if receivables_aging non-empty. Columns Customer | Amount | Expected Collection Week.\n  <h3>One-Time Inflows</h3> — only if one_time_items contains any inflow rows. Columns Description | Amount | Week.\nSubtotals at the bottom of each table. If a sub-table has no entries, omit that sub-section entirely (or state \"None projected for this horizon\" if fully missing).\n\nOUTFLOW DETAIL: Mirror structure for outflows — three sub-tables:\n  <h3>Recurring Outflows</h3> — <table class=\"fin-table\"> with columns Category | Amount per Period | Frequency (weeks) | Start Week | End Week | Total over Horizon. Parse recurring_outflows input.\n  <h3>Payables (Aging)</h3> — only if payables_aging non-empty. Columns Vendor | Amount | Expected Payment Week.\n  <h3>One-Time Outflows</h3> — only if one_time_items contains any outflow rows. Columns Description | Amount | Week.\nSubtotals at the bottom of each table.\n\nAGING SCHEDULES: ONLY emit if receivables_aging or payables_aging input is non-empty. Two sub-headings:\n  <h3>Receivables Aging Detail</h3> — only if receivables_aging non-empty. Restructure receivables by aging bucket if useful (current, 30, 60, 90+) — or simply re-render the same data with risk commentary on collection probability.\n  <h3>Payables Aging Detail</h3> — only if payables_aging non-empty. Same structure.\nThis section may overlap with Inflow/Outflow Detail above; include only if it adds value (aging analysis vs. just listing).\n\nRISK ALERTS AND THRESHOLD ANALYSIS: Identify any week where Ending Cash falls below minimum_cash_threshold (if the threshold is set). For each breach, state:\n  \"ALERT: Cash position falls below the minimum threshold of $[threshold] in week [N] (week ending [date]), reaching a low of $[amount]. The shortfall persists through week [M] before recovering to $[recovery amount]. Recommended actions to consider: accelerate collections through [specific receivables]; defer non-critical payables to [later week]; draw on the line of credit; communicate to lenders about expected covenant impact.\"\nIf multiple non-contiguous breaches: list each separately.\nIf no breaches: \"Cash position remains above the minimum threshold of $[threshold] throughout the [forecast_horizon_weeks]-week forecast horizon. Lowest projected ending cash position: $[X] in week [N] (week ending [date]); buffer at the low point: $[X - threshold].\"\nEnd with a one-paragraph treasury commentary on overall cash trajectory: building, drawing down, or steady. Note any inflection points where the trajectory shifts.\n\n=== LENGTH ===\n600–1200 words. The weekly table is the substance; commentary is concise and analytical."
  },
  "change-order": {
    "slug": "change-order",
    "label": "Change Order",
    "description": "Formal contractual amendment with running totals on contract sum and contract time, cost-cause categorization, and reservation of rights.",
    "category": "contracts",
    "supports_images": false,
    "has_signature_block": true,
    "has_toc": false,
    "layout": "contract",
    "fields": [
      {
        "id": "change_order_number",
        "label": "Change Order number",
        "type": "text",
        "required": true,
        "placeholder": "CO-001",
        "help": "Sequential identifier across this contract."
      },
      {
        "id": "original_contract_title",
        "label": "Original contract — title",
        "type": "text",
        "required": true
      },
      {
        "id": "original_contract_date",
        "label": "Original contract — date",
        "type": "date",
        "required": true
      },
      {
        "id": "original_contract_sum_dollars",
        "label": "Original contract sum ($)",
        "type": "number",
        "required": true
      },
      {
        "id": "prior_change_orders_total_dollars",
        "label": "Net change by prior Change Orders ($)",
        "type": "number",
        "required": true,
        "default": 0,
        "help": "Sum of all change orders executed before this one. 0 if this is the first."
      },
      {
        "id": "original_completion_date",
        "label": "Original substantial completion date",
        "type": "date",
        "required": true
      },
      {
        "id": "prior_change_orders_days_total",
        "label": "Net change in time by prior Change Orders (days)",
        "type": "number",
        "required": true,
        "default": 0
      },
      {
        "id": "client_name",
        "label": "Client legal name",
        "type": "text",
        "required": true
      },
      {
        "id": "change_date",
        "label": "Change Order date",
        "type": "date",
        "required": true
      },
      {
        "id": "cause_of_change",
        "label": "Cause of change",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "owner-directed",
            "label": "Owner-directed (no entitlement to additional damages)"
          },
          {
            "value": "design-clarification",
            "label": "Design clarification"
          },
          {
            "value": "unforeseen-condition",
            "label": "Unforeseen condition"
          },
          {
            "value": "regulatory-change",
            "label": "Regulatory change"
          },
          {
            "value": "force-majeure",
            "label": "Force majeure"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ],
        "help": "Drives entitlement analysis. Owner-directed = no claim for delay damages; unforeseen condition = claim possible."
      },
      {
        "id": "cause_description",
        "label": "Cause — factual description",
        "type": "textarea",
        "required": true,
        "help": "What happened, in neutral past-tense language. Do not assign blame here; that belongs in claim documentation."
      },
      {
        "id": "scope_changes",
        "label": "Scope changes (additions / removals / modifications)",
        "type": "textarea",
        "required": true,
        "help": "Organize as three sections: ADDITIONS, REMOVALS, MODIFICATIONS. One line per item."
      },
      {
        "id": "cost_breakdown",
        "label": "Cost breakdown",
        "type": "textarea",
        "required": true,
        "help": "Labor by role × hours × rate, materials, subs, equipment, overhead %, profit %. The pipeline renders this as a structured table."
      },
      {
        "id": "cost_impact_dollars",
        "label": "Net cost impact of this Change Order ($)",
        "type": "number",
        "required": true,
        "help": "Signed: positive for additions, negative for credits. Must match the bottom-line of cost_breakdown."
      },
      {
        "id": "schedule_impact_days",
        "label": "Net schedule impact of this Change Order (days)",
        "type": "number",
        "required": true,
        "help": "Signed: positive for added days, negative for compression. 0 if no time impact."
      },
      {
        "id": "effective_date",
        "label": "Effective date",
        "type": "date",
        "required": true
      },
      {
        "id": "conditional_on",
        "label": "Conditional on (optional)",
        "type": "text",
        "required": false,
        "help": "If left blank, change order is unconditional. Otherwise, condition that must be satisfied within 30 days for the change order to take effect."
      }
    ],
    "sections": [
      {
        "id": "header",
        "title": "Header"
      },
      {
        "id": "reference_to_original_contract",
        "title": "Reference to Original Contract"
      },
      {
        "id": "cause_and_description",
        "title": "Cause and Description of Change"
      },
      {
        "id": "scope_changes",
        "title": "Scope Changes"
      },
      {
        "id": "cost_breakdown",
        "title": "Cost Breakdown"
      },
      {
        "id": "effect_on_contract_sum",
        "title": "Effect on Contract Sum"
      },
      {
        "id": "effect_on_contract_time",
        "title": "Effect on Contract Time"
      },
      {
        "id": "reservation_of_rights",
        "title": "Reservation of Rights"
      },
      {
        "id": "continuing_obligations",
        "title": "Continuing Obligations"
      },
      {
        "id": "acceptance_signatures",
        "title": "Acceptance and Signatures"
      }
    ],
    "generation_notes": "Voice: Contractual amendment formality. Precise, dry, reference-heavy. This is an instrument that modifies an existing contract — not a new agreement and not a sales document. Do not re-sell the project. Do not re-explain rationale beyond one factual sentence. Use legal-amendment voice throughout. The change order is a record of what changed and what now applies; nothing more.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nREFERENCE TO ORIGINAL CONTRACT: One paragraph. State that this is Change Order [change_order_number] dated [change_date], amending the original contract titled \"[original_contract_title]\" dated [original_contract_date] between [client_name] and [provider — pull from brand]. State: \"All terms and conditions of the Original Contract remain in full force and effect except as expressly modified by this Change Order. In the event of conflict between this Change Order and the Original Contract, this Change Order controls only with respect to the matters expressly addressed herein.\" If prior_change_orders_total_dollars > 0 or prior_change_orders_days_total > 0, also state: \"[N] prior change orders have been executed; this Change Order is in addition to all prior amendments.\"\n\nCAUSE AND DESCRIPTION OF CHANGE: Restate cause_of_change category as a bold lead-in:\n  - 'owner-directed': \"Owner-Directed Change.\"\n  - 'design-clarification': \"Design Clarification.\"\n  - 'unforeseen-condition': \"Unforeseen Condition.\"\n  - 'regulatory-change': \"Regulatory Change.\"\n  - 'force-majeure': \"Force Majeure Event.\"\n  - 'other': \"Other Change Cause.\"\nThen one paragraph factual narrative drawn from cause_description input. Use neutral, past-tense language. Do not assign blame. Do not editorialize. State the underlying facts and the resulting need for the change. Reserve any entitlement assertion to the Reservation of Rights section.\n\nSCOPE CHANGES: Three distinct sub-headings rendered as <h3>:\n  1. <h3>Additions</h3> — bulleted list of items added to the original scope. Drawn from the additions portion of scope_changes input. If none, state \"None.\"\n  2. <h3>Removals</h3> — bulleted list of items removed from the original scope. Drawn from the removals portion. If none, state \"None.\"\n  3. <h3>Modifications</h3> — bulleted list of items modified (existing in original scope but with changed terms). If none, state \"None.\"\nEach item is a single short bullet identifying what is added/removed/modified. Detail belongs in the cost breakdown.\n\nCOST BREAKDOWN: Render cost_breakdown input as a structured <table>. Categories shown as rows:\n  - Labor (with sub-rows by role × hours × rate where breakdown supports it)\n  - Materials (with sub-rows by item where breakdown supports it)\n  - Subcontractors\n  - Equipment\n  - Direct Costs Subtotal\n  - Overhead (typically 5–15% of direct costs)\n  - Profit / Markup (typically 5–15%)\n  - Total Change Order Amount\nThe Total row should equal cost_impact_dollars. If credit (negative cost_impact_dollars), the structure inverts — rows show what is being credited. Format all currency as $1,234.56 with thousand separators.\n\nEFFECT ON CONTRACT SUM: Render as a structured table or right-aligned summary block showing the running total:\n  Original Contract Sum: $[original_contract_sum_dollars]\n  Net Change by Prior Change Orders: $[prior_change_orders_total_dollars] (signed)\n  Contract Sum Prior to This Change Order: $[original_contract_sum_dollars + prior_change_orders_total_dollars]\n  Change by This Change Order: $[cost_impact_dollars] (signed; positive for additions, parentheses for credits)\n  ───────────\n  New Contract Sum: $[computed sum]\nThe line \"New Contract Sum\" should be styled with bold and a top border (use class total-row if styling supported). Format negatives as ($1,234.56) in accounting style or with a minus sign — be consistent. If cost_impact_dollars is 0, state \"There is no change to the Contract Sum as a result of this Change Order.\"\n\nEFFECT ON CONTRACT TIME: Mirror structure for time:\n  Original Substantial Completion Date: [original_completion_date]\n  Net Change in Contract Time by Prior Change Orders: [prior_change_orders_days_total] days (signed)\n  Substantial Completion Date Prior to This Change Order: [computed]\n  Change by This Change Order: [schedule_impact_days] days (signed)\n  ───────────\n  New Substantial Completion Date: [computed]\nIf schedule_impact_days is 0, state explicitly: \"There is no change to the Contract Time as a result of this Change Order. The Substantial Completion Date remains [original or current adjusted date].\" If the change has critical-path implications, note that without claiming the change is on the critical path unless documented.\n\nRESERVATION OF RIGHTS: Standard clause, exact language: \"By executing this Change Order, neither party waives any rights, claims, or defenses related to the Original Contract or to any other matter, including any disputed scope items, pending claims, or contemplated claims, except as expressly resolved by this Change Order. The pricing, schedule, and other terms set forth herein constitute full and complete compensation for the changes specifically described in this Change Order. Neither party admits or concedes liability or entitlement with respect to any matter not expressly addressed herein.\"\nThis section is non-negotiable and must always appear, even if cause_of_change is 'owner-directed'.\n\nCONTINUING OBLIGATIONS: One paragraph: \"All terms, conditions, and obligations of the Original Contract not expressly modified by this Change Order remain in full force and effect. The parties' rights and remedies under the Original Contract are preserved as to all matters not addressed herein. This Change Order does not constitute a novation of the Original Contract. Time remains of the essence.\"\nIf conditional_on field is provided: append a sub-paragraph: \"Conditional Effectiveness: This Change Order is conditional upon [conditional_on]. If the foregoing condition is not satisfied within thirty (30) days of [effective_date], this Change Order shall be null and void and the Original Contract shall continue unmodified. Upon satisfaction of the condition, the parties shall promptly confirm effectiveness in writing.\"\n\nACCEPTANCE AND SIGNATURES: Brief sign-off paragraph: \"The undersigned representatives of the parties, having authority to bind their respective principals, execute this Change Order [N] effective as of [effective_date].\" Then standard counter-party signature lines. The pipeline renders the formal signature block; you do not need to render signature lines. If cause_of_change is 'design-clarification' or 'unforeseen-condition' and the engagement appears to be construction-related, note: \"Architect/Engineer of Record acknowledgment line included where required by the Original Contract.\"\n\n=== LENGTH ===\n800–1500 words. Be complete and precise; do not pad. Change orders are about specifics — vague language defeats the purpose."
  },
  "engagement-letter": {
    "slug": "engagement-letter",
    "label": "Client Engagement Letter",
    "description": "Professional services engagement letter with firm-type variants (legal, accounting, consulting, advisory) and full clause set including scope limitations, conflicts, privilege, retention, withdrawal, and dispute resolution.",
    "category": "contracts",
    "supports_images": false,
    "has_signature_block": true,
    "has_toc": false,
    "layout": "letter",
    "fields": [
      {
        "id": "firm_type",
        "label": "Firm type",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "legal",
            "label": "Legal (law firm, attorney)"
          },
          {
            "value": "accounting",
            "label": "Accounting / CPA"
          },
          {
            "value": "consulting",
            "label": "Consulting"
          },
          {
            "value": "advisory",
            "label": "Advisory"
          },
          {
            "value": "other",
            "label": "Other professional services"
          }
        ],
        "help": "Drives the scope-limitation, privilege, conflicts, and document-retention clause variants."
      },
      {
        "id": "client_name",
        "label": "Client — legal name",
        "type": "text",
        "required": true
      },
      {
        "id": "client_entity_type",
        "label": "Client — entity type",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "individual",
            "label": "Individual"
          },
          {
            "value": "llc",
            "label": "LLC"
          },
          {
            "value": "corporation",
            "label": "Corporation"
          },
          {
            "value": "partnership",
            "label": "Partnership"
          },
          {
            "value": "non-profit",
            "label": "Non-profit"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "client_address",
        "label": "Client — notice address",
        "type": "textarea",
        "required": true,
        "help": "Full address for legal notices, including email if applicable."
      },
      {
        "id": "client_signing_authority_name",
        "label": "Client — signing authority name",
        "type": "text",
        "required": true,
        "help": "The person with authority to bind the client."
      },
      {
        "id": "client_signing_authority_title",
        "label": "Client — signing authority title",
        "type": "text",
        "required": true
      },
      {
        "id": "engagement_type",
        "label": "Engagement type",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "consulting",
            "label": "Consulting"
          },
          {
            "value": "advisory",
            "label": "Advisory"
          },
          {
            "value": "technical-services",
            "label": "Technical services"
          },
          {
            "value": "retainer",
            "label": "Retainer"
          },
          {
            "value": "audit",
            "label": "Audit"
          },
          {
            "value": "tax-prep",
            "label": "Tax preparation"
          },
          {
            "value": "litigation",
            "label": "Litigation"
          },
          {
            "value": "transaction",
            "label": "Transaction"
          }
        ]
      },
      {
        "id": "engagement_scope",
        "label": "Scope — services included",
        "type": "textarea",
        "required": true,
        "help": "Specific services to be provided. Be precise — vague scope creates fee disputes."
      },
      {
        "id": "engagement_exclusions",
        "label": "Scope — services explicitly excluded",
        "type": "textarea",
        "required": true,
        "help": "Critical for liability protection. List anything a reasonable client might assume is included but is not."
      },
      {
        "id": "start_date",
        "label": "Start date",
        "type": "date",
        "required": true
      },
      {
        "id": "fee_structure",
        "label": "Fee structure",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "fixed-fee",
            "label": "Fixed fee"
          },
          {
            "value": "hourly",
            "label": "Hourly"
          },
          {
            "value": "retainer",
            "label": "Retainer"
          },
          {
            "value": "hybrid",
            "label": "Hybrid (fixed + hourly)"
          },
          {
            "value": "contingency",
            "label": "Contingency"
          }
        ]
      },
      {
        "id": "fee_detail",
        "label": "Fee detail",
        "type": "textarea",
        "required": true,
        "help": "Hourly rates by role, retainer amount and replenishment trigger, fixed amount with milestones, or contingency percentage and outcome trigger."
      },
      {
        "id": "expense_policy",
        "label": "Expense policy",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "client-pays-actual",
            "label": "Client pays actual expenses at cost"
          },
          {
            "value": "included-in-fee",
            "label": "Expenses included in fee"
          },
          {
            "value": "pre-approval-over-threshold",
            "label": "Pre-approval required over threshold"
          }
        ]
      },
      {
        "id": "expense_threshold_dollars",
        "label": "Expense pre-approval threshold ($)",
        "type": "number",
        "required": false,
        "help": "Only used if pre-approval policy selected."
      },
      {
        "id": "payment_terms",
        "label": "Payment terms",
        "type": "text",
        "required": true,
        "default": "Net 30"
      },
      {
        "id": "late_payment_interest_percent",
        "label": "Late payment interest rate (% per month)",
        "type": "number",
        "required": false,
        "default": 1.5
      },
      {
        "id": "firm_point_of_contact_name",
        "label": "Firm — point of contact name",
        "type": "text",
        "required": true
      },
      {
        "id": "firm_point_of_contact_title",
        "label": "Firm — point of contact title",
        "type": "text",
        "required": true
      },
      {
        "id": "governing_state",
        "label": "Governing state",
        "type": "text",
        "required": true
      },
      {
        "id": "dispute_resolution",
        "label": "Dispute resolution",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "courts",
            "label": "Courts in governing state"
          },
          {
            "value": "binding-arbitration",
            "label": "Binding arbitration"
          },
          {
            "value": "mediation-then-arbitration",
            "label": "Mediation, then arbitration"
          }
        ]
      }
    ],
    "sections": [
      {
        "id": "cover_letter",
        "title": "Cover Letter"
      },
      {
        "id": "engagement_scope",
        "title": "Scope of Engagement"
      },
      {
        "id": "scope_exclusions",
        "title": "Scope Limitations"
      },
      {
        "id": "fees_and_billing",
        "title": "Fees and Billing"
      },
      {
        "id": "expenses",
        "title": "Expenses and Disbursements"
      },
      {
        "id": "responsibilities",
        "title": "Responsibilities of the Parties"
      },
      {
        "id": "conflicts_and_independence",
        "title": "Conflicts of Interest and Independence"
      },
      {
        "id": "confidentiality_privilege",
        "title": "Confidentiality and Privilege"
      },
      {
        "id": "document_retention",
        "title": "Document Retention and File Handling"
      },
      {
        "id": "term_termination_withdrawal",
        "title": "Term, Termination, and Withdrawal"
      },
      {
        "id": "dispute_resolution",
        "title": "Dispute Resolution"
      },
      {
        "id": "acceptance_signatures",
        "title": "Acceptance and Counter-Signature"
      }
    ],
    "generation_notes": "Voice: Professional services formality. Lawyer/CPA/consultant issuing an engagement letter. Courteous but firm about terms. Use \"we\" (firm) and \"you\" (client) throughout. Sign off with \"Very truly yours\" or \"Sincerely.\" No marketing language. No softening qualifiers like \"we're excited to,\" \"thanks for choosing us,\" or \"we look forward to partnering.\" This is an instrument of professional engagement, not a sales document.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION-BY-SECTION REQUIREMENTS ===\n\nCOVER LETTER: Salutation: \"Dear [client_signing_authority_name],\". Two paragraphs. Para 1: state firm is pleased to confirm the engagement, reference the engagement_type as the subject, and reference any prior discussions. Para 2: state purpose of letter — establish terms of engagement, request counter-signature. End the cover-letter section by transitioning into the body of terms. Do not include a salutation in any subsequent section.\n\nSCOPE OF ENGAGEMENT: Specific services to be provided per engagement_scope input. Render as a numbered list if multiple services, or 1–2 paragraphs if narrative. Each item describes what firm will deliver. Use action verbs (\"Prepare\", \"Review\", \"Advise on\", \"Draft\"). End with: \"The services described above constitute the entirety of the engagement under this letter unless modified in a written amendment signed by both parties.\"\n\nSCOPE LIMITATIONS: This is critical for liability — do not skip even if engagement_exclusions input is brief. Lead with: \"The following matters are expressly EXCLUDED from this engagement and are not provided unless agreed to in writing in a separate engagement letter or amendment:\" Then list exclusions from engagement_exclusions input as numbered items. Then add firm-type-specific carve-outs:\n  - If firm_type is 'legal': \"We are not providing tax, accounting, or business advice as part of this engagement.\"\n  - If 'accounting': \"We are not providing legal advice or representation. We do not opine on legal compliance matters except as expressly included in scope.\"\n  - If 'consulting' or 'advisory': \"We do not provide legal, tax, or accounting services. Recommendations regarding such matters should be reviewed with appropriately licensed advisors.\"\nEnd with: \"Services performed beyond the scope described above will require an amendment to this letter or a separate engagement.\"\n\nFEES AND BILLING: Restate fee_structure and fee_detail in plain professional prose. Branch on fee_structure value:\n  - If 'fixed-fee': \"Our fee for this engagement is $[fee from detail]. The fee is payable as follows: [milestones from detail or default 50% on execution, 50% on final delivery].\"\n  - If 'hourly': \"Services will be billed at the hourly rates set forth in fee_detail. Time is billed in [0.1 hour increments]. Invoices are issued monthly on the first business day.\"\n  - If 'retainer': \"A retainer of $[amount from detail] is required at engagement commencement. Time and expenses are drawn against the retainer; the retainer is replenished when balance falls below [threshold from detail].\"\n  - If 'hybrid': describe both fixed and hourly portions per fee_detail.\n  - If 'contingency': \"Our fee is contingent upon [outcome from detail], calculated as [percentage from detail].\"\nLate payment: \"Invoices unpaid after [payment_terms] from invoice date accrue interest at [late_payment_interest_percent]% per month or the maximum rate permitted by applicable law, whichever is lower.\"\n\nEXPENSES AND DISBURSEMENTS: Branch on expense_policy:\n  - 'client-pays-actual': \"All out-of-pocket expenses are billed at cost. Typical expenses include travel, filing fees, third-party services, document production, and courier charges.\"\n  - 'included-in-fee': \"Reasonable in-jurisdiction expenses are included in the fee. Out-of-jurisdiction travel and major third-party expenses (filing fees, expert witnesses, document production) are billed separately at cost.\"\n  - 'pre-approval-over-threshold': \"Expenses below $[expense_threshold_dollars] are billed at cost. Expenses at or above $[expense_threshold_dollars] require Client's prior written approval.\"\nEnd with receipts/documentation: \"Reasonable documentation will accompany expense charges. Disputes regarding specific expenses must be raised within thirty (30) days of the invoice on which they appear.\"\n\nRESPONSIBILITIES OF THE PARTIES: Two sub-paragraphs.\nFirm responsibilities: \"We will perform the services with the professional skill, care, and diligence ordinarily exercised by [firm_type] practitioners under similar circumstances. We will comply with all applicable professional standards, including [for legal: Rules of Professional Conduct of the governing_state state bar; for accounting: AICPA standards and applicable state board regulations; for consulting/advisory: applicable industry standards]. We will keep you reasonably informed of progress and material developments.\"\nClient responsibilities: \"You agree to: (a) provide complete and accurate information necessary for the engagement; (b) respond to requests for information and decisions in a timely manner; (c) make available [client_signing_authority_name] or another designated decision-maker for material decisions; (d) pay invoices when due; (e) inform us promptly of any matter that may affect the engagement.\"\n\nCONFLICTS OF INTEREST AND INDEPENDENCE: Branch on firm_type:\n  - 'legal': \"We have performed a conflicts check based on the information provided and do not believe any conflicts of interest exist that would prevent representation in this matter. You agree to advise us promptly of any potential conflicts of which you become aware. We may represent other clients with interests adverse to yours, provided we are not opposing you in matters substantially related to this engagement. You consent to such representation. If a conflict arises that we believe requires withdrawal, we will notify you in writing.\"\n  - 'accounting': \"We will maintain independence as required by AICPA standards and the [governing_state] state board of accountancy. We are not aware of any relationships that would impair our independence with respect to this engagement. You agree to inform us if you become aware of any matter that could affect our independence.\"\n  - 'consulting' or 'advisory': \"We are not aware of any relationships that would impair our objectivity with respect to this engagement. We may serve other clients in your industry. You agree to inform us if you become aware of any conflict that should be considered.\"\n\nCONFIDENTIALITY AND PRIVILEGE: Branch on firm_type for privilege language:\n  - 'legal': \"All information you provide in connection with this engagement will be held in confidence except as required by law, by court order, or with your consent. The attorney-client privilege attaches to confidential communications between us made for the purpose of obtaining legal advice. To preserve privilege: do not share confidential communications with third parties; do not copy non-clients on email correspondence with us; restrict internal distribution to those with a need to know. The work-product doctrine protects materials prepared in anticipation of litigation.\"\n  - 'accounting' or 'consulting' or 'advisory': \"All information you provide will be held in confidence except as required by law, by regulatory authority, or with your consent. Note that no privilege equivalent to attorney-client privilege attaches to communications between us. If you require privileged communication regarding legal matters arising during this engagement, you should consult with your legal counsel directly.\"\nEnd with: \"This obligation of confidentiality survives termination of this engagement.\"\n\nDOCUMENT RETENTION AND FILE HANDLING: \"Working papers, internal analyses, and draft materials remain our property and are part of our internal records. Final deliverables, executed agreements, and original documents you provided are your property. Upon request during or after the engagement, we will return original documents and provide copies of final deliverables. Our records relating to this engagement will be retained for [seven (7) years for legal/accounting; five (5) years for consulting/advisory], after which they may be destroyed without further notice. If you require longer retention, you must so advise us in writing.\"\n\nTERM, TERMINATION, AND WITHDRAWAL: \"This engagement begins on [start_date] and continues until the services described above are complete or until earlier termination. Either party may terminate this engagement upon written notice. We may withdraw from representation for: (a) non-payment of fees beyond [60] days past due; (b) ethical conflict that cannot be waived; (c) your failure to cooperate or provide required information; (d) your request that we take an action we believe to be improper, unethical, or unlawful; (e) material breach of this engagement letter. Upon termination, fees earned and expenses incurred to date are immediately due. If termination occurs mid-engagement, you agree to pay reasonable wind-down costs (file transfer, transition memos, regulatory notices).\"\n\nDISPUTE RESOLUTION: Branch on dispute_resolution:\n  - 'binding-arbitration': \"Any dispute arising out of or relating to this engagement shall be resolved exclusively by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. The arbitration shall be conducted by a single arbitrator. The seat of arbitration shall be [governing_state]. The arbitrator's decision shall be final and binding and may be entered in any court of competent jurisdiction. The prevailing party shall be entitled to recover reasonable attorneys' fees and costs.\"\n  - 'mediation-then-arbitration': \"Any dispute shall first be submitted to mediation administered by a mutually-agreed mediator. If the dispute is not resolved by mediation within sixty (60) days, it shall then be resolved by binding arbitration as described above.\"\n  - 'courts': \"Any dispute arising out of or relating to this engagement shall be resolved exclusively in the state or federal courts located in [governing_state]. Both parties consent to personal jurisdiction in such courts.\"\nAdd (all options): \"Claims must be brought within one (1) year of the date the claim arose. Claims not brought within that period are waived.\"\n\nACCEPTANCE AND COUNTER-SIGNATURE: Closing paragraph: \"If the foregoing accurately reflects our engagement, please countersign below and return one signed copy to us. We will commence work upon receipt of the executed letter[, and the initial retainer where applicable]. This engagement is not effective until counter-signed and returned.\" Sign-off: \"Very truly yours,\" followed by [firm_point_of_contact_name], [firm_point_of_contact_title]. The pipeline renders the formal signature block; you do not need to render signature lines, only the closing.\n\n=== LENGTH ===\n1500–2500 words. Engagement letters are professional instruments — be complete but not padded. Each section earns its place; redundant prose is removed."
  },
  "expense-report": {
    "slug": "expense-report",
    "label": "Expense Report",
    "description": "AP/T&E expense report with itemized lines, mileage, per diem, foreign currency conversions, structured reimbursement calculation, and audit-ready attestation.",
    "category": "finance",
    "supports_images": true,
    "has_signature_block": true,
    "has_toc": false,
    "layout": "financial-statement",
    "fields": [
      {
        "id": "submitter_name",
        "label": "Submitter name",
        "type": "text",
        "required": true
      },
      {
        "id": "submitter_employee_id",
        "label": "Submitter employee ID",
        "type": "text",
        "required": false
      },
      {
        "id": "period_start",
        "label": "Period start",
        "type": "date",
        "required": true
      },
      {
        "id": "period_end",
        "label": "Period end",
        "type": "date",
        "required": true
      },
      {
        "id": "business_purpose",
        "label": "Business purpose / trip purpose",
        "type": "textarea",
        "required": true
      },
      {
        "id": "expense_lines",
        "label": "Expense lines (one per line)",
        "type": "textarea",
        "required": true,
        "help": "date | category | merchant | amount | currency | payment-method | accounting-code | business-purpose"
      },
      {
        "id": "mileage_entries",
        "label": "Mileage entries (optional, one per line)",
        "type": "textarea",
        "required": false,
        "help": "date | from | to | miles | rate | purpose"
      },
      {
        "id": "mileage_rate_per_mile",
        "label": "Mileage rate per mile ($)",
        "type": "number",
        "required": false,
        "default": 0.67,
        "help": "IRS standard mileage rate or company policy."
      },
      {
        "id": "per_diem_days",
        "label": "Per diem days",
        "type": "number",
        "required": false
      },
      {
        "id": "per_diem_rate",
        "label": "Per diem rate ($)",
        "type": "number",
        "required": false
      },
      {
        "id": "foreign_currency_conversions",
        "label": "Foreign currency conversions (one per line)",
        "type": "textarea",
        "required": false,
        "help": "original-currency | original-amount | conversion-date | rate-used | USD-amount"
      },
      {
        "id": "total_advance_received",
        "label": "Cash advance received ($)",
        "type": "number",
        "required": false,
        "default": 0
      },
      {
        "id": "manager_approver_name",
        "label": "Manager / approver name",
        "type": "text",
        "required": true
      },
      {
        "id": "accounting_summary",
        "label": "Accounting code summary (optional)",
        "type": "textarea",
        "required": false,
        "help": "Auto-derived from accounting codes if possible; otherwise manual."
      },
      {
        "id": "notes",
        "label": "Notes (optional)",
        "type": "textarea",
        "required": false
      }
    ],
    "sections": [
      {
        "id": "header_masthead",
        "title": "Header"
      },
      {
        "id": "business_purpose_summary",
        "title": "Business Purpose and Period"
      },
      {
        "id": "expense_lines",
        "title": "Expense Lines"
      },
      {
        "id": "mileage",
        "title": "Mileage"
      },
      {
        "id": "per_diem",
        "title": "Per Diem"
      },
      {
        "id": "foreign_currency",
        "title": "Foreign Currency Conversions"
      },
      {
        "id": "summary_totals",
        "title": "Summary and Reimbursement Calculation"
      },
      {
        "id": "attestation_approval",
        "title": "Attestation and Approval"
      }
    ],
    "generation_notes": "Voice: Administrative, factual, audit-ready. No commentary. Tables and structured data carry the weight. Use precise terminology — \"reimbursement\", \"advance\", \"per diem\", \"mileage\" — and stick to it. Match the format that AP and Finance teams expect: itemized expense lines, currency conversions for foreign charges, and a clear reimbursement calculation at the end.\n\nPIPELINE OWNS THE HEADER (submitter, period, prepared date in masthead). Do NOT emit a title or any section that duplicates the masthead content. Start your output directly with the Business Purpose section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nBUSINESS PURPOSE AND PERIOD: One paragraph (3–5 sentences). State:\n  - The period covered: [period_start] through [period_end]\n  - The overall business purpose drawn from business_purpose input — what trip, project, or activity these expenses relate to\n  - If multiple trips or projects covered, note that and how the expenses are organized\n  - Submitter and (if relevant) cost center / accounting code at the summary level\nEnd with: \"Receipts for individual expense lines are attached as Figures 1–N (referenced by line number in the Expense Lines table below).\"\n\nEXPENSE LINES: <h2>Expense Lines</h2> followed by a <table class=\"fin-table\">. Columns: # | Date | Category | Merchant | Amount | Currency | Payment Method | Accounting Code. Parse each line of expense_lines input as pipe-separated fields (date | category | merchant | amount | currency | payment-method | accounting-code | business-purpose-line).\nSort entries by date ascending.\nNumber each line sequentially in the # column (1, 2, 3, ...).\nReference receipts by line number: any line accompanied by an attached image is noted \"Receipt #N\" in a sub-line under the merchant or in a final notes column. The pipeline attaches images separately; in your text, reference embedded receipts as: \"Line N — see Receipt #N\" wherever ambiguity matters.\nSubtotal row using class \"subtotal-row\":\n  Total Expenses (in submission currency): $[sum of amounts converted to submission currency if multi-currency, or sum of all amounts if single-currency]\n\nMILEAGE: ONLY emit if mileage_entries input is non-empty. <table class=\"fin-table\"> with columns: Date | From | To | Miles | Rate | Amount. Parse mileage_entries as pipe-separated. Compute Amount = Miles × mileage_rate_per_mile. If a per-line rate is provided, use it; otherwise use the mileage_rate_per_mile field default (typically $0.67/mile per IRS standard, but use whatever value is provided).\nSubtotal row: \"Total Mileage Reimbursement: $[sum]\".\nNote below the table if relevant: \"Mileage rate of $[rate] per mile reflects [IRS standard for the year / company policy].\"\n\nPER DIEM: ONLY emit if both per_diem_days and per_diem_rate are provided and non-zero. Single calculation block:\n  Per Diem Allowance: [per_diem_days] days × $[per_diem_rate]/day = $[total]\n  Per diem covers: meals and incidental expenses. Lodging billed separately as actual expense.\nNote that per diem typically follows the GSA rate for the destination; if the destination has special-rate areas, mention.\n\nFOREIGN CURRENCY CONVERSIONS: ONLY emit if foreign_currency_conversions input is non-empty. <table class=\"fin-table\"> with columns: Original Currency | Original Amount | Conversion Date | Rate Used | USD Amount. Parse from input as pipe-separated.\nAfter the table, note the source of exchange rates: \"Exchange rates per [bank rate at time of charge / OANDA midpoint / company-designated rate provider].\" If different rates were used for different lines, note that.\n\nSUMMARY AND REIMBURSEMENT CALCULATION: Small <table class=\"fin-table\"> with all summable totals:\n  Total Expenses (USD or submission currency): $[X]\n  Total Mileage: $[Y] — only if mileage section present\n  Per Diem: $[Z] — only if per diem section present\n  Foreign currency adjustments: $[A] — only if foreign currency section present, showing net adjustment from any rate differentials\n  ─────\n  Total Submitted: $(X + Y + Z + A)\n  Less: Cash advance received: -$[total_advance_received]\n  ─────\n  Reimbursement Due to [submitter_name]: $[final amount, computed]\nThe \"Reimbursement Due\" line uses class \"total-row\" for emphasis.\nIf total_advance_received exceeds the total submitted (rare but possible), the final line reads: \"Amount Due BACK to Employer: $[difference].\" Handle this case explicitly.\n\nATTESTATION AND APPROVAL: Two attestation paragraphs:\n  Submitter attestation: \"I, [submitter_name], certify that the foregoing expenses were incurred on company business during the period stated, are supported by attached receipts where required by company policy (typically expenses ≥$25), have not been previously submitted for reimbursement, and are accurate to the best of my knowledge. — [submitter_name], [date].\"\n  Manager approval: \"Approved for reimbursement by [manager_approver_name], [date].\" The pipeline renders the formal signature block; do not render signature lines.\nAdd a final compliance note: \"Receipts retained per company record retention policy. Expenses subject to audit. Falsification of expense reports may result in disciplinary action up to and including termination of employment.\"\n\nIf notes input is non-empty, append a brief closing paragraph drawn from notes; one paragraph max, professional tone.\n\n=== LENGTH ===\n300–700 words of prose. The tables carry weight. A simple expense report (one trip, no foreign currency) may be at the low end (350 words); a complex international travel report with mileage, per diem, and FX may approach the high end."
  },
  "fsr": {
    "slug": "fsr",
    "label": "Field Service Report",
    "description": "Technician visit report with SLA timestamps, structured readings (pre/post), parts and materials, safety observations, regulatory compliance codes, and customer attestation.",
    "category": "field-service",
    "supports_images": true,
    "has_signature_block": true,
    "has_toc": false,
    "layout": "contract",
    "fields": [
      {
        "id": "work_order_number",
        "label": "Work Order number",
        "type": "text",
        "required": true,
        "help": "WO reference from CMMS or dispatch system."
      },
      {
        "id": "site_name",
        "label": "Site name",
        "type": "text",
        "required": true
      },
      {
        "id": "site_address",
        "label": "Site address",
        "type": "text",
        "required": true
      },
      {
        "id": "customer_contact_onsite",
        "label": "Customer contact on site",
        "type": "text",
        "required": true,
        "help": "Name and role of the person who met the technician."
      },
      {
        "id": "visit_date",
        "label": "Visit date",
        "type": "date",
        "required": true
      },
      {
        "id": "arrival_time",
        "label": "Arrival time (24hr)",
        "type": "text",
        "required": true,
        "placeholder": "09:15"
      },
      {
        "id": "departure_time",
        "label": "Departure time (24hr)",
        "type": "text",
        "required": true,
        "placeholder": "11:30"
      },
      {
        "id": "technician_name",
        "label": "Technician name",
        "type": "text",
        "required": true
      },
      {
        "id": "technician_license_number",
        "label": "Technician license / certification number",
        "type": "text",
        "required": false,
        "help": "For regulated trades (EPA 608, low-voltage, etc)."
      },
      {
        "id": "equipment_asset_id",
        "label": "Equipment asset ID (CMMS tag)",
        "type": "text",
        "required": true
      },
      {
        "id": "equipment_make_model",
        "label": "Equipment make and model",
        "type": "text",
        "required": true
      },
      {
        "id": "equipment_serial_number",
        "label": "Equipment serial number",
        "type": "text",
        "required": false
      },
      {
        "id": "issue_reported",
        "label": "Issue reported",
        "type": "textarea",
        "required": true,
        "help": "What the customer reported. Verbatim or close paraphrase."
      },
      {
        "id": "pre_work_readings",
        "label": "Pre-work readings (optional)",
        "type": "textarea",
        "required": false,
        "help": "Each line: parameter | reading | normal range."
      },
      {
        "id": "work_performed",
        "label": "Work performed (chronological)",
        "type": "textarea",
        "required": true,
        "help": "Time-stamped log of actions taken. Use 24-hour time."
      },
      {
        "id": "parts_used",
        "label": "Parts used",
        "type": "textarea",
        "required": false,
        "help": "Each line: part name | part number | qty | unit cost."
      },
      {
        "id": "post_work_readings",
        "label": "Post-work readings (optional)",
        "type": "textarea",
        "required": false,
        "help": "Same format as pre-work readings."
      },
      {
        "id": "safety_observations",
        "label": "Safety observations",
        "type": "textarea",
        "required": false,
        "help": "LOTO usage, PPE, near-misses."
      },
      {
        "id": "compliance_code",
        "label": "Regulatory compliance code",
        "type": "text",
        "required": false,
        "help": "EPA Section 608, NFPA 25, ASHRAE 15, etc."
      },
      {
        "id": "customer_concerns_other",
        "label": "Additional customer concerns (out of scope)",
        "type": "textarea",
        "required": false,
        "help": "Items mentioned by customer outside this work order. Triggers separate ticketing."
      },
      {
        "id": "pm_recommendations",
        "label": "Preventive maintenance recommendations",
        "type": "textarea",
        "required": false
      },
      {
        "id": "warranty_status",
        "label": "Warranty status",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "in-warranty",
            "label": "In warranty"
          },
          {
            "value": "out-of-warranty",
            "label": "Out of warranty"
          },
          {
            "value": "warranty-claim-submitted",
            "label": "Warranty claim submitted"
          },
          {
            "value": "not-applicable",
            "label": "Not applicable"
          }
        ]
      },
      {
        "id": "time_on_site_hours",
        "label": "Time on site (hours)",
        "type": "number",
        "required": true,
        "help": "For billing and SLA verification. Should equal departure − arrival."
      },
      {
        "id": "follow_up_required",
        "label": "Follow-up required",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "none",
            "label": "None"
          },
          {
            "value": "parts-order",
            "label": "Parts order — return visit pending parts"
          },
          {
            "value": "return-visit",
            "label": "Return visit required"
          },
          {
            "value": "escalation",
            "label": "Escalation — engineering / vendor / supervisor"
          }
        ]
      },
      {
        "id": "customer_signature_name",
        "label": "Customer sign-off — printed name",
        "type": "text",
        "required": false
      }
    ],
    "sections": [
      {
        "id": "cover",
        "title": "Cover Page"
      },
      {
        "id": "visit_summary",
        "title": "Visit Summary"
      },
      {
        "id": "equipment_identification",
        "title": "Equipment Identification"
      },
      {
        "id": "issue_description",
        "title": "Issue Description and Pre-Work State"
      },
      {
        "id": "work_performed",
        "title": "Work Performed"
      },
      {
        "id": "parts_materials",
        "title": "Parts and Materials"
      },
      {
        "id": "post_work_state",
        "title": "Post-Work State and Verification"
      },
      {
        "id": "safety_compliance",
        "title": "Safety and Compliance"
      },
      {
        "id": "photos",
        "title": "Photos and Documentation"
      },
      {
        "id": "customer_concerns",
        "title": "Additional Customer Concerns"
      },
      {
        "id": "recommendations_followup",
        "title": "Recommendations and Follow-Up"
      },
      {
        "id": "attestation_signoff",
        "title": "Attestation and Customer Sign-Off"
      }
    ],
    "generation_notes": "Voice: Technical field-report. Factual, chronological, specific. Written for two audiences: a supervisor who wasn't there and needs to understand what happened, and a property manager who needs to verify billing, SLA compliance, and regulatory documentation. Use 24-hour time throughout. Use the technician's name in third person (\"Technician arrived...\", \"[name] performed...\"). Past tense for actions taken; present tense only for observed final state.\n\nDO NOT soften observations. State objective conditions:\n  WRONG: \"The unit seems to be working better now.\"\n  CORRECT: \"Unit operating within manufacturer-specified parameters at departure.\"\n  WRONG: \"I went to the site and found some issues.\"\n  CORRECT: \"Arrived 09:15. Observed fault code E14 on primary controller.\"\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nVISIT SUMMARY: One paragraph (3–5 sentences). Format: \"Work Order [work_order_number] — [site_name]. Technician [technician_name] performed service on [visit_date], arriving at [arrival_time] and departing at [departure_time] (total time on site: [computed]). Customer contact on site: [customer_contact_onsite]. Outcome: [one-sentence summary tied to follow_up_required selection — 'No follow-up required; equipment operating normally' / 'Parts ordered; return visit pending receipt' / 'Issue requires escalation; details below'].\"\n\nEQUIPMENT IDENTIFICATION: Render as a definition list or labeled lines:\n  Asset ID: [equipment_asset_id]\n  Make/Model: [equipment_make_model]\n  Serial Number: [equipment_serial_number] (if provided; omit line if not)\n  Service History: brief one-line note if relevant (e.g., \"Last serviced [date]\" if data available; otherwise \"Not available in this report\").\n  Warranty Status: [warranty_status human-readable form — In Warranty / Out of Warranty / Warranty Claim Submitted / Not Applicable]\n\nISSUE DESCRIPTION AND PRE-WORK STATE: Two distinct sub-paragraphs:\n  Sub-paragraph 1 — Issue Reported: Verbatim or close paraphrase of issue_reported input. Frame as: \"Customer report: [issue].\" If multiple issues reported, number them.\n  Sub-paragraph 2 — Pre-Work State (if pre_work_readings provided): \"On arrival, the following readings were observed:\" followed by a structured list (Parameter | Reading | Normal Range or Manufacturer Spec). Format: \"Suction pressure: 47 psig (normal: 40–55 psig). Discharge pressure: 235 psig (normal: 200–260 psig). Fault code: E14 (Primary controller / sensor mismatch).\" If no pre_work_readings, state \"Pre-work readings not taken; proceeded directly to issue verification.\"\n\nWORK PERFORMED: Chronological narrative with specific times throughout, drawn from work_performed input. Each step on its own line or in a tight numbered list. Include precise terminology, manufacturer terms, fault codes, manufacturer procedures referenced. Example tone:\n  \"09:15 — Arrived on site. Met customer contact [customer_contact_onsite]. Reviewed issue: barrier intermittently failing to raise.\n  09:20 — Verified fault code E14 on primary controller display.\n  09:25 — Performed Lockout/Tagout on lane 3 power per company procedure. PPE worn: cut-resistant gloves, safety glasses.\n  09:35 — Opened controller cabinet. Verified power present, all connections intact.\n  09:42 — Performed controller reset per manufacturer procedure (SKIDATA M-Series Service Manual section 4.2 'Cold Reset').\n  09:48 — Fault cleared; controller display reads READY.\n  09:50–10:20 — Verified operation through 3 consecutive cycle tests using test ticket. All cycles completed within manufacturer time spec (≤ 4.5 seconds raise, ≤ 4.5 seconds lower).\n  10:25 — Removed Lockout/Tagout. Verified amperage draw at 4.2A (normal: 4.0–4.5A under load).\n  10:35 — Verified operation with live ticket from customer-supplied test card. Confirmed fee acceptance and barrier raise within spec.\"\nEach action: what was done, what component was touched, what was observed, in what time. Use precise nouns (\"controller\", \"limit switch\", \"loop detector\"), not generic ones (\"the thing\").\n\nPARTS AND MATERIALS: If parts_used input is non-empty, render as a <table> with columns: Part Name | Part Number | Quantity | Unit Cost | Extended Cost. Compute Extended = Quantity × Unit Cost. Subtotal row at the bottom. If no parts, state explicitly: \"No parts used. No material costs incurred.\"\n\nPOST-WORK STATE AND VERIFICATION: If post_work_readings provided, render as a structured list (Parameter | Reading | Normal Range). Compare to pre-work where possible: \"Suction pressure pre-work: 47 psig; post-work: 49 psig (within spec). Fault code pre-work: E14; post-work: NONE.\" Then verification testing performed: number of cycles, manufacturer-spec compliance, customer demonstration if applicable. Final operational status as one of:\n  - \"Operating normally. All readings within manufacturer specifications. Unit returned to service.\"\n  - \"Operating with limitations: [specific limitations]. Customer notified.\"\n  - \"Not operating; awaiting parts. Unit out of service. ETA per parts order.\"\n  - \"Operational with temporary repair. Permanent repair scheduled per Follow-Up section.\"\n\nSAFETY AND COMPLIANCE: If safety_observations provided, render as a list of observed conditions and actions taken. Always include these standard items even if no specific input:\n  Lockout/Tagout: [used / not required for this work]\n  PPE worn: [appropriate to task — list]\n  Near-misses or unsafe conditions observed: [from input or \"None\"]\nIf compliance_code input is provided (e.g., \"EPA Section 608\", \"NFPA 25\", \"ASHRAE 15\"), state: \"Work performed in compliance with [compliance_code]. Technician certification: [technician_license_number if provided, otherwise 'on file with employer'].\" If no compliance code, state \"No specific regulatory code applicable to this work.\"\n\nPHOTOS AND DOCUMENTATION: This section is fixed by the pipeline (the renderer attaches uploaded images). In your generated text, reference embedded images by their figure number as appropriate (e.g., \"as shown in Figure 1\"). Each photo caption format must be: \"[Figure N]: [what photo shows] [Before/During/After].\" If no photos provided in this submission, state: \"No photos attached for this visit.\"\n\nADDITIONAL CUSTOMER CONCERNS: ONLY emit if customer_concerns_other input is non-empty. Lead with: \"During the visit, the customer mentioned the following items outside the scope of Work Order [work_order_number]:\" Then numbered list of items. End with: \"These items have been logged for separate ticket creation. No work was performed on these items under this work order.\"\n\nRECOMMENDATIONS AND FOLLOW-UP: If pm_recommendations is provided, list as numbered preventive maintenance recommendations with target intervals (e.g., \"Replace primary controller battery — recommended at next 6-month PM cycle\"). Then follow_up_required statement based on selection:\n  - 'none': \"No follow-up required. Equipment operating normally; next scheduled service per maintenance contract.\"\n  - 'parts-order': \"Follow-up required: parts on order. Parts: [list from parts_used or notes]. ETA: [if known]. Return visit will be scheduled upon parts receipt.\"\n  - 'return-visit': \"Follow-up required: return visit. Reason: [from notes]. Recommended timeframe: [based on issue urgency].\"\n  - 'escalation': \"Follow-up required: escalation. This issue exceeds the scope of this work order and requires [engineering review / vendor support / supervisor disposition]. Escalated to [contact] on [date].\"\nEnd with: \"Warranty status confirmed at time of service: [warranty_status].\"\n\nATTESTATION AND CUSTOMER SIGN-OFF: Two attestation paragraphs:\n  Technician attestation: \"I, [technician_name], certify that the foregoing is an accurate and complete account of the work performed on [visit_date] under Work Order [work_order_number]. License/Certification: [technician_license_number if provided, otherwise 'on file with employer']. — [Date].\"\n  Customer sign-off: \"Customer acknowledges that the work described above was performed and accepts the work as described, pending any items noted under Recommendations and Follow-Up. Acknowledged by [customer_signature_name if provided, otherwise blank line].\" The pipeline renders the formal signature block; do not render signature lines.\n\n=== LENGTH ===\n500–1200 words. Field reports favor specificity over verbosity. Length should follow the complexity of the visit. A simple reset call may be 400 words; a multi-fault diagnostic call with parts replacement may be 1000."
  },
  "incident-report": {
    "slug": "incident-report",
    "label": "Incident Report",
    "description": "Formal incident report with severity classification, regulatory reporting obligations (OSHA/EPA), structured persons-involved tracking, contributing factors analysis, and corrective actions chain.",
    "category": "field-service",
    "supports_images": true,
    "has_signature_block": true,
    "has_toc": true,
    "layout": "contract",
    "fields": [
      {
        "id": "incident_date",
        "label": "Incident date",
        "type": "date",
        "required": true
      },
      {
        "id": "incident_time",
        "label": "Incident time (24hr)",
        "type": "text",
        "required": true,
        "placeholder": "14:27"
      },
      {
        "id": "location",
        "label": "Location",
        "type": "text",
        "required": true
      },
      {
        "id": "severity",
        "label": "Severity classification",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "near-miss",
            "label": "Near-miss"
          },
          {
            "value": "first-aid",
            "label": "First-aid case"
          },
          {
            "value": "recordable-injury",
            "label": "Recordable injury (OSHA)"
          },
          {
            "value": "lost-time-injury",
            "label": "Lost-time injury"
          },
          {
            "value": "fatality",
            "label": "Fatality"
          },
          {
            "value": "property-damage-only",
            "label": "Property damage only"
          },
          {
            "value": "environmental-release",
            "label": "Environmental release"
          },
          {
            "value": "security-incident",
            "label": "Security incident"
          }
        ],
        "help": "Drives reporting obligations and report scope."
      },
      {
        "id": "reporter_name",
        "label": "Reporter name",
        "type": "text",
        "required": true
      },
      {
        "id": "reporter_role",
        "label": "Reporter role",
        "type": "text",
        "required": true
      },
      {
        "id": "incident_description",
        "label": "Incident description (chronological)",
        "type": "textarea",
        "required": true
      },
      {
        "id": "injured_persons",
        "label": "Injured persons (one per line)",
        "type": "textarea",
        "required": false,
        "help": "name | employer/role | injury type | body part | treatment | RTW status"
      },
      {
        "id": "witnesses",
        "label": "Witnesses (one per line)",
        "type": "textarea",
        "required": false,
        "help": "name | contact | when statement taken | statement summary"
      },
      {
        "id": "other_persons_involved",
        "label": "Other persons involved (one per line)",
        "type": "textarea",
        "required": false,
        "help": "name | role/employer | involvement"
      },
      {
        "id": "property_damage",
        "label": "Property damage",
        "type": "textarea",
        "required": false,
        "help": "assets affected | estimated repair | business interruption"
      },
      {
        "id": "environmental_impact",
        "label": "Environmental impact",
        "type": "textarea",
        "required": false,
        "help": "substance | quantity | containment status | regulatory threshold"
      },
      {
        "id": "equipment_involved",
        "label": "Equipment involved",
        "type": "textarea",
        "required": false,
        "help": "equipment | inspection status | last maintenance | fault codes"
      },
      {
        "id": "immediate_actions_taken",
        "label": "Immediate actions taken (at the scene)",
        "type": "textarea",
        "required": true
      },
      {
        "id": "notifications_made",
        "label": "Notifications made",
        "type": "textarea",
        "required": true,
        "help": "who | when | by whom | method (911, supervisor, customer, regulator)"
      },
      {
        "id": "contributing_factors",
        "label": "Contributing factors (categorized)",
        "type": "textarea",
        "required": true,
        "help": "human | environmental | equipment | procedural — be specific"
      },
      {
        "id": "root_cause_hypothesis",
        "label": "Root cause hypothesis (preliminary)",
        "type": "textarea",
        "required": false,
        "help": "Will be clearly labeled as preliminary in the report."
      },
      {
        "id": "corrective_actions_immediate",
        "label": "Corrective actions — immediate (already taken)",
        "type": "textarea",
        "required": true
      },
      {
        "id": "corrective_actions_interim",
        "label": "Corrective actions — interim (in progress)",
        "type": "textarea",
        "required": false,
        "help": "action | owner | due date — one per line"
      },
      {
        "id": "corrective_actions_long_term",
        "label": "Corrective actions — long-term (systemic)",
        "type": "textarea",
        "required": false
      },
      {
        "id": "investigation_status",
        "label": "Investigation status",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "preliminary-report",
            "label": "Preliminary report — investigation just begun"
          },
          {
            "value": "investigation-ongoing",
            "label": "Investigation ongoing"
          },
          {
            "value": "final-report",
            "label": "Final report — investigation complete"
          }
        ]
      },
      {
        "id": "regulatory_reports_required",
        "label": "Regulatory reports required",
        "type": "textarea",
        "required": false,
        "help": "e.g., \"OSHA 300 log entry\", \"EPA 24-hr release\", \"State DEP notification\""
      },
      {
        "id": "preparer_name",
        "label": "Preparer name",
        "type": "text",
        "required": true
      },
      {
        "id": "reviewer_name",
        "label": "Reviewer name (if applicable)",
        "type": "text",
        "required": false
      },
      {
        "id": "approver_name",
        "label": "Approver name (if applicable)",
        "type": "text",
        "required": false
      }
    ],
    "sections": [
      {
        "id": "cover",
        "title": "Cover Page"
      },
      {
        "id": "incident_summary",
        "title": "Incident Summary"
      },
      {
        "id": "severity_classification",
        "title": "Severity Classification and Reporting Obligations"
      },
      {
        "id": "detailed_description",
        "title": "Detailed Description"
      },
      {
        "id": "persons_involved",
        "title": "Persons Involved"
      },
      {
        "id": "injury_details",
        "title": "Injury Details"
      },
      {
        "id": "damage_environmental",
        "title": "Damage and Environmental Impact"
      },
      {
        "id": "equipment_involved",
        "title": "Equipment Involved"
      },
      {
        "id": "immediate_response",
        "title": "Immediate Response and Notifications"
      },
      {
        "id": "witnesses_statements",
        "title": "Witnesses and Statements"
      },
      {
        "id": "photos",
        "title": "Photos and Documentation"
      },
      {
        "id": "contributing_factors",
        "title": "Contributing Factors"
      },
      {
        "id": "root_cause",
        "title": "Root Cause Hypothesis"
      },
      {
        "id": "corrective_actions",
        "title": "Corrective Actions"
      },
      {
        "id": "attestation_signoff",
        "title": "Attestation and Sign-Off Chain"
      }
    ],
    "generation_notes": "Voice: Objective, chronological, factual. Written for legal, insurance, and regulatory review. Past tense exclusively. Do NOT assign fault. Do NOT speculate beyond evidence. State preliminary findings clearly as preliminary. Use 24-hour time. Avoid emotional, dramatic, or subjective language; this report becomes evidence.\n\nWRONG: \"It was a really scary situation when the sprinklers suddenly went off and everyone was in a panic.\"\nCORRECT: \"At 14:27, water began discharging from the overhead sprinkler in Conference Room B. Building occupants were evacuated by 14:35. Fire suppression was contacted at 14:29.\"\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nINCIDENT SUMMARY: One paragraph (4–6 sentences). State: what occurred, when (incident_date and incident_time), where (location), who was involved (counts only — details in later sections), severity classification, and a single-sentence outcome (\"No injuries; property damage estimated at $X\" / \"Two persons sustained injuries; one transported for treatment\" / \"Fatality; OSHA notified within 8 hours\").\n\nSEVERITY CLASSIFICATION AND REPORTING OBLIGATIONS: Lead with severity from selection in human-readable form:\n  - 'near-miss': \"Severity: Near-Miss. No injury, no property damage; conditions present that could have caused harm.\"\n  - 'first-aid': \"Severity: First-Aid Case. Minor injury treated at the scene; no medical professional involvement required.\"\n  - 'recordable-injury': \"Severity: Recordable Injury (per OSHA 29 CFR 1904).\"\n  - 'lost-time-injury': \"Severity: Lost-Time Injury. Time away from work resulting from incident.\"\n  - 'fatality': \"Severity: FATALITY.\"\n  - 'property-damage-only': \"Severity: Property Damage Only. No injury sustained.\"\n  - 'environmental-release': \"Severity: Environmental Release. Substance released to environment; regulatory notification may be required.\"\n  - 'security-incident': \"Severity: Security Incident.\"\nThen triggered reporting obligations from regulatory_reports_required input. Add these standard reminders based on severity:\n  - If 'fatality' or 'lost-time-injury' with inpatient hospitalization or amputation: \"OSHA 29 CFR 1904.39 requires notification within 8 hours for fatality, within 24 hours for inpatient hospitalization, amputation, or eye loss. Reporting to OSHA Area Office or 1-800-321-OSHA.\"\n  - If 'recordable-injury': \"Must be entered on OSHA 300 log within 7 calendar days.\"\n  - If 'environmental-release': \"State and federal environmental agencies may require notification depending on substance type, quantity, and jurisdiction. Verify reporting thresholds for the specific substance and jurisdiction.\"\nIf reports already submitted, note dates. If pending, note responsible party and due date drawn from regulatory_reports_required input.\n\nDETAILED DESCRIPTION: Chronological narrative drawn from incident_description input. Specific times. Specific actions. Specific observations. Past tense. Use 24-hour time. Each event on its own line or in a tight paragraph. Example structure:\n  \"At [time], [observed event]. [Person or role] [observed/responded by]. At [time], [next event]. [Outcome at this point].\"\nAvoid: \"It was [emotional descriptor].\" Avoid: assumptions about cause. Stick to what was observed, by whom, and when.\n\nPERSONS INVOLVED: Three sub-sections rendered as <h3>:\n  <h3>Injured Persons</h3> — list from injured_persons input parsed as \"name | employer/role | injury type | body part | treatment received | RTW status\". One person per entry. If empty, omit this sub-section entirely (or state \"No persons injured\").\n  <h3>Witnesses</h3> — list from witnesses input parsed as \"name | contact | when statement taken | statement summary\". If empty, omit.\n  <h3>Other Persons Involved</h3> — list from other_persons_involved input. Employees, contractors, visitors, members of the public. If empty, omit.\n\nINJURY DETAILS: ONLY emit if injured_persons input is non-empty. For each injured person, structured detail block:\n  Identifier: [name or anonymized identifier per privacy requirements]\n  Role/Employer: [from input]\n  Injury type and severity: [from input — abrasion, laceration, fracture, burn, etc.]\n  Body part affected: [from input]\n  Treatment received: [from input — first aid only / outpatient medical / hospitalization / fatality]\n  Return-to-work status: [from input — full duty / restricted duty / off work / not yet determined / N/A]\nEnd with: \"Injury details documented based on information available at time of report. Subject to revision upon completion of medical treatment and reporting.\"\n\nDAMAGE AND ENVIRONMENTAL IMPACT: Two sub-headings:\n  <h3>Property Damage</h3> — only emit if property_damage input provided. Assets affected, estimated repair cost, business interruption hours/days, current containment status. State estimates as estimates: \"Repair cost estimated at $[range]. Final cost subject to detailed assessment.\"\n  <h3>Environmental Impact</h3> — only emit if environmental_impact input provided. Substance type, quantity released, containment status, regulatory threshold reached or not. If threshold reached, name the regulation (e.g., \"CERCLA reportable quantity exceeded for [substance]: [amount] vs threshold [amount]\").\n\nEQUIPMENT INVOLVED: ONLY emit if equipment_involved input non-empty. For each piece of equipment: description, inspection/maintenance status at time of incident, fault codes or condition observations, manufacturer and date of last service if known. Note whether equipment is preserved for investigation: \"Equipment secured for investigation; available for inspection by [parties].\"\n\nIMMEDIATE RESPONSE AND NOTIFICATIONS: Two distinct sub-sections rendered as <h3>:\n  <h3>Immediate Actions Taken</h3> — chronological list drawn from immediate_actions_taken input. What was done at the scene, with times where available. Evacuation, first aid, isolation of the area, shutdown procedures, contacting emergency services.\n  <h3>Notifications Log</h3> — render as a <table> with columns: Notified Party | Date/Time | Notified By | Method (phone, email, in-person, automated alert). Parsed from notifications_made input. Examples: 911, supervisor, building management, customer, regulator, insurance carrier, legal counsel.\n\nWITNESSES AND STATEMENTS: ONLY emit if witnesses input non-empty. For each witness: name (or anonymized identifier if privacy required), contact information (or \"on file with [preparer_name]\" if disclosure not appropriate), when the statement was taken and by whom, and a statement summary in third-person (\"Witness reports observing X at approximately Y time\"). Direct quotes only if recorded verbatim. End with: \"Statements recorded based on best recollection of witness at time of interview. Original notes/recordings retained per [retention policy].\"\n\nPHOTOS AND DOCUMENTATION: This section is fixed by the pipeline (renderer attaches uploaded images). Reference embedded images by caption: \"[Figure N]: [what shown] [time taken if known] [taken by].\" For serious incidents (lost-time-injury, fatality, environmental-release), include chain-of-custody language: \"Photos taken by [name] using [device]; original files retained in [secure storage]; copies stored in incident file.\"\n\nCONTRIBUTING FACTORS: Categorized list drawn from contributing_factors input. Render as <h3> sub-sections:\n  <h3>Human Factors</h3> — training adequacy, fatigue, distraction, communication breakdowns, complacency. Be specific: \"Operator was on hour 11 of a 12-hour shift\" not \"fatigue may have been a factor\".\n  <h3>Environmental Factors</h3> — lighting, weather, noise, layout, temperature, time of day.\n  <h3>Equipment Factors</h3> — failure mode, design, maintenance status, age, manufacturer recall status.\n  <h3>Procedural Factors</h3> — was a procedure in place; was it followed; was it adequate; was training current.\nBe specific. Generic factors (\"fatigue\", \"distraction\") do not aid prevention. Sub-sections may be omitted if no factors in that category.\n\nROOT CAUSE HYPOTHESIS: ONLY emit if root_cause_hypothesis input is provided. Lead with bold: \"PRELIMINARY ROOT CAUSE — SUBJECT TO ONGOING INVESTIGATION.\" State the hypothesis. State evidence supporting it. State evidence contradicting it (or \"None identified at this time\"). State limitations of preliminary analysis (incomplete information, pending witness interviews, equipment under inspection). End with: \"Final root cause determination will be made upon completion of investigation. This preliminary hypothesis may be revised or replaced based on subsequent findings. Investigation status: [investigation_status].\"\n\nCORRECTIVE ACTIONS: Three sub-sections rendered as <h3>:\n  <h3>Immediate Actions (Already Taken)</h3> — list from corrective_actions_immediate. Specific, action-oriented. \"Sprinkler head replaced. Conference room dried and ceiling tiles replaced. Building manager briefed.\"\n  <h3>Interim Actions (In Progress)</h3> — only if corrective_actions_interim input provided. Render as table: Action | Owner | Due Date.\n  <h3>Long-Term Actions</h3> — only if corrective_actions_long_term input provided. Systemic improvements: training, policy changes, equipment upgrades. Each action specific and assignable.\n\nATTESTATION AND SIGN-OFF CHAIN: Three attestation lines:\n  Preparer: \"I, [preparer_name], prepared this report based on information available as of [report date]. To the best of my knowledge, the foregoing is accurate.\"\n  Reviewer line if reviewer_name provided: \"Reviewed by [reviewer_name] on [date].\" (If pending: \"Pending review by [reviewer_name]\")\n  Approver line if approver_name provided: \"Approved by [approver_name] on [date].\" (If pending: \"Pending approval by [approver_name]\")\nEnd with: \"This report may contain preliminary information subject to revision as investigation continues. This document is prepared in the ordinary course of safety operations and is intended for internal use, regulatory submission as required, and protection of the parties' rights.\"\n\n=== LENGTH ===\n1500–2500 words. Severity-driven. Near-miss reports may be at the low end (1000–1500 words); fatality reports require comprehensive documentation (2500+)."
  },
  "invoice": {
    "slug": "invoice",
    "label": "Invoice",
    "description": "AP-ready invoice with full structured metadata: tax IDs (supplier and customer), PO reference, contract reference, currency selection, per-line taxability, discount handling, late-payment terms, and structured banking instructions.",
    "category": "finance",
    "supports_images": false,
    "has_signature_block": false,
    "has_toc": false,
    "layout": "invoice",
    "fields": [
      {
        "id": "invoice_number",
        "label": "Invoice number",
        "type": "text",
        "required": true
      },
      {
        "id": "statement_type",
        "label": "Statement type",
        "type": "select",
        "required": true,
        "default": "original",
        "options": [
          {
            "value": "original",
            "label": "Original"
          },
          {
            "value": "duplicate",
            "label": "Duplicate (copy of prior original)"
          },
          {
            "value": "revised",
            "label": "Revised (supersedes prior invoice)"
          }
        ]
      },
      {
        "id": "supersedes_invoice_number",
        "label": "Supersedes invoice (if revised)",
        "type": "text",
        "required": false
      },
      {
        "id": "invoice_date",
        "label": "Invoice date",
        "type": "date",
        "required": true
      },
      {
        "id": "due_date",
        "label": "Due date",
        "type": "date",
        "required": true
      },
      {
        "id": "payment_terms_label",
        "label": "Payment terms label",
        "type": "text",
        "required": true,
        "default": "Net 30"
      },
      {
        "id": "currency",
        "label": "Currency",
        "type": "select",
        "required": true,
        "default": "USD",
        "options": [
          {
            "value": "USD",
            "label": "USD — US Dollar"
          },
          {
            "value": "EUR",
            "label": "EUR — Euro"
          },
          {
            "value": "GBP",
            "label": "GBP — British Pound"
          },
          {
            "value": "CAD",
            "label": "CAD — Canadian Dollar"
          },
          {
            "value": "AUD",
            "label": "AUD — Australian Dollar"
          },
          {
            "value": "JPY",
            "label": "JPY — Japanese Yen"
          },
          {
            "value": "other",
            "label": "Other (specify in notes)"
          }
        ]
      },
      {
        "id": "service_period_start",
        "label": "Service period — start",
        "type": "date",
        "required": false
      },
      {
        "id": "service_period_end",
        "label": "Service period — end",
        "type": "date",
        "required": false
      },
      {
        "id": "bill_to_name",
        "label": "Bill to — customer legal name",
        "type": "text",
        "required": true
      },
      {
        "id": "bill_to_address",
        "label": "Bill to — address",
        "type": "textarea",
        "required": true
      },
      {
        "id": "bill_to_tax_id",
        "label": "Bill to — tax ID / EIN / VAT",
        "type": "text",
        "required": false,
        "help": "Customer tax identifier — required by some AP systems."
      },
      {
        "id": "customer_po_number",
        "label": "Customer Purchase Order number",
        "type": "text",
        "required": false,
        "help": "Many AP systems reject invoices without PO reference."
      },
      {
        "id": "contract_reference",
        "label": "Contract reference",
        "type": "text",
        "required": false,
        "help": "SOW number, MSA number, or contract title."
      },
      {
        "id": "supplier_tax_id",
        "label": "Supplier — tax ID / EIN",
        "type": "text",
        "required": true
      },
      {
        "id": "remit_to_name",
        "label": "Remit-to name (if different from supplier)",
        "type": "text",
        "required": false
      },
      {
        "id": "remit_to_address",
        "label": "Remit-to address (if different — lockbox)",
        "type": "textarea",
        "required": false
      },
      {
        "id": "line_items",
        "label": "Line items (one per line)",
        "type": "textarea",
        "required": true,
        "help": "SKU/code | description | quantity | unit price | taxable Y/N"
      },
      {
        "id": "tax_jurisdiction",
        "label": "Tax jurisdiction",
        "type": "text",
        "required": false,
        "help": "e.g., \"Massachusetts state + Suffolk county\""
      },
      {
        "id": "tax_rate_percent",
        "label": "Tax rate (%)",
        "type": "number",
        "required": true,
        "default": 0
      },
      {
        "id": "discount_type",
        "label": "Discount type",
        "type": "select",
        "required": false,
        "options": [
          {
            "value": "none",
            "label": "None"
          },
          {
            "value": "early-payment-2-10-net-30",
            "label": "Early payment 2/10 net 30"
          },
          {
            "value": "volume",
            "label": "Volume discount"
          },
          {
            "value": "other",
            "label": "Other (describe in detail)"
          }
        ]
      },
      {
        "id": "discount_detail",
        "label": "Discount detail",
        "type": "text",
        "required": false
      },
      {
        "id": "late_payment_interest_percent_monthly",
        "label": "Late payment interest rate (% per month)",
        "type": "number",
        "required": true,
        "default": 1.5
      },
      {
        "id": "payment_methods",
        "label": "Payment methods",
        "type": "textarea",
        "required": true,
        "help": "ACH/wire details (bank, routing, account, SWIFT), check instructions, online portal."
      },
      {
        "id": "billing_contact_name",
        "label": "Billing contact name (for disputes)",
        "type": "text",
        "required": true
      },
      {
        "id": "billing_contact_email",
        "label": "Billing contact email",
        "type": "text",
        "required": true
      },
      {
        "id": "notes",
        "label": "Notes (optional)",
        "type": "textarea",
        "required": false
      }
    ],
    "sections": [
      {
        "id": "header_masthead",
        "title": "Header"
      },
      {
        "id": "bill_to_block",
        "title": "Bill To"
      },
      {
        "id": "service_period_reference",
        "title": "Service Period and Reference"
      },
      {
        "id": "line_items_table",
        "title": "Line Items"
      },
      {
        "id": "subtotal_discounts",
        "title": "Subtotal, Discounts, Taxes"
      },
      {
        "id": "total_due",
        "title": "Total Due"
      },
      {
        "id": "payment_instructions",
        "title": "Payment Instructions"
      },
      {
        "id": "late_payment_terms",
        "title": "Payment Terms"
      },
      {
        "id": "dispute_billing_contact",
        "title": "Billing Contact for Disputes"
      },
      {
        "id": "notes",
        "title": "Notes"
      }
    ],
    "generation_notes": "Voice: Strictly factual, structured, numeric-first. No pleasantries. No \"thanks for your business.\" No \"we appreciate your prompt payment.\" An invoice is submitted, not signed. AP departments evaluate invoices for completeness; missing details (PO numbers, tax IDs, bank instructions) result in payment delays. Every required AP field appears.\n\nPIPELINE OWNS THE HEADER AND BILL-TO BLOCK. Do NOT emit sections titled \"Invoice Details\", \"Header\", \"Bill To\", \"From\", \"Invoice\", or any heading that duplicates the masthead content. The pipeline renders all invoice metadata (number, statement type, dates, parties, tax IDs) in the dedicated masthead. Start your output directly with the Service Period and Reference section (if any input fields require it) or with Line Items.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nSERVICE PERIOD AND REFERENCE: ONLY emit if at least one of these inputs is provided: service_period_start, service_period_end, customer_po_number, contract_reference. Render as a tight definition-list-style block:\n  Service Period: [service_period_start] through [service_period_end] (if both provided; if only one, state \"through [date]\" or \"from [date]\")\n  Customer PO: [customer_po_number] (if provided)\n  Contract Reference: [contract_reference] (if provided)\nIf statement_type is \"revised\", PREPEND a bold notice block as the first content under this section: \"REVISED INVOICE — supersedes Invoice [supersedes_invoice_number]. The prior invoice is null and is replaced by this revised invoice. If the prior invoice was paid, please contact the billing contact below to reconcile.\"\nIf statement_type is \"duplicate\", prepend: \"DUPLICATE COPY — Invoice [invoice_number]. This is a copy of an invoice previously issued. Payment status: please confirm with billing contact below.\"\nIf none of the optional inputs are provided AND statement_type is \"original\", omit this entire section.\n\nLINE ITEMS: <h2>Line Items</h2> followed by a <table>. Columns (in this exact order): SKU/Code | Description | Quantity | Unit Price | Taxable | Amount. Parse each line of line_items input as pipe-separated fields.\nCompute Amount = Quantity × Unit Price.\nFormat ALL currency consistently using currency input — for USD: \"$1,234.56\" with two decimals and thousand separators; for other currencies use the appropriate symbol or three-letter code prefix.\nFor each line, the Taxable column shows \"Yes\" or \"No\" based on the line's taxable flag from input. If a line is non-taxable, its Amount does not contribute to the taxable subtotal.\nAfter the data rows, emit one empty separator row before the section ends. Do NOT include subtotal in this section — that goes in the next section.\n\nSUBTOTAL, DISCOUNTS, TAXES: Right-aligned summary block, rendered as a small <table> with right-aligned numeric column. Compute and emit:\n  Subtotal (taxable items): $[sum of taxable lines]\n  Subtotal (non-taxable items): $[sum of non-taxable lines] — only if any non-taxable lines\n  Subtotal (combined): $[sum of all lines]\n  Discount: -$[discount amount] — only if discount_type is provided. Show the description from discount_detail or the human-readable form of discount_type (e.g., \"Early payment discount (2/10 net 30)\").\n  Adjusted Subtotal: $[after discount] — only if discount applied\n  Tax (X%, [tax_jurisdiction if provided]): $[tax_rate_percent × taxable subtotal / 100]\nFormat negatives as -$X or in parentheses ($X) consistent with the rest of the document.\n\nTOTAL DUE: Single prominent line: \"<strong>Total Due: [currency symbol or code][formatted amount]</strong>\" Format with currency consistency. The line should be visually emphasized via class total-row (the pipeline styles it). Below the total, on a separate line, state the due date: \"Due by [due_date].\"\n\nPAYMENT INSTRUCTIONS: payment_methods input formatted as a clear structured block. If multiple methods are listed (ACH, wire, check, online portal), render each as its own labeled block:\n  <h3>ACH / Wire Transfer</h3>\n  Bank Name: [bank name]\n  Routing Number (ACH): [routing]\n  SWIFT Code (international wire): [SWIFT]\n  Account Number: [account]\n  Beneficiary Name: [supplier or remit_to_name]\n  Reference: Invoice [invoice_number]\n  <h3>Check</h3>\n  Make payable to: [remit_to_name if different, else supplier name]\n  Mail to: [remit_to_address if different, else supplier address]\n  Reference: Invoice [invoice_number]\n  <h3>Online</h3>\n  [URL or instructions if provided]\nIf the supplier has a remit_to_name and remit_to_address that differ from the masthead-rendered supplier identity, surface those clearly as the remit-to.\n\nPAYMENT TERMS: Concise paragraph: \"Payment is due [payment_terms_label] from invoice date ([invoice_date]). Payments not received by [due_date] are considered late. Late payments accrue interest at [late_payment_interest_percent_monthly]% per month, or the maximum permitted by applicable law, whichever is lower.\"\nIf discount_type is \"early-payment-2-10-net-30\": \"Early payment discount: 2% if paid within ten (10) days of invoice date. Otherwise net 30.\"\nEnd with: \"Payment of this invoice does not waive any rights or claims of either party with respect to the underlying goods or services.\"\n\nBILLING CONTACT FOR DISPUTES: One paragraph: \"Disputes regarding this invoice must be submitted in writing to [billing_contact_name] at [billing_contact_email] within thirty (30) days of invoice date. Invoices not disputed in writing within thirty (30) days are deemed accepted. If a portion of this invoice is disputed, the undisputed portion remains due on schedule; the disputed portion may be withheld pending resolution. Disputed amounts must be specifically identified and supported by reference to a specific line item or term.\"\n\nNOTES: ONLY emit if notes input is non-empty. Single paragraph max, drawn from notes input. Use professional voice; no pleasantries.\n\n=== LENGTH ===\nTable-heavy document. Total prose should be 200–400 words; the line items table is the substance. Do not pad. AP departments value brevity and completeness; verbose invoices are rejected."
  },
  "meeting-minutes": {
    "slug": "meeting-minutes",
    "label": "Meeting Minutes / Decision Log",
    "description": "Formal meeting minutes with quorum tracking, structured voting records, executive session handling, formal resolutions, recusals, and corporate-secretary attestation.",
    "category": "operations",
    "supports_images": false,
    "has_signature_block": false,
    "has_toc": false,
    "layout": "minutes",
    "fields": [
      {
        "id": "meeting_type",
        "label": "Meeting type",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "board-of-directors",
            "label": "Board of Directors"
          },
          {
            "value": "board-committee",
            "label": "Board Committee"
          },
          {
            "value": "shareholder-meeting",
            "label": "Shareholder Meeting"
          },
          {
            "value": "executive-team",
            "label": "Executive Team"
          },
          {
            "value": "project-status",
            "label": "Project Status"
          },
          {
            "value": "town-hall",
            "label": "Town Hall"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "meeting_title",
        "label": "Meeting title",
        "type": "text",
        "required": true
      },
      {
        "id": "meeting_date",
        "label": "Meeting date",
        "type": "date",
        "required": true
      },
      {
        "id": "meeting_time_start",
        "label": "Meeting start time (24hr)",
        "type": "text",
        "required": true,
        "placeholder": "14:00"
      },
      {
        "id": "meeting_time_end",
        "label": "Meeting end time (24hr)",
        "type": "text",
        "required": true,
        "placeholder": "15:30"
      },
      {
        "id": "meeting_location",
        "label": "Meeting location",
        "type": "text",
        "required": true,
        "help": "Physical location or \"Virtual via [platform]\"."
      },
      {
        "id": "quorum_required",
        "label": "Quorum requirement",
        "type": "text",
        "required": false,
        "help": "e.g., \"Majority of directors\", \"5 members\"."
      },
      {
        "id": "quorum_present",
        "label": "Quorum present",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "met",
            "label": "Met — meeting properly constituted"
          },
          {
            "value": "not-met",
            "label": "Not met — discussion only, no formal action"
          },
          {
            "value": "not-applicable",
            "label": "Not applicable to this meeting type"
          }
        ]
      },
      {
        "id": "attendees_in_person",
        "label": "Attendees — in person (one per line)",
        "type": "textarea",
        "required": false,
        "help": "name | role/title"
      },
      {
        "id": "attendees_remote",
        "label": "Attendees — remote (one per line)",
        "type": "textarea",
        "required": false,
        "help": "name | role | method (phone/video)"
      },
      {
        "id": "attendees_guests",
        "label": "Guests / non-members",
        "type": "textarea",
        "required": false
      },
      {
        "id": "absent",
        "label": "Absent",
        "type": "textarea",
        "required": false
      },
      {
        "id": "prior_minutes_approval",
        "label": "Prior minutes approval",
        "type": "select",
        "required": false,
        "options": [
          {
            "value": "approved-as-circulated",
            "label": "Approved as circulated"
          },
          {
            "value": "approved-as-amended",
            "label": "Approved as amended"
          },
          {
            "value": "not-on-agenda",
            "label": "Not on agenda"
          }
        ]
      },
      {
        "id": "prior_minutes_amendments",
        "label": "Prior minutes amendments (if approved-as-amended)",
        "type": "textarea",
        "required": false
      },
      {
        "id": "consent_agenda_items",
        "label": "Consent agenda items (one per line)",
        "type": "textarea",
        "required": false,
        "help": "Items approved without discussion."
      },
      {
        "id": "agenda_items",
        "label": "Agenda items (one per line)",
        "type": "textarea",
        "required": true
      },
      {
        "id": "discussion_summary",
        "label": "Discussion summary (per agenda item)",
        "type": "textarea",
        "required": true
      },
      {
        "id": "motions_and_votes",
        "label": "Motions and votes (one per line)",
        "type": "textarea",
        "required": false,
        "help": "motion text | mover | seconder | vote count [for/against/abstain]"
      },
      {
        "id": "resolutions",
        "label": "Resolutions (formal RESOLVED THAT text)",
        "type": "textarea",
        "required": false
      },
      {
        "id": "recusals_conflicts",
        "label": "Recusals and conflicts",
        "type": "textarea",
        "required": false,
        "help": "name | item | reason"
      },
      {
        "id": "executive_session",
        "label": "Executive session held",
        "type": "select",
        "required": false,
        "options": [
          {
            "value": "no-executive-session",
            "label": "No executive session"
          },
          {
            "value": "yes-began-at-X-ended-at-Y",
            "label": "Yes — provide times below"
          }
        ]
      },
      {
        "id": "executive_session_times",
        "label": "Executive session times",
        "type": "text",
        "required": false,
        "placeholder": "16:30–17:15"
      },
      {
        "id": "tabled_items",
        "label": "Tabled / postponed items",
        "type": "textarea",
        "required": false
      },
      {
        "id": "action_items",
        "label": "Action items (one per line)",
        "type": "textarea",
        "required": true,
        "help": "owner | action | due date | status"
      },
      {
        "id": "next_meeting_date",
        "label": "Next meeting date",
        "type": "date",
        "required": false
      },
      {
        "id": "meeting_adjourned_at",
        "label": "Meeting adjourned at (24hr)",
        "type": "text",
        "required": true,
        "placeholder": "15:30"
      },
      {
        "id": "secretary_name",
        "label": "Secretary / minute-taker name",
        "type": "text",
        "required": true
      }
    ],
    "sections": [
      {
        "id": "header",
        "title": "Header"
      },
      {
        "id": "quorum_attendance",
        "title": "Quorum and Attendance"
      },
      {
        "id": "prior_minutes",
        "title": "Approval of Prior Minutes"
      },
      {
        "id": "consent_agenda",
        "title": "Consent Agenda"
      },
      {
        "id": "agenda",
        "title": "Agenda"
      },
      {
        "id": "discussion",
        "title": "Discussion of Agenda Items"
      },
      {
        "id": "motions_votes",
        "title": "Motions and Votes"
      },
      {
        "id": "resolutions",
        "title": "Resolutions"
      },
      {
        "id": "recusals",
        "title": "Recusals and Conflicts of Interest"
      },
      {
        "id": "executive_session",
        "title": "Executive Session"
      },
      {
        "id": "tabled_items",
        "title": "Tabled Items"
      },
      {
        "id": "action_items",
        "title": "Action Items"
      },
      {
        "id": "adjournment_attestation",
        "title": "Adjournment and Attestation"
      }
    ],
    "generation_notes": "Voice: Third-person, past-tense, factual. Records what happened, not commentary. Preserves user's exact language for decisions, motions, and resolutions — these are the legal record. Never includes emotional content, side conversations, or subjective observations. Use formal corporate-secretary register.\n\nPIPELINE OWNS THE HEADER. Do NOT emit sections titled \"Meeting Information\", \"Meeting Identification\", \"Meeting Details\", or any heading that duplicates the masthead content. The pipeline renders meeting type, title, date, time, location in the dedicated masthead at the top of the page. Start your output with the Quorum and Attendance section heading directly.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nQUORUM AND ATTENDANCE: Open with quorum statement based on quorum_present:\n  - 'met': \"Quorum requirement: [quorum_required if provided, else 'as specified in the governing documents']. Quorum was present and the meeting was properly constituted to conduct business.\"\n  - 'not-met': \"Quorum requirement: [quorum_required]. Quorum was NOT met. As a result, no formal action could be taken at this meeting; the meeting was held for discussion only. Action items requiring formal approval will be deferred to a properly constituted meeting.\"\n  - 'not-applicable': \"Quorum is not applicable to this meeting type.\"\nThen attendance, rendered as four sub-blocks if data present:\n  <h3>Present (in person)</h3> — list from attendees_in_person, one per line, with name and role/title.\n  <h3>Present (remote)</h3> — list from attendees_remote with name, role, and method (phone/video).\n  <h3>Guests / Non-Members</h3> — list from attendees_guests if any, with name and reason for attendance.\n  <h3>Absent</h3> — list from absent if any.\nFormat: <strong>Name</strong>, Role/Title — for each entry. Sub-blocks may be omitted if empty.\n\nAPPROVAL OF PRIOR MINUTES: ONLY emit if prior_minutes_approval is provided and not \"not-on-agenda\". Branch:\n  - 'approved-as-circulated': \"The minutes of the [prior meeting date if known, else 'previous'] meeting were approved as circulated. No amendments.\"\n  - 'approved-as-amended': \"The minutes of the previous meeting were approved as amended. The following amendments were made: [list from prior_minutes_amendments input].\"\n\nCONSENT AGENDA: ONLY emit if consent_agenda_items input is non-empty. \"The following items were approved by consent without discussion:\" Numbered list from consent_agenda_items input. End with: \"[Mover, if data captured] moved to approve the consent agenda; [Seconder] seconded; the motion carried by unanimous voice vote.\"\n\nAGENDA: Numbered list of agenda items as provided in agenda_items input. One item per line. This is the approved agenda for the meeting.\n\nDISCUSSION OF AGENDA ITEMS: One <h3> sub-section per agenda item from agenda_items input. Under each <h3>: 1–3 sentences of factual summary drawn from discussion_summary input, mapped to the agenda item. Format the summary as third-person past tense:\n  CORRECT: \"The committee reviewed Q1 financials. No concerns were raised. Budget was approved unanimously.\"\n  WRONG: \"There was great discussion about the Q1 financials and everyone was really engaged.\"\nWhere decisions or actions emerged from discussion, note them: \"[Decision/action], to be formalized under [Motions and Votes / Action Items].\" Do not editorialize. Do not characterize speaker tone or motivation. Stick to facts and outcomes.\n\nMOTIONS AND VOTES: ONLY emit if motions_and_votes input is non-empty. Each motion as a structured entry, NOT prose. Format as a definition-list-style block (or table if rendering allows):\n  <p><strong>Motion 1.</strong></p>\n  <p>Motion: \"[motion text verbatim]\"</p>\n  <p>Mover: [mover]</p>\n  <p>Seconder: [seconder]</p>\n  <p>Vote: [N] for, [N] against, [N] abstaining</p>\n  <p>Result: [Carried / Failed]</p>\nRepeat block for each motion. Do not run motions together as continuous prose. Each motion stands as its own record.\n\nRESOLUTIONS: ONLY emit if resolutions input is non-empty. Each resolution in formal \"RESOLVED THAT\" format with a reference number. Format:\n  <p><strong>Resolution [meeting_date]-[NN]</strong></p>\n  <p>RESOLVED THAT [resolution text in full, verbatim from input].</p>\n  <p>Adopted by [vote count if known, else \"unanimous voice vote\"].</p>\nRepeat for each resolution.\n\nRECUSALS AND CONFLICTS OF INTEREST: ONLY emit if recusals_conflicts input is non-empty. List each recusal with name, item recused from, and stated reason: \"[Name] disclosed a [type of conflict] with respect to [item] and recused from discussion and voting on that matter. [Name] left the meeting room during discussion at [time if known] and returned at [time if known].\" Format consistent across entries.\n\nEXECUTIVE SESSION: ONLY emit if executive_session is \"yes-began-at-X-ended-at-Y\" or similar non-\"no\" value. Format:\n  \"The board / committee entered executive session at [start time from executive_session_times] to discuss [permitted purpose — e.g., personnel matter, pending litigation, real estate transaction; if not stated, simply 'matters appropriate for executive session']. The board / committee adjourned executive session at [end time]. The substance of the executive session is recorded separately and is not included in these minutes.\"\nDO NOT include any substantive discussion that occurred in executive session in this report — even if it appears in discussion_summary. Executive-session minutes are kept separately.\n\nTABLED ITEMS: ONLY emit if tabled_items input is non-empty. Numbered list. Each entry: \"[Item] was tabled. Reason: [reason for postponement]. Disposition: [next regular meeting / specific date / pending further information].\"\n\nACTION ITEMS: Render as a <table> with columns: Owner | Action | Due Date | Status. One row per item parsed from action_items input. Status values: Open / In Progress / Completed / Deferred. Do not run action items together as prose.\n\nADJOURNMENT AND ATTESTATION: Single closing paragraph: \"There being no further business, the meeting was adjourned at [meeting_adjourned_at].\" Then attestation: \"Respectfully submitted by [secretary_name], [Title — typically 'Corporate Secretary' or 'Recording Secretary' or 'Designated Minute-Taker']. Date: [meeting_date].\"\nIf meeting_type is 'board-of-directors' or 'shareholder-meeting', add a chair-approval placeholder: \"Approved at the next regular meeting on [next_meeting_date if provided, else 'pending']: __________________________ (Chair).\"\nIf next_meeting_date is provided: \"The next regular meeting of the [meeting_type human-readable form] is scheduled for [next_meeting_date].\"\n\n=== LENGTH ===\n800–2000 words. Length tracks meeting complexity. A short status meeting may run 600–900 words; a board meeting with multiple motions, resolutions, and an executive session may run 1500–2500."
  },
  "nda": {
    "slug": "nda",
    "label": "Non-Disclosure Agreement",
    "description": "Professional mutual or one-way NDA with configurable optional clauses.",
    "category": "contracts",
    "supports_images": false,
    "has_signature_block": true,
    "has_toc": true,
    "layout": "contract",
    "fields": [
      {
        "id": "agreement_direction",
        "label": "Agreement direction",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "mutual",
            "label": "Mutual (both parties disclose and receive)"
          },
          {
            "value": "one-way",
            "label": "One-way (one party discloses, one receives)"
          }
        ],
        "help": "Mutual is recommended for exploratory business discussions."
      },
      {
        "id": "disclosing_party_name",
        "label": "Disclosing party — legal name",
        "type": "text",
        "required": true
      },
      {
        "id": "disclosing_party_entity_type",
        "label": "Disclosing party — entity type",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "llc",
            "label": "LLC"
          },
          {
            "value": "corporation",
            "label": "Corporation"
          },
          {
            "value": "partnership",
            "label": "Partnership"
          },
          {
            "value": "sole-proprietorship",
            "label": "Sole proprietorship"
          },
          {
            "value": "individual",
            "label": "Individual"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "disclosing_party_state",
        "label": "Disclosing party — state of formation (or residence if individual)",
        "type": "text",
        "required": true
      },
      {
        "id": "disclosing_party_address",
        "label": "Disclosing party — notice address",
        "type": "textarea",
        "required": true,
        "help": "Full address for legal notices, including email."
      },
      {
        "id": "receiving_party_name",
        "label": "Receiving party — legal name",
        "type": "text",
        "required": true
      },
      {
        "id": "receiving_party_entity_type",
        "label": "Receiving party — entity type",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "llc",
            "label": "LLC"
          },
          {
            "value": "corporation",
            "label": "Corporation"
          },
          {
            "value": "partnership",
            "label": "Partnership"
          },
          {
            "value": "sole-proprietorship",
            "label": "Sole proprietorship"
          },
          {
            "value": "individual",
            "label": "Individual (personal capacity)"
          },
          {
            "value": "individual-rep",
            "label": "Individual (representing an entity)"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ],
        "help": "If recipient will share information with their employer, select 'Individual representing an entity'."
      },
      {
        "id": "receiving_party_represented_entity",
        "label": "Receiving party — represented entity (if applicable)",
        "type": "text",
        "required": false,
        "help": "Only fill if receiving party is representing a company."
      },
      {
        "id": "receiving_party_state",
        "label": "Receiving party — state of formation (or residence if individual)",
        "type": "text",
        "required": true
      },
      {
        "id": "receiving_party_address",
        "label": "Receiving party — notice address",
        "type": "textarea",
        "required": true
      },
      {
        "id": "effective_date",
        "label": "Effective date",
        "type": "date",
        "required": true
      },
      {
        "id": "purpose",
        "label": "Purpose of disclosure — specific",
        "type": "textarea",
        "required": true,
        "help": "Be specific. This clause limits how information can be used — broader purpose = weaker protection."
      },
      {
        "id": "subject_matter",
        "label": "Subject matter of Confidential Information",
        "type": "textarea",
        "required": true,
        "help": "Short list of the kinds of information that will be shared."
      },
      {
        "id": "marking_requirement",
        "label": "Marking requirement",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "marked-only",
            "label": "Marked only — only information marked 'Confidential' is protected (narrowest)"
          },
          {
            "value": "marked-plus-oral",
            "label": "Marked + oral with 30-day confirmation"
          },
          {
            "value": "all-non-public",
            "label": "All non-public information protected (broadest, default)"
          }
        ],
        "help": "How Confidential Information is identified. 'All non-public' favors discloser; 'Marked only' favors recipient."
      },
      {
        "id": "disclosure_period_years",
        "label": "Disclosure period (years)",
        "type": "number",
        "required": true,
        "default": 2,
        "help": "How long parties may exchange information."
      },
      {
        "id": "confidentiality_period_years",
        "label": "Confidentiality period (years after disclosure)",
        "type": "number",
        "required": true,
        "default": 5,
        "help": "How long obligations apply. Trade secrets last indefinitely."
      },
      {
        "id": "governing_state",
        "label": "Governing law — state",
        "type": "text",
        "required": true
      },
      {
        "id": "jurisdiction_county",
        "label": "Jurisdiction — county and state for courts",
        "type": "text",
        "required": true
      },
      {
        "id": "include_non_solicitation",
        "label": "Include non-solicitation clause?",
        "type": "select",
        "required": true,
        "default": "no",
        "options": [
          {
            "value": "no",
            "label": "No"
          },
          {
            "value": "employees-only",
            "label": "Yes — employees only (12 months)"
          },
          {
            "value": "employees-and-customers",
            "label": "Yes — employees and customers (12 months)"
          }
        ],
        "help": "Restricts hiring each other's employees or soliciting customers."
      },
      {
        "id": "include_non_circumvention",
        "label": "Include non-circumvention clause?",
        "type": "select",
        "required": true,
        "default": "no",
        "options": [
          {
            "value": "no",
            "label": "No"
          },
          {
            "value": "yes",
            "label": "Yes — 12 months after termination"
          }
        ],
        "help": "Prevents bypassing the other party to engage directly with introduced partners."
      },
      {
        "id": "attorneys_fees",
        "label": "Attorneys' fees in dispute",
        "type": "select",
        "required": true,
        "default": "prevailing-party",
        "options": [
          {
            "value": "none",
            "label": "Each party bears own fees"
          },
          {
            "value": "prevailing-party",
            "label": "Prevailing party recovers fees (default)"
          }
        ]
      },
      {
        "id": "jury_waiver",
        "label": "Jury trial waiver",
        "type": "select",
        "required": true,
        "default": "no",
        "options": [
          {
            "value": "no",
            "label": "No — retain jury trial right"
          },
          {
            "value": "yes",
            "label": "Yes — waive right to jury trial"
          }
        ],
        "help": "Common in commercial agreements. Not enforceable in all jurisdictions."
      },
      {
        "id": "assignment_policy",
        "label": "Assignment policy",
        "type": "select",
        "required": true,
        "default": "consent-required",
        "options": [
          {
            "value": "consent-required",
            "label": "Consent required (except M&A successors)"
          },
          {
            "value": "no-assignment",
            "label": "No assignment — strictly personal"
          }
        ]
      }
    ],
    "sections": [
      {
        "id": "recitals",
        "title": "Recitals"
      },
      {
        "id": "definitions",
        "title": "Definitions"
      },
      {
        "id": "obligations",
        "title": "Obligations"
      },
      {
        "id": "permitted_disclosures",
        "title": "Permitted Disclosures"
      },
      {
        "id": "purpose_limitation",
        "title": "Purpose Limitation"
      },
      {
        "id": "no_license",
        "title": "No License; No Rights Granted"
      },
      {
        "id": "return_destruction",
        "title": "Return or Destruction"
      },
      {
        "id": "term",
        "title": "Term"
      },
      {
        "id": "remedies",
        "title": "Remedies; Injunctive Relief"
      },
      {
        "id": "reps_warranties",
        "title": "Representations and Warranties"
      },
      {
        "id": "optional_modules",
        "title": "Additional Covenants"
      },
      {
        "id": "notices",
        "title": "Notices"
      },
      {
        "id": "miscellaneous",
        "title": "Miscellaneous"
      },
      {
        "id": "governing_law",
        "title": "Governing Law and Jurisdiction"
      }
    ],
    "generation_notes": "Voice: Professional legal drafting. Precise, terse, unambiguous. No marketing language. No softening qualifiers. No filler. Lawyer voice throughout. Use 'shall' for mandatory obligations, 'may' for permitted acts. Use defined terms with proper capitalization once defined.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form in your output. The rendering pipeline adds the title on the cover page. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> Section heading. Start directly with the Recitals section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title listed in 'sections'. No section may appear without a heading, including the Miscellaneous section. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit ALL 14 sections in the exact order listed, even if a section is short. No section may be omitted. If 'Additional Covenants' would be empty (no non-solicitation or non-circumvention selected), omit only that section and renumber accordingly.\n\n=== SECTION-BY-SECTION REQUIREMENTS ===\n\nRECITALS (3 paragraphs): (a) Identify both parties — legal name, entity type, state of formation, one-sentence business description if entity. (b) State context — what the parties are considering. (c) Define Purpose as a capitalized defined term: 'The parties wish to exchange Confidential Information for the purpose of [purpose] (the \"Purpose\").'\n\nDEFINITIONS: Define at minimum: 'Confidential Information', 'Affiliate', 'Representative'. 'Confidential Information' scope depends on marking_requirement: if 'marked-only', require written marking of 'Confidential' or equivalent; if 'marked-plus-oral', require written marking for writings AND 30-day written confirmation for oral disclosures; if 'all-non-public', cover any non-public information regardless of marking. 'Affiliate' means any entity controlling, controlled by, or under common control with a party. 'Representative' means employees, officers, directors, agents, attorneys, accountants, and advisors with a need to know. Exclusions: (a) publicly available through no breach, (b) rightfully known prior to disclosure, (c) independently developed without reference to Confidential Information, (d) rightfully received from third party without confidentiality obligation.\n\nOBLIGATIONS: If agreement_direction='mutual', use reciprocal language — 'each Receiving Party' — and state that each party may act as Disclosing Party or Receiving Party depending on the information flow. If 'one-way', apply only to named Receiving Party. Required obligations: (1) hold in strict confidence, (2) use solely for Purpose, (3) protect with at least the same degree of care as own confidential information, not less than reasonable care, (4) limit access to Representatives with need to know who are bound by confidentiality obligations at least as protective as this Agreement, (5) Receiving Party is liable for breaches by its Representatives.\n\nPERMITTED DISCLOSURES: (a) Compelled by law, court order, or regulatory demand, provided Receiving Party gives prompt written notice and cooperates in seeking protective order. (b) To Representatives as defined. (c) Pursuant to Disclosing Party's prior written consent.\n\nPURPOSE LIMITATION: Explicit clause: 'Receiving Party shall not use Confidential Information for any purpose other than the Purpose.' Then: no reverse engineering, no use in competing products or services, no retention beyond the term except as expressly permitted.\n\nNO LICENSE; NO RIGHTS GRANTED: 'No license, express or implied, under any patent, copyright, trademark, trade secret, or other intellectual property right is granted by this Agreement. All Confidential Information remains the sole and exclusive property of Disclosing Party.'\n\nRETURN OR DESTRUCTION: Upon request of Disclosing Party or termination of this Agreement, Receiving Party shall return or destroy all Confidential Information. Exception: one archival copy may be retained by legal counsel solely for compliance verification, and information in automatic backup systems that cannot reasonably be deleted — such retained information remains subject to confidentiality obligations indefinitely.\n\nTERM: Two distinct periods. Disclosure Period: disclosure_period_years years from Effective Date, during which parties may exchange information under this Agreement. Confidentiality Period: confidentiality_period_years years following each disclosure during which obligations apply. Trade secrets remain confidential for as long as they qualify as trade secrets under applicable law, without time limit.\n\nREMEDIES; INJUNCTIVE RELIEF: Acknowledge monetary damages inadequate. Disclosing Party entitled to seek injunctive relief and specific performance without the necessity of posting a bond or proving actual damages. Remedies are cumulative and not exclusive of any other remedies at law or in equity.\n\nREPRESENTATIONS AND WARRANTIES: Each party represents it has the full right and authority to enter this Agreement. Disclosing Party represents it has the right to disclose the Confidential Information. Confidential Information is provided 'AS IS' without warranty of any kind, express or implied, including without limitation warranties of merchantability, fitness for a particular purpose, or non-infringement.\n\nADDITIONAL COVENANTS: Include ONLY if user selected non-solicitation or non-circumvention options.\n  - If include_non_solicitation='employees-only': 'For twelve (12) months after termination, neither party shall solicit for employment any employee of the other party who was involved in discussions under this Agreement.'\n  - If 'employees-and-customers': add 'and shall not solicit the business of any customer introduced by the other party during the term of this Agreement.'\n  - If include_non_circumvention='yes': 'For twelve (12) months after termination, neither party shall directly engage with any partner, vendor, or customer introduced by the other party through this relationship, without the written consent of the introducing party.'\n  - If BOTH are 'no', omit this entire section and note it is omitted.\n\nNOTICES: All notices in writing, delivered to the addresses specified in the Recitals. Effective upon: (a) personal delivery, (b) three business days after mailing by certified mail return receipt requested, or (c) one business day after email transmission with confirmation of delivery. Either party may update its notice address by written notice.\n\nMISCELLANEOUS: Include each of the following as a numbered or clearly separated sub-paragraph under this section:\n  1. Entire Agreement — supersedes all prior and contemporaneous agreements, written or oral.\n  2. Amendments — only by written instrument signed by both parties.\n  3. Severability — invalid provisions reformed or severed; rest continues in full force.\n  4. Waiver — no failure or delay to enforce constitutes waiver.\n  5. Assignment — per assignment_policy selected. If 'consent-required', allow assignment to successors in merger or acquisition without consent.\n  6. Counterparts — may be executed in counterparts including electronic signatures and scanned copies, each an original, together one instrument.\n  7. If attorneys_fees='prevailing-party': 'In any action arising out of or relating to this Agreement, the prevailing party shall be entitled to recover its reasonable attorneys' fees and costs from the non-prevailing party.'\n  8. If jury_waiver='yes': Include in ALL CAPS bold: 'EACH PARTY HEREBY IRREVOCABLY WAIVES ALL RIGHT TO TRIAL BY JURY IN ANY ACTION, PROCEEDING, OR COUNTERCLAIM ARISING OUT OF OR RELATING TO THIS AGREEMENT.'\n\nGOVERNING LAW AND JURISDICTION: Governed by and construed in accordance with the laws of governing_state, without regard to conflict-of-laws principles. Exclusive jurisdiction and venue in the state and federal courts located in jurisdiction_county.\n\n=== LENGTH ===\n1200-2200 words of legal content. This is a professional instrument — do not pad, do not skimp. Each section complete and enforceable."
  },
  "one-pager": {
    "slug": "one-pager",
    "label": "Executive One-Pager",
    "description": "Single-page sales/marketing document with problem-led structure, outcome metrics, two-tier CTA hierarchy, and structured contact paths.",
    "category": "marketing",
    "supports_images": false,
    "has_signature_block": false,
    "has_toc": false,
    "layout": "one-pager",
    "fields": [
      {
        "id": "subject_title",
        "label": "Subject title",
        "type": "text",
        "required": true,
        "help": "The thing being one-pagered (product, service, company, capability)."
      },
      {
        "id": "subject_type",
        "label": "Subject type",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "product",
            "label": "Product"
          },
          {
            "value": "service",
            "label": "Service"
          },
          {
            "value": "company",
            "label": "Company"
          },
          {
            "value": "opportunity",
            "label": "Opportunity"
          },
          {
            "value": "capability",
            "label": "Capability"
          },
          {
            "value": "platform",
            "label": "Platform"
          }
        ]
      },
      {
        "id": "tagline",
        "label": "Tagline (3–7 words)",
        "type": "text",
        "required": true,
        "help": "Cover/header punch. Pipeline renders prominently."
      },
      {
        "id": "value_proposition",
        "label": "Value proposition (1–2 sentences)",
        "type": "textarea",
        "required": true,
        "help": "Hero body. What the buyer accomplishes after adopting."
      },
      {
        "id": "problem_statement",
        "label": "Problem statement (audience pain)",
        "type": "textarea",
        "required": true,
        "help": "Leads the document. Specific scenarios beat generic categories."
      },
      {
        "id": "target_audience",
        "label": "Target audience",
        "type": "text",
        "required": true,
        "help": "Specific buyer role and context."
      },
      {
        "id": "outcome_metrics",
        "label": "Outcome metrics (one per line)",
        "type": "textarea",
        "required": true,
        "help": "metric | proof point. Numbers over claims."
      },
      {
        "id": "key_differentiators",
        "label": "Key differentiators (3–5 bullets)",
        "type": "textarea",
        "required": true,
        "help": "Structural advantages, not generic \"we care\"."
      },
      {
        "id": "use_cases",
        "label": "Use cases (optional)",
        "type": "textarea",
        "required": false,
        "help": "2–3 specific buyer scenarios."
      },
      {
        "id": "social_proof",
        "label": "Social proof (optional)",
        "type": "textarea",
        "required": false,
        "help": "Customer names, deployment scale, awards."
      },
      {
        "id": "pricing_signal",
        "label": "Pricing signal (optional)",
        "type": "text",
        "required": false,
        "help": "e.g., \"Starting at $X/month\", \"Enterprise pricing\"."
      },
      {
        "id": "cta_primary",
        "label": "Primary CTA",
        "type": "text",
        "required": true,
        "help": "e.g., \"Schedule a demo\", \"Start free trial\"."
      },
      {
        "id": "cta_secondary",
        "label": "Secondary CTA (optional)",
        "type": "text",
        "required": false
      },
      {
        "id": "contact_email",
        "label": "Contact email",
        "type": "text",
        "required": true
      },
      {
        "id": "contact_web",
        "label": "Contact web URL (optional)",
        "type": "text",
        "required": false
      },
      {
        "id": "contact_calendar",
        "label": "Calendar booking link (optional)",
        "type": "text",
        "required": false
      },
      {
        "id": "contact_phone",
        "label": "Contact phone (optional)",
        "type": "text",
        "required": false
      }
    ],
    "sections": [
      {
        "id": "header_tagline",
        "title": "Header / Tagline"
      },
      {
        "id": "the_problem",
        "title": "The Problem"
      },
      {
        "id": "the_solution_value_prop",
        "title": "The Solution"
      },
      {
        "id": "outcomes_metrics",
        "title": "Outcomes"
      },
      {
        "id": "differentiators",
        "title": "Why Us"
      },
      {
        "id": "use_cases",
        "title": "Use Cases"
      },
      {
        "id": "social_proof",
        "title": "Trusted By"
      },
      {
        "id": "cta_contact",
        "title": "Get Started"
      }
    ],
    "generation_notes": "Voice: Punchy, outcome-focused, lean. Lead with verbs. Lead with the buyer's pain, not the seller's solution. No corporate mission-statement language (\"Our mission is to...\"). No superlatives without proof. No adjectives substituting for evidence. Specific over general always. Numbers over claims. The one-pager is a conversion document — every word earns space.\n\nPIPELINE OWNS THE HEADER. Do NOT emit the tagline, subject_title, or any cover treatment — the pipeline renders the masthead with the tagline and subject prominently. Start your output directly with The Problem section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nTHE PROBLEM: 2–3 sentences. State the audience's pain in their own words. Drawn from problem_statement input. Be specific — generic problems (\"companies struggle with X\") are weak signals. Specific scenarios (\"Your team spends twelve hours per week reformatting client deliverables in Word, then a partner spends two more hours editing for brand consistency\") are strong signals because they demonstrate that the seller has observed the buyer.\nFormat: lead with a direct second-person address (\"Your team / your firm / you\") to the target_audience. Avoid third-person abstraction.\n\nTHE SOLUTION: 2–3 sentences. State the value proposition (drawn from value_proposition input). Lead with what the user accomplishes, NOT how the product works.\n  CORRECT: \"Apollo finishes your deliverables. Submit a brief, get a print-ready PDF in minutes.\"\n  WRONG: \"Apollo is an AI-powered document automation platform built on a modular architecture...\"\nThe Solution section answers: what does the buyer do differently after adopting? Not: what is this product made of?\n\nOUTCOMES: Bullet list drawn from outcome_metrics input. Each bullet leads with a number or quantified outcome:\n  CORRECT: \"80% reduction in deliverable cycle time at [Client].\"\n  CORRECT: \"$2M in additional billable hours captured at [Firm] in the first year.\"\n  CORRECT: \"200+ engagements deployed without a single rework cycle.\"\n  WRONG: \"better outcomes\" / \"improved efficiency\" / \"stronger results.\"\nEach bullet pairs a number with a proof point: who experienced it, in what context. Use real client names where authorized; use sanitized names (\"a top-30 law firm\") otherwise. Three to five bullets is ideal; more dilutes signal.\n\nWHY US: Differentiators drawn from key_differentiators input. Each one a tight bullet — what makes this offering structurally different from alternatives the buyer is evaluating. Avoid generic differentiators (\"we care about quality\", \"we have experience\", \"we listen to clients\"). Specific structural advantages or capabilities only:\n  CORRECT: \"Per-deliverable pricing — no seat licenses, no annual commits, no procurement cycle.\"\n  CORRECT: \"Brand-locked output — every document ships at the same visual standard, automatically.\"\n  CORRECT: \"Deterministic orchestration — quality gates at every section; no chatbot guesswork.\"\n  WRONG: \"We're committed to your success.\" (generic, evidence-free)\nThree to five tight bullets.\n\nUSE CASES: ONLY emit if use_cases input is non-empty. Two to three specific applications. Frame each as the buyer's situation, not the seller's catalog:\n  CORRECT: \"When your associate is buried in NDA reviews and the partner needs the redline by EOD.\"\n  CORRECT: \"When the audit committee deck is due Friday and the FP&A draft is not yet board-ready.\"\n  WRONG: \"Apollo can be used for many document types...\" (sellercentric, generic)\nEach use case is a vivid scenario describing the buyer's situation and the value of the solution in that context.\n\nTRUSTED BY: ONLY emit if social_proof input is non-empty. Concrete and verifiable. Customer names (sanitized as needed), deployment scale, awards, certifications. Format as a tight comma-delimited line or short list:\n  \"Trusted by On Spot Solutions, Reed Partners Capital, and three other firms in the Fortune 500.\"\n  OR a list of: \"Customer (sanitized) | scale | duration.\"\nAvoid \"Many happy customers!\" or \"Trusted by industry leaders.\" — substantively empty.\n\nGET STARTED: Two-tier CTA structure.\n  Primary CTA prominently — what should the reader do RIGHT NOW. Drawn from cta_primary input. Format the CTA as a clear imperative: \"Schedule a 30-minute walkthrough →\" or \"Start your free pilot →\" or \"Request invite-only access →\". The arrow or visual cue is optional but signals action.\n  Secondary CTA, if cta_secondary input provided. Less prominent. Different action: \"Read the case study\", \"Download the whitepaper\", \"Browse the docs.\"\nThen contact paths in priority order, only emitting those provided in input:\n  Web: [contact_web]\n  Calendar booking: [contact_calendar]\n  Email: [contact_email]\n  Phone: [contact_phone]\nPricing signal at the bottom IF pricing_signal input provided. Format as a single line: \"Starting at $X/month\" or \"Enterprise pricing — contact for quote\" or \"Free tier available; PRO at $39.99/mo.\"\nEnd with a single closing thought drawn from the value proposition or a final win-theme reinforcement, in no more than one sentence.\n\n=== LENGTH ===\n250–500 words. The ONE template where shorter is always better. If your output exceeds 500 words, you are padding; tighten. The one-pager fits on one printed page including margins, masthead, and CTA — every word competes for that space."
  },
  "personal-monthly": {
    "slug": "personal-monthly",
    "label": "Personal Monthly Summary",
    "description": "Personal financial monthly summary with income, expenses, savings, debt, optional net worth snapshot, goal tracking, and outlook.",
    "category": "finance",
    "supports_images": false,
    "has_signature_block": false,
    "has_toc": false,
    "layout": "financial-statement",
    "fields": [
      {
        "id": "person_name",
        "label": "Person name",
        "type": "text",
        "required": true
      },
      {
        "id": "month_label",
        "label": "Month label",
        "type": "text",
        "required": true,
        "help": "e.g., \"April 2026\"."
      },
      {
        "id": "income_sources",
        "label": "Income sources (one per line)",
        "type": "textarea",
        "required": true,
        "help": "source | amount"
      },
      {
        "id": "fixed_expenses",
        "label": "Fixed expenses (one per line)",
        "type": "textarea",
        "required": true,
        "help": "category | amount — housing, utilities, insurance, subscriptions"
      },
      {
        "id": "variable_expenses",
        "label": "Variable expenses (one per line)",
        "type": "textarea",
        "required": true,
        "help": "category | amount — groceries, transport, dining, discretionary"
      },
      {
        "id": "savings_deposits",
        "label": "Savings deposits (one per line)",
        "type": "textarea",
        "required": false,
        "help": "account | amount"
      },
      {
        "id": "debt_payments",
        "label": "Debt payments (one per line)",
        "type": "textarea",
        "required": false,
        "help": "debt | amount | type (principal/interest)"
      },
      {
        "id": "assets_snapshot",
        "label": "Assets snapshot (optional)",
        "type": "textarea",
        "required": false,
        "help": "asset | value"
      },
      {
        "id": "liabilities_snapshot",
        "label": "Liabilities snapshot (optional)",
        "type": "textarea",
        "required": false,
        "help": "liability | balance"
      },
      {
        "id": "notable_events",
        "label": "Notable financial events (optional)",
        "type": "textarea",
        "required": false,
        "help": "One-time financial events this month."
      },
      {
        "id": "goals_progress",
        "label": "Goals progress (optional)",
        "type": "textarea",
        "required": false,
        "help": "goal | target | actual | status"
      },
      {
        "id": "next_month_adjustments",
        "label": "Next month adjustments (optional)",
        "type": "textarea",
        "required": false
      },
      {
        "id": "prepared_date",
        "label": "Prepared date",
        "type": "date",
        "required": true
      }
    ],
    "sections": [
      {
        "id": "header_masthead",
        "title": "Header"
      },
      {
        "id": "income_summary",
        "title": "Income"
      },
      {
        "id": "expenses_summary",
        "title": "Expenses"
      },
      {
        "id": "savings_debt_summary",
        "title": "Savings and Debt"
      },
      {
        "id": "net_position",
        "title": "Net Cash Flow"
      },
      {
        "id": "net_worth_snapshot",
        "title": "Net Worth Snapshot"
      },
      {
        "id": "goals_events",
        "title": "Goals and Notable Events"
      },
      {
        "id": "next_month_outlook",
        "title": "Next Month Outlook"
      }
    ],
    "generation_notes": "Voice: Personal-financial neutral. Factual. Use the person's name in third person (\"[Name]'s income for [month] totaled...\" / \"[Name] saved...\"). Never editorialize on choices (\"[Name] should reduce dining out\"). Do not assess goodness or badness; report the numbers. The summary is a record of what was earned, spent, saved, and owed during the month — neutrally presented for the person's own review and planning.\n\nPIPELINE OWNS THE HEADER (person_name, month_label, prepared_date in masthead). Do NOT emit a title or section that duplicates the masthead. Start your output directly with the Income section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nINCOME: <table class=\"fin-table\"> with columns: Source | Amount. Parse income_sources input as pipe-separated \"source | amount\". One row per source. Subtotal row using class \"subtotal-row\" labeled \"Total Income\" with the sum.\nFormat all currency consistently: $X,XXX.XX with thousand separators and two decimals.\n\nEXPENSES: Two distinct sub-sections rendered as <h3>:\n  <h3>Fixed Expenses</h3> — <table class=\"fin-table\"> with columns Category | Amount. Parse fixed_expenses input. Rows for housing, utilities, insurance, subscriptions, etc. Subtotal \"Subtotal — Fixed Expenses\".\n  <h3>Variable Expenses</h3> — <table class=\"fin-table\"> with columns Category | Amount. Parse variable_expenses input. Rows for groceries, transport, dining, discretionary, etc. Subtotal \"Subtotal — Variable Expenses\".\nAfter both sub-tables, a single combined total row: \"Total Expenses: $[sum of both subtotals]\" — rendered as a paragraph or as a closing line in a small summary table.\n\nSAVINGS AND DEBT: Two sub-sections rendered as <h3>:\n  <h3>Savings Deposits</h3> — ONLY emit if savings_deposits input is non-empty. <table class=\"fin-table\"> with columns Account | Amount. Subtotal \"Total Savings Deposits\".\n  <h3>Debt Payments</h3> — ONLY emit if debt_payments input is non-empty. <table class=\"fin-table\"> with columns Debt | Amount | Type (Principal / Interest). Subtotal \"Total Debt Payments\".\nIf both sub-sections are empty (no savings, no debt activity), emit a brief paragraph: \"No savings deposits or debt payments recorded for [month_label].\"\n\nNET CASH FLOW: Single summary block as a small <table class=\"fin-table\">:\n  Total Income: $X\n  Less: Total Expenses: -$Y\n  Less: Savings Deposits: -$Z (if savings section was emitted)\n  Less: Debt Payments: -$W (if debt section was emitted)\n  ─────\n  Net Cash Flow: $(X - Y - Z - W)\nThe \"Net Cash Flow\" row uses class \"total-row\" for emphasis. State the result one of three ways:\n  - Positive: \"[Name]'s net cash flow for [month_label] is positive at $[amount], available for additional savings, debt reduction, or carry-forward.\"\n  - Zero: \"[Name]'s income matched outflows exactly for [month_label].\"\n  - Negative: \"[Name]'s net cash flow for [month_label] is negative at $[amount]; outflows exceeded income.\"\nKeep the framing factual.\n\nNET WORTH SNAPSHOT: ONLY emit if assets_snapshot or liabilities_snapshot input is non-empty.\nRender as two parallel sub-tables (or columns):\n  <h3>Assets</h3> — list with values, total at the bottom.\n  <h3>Liabilities</h3> — list with balances, total at the bottom.\nThen a final line: \"Net Worth ([prepared_date]): Assets $[A] − Liabilities $[L] = $[A − L].\" If only assets provided (no liabilities) or vice versa, state \"Liabilities not reported in this summary\" or similar. The net worth figure uses class \"total-row\" treatment.\n\nGOALS AND NOTABLE EVENTS: ONLY emit if goals_progress or notable_events input is non-empty.\n  <h3>Goals Progress</h3> — only if goals_progress provided. <table class=\"fin-table\"> with columns Goal | Target | Actual | Status. Status values: On Track / Ahead / Behind / Achieved.\n  <h3>Notable Events</h3> — only if notable_events provided. Bulleted list of one-time events that affected this month's finances (bonus, refund, large purchase, medical event).\n\nNEXT MONTH OUTLOOK: ONLY emit if next_month_adjustments input is non-empty. Brief paragraph (2–4 sentences) describing planned adjustments for the upcoming month: changes to budget categories, planned large expenses or income, new savings or debt-payment targets. No prescriptive language.\n\n=== LENGTH ===\n400–800 words of prose. Tables provide most of the substance; commentary is brief and neutral."
  },
  "proposal": {
    "slug": "proposal",
    "label": "Consulting/Services Proposal",
    "description": "Full services proposal with executive summary, methodology phases, team, past performance, risk register, pricing, and optional compliance matrix for RFP responses.",
    "category": "sales",
    "supports_images": false,
    "has_signature_block": true,
    "has_toc": true,
    "layout": "contract",
    "fields": [
      {
        "id": "prospect_organization",
        "label": "Prospect organization",
        "type": "text",
        "required": true
      },
      {
        "id": "prospect_contact_name",
        "label": "Prospect contact — name",
        "type": "text",
        "required": true
      },
      {
        "id": "prospect_contact_title",
        "label": "Prospect contact — title",
        "type": "text",
        "required": true
      },
      {
        "id": "proposal_date",
        "label": "Proposal date",
        "type": "date",
        "required": true
      },
      {
        "id": "rfp_reference",
        "label": "RFP reference / number (optional)",
        "type": "text",
        "required": false
      },
      {
        "id": "problem_statement",
        "label": "Problem statement (in client's words)",
        "type": "textarea",
        "required": true
      },
      {
        "id": "our_understanding",
        "label": "Our understanding of the problem",
        "type": "textarea",
        "required": true,
        "help": "Restatement of the problem demonstrating comprehension. 2–3 paragraphs."
      },
      {
        "id": "win_themes",
        "label": "Win themes (3–4)",
        "type": "textarea",
        "required": true,
        "help": "Short messages that thread through the proposal. One per line."
      },
      {
        "id": "evaluation_criteria",
        "label": "Evaluation criteria (optional)",
        "type": "textarea",
        "required": false,
        "help": "If responding to an RFP with stated criteria, list them. Triggers a Compliance Matrix appendix."
      },
      {
        "id": "proposed_methodology",
        "label": "Proposed methodology / phases",
        "type": "textarea",
        "required": true,
        "help": "Each phase: name | activities | deliverables | duration. One per line or one per paragraph."
      },
      {
        "id": "team_lead_name",
        "label": "Team lead — name",
        "type": "text",
        "required": true
      },
      {
        "id": "team_lead_qualifications",
        "label": "Team lead — qualifications",
        "type": "textarea",
        "required": true,
        "help": "2–4 sentences of relevant experience."
      },
      {
        "id": "team_members",
        "label": "Team members (one per line)",
        "type": "textarea",
        "required": true,
        "help": "Format: name | role | relevant experience."
      },
      {
        "id": "past_performance",
        "label": "Past performance / case studies (optional)",
        "type": "textarea",
        "required": false,
        "help": "Each line: client | scope | outcome | duration."
      },
      {
        "id": "references",
        "label": "References (optional)",
        "type": "textarea",
        "required": false,
        "help": "Each line: name | title | organization | contact."
      },
      {
        "id": "risks_and_mitigations",
        "label": "Risks and mitigations",
        "type": "textarea",
        "required": true,
        "help": "3–5 lines: risk | mitigation. Specific to this engagement."
      },
      {
        "id": "assumptions",
        "label": "Assumptions",
        "type": "textarea",
        "required": true
      },
      {
        "id": "pricing_model",
        "label": "Pricing model",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "fixed-fee",
            "label": "Fixed fee"
          },
          {
            "value": "time-and-materials",
            "label": "Time and materials"
          },
          {
            "value": "hybrid",
            "label": "Hybrid"
          },
          {
            "value": "milestone-based",
            "label": "Milestone-based"
          }
        ]
      },
      {
        "id": "pricing_detail",
        "label": "Pricing detail",
        "type": "textarea",
        "required": true,
        "help": "Rates by role × hours, or fixed total with milestone schedule."
      },
      {
        "id": "pricing_optional_services",
        "label": "Optional add-on services (optional)",
        "type": "textarea",
        "required": false,
        "help": "Add-on services with separate pricing."
      },
      {
        "id": "validity_period_days",
        "label": "Proposal validity (days)",
        "type": "number",
        "required": true,
        "default": 60
      },
      {
        "id": "next_steps_call_to_action",
        "label": "Next steps / call to action",
        "type": "textarea",
        "required": true,
        "help": "Specific actions to proceed."
      }
    ],
    "sections": [
      {
        "id": "cover",
        "title": "Cover Page"
      },
      {
        "id": "executive_summary",
        "title": "Executive Summary"
      },
      {
        "id": "understanding_of_need",
        "title": "Understanding of Your Needs"
      },
      {
        "id": "proposed_approach",
        "title": "Proposed Approach"
      },
      {
        "id": "methodology_phases",
        "title": "Methodology and Phases"
      },
      {
        "id": "deliverables",
        "title": "Deliverables"
      },
      {
        "id": "team_organization",
        "title": "Team and Organization"
      },
      {
        "id": "past_performance",
        "title": "Past Performance"
      },
      {
        "id": "references",
        "title": "References"
      },
      {
        "id": "risk_management",
        "title": "Risk Identification and Mitigation"
      },
      {
        "id": "assumptions",
        "title": "Assumptions"
      },
      {
        "id": "timeline",
        "title": "Timeline"
      },
      {
        "id": "pricing_investment",
        "title": "Pricing and Investment"
      },
      {
        "id": "next_steps",
        "title": "Next Steps and Acceptance"
      },
      {
        "id": "appendix_compliance",
        "title": "Appendix: Compliance Matrix"
      }
    ],
    "generation_notes": "Voice: Confident, specific, grounded in the prospect's stated problem. Demonstrates capability through evidence (specific outcomes, named clients, quantified results) rather than assertion (adjectives, superlatives). Avoid: \"world-class\", \"best-in-class\", \"innovative\", \"cutting-edge\", \"industry-leading\", \"passionate\", \"thrilled\", \"excited\" — these are weak signals because they substitute for evidence. Replace with specifics: numbers, durations, named outcomes, named clients (sanitized as needed), named methodologies. Win themes thread through every section subtly — not as marketing copy but as recurring substantive emphasis.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nEXECUTIVE SUMMARY: Five paragraphs, ONE sentence each. Each sentence reinforces a win theme drawn from win_themes input.\n  Sentence 1: Restate the prospect's business challenge (drawn from problem_statement input). Frame in their language.\n  Sentence 2: State the proposed approach in one sentence — what will be done, with what methodology.\n  Sentence 3: State the expected outcome with a quantified target if possible (e.g., \"30% reduction in cycle time\", \"$2M savings\", \"60-day deployment\").\n  Sentence 4: State the proposer's unique qualification — what differentiates from alternatives. Specific, not generic.\n  Sentence 5: State why act now — timing, market window, regulatory deadline, opportunity cost of delay.\nThe sentences should each stand alone but together form a coherent argument. Do not pad. Five tight sentences are stronger than five paragraphs.\n\nUNDERSTANDING OF YOUR NEEDS: Two paragraphs.\n  Paragraph 1: Restate the prospect's problem in proposer's own words drawing from our_understanding input. This is the \"I heard you\" paragraph — demonstrates comprehension of the situation, the constraints, the goals. Use the prospect's own terminology where it appears in the source materials.\n  Paragraph 2: State why this problem matters now. What is the business consequence of inaction? What is the timing pressure? Cite specifics: regulatory deadlines, market windows, internal commitments, competitive dynamics.\nEnd with one transition sentence into the proposed approach.\n\nPROPOSED APPROACH: Two to four paragraphs. Methodology overview at a high level — NOT phase detail (that's the next section). Cover:\n  - Why this approach is right for this client's situation specifically\n  - What the prospect will experience during the engagement (cadence, touchpoints, decision points)\n  - What level of access/cooperation is required from the client\n  - What is unique about how proposer approaches this work — the \"why us doing it this way\" without adjectives\nAvoid generic methodology descriptions; tie every choice to the client's stated problem.\n\nMETHODOLOGY AND PHASES: Numbered phases parsed from proposed_methodology input. For EACH phase, render as a sub-block with:\n  <h3>[Phase number]. [Phase name]</h3>\n  One paragraph describing the activities in that phase.\n  <strong>Deliverables:</strong> bulleted list of what comes out of this phase.\n  <strong>Duration:</strong> [estimate].\n  <strong>Dependencies:</strong> what must be in place from the prior phase or from Client to begin.\nThree to five phases is typical. End the section with a brief paragraph on how phases connect — handoff points, decision gates, governance.\n\nDELIVERABLES: Consolidated list of ALL deliverables across all phases. Each as a numbered item with:\n  - Deliverable name (bolded)\n  - One-sentence definition\n  - Acceptance criteria (objective, measurable; reference the engagement letter / SOW that will follow)\n  - Format (e.g., written report PDF, presentation deck, source code repository)\nThis consolidated view helps evaluators map the proposal to their needs without reconstructing it from phases.\n\nTEAM AND ORGANIZATION: Lead with the team_lead callout: <h3>[team_lead_name]</h3> followed by team_lead_qualifications as a 2–4 sentence credential summary. Then a team table parsed from team_members input with columns Name | Role | Relevant Experience. After the table, one paragraph on reporting structure and engagement governance: who Client interfaces with, escalation paths, frequency of status updates. Avoid org chart graphics unless absolutely necessary.\n\nPAST PERFORMANCE: ONLY emit if past_performance input is non-empty. For each entry parsed from input as \"client | scope | outcome | duration\":\n  <h3>[Client name, sanitized if needed]</h3>\n  <strong>Scope:</strong> [scope description, 2–3 sentences]\n  <strong>Outcome:</strong> [measurable result, with numbers]\n  <strong>Duration:</strong> [duration]\nThree to five entries is ideal — too many dilutes signal. Quality of detail matters more than quantity.\n\nREFERENCES: ONLY emit if references input is non-empty. Brief list of references with the format: Name | Title | Organization | Contact (email or phone). One reference per line. End with: \"References available for direct contact upon mutual agreement to proceed; please coordinate timing through [proposer contact].\"\n\nRISK IDENTIFICATION AND MITIGATION: <table> with columns: Risk | Likelihood (Low/Medium/High) | Impact (Low/Medium/High) | Mitigation Strategy. Three to five rows from risks_and_mitigations input, parsed as \"risk | mitigation\". Be specific — \"delays\" or \"scope creep\" without specifics signal a generic proposal. Risks should be specific to this engagement: regulatory uncertainty, technical integration unknowns, stakeholder alignment, data quality, market shifts.\n\nASSUMPTIONS: Numbered list. Each assumption is a clear declarative statement of what proposer is relying on for the proposed plan and pricing:\n  - Client decisions on material questions within five business days\n  - Access to subject-matter experts named in the team section's reporting structure\n  - Existing data sources documented in [Appendix or pre-engagement]\n  - No major regulatory or organizational change during the engagement\nEnd with: \"Material deviations from these assumptions will be addressed via written change order in the engagement letter or SOW that follows. Pricing and timeline reflect these assumptions.\"\n\nTIMELINE: Visual milestone summary in prose form. Reference the phase end dates from the Methodology section. Note critical path indicators where applicable. Single calendar reference (e.g., \"Engagement Kickoff: Week 1; Phase 1 Complete: Week 4; Phase 2 Complete: Week 8; Final Deliverable: Week 12\"). State that target dates assume Engagement Letter / SOW execution by [proposal_date + validity_period_days days].\n\nPRICING AND INVESTMENT: Restate pricing_model. Detailed breakdown from pricing_detail input.\n  - 'fixed-fee': total amount, payment milestones tied to phase completion or deliverable acceptance, percentages summing to 100%.\n  - 'time-and-materials': rates by role (table), estimated hours by role, not-to-exceed cap, monthly invoicing.\n  - 'milestone-based': specific dollar amounts at specific milestones with acceptance criteria triggers.\n  - 'hybrid': describe both portions.\nIf pricing_optional_services input is provided, render as a separate sub-section <h3>Optional Add-On Services</h3> with name, description, separate price.\nValidity statement (verbatim): \"This proposal is valid through [proposal_date + validity_period_days days]. Pricing assumes execution of the engagement letter or SOW by that date. Subsequent execution may require re-pricing reflecting then-current rates and scope.\"\n\nNEXT STEPS AND ACCEPTANCE: Specific actions per next_steps_call_to_action input. Typical structure: \"To proceed, the parties will execute an Engagement Letter (or Statement of Work) substantially in the form attached or in negotiation. Please indicate intent to proceed by [date], and we will deliver the executable engagement document within five business days. Upon execution, we will commence with a kickoff meeting within five business days.\" If a counter-signature line is included on the proposal itself: \"If the foregoing approach and pricing are acceptable in principle, please countersign below to authorize preparation of the formal engagement document. This signature does not constitute the final engagement agreement.\"\n\nAPPENDIX: COMPLIANCE MATRIX: ONLY emit if evaluation_criteria input is non-empty. Render as a table with columns: Evaluation Criterion | Proposal Section | Page (if known). Map each criterion from evaluation_criteria input to the section(s) of this proposal that address it. This is critical for RFP responses; reviewers use it to verify completeness.\n\n=== LENGTH ===\n2500–4500 words. Comprehensive but disciplined. Length should follow content — proposals for simple engagements should be shorter; complex government RFPs longer. Never pad to hit length."
  },
  "sow": {
    "slug": "sow",
    "label": "Scope of Work",
    "description": "Professional consulting Statement of Work with full clause set including definitions, acceptance criteria, change control, IP ownership, liability cap, indemnification, insurance, and survival.",
    "category": "contracts",
    "supports_images": false,
    "has_signature_block": true,
    "has_toc": true,
    "layout": "contract",
    "fields": [
      {
        "id": "client_name",
        "label": "Client — legal name",
        "type": "text",
        "required": true
      },
      {
        "id": "client_entity_type",
        "label": "Client — entity type",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "individual",
            "label": "Individual"
          },
          {
            "value": "llc",
            "label": "LLC"
          },
          {
            "value": "corporation",
            "label": "Corporation"
          },
          {
            "value": "partnership",
            "label": "Partnership"
          },
          {
            "value": "non-profit",
            "label": "Non-profit"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "client_address",
        "label": "Client — notice address",
        "type": "textarea",
        "required": true
      },
      {
        "id": "project_title",
        "label": "Project title",
        "type": "text",
        "required": true
      },
      {
        "id": "engagement_model",
        "label": "Engagement model",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "fixed-fee",
            "label": "Fixed fee"
          },
          {
            "value": "time-and-materials",
            "label": "Time and materials (with not-to-exceed cap)"
          },
          {
            "value": "hybrid",
            "label": "Hybrid (fixed + T&M)"
          }
        ]
      },
      {
        "id": "start_date",
        "label": "Start date",
        "type": "date",
        "required": true
      },
      {
        "id": "end_date",
        "label": "Target end date",
        "type": "date",
        "required": true
      },
      {
        "id": "project_summary",
        "label": "Project summary",
        "type": "textarea",
        "required": true,
        "help": "1–3 paragraphs describing the project at a high level. Used in Executive Summary."
      },
      {
        "id": "deliverables",
        "label": "Deliverables (one per line)",
        "type": "textarea",
        "required": true,
        "help": "Each line: deliverable name | description | acceptance criteria | format | target date."
      },
      {
        "id": "assumptions",
        "label": "Assumptions",
        "type": "textarea",
        "required": true,
        "help": "What Consultant is relying on. Each item is a separate line."
      },
      {
        "id": "exclusions",
        "label": "Exclusions",
        "type": "textarea",
        "required": true,
        "help": "What is explicitly NOT in scope."
      },
      {
        "id": "fee_amount_dollars",
        "label": "Total fee ($)",
        "type": "number",
        "required": true,
        "help": "Fixed total or T&M not-to-exceed cap."
      },
      {
        "id": "fee_detail",
        "label": "Fee detail",
        "type": "textarea",
        "required": true,
        "help": "Breakdown by role × rate if T&M; payment milestones if fixed."
      },
      {
        "id": "payment_terms",
        "label": "Payment terms",
        "type": "text",
        "required": true,
        "default": "Net 30"
      },
      {
        "id": "expense_policy",
        "label": "Expense policy",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "client-pays-actual",
            "label": "Client pays actual at cost"
          },
          {
            "value": "included-in-fee",
            "label": "Included in fee"
          },
          {
            "value": "pre-approval-over-threshold",
            "label": "Pre-approval required over threshold"
          }
        ]
      },
      {
        "id": "expense_threshold_dollars",
        "label": "Expense pre-approval threshold ($)",
        "type": "number",
        "required": false
      },
      {
        "id": "client_pm_name",
        "label": "Client Project Owner — name",
        "type": "text",
        "required": true,
        "help": "Designated decision-maker with acceptance authority."
      },
      {
        "id": "provider_pm_name",
        "label": "Provider Engagement Lead — name",
        "type": "text",
        "required": true
      },
      {
        "id": "liability_cap_multiplier",
        "label": "Liability cap multiplier (× fees)",
        "type": "number",
        "required": true,
        "default": 1,
        "help": "1× standard; 2× for higher-risk engagements."
      },
      {
        "id": "governing_state",
        "label": "Governing state",
        "type": "text",
        "required": true
      }
    ],
    "sections": [
      {
        "id": "cover",
        "title": "Cover Page"
      },
      {
        "id": "definitions",
        "title": "Definitions"
      },
      {
        "id": "executive_summary",
        "title": "Executive Summary"
      },
      {
        "id": "scope_of_work",
        "title": "Scope of Work"
      },
      {
        "id": "deliverables_acceptance",
        "title": "Deliverables and Acceptance"
      },
      {
        "id": "timeline_milestones",
        "title": "Timeline and Milestones"
      },
      {
        "id": "assumptions_exclusions",
        "title": "Assumptions and Exclusions"
      },
      {
        "id": "fees_payment",
        "title": "Fees and Payment Terms"
      },
      {
        "id": "change_control",
        "title": "Change Control"
      },
      {
        "id": "intellectual_property",
        "title": "Intellectual Property"
      },
      {
        "id": "representations_independent_contractor",
        "title": "Representations and Independent Contractor"
      },
      {
        "id": "limitation_liability_insurance",
        "title": "Limitation of Liability, Indemnification, and Insurance"
      },
      {
        "id": "term_termination",
        "title": "Term, Termination, and Survival"
      },
      {
        "id": "general_provisions_signatures",
        "title": "General Provisions and Signatures"
      }
    ],
    "generation_notes": "Voice: Consulting-professional. Clear, direct, unambiguous about scope and deliverables. Defensive about assumptions. Use \"Consultant\" and \"Client\" as defined terms throughout — define them in the Definitions section. Do not use first-person plural (\"we\"). Use third-person formal voice (\"Consultant shall provide...\"). No marketing language. No softening qualifiers. The SOW is a contractual instrument.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nDEFINITIONS: Define each of the following capitalized terms with concise definitions. These terms are used throughout the document; consistency is essential.\n  - \"Consultant\" — the entity providing services (pull from brand).\n  - \"Client\" — [client_name].\n  - \"Effective Date\" — [start_date].\n  - \"Services\" — the work described in the Scope of Work section.\n  - \"Deliverables\" — the specific outputs identified in the Deliverables and Acceptance section.\n  - \"Acceptance\" — Client's written approval of a Deliverable, or expiration of the review window without written rejection.\n  - \"Project Owner\" — Client's designated decision-maker, identified as [client_pm_name], with authority to accept Deliverables and authorize changes within the scope of this SOW.\n  - \"Confidential Information\" — non-public information disclosed by either party in connection with this engagement, whether marked or not.\n  - \"Term\" — the period beginning on the Effective Date and ending as set forth in the Term, Termination, and Survival section.\nThis section is a foundation; the rest of the SOW relies on these terms being precisely defined.\n\nEXECUTIVE SUMMARY: Three to five sentences. State (1) the engagement purpose drawn from project_summary input; (2) the core Deliverables in summary form; (3) the duration from start_date to end_date; (4) the engagement_model and the fee_amount_dollars; (5) one sentence on intended outcome. No marketing language; pure factual summary.\n\nSCOPE OF WORK: Bulleted or numbered list of in-scope work items. Each item is one to two sentences describing the activity using action verbs (\"Develop\", \"Analyze\", \"Design\", \"Implement\", \"Document\"). End the section with this language tied to engagement_model:\n  - 'fixed-fee': \"The Services described above are provided for the fixed fee set forth in the Fees and Payment Terms section. Services beyond this scope require a written Change Order.\"\n  - 'time-and-materials': \"Services shall be provided on a time-and-materials basis as directed by Client through the Project Owner, subject to the not-to-exceed cap set forth in the Fees and Payment Terms section.\"\n  - 'hybrid': describe both fixed and T&M portions per fee_detail, with clear delineation of which Services fall under each.\n\nDELIVERABLES AND ACCEPTANCE: Numbered list. For each Deliverable from deliverables input, include the following structured fields:\n  (a) Deliverable name (bolded)\n  (b) Description (one to two sentences)\n  (c) Acceptance criteria — objective, measurable conditions for Acceptance\n  (d) Format (e.g., written report PDF, source code repository, presentation deck)\n  (e) Target delivery date (from timeline if available)\nAfter the list, include this acceptance procedure language verbatim: \"Each Deliverable will be deemed Accepted upon (i) Client's written approval delivered through the Project Owner, or (ii) expiration of a ten (10) business day review window beginning on the date of delivery if no written rejection is received within that period. Rejections must be in writing, must specify with particularity the deficiencies in the Deliverable, and must give Consultant a reasonable opportunity to cure (typically ten (10) business days). Consultant's cure shall be deemed complete upon redelivery; the review window restarts. Repeated rejections without specific particularity, or rejections raising matters outside the agreed acceptance criteria, do not toll the deemed-acceptance period.\"\n\nTIMELINE AND MILESTONES: Render as a milestone table or list. Include:\n  - Engagement Kickoff: [start_date]\n  - Mid-engagement check-in (if span > 30 days)\n  - Deliverable target dates per the Deliverables section\n  - Final Deliverable Acceptance: [end_date]\nAdd this language: \"Dates above are target dates and are subject to mutual cooperation and timely Client decisions per the Responsibilities section. Material delays caused by Client may result in a corresponding extension to subsequent target dates without entitlement to a Change Order; material delays caused by Consultant entitle Client to remedies as set forth in the Term, Termination, and Survival section.\"\n\nASSUMPTIONS AND EXCLUSIONS: Two distinct sub-sections rendered as <h3>:\n  <h3>Assumptions</h3> — numbered list drawn from assumptions input. Each assumption is a clear statement of what Consultant is relying on for the engagement plan and pricing (e.g., \"Client provides access to existing systems within five business days of Effective Date\", \"Project Owner is empowered to make material decisions within five business days\").\n  <h3>Exclusions</h3> — numbered list drawn from exclusions input. Each exclusion is what is explicitly NOT in scope, even though a reasonable Client might assume it is included.\nEnd the section with: \"Material deviations from these Assumptions or expansion beyond the Scope of Work will be addressed via the Change Control procedure. Pricing and timeline reflect these Assumptions; deviations may result in corresponding adjustments.\"\n\nFEES AND PAYMENT TERMS: Restate fee_amount_dollars and the engagement_model. Branch on engagement_model:\n  - 'fixed-fee': \"The total fee for the Services is $[fee_amount_dollars]. Payment milestones tied to Deliverable Acceptance are set forth below: [milestones from fee_detail input — typical structure: 25% on Effective Date, 50% on mid-engagement deliverable Acceptance, 25% on final Deliverable Acceptance]. Each milestone is invoiced upon achievement; payment is due [payment_terms] from invoice date.\"\n  - 'time-and-materials': \"Services are billed at the rates set forth below: [rates by role from fee_detail]. Total fees shall not exceed $[fee_amount_dollars] without a written Change Order. Time is billed in 0.1 hour increments. Invoices are issued monthly on the first business day for the prior month's hours; payment is due [payment_terms] from invoice date.\"\n  - 'hybrid': describe both portions per fee_detail.\nLate payment terms: \"Invoices unpaid after [payment_terms] from invoice date accrue interest at one and one-half percent (1.5%) per month, or the maximum rate permitted by applicable law, whichever is lower. Consultant may suspend Services for non-payment more than thirty (30) days past due upon ten (10) days written notice.\"\nExpenses: branch on expense_policy as in the engagement-letter template.\nWire/ACH preferred; remit-to address confirmed at invoice; international payment fees at Client cost where applicable.\n\nCHANGE CONTROL: Process for modifying this SOW. Numbered: (1) Either party may request a change in writing through the Project Owner or Consultant's engagement lead. (2) Consultant will respond within five (5) business days with a written impact assessment covering scope, schedule, and fees. (3) Changes affecting fees, schedule, or scope require a written Change Order signed by both parties before Consultant begins work on the change. (4) Changes not affecting fees or schedule (e.g., minor refinements to a Deliverable's format) may be confirmed by email between the Project Owner and Consultant's engagement lead. (5) Consultant shall not proceed with material changes prior to written authorization. Unauthorized work is at Consultant's risk.\n\nINTELLECTUAL PROPERTY: Three sub-paragraphs:\n(a) Pre-existing IP: \"Each party retains all right, title, and interest in its pre-existing intellectual property, methodologies, tools, frameworks, and templates. Nothing in this SOW transfers ownership of pre-existing IP. To the extent Consultant incorporates pre-existing IP into a Deliverable, Consultant grants Client a non-exclusive, perpetual, royalty-free license to use such pre-existing IP solely as embedded in the Deliverable for Client's internal business purposes.\"\n(b) Work Product: \"Deliverables specifically created for Client under this SOW (excluding pre-existing IP and general knowledge) become Client's property upon full payment of the fees attributable to those Deliverables. Until full payment, Consultant retains ownership and grants Client a temporary license for evaluation and review only.\"\n(c) Consultant retained rights: \"Consultant retains the right to use general knowledge, skills, experience, and ideas gained during the engagement, and to use anonymized methodologies, frameworks, and templates for other engagements, provided that doing so does not disclose Client's Confidential Information.\"\n\nREPRESENTATIONS AND INDEPENDENT CONTRACTOR: Each party represents it has full authority to enter this SOW. Consultant represents Services will be performed with the professional skill and care ordinarily exercised by consultants performing similar work. Independent contractor language: \"Consultant is an independent contractor and not an employee, agent, partner, or joint venturer of Client. Consultant is responsible for its own taxes, benefits, and compliance with employment, tax, and benefits laws applicable to its personnel. Nothing in this SOW creates a fiduciary, partnership, or employment relationship between the parties. Neither party may bind the other without express written authorization.\"\n\nLIMITATION OF LIABILITY, INDEMNIFICATION, AND INSURANCE: Three sub-paragraphs:\n(a) Liability cap: \"EXCEPT FOR (i) breaches of confidentiality obligations, (ii) gross negligence or willful misconduct, (iii) indemnification obligations under subsection (b), and (iv) infringement of third-party intellectual property rights, NEITHER PARTY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS SOW SHALL EXCEED [liability_cap_multiplier] TIMES THE TOTAL FEES PAID OR PAYABLE UNDER THIS SOW. NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, CONSEQUENTIAL, INCIDENTAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST REVENUE, LOST BUSINESS OPPORTUNITY, OR LOSS OF DATA, REGARDLESS OF THE FORM OF ACTION.\"\n(b) Mutual indemnification: \"Each party shall indemnify, defend, and hold harmless the other from third-party claims arising out of the indemnifying party's gross negligence, willful misconduct, or breach of this SOW, subject to (i) prompt written notice of the claim, (ii) the indemnifying party's control of defense and settlement (with no settlement requiring an admission of liability without consent), and (iii) reasonable cooperation by the indemnified party.\"\n(c) Insurance: \"Consultant maintains general commercial liability insurance with limits of at least one million dollars ($1,000,000) per occurrence and professional liability (errors and omissions) insurance with limits of at least one million dollars ($1,000,000) per claim. A certificate of insurance is available upon request. Insurance does not limit Consultant's contractual obligations under this SOW.\"\n\nTERM, TERMINATION, AND SURVIVAL: Term begins on the Effective Date and ends on the earlier of (a) end_date or (b) Acceptance of all Deliverables. Termination for cause: either party may terminate on fifteen (15) days written notice for material breach uncured within the notice period. Termination for convenience: Client may terminate on thirty (30) days written notice; Consultant entitled to fees for Services performed and Deliverables Accepted (or in progress on a quantum-meruit basis), plus reasonable wind-down costs. Survival: Confidentiality, IP, payment obligations for Services performed, limitation of liability, indemnification, and dispute resolution survive termination.\n\nGENERAL PROVISIONS AND SIGNATURES: Numbered general provisions: (1) Governing law: laws of [governing_state], without regard to conflict-of-laws principles. (2) Force majeure: standard clause covering pandemic, weather, supply chain disruption, war, terrorism, and government action — performance excused for the duration of the event, neither party liable for resulting delays. (3) Entire agreement: this SOW, together with any executed Change Orders, supersedes all prior and contemporaneous agreements, written or oral. (4) Amendments only by written instrument signed by both parties. (5) Severability: invalid provisions shall be reformed to the maximum extent enforceable; remaining provisions continue in full force. (6) Counterparts: may be executed in counterparts including electronic signatures and scanned copies, each deemed an original, together one instrument. (7) Assignment: this SOW may not be assigned without the other party's consent, except in connection with a merger, acquisition, or sale of substantially all assets. (8) Notices: in writing to the addresses set forth in this SOW; effective on personal delivery, three business days after certified mail, or one business day after email transmission with confirmation. (9) Mutual cooperation: each party shall cooperate in good faith to enable the other's performance, including timely responses, reasonable access, and designation of decision-makers. The pipeline renders the formal signature block; do not render signature lines.\n\n=== LENGTH ===\n2000–3500 words. SOWs benefit from precision; padding obscures the protective scaffolding."
  },
  "tax-estimate": {
    "slug": "tax-estimate",
    "label": "Tax Estimate",
    "description": "Tax estimate for planning purposes only — with prominent IMPORTANT NOTICE, footer-recurring disclaimer, structured income/deduction summaries, conservative non-computational tax liability section, and IRC §6654 safe harbor analysis.",
    "category": "finance",
    "supports_images": false,
    "has_signature_block": false,
    "has_toc": false,
    "layout": "financial-statement",
    "fields": [
      {
        "id": "taxpayer_name",
        "label": "Taxpayer name",
        "type": "text",
        "required": true
      },
      {
        "id": "tax_year",
        "label": "Tax year",
        "type": "number",
        "required": true
      },
      {
        "id": "filing_status",
        "label": "Filing status",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "single",
            "label": "Single"
          },
          {
            "value": "married-filing-jointly",
            "label": "Married Filing Jointly"
          },
          {
            "value": "married-filing-separately",
            "label": "Married Filing Separately"
          },
          {
            "value": "head-of-household",
            "label": "Head of Household"
          },
          {
            "value": "qualifying-widow",
            "label": "Qualifying Surviving Spouse"
          }
        ]
      },
      {
        "id": "state_residence",
        "label": "State of residence",
        "type": "text",
        "required": true
      },
      {
        "id": "gross_income_w2",
        "label": "W-2 wages ($)",
        "type": "number",
        "required": false,
        "default": 0
      },
      {
        "id": "gross_income_1099_self_employment",
        "label": "1099 / self-employment income ($)",
        "type": "number",
        "required": false,
        "default": 0
      },
      {
        "id": "gross_income_investment",
        "label": "Investment income — interest, dividends, capital gains ($)",
        "type": "number",
        "required": false,
        "default": 0
      },
      {
        "id": "gross_income_other",
        "label": "Other income ($)",
        "type": "number",
        "required": false,
        "default": 0
      },
      {
        "id": "deduction_method",
        "label": "Deduction method",
        "type": "select",
        "required": true,
        "options": [
          {
            "value": "standard",
            "label": "Standard deduction"
          },
          {
            "value": "itemized",
            "label": "Itemized deductions"
          }
        ]
      },
      {
        "id": "itemized_deductions_breakdown",
        "label": "Itemized deductions breakdown (one per line)",
        "type": "textarea",
        "required": false,
        "help": "category | amount — only if itemized."
      },
      {
        "id": "tax_credits",
        "label": "Tax credits (one per line)",
        "type": "textarea",
        "required": false,
        "help": "credit | amount"
      },
      {
        "id": "withholdings_ytd",
        "label": "Withholdings YTD ($)",
        "type": "number",
        "required": false,
        "default": 0
      },
      {
        "id": "estimated_payments_ytd",
        "label": "Estimated payments YTD ($)",
        "type": "number",
        "required": false,
        "default": 0
      },
      {
        "id": "prior_year_tax_liability",
        "label": "Prior year tax liability ($)",
        "type": "number",
        "required": false,
        "help": "For IRC §6654 safe harbor analysis."
      },
      {
        "id": "prepared_by",
        "label": "Prepared by",
        "type": "text",
        "required": true
      },
      {
        "id": "prepared_date",
        "label": "Prepared date",
        "type": "date",
        "required": true
      }
    ],
    "sections": [
      {
        "id": "header_masthead",
        "title": "Header"
      },
      {
        "id": "mandatory_disclaimer",
        "title": "Important Notice"
      },
      {
        "id": "taxpayer_summary",
        "title": "Taxpayer and Filing Information"
      },
      {
        "id": "income_summary",
        "title": "Income Summary"
      },
      {
        "id": "deductions",
        "title": "Deductions"
      },
      {
        "id": "taxable_income_calculation",
        "title": "Taxable Income Calculation"
      },
      {
        "id": "tax_liability_estimate",
        "title": "Estimated Tax Liability"
      },
      {
        "id": "credits_and_payments",
        "title": "Credits and Payments"
      },
      {
        "id": "balance_or_refund",
        "title": "Estimated Balance Due or Refund"
      },
      {
        "id": "quarterly_safe_harbor",
        "title": "Quarterly Estimated Payments and Safe Harbor"
      }
    ],
    "generation_notes": "Voice: Tax-preparation neutral. Conservative. Repeatedly emphasize the estimate-not-advice nature. Do NOT make recommendations to the taxpayer. Do NOT assert what the taxpayer should do. Do NOT compute specific tax brackets or invent figures that depend on current-year tax tables — Claude does not have reliable access to current brackets and the legal exposure of getting this wrong is high. Use language like \"TO BE COMPUTED BY TAX PROFESSIONAL\" for figures that require current-year tables.\n\nPIPELINE OWNS THE HEADER (taxpayer_name, tax_year, prepared_date, prepared_by in masthead). The first content section MUST be the IMPORTANT NOTICE — this is non-negotiable for liability protection. The disclaimer also appears in the running footer of every page (rendered automatically by the pipeline based on this template's slug).\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== SECTION REQUIREMENTS ===\n\nIMPORTANT NOTICE: This is the FIRST content section of the body. Render it inside a <div class=\"fin-disclaimer-prominent\"> (the pipeline styles this with a border and slight emphasis). Use the EXACT disclaimer text below verbatim — do not alter, do not water down, do not soften. Capitalize the first sentence. Begin with bold or strong: \"<strong>IMPORTANT NOTICE — PLEASE READ.</strong>\"\nThe exact disclaimer text:\nTHIS DOCUMENT IS AN ESTIMATE PREPARED FOR PLANNING PURPOSES ONLY. IT IS NOT TAX ADVICE, IS NOT A SUBSTITUTE FOR PROFESSIONAL TAX PREPARATION OR LEGAL ADVICE, AND DOES NOT CREATE A TAX-PREPARER RELATIONSHIP. CONSULT A LICENSED CPA OR TAX ATTORNEY BEFORE MAKING ANY TAX-RELATED DECISIONS, FILING ANY RETURN, OR RELYING ON THESE ESTIMATES. THE PREPARER MAKES NO REPRESENTATION AS TO THE ACCURACY, COMPLETENESS, OR APPLICABILITY OF THESE FIGURES TO YOUR ACTUAL TAX SITUATION. TAX LAWS CHANGE FREQUENTLY AND VARY BY JURISDICTION; FIGURES SHOWN MAY BE OUT OF DATE OR INAPPLICABLE TO YOUR CIRCUMSTANCES.\nAfter the disclaimer block, inside the same section, add a one-line acknowledgment line: \"By using this document, the recipient acknowledges that the figures herein are estimates and not tax advice.\"\n\nTAXPAYER AND FILING INFORMATION: Brief block (definition-list style or paragraph):\n  Taxpayer: [taxpayer_name]\n  Tax Year: [tax_year]\n  Filing Status: [filing_status human-readable form, e.g., \"Married Filing Jointly\"]\n  State of Residence: [state_residence]\nEnd with: \"All figures shown are estimates. See IMPORTANT NOTICE above. Final figures depend on actual records, current-year tax tables, and applicable jurisdiction-specific rules to be applied by a licensed professional.\"\n\nINCOME SUMMARY: <table class=\"fin-table\"> with rows for each provided income type. Skip rows where the input amount is 0 or not provided.\n  W-2 Wages: $[gross_income_w2]\n  Self-Employment / 1099 Income: $[gross_income_1099_self_employment]\n  Investment Income (interest, dividends, capital gains): $[gross_income_investment]\n  Other Income: $[gross_income_other]\nSubtotal row using class \"subtotal-row\" labeled \"Estimated Gross Income\" with the sum.\nFormat currency consistently. If all income inputs are 0, state \"No income provided in this estimate.\"\n\nDEDUCTIONS: Branch on deduction_method:\n  - 'standard': \"Deduction Method: Standard Deduction. The standard deduction for [tax_year] for filing status [filing_status] is set by the IRS and adjusts annually for inflation. The applicable amount must be verified against current IRS Publication 17 or the current year's Form 1040 instructions; this estimate does NOT compute the standard deduction amount automatically. Indicate as: 'Standard Deduction (TO BE VERIFIED — consult current IRS publications or a CPA): $[TBD]'.\"\n  - 'itemized': \"Deduction Method: Itemized Deductions.\" Then <table class=\"fin-table\"> with columns Category | Amount, parsed from itemized_deductions_breakdown input. Subtotal \"Total Itemized Deductions\". Common categories: state and local taxes (SALT, capped), mortgage interest, charitable contributions, medical expenses (above AGI threshold), miscellaneous deductions.\nEnd the section with: \"Reminder: Deduction limits and rules change annually. Some deductions are subject to AGI phase-outs, caps (e.g., SALT $10,000), or substantiation requirements. Confirm with a tax professional.\"\n\nTAXABLE INCOME CALCULATION: Brief computation block:\n  Estimated Gross Income: $[from Income Summary]\n  Less: Deductions: -$[deduction amount or \"TO BE VERIFIED\"]\n  Estimated Taxable Income: $[gross - deductions, or \"TO BE COMPUTED\" if standard deduction TBD]\nIf standard deduction was used and not yet computed, mark Estimated Taxable Income as \"TO BE COMPUTED — depends on standard deduction figure.\"\n\nESTIMATED TAX LIABILITY: This section is intentionally NON-COMPUTATIONAL. Render the following exactly:\n  \"Estimated tax liability cannot be precisely calculated in this document without applying the current tax brackets, capital-gains rates, alternative minimum tax thresholds, and self-employment tax rates specific to [tax_year], [filing_status], and [state_residence]. The taxpayer must consult a licensed CPA or tax attorney to determine actual federal and state tax liability. The figures below are placeholders requiring professional computation:\"\nThen a small table:\n  Estimated Federal Income Tax: TO BE COMPUTED BY TAX PROFESSIONAL\n  Self-Employment Tax (if applicable, on $[gross_income_1099_self_employment]): TO BE COMPUTED\n  Alternative Minimum Tax (if applicable): TO BE COMPUTED\n  Estimated State Income Tax ([state_residence]): TO BE COMPUTED\n  Local Tax (if applicable to jurisdiction): TO BE COMPUTED\nDO NOT invent specific bracket calculations. DO NOT estimate \"approximately X%\". This is the responsible boundary of what an automated estimate can responsibly provide.\n\nCREDITS AND PAYMENTS: If tax_credits input is non-empty, render as <table class=\"fin-table\"> with columns Credit | Amount. Subtotal \"Total Tax Credits\".\nThen payments-to-date block:\n  Withholdings YTD: $[withholdings_ytd]\n  Estimated Payments YTD: $[estimated_payments_ytd]\n  Subtotal: Total Credits and Payments: $[sum]\nNote: \"Credits eligibility, phase-outs, and refundability depend on the taxpayer's specific situation and current rules. A tax professional must confirm which credits actually apply.\"\n\nESTIMATED BALANCE DUE OR REFUND: Render as a structured calculation block, preserving the TO BE COMPUTED placeholder:\n  Estimated Tax Liability (federal + state + local + SE + AMT): TO BE COMPUTED\n  Less: Total Credits and Payments: -$[sum from prior section]\n  ─────\n  Estimated Balance Due (or Refund): TO BE COMPUTED\n\"If the actual tax liability when computed is less than the credits and payments above, the difference would be a refund. If greater, the difference would be a balance due. Specific amount depends on the figures noted above as TO BE COMPUTED.\"\n\nQUARTERLY ESTIMATED PAYMENTS AND SAFE HARBOR: Branch on whether prior_year_tax_liability is provided.\nIf provided: \"Safe Harbor Analysis: To avoid an underpayment penalty under IRC §6654, the taxpayer should pay through withholdings and estimated quarterly payments by the year-end deadline at least the LESSER of:\n  (a) 90% of the current year's actual tax liability, or\n  (b) 100% of the prior year's tax liability ($[prior_year_tax_liability]) — increased to 110% if prior year AGI exceeded $150,000 ($75,000 if married filing separately).\nCurrent YTD payments (withholdings + estimated): $[withholdings_ytd + estimated_payments_ytd].\nWhether this meets safe harbor depends on the actual current-year tax liability (currently TBD). Consult a CPA to confirm safe harbor compliance and determine if additional Q3/Q4 estimated payments are advisable. Quarterly due dates for the tax year are typically April 15, June 15, September 15, and January 15 of the following year — verify against current IRS schedule.\"\nIf not provided: \"Safe Harbor Analysis Not Available: Prior-year tax liability is required for safe harbor analysis. To compute whether current YTD payments meet IRC §6654 safe harbor thresholds, provide the prior year's total tax liability. Without this data, the taxpayer should consult a CPA to evaluate underpayment penalty risk.\"\n\nEnd the document with a final reminder paragraph (NOT a separate section): \"Reminder: This document is an estimate prepared for planning purposes only. It is not tax advice. Consult a licensed CPA or tax attorney before relying on these figures, filing any return, or making decisions affecting tax liability. — [prepared_by], [prepared_date].\"\n\n=== LENGTH ===\n800–1500 words. Length is driven by prominent disclaimer placement and conservative analytical voice. Do not pad with computational detail that this document explicitly disclaims."
  }
};
