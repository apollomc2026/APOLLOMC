// AUTO-GENERATED — do not edit by hand.
// Source: apps/portal/lib/apollo/packages/**
// Regenerate: npm run prebuild  (runs scripts/generate-packages-data.mjs)
//
// Inlines the catalog/modules/schemas/style-library tree so packages-loader.ts
// has zero runtime file dependencies — required for Vercel serverless where
// outputFileTracingIncludes is unreliable with the --turbopack production build.
//
// Counts at generation time: 31 modules, 31 schemas, 15 styles.

/* eslint-disable */

export const CATALOG_RAW = {
  "industries": [
    {
      "slug": "legal",
      "label": "Legal",
      "description": "Law firms, corporate legal, compliance",
      "icon_key": "scale",
      "sort_order": 1,
      "status": "active",
      "deliverables": [
        {
          "slug": "legal-memo",
          "label": "Legal Memorandum",
          "description": "Structured legal analysis memorandum covering issue statement, facts, analysis, and conclusion with proper legal citation formatting.",
          "estimated_pages_min": 4,
          "estimated_pages_max": 8,
          "estimated_minutes": 8,
          "base_price_cents": 6500,
          "schema_file": "legal-memo.schema.json"
        },
        {
          "slug": "contract-package",
          "label": "Contract Package",
          "description": "Complete contract package including master agreement, exhibits, schedules, and signature blocks with customizable terms and conditions.",
          "estimated_pages_min": 8,
          "estimated_pages_max": 20,
          "estimated_minutes": 14,
          "base_price_cents": 9500,
          "schema_file": "contract-package.schema.json"
        },
        {
          "slug": "discovery-summary",
          "label": "Discovery Summary",
          "description": "Organized summary of discovery materials including document review findings, deposition highlights, and key evidence categorization.",
          "estimated_pages_min": 6,
          "estimated_pages_max": 15,
          "estimated_minutes": 10,
          "base_price_cents": 7500,
          "schema_file": "discovery-summary.schema.json"
        },
        {
          "slug": "compliance-report",
          "label": "Compliance Report",
          "description": "Regulatory compliance assessment report covering current state analysis, gap identification, risk scoring, and remediation roadmap.",
          "estimated_pages_min": 8,
          "estimated_pages_max": 20,
          "estimated_minutes": 12,
          "base_price_cents": 8500,
          "schema_file": "compliance-report.schema.json"
        },
        {
          "slug": "nda",
          "label": "Non-Disclosure Agreement",
          "description": "Mutual or one-way NDA with configurable optional clauses (non-solicitation, non-circumvention, attorneys' fees, jury waiver).",
          "estimated_pages_min": 3,
          "estimated_pages_max": 5,
          "estimated_minutes": 4,
          "base_price_cents": 3500,
          "schema_file": "nda.schema.json"
        },
        {
          "slug": "engagement-letter",
          "label": "Client Engagement Letter",
          "description": "Professional services engagement letter with firm-type variants and full clause set including scope limitations, conflicts, privilege, retention, and dispute resolution.",
          "estimated_pages_min": 4,
          "estimated_pages_max": 6,
          "estimated_minutes": 5,
          "base_price_cents": 4000,
          "schema_file": "engagement-letter.schema.json"
        }
      ]
    },
    {
      "slug": "consulting",
      "label": "Consulting",
      "description": "Management consulting, professional services",
      "icon_key": "briefcase",
      "sort_order": 2,
      "status": "active",
      "deliverables": [
        {
          "slug": "exec-presentation",
          "label": "Executive Presentation",
          "description": "Board-ready executive presentation with strategic narrative, data visualizations, and actionable recommendations.",
          "estimated_pages_min": 12,
          "estimated_pages_max": 25,
          "estimated_minutes": 12,
          "base_price_cents": 9500,
          "schema_file": "exec-presentation.schema.json"
        },
        {
          "slug": "business-plan",
          "label": "Business Plan",
          "description": "Comprehensive business plan covering market analysis, operational strategy, financial projections, and growth roadmap.",
          "estimated_pages_min": 20,
          "estimated_pages_max": 40,
          "estimated_minutes": 20,
          "base_price_cents": 14500,
          "schema_file": "business-plan.schema.json"
        },
        {
          "slug": "sow",
          "label": "Statement of Work",
          "description": "Detailed statement of work defining project scope, deliverables, timeline, milestones, acceptance criteria, and pricing.",
          "estimated_pages_min": 6,
          "estimated_pages_max": 14,
          "estimated_minutes": 8,
          "base_price_cents": 6500,
          "schema_file": "sow.schema.json"
        },
        {
          "slug": "market-analysis",
          "label": "Market Analysis",
          "description": "In-depth market analysis covering industry landscape, competitive positioning, target segments, and market entry strategy.",
          "estimated_pages_min": 10,
          "estimated_pages_max": 20,
          "estimated_minutes": 14,
          "base_price_cents": 8500,
          "schema_file": "market-analysis.schema.json"
        },
        {
          "slug": "proposal",
          "label": "Consulting Proposal",
          "description": "Full services proposal with executive summary, methodology phases, team, past performance, risk register, pricing, and optional compliance matrix.",
          "estimated_pages_min": 10,
          "estimated_pages_max": 20,
          "estimated_minutes": 9,
          "base_price_cents": 7500,
          "schema_file": "proposal.schema.json"
        },
        {
          "slug": "change-order",
          "label": "Change Order",
          "description": "Formal contractual amendment with running totals on contract sum and contract time, cost-cause categorization, and reservation of rights.",
          "estimated_pages_min": 2,
          "estimated_pages_max": 4,
          "estimated_minutes": 4,
          "base_price_cents": 3500,
          "schema_file": "change-order.schema.json"
        }
      ]
    },
    {
      "slug": "government",
      "label": "Government",
      "description": "Federal proposals, compliance, capability statements",
      "icon_key": "landmark",
      "sort_order": 3,
      "status": "active",
      "deliverables": [
        {
          "slug": "federal-proposal",
          "label": "Federal Proposal Response",
          "description": "Full federal proposal response including technical approach, management plan, past performance, and pricing volume aligned to solicitation requirements.",
          "estimated_pages_min": 20,
          "estimated_pages_max": 50,
          "estimated_minutes": 30,
          "base_price_cents": 19500,
          "schema_file": "federal-proposal.schema.json"
        },
        {
          "slug": "capability-statement",
          "label": "Capability Statement",
          "description": "Concise capability statement highlighting core competencies, past performance, differentiators, and contact information formatted for government audiences.",
          "estimated_pages_min": 2,
          "estimated_pages_max": 4,
          "estimated_minutes": 5,
          "base_price_cents": 4500,
          "schema_file": "capability-statement.schema.json"
        },
        {
          "slug": "pwp",
          "label": "Past Performance Write-Up",
          "description": "Detailed past performance narrative covering project scope, challenges, solutions, outcomes, and relevance to target opportunity.",
          "estimated_pages_min": 4,
          "estimated_pages_max": 8,
          "estimated_minutes": 8,
          "base_price_cents": 6500,
          "schema_file": "pwp.schema.json"
        }
      ]
    },
    {
      "slug": "finance",
      "label": "Finance",
      "description": "Financial services, accounting, audit",
      "icon_key": "bar-chart",
      "sort_order": 4,
      "status": "active",
      "deliverables": [
        {
          "slug": "board-report",
          "label": "Board Report",
          "description": "Quarterly or annual board report covering financial performance, strategic initiatives, risk assessment, and forward outlook.",
          "estimated_pages_min": 8,
          "estimated_pages_max": 20,
          "estimated_minutes": 12,
          "base_price_cents": 8500,
          "schema_file": "board-report.schema.json"
        },
        {
          "slug": "investor-memo",
          "label": "Investor Memo",
          "description": "Investment memorandum presenting thesis, market opportunity, financial analysis, risk factors, and recommended action.",
          "estimated_pages_min": 6,
          "estimated_pages_max": 15,
          "estimated_minutes": 10,
          "base_price_cents": 7500,
          "schema_file": "investor-memo.schema.json"
        },
        {
          "slug": "audit-readiness",
          "label": "Audit Readiness Report",
          "description": "Pre-audit readiness assessment covering control environment, documentation status, gap analysis, and remediation timeline.",
          "estimated_pages_min": 10,
          "estimated_pages_max": 25,
          "estimated_minutes": 16,
          "base_price_cents": 9500,
          "schema_file": "audit-readiness.schema.json"
        },
        {
          "slug": "invoice",
          "label": "Invoice",
          "description": "AP-ready invoice with full structured metadata: tax IDs, PO reference, currency selection, per-line taxability, discount handling, late-payment terms, and structured banking instructions.",
          "estimated_pages_min": 1,
          "estimated_pages_max": 2,
          "estimated_minutes": 3,
          "base_price_cents": 2500,
          "schema_file": "invoice.schema.json"
        },
        {
          "slug": "budget-vs-actual",
          "label": "Budget vs. Actual Report",
          "description": "Period budget-vs-actual report with revenue and expense variance analysis, threshold-based commentary, and optional forecast revision.",
          "estimated_pages_min": 4,
          "estimated_pages_max": 8,
          "estimated_minutes": 6,
          "base_price_cents": 4500,
          "schema_file": "budget-vs-actual.schema.json"
        },
        {
          "slug": "expense-report",
          "label": "Expense Report",
          "description": "AP/T&E expense report with itemized lines, mileage, per diem, foreign currency conversions, structured reimbursement calculation, and audit-ready attestation.",
          "estimated_pages_min": 2,
          "estimated_pages_max": 4,
          "estimated_minutes": 3,
          "base_price_cents": 2500,
          "schema_file": "expense-report.schema.json"
        },
        {
          "slug": "personal-monthly",
          "label": "Personal Monthly Summary",
          "description": "Personal financial monthly summary with income, expenses, savings, debt, optional net worth snapshot, goal tracking, and outlook.",
          "estimated_pages_min": 2,
          "estimated_pages_max": 5,
          "estimated_minutes": 5,
          "base_price_cents": 3500,
          "schema_file": "personal-monthly.schema.json"
        },
        {
          "slug": "cash-flow-forecast",
          "label": "Cash Flow Forecast",
          "description": "13-week (configurable) rolling cash flow forecast with weekly bridge, inflow/outflow detail, aging schedules, and threshold-based alerts.",
          "estimated_pages_min": 4,
          "estimated_pages_max": 8,
          "estimated_minutes": 9,
          "base_price_cents": 6500,
          "schema_file": "cash-flow-forecast.schema.json"
        },
        {
          "slug": "tax-estimate",
          "label": "Tax Estimate",
          "description": "Tax estimate for planning purposes only — with prominent IMPORTANT NOTICE, footer-recurring disclaimer, structured income/deduction summaries, and IRC §6654 safe harbor analysis.",
          "estimated_pages_min": 3,
          "estimated_pages_max": 6,
          "estimated_minutes": 7,
          "base_price_cents": 5500,
          "schema_file": "tax-estimate.schema.json"
        }
      ]
    },
    {
      "slug": "startup",
      "label": "Startup",
      "description": "Entrepreneurs, venture, early-stage companies",
      "icon_key": "rocket",
      "sort_order": 5,
      "status": "active",
      "deliverables": [
        {
          "slug": "pitch-deck",
          "label": "Pitch Deck",
          "description": "Investor-ready pitch deck covering problem, solution, market, traction, team, financials, and ask with compelling visual narrative.",
          "estimated_pages_min": 12,
          "estimated_pages_max": 20,
          "estimated_minutes": 9,
          "base_price_cents": 7500,
          "schema_file": "pitch-deck.schema.json"
        },
        {
          "slug": "one-pager",
          "label": "One-Pager",
          "description": "Single-page company overview distilling value proposition, market opportunity, traction, and contact information into a scannable format.",
          "estimated_pages_min": 1,
          "estimated_pages_max": 2,
          "estimated_minutes": 4,
          "base_price_cents": 4500,
          "schema_file": "one-pager.schema.json"
        },
        {
          "slug": "investor-update",
          "label": "Investor Update",
          "description": "Monthly or quarterly investor update covering KPIs, milestones, challenges, burn rate, and upcoming priorities.",
          "estimated_pages_min": 4,
          "estimated_pages_max": 8,
          "estimated_minutes": 6,
          "base_price_cents": 5500,
          "schema_file": "investor-update.schema.json"
        }
      ]
    },
    {
      "slug": "field-service",
      "label": "Field Service",
      "description": "Service technicians, contractors, facilities, on-site reports",
      "icon_key": "wrench",
      "sort_order": 6,
      "status": "active",
      "deliverables": [
        {
          "slug": "fsr",
          "label": "Field Service Report",
          "description": "Technician visit report with SLA timestamps, structured pre/post readings, parts and materials, safety observations, regulatory compliance codes, and customer attestation.",
          "estimated_pages_min": 2,
          "estimated_pages_max": 4,
          "estimated_minutes": 5,
          "base_price_cents": 3500,
          "schema_file": "fsr.schema.json"
        },
        {
          "slug": "incident-report",
          "label": "Incident Report",
          "description": "Formal incident report with severity classification, regulatory reporting obligations (OSHA/EPA), structured persons-involved tracking, contributing factors analysis, and corrective actions chain.",
          "estimated_pages_min": 3,
          "estimated_pages_max": 6,
          "estimated_minutes": 6,
          "base_price_cents": 4500,
          "schema_file": "incident-report.schema.json"
        },
        {
          "slug": "meeting-minutes",
          "label": "Meeting Minutes",
          "description": "Formal meeting minutes with quorum tracking, structured voting records, executive session handling, formal resolutions, recusals, and corporate-secretary attestation.",
          "estimated_pages_min": 2,
          "estimated_pages_max": 4,
          "estimated_minutes": 3,
          "base_price_cents": 2500,
          "schema_file": "meeting-minutes.schema.json"
        },
        {
          "slug": "quote",
          "label": "Quote",
          "description": "Customer-binding quote with structured line items, totals, payment terms, warranty and exclusions, and acceptance signature block.",
          "estimated_pages_min": 1,
          "estimated_pages_max": 3,
          "estimated_minutes": 4,
          "base_price_cents": 4500,
          "schema_file": "quote.schema.json"
        }
      ]
    },
    {
      "slug": "hospitality",
      "label": "Hospitality",
      "description": "Restaurants, catering, hotels — coming soon",
      "icon_key": "utensils",
      "sort_order": 7,
      "status": "placeholder",
      "placeholder_cta": "Send a sample deliverable to spec this industry. Catering SOPs, event proposals, kitchen reports, and financial projections welcome.",
      "deliverables": []
    },
    {
      "slug": "content-media",
      "label": "Content & Media",
      "description": "Production, editorial, broadcast — coming soon",
      "icon_key": "video",
      "sort_order": 8,
      "status": "placeholder",
      "placeholder_cta": "Send a sample deliverable to spec this industry. Production reports, editorial briefs, content schedules, and review documents welcome.",
      "deliverables": []
    }
  ]
} as const;

export const MODULES_RAW: Record<string, unknown> = {
  "audit-readiness": {
    "deliverable_slug": "audit-readiness",
    "required_fields": [
      {
        "key": "organization_name",
        "label": "Organization name",
        "type": "text",
        "placeholder": "Full legal entity name"
      },
      {
        "key": "audit_type",
        "label": "Type of audit",
        "type": "text",
        "placeholder": "e.g., External financial audit, SOC 2 Type II, SOX 404, Internal audit"
      },
      {
        "key": "audit_framework",
        "label": "Audit framework or standard",
        "type": "text",
        "placeholder": "e.g., GAAP, COSO, COBIT, AICPA TSC, ISO 27001"
      },
      {
        "key": "target_audit_date",
        "label": "Target audit date",
        "type": "date"
      },
      {
        "key": "scope_description",
        "label": "Audit scope",
        "type": "textarea",
        "placeholder": "Which business units, systems, or processes are in scope for the audit?"
      },
      {
        "key": "current_readiness",
        "label": "Current readiness self-assessment",
        "type": "textarea",
        "placeholder": "How ready do you feel for the audit? What areas are you most and least confident about?"
      }
    ],
    "optional_fields": [
      {
        "key": "prior_audit_results",
        "label": "Prior audit results",
        "type": "textarea",
        "placeholder": "Summary of last audit findings, open items, and remediation status..."
      },
      {
        "key": "auditor_firm",
        "label": "Audit firm",
        "type": "text",
        "placeholder": "e.g., Deloitte, BDO, Grant Thornton"
      },
      {
        "key": "key_controls",
        "label": "Key controls to assess",
        "type": "textarea",
        "placeholder": "Specific controls you want evaluated for readiness..."
      },
      {
        "key": "known_gaps",
        "label": "Known gaps or weaknesses",
        "type": "textarea",
        "placeholder": "Areas where you already know there are deficiencies..."
      },
      {
        "key": "system_landscape",
        "label": "Key systems in scope",
        "type": "textarea",
        "placeholder": "ERP, CRM, HRIS, financial systems, cloud platforms..."
      },
      {
        "key": "team_resources",
        "label": "Available remediation resources",
        "type": "textarea",
        "placeholder": "Internal team capacity for remediation work..."
      },
      {
        "key": "budget_constraints",
        "label": "Remediation budget",
        "type": "text",
        "placeholder": "Budget available for addressing gaps"
      },
      {
        "key": "classification",
        "label": "Document classification",
        "type": "text",
        "placeholder": "e.g., Confidential, Internal Use Only"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload prior audit reports, management letters, or findings",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload existing control documentation, policies, or procedure manuals",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload system architecture diagrams or data flow maps",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload company brand guidelines (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Overall readiness assessment with a clear readiness score or rating. Summarize the number of controls assessed, readiness distribution, and critical items requiring immediate action."
      },
      {
        "key": "scope_and_objectives",
        "label": "Scope and Objectives",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Define the assessment boundaries, audit framework applied, and what this readiness report covers and excludes."
      },
      {
        "key": "control_environment",
        "label": "Control Environment Assessment",
        "required": true,
        "min_words": 250,
        "max_words": 600,
        "instructions": "Evaluate the overall control environment including tone at the top, organizational structure, policies, and governance. Map to the audit framework's control domains."
      },
      {
        "key": "documentation_status",
        "label": "Documentation Status",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Inventory of required documentation and its current state. Identify missing, outdated, or incomplete documentation by control area."
      },
      {
        "key": "gap_analysis",
        "label": "Gap Analysis",
        "required": true,
        "min_words": 200,
        "max_words": 600,
        "instructions": "Detailed control-by-control gap assessment. For each gap: describe the expected state, current state, severity, and what evidence is needed."
      },
      {
        "key": "risk_heat_map",
        "label": "Risk Heat Map",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Visual risk matrix showing each finding plotted by likelihood of audit failure and impact severity. Provide a narrative summary of the risk landscape."
      },
      {
        "key": "remediation_timeline",
        "label": "Remediation Timeline",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Prioritized remediation plan with specific actions, responsible owners, target completion dates, and dependencies. Align timeline to audit date."
      },
      {
        "key": "resource_requirements",
        "label": "Resource Requirements",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "Personnel, budget, and external support needed to close gaps before the audit. Include both internal effort estimates and any third-party costs."
      },
      {
        "key": "appendices",
        "label": "Appendices",
        "required": false,
        "min_words": 50,
        "max_words": 500,
        "instructions": "Supporting materials including detailed control matrices, evidence checklists, documentation templates, and framework mapping tables."
      }
    ]
  },
  "board-report": {
    "deliverable_slug": "board-report",
    "required_fields": [
      {
        "key": "organization_name",
        "label": "Organization name",
        "type": "text",
        "placeholder": "Full legal entity name"
      },
      {
        "key": "reporting_period",
        "label": "Reporting period",
        "type": "text",
        "placeholder": "e.g., Q4 2025, FY 2025, January - March 2026"
      },
      {
        "key": "report_type",
        "label": "Report type",
        "type": "text",
        "placeholder": "e.g., Quarterly Board Report, Annual Review, Special Committee Report"
      },
      {
        "key": "financial_highlights",
        "label": "Financial highlights",
        "type": "textarea",
        "placeholder": "Key financial metrics: revenue, EBITDA, net income, cash position, vs. budget and prior period..."
      },
      {
        "key": "strategic_initiatives",
        "label": "Strategic initiatives update",
        "type": "textarea",
        "placeholder": "Status of major strategic initiatives, milestones achieved, and upcoming objectives..."
      },
      {
        "key": "key_risks",
        "label": "Key risks and concerns",
        "type": "textarea",
        "placeholder": "Top risks facing the organization, emerging threats, and mitigation status..."
      }
    ],
    "optional_fields": [
      {
        "key": "board_meeting_date",
        "label": "Board meeting date",
        "type": "date"
      },
      {
        "key": "prepared_by",
        "label": "Prepared by",
        "type": "text",
        "placeholder": "e.g., Office of the CFO"
      },
      {
        "key": "operational_metrics",
        "label": "Key operational metrics",
        "type": "textarea",
        "placeholder": "Employee count, customer count, churn rate, NPS, or other operational KPIs..."
      },
      {
        "key": "compliance_updates",
        "label": "Compliance or regulatory updates",
        "type": "textarea",
        "placeholder": "New regulations, audit findings, compliance status changes..."
      },
      {
        "key": "capital_expenditures",
        "label": "Capital expenditure update",
        "type": "textarea",
        "placeholder": "Major CapEx projects, status, and budget vs. actual..."
      },
      {
        "key": "board_actions_needed",
        "label": "Board actions or approvals needed",
        "type": "textarea",
        "placeholder": "Any resolutions, approvals, or decisions the board needs to make..."
      },
      {
        "key": "forward_guidance",
        "label": "Forward guidance or outlook",
        "type": "textarea",
        "placeholder": "Updated projections, market outlook, and planned initiatives for next period..."
      },
      {
        "key": "classification",
        "label": "Document classification",
        "type": "text",
        "placeholder": "e.g., Board Confidential, Restricted Distribution"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "financial_data",
        "label": "Upload financial statements, P&L, balance sheet, or cash flow data",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload prior board reports or strategic plans for reference",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload company brand guidelines or board report template (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "One-page summary of the most important developments, financial results, and items requiring board attention. Written for rapid consumption."
      },
      {
        "key": "financial_performance",
        "label": "Financial Performance",
        "required": true,
        "min_words": 250,
        "max_words": 600,
        "instructions": "Detailed financial review covering revenue, expenses, profitability, cash flow, and balance sheet highlights. Include variance analysis vs. budget and prior period."
      },
      {
        "key": "strategic_initiatives",
        "label": "Strategic Initiatives",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Progress update on each major strategic initiative. Use a consistent format: objective, status (green/yellow/red), milestones achieved, next steps."
      },
      {
        "key": "operational_highlights",
        "label": "Operational Highlights",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Key operational metrics and notable achievements or challenges. Cover personnel, customers, product/service delivery, and technology."
      },
      {
        "key": "risk_assessment",
        "label": "Risk Assessment",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Updated risk register with top risks ranked by severity. Include new or escalated risks, mitigation progress, and residual risk levels."
      },
      {
        "key": "compliance_update",
        "label": "Compliance Update",
        "required": false,
        "min_words": 80,
        "max_words": 250,
        "instructions": "Regulatory compliance status, recent or upcoming regulatory changes, and any open compliance issues or audit findings."
      },
      {
        "key": "forward_outlook",
        "label": "Forward Outlook",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Updated projections for the next reporting period. Key assumptions, opportunities, and potential headwinds."
      },
      {
        "key": "board_actions_required",
        "label": "Board Actions Required",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "Clearly enumerate any resolutions, approvals, or decisions the board needs to make at this meeting."
      },
      {
        "key": "appendices",
        "label": "Appendices",
        "required": false,
        "min_words": 50,
        "max_words": 500,
        "instructions": "Detailed financial tables, departmental reports, capital expenditure tracking, and supporting data referenced in the main report."
      }
    ]
  },
  "budget-vs-actual": {
    "deliverable_slug": "budget-vs-actual",
    "required_fields": [
      {
        "key": "entity_name",
        "label": "Entity name (organization or department)",
        "type": "text"
      },
      {
        "key": "period_label",
        "label": "Period label",
        "type": "text",
        "help": "e.g., \"Q1 2026\", \"March 2026\", \"YTD through April 25, 2026\"."
      },
      {
        "key": "period_start",
        "label": "Period start",
        "type": "date"
      },
      {
        "key": "period_end",
        "label": "Period end",
        "type": "date"
      },
      {
        "key": "revenue_lines",
        "label": "Revenue lines (one per line)",
        "type": "textarea",
        "help": "category | budget | actual"
      },
      {
        "key": "expense_lines",
        "label": "Expense lines (one per line)",
        "type": "textarea",
        "help": "category | budget | actual"
      },
      {
        "key": "variance_threshold_percent",
        "label": "Variance threshold (%)",
        "type": "number",
        "help": "Variances exceeding this trigger commentary.",
        "default": 10
      },
      {
        "key": "variance_commentary",
        "label": "Variance commentary (per line)",
        "type": "textarea",
        "help": "category | favorable/unfavorable | reason"
      },
      {
        "key": "prepared_by",
        "label": "Prepared by",
        "type": "text"
      }
    ],
    "optional_fields": [
      {
        "key": "forecast_revision",
        "label": "Forecast revision (optional)",
        "type": "textarea",
        "help": "If outlook for the remainder of the period or fiscal year is changing."
      },
      {
        "key": "approved_by",
        "label": "Approved by (optional)",
        "type": "text"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "financial_data",
        "label": "Actuals + budget spreadsheets (Excel, CSV, or PDF — multiple allowed)",
        "required": false,
        "multiple": true,
        "accepts": ".xlsx,.xls,.csv,application/pdf"
      }
    ],
    "sections": [
      {
        "key": "header_masthead",
        "label": "Header",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: FP&A analytical. Factual, numeric-first, neutral. Variances are explained without blame. Use the financial terms \"favorable\" and \"unfavorable\" rather than \"good\" and \"bad\" — these are precise FP&A terms with sign conventions:\n  - For revenue: actual ABOVE budget = favorable; actual BELOW budget = unfavorable.\n  - For expenses: actual BELOW budget = favorable; actual ABOVE budget = unfavorable.\nDo NOT swap the sign — respect FP&A convention.\n\nPIPELINE OWNS THE HEADER. The pipeline renders entity_name, period_label, prepared_by, and prepared date in a structured masthead at the top of the page. Do NOT emit a title or any cover-page treatment. Do NOT repeat the entity name, period, or prepared metadata in your output. Start directly with the Executive Summary section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n500–1000 words. The tables carry the substance; commentary is concise and analytical. Most of the document's value is in the structured numeric presentation, not the prose.\n\nHEADER: write this section per the document type's standard structure."
      },
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "EXECUTIVE SUMMARY: One paragraph (4–6 sentences). State:\n  - The period covered (period_label, parsed from input)\n  - Total revenue: actual vs budget — give both figures and the variance ($ and %)\n  - Total expenses: actual vs budget — both figures and variance\n  - Net result (Revenue − Expenses): actual vs budget\n  - Whether overall performance is FAVORABLE or UNFAVORABLE to budget\nFormat the variance percentages with one decimal (e.g., \"+5.2%\", \"-3.4%\"). Format dollar amounts with thousand separators and no decimals for round figures, two decimals for cents-precise figures. Be neutral — no celebratory or alarmist language. Just the numbers and their interpretation."
      },
      {
        "key": "revenue_performance",
        "label": "Revenue Performance",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "REVENUE PERFORMANCE: Render as a <table class=\"fin-table\"> with columns: Category | Budget | Actual | Variance ($) | Variance (%). Parse revenue_lines input as pipe-separated \"category | budget | actual\" per line.\nCompute for each line:\n  - Variance ($) = Actual − Budget\n  - Variance (%) = (Actual − Budget) / Budget × 100, with one decimal precision\nFor revenue lines, positive variance is favorable; show explicitly with a leading \"+\" or use accounting parentheses for negatives.\nEnd the table with a subtotal row using class \"subtotal-row\":\n  Total Revenue: [sum of budgets] | [sum of actuals] | [sum of variances] | [overall variance %]\nRight-align all numeric columns. Format currency consistently — dollar sign and thousand separators."
      },
      {
        "key": "expense_performance",
        "label": "Expense Performance",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EXPENSE PERFORMANCE: Same table structure for expense_lines input. Subtotal row labeled \"Total Expenses\".\nFor expense lines, the FP&A convention is reversed: positive variance ($) means OVER budget which is UNFAVORABLE. Display the column the same way but the Variance Commentary section will interpret the sign."
      },
      {
        "key": "summary_totals",
        "label": "Summary and Net Variance",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "SUMMARY AND NET VARIANCE: Small <table class=\"fin-table\"> with three rows:\n  Total Revenue: [budget] | [actual] | [variance $] | [variance %]\n  Total Expenses: [budget] | [actual] | [variance $] | [variance %]\n  Net (Revenue − Expenses): [budget − budget] | [actual − actual] | [variance] | [variance %]\nThe Net row uses class \"total-row\" for visual emphasis (the pipeline applies bold + top-border styling).\nAdd a one-sentence interpretation below the table: \"Net performance for [period_label] is FAVORABLE / UNFAVORABLE to budget by $[net variance] ([net variance %]).\""
      },
      {
        "key": "variance_commentary",
        "label": "Variance Commentary",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "VARIANCE COMMENTARY: For each line where the absolute variance percentage exceeds variance_threshold_percent, render an explanatory entry. Format as a structured list:\n  <h3>[Category] — [+/-]X.X% [Favorable/Unfavorable]</h3>\n  <p>[Reason from variance_commentary input parsed for this category. State the cause factually. Do not assign blame to individuals or teams; describe the underlying business or market conditions.]</p>\nFor revenue lines, \"favorable\" = actual > budget. For expense lines, \"favorable\" = actual < budget.\nIf no variance exceeds the threshold, render a single statement: \"All revenue and expense categories performed within ±[variance_threshold_percent]% of budget for [period_label]; no material variances to report.\"\nThis section is non-negotiable — even when no variances exist, render the statement that none exist. This signals that the threshold check was performed."
      },
      {
        "key": "forecast_outlook",
        "label": "Forecast and Outlook",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "FORECAST AND OUTLOOK: ONLY emit if forecast_revision input is non-empty. State the changed outlook for the remainder of the period or fiscal year, drawn from forecast_revision input. Be specific: revised expectations (new total, growth rate, expense run rate), the rationale for the revision (what changed), and the expected impact on full-year results. End with: \"Outlook is provided based on information available as of [prepared_date or report date] and is subject to revision in subsequent reporting periods.\""
      }
    ]
  },
  "business-plan": {
    "deliverable_slug": "business-plan",
    "required_fields": [
      {
        "key": "company_name",
        "label": "Company name",
        "type": "text",
        "placeholder": "Full legal entity name or proposed name"
      },
      {
        "key": "industry_sector",
        "label": "Industry / sector",
        "type": "text",
        "placeholder": "e.g., B2B SaaS, Healthcare Services, E-commerce"
      },
      {
        "key": "business_description",
        "label": "Business description",
        "type": "textarea",
        "placeholder": "Describe what your company does or will do in 2-3 sentences..."
      },
      {
        "key": "target_market",
        "label": "Target market",
        "type": "textarea",
        "placeholder": "Who are your customers? Describe your ideal customer profile and market segments..."
      },
      {
        "key": "revenue_model",
        "label": "Revenue model",
        "type": "textarea",
        "placeholder": "How does/will the business make money? Describe pricing, channels, and revenue streams..."
      },
      {
        "key": "competitive_advantage",
        "label": "Competitive advantage",
        "type": "textarea",
        "placeholder": "What differentiates you from competitors? What is your unfair advantage or moat?"
      },
      {
        "key": "funding_stage",
        "label": "Current stage and funding needs",
        "type": "textarea",
        "placeholder": "e.g., Pre-revenue seeking $500K seed, Series A with $2M ARR seeking $10M..."
      },
      {
        "key": "team_overview",
        "label": "Founding / management team",
        "type": "textarea",
        "placeholder": "Key team members, their roles, and relevant experience..."
      }
    ],
    "optional_fields": [
      {
        "key": "current_revenue",
        "label": "Current annual revenue",
        "type": "text",
        "placeholder": "e.g., $0 (pre-revenue), $500K ARR"
      },
      {
        "key": "current_customers",
        "label": "Current customer count",
        "type": "text",
        "placeholder": "e.g., 50 paying customers, 1,000 free users"
      },
      {
        "key": "key_metrics",
        "label": "Key traction metrics",
        "type": "textarea",
        "placeholder": "Growth rates, retention, LTV, CAC, or other key metrics..."
      },
      {
        "key": "geographic_focus",
        "label": "Geographic focus",
        "type": "text",
        "placeholder": "e.g., US initially, expanding to Europe in Year 2"
      },
      {
        "key": "regulatory_considerations",
        "label": "Regulatory or licensing requirements",
        "type": "textarea",
        "placeholder": "Any regulations, licenses, or certifications required..."
      },
      {
        "key": "technology_stack",
        "label": "Technology / IP overview",
        "type": "textarea",
        "placeholder": "Key technology, patents, proprietary systems..."
      },
      {
        "key": "projection_timeframe",
        "label": "Financial projection timeframe",
        "type": "text",
        "placeholder": "e.g., 3-year, 5-year"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "financial_data",
        "label": "Upload financial statements, projections, or models",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload market research, competitor analysis, or pitch decks",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload brand guidelines (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 300,
        "max_words": 600,
        "instructions": "Comprehensive overview of the entire business plan. Must stand alone as a complete briefing covering problem, solution, market, model, team, financials, and ask."
      },
      {
        "key": "company_overview",
        "label": "Company Overview",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Company history, mission, vision, legal structure, location, and current stage. Include key milestones achieved to date."
      },
      {
        "key": "market_analysis",
        "label": "Market Analysis",
        "required": true,
        "min_words": 300,
        "max_words": 700,
        "instructions": "Total addressable market (TAM), serviceable addressable market (SAM), serviceable obtainable market (SOM) with data sources. Industry trends and growth drivers."
      },
      {
        "key": "competitive_landscape",
        "label": "Competitive Landscape",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Direct and indirect competitors, their strengths and weaknesses, and your differentiated positioning. Include competitive matrix."
      },
      {
        "key": "products_services",
        "label": "Products and Services",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Detailed description of offerings, value proposition, development roadmap, and intellectual property position."
      },
      {
        "key": "marketing_strategy",
        "label": "Marketing and Sales Strategy",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Go-to-market strategy, customer acquisition channels, sales process, pricing strategy, and key partnerships."
      },
      {
        "key": "operations_plan",
        "label": "Operations Plan",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Operational workflow, technology infrastructure, supply chain (if applicable), key vendors, and scaling plan."
      },
      {
        "key": "management_team",
        "label": "Management Team",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Detailed bios of key team members, relevant experience, advisory board, and key hires planned."
      },
      {
        "key": "financial_projections",
        "label": "Financial Projections",
        "required": true,
        "min_words": 300,
        "max_words": 700,
        "instructions": "Revenue projections, expense breakdown, P&L, cash flow, and break-even analysis with clearly stated assumptions. Include 3-5 year projections."
      },
      {
        "key": "funding_requirements",
        "label": "Funding Requirements",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Amount sought, use of funds breakdown, proposed terms or valuation expectations, and path to next milestone."
      },
      {
        "key": "risk_analysis",
        "label": "Risk Analysis",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Key risks to the business including market, execution, regulatory, and financial risks with mitigation strategies."
      },
      {
        "key": "appendices",
        "label": "Appendices",
        "required": false,
        "min_words": 50,
        "max_words": 500,
        "instructions": "Supporting materials including detailed financial models, market research data, letters of intent, patents, and team resumes."
      }
    ]
  },
  "capability-statement": {
    "deliverable_slug": "capability-statement",
    "required_fields": [
      {
        "key": "company_name",
        "label": "Company name",
        "type": "text",
        "placeholder": "Full legal entity name"
      },
      {
        "key": "core_competencies",
        "label": "Core competencies",
        "type": "textarea",
        "placeholder": "List your top 3-5 core competencies or service areas..."
      },
      {
        "key": "naics_codes",
        "label": "NAICS codes",
        "type": "textarea",
        "placeholder": "List your primary NAICS codes (e.g., 541512 - Computer Systems Design)"
      },
      {
        "key": "differentiators",
        "label": "Key differentiators",
        "type": "textarea",
        "placeholder": "What makes your company uniquely qualified? Proprietary tools, clearances, certifications, specialized expertise..."
      },
      {
        "key": "past_performance_highlights",
        "label": "Past performance highlights",
        "type": "textarea",
        "placeholder": "Summarize 2-3 of your most impressive contracts or projects with outcomes..."
      }
    ],
    "optional_fields": [
      {
        "key": "cage_code",
        "label": "CAGE code",
        "type": "text",
        "placeholder": "e.g., 1ABC2"
      },
      {
        "key": "duns_uei",
        "label": "UEI number",
        "type": "text",
        "placeholder": "SAM.gov Unique Entity Identifier"
      },
      {
        "key": "set_aside_status",
        "label": "Set-aside / socioeconomic status",
        "type": "text",
        "placeholder": "e.g., 8(a), SDVOSB, WOSB, HUBZone, Small Business"
      },
      {
        "key": "gsa_schedule",
        "label": "GSA Schedule number",
        "type": "text",
        "placeholder": "e.g., GSA MAS, Schedule 70"
      },
      {
        "key": "clearances",
        "label": "Facility / personnel clearances",
        "type": "text",
        "placeholder": "e.g., Facility clearance: Secret, Key personnel: Top Secret/SCI"
      },
      {
        "key": "certifications",
        "label": "Certifications",
        "type": "textarea",
        "placeholder": "e.g., ISO 9001, ISO 27001, CMMI Level 3, FedRAMP"
      },
      {
        "key": "company_overview",
        "label": "Company overview",
        "type": "textarea",
        "placeholder": "Brief company history, size, locations, and mission..."
      },
      {
        "key": "target_agencies",
        "label": "Target agencies",
        "type": "textarea",
        "placeholder": "Which agencies are you targeting with this capability statement?"
      },
      {
        "key": "contact_name",
        "label": "Point of contact name",
        "type": "text"
      },
      {
        "key": "contact_email",
        "label": "Contact email",
        "type": "text"
      },
      {
        "key": "contact_phone",
        "label": "Contact phone",
        "type": "text"
      },
      {
        "key": "website",
        "label": "Website URL",
        "type": "text"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "brand_guide",
        "label": "Upload your company logo and brand guidelines",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload any existing capability statements or marketing materials for reference",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "core_competencies",
        "label": "Core Competencies",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "3-5 bullet points highlighting your primary service capabilities. Each should be concise but specific enough to demonstrate depth."
      },
      {
        "key": "past_performance",
        "label": "Past Performance",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "2-3 brief past performance examples showing contract name, client, value, and measurable outcome. Format for quick scanning."
      },
      {
        "key": "differentiators",
        "label": "Differentiators",
        "required": true,
        "min_words": 40,
        "max_words": 150,
        "instructions": "3-4 crisp bullet points on what sets you apart from competitors. Focus on unique value, not generic claims."
      },
      {
        "key": "company_overview",
        "label": "Company Overview",
        "required": true,
        "min_words": 30,
        "max_words": 120,
        "instructions": "Brief company description including founding year, size, headquarters, and mission. Include CAGE, UEI, NAICS, and set-aside status."
      },
      {
        "key": "contact_information",
        "label": "Contact Information",
        "required": true,
        "min_words": 10,
        "max_words": 60,
        "instructions": "Full contact block with company name, address, POC name, phone, email, and website."
      }
    ]
  },
  "cash-flow-forecast": {
    "deliverable_slug": "cash-flow-forecast",
    "required_fields": [
      {
        "key": "entity_name",
        "label": "Entity name",
        "type": "text"
      },
      {
        "key": "forecast_horizon_weeks",
        "label": "Forecast horizon (weeks)",
        "type": "number",
        "help": "Standard treasury practice is 13 weeks.",
        "default": 13
      },
      {
        "key": "forecast_start_date",
        "label": "Forecast start date",
        "type": "date"
      },
      {
        "key": "starting_cash_position",
        "label": "Starting cash position ($)",
        "type": "number"
      },
      {
        "key": "recurring_inflows",
        "label": "Recurring inflows (one per line)",
        "type": "textarea",
        "help": "source | amount per period | frequency-weeks | start-week | end-week"
      },
      {
        "key": "recurring_outflows",
        "label": "Recurring outflows (one per line)",
        "type": "textarea",
        "help": "category | amount per period | frequency-weeks | start-week | end-week"
      },
      {
        "key": "scenario_label",
        "label": "Scenario",
        "type": "select",
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
        "key": "assumptions",
        "label": "Assumptions",
        "type": "textarea",
        "help": "Key assumptions held constant. One per line."
      },
      {
        "key": "prepared_by",
        "label": "Prepared by",
        "type": "text"
      }
    ],
    "optional_fields": [
      {
        "key": "minimum_cash_threshold",
        "label": "Minimum cash threshold ($)",
        "type": "number",
        "help": "Alert level — projected ending cash below this triggers risk alert."
      },
      {
        "key": "receivables_aging",
        "label": "Receivables aging (optional)",
        "type": "textarea",
        "help": "customer | amount | expected-collection-week"
      },
      {
        "key": "payables_aging",
        "label": "Payables aging (optional)",
        "type": "textarea",
        "help": "vendor | amount | expected-payment-week"
      },
      {
        "key": "one_time_items",
        "label": "One-time items (optional)",
        "type": "textarea",
        "help": "description | amount | week | inflow/outflow"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "financial_data",
        "label": "Prior financials, AR/AP detail, P&L (multiple allowed)",
        "required": false,
        "multiple": true,
        "accepts": ".xlsx,.xls,.csv,application/pdf"
      }
    ],
    "sections": [
      {
        "key": "header_masthead",
        "label": "Header",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Treasury / CFO analytical. Forward-looking but bounded by stated assumptions. Highlight cash threshold breaches without alarmism. Use CFO-precise language: \"operating cash inflows\", \"working capital\", \"minimum cash threshold\", \"liquidity headroom\", \"draw on the line of credit\". Avoid hedge words (\"might\", \"could perhaps\") — state outcomes conditionally based on assumptions but with conviction in the math.\n\nPIPELINE OWNS THE HEADER (entity_name, scenario_label, forecast_start_date in masthead). Do NOT emit a title or section duplicating the masthead. Start your output directly with the Assumptions and Scenario section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n600–1200 words. The weekly table is the substance; commentary is concise and analytical.\n\nHEADER: write this section per the document type's standard structure."
      },
      {
        "key": "assumptions_scenario",
        "label": "Assumptions and Scenario",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ASSUMPTIONS AND SCENARIO: Two paragraphs.\nParagraph 1: State the scenario being modeled — Base / Optimistic / Pessimistic — drawn from scenario_label input. Briefly characterize what each scenario assumes (Base = current run-rate continues; Optimistic = upside drivers materialize; Pessimistic = downside risks crystallize). State that this forecast covers [forecast_horizon_weeks] weeks beginning [forecast_start_date].\nParagraph 2: List the key assumptions drawn from assumptions input as a numbered or bulleted list. Each assumption is a clear statement of what is being held constant or projected, e.g.:\n  - \"Customer collections continue at current 45-day average DSO.\"\n  - \"Vendor payments at standard Net 30 terms.\"\n  - \"No new financing activity (debt draws, equity raises) within the horizon.\"\n  - \"Headcount and payroll constant at current levels.\"\nEnd with: \"Material deviations from these assumptions will result in different cash trajectory; the forecast should be re-run when assumptions change.\""
      },
      {
        "key": "weekly_forecast",
        "label": "Weekly Forecast",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "WEEKLY FORECAST: Large <table class=\"fin-table\"> with columns: Week | Week Ending | Starting Cash | Inflows | Outflows | Net Change | Ending Cash. One row per week from week 1 through forecast_horizon_weeks (typically 13).\nCompute each week's values:\n  - Week 1 Starting Cash = starting_cash_position\n  - Week N Starting Cash = Week N-1 Ending Cash\n  - Inflows = sum of (recurring_inflows applicable that week) + (one_time_items inflows that week) + (receivables_aging collections that week)\n  - Outflows = sum of (recurring_outflows applicable that week) + (one_time_items outflows that week) + (payables_aging payments that week)\n  - Net Change = Inflows - Outflows\n  - Ending Cash = Starting + Net Change\nFormat week ending date based on forecast_start_date + (week × 7 days), assuming week-ending convention is Friday or Sunday — note in the assumptions paragraph which is used.\nBottom rows:\n  - Total row showing summed Inflows, summed Outflows, summed Net Change across all weeks (DO NOT sum starting/ending — those are point-in-time, not flow). Use class \"subtotal-row\".\n  - Final row showing \"Forecast End Position\" with the last week's ending cash. Use class \"total-row\".\nRight-align all numeric columns. Format currency consistently. Highlight any week where Ending Cash falls below minimum_cash_threshold (the pipeline supports row class \"alert-row\" — apply if useful)."
      },
      {
        "key": "inflow_detail",
        "label": "Inflow Detail",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "INFLOW DETAIL: Three sub-tables rendered as <h3>:\n  <h3>Recurring Inflows</h3> — <table class=\"fin-table\"> with columns Source | Amount per Period | Frequency (weeks) | Start Week | End Week | Total over Horizon. Parse recurring_inflows input.\n  <h3>Receivables Collections (Aging)</h3> — only if receivables_aging non-empty. Columns Customer | Amount | Expected Collection Week.\n  <h3>One-Time Inflows</h3> — only if one_time_items contains any inflow rows. Columns Description | Amount | Week.\nSubtotals at the bottom of each table. If a sub-table has no entries, omit that sub-section entirely (or state \"None projected for this horizon\" if fully missing)."
      },
      {
        "key": "outflow_detail",
        "label": "Outflow Detail",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "OUTFLOW DETAIL: Mirror structure for outflows — three sub-tables:\n  <h3>Recurring Outflows</h3> — <table class=\"fin-table\"> with columns Category | Amount per Period | Frequency (weeks) | Start Week | End Week | Total over Horizon. Parse recurring_outflows input.\n  <h3>Payables (Aging)</h3> — only if payables_aging non-empty. Columns Vendor | Amount | Expected Payment Week.\n  <h3>One-Time Outflows</h3> — only if one_time_items contains any outflow rows. Columns Description | Amount | Week.\nSubtotals at the bottom of each table."
      },
      {
        "key": "aging_schedules",
        "label": "Aging Schedules",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "AGING SCHEDULES: ONLY emit if receivables_aging or payables_aging input is non-empty. Two sub-headings:\n  <h3>Receivables Aging Detail</h3> — only if receivables_aging non-empty. Restructure receivables by aging bucket if useful (current, 30, 60, 90+) — or simply re-render the same data with risk commentary on collection probability.\n  <h3>Payables Aging Detail</h3> — only if payables_aging non-empty. Same structure.\nThis section may overlap with Inflow/Outflow Detail above; include only if it adds value (aging analysis vs. just listing)."
      },
      {
        "key": "risk_alerts",
        "label": "Risk Alerts and Threshold Analysis",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "RISK ALERTS AND THRESHOLD ANALYSIS: Identify any week where Ending Cash falls below minimum_cash_threshold (if the threshold is set). For each breach, state:\n  \"ALERT: Cash position falls below the minimum threshold of $[threshold] in week [N] (week ending [date]), reaching a low of $[amount]. The shortfall persists through week [M] before recovering to $[recovery amount]. Recommended actions to consider: accelerate collections through [specific receivables]; defer non-critical payables to [later week]; draw on the line of credit; communicate to lenders about expected covenant impact.\"\nIf multiple non-contiguous breaches: list each separately.\nIf no breaches: \"Cash position remains above the minimum threshold of $[threshold] throughout the [forecast_horizon_weeks]-week forecast horizon. Lowest projected ending cash position: $[X] in week [N] (week ending [date]); buffer at the low point: $[X - threshold].\"\nEnd with a one-paragraph treasury commentary on overall cash trajectory: building, drawing down, or steady. Note any inflection points where the trajectory shifts."
      }
    ]
  },
  "change-order": {
    "deliverable_slug": "change-order",
    "required_fields": [
      {
        "key": "change_order_number",
        "label": "Change Order number",
        "type": "text",
        "placeholder": "CO-001",
        "help": "Sequential identifier across this contract."
      },
      {
        "key": "original_contract_title",
        "label": "Original contract — title",
        "type": "text"
      },
      {
        "key": "original_contract_date",
        "label": "Original contract — date",
        "type": "date"
      },
      {
        "key": "original_contract_sum_dollars",
        "label": "Original contract sum ($)",
        "type": "number"
      },
      {
        "key": "prior_change_orders_total_dollars",
        "label": "Net change by prior Change Orders ($)",
        "type": "number",
        "help": "Sum of all change orders executed before this one. 0 if this is the first.",
        "default": 0
      },
      {
        "key": "original_completion_date",
        "label": "Original substantial completion date",
        "type": "date"
      },
      {
        "key": "prior_change_orders_days_total",
        "label": "Net change in time by prior Change Orders (days)",
        "type": "number",
        "default": 0
      },
      {
        "key": "client_name",
        "label": "Client legal name",
        "type": "text"
      },
      {
        "key": "change_date",
        "label": "Change Order date",
        "type": "date"
      },
      {
        "key": "cause_of_change",
        "label": "Cause of change",
        "type": "select",
        "help": "Drives entitlement analysis. Owner-directed = no claim for delay damages; unforeseen condition = claim possible.",
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
        ]
      },
      {
        "key": "cause_description",
        "label": "Cause — factual description",
        "type": "textarea",
        "help": "What happened, in neutral past-tense language. Do not assign blame here; that belongs in claim documentation."
      },
      {
        "key": "scope_changes",
        "label": "Scope changes (additions / removals / modifications)",
        "type": "textarea",
        "help": "Organize as three sections: ADDITIONS, REMOVALS, MODIFICATIONS. One line per item."
      },
      {
        "key": "cost_breakdown",
        "label": "Cost breakdown",
        "type": "textarea",
        "help": "Labor by role × hours × rate, materials, subs, equipment, overhead %, profit %. The pipeline renders this as a structured table."
      },
      {
        "key": "cost_impact_dollars",
        "label": "Net cost impact of this Change Order ($)",
        "type": "number",
        "help": "Signed: positive for additions, negative for credits. Must match the bottom-line of cost_breakdown."
      },
      {
        "key": "schedule_impact_days",
        "label": "Net schedule impact of this Change Order (days)",
        "type": "number",
        "help": "Signed: positive for added days, negative for compression. 0 if no time impact."
      },
      {
        "key": "effective_date",
        "label": "Effective date",
        "type": "date"
      }
    ],
    "optional_fields": [
      {
        "key": "conditional_on",
        "label": "Conditional on (optional)",
        "type": "text",
        "help": "If left blank, change order is unconditional. Otherwise, condition that must be satisfied within 30 days for the change order to take effect."
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Original SOW or contract being changed (recommended)",
        "required": false,
        "multiple": true,
        "accepts": "application/pdf,.docx,.doc"
      }
    ],
    "sections": [
      {
        "key": "header",
        "label": "Header",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Contractual amendment formality. Precise, dry, reference-heavy. This is an instrument that modifies an existing contract — not a new agreement and not a sales document. Do not re-sell the project. Do not re-explain rationale beyond one factual sentence. Use legal-amendment voice throughout. The change order is a record of what changed and what now applies; nothing more.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n800–1500 words. Be complete and precise; do not pad. Change orders are about specifics — vague language defeats the purpose.\n\nHEADER: write this section per the document type's standard structure."
      },
      {
        "key": "reference_to_original_contract",
        "label": "Reference to Original Contract",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "REFERENCE TO ORIGINAL CONTRACT: One paragraph. State that this is Change Order [change_order_number] dated [change_date], amending the original contract titled \"[original_contract_title]\" dated [original_contract_date] between [client_name] and [provider — pull from brand]. State: \"All terms and conditions of the Original Contract remain in full force and effect except as expressly modified by this Change Order. In the event of conflict between this Change Order and the Original Contract, this Change Order controls only with respect to the matters expressly addressed herein.\" If prior_change_orders_total_dollars > 0 or prior_change_orders_days_total > 0, also state: \"[N] prior change orders have been executed; this Change Order is in addition to all prior amendments.\""
      },
      {
        "key": "cause_and_description",
        "label": "Cause and Description of Change",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "CAUSE AND DESCRIPTION OF CHANGE: Restate cause_of_change category as a bold lead-in:\n  - 'owner-directed': \"Owner-Directed Change.\"\n  - 'design-clarification': \"Design Clarification.\"\n  - 'unforeseen-condition': \"Unforeseen Condition.\"\n  - 'regulatory-change': \"Regulatory Change.\"\n  - 'force-majeure': \"Force Majeure Event.\"\n  - 'other': \"Other Change Cause.\"\nThen one paragraph factual narrative drawn from cause_description input. Use neutral, past-tense language. Do not assign blame. Do not editorialize. State the underlying facts and the resulting need for the change. Reserve any entitlement assertion to the Reservation of Rights section."
      },
      {
        "key": "scope_changes",
        "label": "Scope Changes",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "SCOPE CHANGES: Three distinct sub-headings rendered as <h3>:\n  1. <h3>Additions</h3> — bulleted list of items added to the original scope. Drawn from the additions portion of scope_changes input. If none, state \"None.\"\n  2. <h3>Removals</h3> — bulleted list of items removed from the original scope. Drawn from the removals portion. If none, state \"None.\"\n  3. <h3>Modifications</h3> — bulleted list of items modified (existing in original scope but with changed terms). If none, state \"None.\"\nEach item is a single short bullet identifying what is added/removed/modified. Detail belongs in the cost breakdown."
      },
      {
        "key": "cost_breakdown",
        "label": "Cost Breakdown",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "COST BREAKDOWN: Render cost_breakdown input as a structured <table>. Categories shown as rows:\n  - Labor (with sub-rows by role × hours × rate where breakdown supports it)\n  - Materials (with sub-rows by item where breakdown supports it)\n  - Subcontractors\n  - Equipment\n  - Direct Costs Subtotal\n  - Overhead (typically 5–15% of direct costs)\n  - Profit / Markup (typically 5–15%)\n  - Total Change Order Amount\nThe Total row should equal cost_impact_dollars. If credit (negative cost_impact_dollars), the structure inverts — rows show what is being credited. Format all currency as $1,234.56 with thousand separators."
      },
      {
        "key": "effect_on_contract_sum",
        "label": "Effect on Contract Sum",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EFFECT ON CONTRACT SUM: Render as a structured table or right-aligned summary block showing the running total:\n  Original Contract Sum: $[original_contract_sum_dollars]\n  Net Change by Prior Change Orders: $[prior_change_orders_total_dollars] (signed)\n  Contract Sum Prior to This Change Order: $[original_contract_sum_dollars + prior_change_orders_total_dollars]\n  Change by This Change Order: $[cost_impact_dollars] (signed; positive for additions, parentheses for credits)\n  ───────────\n  New Contract Sum: $[computed sum]\nThe line \"New Contract Sum\" should be styled with bold and a top border (use class total-row if styling supported). Format negatives as ($1,234.56) in accounting style or with a minus sign — be consistent. If cost_impact_dollars is 0, state \"There is no change to the Contract Sum as a result of this Change Order.\""
      },
      {
        "key": "effect_on_contract_time",
        "label": "Effect on Contract Time",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EFFECT ON CONTRACT TIME: Mirror structure for time:\n  Original Substantial Completion Date: [original_completion_date]\n  Net Change in Contract Time by Prior Change Orders: [prior_change_orders_days_total] days (signed)\n  Substantial Completion Date Prior to This Change Order: [computed]\n  Change by This Change Order: [schedule_impact_days] days (signed)\n  ───────────\n  New Substantial Completion Date: [computed]\nIf schedule_impact_days is 0, state explicitly: \"There is no change to the Contract Time as a result of this Change Order. The Substantial Completion Date remains [original or current adjusted date].\" If the change has critical-path implications, note that without claiming the change is on the critical path unless documented."
      },
      {
        "key": "reservation_of_rights",
        "label": "Reservation of Rights",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "RESERVATION OF RIGHTS: Standard clause, exact language: \"By executing this Change Order, neither party waives any rights, claims, or defenses related to the Original Contract or to any other matter, including any disputed scope items, pending claims, or contemplated claims, except as expressly resolved by this Change Order. The pricing, schedule, and other terms set forth herein constitute full and complete compensation for the changes specifically described in this Change Order. Neither party admits or concedes liability or entitlement with respect to any matter not expressly addressed herein.\"\nThis section is non-negotiable and must always appear, even if cause_of_change is 'owner-directed'."
      },
      {
        "key": "continuing_obligations",
        "label": "Continuing Obligations",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "CONTINUING OBLIGATIONS: One paragraph: \"All terms, conditions, and obligations of the Original Contract not expressly modified by this Change Order remain in full force and effect. The parties' rights and remedies under the Original Contract are preserved as to all matters not addressed herein. This Change Order does not constitute a novation of the Original Contract. Time remains of the essence.\"\nIf conditional_on field is provided: append a sub-paragraph: \"Conditional Effectiveness: This Change Order is conditional upon [conditional_on]. If the foregoing condition is not satisfied within thirty (30) days of [effective_date], this Change Order shall be null and void and the Original Contract shall continue unmodified. Upon satisfaction of the condition, the parties shall promptly confirm effectiveness in writing.\""
      },
      {
        "key": "acceptance_signatures",
        "label": "Acceptance and Signatures",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "ACCEPTANCE AND SIGNATURES: Brief sign-off paragraph: \"The undersigned representatives of the parties, having authority to bind their respective principals, execute this Change Order [N] effective as of [effective_date].\" Then standard counter-party signature lines. The pipeline renders the formal signature block; you do not need to render signature lines. If cause_of_change is 'design-clarification' or 'unforeseen-condition' and the engagement appears to be construction-related, note: \"Architect/Engineer of Record acknowledgment line included where required by the Original Contract.\""
      }
    ]
  },
  "compliance-report": {
    "deliverable_slug": "compliance-report",
    "required_fields": [
      {
        "key": "organization_name",
        "label": "Organization name",
        "type": "text",
        "placeholder": "Full legal entity name"
      },
      {
        "key": "regulatory_framework",
        "label": "Regulatory framework",
        "type": "text",
        "placeholder": "e.g., SOX, HIPAA, GDPR, CCPA, PCI-DSS, SOC 2"
      },
      {
        "key": "assessment_scope",
        "label": "Assessment scope",
        "type": "textarea",
        "placeholder": "Which departments, systems, or processes are in scope for this assessment?"
      },
      {
        "key": "assessment_period",
        "label": "Assessment period",
        "type": "text",
        "placeholder": "e.g., January 1 - December 31, 2025"
      },
      {
        "key": "current_compliance_status",
        "label": "Current compliance status",
        "type": "textarea",
        "placeholder": "Describe your current understanding of compliance posture (e.g., first assessment, previously compliant with known gaps)..."
      },
      {
        "key": "key_concerns",
        "label": "Primary compliance concerns",
        "type": "textarea",
        "placeholder": "What specific areas of non-compliance or risk are you most concerned about?"
      }
    ],
    "optional_fields": [
      {
        "key": "prior_audit_findings",
        "label": "Prior audit or assessment findings",
        "type": "textarea",
        "placeholder": "Summarize findings from any previous assessments..."
      },
      {
        "key": "industry_sector",
        "label": "Industry sector",
        "type": "text",
        "placeholder": "e.g., Healthcare, Financial Services, Technology"
      },
      {
        "key": "employee_count",
        "label": "Approximate employee count",
        "type": "text",
        "placeholder": "e.g., 250"
      },
      {
        "key": "geographic_scope",
        "label": "Geographic scope of operations",
        "type": "text",
        "placeholder": "e.g., US only, US and EU, Global"
      },
      {
        "key": "target_completion",
        "label": "Target remediation completion date",
        "type": "date"
      },
      {
        "key": "compliance_officer",
        "label": "Compliance officer or point of contact",
        "type": "text",
        "placeholder": "Name and title"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload any existing compliance documentation, policies, or prior audit reports",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload relevant regulatory guidance documents or checklists",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload company brand guidelines for report formatting (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Summarize the overall compliance posture, number and severity of findings, and top-priority remediation items. Write for C-suite and board-level audience."
      },
      {
        "key": "scope_and_methodology",
        "label": "Scope and Methodology",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Define the assessment boundaries, frameworks applied, evaluation methods, and any limitations or exclusions."
      },
      {
        "key": "regulatory_landscape",
        "label": "Regulatory Landscape",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Overview the applicable regulations, recent changes, enforcement trends, and their specific applicability to the organization."
      },
      {
        "key": "current_state_assessment",
        "label": "Current State Assessment",
        "required": true,
        "min_words": 300,
        "max_words": 800,
        "instructions": "Detail the current compliance posture across each control domain. Include evidence of compliance and identified deficiencies organized by control area."
      },
      {
        "key": "gap_analysis",
        "label": "Gap Analysis",
        "required": true,
        "min_words": 200,
        "max_words": 600,
        "instructions": "Map each identified gap between current state and regulatory requirements. Classify each gap by severity (critical, high, medium, low) with clear rationale."
      },
      {
        "key": "risk_scoring",
        "label": "Risk Scoring Matrix",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Present a risk matrix scoring each finding by likelihood of exploitation and potential impact. Provide an overall risk score and category."
      },
      {
        "key": "remediation_roadmap",
        "label": "Remediation Roadmap",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Provide a prioritized, time-bound remediation plan for each finding. Include responsible party, estimated effort, dependencies, and milestone dates."
      },
      {
        "key": "appendices",
        "label": "Appendices",
        "required": false,
        "min_words": 50,
        "max_words": 300,
        "instructions": "Include supporting materials such as control mapping tables, evidence logs, glossary of terms, and regulatory reference links."
      }
    ]
  },
  "contract-package": {
    "deliverable_slug": "contract-package",
    "required_fields": [
      {
        "key": "contract_type",
        "label": "Type of contract",
        "type": "text",
        "placeholder": "e.g., Master Services Agreement, NDA, License Agreement"
      },
      {
        "key": "party_a_name",
        "label": "Party A (your organization)",
        "type": "text",
        "placeholder": "Full legal entity name"
      },
      {
        "key": "party_a_role",
        "label": "Party A role",
        "type": "text",
        "placeholder": "e.g., Service Provider, Licensor, Seller"
      },
      {
        "key": "party_b_name",
        "label": "Party B (counterparty)",
        "type": "text",
        "placeholder": "Full legal entity name"
      },
      {
        "key": "party_b_role",
        "label": "Party B role",
        "type": "text",
        "placeholder": "e.g., Client, Licensee, Buyer"
      },
      {
        "key": "scope_of_agreement",
        "label": "Scope of the agreement",
        "type": "textarea",
        "placeholder": "Describe what goods, services, or rights are covered by this contract..."
      },
      {
        "key": "governing_law",
        "label": "Governing law / jurisdiction",
        "type": "text",
        "placeholder": "e.g., State of Delaware"
      },
      {
        "key": "term_length",
        "label": "Contract term",
        "type": "text",
        "placeholder": "e.g., 12 months with auto-renewal, 3-year fixed term"
      }
    ],
    "optional_fields": [
      {
        "key": "compensation_terms",
        "label": "Compensation / payment terms",
        "type": "textarea",
        "placeholder": "Describe pricing, payment schedule, invoicing terms..."
      },
      {
        "key": "termination_conditions",
        "label": "Termination conditions",
        "type": "textarea",
        "placeholder": "Any specific termination triggers beyond standard breach..."
      },
      {
        "key": "ip_ownership",
        "label": "Intellectual property ownership",
        "type": "textarea",
        "placeholder": "Who owns work product, pre-existing IP provisions..."
      },
      {
        "key": "non_compete_non_solicit",
        "label": "Non-compete / non-solicitation terms",
        "type": "textarea",
        "placeholder": "Duration and geographic scope of any restrictive covenants..."
      },
      {
        "key": "insurance_requirements",
        "label": "Insurance requirements",
        "type": "text",
        "placeholder": "e.g., $1M general liability, E&O coverage required"
      },
      {
        "key": "special_provisions",
        "label": "Special provisions or carve-outs",
        "type": "textarea",
        "placeholder": "Any unique terms this contract needs to include..."
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload any existing contracts, term sheets, or prior agreements for reference",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload firm or company letterhead / brand guidelines (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "recitals",
        "label": "Recitals",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "State the background and purpose of the agreement using standard WHEREAS recitals. Establish the relationship between the parties."
      },
      {
        "key": "definitions",
        "label": "Definitions",
        "required": true,
        "min_words": 100,
        "max_words": 400,
        "instructions": "Define all capitalized terms used throughout the agreement. Include standard definitions for Agreement, Confidential Information, Deliverables, Effective Date, and Term."
      },
      {
        "key": "scope_of_work",
        "label": "Scope of Work / Services",
        "required": true,
        "min_words": 150,
        "max_words": 500,
        "instructions": "Detail the services, goods, or rights being provided. Be specific enough to prevent scope disputes."
      },
      {
        "key": "term_and_termination",
        "label": "Term and Termination",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Specify the contract duration, renewal provisions, and termination rights for each party including cure periods."
      },
      {
        "key": "compensation",
        "label": "Compensation and Payment",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Detail all pricing, payment schedules, invoicing procedures, late payment penalties, and expense reimbursement terms."
      },
      {
        "key": "intellectual_property",
        "label": "Intellectual Property",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Specify ownership of work product, licenses granted, pre-existing IP protections, and assignment provisions."
      },
      {
        "key": "confidentiality",
        "label": "Confidentiality",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Define confidential information, obligations of the receiving party, exclusions, and survival period."
      },
      {
        "key": "representations_warranties",
        "label": "Representations and Warranties",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Include standard representations for authority, compliance with laws, and non-infringement. Add deal-specific warranties."
      },
      {
        "key": "indemnification",
        "label": "Indemnification",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "Specify mutual or asymmetric indemnification obligations, procedures for claims, and defense obligations."
      },
      {
        "key": "limitation_of_liability",
        "label": "Limitation of Liability",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "Set liability caps, exclude consequential damages, and specify any carve-outs from the limitation."
      },
      {
        "key": "dispute_resolution",
        "label": "Dispute Resolution",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "Specify the dispute resolution mechanism: negotiation, mediation, arbitration, or litigation. Include venue and governing law."
      },
      {
        "key": "general_provisions",
        "label": "General Provisions",
        "required": true,
        "min_words": 100,
        "max_words": 400,
        "instructions": "Include standard boilerplate: entire agreement, amendment, assignment, notices, severability, waiver, force majeure, counterparts."
      },
      {
        "key": "signature_block",
        "label": "Signature Block",
        "required": true,
        "min_words": 20,
        "max_words": 100,
        "instructions": "Format signature blocks for all parties with name, title, date, and entity name fields."
      },
      {
        "key": "exhibits",
        "label": "Exhibits and Schedules",
        "required": false,
        "min_words": 50,
        "max_words": 500,
        "instructions": "Include any referenced exhibits such as detailed SOW, pricing schedule, SLA, or data processing addendum."
      }
    ]
  },
  "discovery-summary": {
    "deliverable_slug": "discovery-summary",
    "required_fields": [
      {
        "key": "case_name",
        "label": "Case name",
        "type": "text",
        "placeholder": "e.g., Smith v. Acme Corporation"
      },
      {
        "key": "case_number",
        "label": "Case number",
        "type": "text",
        "placeholder": "e.g., 1:24-cv-01234"
      },
      {
        "key": "court",
        "label": "Court",
        "type": "text",
        "placeholder": "e.g., U.S. District Court, District of Massachusetts"
      },
      {
        "key": "discovery_scope",
        "label": "Scope of discovery to summarize",
        "type": "textarea",
        "placeholder": "Describe what categories of discovery materials need to be summarized (documents, depositions, interrogatories, etc.)..."
      },
      {
        "key": "key_issues",
        "label": "Key issues in the case",
        "type": "textarea",
        "placeholder": "List the primary legal and factual issues the discovery relates to..."
      },
      {
        "key": "your_party_role",
        "label": "Your client's role",
        "type": "text",
        "placeholder": "e.g., Plaintiff, Defendant, Third-party defendant"
      }
    ],
    "optional_fields": [
      {
        "key": "deponent_names",
        "label": "Key deponents",
        "type": "textarea",
        "placeholder": "Names and roles of key deponents..."
      },
      {
        "key": "document_volume",
        "label": "Approximate document volume",
        "type": "text",
        "placeholder": "e.g., 5,000 documents, 200 pages of deposition transcripts"
      },
      {
        "key": "privilege_concerns",
        "label": "Privilege or sensitivity concerns",
        "type": "textarea",
        "placeholder": "Note any privilege log issues or sensitive materials..."
      },
      {
        "key": "upcoming_deadlines",
        "label": "Upcoming deadlines",
        "type": "text",
        "placeholder": "e.g., Summary judgment motion due April 15"
      },
      {
        "key": "opposing_counsel",
        "label": "Opposing counsel",
        "type": "text",
        "placeholder": "Firm and attorney names"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload discovery documents, deposition transcripts, or interrogatory responses",
        "required": true
      },
      {
        "kind": "reference_doc",
        "label": "Upload the complaint, answer, or other key pleadings for context",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload firm letterhead or brand guidelines (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Provide a high-level overview of the discovery reviewed, key findings, and their significance to the case. Written for a senior partner who needs a quick briefing."
      },
      {
        "key": "discovery_overview",
        "label": "Discovery Overview",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Catalog the types and volume of discovery reviewed. Include production dates, custodians, and any gaps or outstanding requests."
      },
      {
        "key": "document_review_findings",
        "label": "Document Review Findings",
        "required": true,
        "min_words": 300,
        "max_words": 800,
        "instructions": "Organize document review results by issue or category. Highlight smoking gun documents, key admissions, and patterns. Reference specific exhibit numbers."
      },
      {
        "key": "deposition_highlights",
        "label": "Deposition Highlights",
        "required": true,
        "min_words": 200,
        "max_words": 600,
        "instructions": "Summarize key testimony from each deponent organized by topic. Include exact quotes with transcript citations for critical admissions or contradictions."
      },
      {
        "key": "key_evidence",
        "label": "Key Evidence Catalog",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Create a prioritized list of the most significant evidence supporting and undermining the client's position. Rate each item by strength and relevance."
      },
      {
        "key": "timeline",
        "label": "Chronological Timeline",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Construct a fact timeline from the discovery materials showing the sequence of key events with supporting evidence citations."
      },
      {
        "key": "recommendations",
        "label": "Recommendations",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Provide strategic recommendations based on the discovery review. Identify areas needing further investigation, potential motion topics, and trial themes."
      }
    ]
  },
  "engagement-letter": {
    "deliverable_slug": "engagement-letter",
    "required_fields": [
      {
        "key": "firm_type",
        "label": "Firm type",
        "type": "select",
        "help": "Drives the scope-limitation, privilege, conflicts, and document-retention clause variants.",
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
        ]
      },
      {
        "key": "client_name",
        "label": "Client — legal name",
        "type": "text"
      },
      {
        "key": "client_entity_type",
        "label": "Client — entity type",
        "type": "select",
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
        "key": "client_address",
        "label": "Client — notice address",
        "type": "textarea",
        "help": "Full address for legal notices, including email if applicable."
      },
      {
        "key": "client_signing_authority_name",
        "label": "Client — signing authority name",
        "type": "text",
        "help": "The person with authority to bind the client."
      },
      {
        "key": "client_signing_authority_title",
        "label": "Client — signing authority title",
        "type": "text"
      },
      {
        "key": "engagement_type",
        "label": "Engagement type",
        "type": "select",
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
        "key": "engagement_scope",
        "label": "Scope — services included",
        "type": "textarea",
        "help": "Specific services to be provided. Be precise — vague scope creates fee disputes."
      },
      {
        "key": "engagement_exclusions",
        "label": "Scope — services explicitly excluded",
        "type": "textarea",
        "help": "Critical for liability protection. List anything a reasonable client might assume is included but is not."
      },
      {
        "key": "start_date",
        "label": "Start date",
        "type": "date"
      },
      {
        "key": "fee_structure",
        "label": "Fee structure",
        "type": "select",
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
        "key": "fee_detail",
        "label": "Fee detail",
        "type": "textarea",
        "help": "Hourly rates by role, retainer amount and replenishment trigger, fixed amount with milestones, or contingency percentage and outcome trigger."
      },
      {
        "key": "expense_policy",
        "label": "Expense policy",
        "type": "select",
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
        "key": "payment_terms",
        "label": "Payment terms",
        "type": "text",
        "default": "Net 30"
      },
      {
        "key": "firm_point_of_contact_name",
        "label": "Firm — point of contact name",
        "type": "text"
      },
      {
        "key": "firm_point_of_contact_title",
        "label": "Firm — point of contact title",
        "type": "text"
      },
      {
        "key": "governing_state",
        "label": "Governing state",
        "type": "text"
      },
      {
        "key": "dispute_resolution",
        "label": "Dispute resolution",
        "type": "select",
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
    "optional_fields": [
      {
        "key": "expense_threshold_dollars",
        "label": "Expense pre-approval threshold ($)",
        "type": "number",
        "help": "Only used if pre-approval policy selected."
      },
      {
        "key": "late_payment_interest_percent",
        "label": "Late payment interest rate (% per month)",
        "type": "number",
        "default": 1.5
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Prior engagement letters or firm letterhead (optional)",
        "required": false,
        "multiple": true,
        "accepts": "application/pdf,.docx,.doc,image/*"
      }
    ],
    "sections": [
      {
        "key": "cover_letter",
        "label": "Cover Letter",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Professional services formality. Lawyer/CPA/consultant issuing an engagement letter. Courteous but firm about terms. Use \"we\" (firm) and \"you\" (client) throughout. Sign off with \"Very truly yours\" or \"Sincerely.\" No marketing language. No softening qualifiers like \"we're excited to,\" \"thanks for choosing us,\" or \"we look forward to partnering.\" This is an instrument of professional engagement, not a sales document.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n1500–2500 words. Engagement letters are professional instruments — be complete but not padded. Each section earns its place; redundant prose is removed.\n\nCOVER LETTER: Salutation: \"Dear [client_signing_authority_name],\". Two paragraphs. Para 1: state firm is pleased to confirm the engagement, reference the engagement_type as the subject, and reference any prior discussions. Para 2: state purpose of letter — establish terms of engagement, request counter-signature. End the cover-letter section by transitioning into the body of terms. Do not include a salutation in any subsequent section."
      },
      {
        "key": "engagement_scope",
        "label": "Scope of Engagement",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "SCOPE OF ENGAGEMENT: Specific services to be provided per engagement_scope input. Render as a numbered list if multiple services, or 1–2 paragraphs if narrative. Each item describes what firm will deliver. Use action verbs (\"Prepare\", \"Review\", \"Advise on\", \"Draft\"). End with: \"The services described above constitute the entirety of the engagement under this letter unless modified in a written amendment signed by both parties.\""
      },
      {
        "key": "scope_exclusions",
        "label": "Scope Limitations",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "SCOPE LIMITATIONS: This is critical for liability — do not skip even if engagement_exclusions input is brief. Lead with: \"The following matters are expressly EXCLUDED from this engagement and are not provided unless agreed to in writing in a separate engagement letter or amendment:\" Then list exclusions from engagement_exclusions input as numbered items. Then add firm-type-specific carve-outs:\n  - If firm_type is 'legal': \"We are not providing tax, accounting, or business advice as part of this engagement.\"\n  - If 'accounting': \"We are not providing legal advice or representation. We do not opine on legal compliance matters except as expressly included in scope.\"\n  - If 'consulting' or 'advisory': \"We do not provide legal, tax, or accounting services. Recommendations regarding such matters should be reviewed with appropriately licensed advisors.\"\nEnd with: \"Services performed beyond the scope described above will require an amendment to this letter or a separate engagement.\""
      },
      {
        "key": "fees_and_billing",
        "label": "Fees and Billing",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "FEES AND BILLING: Restate fee_structure and fee_detail in plain professional prose. Branch on fee_structure value:\n  - If 'fixed-fee': \"Our fee for this engagement is $[fee from detail]. The fee is payable as follows: [milestones from detail or default 50% on execution, 50% on final delivery].\"\n  - If 'hourly': \"Services will be billed at the hourly rates set forth in fee_detail. Time is billed in [0.1 hour increments]. Invoices are issued monthly on the first business day.\"\n  - If 'retainer': \"A retainer of $[amount from detail] is required at engagement commencement. Time and expenses are drawn against the retainer; the retainer is replenished when balance falls below [threshold from detail].\"\n  - If 'hybrid': describe both fixed and hourly portions per fee_detail.\n  - If 'contingency': \"Our fee is contingent upon [outcome from detail], calculated as [percentage from detail].\"\nLate payment: \"Invoices unpaid after [payment_terms] from invoice date accrue interest at [late_payment_interest_percent]% per month or the maximum rate permitted by applicable law, whichever is lower.\""
      },
      {
        "key": "expenses",
        "label": "Expenses and Disbursements",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EXPENSES AND DISBURSEMENTS: Branch on expense_policy:\n  - 'client-pays-actual': \"All out-of-pocket expenses are billed at cost. Typical expenses include travel, filing fees, third-party services, document production, and courier charges.\"\n  - 'included-in-fee': \"Reasonable in-jurisdiction expenses are included in the fee. Out-of-jurisdiction travel and major third-party expenses (filing fees, expert witnesses, document production) are billed separately at cost.\"\n  - 'pre-approval-over-threshold': \"Expenses below $[expense_threshold_dollars] are billed at cost. Expenses at or above $[expense_threshold_dollars] require Client's prior written approval.\"\nEnd with receipts/documentation: \"Reasonable documentation will accompany expense charges. Disputes regarding specific expenses must be raised within thirty (30) days of the invoice on which they appear.\""
      },
      {
        "key": "responsibilities",
        "label": "Responsibilities of the Parties",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "RESPONSIBILITIES OF THE PARTIES: Two sub-paragraphs.\nFirm responsibilities: \"We will perform the services with the professional skill, care, and diligence ordinarily exercised by [firm_type] practitioners under similar circumstances. We will comply with all applicable professional standards, including [for legal: Rules of Professional Conduct of the governing_state state bar; for accounting: AICPA standards and applicable state board regulations; for consulting/advisory: applicable industry standards]. We will keep you reasonably informed of progress and material developments.\"\nClient responsibilities: \"You agree to: (a) provide complete and accurate information necessary for the engagement; (b) respond to requests for information and decisions in a timely manner; (c) make available [client_signing_authority_name] or another designated decision-maker for material decisions; (d) pay invoices when due; (e) inform us promptly of any matter that may affect the engagement.\""
      },
      {
        "key": "conflicts_and_independence",
        "label": "Conflicts of Interest and Independence",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "CONFLICTS OF INTEREST AND INDEPENDENCE: Branch on firm_type:\n  - 'legal': \"We have performed a conflicts check based on the information provided and do not believe any conflicts of interest exist that would prevent representation in this matter. You agree to advise us promptly of any potential conflicts of which you become aware. We may represent other clients with interests adverse to yours, provided we are not opposing you in matters substantially related to this engagement. You consent to such representation. If a conflict arises that we believe requires withdrawal, we will notify you in writing.\"\n  - 'accounting': \"We will maintain independence as required by AICPA standards and the [governing_state] state board of accountancy. We are not aware of any relationships that would impair our independence with respect to this engagement. You agree to inform us if you become aware of any matter that could affect our independence.\"\n  - 'consulting' or 'advisory': \"We are not aware of any relationships that would impair our objectivity with respect to this engagement. We may serve other clients in your industry. You agree to inform us if you become aware of any conflict that should be considered.\""
      },
      {
        "key": "confidentiality_privilege",
        "label": "Confidentiality and Privilege",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "CONFIDENTIALITY AND PRIVILEGE: Branch on firm_type for privilege language:\n  - 'legal': \"All information you provide in connection with this engagement will be held in confidence except as required by law, by court order, or with your consent. The attorney-client privilege attaches to confidential communications between us made for the purpose of obtaining legal advice. To preserve privilege: do not share confidential communications with third parties; do not copy non-clients on email correspondence with us; restrict internal distribution to those with a need to know. The work-product doctrine protects materials prepared in anticipation of litigation.\"\n  - 'accounting' or 'consulting' or 'advisory': \"All information you provide will be held in confidence except as required by law, by regulatory authority, or with your consent. Note that no privilege equivalent to attorney-client privilege attaches to communications between us. If you require privileged communication regarding legal matters arising during this engagement, you should consult with your legal counsel directly.\"\nEnd with: \"This obligation of confidentiality survives termination of this engagement.\""
      },
      {
        "key": "document_retention",
        "label": "Document Retention and File Handling",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "DOCUMENT RETENTION AND FILE HANDLING: \"Working papers, internal analyses, and draft materials remain our property and are part of our internal records. Final deliverables, executed agreements, and original documents you provided are your property. Upon request during or after the engagement, we will return original documents and provide copies of final deliverables. Our records relating to this engagement will be retained for [seven (7) years for legal/accounting; five (5) years for consulting/advisory], after which they may be destroyed without further notice. If you require longer retention, you must so advise us in writing.\""
      },
      {
        "key": "term_termination_withdrawal",
        "label": "Term, Termination, and Withdrawal",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "TERM, TERMINATION, AND WITHDRAWAL: \"This engagement begins on [start_date] and continues until the services described above are complete or until earlier termination. Either party may terminate this engagement upon written notice. We may withdraw from representation for: (a) non-payment of fees beyond [60] days past due; (b) ethical conflict that cannot be waived; (c) your failure to cooperate or provide required information; (d) your request that we take an action we believe to be improper, unethical, or unlawful; (e) material breach of this engagement letter. Upon termination, fees earned and expenses incurred to date are immediately due. If termination occurs mid-engagement, you agree to pay reasonable wind-down costs (file transfer, transition memos, regulatory notices).\""
      },
      {
        "key": "dispute_resolution",
        "label": "Dispute Resolution",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "DISPUTE RESOLUTION: Branch on dispute_resolution:\n  - 'binding-arbitration': \"Any dispute arising out of or relating to this engagement shall be resolved exclusively by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. The arbitration shall be conducted by a single arbitrator. The seat of arbitration shall be [governing_state]. The arbitrator's decision shall be final and binding and may be entered in any court of competent jurisdiction. The prevailing party shall be entitled to recover reasonable attorneys' fees and costs.\"\n  - 'mediation-then-arbitration': \"Any dispute shall first be submitted to mediation administered by a mutually-agreed mediator. If the dispute is not resolved by mediation within sixty (60) days, it shall then be resolved by binding arbitration as described above.\"\n  - 'courts': \"Any dispute arising out of or relating to this engagement shall be resolved exclusively in the state or federal courts located in [governing_state]. Both parties consent to personal jurisdiction in such courts.\"\nAdd (all options): \"Claims must be brought within one (1) year of the date the claim arose. Claims not brought within that period are waived.\""
      },
      {
        "key": "acceptance_signatures",
        "label": "Acceptance and Counter-Signature",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "ACCEPTANCE AND COUNTER-SIGNATURE: Closing paragraph: \"If the foregoing accurately reflects our engagement, please countersign below and return one signed copy to us. We will commence work upon receipt of the executed letter[, and the initial retainer where applicable]. This engagement is not effective until counter-signed and returned.\" Sign-off: \"Very truly yours,\" followed by [firm_point_of_contact_name], [firm_point_of_contact_title]. The pipeline renders the formal signature block; you do not need to render signature lines, only the closing."
      }
    ]
  },
  "exec-presentation": {
    "deliverable_slug": "exec-presentation",
    "required_fields": [
      {
        "key": "organization_name",
        "label": "Organization name",
        "type": "text",
        "placeholder": "Your company or client name"
      },
      {
        "key": "presentation_topic",
        "label": "Presentation topic",
        "type": "textarea",
        "placeholder": "What is the core subject of this presentation? e.g., Q4 strategic review, market expansion proposal..."
      },
      {
        "key": "audience",
        "label": "Target audience",
        "type": "text",
        "placeholder": "e.g., Board of directors, C-suite, senior leadership team"
      },
      {
        "key": "key_message",
        "label": "Key message or recommendation",
        "type": "textarea",
        "placeholder": "What is the single most important takeaway you want the audience to leave with?"
      },
      {
        "key": "context_and_background",
        "label": "Context and background",
        "type": "textarea",
        "placeholder": "What background does the audience need? What prompted this presentation?"
      },
      {
        "key": "desired_action",
        "label": "Desired action from audience",
        "type": "textarea",
        "placeholder": "What decision, approval, or action do you want the audience to take after this presentation?"
      }
    ],
    "optional_fields": [
      {
        "key": "presenter_name",
        "label": "Presenter name and title",
        "type": "text",
        "placeholder": "e.g., Jane Smith, VP of Strategy"
      },
      {
        "key": "presentation_date",
        "label": "Presentation date",
        "type": "date"
      },
      {
        "key": "time_limit",
        "label": "Presentation time limit",
        "type": "text",
        "placeholder": "e.g., 20 minutes with 10 minutes Q&A"
      },
      {
        "key": "financial_data",
        "label": "Key financial data to include",
        "type": "textarea",
        "placeholder": "Revenue figures, growth rates, cost data, projections..."
      },
      {
        "key": "competitive_context",
        "label": "Competitive context",
        "type": "textarea",
        "placeholder": "Relevant competitor moves or market dynamics..."
      },
      {
        "key": "sensitive_topics",
        "label": "Sensitive topics to handle carefully",
        "type": "textarea",
        "placeholder": "Any politically sensitive issues, layoffs, bad news..."
      },
      {
        "key": "slide_count_preference",
        "label": "Preferred slide count",
        "type": "text",
        "placeholder": "e.g., 15-20 slides"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload supporting data, reports, or prior presentations",
        "required": false
      },
      {
        "kind": "financial_data",
        "label": "Upload financial data (spreadsheets, reports) to incorporate",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload brand guidelines or presentation template (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "title_slide",
        "label": "Title Slide",
        "required": true,
        "min_words": 10,
        "max_words": 50,
        "instructions": "Create a compelling title slide with presentation title, subtitle, presenter name, date, and any required disclaimers."
      },
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "One slide that captures the entire presentation in 3-5 bullet points. This slide should stand alone as a complete briefing."
      },
      {
        "key": "situation_analysis",
        "label": "Situation Analysis",
        "required": true,
        "min_words": 100,
        "max_words": 400,
        "instructions": "2-3 slides covering the current state, market context, and key challenges or opportunities. Use data visualizations where appropriate."
      },
      {
        "key": "strategic_options",
        "label": "Strategic Options",
        "required": true,
        "min_words": 100,
        "max_words": 400,
        "instructions": "Present 2-3 strategic options with pros, cons, and trade-offs for each. Use a comparison framework (table or matrix) for clarity."
      },
      {
        "key": "recommendation",
        "label": "Recommendation",
        "required": true,
        "min_words": 80,
        "max_words": 300,
        "instructions": "Present the recommended path forward with clear rationale. Connect back to the key message and desired audience action."
      },
      {
        "key": "financial_impact",
        "label": "Financial Impact",
        "required": true,
        "min_words": 80,
        "max_words": 300,
        "instructions": "Quantify the financial implications of the recommendation including investment required, expected returns, and timeline to impact."
      },
      {
        "key": "implementation_timeline",
        "label": "Implementation Timeline",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "Visual timeline showing key milestones, dependencies, and resource requirements for executing the recommendation."
      },
      {
        "key": "risk_assessment",
        "label": "Risk Assessment",
        "required": false,
        "min_words": 50,
        "max_words": 200,
        "instructions": "Identify top 3-5 risks to the recommended approach with likelihood, impact, and mitigation strategies."
      },
      {
        "key": "next_steps",
        "label": "Next Steps",
        "required": true,
        "min_words": 30,
        "max_words": 100,
        "instructions": "Clear, actionable next steps with owners and deadlines. End with the specific ask of the audience."
      },
      {
        "key": "appendix",
        "label": "Appendix",
        "required": false,
        "min_words": 50,
        "max_words": 500,
        "instructions": "Supporting detail slides for reference during Q&A. Include detailed data, methodology notes, and backup analysis."
      }
    ]
  },
  "expense-report": {
    "deliverable_slug": "expense-report",
    "required_fields": [
      {
        "key": "submitter_name",
        "label": "Submitter name",
        "type": "text"
      },
      {
        "key": "period_start",
        "label": "Period start",
        "type": "date"
      },
      {
        "key": "period_end",
        "label": "Period end",
        "type": "date"
      },
      {
        "key": "business_purpose",
        "label": "Business purpose / trip purpose",
        "type": "textarea"
      },
      {
        "key": "expense_lines",
        "label": "Expense lines (one per line)",
        "type": "textarea",
        "help": "date | category | merchant | amount | currency | payment-method | accounting-code | business-purpose"
      },
      {
        "key": "manager_approver_name",
        "label": "Manager / approver name",
        "type": "text"
      }
    ],
    "optional_fields": [
      {
        "key": "submitter_employee_id",
        "label": "Submitter employee ID",
        "type": "text"
      },
      {
        "key": "mileage_entries",
        "label": "Mileage entries (optional, one per line)",
        "type": "textarea",
        "help": "date | from | to | miles | rate | purpose"
      },
      {
        "key": "mileage_rate_per_mile",
        "label": "Mileage rate per mile ($)",
        "type": "number",
        "help": "IRS standard mileage rate or company policy.",
        "default": 0.67
      },
      {
        "key": "per_diem_days",
        "label": "Per diem days",
        "type": "number"
      },
      {
        "key": "per_diem_rate",
        "label": "Per diem rate ($)",
        "type": "number"
      },
      {
        "key": "foreign_currency_conversions",
        "label": "Foreign currency conversions (one per line)",
        "type": "textarea",
        "help": "original-currency | original-amount | conversion-date | rate-used | USD-amount"
      },
      {
        "key": "total_advance_received",
        "label": "Cash advance received ($)",
        "type": "number",
        "default": 0
      },
      {
        "key": "accounting_summary",
        "label": "Accounting code summary (optional)",
        "type": "textarea",
        "help": "Auto-derived from accounting codes if possible; otherwise manual."
      },
      {
        "key": "notes",
        "label": "Notes (optional)",
        "type": "textarea"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "receipt",
        "label": "Receipts (at least one required — multiple allowed)",
        "required": true,
        "multiple": true,
        "accepts": "image/*,application/pdf"
      },
      {
        "kind": "financial_data",
        "label": "Expense CSV or Excel export (optional)",
        "required": false,
        "multiple": true,
        "accepts": ".xlsx,.xls,.csv,application/pdf"
      }
    ],
    "sections": [
      {
        "key": "header_masthead",
        "label": "Header",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Administrative, factual, audit-ready. No commentary. Tables and structured data carry the weight. Use precise terminology — \"reimbursement\", \"advance\", \"per diem\", \"mileage\" — and stick to it. Match the format that AP and Finance teams expect: itemized expense lines, currency conversions for foreign charges, and a clear reimbursement calculation at the end.\n\nPIPELINE OWNS THE HEADER (submitter, period, prepared date in masthead). Do NOT emit a title or any section that duplicates the masthead content. Start your output directly with the Business Purpose section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n300–700 words of prose. The tables carry weight. A simple expense report (one trip, no foreign currency) may be at the low end (350 words); a complex international travel report with mileage, per diem, and FX may approach the high end.\n\nHEADER: write this section per the document type's standard structure."
      },
      {
        "key": "business_purpose_summary",
        "label": "Business Purpose and Period",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "BUSINESS PURPOSE AND PERIOD: One paragraph (3–5 sentences). State:\n  - The period covered: [period_start] through [period_end]\n  - The overall business purpose drawn from business_purpose input — what trip, project, or activity these expenses relate to\n  - If multiple trips or projects covered, note that and how the expenses are organized\n  - Submitter and (if relevant) cost center / accounting code at the summary level\nEnd with: \"Receipts for individual expense lines are attached as Figures 1–N (referenced by line number in the Expense Lines table below).\""
      },
      {
        "key": "expense_lines",
        "label": "Expense Lines",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EXPENSE LINES: <h2>Expense Lines</h2> followed by a <table class=\"fin-table\">. Columns: # | Date | Category | Merchant | Amount | Currency | Payment Method | Accounting Code. Parse each line of expense_lines input as pipe-separated fields (date | category | merchant | amount | currency | payment-method | accounting-code | business-purpose-line).\nSort entries by date ascending.\nNumber each line sequentially in the # column (1, 2, 3, ...).\nReference receipts by line number: any line accompanied by an attached image is noted \"Receipt #N\" in a sub-line under the merchant or in a final notes column. The pipeline attaches images separately; in your text, reference embedded receipts as: \"Line N — see Receipt #N\" wherever ambiguity matters.\nSubtotal row using class \"subtotal-row\":\n  Total Expenses (in submission currency): $[sum of amounts converted to submission currency if multi-currency, or sum of all amounts if single-currency]"
      },
      {
        "key": "mileage",
        "label": "Mileage",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "MILEAGE: ONLY emit if mileage_entries input is non-empty. <table class=\"fin-table\"> with columns: Date | From | To | Miles | Rate | Amount. Parse mileage_entries as pipe-separated. Compute Amount = Miles × mileage_rate_per_mile. If a per-line rate is provided, use it; otherwise use the mileage_rate_per_mile field default (typically $0.67/mile per IRS standard, but use whatever value is provided).\nSubtotal row: \"Total Mileage Reimbursement: $[sum]\".\nNote below the table if relevant: \"Mileage rate of $[rate] per mile reflects [IRS standard for the year / company policy].\""
      },
      {
        "key": "per_diem",
        "label": "Per Diem",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PER DIEM: ONLY emit if both per_diem_days and per_diem_rate are provided and non-zero. Single calculation block:\n  Per Diem Allowance: [per_diem_days] days × $[per_diem_rate]/day = $[total]\n  Per diem covers: meals and incidental expenses. Lodging billed separately as actual expense.\nNote that per diem typically follows the GSA rate for the destination; if the destination has special-rate areas, mention."
      },
      {
        "key": "foreign_currency",
        "label": "Foreign Currency Conversions",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "FOREIGN CURRENCY CONVERSIONS: ONLY emit if foreign_currency_conversions input is non-empty. <table class=\"fin-table\"> with columns: Original Currency | Original Amount | Conversion Date | Rate Used | USD Amount. Parse from input as pipe-separated.\nAfter the table, note the source of exchange rates: \"Exchange rates per [bank rate at time of charge / OANDA midpoint / company-designated rate provider].\" If different rates were used for different lines, note that."
      },
      {
        "key": "summary_totals",
        "label": "Summary and Reimbursement Calculation",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "SUMMARY AND REIMBURSEMENT CALCULATION: Small <table class=\"fin-table\"> with all summable totals:\n  Total Expenses (USD or submission currency): $[X]\n  Total Mileage: $[Y] — only if mileage section present\n  Per Diem: $[Z] — only if per diem section present\n  Foreign currency adjustments: $[A] — only if foreign currency section present, showing net adjustment from any rate differentials\n  ─────\n  Total Submitted: $(X + Y + Z + A)\n  Less: Cash advance received: -$[total_advance_received]\n  ─────\n  Reimbursement Due to [submitter_name]: $[final amount, computed]\nThe \"Reimbursement Due\" line uses class \"total-row\" for emphasis.\nIf total_advance_received exceeds the total submitted (rare but possible), the final line reads: \"Amount Due BACK to Employer: $[difference].\" Handle this case explicitly."
      },
      {
        "key": "attestation_approval",
        "label": "Attestation and Approval",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "ATTESTATION AND APPROVAL: Two attestation paragraphs:\n  Submitter attestation: \"I, [submitter_name], certify that the foregoing expenses were incurred on company business during the period stated, are supported by attached receipts where required by company policy (typically expenses ≥$25), have not been previously submitted for reimbursement, and are accurate to the best of my knowledge. — [submitter_name], [date].\"\n  Manager approval: \"Approved for reimbursement by [manager_approver_name], [date].\" The pipeline renders the formal signature block; do not render signature lines.\nAdd a final compliance note: \"Receipts retained per company record retention policy. Expenses subject to audit. Falsification of expense reports may result in disciplinary action up to and including termination of employment.\"\n\nIf notes input is non-empty, append a brief closing paragraph drawn from notes; one paragraph max, professional tone."
      }
    ]
  },
  "federal-proposal": {
    "deliverable_slug": "federal-proposal",
    "required_fields": [
      {
        "key": "solicitation_number",
        "label": "Solicitation number",
        "type": "text",
        "placeholder": "e.g., W911QY-26-R-0001"
      },
      {
        "key": "solicitation_title",
        "label": "Solicitation title",
        "type": "text",
        "placeholder": "Full title from the solicitation"
      },
      {
        "key": "issuing_agency",
        "label": "Issuing agency and office",
        "type": "text",
        "placeholder": "e.g., Department of Defense, Army Contracting Command"
      },
      {
        "key": "offeror_name",
        "label": "Offeror company name",
        "type": "text",
        "placeholder": "Your full legal entity name"
      },
      {
        "key": "naics_code",
        "label": "NAICS code",
        "type": "text",
        "placeholder": "e.g., 541512"
      },
      {
        "key": "set_aside",
        "label": "Set-aside status",
        "type": "text",
        "placeholder": "e.g., 8(a), SDVOSB, HUBZone, Full and open"
      },
      {
        "key": "technical_approach_summary",
        "label": "Technical approach summary",
        "type": "textarea",
        "placeholder": "Describe your proposed technical approach to fulfilling the requirements..."
      },
      {
        "key": "management_approach_summary",
        "label": "Management approach summary",
        "type": "textarea",
        "placeholder": "How will you manage and staff this contract? Describe your PM methodology and key personnel..."
      },
      {
        "key": "past_performance_summary",
        "label": "Relevant past performance",
        "type": "textarea",
        "placeholder": "Describe 3-5 relevant contracts you have performed, including agency, value, and outcomes..."
      }
    ],
    "optional_fields": [
      {
        "key": "cage_code",
        "label": "CAGE code",
        "type": "text",
        "placeholder": "e.g., 1ABC2"
      },
      {
        "key": "duns_uei",
        "label": "UEI number",
        "type": "text",
        "placeholder": "Your SAM.gov Unique Entity Identifier"
      },
      {
        "key": "contract_type",
        "label": "Contract type",
        "type": "text",
        "placeholder": "e.g., FFP, T&M, CPFF, IDIQ"
      },
      {
        "key": "period_of_performance",
        "label": "Period of performance",
        "type": "text",
        "placeholder": "e.g., 1 base year + 4 option years"
      },
      {
        "key": "teaming_partners",
        "label": "Teaming partners or subcontractors",
        "type": "textarea",
        "placeholder": "Names, roles, and relevant qualifications of team members..."
      },
      {
        "key": "key_personnel",
        "label": "Key personnel",
        "type": "textarea",
        "placeholder": "Names, titles, clearances, and qualifications of key personnel..."
      },
      {
        "key": "certifications",
        "label": "Relevant certifications",
        "type": "textarea",
        "placeholder": "e.g., CMMI Level 3, ISO 27001, FedRAMP"
      },
      {
        "key": "proposal_due_date",
        "label": "Proposal due date",
        "type": "date"
      },
      {
        "key": "page_limit",
        "label": "Page limit from solicitation",
        "type": "text",
        "placeholder": "e.g., Technical volume: 50 pages"
      },
      {
        "key": "evaluation_criteria",
        "label": "Evaluation criteria",
        "type": "textarea",
        "placeholder": "List the evaluation factors and their relative importance from the solicitation..."
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload the solicitation document (RFP/RFQ/RFI)",
        "required": true
      },
      {
        "kind": "reference_doc",
        "label": "Upload any amendments, Q&A documents, or attachments",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload resumes of key personnel",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload past performance documentation (CPARs, references)",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload company brand guidelines or proposal template (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "cover_letter",
        "label": "Cover Letter",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Professional cover letter on company letterhead addressed to the contracting officer. Summarize the proposal and express commitment."
      },
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 300,
        "max_words": 700,
        "instructions": "Compelling summary of the entire proposal. Clearly articulate understanding of the requirement, solution overview, key discriminators, and relevant experience. Ghost the competition where appropriate."
      },
      {
        "key": "technical_approach",
        "label": "Technical Approach",
        "required": true,
        "min_words": 800,
        "max_words": 3000,
        "instructions": "Detailed technical solution mapped to PWS/SOW requirements. Demonstrate understanding of the problem, describe methodology, tools, and innovation. Include workflow diagrams and traceability to requirements."
      },
      {
        "key": "management_approach",
        "label": "Management Approach",
        "required": true,
        "min_words": 500,
        "max_words": 1500,
        "instructions": "Project management methodology, organizational structure, communication plan, risk management, and quality control processes. Include org chart."
      },
      {
        "key": "staffing_plan",
        "label": "Staffing Plan",
        "required": true,
        "min_words": 300,
        "max_words": 800,
        "instructions": "Key personnel qualifications, staffing levels by labor category, surge capability, and retention strategy. Reference resumes in appendix."
      },
      {
        "key": "past_performance",
        "label": "Past Performance",
        "required": true,
        "min_words": 400,
        "max_words": 1200,
        "instructions": "3-5 relevant past performance references with contract details, scope, outcomes, and relevance to current requirement. Emphasize similar size, scope, and complexity."
      },
      {
        "key": "quality_assurance",
        "label": "Quality Assurance",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "QA/QC processes, metrics, continuous improvement methodology, and how quality will be measured and reported."
      },
      {
        "key": "transition_plan",
        "label": "Transition Plan",
        "required": false,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Phase-in and phase-out plan ensuring minimal disruption. Include knowledge transfer, staffing ramp-up timeline, and risk mitigation during transition."
      },
      {
        "key": "pricing_volume",
        "label": "Pricing Volume",
        "required": true,
        "min_words": 100,
        "max_words": 400,
        "instructions": "Pricing narrative explaining the basis of estimate, labor rate rationale, and cost assumptions. Reference detailed pricing tables in appendix."
      },
      {
        "key": "compliance_matrix",
        "label": "Compliance Matrix",
        "required": true,
        "min_words": 100,
        "max_words": 500,
        "instructions": "Traceability matrix mapping each solicitation requirement to the proposal section where it is addressed, with compliance status."
      },
      {
        "key": "appendices",
        "label": "Appendices",
        "required": false,
        "min_words": 50,
        "max_words": 500,
        "instructions": "Supporting materials including resumes, certifications, letters of commitment from teaming partners, and detailed pricing tables."
      }
    ]
  },
  "fsr": {
    "deliverable_slug": "fsr",
    "required_fields": [
      {
        "key": "work_order_number",
        "label": "Work Order number",
        "type": "text",
        "help": "WO reference from CMMS or dispatch system."
      },
      {
        "key": "site_name",
        "label": "Site name",
        "type": "text"
      },
      {
        "key": "site_address",
        "label": "Site address",
        "type": "text"
      },
      {
        "key": "customer_contact_onsite",
        "label": "Customer contact on site",
        "type": "text",
        "help": "Name and role of the person who met the technician."
      },
      {
        "key": "visit_date",
        "label": "Visit date",
        "type": "date"
      },
      {
        "key": "arrival_time",
        "label": "Arrival time (24hr)",
        "type": "text",
        "placeholder": "09:15"
      },
      {
        "key": "departure_time",
        "label": "Departure time (24hr)",
        "type": "text",
        "placeholder": "11:30"
      },
      {
        "key": "technician_name",
        "label": "Technician name",
        "type": "text"
      },
      {
        "key": "equipment_asset_id",
        "label": "Equipment asset ID (CMMS tag)",
        "type": "text"
      },
      {
        "key": "equipment_make_model",
        "label": "Equipment make and model",
        "type": "text"
      },
      {
        "key": "issue_reported",
        "label": "Issue reported",
        "type": "textarea",
        "help": "What the customer reported. Verbatim or close paraphrase."
      },
      {
        "key": "work_performed",
        "label": "Work performed (chronological)",
        "type": "textarea",
        "help": "Time-stamped log of actions taken. Use 24-hour time."
      },
      {
        "key": "warranty_status",
        "label": "Warranty status",
        "type": "select",
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
        "key": "time_on_site_hours",
        "label": "Time on site (hours)",
        "type": "number",
        "help": "For billing and SLA verification. Should equal departure − arrival."
      },
      {
        "key": "follow_up_required",
        "label": "Follow-up required",
        "type": "select",
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
      }
    ],
    "optional_fields": [
      {
        "key": "technician_license_number",
        "label": "Technician license / certification number",
        "type": "text",
        "help": "For regulated trades (EPA 608, low-voltage, etc)."
      },
      {
        "key": "equipment_serial_number",
        "label": "Equipment serial number",
        "type": "text"
      },
      {
        "key": "pre_work_readings",
        "label": "Pre-work readings (optional)",
        "type": "textarea",
        "help": "Each line: parameter | reading | normal range."
      },
      {
        "key": "parts_used",
        "label": "Parts used",
        "type": "textarea",
        "help": "Each line: part name | part number | qty | unit cost."
      },
      {
        "key": "post_work_readings",
        "label": "Post-work readings (optional)",
        "type": "textarea",
        "help": "Same format as pre-work readings."
      },
      {
        "key": "safety_observations",
        "label": "Safety observations",
        "type": "textarea",
        "help": "LOTO usage, PPE, near-misses."
      },
      {
        "key": "compliance_code",
        "label": "Regulatory compliance code",
        "type": "text",
        "help": "EPA Section 608, NFPA 25, ASHRAE 15, etc."
      },
      {
        "key": "customer_concerns_other",
        "label": "Additional customer concerns (out of scope)",
        "type": "textarea",
        "help": "Items mentioned by customer outside this work order. Triggers separate ticketing."
      },
      {
        "key": "pm_recommendations",
        "label": "Preventive maintenance recommendations",
        "type": "textarea"
      },
      {
        "key": "customer_signature_name",
        "label": "Customer sign-off — printed name",
        "type": "text"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "site_photo",
        "label": "Site photos (recommended — multiple allowed)",
        "required": false,
        "multiple": true,
        "accepts": "image/*"
      },
      {
        "kind": "reference_doc",
        "label": "Work order or job ticket (optional)",
        "required": false,
        "accepts": "application/pdf,.docx,.doc,image/*"
      },
      {
        "kind": "equipment_photo",
        "label": "Equipment / asset photos (optional)",
        "required": false,
        "multiple": true,
        "accepts": "image/*"
      }
    ],
    "sections": [
      {
        "key": "cover",
        "label": "Cover Page",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Technical field-report. Factual, chronological, specific. Written for two audiences: a supervisor who wasn't there and needs to understand what happened, and a property manager who needs to verify billing, SLA compliance, and regulatory documentation. Use 24-hour time throughout. Use the technician's name in third person (\"Technician arrived...\", \"[name] performed...\"). Past tense for actions taken; present tense only for observed final state.\n\nDO NOT soften observations. State objective conditions:\n  WRONG: \"The unit seems to be working better now.\"\n  CORRECT: \"Unit operating within manufacturer-specified parameters at departure.\"\n  WRONG: \"I went to the site and found some issues.\"\n  CORRECT: \"Arrived 09:15. Observed fault code E14 on primary controller.\"\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n500–1200 words. Field reports favor specificity over verbosity. Length should follow the complexity of the visit. A simple reset call may be 400 words; a multi-fault diagnostic call with parts replacement may be 1000.\n\nCOVER PAGE: write this section per the document type's standard structure."
      },
      {
        "key": "visit_summary",
        "label": "Visit Summary",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "VISIT SUMMARY: One paragraph (3–5 sentences). Format: \"Work Order [work_order_number] — [site_name]. Technician [technician_name] performed service on [visit_date], arriving at [arrival_time] and departing at [departure_time] (total time on site: [computed]). Customer contact on site: [customer_contact_onsite]. Outcome: [one-sentence summary tied to follow_up_required selection — 'No follow-up required; equipment operating normally' / 'Parts ordered; return visit pending receipt' / 'Issue requires escalation; details below'].\""
      },
      {
        "key": "equipment_identification",
        "label": "Equipment Identification",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EQUIPMENT IDENTIFICATION: Render as a definition list or labeled lines:\n  Asset ID: [equipment_asset_id]\n  Make/Model: [equipment_make_model]\n  Serial Number: [equipment_serial_number] (if provided; omit line if not)\n  Service History: brief one-line note if relevant (e.g., \"Last serviced [date]\" if data available; otherwise \"Not available in this report\").\n  Warranty Status: [warranty_status human-readable form — In Warranty / Out of Warranty / Warranty Claim Submitted / Not Applicable]"
      },
      {
        "key": "issue_description",
        "label": "Issue Description and Pre-Work State",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ISSUE DESCRIPTION AND PRE-WORK STATE: Two distinct sub-paragraphs:\n  Sub-paragraph 1 — Issue Reported: Verbatim or close paraphrase of issue_reported input. Frame as: \"Customer report: [issue].\" If multiple issues reported, number them.\n  Sub-paragraph 2 — Pre-Work State (if pre_work_readings provided): \"On arrival, the following readings were observed:\" followed by a structured list (Parameter | Reading | Normal Range or Manufacturer Spec). Format: \"Suction pressure: 47 psig (normal: 40–55 psig). Discharge pressure: 235 psig (normal: 200–260 psig). Fault code: E14 (Primary controller / sensor mismatch).\" If no pre_work_readings, state \"Pre-work readings not taken; proceeded directly to issue verification.\""
      },
      {
        "key": "work_performed",
        "label": "Work Performed",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "WORK PERFORMED: Chronological narrative with specific times throughout, drawn from work_performed input. Each step on its own line or in a tight numbered list. Include precise terminology, manufacturer terms, fault codes, manufacturer procedures referenced. Example tone:\n  \"09:15 — Arrived on site. Met customer contact [customer_contact_onsite]. Reviewed issue: barrier intermittently failing to raise.\n  09:20 — Verified fault code E14 on primary controller display.\n  09:25 — Performed Lockout/Tagout on lane 3 power per company procedure. PPE worn: cut-resistant gloves, safety glasses.\n  09:35 — Opened controller cabinet. Verified power present, all connections intact.\n  09:42 — Performed controller reset per manufacturer procedure (SKIDATA M-Series Service Manual section 4.2 'Cold Reset').\n  09:48 — Fault cleared; controller display reads READY.\n  09:50–10:20 — Verified operation through 3 consecutive cycle tests using test ticket. All cycles completed within manufacturer time spec (≤ 4.5 seconds raise, ≤ 4.5 seconds lower).\n  10:25 — Removed Lockout/Tagout. Verified amperage draw at 4.2A (normal: 4.0–4.5A under load).\n  10:35 — Verified operation with live ticket from customer-supplied test card. Confirmed fee acceptance and barrier raise within spec.\"\nEach action: what was done, what component was touched, what was observed, in what time. Use precise nouns (\"controller\", \"limit switch\", \"loop detector\"), not generic ones (\"the thing\")."
      },
      {
        "key": "parts_materials",
        "label": "Parts and Materials",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PARTS AND MATERIALS: If parts_used input is non-empty, render as a <table> with columns: Part Name | Part Number | Quantity | Unit Cost | Extended Cost. Compute Extended = Quantity × Unit Cost. Subtotal row at the bottom. If no parts, state explicitly: \"No parts used. No material costs incurred.\""
      },
      {
        "key": "post_work_state",
        "label": "Post-Work State and Verification",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "POST-WORK STATE AND VERIFICATION: If post_work_readings provided, render as a structured list (Parameter | Reading | Normal Range). Compare to pre-work where possible: \"Suction pressure pre-work: 47 psig; post-work: 49 psig (within spec). Fault code pre-work: E14; post-work: NONE.\" Then verification testing performed: number of cycles, manufacturer-spec compliance, customer demonstration if applicable. Final operational status as one of:\n  - \"Operating normally. All readings within manufacturer specifications. Unit returned to service.\"\n  - \"Operating with limitations: [specific limitations]. Customer notified.\"\n  - \"Not operating; awaiting parts. Unit out of service. ETA per parts order.\"\n  - \"Operational with temporary repair. Permanent repair scheduled per Follow-Up section.\""
      },
      {
        "key": "safety_compliance",
        "label": "Safety and Compliance",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "SAFETY AND COMPLIANCE: If safety_observations provided, render as a list of observed conditions and actions taken. Always include these standard items even if no specific input:\n  Lockout/Tagout: [used / not required for this work]\n  PPE worn: [appropriate to task — list]\n  Near-misses or unsafe conditions observed: [from input or \"None\"]\nIf compliance_code input is provided (e.g., \"EPA Section 608\", \"NFPA 25\", \"ASHRAE 15\"), state: \"Work performed in compliance with [compliance_code]. Technician certification: [technician_license_number if provided, otherwise 'on file with employer'].\" If no compliance code, state \"No specific regulatory code applicable to this work.\""
      },
      {
        "key": "photos",
        "label": "Photos and Documentation",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PHOTOS AND DOCUMENTATION: This section is fixed by the pipeline (the renderer attaches uploaded images). In your generated text, reference embedded images by their figure number as appropriate (e.g., \"as shown in Figure 1\"). Each photo caption format must be: \"[Figure N]: [what photo shows] [Before/During/After].\" If no photos provided in this submission, state: \"No photos attached for this visit.\""
      },
      {
        "key": "customer_concerns",
        "label": "Additional Customer Concerns",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ADDITIONAL CUSTOMER CONCERNS: ONLY emit if customer_concerns_other input is non-empty. Lead with: \"During the visit, the customer mentioned the following items outside the scope of Work Order [work_order_number]:\" Then numbered list of items. End with: \"These items have been logged for separate ticket creation. No work was performed on these items under this work order.\""
      },
      {
        "key": "recommendations_followup",
        "label": "Recommendations and Follow-Up",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "RECOMMENDATIONS AND FOLLOW-UP: If pm_recommendations is provided, list as numbered preventive maintenance recommendations with target intervals (e.g., \"Replace primary controller battery — recommended at next 6-month PM cycle\"). Then follow_up_required statement based on selection:\n  - 'none': \"No follow-up required. Equipment operating normally; next scheduled service per maintenance contract.\"\n  - 'parts-order': \"Follow-up required: parts on order. Parts: [list from parts_used or notes]. ETA: [if known]. Return visit will be scheduled upon parts receipt.\"\n  - 'return-visit': \"Follow-up required: return visit. Reason: [from notes]. Recommended timeframe: [based on issue urgency].\"\n  - 'escalation': \"Follow-up required: escalation. This issue exceeds the scope of this work order and requires [engineering review / vendor support / supervisor disposition]. Escalated to [contact] on [date].\"\nEnd with: \"Warranty status confirmed at time of service: [warranty_status].\""
      },
      {
        "key": "attestation_signoff",
        "label": "Attestation and Customer Sign-Off",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "ATTESTATION AND CUSTOMER SIGN-OFF: Two attestation paragraphs:\n  Technician attestation: \"I, [technician_name], certify that the foregoing is an accurate and complete account of the work performed on [visit_date] under Work Order [work_order_number]. License/Certification: [technician_license_number if provided, otherwise 'on file with employer']. — [Date].\"\n  Customer sign-off: \"Customer acknowledges that the work described above was performed and accepts the work as described, pending any items noted under Recommendations and Follow-Up. Acknowledged by [customer_signature_name if provided, otherwise blank line].\" The pipeline renders the formal signature block; do not render signature lines."
      }
    ]
  },
  "incident-report": {
    "deliverable_slug": "incident-report",
    "required_fields": [
      {
        "key": "incident_date",
        "label": "Incident date",
        "type": "date"
      },
      {
        "key": "incident_time",
        "label": "Incident time (24hr)",
        "type": "text",
        "placeholder": "14:27"
      },
      {
        "key": "location",
        "label": "Location",
        "type": "text"
      },
      {
        "key": "severity",
        "label": "Severity classification",
        "type": "select",
        "help": "Drives reporting obligations and report scope.",
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
        ]
      },
      {
        "key": "reporter_name",
        "label": "Reporter name",
        "type": "text"
      },
      {
        "key": "reporter_role",
        "label": "Reporter role",
        "type": "text"
      },
      {
        "key": "incident_description",
        "label": "Incident description (chronological)",
        "type": "textarea"
      },
      {
        "key": "immediate_actions_taken",
        "label": "Immediate actions taken (at the scene)",
        "type": "textarea"
      },
      {
        "key": "notifications_made",
        "label": "Notifications made",
        "type": "textarea",
        "help": "who | when | by whom | method (911, supervisor, customer, regulator)"
      },
      {
        "key": "contributing_factors",
        "label": "Contributing factors (categorized)",
        "type": "textarea",
        "help": "human | environmental | equipment | procedural — be specific"
      },
      {
        "key": "corrective_actions_immediate",
        "label": "Corrective actions — immediate (already taken)",
        "type": "textarea"
      },
      {
        "key": "investigation_status",
        "label": "Investigation status",
        "type": "select",
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
        "key": "preparer_name",
        "label": "Preparer name",
        "type": "text"
      }
    ],
    "optional_fields": [
      {
        "key": "injured_persons",
        "label": "Injured persons (one per line)",
        "type": "textarea",
        "help": "name | employer/role | injury type | body part | treatment | RTW status"
      },
      {
        "key": "witnesses",
        "label": "Witnesses (one per line)",
        "type": "textarea",
        "help": "name | contact | when statement taken | statement summary"
      },
      {
        "key": "other_persons_involved",
        "label": "Other persons involved (one per line)",
        "type": "textarea",
        "help": "name | role/employer | involvement"
      },
      {
        "key": "property_damage",
        "label": "Property damage",
        "type": "textarea",
        "help": "assets affected | estimated repair | business interruption"
      },
      {
        "key": "environmental_impact",
        "label": "Environmental impact",
        "type": "textarea",
        "help": "substance | quantity | containment status | regulatory threshold"
      },
      {
        "key": "equipment_involved",
        "label": "Equipment involved",
        "type": "textarea",
        "help": "equipment | inspection status | last maintenance | fault codes"
      },
      {
        "key": "root_cause_hypothesis",
        "label": "Root cause hypothesis (preliminary)",
        "type": "textarea",
        "help": "Will be clearly labeled as preliminary in the report."
      },
      {
        "key": "corrective_actions_interim",
        "label": "Corrective actions — interim (in progress)",
        "type": "textarea",
        "help": "action | owner | due date — one per line"
      },
      {
        "key": "corrective_actions_long_term",
        "label": "Corrective actions — long-term (systemic)",
        "type": "textarea"
      },
      {
        "key": "regulatory_reports_required",
        "label": "Regulatory reports required",
        "type": "textarea",
        "help": "e.g., \"OSHA 300 log entry\", \"EPA 24-hr release\", \"State DEP notification\""
      },
      {
        "key": "reviewer_name",
        "label": "Reviewer name (if applicable)",
        "type": "text"
      },
      {
        "key": "approver_name",
        "label": "Approver name (if applicable)",
        "type": "text"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "site_photo",
        "label": "Scene / damage / evidence photos (required if available — strongly recommended)",
        "required": false,
        "multiple": true,
        "accepts": "image/*"
      },
      {
        "kind": "reference_doc",
        "label": "Witness statements, prior incident logs (optional)",
        "required": false,
        "multiple": true,
        "accepts": "application/pdf,.docx,.doc,image/*"
      }
    ],
    "sections": [
      {
        "key": "cover",
        "label": "Cover Page",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Objective, chronological, factual. Written for legal, insurance, and regulatory review. Past tense exclusively. Do NOT assign fault. Do NOT speculate beyond evidence. State preliminary findings clearly as preliminary. Use 24-hour time. Avoid emotional, dramatic, or subjective language; this report becomes evidence.\n\nWRONG: \"It was a really scary situation when the sprinklers suddenly went off and everyone was in a panic.\"\nCORRECT: \"At 14:27, water began discharging from the overhead sprinkler in Conference Room B. Building occupants were evacuated by 14:35. Fire suppression was contacted at 14:29.\"\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n1500–2500 words. Severity-driven. Near-miss reports may be at the low end (1000–1500 words); fatality reports require comprehensive documentation (2500+).\n\nCOVER PAGE: write this section per the document type's standard structure."
      },
      {
        "key": "incident_summary",
        "label": "Incident Summary",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "INCIDENT SUMMARY: One paragraph (4–6 sentences). State: what occurred, when (incident_date and incident_time), where (location), who was involved (counts only — details in later sections), severity classification, and a single-sentence outcome (\"No injuries; property damage estimated at $X\" / \"Two persons sustained injuries; one transported for treatment\" / \"Fatality; OSHA notified within 8 hours\")."
      },
      {
        "key": "severity_classification",
        "label": "Severity Classification and Reporting Obligations",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "SEVERITY CLASSIFICATION AND REPORTING OBLIGATIONS: Lead with severity from selection in human-readable form:\n  - 'near-miss': \"Severity: Near-Miss. No injury, no property damage; conditions present that could have caused harm.\"\n  - 'first-aid': \"Severity: First-Aid Case. Minor injury treated at the scene; no medical professional involvement required.\"\n  - 'recordable-injury': \"Severity: Recordable Injury (per OSHA 29 CFR 1904).\"\n  - 'lost-time-injury': \"Severity: Lost-Time Injury. Time away from work resulting from incident.\"\n  - 'fatality': \"Severity: FATALITY.\"\n  - 'property-damage-only': \"Severity: Property Damage Only. No injury sustained.\"\n  - 'environmental-release': \"Severity: Environmental Release. Substance released to environment; regulatory notification may be required.\"\n  - 'security-incident': \"Severity: Security Incident.\"\nThen triggered reporting obligations from regulatory_reports_required input. Add these standard reminders based on severity:\n  - If 'fatality' or 'lost-time-injury' with inpatient hospitalization or amputation: \"OSHA 29 CFR 1904.39 requires notification within 8 hours for fatality, within 24 hours for inpatient hospitalization, amputation, or eye loss. Reporting to OSHA Area Office or 1-800-321-OSHA.\"\n  - If 'recordable-injury': \"Must be entered on OSHA 300 log within 7 calendar days.\"\n  - If 'environmental-release': \"State and federal environmental agencies may require notification depending on substance type, quantity, and jurisdiction. Verify reporting thresholds for the specific substance and jurisdiction.\"\nIf reports already submitted, note dates. If pending, note responsible party and due date drawn from regulatory_reports_required input."
      },
      {
        "key": "detailed_description",
        "label": "Detailed Description",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "DETAILED DESCRIPTION: Chronological narrative drawn from incident_description input. Specific times. Specific actions. Specific observations. Past tense. Use 24-hour time. Each event on its own line or in a tight paragraph. Example structure:\n  \"At [time], [observed event]. [Person or role] [observed/responded by]. At [time], [next event]. [Outcome at this point].\"\nAvoid: \"It was [emotional descriptor].\" Avoid: assumptions about cause. Stick to what was observed, by whom, and when."
      },
      {
        "key": "persons_involved",
        "label": "Persons Involved",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PERSONS INVOLVED: Three sub-sections rendered as <h3>:\n  <h3>Injured Persons</h3> — list from injured_persons input parsed as \"name | employer/role | injury type | body part | treatment received | RTW status\". One person per entry. If empty, omit this sub-section entirely (or state \"No persons injured\").\n  <h3>Witnesses</h3> — list from witnesses input parsed as \"name | contact | when statement taken | statement summary\". If empty, omit.\n  <h3>Other Persons Involved</h3> — list from other_persons_involved input. Employees, contractors, visitors, members of the public. If empty, omit."
      },
      {
        "key": "injury_details",
        "label": "Injury Details",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "INJURY DETAILS: ONLY emit if injured_persons input is non-empty. For each injured person, structured detail block:\n  Identifier: [name or anonymized identifier per privacy requirements]\n  Role/Employer: [from input]\n  Injury type and severity: [from input — abrasion, laceration, fracture, burn, etc.]\n  Body part affected: [from input]\n  Treatment received: [from input — first aid only / outpatient medical / hospitalization / fatality]\n  Return-to-work status: [from input — full duty / restricted duty / off work / not yet determined / N/A]\nEnd with: \"Injury details documented based on information available at time of report. Subject to revision upon completion of medical treatment and reporting.\""
      },
      {
        "key": "damage_environmental",
        "label": "Damage and Environmental Impact",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "DAMAGE AND ENVIRONMENTAL IMPACT: Two sub-headings:\n  <h3>Property Damage</h3> — only emit if property_damage input provided. Assets affected, estimated repair cost, business interruption hours/days, current containment status. State estimates as estimates: \"Repair cost estimated at $[range]. Final cost subject to detailed assessment.\"\n  <h3>Environmental Impact</h3> — only emit if environmental_impact input provided. Substance type, quantity released, containment status, regulatory threshold reached or not. If threshold reached, name the regulation (e.g., \"CERCLA reportable quantity exceeded for [substance]: [amount] vs threshold [amount]\")."
      },
      {
        "key": "equipment_involved",
        "label": "Equipment Involved",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EQUIPMENT INVOLVED: ONLY emit if equipment_involved input non-empty. For each piece of equipment: description, inspection/maintenance status at time of incident, fault codes or condition observations, manufacturer and date of last service if known. Note whether equipment is preserved for investigation: \"Equipment secured for investigation; available for inspection by [parties].\""
      },
      {
        "key": "immediate_response",
        "label": "Immediate Response and Notifications",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "IMMEDIATE RESPONSE AND NOTIFICATIONS: Two distinct sub-sections rendered as <h3>:\n  <h3>Immediate Actions Taken</h3> — chronological list drawn from immediate_actions_taken input. What was done at the scene, with times where available. Evacuation, first aid, isolation of the area, shutdown procedures, contacting emergency services.\n  <h3>Notifications Log</h3> — render as a <table> with columns: Notified Party | Date/Time | Notified By | Method (phone, email, in-person, automated alert). Parsed from notifications_made input. Examples: 911, supervisor, building management, customer, regulator, insurance carrier, legal counsel."
      },
      {
        "key": "witnesses_statements",
        "label": "Witnesses and Statements",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "WITNESSES AND STATEMENTS: ONLY emit if witnesses input non-empty. For each witness: name (or anonymized identifier if privacy required), contact information (or \"on file with [preparer_name]\" if disclosure not appropriate), when the statement was taken and by whom, and a statement summary in third-person (\"Witness reports observing X at approximately Y time\"). Direct quotes only if recorded verbatim. End with: \"Statements recorded based on best recollection of witness at time of interview. Original notes/recordings retained per [retention policy].\""
      },
      {
        "key": "photos",
        "label": "Photos and Documentation",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PHOTOS AND DOCUMENTATION: This section is fixed by the pipeline (renderer attaches uploaded images). Reference embedded images by caption: \"[Figure N]: [what shown] [time taken if known] [taken by].\" For serious incidents (lost-time-injury, fatality, environmental-release), include chain-of-custody language: \"Photos taken by [name] using [device]; original files retained in [secure storage]; copies stored in incident file.\""
      },
      {
        "key": "contributing_factors",
        "label": "Contributing Factors",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "CONTRIBUTING FACTORS: Categorized list drawn from contributing_factors input. Render as <h3> sub-sections:\n  <h3>Human Factors</h3> — training adequacy, fatigue, distraction, communication breakdowns, complacency. Be specific: \"Operator was on hour 11 of a 12-hour shift\" not \"fatigue may have been a factor\".\n  <h3>Environmental Factors</h3> — lighting, weather, noise, layout, temperature, time of day.\n  <h3>Equipment Factors</h3> — failure mode, design, maintenance status, age, manufacturer recall status.\n  <h3>Procedural Factors</h3> — was a procedure in place; was it followed; was it adequate; was training current.\nBe specific. Generic factors (\"fatigue\", \"distraction\") do not aid prevention. Sub-sections may be omitted if no factors in that category."
      },
      {
        "key": "root_cause",
        "label": "Root Cause Hypothesis",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ROOT CAUSE HYPOTHESIS: ONLY emit if root_cause_hypothesis input is provided. Lead with bold: \"PRELIMINARY ROOT CAUSE — SUBJECT TO ONGOING INVESTIGATION.\" State the hypothesis. State evidence supporting it. State evidence contradicting it (or \"None identified at this time\"). State limitations of preliminary analysis (incomplete information, pending witness interviews, equipment under inspection). End with: \"Final root cause determination will be made upon completion of investigation. This preliminary hypothesis may be revised or replaced based on subsequent findings. Investigation status: [investigation_status].\""
      },
      {
        "key": "corrective_actions",
        "label": "Corrective Actions",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "CORRECTIVE ACTIONS: Three sub-sections rendered as <h3>:\n  <h3>Immediate Actions (Already Taken)</h3> — list from corrective_actions_immediate. Specific, action-oriented. \"Sprinkler head replaced. Conference room dried and ceiling tiles replaced. Building manager briefed.\"\n  <h3>Interim Actions (In Progress)</h3> — only if corrective_actions_interim input provided. Render as table: Action | Owner | Due Date.\n  <h3>Long-Term Actions</h3> — only if corrective_actions_long_term input provided. Systemic improvements: training, policy changes, equipment upgrades. Each action specific and assignable."
      },
      {
        "key": "attestation_signoff",
        "label": "Attestation and Sign-Off Chain",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "ATTESTATION AND SIGN-OFF CHAIN: Three attestation lines:\n  Preparer: \"I, [preparer_name], prepared this report based on information available as of [report date]. To the best of my knowledge, the foregoing is accurate.\"\n  Reviewer line if reviewer_name provided: \"Reviewed by [reviewer_name] on [date].\" (If pending: \"Pending review by [reviewer_name]\")\n  Approver line if approver_name provided: \"Approved by [approver_name] on [date].\" (If pending: \"Pending approval by [approver_name]\")\nEnd with: \"This report may contain preliminary information subject to revision as investigation continues. This document is prepared in the ordinary course of safety operations and is intended for internal use, regulatory submission as required, and protection of the parties' rights.\""
      }
    ]
  },
  "investor-memo": {
    "deliverable_slug": "investor-memo",
    "required_fields": [
      {
        "key": "target_company",
        "label": "Target company name",
        "type": "text",
        "placeholder": "Company being evaluated for investment"
      },
      {
        "key": "sector",
        "label": "Sector / industry",
        "type": "text",
        "placeholder": "e.g., Enterprise SaaS, Healthcare, Consumer Fintech"
      },
      {
        "key": "deal_type",
        "label": "Deal type",
        "type": "text",
        "placeholder": "e.g., Series A equity, Growth equity, Acquisition, Debt"
      },
      {
        "key": "investment_thesis",
        "label": "Investment thesis",
        "type": "textarea",
        "placeholder": "Why is this an attractive investment? What is the core thesis driving the opportunity?"
      },
      {
        "key": "financial_overview",
        "label": "Financial overview",
        "type": "textarea",
        "placeholder": "Key financial metrics: revenue, growth rate, margins, burn rate, valuation, and proposed terms..."
      },
      {
        "key": "risk_factors",
        "label": "Key risk factors",
        "type": "textarea",
        "placeholder": "What are the primary risks to this investment? Market, execution, competitive, regulatory..."
      }
    ],
    "optional_fields": [
      {
        "key": "fund_name",
        "label": "Fund / firm name",
        "type": "text",
        "placeholder": "e.g., Apollo Ventures Fund III"
      },
      {
        "key": "deal_size",
        "label": "Proposed investment size",
        "type": "text",
        "placeholder": "e.g., $5M for 15% equity"
      },
      {
        "key": "valuation",
        "label": "Valuation",
        "type": "text",
        "placeholder": "e.g., $30M pre-money"
      },
      {
        "key": "comparable_transactions",
        "label": "Comparable transactions",
        "type": "textarea",
        "placeholder": "Recent comparable deals, acquisitions, or funding rounds in the sector..."
      },
      {
        "key": "management_assessment",
        "label": "Management team assessment",
        "type": "textarea",
        "placeholder": "Quality of management team, track record, and any concerns..."
      },
      {
        "key": "due_diligence_status",
        "label": "Due diligence status",
        "type": "textarea",
        "placeholder": "What DD has been completed? What remains?"
      },
      {
        "key": "exit_scenarios",
        "label": "Expected exit scenarios",
        "type": "textarea",
        "placeholder": "Potential exit paths, timeline, and expected returns..."
      },
      {
        "key": "investment_committee_date",
        "label": "Investment committee date",
        "type": "date"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "financial_data",
        "label": "Upload financial statements, models, or cap tables",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload pitch decks, info memos, or data room documents",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload comparable analysis or market research",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload firm brand guidelines or memo template (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "investment_thesis",
        "label": "Investment Thesis",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Clear articulation of why this investment is attractive. Cover the core thesis, key value drivers, and expected return profile."
      },
      {
        "key": "company_overview",
        "label": "Company Overview",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Company background, founding story, product/service description, business model, and current stage of development."
      },
      {
        "key": "market_opportunity",
        "label": "Market Opportunity",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "TAM/SAM/SOM analysis, market dynamics, growth drivers, and the company's positioning within the market."
      },
      {
        "key": "financial_analysis",
        "label": "Financial Analysis",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Detailed financial review covering historical performance, unit economics, projections, and key assumptions. Include revenue model analysis."
      },
      {
        "key": "valuation",
        "label": "Valuation Analysis",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Valuation methodology, comparable analysis, implied multiples, and assessment of whether the proposed valuation is fair."
      },
      {
        "key": "risk_factors",
        "label": "Risk Factors",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Comprehensive risk assessment covering market, execution, competitive, financial, and regulatory risks with severity ratings."
      },
      {
        "key": "due_diligence_findings",
        "label": "Due Diligence Findings",
        "required": false,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Summary of completed due diligence including legal, financial, technical, and commercial findings. Flag any material issues."
      },
      {
        "key": "recommendation",
        "label": "Recommendation",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "Clear invest/pass recommendation with key conditions, proposed terms, and critical follow-up items before closing."
      }
    ]
  },
  "investor-update": {
    "deliverable_slug": "investor-update",
    "required_fields": [
      {
        "key": "company_name",
        "label": "Company name",
        "type": "text",
        "placeholder": "Your company name"
      },
      {
        "key": "reporting_period",
        "label": "Reporting period",
        "type": "text",
        "placeholder": "e.g., March 2026, Q1 2026"
      },
      {
        "key": "key_metrics",
        "label": "Key metrics this period",
        "type": "textarea",
        "placeholder": "MRR/ARR, customer count, growth rate, burn rate, runway remaining, and other KPIs you track..."
      },
      {
        "key": "highlights",
        "label": "Top highlights and wins",
        "type": "textarea",
        "placeholder": "What went well this period? Major milestones, customer wins, product launches, partnerships..."
      },
      {
        "key": "challenges",
        "label": "Challenges and learnings",
        "type": "textarea",
        "placeholder": "What was hard? What didn't go as planned? What did you learn?"
      },
      {
        "key": "priorities_next_period",
        "label": "Priorities for next period",
        "type": "textarea",
        "placeholder": "What are the top 3-5 priorities for the coming month or quarter?"
      }
    ],
    "optional_fields": [
      {
        "key": "ceo_name",
        "label": "CEO / sender name",
        "type": "text",
        "placeholder": "Name of the person sending the update"
      },
      {
        "key": "cash_position",
        "label": "Cash position and runway",
        "type": "text",
        "placeholder": "e.g., $1.2M cash, 14 months runway at current burn"
      },
      {
        "key": "burn_rate",
        "label": "Monthly burn rate",
        "type": "text",
        "placeholder": "e.g., $85K/month"
      },
      {
        "key": "product_updates",
        "label": "Product updates",
        "type": "textarea",
        "placeholder": "New features shipped, tech debt addressed, infrastructure changes..."
      },
      {
        "key": "team_updates",
        "label": "Team updates",
        "type": "textarea",
        "placeholder": "New hires, departures, open roles, team size..."
      },
      {
        "key": "fundraising_status",
        "label": "Fundraising status",
        "type": "textarea",
        "placeholder": "If currently raising: status, pipeline, timeline..."
      },
      {
        "key": "asks_of_investors",
        "label": "Asks of investors",
        "type": "textarea",
        "placeholder": "Introductions, advice, resources you need from your investors..."
      },
      {
        "key": "round_info",
        "label": "Current round",
        "type": "text",
        "placeholder": "e.g., Seed, Series A"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "financial_data",
        "label": "Upload financial summary, P&L, or metrics dashboard export",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload prior investor updates for consistency",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload brand guidelines (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "tldr",
        "label": "TL;DR",
        "required": true,
        "min_words": 30,
        "max_words": 100,
        "instructions": "3-5 bullet points capturing the most important updates. Investors should be able to read only this section and know the state of the company."
      },
      {
        "key": "key_metrics",
        "label": "Key Metrics",
        "required": true,
        "min_words": 40,
        "max_words": 150,
        "instructions": "Dashboard-style metrics with current values, month-over-month change, and vs. target. Use a consistent format each period for comparability."
      },
      {
        "key": "milestones",
        "label": "Milestones and Wins",
        "required": true,
        "min_words": 60,
        "max_words": 200,
        "instructions": "Celebrate wins and progress. Include customer logos won, product milestones, partnership announcements, and press coverage."
      },
      {
        "key": "challenges",
        "label": "Challenges",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "Be transparent about what is hard. Investors respect honesty and it builds trust. Frame challenges with what you are doing about them."
      },
      {
        "key": "burn_and_runway",
        "label": "Burn Rate and Runway",
        "required": true,
        "min_words": 30,
        "max_words": 100,
        "instructions": "Current monthly burn, cash in bank, and months of runway. Compare to last period. Flag if runway is below 12 months."
      },
      {
        "key": "product_updates",
        "label": "Product Updates",
        "required": false,
        "min_words": 40,
        "max_words": 150,
        "instructions": "Major features shipped, user feedback incorporated, and upcoming product roadmap items."
      },
      {
        "key": "team_updates",
        "label": "Team Updates",
        "required": false,
        "min_words": 20,
        "max_words": 100,
        "instructions": "New hires with brief intros, departures, current headcount, and open roles you are hiring for."
      },
      {
        "key": "upcoming_priorities",
        "label": "Upcoming Priorities",
        "required": true,
        "min_words": 40,
        "max_words": 150,
        "instructions": "Top 3-5 priorities for the next period. Be specific and measurable so investors can track progress in the next update."
      },
      {
        "key": "asks",
        "label": "Asks",
        "required": false,
        "min_words": 20,
        "max_words": 100,
        "instructions": "Specific, actionable requests of investors. Introductions to specific people, advice on specific topics, or resources needed."
      }
    ]
  },
  "invoice": {
    "deliverable_slug": "invoice",
    "required_fields": [
      {
        "key": "invoice_number",
        "label": "Invoice number",
        "type": "text"
      },
      {
        "key": "statement_type",
        "label": "Statement type",
        "type": "select",
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
        "key": "invoice_date",
        "label": "Invoice date",
        "type": "date"
      },
      {
        "key": "due_date",
        "label": "Due date",
        "type": "date"
      },
      {
        "key": "payment_terms_label",
        "label": "Payment terms label",
        "type": "text",
        "default": "Net 30"
      },
      {
        "key": "currency",
        "label": "Currency",
        "type": "select",
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
        "key": "bill_to_name",
        "label": "Bill to — customer legal name",
        "type": "text"
      },
      {
        "key": "bill_to_address",
        "label": "Bill to — address",
        "type": "textarea"
      },
      {
        "key": "supplier_tax_id",
        "label": "Supplier — tax ID / EIN",
        "type": "text"
      },
      {
        "key": "line_items",
        "label": "Line items (one per line)",
        "type": "textarea",
        "help": "SKU/code | description | quantity | unit price | taxable Y/N"
      },
      {
        "key": "tax_rate_percent",
        "label": "Tax rate (%)",
        "type": "number",
        "default": 0
      },
      {
        "key": "late_payment_interest_percent_monthly",
        "label": "Late payment interest rate (% per month)",
        "type": "number",
        "default": 1.5
      },
      {
        "key": "payment_methods",
        "label": "Payment methods",
        "type": "textarea",
        "help": "ACH/wire details (bank, routing, account, SWIFT), check instructions, online portal."
      },
      {
        "key": "billing_contact_name",
        "label": "Billing contact name (for disputes)",
        "type": "text"
      },
      {
        "key": "billing_contact_email",
        "label": "Billing contact email",
        "type": "text"
      }
    ],
    "optional_fields": [
      {
        "key": "supersedes_invoice_number",
        "label": "Supersedes invoice (if revised)",
        "type": "text"
      },
      {
        "key": "service_period_start",
        "label": "Service period — start",
        "type": "date"
      },
      {
        "key": "service_period_end",
        "label": "Service period — end",
        "type": "date"
      },
      {
        "key": "bill_to_tax_id",
        "label": "Bill to — tax ID / EIN / VAT",
        "type": "text",
        "help": "Customer tax identifier — required by some AP systems."
      },
      {
        "key": "customer_po_number",
        "label": "Customer Purchase Order number",
        "type": "text",
        "help": "Many AP systems reject invoices without PO reference."
      },
      {
        "key": "contract_reference",
        "label": "Contract reference",
        "type": "text",
        "help": "SOW number, MSA number, or contract title."
      },
      {
        "key": "remit_to_name",
        "label": "Remit-to name (if different from supplier)",
        "type": "text"
      },
      {
        "key": "remit_to_address",
        "label": "Remit-to address (if different — lockbox)",
        "type": "textarea"
      },
      {
        "key": "tax_jurisdiction",
        "label": "Tax jurisdiction",
        "type": "text",
        "help": "e.g., \"Massachusetts state + Suffolk county\""
      },
      {
        "key": "discount_type",
        "label": "Discount type",
        "type": "select",
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
        "key": "discount_detail",
        "label": "Discount detail",
        "type": "text"
      },
      {
        "key": "notes",
        "label": "Notes (optional)",
        "type": "textarea"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Prior invoices for line-item / formatting reference (optional)",
        "required": false,
        "multiple": true,
        "accepts": "application/pdf,.docx,.doc"
      }
    ],
    "sections": [
      {
        "key": "header_masthead",
        "label": "Header",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Strictly factual, structured, numeric-first. No pleasantries. No \"thanks for your business.\" No \"we appreciate your prompt payment.\" An invoice is submitted, not signed. AP departments evaluate invoices for completeness; missing details (PO numbers, tax IDs, bank instructions) result in payment delays. Every required AP field appears.\n\nPIPELINE OWNS THE HEADER AND BILL-TO BLOCK. Do NOT emit sections titled \"Invoice Details\", \"Header\", \"Bill To\", \"From\", \"Invoice\", or any heading that duplicates the masthead content. The pipeline renders all invoice metadata (number, statement type, dates, parties, tax IDs) in the dedicated masthead. Start your output directly with the Service Period and Reference section (if any input fields require it) or with Line Items.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\nTable-heavy document. Total prose should be 200–400 words; the line items table is the substance. Do not pad. AP departments value brevity and completeness; verbose invoices are rejected.\n\nHEADER: write this section per the document type's standard structure."
      },
      {
        "key": "bill_to_block",
        "label": "Bill To",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "BILL TO: write this section per the document type's standard structure."
      },
      {
        "key": "service_period_reference",
        "label": "Service Period and Reference",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "SERVICE PERIOD AND REFERENCE: ONLY emit if at least one of these inputs is provided: service_period_start, service_period_end, customer_po_number, contract_reference. Render as a tight definition-list-style block:\n  Service Period: [service_period_start] through [service_period_end] (if both provided; if only one, state \"through [date]\" or \"from [date]\")\n  Customer PO: [customer_po_number] (if provided)\n  Contract Reference: [contract_reference] (if provided)\nIf statement_type is \"revised\", PREPEND a bold notice block as the first content under this section: \"REVISED INVOICE — supersedes Invoice [supersedes_invoice_number]. The prior invoice is null and is replaced by this revised invoice. If the prior invoice was paid, please contact the billing contact below to reconcile.\"\nIf statement_type is \"duplicate\", prepend: \"DUPLICATE COPY — Invoice [invoice_number]. This is a copy of an invoice previously issued. Payment status: please confirm with billing contact below.\"\nIf none of the optional inputs are provided AND statement_type is \"original\", omit this entire section."
      },
      {
        "key": "line_items_table",
        "label": "Line Items",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "LINE ITEMS: <h2>Line Items</h2> followed by a <table>. Columns (in this exact order): SKU/Code | Description | Quantity | Unit Price | Taxable | Amount. Parse each line of line_items input as pipe-separated fields.\nCompute Amount = Quantity × Unit Price.\nFormat ALL currency consistently using currency input — for USD: \"$1,234.56\" with two decimals and thousand separators; for other currencies use the appropriate symbol or three-letter code prefix.\nFor each line, the Taxable column shows \"Yes\" or \"No\" based on the line's taxable flag from input. If a line is non-taxable, its Amount does not contribute to the taxable subtotal.\nAfter the data rows, emit one empty separator row before the section ends. Do NOT include subtotal in this section — that goes in the next section."
      },
      {
        "key": "subtotal_discounts",
        "label": "Subtotal, Discounts, Taxes",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "SUBTOTAL, DISCOUNTS, TAXES: Right-aligned summary block, rendered as a small <table> with right-aligned numeric column. Compute and emit:\n  Subtotal (taxable items): $[sum of taxable lines]\n  Subtotal (non-taxable items): $[sum of non-taxable lines] — only if any non-taxable lines\n  Subtotal (combined): $[sum of all lines]\n  Discount: -$[discount amount] — only if discount_type is provided. Show the description from discount_detail or the human-readable form of discount_type (e.g., \"Early payment discount (2/10 net 30)\").\n  Adjusted Subtotal: $[after discount] — only if discount applied\n  Tax (X%, [tax_jurisdiction if provided]): $[tax_rate_percent × taxable subtotal / 100]\nFormat negatives as -$X or in parentheses ($X) consistent with the rest of the document."
      },
      {
        "key": "total_due",
        "label": "Total Due",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "TOTAL DUE: Single prominent line: \"<strong>Total Due: [currency symbol or code][formatted amount]</strong>\" Format with currency consistency. The line should be visually emphasized via class total-row (the pipeline styles it). Below the total, on a separate line, state the due date: \"Due by [due_date].\""
      },
      {
        "key": "payment_instructions",
        "label": "Payment Instructions",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PAYMENT INSTRUCTIONS: payment_methods input formatted as a clear structured block. If multiple methods are listed (ACH, wire, check, online portal), render each as its own labeled block:\n  <h3>ACH / Wire Transfer</h3>\n  Bank Name: [bank name]\n  Routing Number (ACH): [routing]\n  SWIFT Code (international wire): [SWIFT]\n  Account Number: [account]\n  Beneficiary Name: [supplier or remit_to_name]\n  Reference: Invoice [invoice_number]\n  <h3>Check</h3>\n  Make payable to: [remit_to_name if different, else supplier name]\n  Mail to: [remit_to_address if different, else supplier address]\n  Reference: Invoice [invoice_number]\n  <h3>Online</h3>\n  [URL or instructions if provided]\nIf the supplier has a remit_to_name and remit_to_address that differ from the masthead-rendered supplier identity, surface those clearly as the remit-to."
      },
      {
        "key": "late_payment_terms",
        "label": "Payment Terms",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PAYMENT TERMS: Concise paragraph: \"Payment is due [payment_terms_label] from invoice date ([invoice_date]). Payments not received by [due_date] are considered late. Late payments accrue interest at [late_payment_interest_percent_monthly]% per month, or the maximum permitted by applicable law, whichever is lower.\"\nIf discount_type is \"early-payment-2-10-net-30\": \"Early payment discount: 2% if paid within ten (10) days of invoice date. Otherwise net 30.\"\nEnd with: \"Payment of this invoice does not waive any rights or claims of either party with respect to the underlying goods or services.\""
      },
      {
        "key": "dispute_billing_contact",
        "label": "Billing Contact for Disputes",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "BILLING CONTACT FOR DISPUTES: One paragraph: \"Disputes regarding this invoice must be submitted in writing to [billing_contact_name] at [billing_contact_email] within thirty (30) days of invoice date. Invoices not disputed in writing within thirty (30) days are deemed accepted. If a portion of this invoice is disputed, the undisputed portion remains due on schedule; the disputed portion may be withheld pending resolution. Disputed amounts must be specifically identified and supported by reference to a specific line item or term.\""
      },
      {
        "key": "notes",
        "label": "Notes",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "NOTES: ONLY emit if notes input is non-empty. Single paragraph max, drawn from notes input. Use professional voice; no pleasantries."
      }
    ]
  },
  "legal-memo": {
    "deliverable_slug": "legal-memo",
    "required_fields": [
      {
        "key": "client_name",
        "label": "Client name",
        "type": "text",
        "placeholder": "e.g., Acme Corporation"
      },
      {
        "key": "opposing_party",
        "label": "Opposing party",
        "type": "text",
        "placeholder": "e.g., Beta Industries LLC"
      },
      {
        "key": "jurisdiction",
        "label": "Jurisdiction",
        "type": "text",
        "placeholder": "e.g., Commonwealth of Massachusetts"
      },
      {
        "key": "legal_issue",
        "label": "Core legal issue",
        "type": "textarea",
        "placeholder": "Describe the primary legal question to be analyzed..."
      },
      {
        "key": "relevant_statutes",
        "label": "Relevant statutes or regulations",
        "type": "textarea",
        "placeholder": "List any known statutes, case law, or regulations that apply..."
      },
      {
        "key": "desired_outcome",
        "label": "Desired outcome",
        "type": "textarea",
        "placeholder": "What conclusion or position should the memo support?"
      }
    ],
    "optional_fields": [
      {
        "key": "deadline",
        "label": "Filing deadline",
        "type": "date"
      },
      {
        "key": "budget_constraint",
        "label": "Budget constraint or scope limit",
        "type": "text",
        "placeholder": "e.g., Focus only on federal claims"
      },
      {
        "key": "audience",
        "label": "Intended audience",
        "type": "text",
        "placeholder": "e.g., Senior partner, client, court"
      },
      {
        "key": "prior_proceedings",
        "label": "Prior proceedings or rulings",
        "type": "textarea",
        "placeholder": "Summarize any prior court rulings or procedural history..."
      },
      {
        "key": "confidentiality_level",
        "label": "Confidentiality level",
        "type": "text",
        "placeholder": "e.g., Attorney-client privileged"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload any relevant case files, prior memos, or court filings",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload firm letterhead or brand guidelines (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "issue_statement",
        "label": "Issue Statement",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "State the legal question(s) presented in precise, neutral terms. Frame each question to be answerable with a yes/no followed by explanation."
      },
      {
        "key": "brief_answer",
        "label": "Brief Answer",
        "required": true,
        "min_words": 50,
        "max_words": 150,
        "instructions": "Provide a direct, concise answer to each question stated above. Include the key reasoning in one or two sentences per question."
      },
      {
        "key": "facts",
        "label": "Statement of Facts",
        "required": true,
        "min_words": 200,
        "max_words": 600,
        "instructions": "Present the relevant facts objectively and chronologically. Include only facts material to the legal analysis. Cite to record where applicable."
      },
      {
        "key": "analysis",
        "label": "Analysis",
        "required": true,
        "min_words": 500,
        "max_words": 1500,
        "instructions": "Apply the relevant legal standards to the facts. Organize by issue. Discuss favorable and unfavorable authority. Use proper Bluebook citation format."
      },
      {
        "key": "conclusion",
        "label": "Conclusion",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Summarize the analysis and restate the answers to each question presented. Include practical recommendations for next steps."
      }
    ]
  },
  "market-analysis": {
    "deliverable_slug": "market-analysis",
    "required_fields": [
      {
        "key": "target_market",
        "label": "Target market or industry",
        "type": "text",
        "placeholder": "e.g., US enterprise cybersecurity, European pet food market"
      },
      {
        "key": "analysis_purpose",
        "label": "Purpose of analysis",
        "type": "textarea",
        "placeholder": "Why is this analysis being conducted? e.g., evaluating market entry, supporting a funding round, strategic planning..."
      },
      {
        "key": "company_name",
        "label": "Your company name",
        "type": "text",
        "placeholder": "Organization requesting the analysis"
      },
      {
        "key": "product_or_service",
        "label": "Your product or service",
        "type": "textarea",
        "placeholder": "What product or service are you evaluating for this market?"
      },
      {
        "key": "geographic_scope",
        "label": "Geographic scope",
        "type": "text",
        "placeholder": "e.g., United States, North America, Global"
      },
      {
        "key": "key_questions",
        "label": "Key questions to answer",
        "type": "textarea",
        "placeholder": "What specific questions should this analysis answer? e.g., Is the market large enough? Who are the key players? What are the entry barriers?"
      }
    ],
    "optional_fields": [
      {
        "key": "known_competitors",
        "label": "Known competitors",
        "type": "textarea",
        "placeholder": "List competitors you already know about..."
      },
      {
        "key": "current_market_position",
        "label": "Current market position",
        "type": "textarea",
        "placeholder": "If already in this market, describe your current position and market share..."
      },
      {
        "key": "budget_for_entry",
        "label": "Budget for market entry or expansion",
        "type": "text",
        "placeholder": "e.g., $500K for initial launch"
      },
      {
        "key": "timeline_for_decision",
        "label": "Decision timeline",
        "type": "text",
        "placeholder": "When do you need to make a decision based on this analysis?"
      },
      {
        "key": "data_sources",
        "label": "Preferred data sources",
        "type": "textarea",
        "placeholder": "Any specific reports, databases, or sources to reference..."
      },
      {
        "key": "regulatory_landscape",
        "label": "Known regulatory factors",
        "type": "textarea",
        "placeholder": "Any regulations or compliance requirements you're aware of..."
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload any existing market research, competitor profiles, or industry reports",
        "required": false
      },
      {
        "kind": "financial_data",
        "label": "Upload financial data or market sizing spreadsheets",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload brand guidelines for report formatting (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "High-level summary of market size, growth trajectory, competitive intensity, and overall attractiveness. Include a clear recommendation."
      },
      {
        "key": "market_overview",
        "label": "Market Overview",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Define the market boundaries, current size (TAM/SAM/SOM), historical growth, and projected growth rates with sources."
      },
      {
        "key": "industry_trends",
        "label": "Industry Trends",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Key macro and micro trends shaping the market. Cover technology, regulatory, consumer behavior, and economic factors."
      },
      {
        "key": "target_segments",
        "label": "Target Customer Segments",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Define and size the most attractive customer segments. Include buyer personas, purchasing behavior, and willingness to pay."
      },
      {
        "key": "competitive_landscape",
        "label": "Competitive Landscape",
        "required": true,
        "min_words": 200,
        "max_words": 600,
        "instructions": "Map key competitors by tier. Analyze market share, positioning, strengths, weaknesses, and recent strategic moves. Include competitive positioning matrix."
      },
      {
        "key": "swot_analysis",
        "label": "SWOT Analysis",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Strengths, weaknesses, opportunities, and threats specific to the client's position in this market."
      },
      {
        "key": "market_entry_strategy",
        "label": "Market Entry / Expansion Strategy",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Recommended approach to entering or expanding in this market. Cover positioning, channels, partnerships, and phased rollout plan."
      },
      {
        "key": "financial_opportunity",
        "label": "Financial Opportunity Assessment",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Revenue potential, pricing benchmarks, investment requirements, and expected time to profitability in this market."
      },
      {
        "key": "recommendations",
        "label": "Recommendations",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Clear, prioritized recommendations with risk-adjusted rationale. Include go/no-go assessment and critical success factors."
      }
    ]
  },
  "meeting-minutes": {
    "deliverable_slug": "meeting-minutes",
    "required_fields": [
      {
        "key": "meeting_type",
        "label": "Meeting type",
        "type": "select",
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
        "key": "meeting_title",
        "label": "Meeting title",
        "type": "text"
      },
      {
        "key": "meeting_date",
        "label": "Meeting date",
        "type": "date"
      },
      {
        "key": "meeting_time_start",
        "label": "Meeting start time (24hr)",
        "type": "text",
        "placeholder": "14:00"
      },
      {
        "key": "meeting_time_end",
        "label": "Meeting end time (24hr)",
        "type": "text",
        "placeholder": "15:30"
      },
      {
        "key": "meeting_location",
        "label": "Meeting location",
        "type": "text",
        "help": "Physical location or \"Virtual via [platform]\"."
      },
      {
        "key": "quorum_present",
        "label": "Quorum present",
        "type": "select",
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
        "key": "agenda_items",
        "label": "Agenda items (one per line)",
        "type": "textarea"
      },
      {
        "key": "discussion_summary",
        "label": "Discussion summary (per agenda item)",
        "type": "textarea"
      },
      {
        "key": "action_items",
        "label": "Action items (one per line)",
        "type": "textarea",
        "help": "owner | action | due date | status"
      },
      {
        "key": "meeting_adjourned_at",
        "label": "Meeting adjourned at (24hr)",
        "type": "text",
        "placeholder": "15:30"
      },
      {
        "key": "secretary_name",
        "label": "Secretary / minute-taker name",
        "type": "text"
      }
    ],
    "optional_fields": [
      {
        "key": "quorum_required",
        "label": "Quorum requirement",
        "type": "text",
        "help": "e.g., \"Majority of directors\", \"5 members\"."
      },
      {
        "key": "attendees_in_person",
        "label": "Attendees — in person (one per line)",
        "type": "textarea",
        "help": "name | role/title"
      },
      {
        "key": "attendees_remote",
        "label": "Attendees — remote (one per line)",
        "type": "textarea",
        "help": "name | role | method (phone/video)"
      },
      {
        "key": "attendees_guests",
        "label": "Guests / non-members",
        "type": "textarea"
      },
      {
        "key": "absent",
        "label": "Absent",
        "type": "textarea"
      },
      {
        "key": "prior_minutes_approval",
        "label": "Prior minutes approval",
        "type": "select",
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
        "key": "prior_minutes_amendments",
        "label": "Prior minutes amendments (if approved-as-amended)",
        "type": "textarea"
      },
      {
        "key": "consent_agenda_items",
        "label": "Consent agenda items (one per line)",
        "type": "textarea",
        "help": "Items approved without discussion."
      },
      {
        "key": "motions_and_votes",
        "label": "Motions and votes (one per line)",
        "type": "textarea",
        "help": "motion text | mover | seconder | vote count [for/against/abstain]"
      },
      {
        "key": "resolutions",
        "label": "Resolutions (formal RESOLVED THAT text)",
        "type": "textarea"
      },
      {
        "key": "recusals_conflicts",
        "label": "Recusals and conflicts",
        "type": "textarea",
        "help": "name | item | reason"
      },
      {
        "key": "executive_session",
        "label": "Executive session held",
        "type": "select",
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
        "key": "executive_session_times",
        "label": "Executive session times",
        "type": "text",
        "placeholder": "16:30–17:15"
      },
      {
        "key": "tabled_items",
        "label": "Tabled / postponed items",
        "type": "textarea"
      },
      {
        "key": "next_meeting_date",
        "label": "Next meeting date",
        "type": "date"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Meeting agenda or pre-read (optional)",
        "required": false,
        "multiple": true,
        "accepts": "application/pdf,.docx,.doc"
      }
    ],
    "sections": [
      {
        "key": "header",
        "label": "Header",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Third-person, past-tense, factual. Records what happened, not commentary. Preserves user's exact language for decisions, motions, and resolutions — these are the legal record. Never includes emotional content, side conversations, or subjective observations. Use formal corporate-secretary register.\n\nPIPELINE OWNS THE HEADER. Do NOT emit sections titled \"Meeting Information\", \"Meeting Identification\", \"Meeting Details\", or any heading that duplicates the masthead content. The pipeline renders meeting type, title, date, time, location in the dedicated masthead at the top of the page. Start your output with the Quorum and Attendance section heading directly.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n800–2000 words. Length tracks meeting complexity. A short status meeting may run 600–900 words; a board meeting with multiple motions, resolutions, and an executive session may run 1500–2500.\n\nHEADER: write this section per the document type's standard structure."
      },
      {
        "key": "quorum_attendance",
        "label": "Quorum and Attendance",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "QUORUM AND ATTENDANCE: Open with quorum statement based on quorum_present:\n  - 'met': \"Quorum requirement: [quorum_required if provided, else 'as specified in the governing documents']. Quorum was present and the meeting was properly constituted to conduct business.\"\n  - 'not-met': \"Quorum requirement: [quorum_required]. Quorum was NOT met. As a result, no formal action could be taken at this meeting; the meeting was held for discussion only. Action items requiring formal approval will be deferred to a properly constituted meeting.\"\n  - 'not-applicable': \"Quorum is not applicable to this meeting type.\"\nThen attendance, rendered as four sub-blocks if data present:\n  <h3>Present (in person)</h3> — list from attendees_in_person, one per line, with name and role/title.\n  <h3>Present (remote)</h3> — list from attendees_remote with name, role, and method (phone/video).\n  <h3>Guests / Non-Members</h3> — list from attendees_guests if any, with name and reason for attendance.\n  <h3>Absent</h3> — list from absent if any.\nFormat: <strong>Name</strong>, Role/Title — for each entry. Sub-blocks may be omitted if empty."
      },
      {
        "key": "prior_minutes",
        "label": "Approval of Prior Minutes",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "APPROVAL OF PRIOR MINUTES: ONLY emit if prior_minutes_approval is provided and not \"not-on-agenda\". Branch:\n  - 'approved-as-circulated': \"The minutes of the [prior meeting date if known, else 'previous'] meeting were approved as circulated. No amendments.\"\n  - 'approved-as-amended': \"The minutes of the previous meeting were approved as amended. The following amendments were made: [list from prior_minutes_amendments input].\""
      },
      {
        "key": "consent_agenda",
        "label": "Consent Agenda",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "CONSENT AGENDA: ONLY emit if consent_agenda_items input is non-empty. \"The following items were approved by consent without discussion:\" Numbered list from consent_agenda_items input. End with: \"[Mover, if data captured] moved to approve the consent agenda; [Seconder] seconded; the motion carried by unanimous voice vote.\""
      },
      {
        "key": "agenda",
        "label": "Agenda",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "AGENDA: Numbered list of agenda items as provided in agenda_items input. One item per line. This is the approved agenda for the meeting."
      },
      {
        "key": "discussion",
        "label": "Discussion of Agenda Items",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "DISCUSSION OF AGENDA ITEMS: One <h3> sub-section per agenda item from agenda_items input. Under each <h3>: 1–3 sentences of factual summary drawn from discussion_summary input, mapped to the agenda item. Format the summary as third-person past tense:\n  CORRECT: \"The committee reviewed Q1 financials. No concerns were raised. Budget was approved unanimously.\"\n  WRONG: \"There was great discussion about the Q1 financials and everyone was really engaged.\"\nWhere decisions or actions emerged from discussion, note them: \"[Decision/action], to be formalized under [Motions and Votes / Action Items].\" Do not editorialize. Do not characterize speaker tone or motivation. Stick to facts and outcomes."
      },
      {
        "key": "motions_votes",
        "label": "Motions and Votes",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "MOTIONS AND VOTES: ONLY emit if motions_and_votes input is non-empty. Each motion as a structured entry, NOT prose. Format as a definition-list-style block (or table if rendering allows):\n  <p><strong>Motion 1.</strong></p>\n  <p>Motion: \"[motion text verbatim]\"</p>\n  <p>Mover: [mover]</p>\n  <p>Seconder: [seconder]</p>\n  <p>Vote: [N] for, [N] against, [N] abstaining</p>\n  <p>Result: [Carried / Failed]</p>\nRepeat block for each motion. Do not run motions together as continuous prose. Each motion stands as its own record."
      },
      {
        "key": "resolutions",
        "label": "Resolutions",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "RESOLUTIONS: ONLY emit if resolutions input is non-empty. Each resolution in formal \"RESOLVED THAT\" format with a reference number. Format:\n  <p><strong>Resolution [meeting_date]-[NN]</strong></p>\n  <p>RESOLVED THAT [resolution text in full, verbatim from input].</p>\n  <p>Adopted by [vote count if known, else \"unanimous voice vote\"].</p>\nRepeat for each resolution."
      },
      {
        "key": "recusals",
        "label": "Recusals and Conflicts of Interest",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "RECUSALS AND CONFLICTS OF INTEREST: ONLY emit if recusals_conflicts input is non-empty. List each recusal with name, item recused from, and stated reason: \"[Name] disclosed a [type of conflict] with respect to [item] and recused from discussion and voting on that matter. [Name] left the meeting room during discussion at [time if known] and returned at [time if known].\" Format consistent across entries."
      },
      {
        "key": "executive_session",
        "label": "Executive Session",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EXECUTIVE SESSION: ONLY emit if executive_session is \"yes-began-at-X-ended-at-Y\" or similar non-\"no\" value. Format:\n  \"The board / committee entered executive session at [start time from executive_session_times] to discuss [permitted purpose — e.g., personnel matter, pending litigation, real estate transaction; if not stated, simply 'matters appropriate for executive session']. The board / committee adjourned executive session at [end time]. The substance of the executive session is recorded separately and is not included in these minutes.\"\nDO NOT include any substantive discussion that occurred in executive session in this report — even if it appears in discussion_summary. Executive-session minutes are kept separately."
      },
      {
        "key": "tabled_items",
        "label": "Tabled Items",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "TABLED ITEMS: ONLY emit if tabled_items input is non-empty. Numbered list. Each entry: \"[Item] was tabled. Reason: [reason for postponement]. Disposition: [next regular meeting / specific date / pending further information].\""
      },
      {
        "key": "action_items",
        "label": "Action Items",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ACTION ITEMS: Render as a <table> with columns: Owner | Action | Due Date | Status. One row per item parsed from action_items input. Status values: Open / In Progress / Completed / Deferred. Do not run action items together as prose."
      },
      {
        "key": "adjournment_attestation",
        "label": "Adjournment and Attestation",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "ADJOURNMENT AND ATTESTATION: Single closing paragraph: \"There being no further business, the meeting was adjourned at [meeting_adjourned_at].\" Then attestation: \"Respectfully submitted by [secretary_name], [Title — typically 'Corporate Secretary' or 'Recording Secretary' or 'Designated Minute-Taker']. Date: [meeting_date].\"\nIf meeting_type is 'board-of-directors' or 'shareholder-meeting', add a chair-approval placeholder: \"Approved at the next regular meeting on [next_meeting_date if provided, else 'pending']: __________________________ (Chair).\"\nIf next_meeting_date is provided: \"The next regular meeting of the [meeting_type human-readable form] is scheduled for [next_meeting_date].\""
      }
    ]
  },
  "nda": {
    "deliverable_slug": "nda",
    "required_fields": [
      {
        "key": "agreement_direction",
        "label": "Agreement direction",
        "type": "select",
        "help": "Mutual is recommended for exploratory business discussions.",
        "options": [
          {
            "value": "mutual",
            "label": "Mutual (both parties disclose and receive)"
          },
          {
            "value": "one-way",
            "label": "One-way (one party discloses, one receives)"
          }
        ]
      },
      {
        "key": "disclosing_party_name",
        "label": "Disclosing party — legal name",
        "type": "text"
      },
      {
        "key": "disclosing_party_entity_type",
        "label": "Disclosing party — entity type",
        "type": "select",
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
        "key": "disclosing_party_state",
        "label": "Disclosing party — state of formation (or residence if individual)",
        "type": "text"
      },
      {
        "key": "disclosing_party_address",
        "label": "Disclosing party — notice address",
        "type": "textarea",
        "help": "Full address for legal notices, including email."
      },
      {
        "key": "receiving_party_name",
        "label": "Receiving party — legal name",
        "type": "text"
      },
      {
        "key": "receiving_party_entity_type",
        "label": "Receiving party — entity type",
        "type": "select",
        "help": "If recipient will share information with their employer, select 'Individual representing an entity'.",
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
        ]
      },
      {
        "key": "receiving_party_state",
        "label": "Receiving party — state of formation (or residence if individual)",
        "type": "text"
      },
      {
        "key": "receiving_party_address",
        "label": "Receiving party — notice address",
        "type": "textarea"
      },
      {
        "key": "effective_date",
        "label": "Effective date",
        "type": "date"
      },
      {
        "key": "purpose",
        "label": "Purpose of disclosure — specific",
        "type": "textarea",
        "help": "Be specific. This clause limits how information can be used — broader purpose = weaker protection."
      },
      {
        "key": "subject_matter",
        "label": "Subject matter of Confidential Information",
        "type": "textarea",
        "help": "Short list of the kinds of information that will be shared."
      },
      {
        "key": "marking_requirement",
        "label": "Marking requirement",
        "type": "select",
        "help": "How Confidential Information is identified. 'All non-public' favors discloser; 'Marked only' favors recipient.",
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
        ]
      },
      {
        "key": "disclosure_period_years",
        "label": "Disclosure period (years)",
        "type": "number",
        "help": "How long parties may exchange information.",
        "default": 2
      },
      {
        "key": "confidentiality_period_years",
        "label": "Confidentiality period (years after disclosure)",
        "type": "number",
        "help": "How long obligations apply. Trade secrets last indefinitely.",
        "default": 5
      },
      {
        "key": "governing_state",
        "label": "Governing law — state",
        "type": "text"
      },
      {
        "key": "jurisdiction_county",
        "label": "Jurisdiction — county and state for courts",
        "type": "text"
      },
      {
        "key": "include_non_solicitation",
        "label": "Include non-solicitation clause?",
        "type": "select",
        "help": "Restricts hiring each other's employees or soliciting customers.",
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
        ]
      },
      {
        "key": "include_non_circumvention",
        "label": "Include non-circumvention clause?",
        "type": "select",
        "help": "Prevents bypassing the other party to engage directly with introduced partners.",
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
        ]
      },
      {
        "key": "attorneys_fees",
        "label": "Attorneys' fees in dispute",
        "type": "select",
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
        "key": "jury_waiver",
        "label": "Jury trial waiver",
        "type": "select",
        "help": "Common in commercial agreements. Not enforceable in all jurisdictions.",
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
        ]
      },
      {
        "key": "assignment_policy",
        "label": "Assignment policy",
        "type": "select",
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
    "optional_fields": [
      {
        "key": "receiving_party_represented_entity",
        "label": "Receiving party — represented entity (if applicable)",
        "type": "text",
        "help": "Only fill if receiving party is representing a company."
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Existing NDAs to align tone and clauses (optional)",
        "required": false,
        "multiple": true,
        "accepts": "application/pdf,.docx,.doc"
      }
    ],
    "sections": [
      {
        "key": "recitals",
        "label": "Recitals",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "Voice: Professional legal drafting. Precise, terse, unambiguous. No marketing language. No softening qualifiers. No filler. Lawyer voice throughout. Use 'shall' for mandatory obligations, 'may' for permitted acts. Use defined terms with proper capitalization once defined.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form in your output. The rendering pipeline adds the title on the cover page. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> Section heading. Start directly with the Recitals section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title listed in 'sections'. No section may appear without a heading, including the Miscellaneous section. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit ALL 14 sections in the exact order listed, even if a section is short. No section may be omitted. If 'Additional Covenants' would be empty (no non-solicitation or non-circumvention selected), omit only that section and renumber accordingly.\n\n=== LENGTH ===\n1200-2200 words of legal content. This is a professional instrument — do not pad, do not skimp. Each section complete and enforceable.\n\nRECITALS (3 paragraphs): (a) Identify both parties — legal name, entity type, state of formation, one-sentence business description if entity. (b) State context — what the parties are considering. (c) Define Purpose as a capitalized defined term: 'The parties wish to exchange Confidential Information for the purpose of [purpose] (the \"Purpose\").'"
      },
      {
        "key": "definitions",
        "label": "Definitions",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "DEFINITIONS: Define at minimum: 'Confidential Information', 'Affiliate', 'Representative'. 'Confidential Information' scope depends on marking_requirement: if 'marked-only', require written marking of 'Confidential' or equivalent; if 'marked-plus-oral', require written marking for writings AND 30-day written confirmation for oral disclosures; if 'all-non-public', cover any non-public information regardless of marking. 'Affiliate' means any entity controlling, controlled by, or under common control with a party. 'Representative' means employees, officers, directors, agents, attorneys, accountants, and advisors with a need to know. Exclusions: (a) publicly available through no breach, (b) rightfully known prior to disclosure, (c) independently developed without reference to Confidential Information, (d) rightfully received from third party without confidentiality obligation."
      },
      {
        "key": "obligations",
        "label": "Obligations",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "OBLIGATIONS: If agreement_direction='mutual', use reciprocal language — 'each Receiving Party' — and state that each party may act as Disclosing Party or Receiving Party depending on the information flow. If 'one-way', apply only to named Receiving Party. Required obligations: (1) hold in strict confidence, (2) use solely for Purpose, (3) protect with at least the same degree of care as own confidential information, not less than reasonable care, (4) limit access to Representatives with need to know who are bound by confidentiality obligations at least as protective as this Agreement, (5) Receiving Party is liable for breaches by its Representatives."
      },
      {
        "key": "permitted_disclosures",
        "label": "Permitted Disclosures",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PERMITTED DISCLOSURES: (a) Compelled by law, court order, or regulatory demand, provided Receiving Party gives prompt written notice and cooperates in seeking protective order. (b) To Representatives as defined. (c) Pursuant to Disclosing Party's prior written consent."
      },
      {
        "key": "purpose_limitation",
        "label": "Purpose Limitation",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PURPOSE LIMITATION: Explicit clause: 'Receiving Party shall not use Confidential Information for any purpose other than the Purpose.' Then: no reverse engineering, no use in competing products or services, no retention beyond the term except as expressly permitted."
      },
      {
        "key": "no_license",
        "label": "No License; No Rights Granted",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "NO LICENSE; NO RIGHTS GRANTED: 'No license, express or implied, under any patent, copyright, trademark, trade secret, or other intellectual property right is granted by this Agreement. All Confidential Information remains the sole and exclusive property of Disclosing Party.'"
      },
      {
        "key": "return_destruction",
        "label": "Return or Destruction",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "RETURN OR DESTRUCTION: Upon request of Disclosing Party or termination of this Agreement, Receiving Party shall return or destroy all Confidential Information. Exception: one archival copy may be retained by legal counsel solely for compliance verification, and information in automatic backup systems that cannot reasonably be deleted — such retained information remains subject to confidentiality obligations indefinitely."
      },
      {
        "key": "term",
        "label": "Term",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "TERM: Two distinct periods. Disclosure Period: disclosure_period_years years from Effective Date, during which parties may exchange information under this Agreement. Confidentiality Period: confidentiality_period_years years following each disclosure during which obligations apply. Trade secrets remain confidential for as long as they qualify as trade secrets under applicable law, without time limit."
      },
      {
        "key": "remedies",
        "label": "Remedies; Injunctive Relief",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "REMEDIES; INJUNCTIVE RELIEF: Acknowledge monetary damages inadequate. Disclosing Party entitled to seek injunctive relief and specific performance without the necessity of posting a bond or proving actual damages. Remedies are cumulative and not exclusive of any other remedies at law or in equity."
      },
      {
        "key": "reps_warranties",
        "label": "Representations and Warranties",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "REPRESENTATIONS AND WARRANTIES: Each party represents it has the full right and authority to enter this Agreement. Disclosing Party represents it has the right to disclose the Confidential Information. Confidential Information is provided 'AS IS' without warranty of any kind, express or implied, including without limitation warranties of merchantability, fitness for a particular purpose, or non-infringement."
      },
      {
        "key": "optional_modules",
        "label": "Additional Covenants",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ADDITIONAL COVENANTS: Include ONLY if user selected non-solicitation or non-circumvention options.\n  - If include_non_solicitation='employees-only': 'For twelve (12) months after termination, neither party shall solicit for employment any employee of the other party who was involved in discussions under this Agreement.'\n  - If 'employees-and-customers': add 'and shall not solicit the business of any customer introduced by the other party during the term of this Agreement.'\n  - If include_non_circumvention='yes': 'For twelve (12) months after termination, neither party shall directly engage with any partner, vendor, or customer introduced by the other party through this relationship, without the written consent of the introducing party.'\n  - If BOTH are 'no', omit this entire section and note it is omitted."
      },
      {
        "key": "notices",
        "label": "Notices",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "NOTICES: All notices in writing, delivered to the addresses specified in the Recitals. Effective upon: (a) personal delivery, (b) three business days after mailing by certified mail return receipt requested, or (c) one business day after email transmission with confirmation of delivery. Either party may update its notice address by written notice."
      },
      {
        "key": "miscellaneous",
        "label": "Miscellaneous",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "MISCELLANEOUS: Include each of the following as a numbered or clearly separated sub-paragraph under this section:\n  1. Entire Agreement — supersedes all prior and contemporaneous agreements, written or oral.\n  2. Amendments — only by written instrument signed by both parties.\n  3. Severability — invalid provisions reformed or severed; rest continues in full force.\n  4. Waiver — no failure or delay to enforce constitutes waiver.\n  5. Assignment — per assignment_policy selected. If 'consent-required', allow assignment to successors in merger or acquisition without consent.\n  6. Counterparts — may be executed in counterparts including electronic signatures and scanned copies, each an original, together one instrument.\n  7. If attorneys_fees='prevailing-party': 'In any action arising out of or relating to this Agreement, the prevailing party shall be entitled to recover its reasonable attorneys' fees and costs from the non-prevailing party.'\n  8. If jury_waiver='yes': Include in ALL CAPS bold: 'EACH PARTY HEREBY IRREVOCABLY WAIVES ALL RIGHT TO TRIAL BY JURY IN ANY ACTION, PROCEEDING, OR COUNTERCLAIM ARISING OUT OF OR RELATING TO THIS AGREEMENT.'"
      },
      {
        "key": "governing_law",
        "label": "Governing Law and Jurisdiction",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "GOVERNING LAW AND JURISDICTION: Governed by and construed in accordance with the laws of governing_state, without regard to conflict-of-laws principles. Exclusive jurisdiction and venue in the state and federal courts located in jurisdiction_county."
      }
    ]
  },
  "one-pager": {
    "deliverable_slug": "one-pager",
    "required_fields": [
      {
        "key": "company_name",
        "label": "Company name",
        "type": "text",
        "placeholder": "Your company name"
      },
      {
        "key": "tagline",
        "label": "Tagline or headline",
        "type": "text",
        "placeholder": "A compelling one-liner that captures what you do"
      },
      {
        "key": "value_proposition",
        "label": "Value proposition",
        "type": "textarea",
        "placeholder": "In 2-3 sentences, what do you do and why does it matter to your target customer?"
      },
      {
        "key": "target_audience",
        "label": "Target audience for this one-pager",
        "type": "text",
        "placeholder": "e.g., VCs, enterprise buyers, potential partners, conference attendees"
      },
      {
        "key": "key_features",
        "label": "Key features or offerings",
        "type": "textarea",
        "placeholder": "List your top 3-4 product features, service capabilities, or key offerings..."
      }
    ],
    "optional_fields": [
      {
        "key": "traction_metrics",
        "label": "Traction metrics or proof points",
        "type": "textarea",
        "placeholder": "Revenue, customer count, growth rate, awards, press mentions..."
      },
      {
        "key": "market_opportunity",
        "label": "Market opportunity",
        "type": "textarea",
        "placeholder": "Brief description of the market size or opportunity..."
      },
      {
        "key": "customer_logos",
        "label": "Notable customers or partners",
        "type": "textarea",
        "placeholder": "Names of recognizable customers or partners..."
      },
      {
        "key": "founding_date",
        "label": "Year founded",
        "type": "text",
        "placeholder": "e.g., 2024"
      },
      {
        "key": "team_size",
        "label": "Team size",
        "type": "text",
        "placeholder": "e.g., 15 employees"
      },
      {
        "key": "funding_status",
        "label": "Funding status",
        "type": "text",
        "placeholder": "e.g., Seed funded, $2M raised"
      },
      {
        "key": "call_to_action",
        "label": "Call to action",
        "type": "text",
        "placeholder": "What do you want the reader to do? e.g., Schedule a demo, Visit website"
      },
      {
        "key": "website",
        "label": "Website",
        "type": "text"
      },
      {
        "key": "contact_email",
        "label": "Contact email",
        "type": "text"
      },
      {
        "key": "contact_phone",
        "label": "Contact phone",
        "type": "text"
      },
      {
        "key": "subject_title",
        "label": "Subject title",
        "type": "text",
        "help": "The thing being one-pagered (product, service, company, capability)."
      },
      {
        "key": "subject_type",
        "label": "Subject type",
        "type": "select",
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
        "key": "problem_statement",
        "label": "Problem statement (audience pain)",
        "type": "textarea",
        "help": "Leads the document. Specific scenarios beat generic categories."
      },
      {
        "key": "outcome_metrics",
        "label": "Outcome metrics (one per line)",
        "type": "textarea",
        "help": "metric | proof point. Numbers over claims."
      },
      {
        "key": "key_differentiators",
        "label": "Key differentiators (3–5 bullets)",
        "type": "textarea",
        "help": "Structural advantages, not generic \"we care\"."
      },
      {
        "key": "cta_primary",
        "label": "Primary CTA",
        "type": "text",
        "help": "e.g., \"Schedule a demo\", \"Start free trial\"."
      },
      {
        "key": "use_cases",
        "label": "Use cases (optional)",
        "type": "textarea",
        "help": "2–3 specific buyer scenarios."
      },
      {
        "key": "social_proof",
        "label": "Social proof (optional)",
        "type": "textarea",
        "help": "Customer names, deployment scale, awards."
      },
      {
        "key": "pricing_signal",
        "label": "Pricing signal (optional)",
        "type": "text",
        "help": "e.g., \"Starting at $X/month\", \"Enterprise pricing\"."
      },
      {
        "key": "cta_secondary",
        "label": "Secondary CTA (optional)",
        "type": "text"
      },
      {
        "key": "contact_web",
        "label": "Contact web URL (optional)",
        "type": "text"
      },
      {
        "key": "contact_calendar",
        "label": "Calendar booking link (optional)",
        "type": "text"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "brand_guide",
        "label": "Upload brand guidelines, logo, or color palette",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload any existing one-pagers or marketing materials for reference",
        "required": false
      },
      {
        "kind": "reference_image",
        "label": "Upload product screenshots or images to include",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Brand guidelines (optional)",
        "required": false,
        "accepts": "application/pdf,.docx,.doc,image/*"
      },
      {
        "kind": "reference_image",
        "label": "Product screenshots, photos, or graphics (optional)",
        "required": false,
        "multiple": true,
        "accepts": "image/*"
      }
    ],
    "sections": [
      {
        "key": "headline",
        "label": "Headline",
        "required": true,
        "min_words": 3,
        "max_words": 15,
        "instructions": "A bold, attention-grabbing headline that communicates the core value proposition in one line."
      },
      {
        "key": "value_proposition",
        "label": "Value Proposition",
        "required": true,
        "min_words": 20,
        "max_words": 80,
        "instructions": "2-3 sentences explaining what you do, who you serve, and why you are the best choice. Must be instantly understandable."
      },
      {
        "key": "problem_solution",
        "label": "Problem / Solution",
        "required": true,
        "min_words": 30,
        "max_words": 100,
        "instructions": "Brief, punchy description of the problem and how you solve it. Use contrast to make the before/after clear."
      },
      {
        "key": "key_features",
        "label": "Key Features",
        "required": true,
        "min_words": 20,
        "max_words": 80,
        "instructions": "3-4 bullet points, each with a short title and one-line description. Focus on benefits, not technical specs."
      },
      {
        "key": "traction",
        "label": "Traction / Proof Points",
        "required": false,
        "min_words": 10,
        "max_words": 60,
        "instructions": "2-3 compelling metrics or proof points that build credibility. Use large numbers and specific outcomes."
      },
      {
        "key": "market_opportunity",
        "label": "Market Opportunity",
        "required": false,
        "min_words": 10,
        "max_words": 50,
        "instructions": "One-line market size statement with source. Keep it high-impact and easy to absorb."
      },
      {
        "key": "call_to_action",
        "label": "Call to Action",
        "required": true,
        "min_words": 5,
        "max_words": 30,
        "instructions": "Clear next step with contact information. What should the reader do right now?"
      }
    ]
  },
  "personal-monthly": {
    "deliverable_slug": "personal-monthly",
    "required_fields": [
      {
        "key": "person_name",
        "label": "Person name",
        "type": "text"
      },
      {
        "key": "month_label",
        "label": "Month label",
        "type": "text",
        "help": "e.g., \"April 2026\"."
      },
      {
        "key": "income_sources",
        "label": "Income sources (one per line)",
        "type": "textarea",
        "help": "source | amount"
      },
      {
        "key": "fixed_expenses",
        "label": "Fixed expenses (one per line)",
        "type": "textarea",
        "help": "category | amount — housing, utilities, insurance, subscriptions"
      },
      {
        "key": "variable_expenses",
        "label": "Variable expenses (one per line)",
        "type": "textarea",
        "help": "category | amount — groceries, transport, dining, discretionary"
      },
      {
        "key": "prepared_date",
        "label": "Prepared date",
        "type": "date"
      }
    ],
    "optional_fields": [
      {
        "key": "savings_deposits",
        "label": "Savings deposits (one per line)",
        "type": "textarea",
        "help": "account | amount"
      },
      {
        "key": "debt_payments",
        "label": "Debt payments (one per line)",
        "type": "textarea",
        "help": "debt | amount | type (principal/interest)"
      },
      {
        "key": "assets_snapshot",
        "label": "Assets snapshot (optional)",
        "type": "textarea",
        "help": "asset | value"
      },
      {
        "key": "liabilities_snapshot",
        "label": "Liabilities snapshot (optional)",
        "type": "textarea",
        "help": "liability | balance"
      },
      {
        "key": "notable_events",
        "label": "Notable financial events (optional)",
        "type": "textarea",
        "help": "One-time financial events this month."
      },
      {
        "key": "goals_progress",
        "label": "Goals progress (optional)",
        "type": "textarea",
        "help": "goal | target | actual | status"
      },
      {
        "key": "next_month_adjustments",
        "label": "Next month adjustments (optional)",
        "type": "textarea"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "financial_data",
        "label": "Bank / brokerage statements, transaction CSVs (optional — multiple allowed)",
        "required": false,
        "multiple": true,
        "accepts": ".xlsx,.xls,.csv,application/pdf"
      }
    ],
    "sections": [
      {
        "key": "header_masthead",
        "label": "Header",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Personal-financial neutral. Factual. Use the person's name in third person (\"[Name]'s income for [month] totaled...\" / \"[Name] saved...\"). Never editorialize on choices (\"[Name] should reduce dining out\"). Do not assess goodness or badness; report the numbers. The summary is a record of what was earned, spent, saved, and owed during the month — neutrally presented for the person's own review and planning.\n\nPIPELINE OWNS THE HEADER (person_name, month_label, prepared_date in masthead). Do NOT emit a title or section that duplicates the masthead. Start your output directly with the Income section heading.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n400–800 words of prose. Tables provide most of the substance; commentary is brief and neutral.\n\nHEADER: write this section per the document type's standard structure."
      },
      {
        "key": "income_summary",
        "label": "Income",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "INCOME: <table class=\"fin-table\"> with columns: Source | Amount. Parse income_sources input as pipe-separated \"source | amount\". One row per source. Subtotal row using class \"subtotal-row\" labeled \"Total Income\" with the sum.\nFormat all currency consistently: $X,XXX.XX with thousand separators and two decimals."
      },
      {
        "key": "expenses_summary",
        "label": "Expenses",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "EXPENSES: Two distinct sub-sections rendered as <h3>:\n  <h3>Fixed Expenses</h3> — <table class=\"fin-table\"> with columns Category | Amount. Parse fixed_expenses input. Rows for housing, utilities, insurance, subscriptions, etc. Subtotal \"Subtotal — Fixed Expenses\".\n  <h3>Variable Expenses</h3> — <table class=\"fin-table\"> with columns Category | Amount. Parse variable_expenses input. Rows for groceries, transport, dining, discretionary, etc. Subtotal \"Subtotal — Variable Expenses\".\nAfter both sub-tables, a single combined total row: \"Total Expenses: $[sum of both subtotals]\" — rendered as a paragraph or as a closing line in a small summary table."
      },
      {
        "key": "savings_debt_summary",
        "label": "Savings and Debt",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "SAVINGS AND DEBT: Two sub-sections rendered as <h3>:\n  <h3>Savings Deposits</h3> — ONLY emit if savings_deposits input is non-empty. <table class=\"fin-table\"> with columns Account | Amount. Subtotal \"Total Savings Deposits\".\n  <h3>Debt Payments</h3> — ONLY emit if debt_payments input is non-empty. <table class=\"fin-table\"> with columns Debt | Amount | Type (Principal / Interest). Subtotal \"Total Debt Payments\".\nIf both sub-sections are empty (no savings, no debt activity), emit a brief paragraph: \"No savings deposits or debt payments recorded for [month_label].\""
      },
      {
        "key": "net_position",
        "label": "Net Cash Flow",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "NET CASH FLOW: Single summary block as a small <table class=\"fin-table\">:\n  Total Income: $X\n  Less: Total Expenses: -$Y\n  Less: Savings Deposits: -$Z (if savings section was emitted)\n  Less: Debt Payments: -$W (if debt section was emitted)\n  ─────\n  Net Cash Flow: $(X - Y - Z - W)\nThe \"Net Cash Flow\" row uses class \"total-row\" for emphasis. State the result one of three ways:\n  - Positive: \"[Name]'s net cash flow for [month_label] is positive at $[amount], available for additional savings, debt reduction, or carry-forward.\"\n  - Zero: \"[Name]'s income matched outflows exactly for [month_label].\"\n  - Negative: \"[Name]'s net cash flow for [month_label] is negative at $[amount]; outflows exceeded income.\"\nKeep the framing factual."
      },
      {
        "key": "net_worth_snapshot",
        "label": "Net Worth Snapshot",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "NET WORTH SNAPSHOT: ONLY emit if assets_snapshot or liabilities_snapshot input is non-empty.\nRender as two parallel sub-tables (or columns):\n  <h3>Assets</h3> — list with values, total at the bottom.\n  <h3>Liabilities</h3> — list with balances, total at the bottom.\nThen a final line: \"Net Worth ([prepared_date]): Assets $[A] − Liabilities $[L] = $[A − L].\" If only assets provided (no liabilities) or vice versa, state \"Liabilities not reported in this summary\" or similar. The net worth figure uses class \"total-row\" treatment."
      },
      {
        "key": "goals_events",
        "label": "Goals and Notable Events",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "GOALS AND NOTABLE EVENTS: ONLY emit if goals_progress or notable_events input is non-empty.\n  <h3>Goals Progress</h3> — only if goals_progress provided. <table class=\"fin-table\"> with columns Goal | Target | Actual | Status. Status values: On Track / Ahead / Behind / Achieved.\n  <h3>Notable Events</h3> — only if notable_events provided. Bulleted list of one-time events that affected this month's finances (bonus, refund, large purchase, medical event)."
      },
      {
        "key": "next_month_outlook",
        "label": "Next Month Outlook",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "NEXT MONTH OUTLOOK: ONLY emit if next_month_adjustments input is non-empty. Brief paragraph (2–4 sentences) describing planned adjustments for the upcoming month: changes to budget categories, planned large expenses or income, new savings or debt-payment targets. No prescriptive language."
      }
    ]
  },
  "pitch-deck": {
    "deliverable_slug": "pitch-deck",
    "required_fields": [
      {
        "key": "company_name",
        "label": "Company name",
        "type": "text",
        "placeholder": "Your company name"
      },
      {
        "key": "tagline",
        "label": "One-line tagline",
        "type": "text",
        "placeholder": "e.g., The operating system for modern logistics"
      },
      {
        "key": "problem",
        "label": "Problem you solve",
        "type": "textarea",
        "placeholder": "What painful problem does your target customer face? Be specific and quantify if possible..."
      },
      {
        "key": "solution",
        "label": "Your solution",
        "type": "textarea",
        "placeholder": "How does your product or service solve this problem? What is the core value proposition?"
      },
      {
        "key": "business_model",
        "label": "Business model",
        "type": "textarea",
        "placeholder": "How do you make money? Pricing model, average deal size, sales cycle..."
      },
      {
        "key": "traction",
        "label": "Traction and milestones",
        "type": "textarea",
        "placeholder": "Revenue, customers, growth rate, key partnerships, product milestones..."
      },
      {
        "key": "team",
        "label": "Founding team",
        "type": "textarea",
        "placeholder": "Key team members, their roles, and why they are uniquely qualified to build this company..."
      },
      {
        "key": "fundraising_ask",
        "label": "Fundraising ask",
        "type": "textarea",
        "placeholder": "How much are you raising, what round, and how will the funds be used?"
      }
    ],
    "optional_fields": [
      {
        "key": "market_size",
        "label": "Market size (TAM/SAM/SOM)",
        "type": "textarea",
        "placeholder": "Total addressable market, serviceable market, and obtainable market with sources..."
      },
      {
        "key": "competitors",
        "label": "Key competitors",
        "type": "textarea",
        "placeholder": "Main competitors and how you differentiate..."
      },
      {
        "key": "financial_projections",
        "label": "Financial projections",
        "type": "textarea",
        "placeholder": "Revenue projections for the next 3-5 years with key assumptions..."
      },
      {
        "key": "current_investors",
        "label": "Current investors",
        "type": "textarea",
        "placeholder": "Existing investors, advisors, and notable backers..."
      },
      {
        "key": "product_demo_notes",
        "label": "Product demo highlights",
        "type": "textarea",
        "placeholder": "Key features or workflows to highlight in product slides..."
      },
      {
        "key": "customer_quotes",
        "label": "Customer testimonials",
        "type": "textarea",
        "placeholder": "Quotes or case studies from customers..."
      },
      {
        "key": "website",
        "label": "Website",
        "type": "text"
      },
      {
        "key": "presenter_name",
        "label": "Presenter name and title",
        "type": "text"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "brand_guide",
        "label": "Upload brand guidelines, logo files, or color palette",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload any existing pitch decks, one-pagers, or investor materials",
        "required": false
      },
      {
        "kind": "financial_data",
        "label": "Upload financial models or projections spreadsheet",
        "required": false
      },
      {
        "kind": "reference_image",
        "label": "Upload product screenshots or demo images",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "title_slide",
        "label": "Title Slide",
        "required": true,
        "min_words": 5,
        "max_words": 30,
        "instructions": "Company name, tagline, and presenter info. Clean and memorable. Set the visual tone for the entire deck."
      },
      {
        "key": "problem",
        "label": "Problem",
        "required": true,
        "min_words": 40,
        "max_words": 150,
        "instructions": "Make the pain visceral and relatable. Use data points to quantify the problem. The audience must feel the urgency."
      },
      {
        "key": "solution",
        "label": "Solution",
        "required": true,
        "min_words": 40,
        "max_words": 150,
        "instructions": "Show how your product solves the problem. Clear cause-and-effect from problem to solution. Include a product visual or demo screenshot description."
      },
      {
        "key": "market_size",
        "label": "Market Size",
        "required": true,
        "min_words": 30,
        "max_words": 120,
        "instructions": "TAM, SAM, SOM with clear methodology and credible sources. Bottom-up analysis preferred over top-down."
      },
      {
        "key": "business_model",
        "label": "Business Model",
        "required": true,
        "min_words": 40,
        "max_words": 150,
        "instructions": "How you make money, pricing structure, unit economics. Show that the model is scalable and defensible."
      },
      {
        "key": "traction",
        "label": "Traction",
        "required": true,
        "min_words": 40,
        "max_words": 150,
        "instructions": "Hard numbers: revenue, growth rate, customers, engagement metrics. If pre-revenue, show product development milestones and validation signals."
      },
      {
        "key": "competition",
        "label": "Competition",
        "required": true,
        "min_words": 30,
        "max_words": 120,
        "instructions": "Competitive landscape positioning. Use a 2x2 matrix or feature comparison. Show clear differentiation without disparaging competitors."
      },
      {
        "key": "team",
        "label": "Team",
        "required": true,
        "min_words": 40,
        "max_words": 150,
        "instructions": "Key team members with photos, titles, and one-line relevant credentials. Show why THIS team is uniquely positioned to win."
      },
      {
        "key": "financials",
        "label": "Financials",
        "required": true,
        "min_words": 30,
        "max_words": 120,
        "instructions": "3-5 year revenue projections with key assumptions clearly stated. Show path to profitability."
      },
      {
        "key": "the_ask",
        "label": "The Ask",
        "required": true,
        "min_words": 30,
        "max_words": 100,
        "instructions": "Amount raising, use of funds breakdown (percentages), and milestones the funding will enable. Be specific."
      },
      {
        "key": "closing",
        "label": "Closing Slide",
        "required": true,
        "min_words": 5,
        "max_words": 30,
        "instructions": "Contact information, website, and a memorable closing statement that reinforces the core thesis."
      }
    ]
  },
  "proposal": {
    "deliverable_slug": "proposal",
    "required_fields": [
      {
        "key": "prospect_organization",
        "label": "Prospect organization",
        "type": "text"
      },
      {
        "key": "prospect_contact_name",
        "label": "Prospect contact — name",
        "type": "text"
      },
      {
        "key": "prospect_contact_title",
        "label": "Prospect contact — title",
        "type": "text"
      },
      {
        "key": "proposal_date",
        "label": "Proposal date",
        "type": "date"
      },
      {
        "key": "problem_statement",
        "label": "Problem statement (in client's words)",
        "type": "textarea"
      },
      {
        "key": "our_understanding",
        "label": "Our understanding of the problem",
        "type": "textarea",
        "help": "Restatement of the problem demonstrating comprehension. 2–3 paragraphs."
      },
      {
        "key": "win_themes",
        "label": "Win themes (3–4)",
        "type": "textarea",
        "help": "Short messages that thread through the proposal. One per line."
      },
      {
        "key": "proposed_methodology",
        "label": "Proposed methodology / phases",
        "type": "textarea",
        "help": "Each phase: name | activities | deliverables | duration. One per line or one per paragraph."
      },
      {
        "key": "team_lead_name",
        "label": "Team lead — name",
        "type": "text"
      },
      {
        "key": "team_lead_qualifications",
        "label": "Team lead — qualifications",
        "type": "textarea",
        "help": "2–4 sentences of relevant experience."
      },
      {
        "key": "team_members",
        "label": "Team members (one per line)",
        "type": "textarea",
        "help": "Format: name | role | relevant experience."
      },
      {
        "key": "risks_and_mitigations",
        "label": "Risks and mitigations",
        "type": "textarea",
        "help": "3–5 lines: risk | mitigation. Specific to this engagement."
      },
      {
        "key": "assumptions",
        "label": "Assumptions",
        "type": "textarea"
      },
      {
        "key": "pricing_model",
        "label": "Pricing model",
        "type": "select",
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
        "key": "pricing_detail",
        "label": "Pricing detail",
        "type": "textarea",
        "help": "Rates by role × hours, or fixed total with milestone schedule."
      },
      {
        "key": "validity_period_days",
        "label": "Proposal validity (days)",
        "type": "number",
        "default": 60
      },
      {
        "key": "next_steps_call_to_action",
        "label": "Next steps / call to action",
        "type": "textarea",
        "help": "Specific actions to proceed."
      }
    ],
    "optional_fields": [
      {
        "key": "rfp_reference",
        "label": "RFP reference / number (optional)",
        "type": "text"
      },
      {
        "key": "evaluation_criteria",
        "label": "Evaluation criteria (optional)",
        "type": "textarea",
        "help": "If responding to an RFP with stated criteria, list them. Triggers a Compliance Matrix appendix."
      },
      {
        "key": "past_performance",
        "label": "Past performance / case studies (optional)",
        "type": "textarea",
        "help": "Each line: client | scope | outcome | duration."
      },
      {
        "key": "references",
        "label": "References (optional)",
        "type": "textarea",
        "help": "Each line: name | title | organization | contact."
      },
      {
        "key": "pricing_optional_services",
        "label": "Optional add-on services (optional)",
        "type": "textarea",
        "help": "Add-on services with separate pricing."
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "brand_guide",
        "label": "Brand guidelines (optional)",
        "required": false,
        "accepts": "application/pdf,.docx,.doc,image/*"
      },
      {
        "kind": "reference_doc",
        "label": "Prior proposals, RFP, or solicitation document (optional)",
        "required": false,
        "multiple": true,
        "accepts": "application/pdf,.docx,.doc"
      },
      {
        "kind": "reference_image",
        "label": "Graphics, charts, or team photos (optional)",
        "required": false,
        "multiple": true,
        "accepts": "image/*"
      }
    ],
    "sections": [
      {
        "key": "cover",
        "label": "Cover Page",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Confident, specific, grounded in the prospect's stated problem. Demonstrates capability through evidence (specific outcomes, named clients, quantified results) rather than assertion (adjectives, superlatives). Avoid: \"world-class\", \"best-in-class\", \"innovative\", \"cutting-edge\", \"industry-leading\", \"passionate\", \"thrilled\", \"excited\" — these are weak signals because they substitute for evidence. Replace with specifics: numbers, durations, named outcomes, named clients (sanitized as needed), named methodologies. Win themes thread through every section subtly — not as marketing copy but as recurring substantive emphasis.\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n2500–4500 words. Comprehensive but disciplined. Length should follow content — proposals for simple engagements should be shorter; complex government RFPs longer. Never pad to hit length.\n\nCOVER PAGE: write this section per the document type's standard structure."
      },
      {
        "key": "executive_summary",
        "label": "Executive Summary",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "EXECUTIVE SUMMARY: Five paragraphs, ONE sentence each. Each sentence reinforces a win theme drawn from win_themes input.\n  Sentence 1: Restate the prospect's business challenge (drawn from problem_statement input). Frame in their language.\n  Sentence 2: State the proposed approach in one sentence — what will be done, with what methodology.\n  Sentence 3: State the expected outcome with a quantified target if possible (e.g., \"30% reduction in cycle time\", \"$2M savings\", \"60-day deployment\").\n  Sentence 4: State the proposer's unique qualification — what differentiates from alternatives. Specific, not generic.\n  Sentence 5: State why act now — timing, market window, regulatory deadline, opportunity cost of delay.\nThe sentences should each stand alone but together form a coherent argument. Do not pad. Five tight sentences are stronger than five paragraphs."
      },
      {
        "key": "understanding_of_need",
        "label": "Understanding of Your Needs",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "UNDERSTANDING OF YOUR NEEDS: Two paragraphs.\n  Paragraph 1: Restate the prospect's problem in proposer's own words drawing from our_understanding input. This is the \"I heard you\" paragraph — demonstrates comprehension of the situation, the constraints, the goals. Use the prospect's own terminology where it appears in the source materials.\n  Paragraph 2: State why this problem matters now. What is the business consequence of inaction? What is the timing pressure? Cite specifics: regulatory deadlines, market windows, internal commitments, competitive dynamics.\nEnd with one transition sentence into the proposed approach."
      },
      {
        "key": "proposed_approach",
        "label": "Proposed Approach",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PROPOSED APPROACH: Two to four paragraphs. Methodology overview at a high level — NOT phase detail (that's the next section). Cover:\n  - Why this approach is right for this client's situation specifically\n  - What the prospect will experience during the engagement (cadence, touchpoints, decision points)\n  - What level of access/cooperation is required from the client\n  - What is unique about how proposer approaches this work — the \"why us doing it this way\" without adjectives\nAvoid generic methodology descriptions; tie every choice to the client's stated problem."
      },
      {
        "key": "methodology_phases",
        "label": "Methodology and Phases",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "METHODOLOGY AND PHASES: Numbered phases parsed from proposed_methodology input. For EACH phase, render as a sub-block with:\n  <h3>[Phase number]. [Phase name]</h3>\n  One paragraph describing the activities in that phase.\n  <strong>Deliverables:</strong> bulleted list of what comes out of this phase.\n  <strong>Duration:</strong> [estimate].\n  <strong>Dependencies:</strong> what must be in place from the prior phase or from Client to begin.\nThree to five phases is typical. End the section with a brief paragraph on how phases connect — handoff points, decision gates, governance."
      },
      {
        "key": "deliverables",
        "label": "Deliverables",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "DELIVERABLES: Consolidated list of ALL deliverables across all phases. Each as a numbered item with:\n  - Deliverable name (bolded)\n  - One-sentence definition\n  - Acceptance criteria (objective, measurable; reference the engagement letter / SOW that will follow)\n  - Format (e.g., written report PDF, presentation deck, source code repository)\nThis consolidated view helps evaluators map the proposal to their needs without reconstructing it from phases."
      },
      {
        "key": "team_organization",
        "label": "Team and Organization",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "TEAM AND ORGANIZATION: Lead with the team_lead callout: <h3>[team_lead_name]</h3> followed by team_lead_qualifications as a 2–4 sentence credential summary. Then a team table parsed from team_members input with columns Name | Role | Relevant Experience. After the table, one paragraph on reporting structure and engagement governance: who Client interfaces with, escalation paths, frequency of status updates. Avoid org chart graphics unless absolutely necessary."
      },
      {
        "key": "past_performance",
        "label": "Past Performance",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PAST PERFORMANCE: ONLY emit if past_performance input is non-empty. For each entry parsed from input as \"client | scope | outcome | duration\":\n  <h3>[Client name, sanitized if needed]</h3>\n  <strong>Scope:</strong> [scope description, 2–3 sentences]\n  <strong>Outcome:</strong> [measurable result, with numbers]\n  <strong>Duration:</strong> [duration]\nThree to five entries is ideal — too many dilutes signal. Quality of detail matters more than quantity."
      },
      {
        "key": "references",
        "label": "References",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "REFERENCES: ONLY emit if references input is non-empty. Brief list of references with the format: Name | Title | Organization | Contact (email or phone). One reference per line. End with: \"References available for direct contact upon mutual agreement to proceed; please coordinate timing through [proposer contact].\""
      },
      {
        "key": "risk_management",
        "label": "Risk Identification and Mitigation",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "RISK IDENTIFICATION AND MITIGATION: <table> with columns: Risk | Likelihood (Low/Medium/High) | Impact (Low/Medium/High) | Mitigation Strategy. Three to five rows from risks_and_mitigations input, parsed as \"risk | mitigation\". Be specific — \"delays\" or \"scope creep\" without specifics signal a generic proposal. Risks should be specific to this engagement: regulatory uncertainty, technical integration unknowns, stakeholder alignment, data quality, market shifts."
      },
      {
        "key": "assumptions",
        "label": "Assumptions",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ASSUMPTIONS: Numbered list. Each assumption is a clear declarative statement of what proposer is relying on for the proposed plan and pricing:\n  - Client decisions on material questions within five business days\n  - Access to subject-matter experts named in the team section's reporting structure\n  - Existing data sources documented in [Appendix or pre-engagement]\n  - No major regulatory or organizational change during the engagement\nEnd with: \"Material deviations from these assumptions will be addressed via written change order in the engagement letter or SOW that follows. Pricing and timeline reflect these assumptions.\""
      },
      {
        "key": "timeline",
        "label": "Timeline",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "TIMELINE: Visual milestone summary in prose form. Reference the phase end dates from the Methodology section. Note critical path indicators where applicable. Single calendar reference (e.g., \"Engagement Kickoff: Week 1; Phase 1 Complete: Week 4; Phase 2 Complete: Week 8; Final Deliverable: Week 12\"). State that target dates assume Engagement Letter / SOW execution by [proposal_date + validity_period_days days]."
      },
      {
        "key": "pricing_investment",
        "label": "Pricing and Investment",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "PRICING AND INVESTMENT: Restate pricing_model. Detailed breakdown from pricing_detail input.\n  - 'fixed-fee': total amount, payment milestones tied to phase completion or deliverable acceptance, percentages summing to 100%.\n  - 'time-and-materials': rates by role (table), estimated hours by role, not-to-exceed cap, monthly invoicing.\n  - 'milestone-based': specific dollar amounts at specific milestones with acceptance criteria triggers.\n  - 'hybrid': describe both portions.\nIf pricing_optional_services input is provided, render as a separate sub-section <h3>Optional Add-On Services</h3> with name, description, separate price.\nValidity statement (verbatim): \"This proposal is valid through [proposal_date + validity_period_days days]. Pricing assumes execution of the engagement letter or SOW by that date. Subsequent execution may require re-pricing reflecting then-current rates and scope.\""
      },
      {
        "key": "next_steps",
        "label": "Next Steps and Acceptance",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "NEXT STEPS AND ACCEPTANCE: Specific actions per next_steps_call_to_action input. Typical structure: \"To proceed, the parties will execute an Engagement Letter (or Statement of Work) substantially in the form attached or in negotiation. Please indicate intent to proceed by [date], and we will deliver the executable engagement document within five business days. Upon execution, we will commence with a kickoff meeting within five business days.\" If a counter-signature line is included on the proposal itself: \"If the foregoing approach and pricing are acceptable in principle, please countersign below to authorize preparation of the formal engagement document. This signature does not constitute the final engagement agreement.\""
      },
      {
        "key": "appendix_compliance",
        "label": "Appendix: Compliance Matrix",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "APPENDIX: COMPLIANCE MATRIX: ONLY emit if evaluation_criteria input is non-empty. Render as a table with columns: Evaluation Criterion | Proposal Section | Page (if known). Map each criterion from evaluation_criteria input to the section(s) of this proposal that address it. This is critical for RFP responses; reviewers use it to verify completeness."
      }
    ]
  },
  "pwp": {
    "deliverable_slug": "pwp",
    "required_fields": [
      {
        "key": "company_name",
        "label": "Company name",
        "type": "text",
        "placeholder": "Full legal entity name"
      },
      {
        "key": "contract_name",
        "label": "Contract or project name",
        "type": "text",
        "placeholder": "e.g., Enterprise IT Modernization Support"
      },
      {
        "key": "client_agency",
        "label": "Client agency or organization",
        "type": "text",
        "placeholder": "e.g., Department of Veterans Affairs, Office of Information Technology"
      },
      {
        "key": "contract_value",
        "label": "Contract value",
        "type": "text",
        "placeholder": "e.g., $4.2M over 3 years"
      },
      {
        "key": "period_of_performance",
        "label": "Period of performance",
        "type": "text",
        "placeholder": "e.g., March 2023 - March 2026"
      },
      {
        "key": "scope_description",
        "label": "Scope of work performed",
        "type": "textarea",
        "placeholder": "Describe the full scope of work you performed on this contract..."
      },
      {
        "key": "challenges_and_solutions",
        "label": "Key challenges and how you solved them",
        "type": "textarea",
        "placeholder": "Describe the most significant challenges encountered and how your team addressed them..."
      },
      {
        "key": "outcomes_and_results",
        "label": "Measurable outcomes and results",
        "type": "textarea",
        "placeholder": "Quantifiable results: cost savings, efficiency gains, metrics improved, deadlines met..."
      }
    ],
    "optional_fields": [
      {
        "key": "contract_number",
        "label": "Contract number",
        "type": "text",
        "placeholder": "e.g., GS-35F-0001X, Task Order 47QTCA-20-F-0001"
      },
      {
        "key": "contract_type",
        "label": "Contract type",
        "type": "text",
        "placeholder": "e.g., FFP, T&M, CPFF"
      },
      {
        "key": "target_solicitation",
        "label": "Target solicitation this supports",
        "type": "text",
        "placeholder": "Solicitation number of the opportunity you are pursuing"
      },
      {
        "key": "target_requirements",
        "label": "Requirements from target solicitation to map to",
        "type": "textarea",
        "placeholder": "Key requirements from the new opportunity that this past performance demonstrates..."
      },
      {
        "key": "team_size",
        "label": "Team size",
        "type": "text",
        "placeholder": "e.g., 12 FTEs"
      },
      {
        "key": "subcontractors",
        "label": "Subcontractor roles",
        "type": "textarea",
        "placeholder": "Any subcontractors involved and their roles..."
      },
      {
        "key": "reference_contact",
        "label": "Client reference contact",
        "type": "textarea",
        "placeholder": "Name, title, phone, email of the client point of contact"
      },
      {
        "key": "cpars_rating",
        "label": "CPARS rating (if available)",
        "type": "text",
        "placeholder": "e.g., Exceptional, Very Good, Satisfactory"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload CPARS reports, performance evaluations, or award letters",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload the target solicitation for relevance mapping",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload company brand guidelines (optional)",
        "required": false
      }
    ],
    "sections": [
      {
        "key": "project_overview",
        "label": "Project Overview",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Provide context on the contract including client mission, urgency, and why this work mattered. Set the stage for demonstrating competence."
      },
      {
        "key": "scope_and_complexity",
        "label": "Scope and Complexity",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Detail the technical and management complexity of the work performed. Emphasize elements that mirror the target opportunity's requirements."
      },
      {
        "key": "challenges_and_solutions",
        "label": "Challenges and Solutions",
        "required": true,
        "min_words": 200,
        "max_words": 500,
        "instructions": "Describe 2-3 significant challenges and your innovative solutions. Use the Problem-Action-Result format. Quantify where possible."
      },
      {
        "key": "outcomes_and_results",
        "label": "Outcomes and Results",
        "required": true,
        "min_words": 150,
        "max_words": 400,
        "instructions": "Present measurable outcomes with specific metrics. Cost savings, schedule performance, quality indicators, and client satisfaction scores."
      },
      {
        "key": "relevance_to_opportunity",
        "label": "Relevance to Target Opportunity",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Explicitly connect this past performance to the requirements of the target solicitation. Draw parallels in scope, complexity, environment, and mission."
      },
      {
        "key": "client_reference",
        "label": "Client Reference",
        "required": false,
        "min_words": 20,
        "max_words": 100,
        "instructions": "Provide client reference contact information including name, title, organization, phone, and email."
      }
    ]
  },
  "quote": {
    "deliverable_slug": "quote",
    "required_fields": [
      {
        "key": "customer_name",
        "label": "Customer name",
        "type": "text",
        "placeholder": "Acme Corp"
      },
      {
        "key": "customer_address",
        "label": "Customer address",
        "type": "textarea",
        "placeholder": "Full billing address"
      },
      {
        "key": "quote_date",
        "label": "Quote date",
        "type": "date"
      },
      {
        "key": "valid_until",
        "label": "Valid until",
        "type": "date"
      },
      {
        "key": "scope_summary",
        "label": "Scope summary",
        "type": "textarea",
        "placeholder": "One-paragraph description of the work being quoted..."
      },
      {
        "key": "line_items",
        "label": "Line items",
        "type": "textarea",
        "placeholder": "List each item or service line: description, quantity, unit price. One per line."
      },
      {
        "key": "payment_terms",
        "label": "Payment terms",
        "type": "select",
        "options": [
          "Net 15",
          "Net 30",
          "Net 45",
          "Net 60",
          "Due on receipt",
          "50% deposit / 50% on completion",
          "Other"
        ]
      }
    ],
    "optional_fields": [
      {
        "key": "quote_number",
        "label": "Quote number",
        "type": "text"
      },
      {
        "key": "project_address",
        "label": "Project / job site address",
        "type": "textarea"
      },
      {
        "key": "scheduled_start",
        "label": "Scheduled start date",
        "type": "date"
      },
      {
        "key": "estimated_completion",
        "label": "Estimated completion",
        "type": "date"
      },
      {
        "key": "warranty_terms",
        "label": "Warranty terms",
        "type": "textarea"
      },
      {
        "key": "exclusions",
        "label": "Exclusions and assumptions",
        "type": "textarea",
        "placeholder": "What is NOT included, what we are assuming about site conditions, etc."
      },
      {
        "key": "preparer_name",
        "label": "Preparer name and title",
        "type": "text"
      },
      {
        "key": "preparer_contact",
        "label": "Preparer phone/email",
        "type": "text"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "site_photo",
        "label": "Site photos relevant to the quote",
        "required": false,
        "multiple": true,
        "accepts": "image/*"
      },
      {
        "kind": "reference_doc",
        "label": "Customer RFP or scope document",
        "required": false,
        "accepts": "application/pdf,.docx,.doc"
      },
      {
        "kind": "reference_doc",
        "label": "Prior quotes for reference",
        "required": false,
        "accepts": "application/pdf,.docx,.doc"
      }
    ],
    "sections": [
      {
        "key": "header",
        "label": "Quote Header",
        "required": true,
        "min_words": 15,
        "max_words": 60,
        "instructions": "Customer name and address, quote date, validity period, quote number if provided. Preparer contact info if provided. Clean and unambiguous — this is a binding offer."
      },
      {
        "key": "scope",
        "label": "Scope of Work",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "Convert the scope summary into a precise, plain-language description of what the customer is buying. Specific materials, methods, deliverables. Use the line_items field as the source of truth for what's included."
      },
      {
        "key": "line_items_table",
        "label": "Line Items",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Parse the line_items input into a structured table: description, quantity, unit, unit price, line total. Compute subtotals. Be honest about any tax/labor breakdowns the user provided."
      },
      {
        "key": "totals",
        "label": "Totals",
        "required": true,
        "min_words": 10,
        "max_words": 50,
        "instructions": "Subtotal, applicable tax (if mentioned by user), grand total. Show currency unambiguously."
      },
      {
        "key": "terms",
        "label": "Terms and Conditions",
        "required": true,
        "min_words": 60,
        "max_words": 200,
        "instructions": "Payment terms (from user input), warranty terms (if provided), exclusions/assumptions (if provided), validity period restated. Clear, professional, not aggressive."
      },
      {
        "key": "acceptance",
        "label": "Acceptance",
        "required": true,
        "min_words": 20,
        "max_words": 80,
        "instructions": "Signature block for customer acceptance: name, title, date, signature line. Brief acceptance language ('To accept this quote, please sign below and return.')."
      }
    ]
  },
  "sow": {
    "deliverable_slug": "sow",
    "required_fields": [
      {
        "key": "project_name",
        "label": "Project name",
        "type": "text",
        "placeholder": "e.g., Website Redesign Phase 2, ERP Implementation"
      },
      {
        "key": "client_name",
        "label": "Client organization",
        "type": "text",
        "placeholder": "Full legal entity name of the client"
      },
      {
        "key": "provider_name",
        "label": "Service provider organization",
        "type": "text",
        "placeholder": "Full legal entity name of the provider"
      },
      {
        "key": "project_description",
        "label": "Project description",
        "type": "textarea",
        "placeholder": "Describe the project in detail. What is being delivered and why?"
      },
      {
        "key": "scope_of_work",
        "label": "Scope of work",
        "type": "textarea",
        "placeholder": "List the specific tasks, deliverables, and services included in this engagement..."
      },
      {
        "key": "project_timeline",
        "label": "Project timeline",
        "type": "text",
        "placeholder": "e.g., 12 weeks starting April 1, 2026"
      },
      {
        "key": "total_budget",
        "label": "Total budget / pricing",
        "type": "text",
        "placeholder": "e.g., $150,000 fixed-price, T&M not to exceed $200,000"
      }
    ],
    "optional_fields": [
      {
        "key": "master_agreement_ref",
        "label": "Master agreement reference",
        "type": "text",
        "placeholder": "e.g., MSA dated January 1, 2025, Reference #12345"
      },
      {
        "key": "key_milestones",
        "label": "Key milestones",
        "type": "textarea",
        "placeholder": "List major project milestones with target dates..."
      },
      {
        "key": "acceptance_criteria",
        "label": "Acceptance criteria",
        "type": "textarea",
        "placeholder": "How will deliverables be evaluated and accepted?"
      },
      {
        "key": "team_structure",
        "label": "Project team structure",
        "type": "textarea",
        "placeholder": "Key roles from both provider and client side..."
      },
      {
        "key": "out_of_scope",
        "label": "Explicitly out of scope",
        "type": "textarea",
        "placeholder": "What is NOT included in this engagement?"
      },
      {
        "key": "assumptions",
        "label": "Key assumptions",
        "type": "textarea",
        "placeholder": "What assumptions is this SOW based on?"
      },
      {
        "key": "payment_schedule",
        "label": "Payment schedule",
        "type": "textarea",
        "placeholder": "e.g., 30% upfront, 40% at midpoint, 30% at completion"
      },
      {
        "key": "change_order_process",
        "label": "Change order process",
        "type": "textarea",
        "placeholder": "How will scope changes be handled?"
      },
      {
        "key": "client_entity_type",
        "label": "Client — entity type",
        "type": "select",
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
        "key": "client_address",
        "label": "Client — notice address",
        "type": "textarea"
      },
      {
        "key": "project_title",
        "label": "Project title",
        "type": "text"
      },
      {
        "key": "engagement_model",
        "label": "Engagement model",
        "type": "select",
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
        "key": "start_date",
        "label": "Start date",
        "type": "date"
      },
      {
        "key": "end_date",
        "label": "Target end date",
        "type": "date"
      },
      {
        "key": "project_summary",
        "label": "Project summary",
        "type": "textarea",
        "help": "1–3 paragraphs describing the project at a high level. Used in Executive Summary."
      },
      {
        "key": "deliverables",
        "label": "Deliverables (one per line)",
        "type": "textarea",
        "help": "Each line: deliverable name | description | acceptance criteria | format | target date."
      },
      {
        "key": "exclusions",
        "label": "Exclusions",
        "type": "textarea",
        "help": "What is explicitly NOT in scope."
      },
      {
        "key": "fee_amount_dollars",
        "label": "Total fee ($)",
        "type": "number",
        "help": "Fixed total or T&M not-to-exceed cap."
      },
      {
        "key": "fee_detail",
        "label": "Fee detail",
        "type": "textarea",
        "help": "Breakdown by role × rate if T&M; payment milestones if fixed."
      },
      {
        "key": "payment_terms",
        "label": "Payment terms",
        "type": "text",
        "default": "Net 30"
      },
      {
        "key": "expense_policy",
        "label": "Expense policy",
        "type": "select",
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
        "key": "client_pm_name",
        "label": "Client Project Owner — name",
        "type": "text",
        "help": "Designated decision-maker with acceptance authority."
      },
      {
        "key": "provider_pm_name",
        "label": "Provider Engagement Lead — name",
        "type": "text"
      },
      {
        "key": "liability_cap_multiplier",
        "label": "Liability cap multiplier (× fees)",
        "type": "number",
        "help": "1× standard; 2× for higher-risk engagements.",
        "default": 1
      },
      {
        "key": "governing_state",
        "label": "Governing state",
        "type": "text"
      },
      {
        "key": "expense_threshold_dollars",
        "label": "Expense pre-approval threshold ($)",
        "type": "number"
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "reference_doc",
        "label": "Upload any existing proposals, RFPs, or prior SOWs for reference",
        "required": false
      },
      {
        "kind": "reference_doc",
        "label": "Upload technical requirements or specifications documents",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Upload company brand guidelines (optional)",
        "required": false
      },
      {
        "kind": "brand_guide",
        "label": "Brand guidelines or style sheet (optional)",
        "required": false,
        "accepts": "application/pdf,.docx,.doc,image/*"
      },
      {
        "kind": "reference_doc",
        "label": "Prior SOWs or scope documents (optional)",
        "required": false,
        "multiple": true,
        "accepts": "application/pdf,.docx,.doc"
      },
      {
        "kind": "reference_image",
        "label": "Org chart, scope diagram, or relevant visual (optional)",
        "required": false,
        "multiple": true,
        "accepts": "image/*"
      }
    ],
    "sections": [
      {
        "key": "purpose_and_background",
        "label": "Purpose and Background",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "State the business context, objectives, and rationale for this engagement. Reference the master agreement if applicable."
      },
      {
        "key": "scope_of_work",
        "label": "Scope of Work",
        "required": true,
        "min_words": 200,
        "max_words": 600,
        "instructions": "Detailed description of all work to be performed. Break into numbered work streams or phases. Be explicit about boundaries."
      },
      {
        "key": "deliverables",
        "label": "Deliverables",
        "required": true,
        "min_words": 100,
        "max_words": 400,
        "instructions": "Enumerate each deliverable with description, format, and delivery date. Use a numbered list or table format."
      },
      {
        "key": "timeline_and_milestones",
        "label": "Timeline and Milestones",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "Project schedule with phases, milestones, dependencies, and key dates. Include a visual timeline or Gantt-style representation."
      },
      {
        "key": "acceptance_criteria",
        "label": "Acceptance Criteria",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "Define how each deliverable will be evaluated, the review period, and the process for acceptance or rejection."
      },
      {
        "key": "roles_and_responsibilities",
        "label": "Roles and Responsibilities",
        "required": true,
        "min_words": 100,
        "max_words": 300,
        "instructions": "RACI or similar matrix defining responsibilities for both the provider and client teams. Include escalation paths."
      },
      {
        "key": "pricing_and_payment",
        "label": "Pricing and Payment Terms",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "Detailed pricing breakdown by phase or deliverable. Payment milestones, invoicing procedures, and expense policies."
      },
      {
        "key": "assumptions_and_constraints",
        "label": "Assumptions and Constraints",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "List all assumptions the SOW is based on and any constraints (technical, resource, timeline) that may affect delivery."
      },
      {
        "key": "change_management",
        "label": "Change Management",
        "required": true,
        "min_words": 50,
        "max_words": 200,
        "instructions": "Process for requesting, evaluating, approving, and implementing changes to scope, timeline, or budget."
      },
      {
        "key": "governance",
        "label": "Governance and Communication",
        "required": false,
        "min_words": 50,
        "max_words": 200,
        "instructions": "Meeting cadence, status reporting requirements, escalation procedures, and project management tools."
      },
      {
        "key": "signature_block",
        "label": "Signature Block",
        "required": true,
        "min_words": 20,
        "max_words": 80,
        "instructions": "Signature blocks for authorized representatives of both parties with name, title, date, and entity name."
      }
    ]
  },
  "tax-estimate": {
    "deliverable_slug": "tax-estimate",
    "required_fields": [
      {
        "key": "taxpayer_name",
        "label": "Taxpayer name",
        "type": "text"
      },
      {
        "key": "tax_year",
        "label": "Tax year",
        "type": "number"
      },
      {
        "key": "filing_status",
        "label": "Filing status",
        "type": "select",
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
        "key": "state_residence",
        "label": "State of residence",
        "type": "text"
      },
      {
        "key": "deduction_method",
        "label": "Deduction method",
        "type": "select",
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
        "key": "prepared_by",
        "label": "Prepared by",
        "type": "text"
      },
      {
        "key": "prepared_date",
        "label": "Prepared date",
        "type": "date"
      }
    ],
    "optional_fields": [
      {
        "key": "gross_income_w2",
        "label": "W-2 wages ($)",
        "type": "number",
        "default": 0
      },
      {
        "key": "gross_income_1099_self_employment",
        "label": "1099 / self-employment income ($)",
        "type": "number",
        "default": 0
      },
      {
        "key": "gross_income_investment",
        "label": "Investment income — interest, dividends, capital gains ($)",
        "type": "number",
        "default": 0
      },
      {
        "key": "gross_income_other",
        "label": "Other income ($)",
        "type": "number",
        "default": 0
      },
      {
        "key": "itemized_deductions_breakdown",
        "label": "Itemized deductions breakdown (one per line)",
        "type": "textarea",
        "help": "category | amount — only if itemized."
      },
      {
        "key": "tax_credits",
        "label": "Tax credits (one per line)",
        "type": "textarea",
        "help": "credit | amount"
      },
      {
        "key": "withholdings_ytd",
        "label": "Withholdings YTD ($)",
        "type": "number",
        "default": 0
      },
      {
        "key": "estimated_payments_ytd",
        "label": "Estimated payments YTD ($)",
        "type": "number",
        "default": 0
      },
      {
        "key": "prior_year_tax_liability",
        "label": "Prior year tax liability ($)",
        "type": "number",
        "help": "For IRC §6654 safe harbor analysis."
      }
    ],
    "file_upload_prompts": [
      {
        "kind": "prior_filing",
        "label": "Last year's tax return (optional — improves estimates)",
        "required": false,
        "accepts": "application/pdf"
      },
      {
        "kind": "financial_data",
        "label": "Income statements, P&L, W-2s, 1099s (multiple allowed)",
        "required": false,
        "multiple": true,
        "accepts": ".xlsx,.xls,.csv,application/pdf,image/*"
      }
    ],
    "sections": [
      {
        "key": "header_masthead",
        "label": "Header",
        "required": true,
        "min_words": 30,
        "max_words": 200,
        "instructions": "Voice: Tax-preparation neutral. Conservative. Repeatedly emphasize the estimate-not-advice nature. Do NOT make recommendations to the taxpayer. Do NOT assert what the taxpayer should do. Do NOT compute specific tax brackets or invent figures that depend on current-year tax tables — Claude does not have reliable access to current brackets and the legal exposure of getting this wrong is high. Use language like \"TO BE COMPUTED BY TAX PROFESSIONAL\" for figures that require current-year tables.\n\nPIPELINE OWNS THE HEADER (taxpayer_name, tax_year, prepared_date, prepared_by in masthead). The first content section MUST be the IMPORTANT NOTICE — this is non-negotiable for liability protection. The disclaimer also appears in the running footer of every page (rendered automatically by the pipeline based on this template's slug).\n\n=== CRITICAL OUTPUT RULES ===\n\nRULE 1: DO NOT emit the document title as <h1> or in any form. The pipeline adds the title on the cover or masthead. Any title in your body HTML creates a duplicate.\n\nRULE 2: DO NOT emit decorative banners, spaced-out letter wordmarks, document IDs, brand names above the first section, or any content before the first <h2> heading. Start directly with the first section heading.\n\nRULE 3: Every section MUST have an <h2> heading with the exact title from the 'sections' array. No section may appear without a heading. Do not let content drift into unlabeled prose.\n\nRULE 4: Emit sections in the exact order listed. Do not skip required sections. Conditional sections (those gated on user input flags) may be omitted only when the input does not include them.\n\n=== LENGTH ===\n800–1500 words. Length is driven by prominent disclaimer placement and conservative analytical voice. Do not pad with computational detail that this document explicitly disclaims.\n\nHEADER: write this section per the document type's standard structure."
      },
      {
        "key": "mandatory_disclaimer",
        "label": "Important Notice",
        "required": true,
        "min_words": 60,
        "max_words": 200,
        "instructions": "IMPORTANT NOTICE: This is the FIRST content section of the body. Render it inside a <div class=\"fin-disclaimer-prominent\"> (the pipeline styles this with a border and slight emphasis). Use the EXACT disclaimer text below verbatim — do not alter, do not water down, do not soften. Capitalize the first sentence. Begin with bold or strong: \"<strong>IMPORTANT NOTICE — PLEASE READ.</strong>\"\nThe exact disclaimer text:\nTHIS DOCUMENT IS AN ESTIMATE PREPARED FOR PLANNING PURPOSES ONLY. IT IS NOT TAX ADVICE, IS NOT A SUBSTITUTE FOR PROFESSIONAL TAX PREPARATION OR LEGAL ADVICE, AND DOES NOT CREATE A TAX-PREPARER RELATIONSHIP. CONSULT A LICENSED CPA OR TAX ATTORNEY BEFORE MAKING ANY TAX-RELATED DECISIONS, FILING ANY RETURN, OR RELYING ON THESE ESTIMATES. THE PREPARER MAKES NO REPRESENTATION AS TO THE ACCURACY, COMPLETENESS, OR APPLICABILITY OF THESE FIGURES TO YOUR ACTUAL TAX SITUATION. TAX LAWS CHANGE FREQUENTLY AND VARY BY JURISDICTION; FIGURES SHOWN MAY BE OUT OF DATE OR INAPPLICABLE TO YOUR CIRCUMSTANCES.\nAfter the disclaimer block, inside the same section, add a one-line acknowledgment line: \"By using this document, the recipient acknowledges that the figures herein are estimates and not tax advice.\""
      },
      {
        "key": "taxpayer_summary",
        "label": "Taxpayer and Filing Information",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "TAXPAYER AND FILING INFORMATION: Brief block (definition-list style or paragraph):\n  Taxpayer: [taxpayer_name]\n  Tax Year: [tax_year]\n  Filing Status: [filing_status human-readable form, e.g., \"Married Filing Jointly\"]\n  State of Residence: [state_residence]\nEnd with: \"All figures shown are estimates. See IMPORTANT NOTICE above. Final figures depend on actual records, current-year tax tables, and applicable jurisdiction-specific rules to be applied by a licensed professional.\""
      },
      {
        "key": "income_summary",
        "label": "Income Summary",
        "required": true,
        "min_words": 80,
        "max_words": 250,
        "instructions": "INCOME SUMMARY: <table class=\"fin-table\"> with rows for each provided income type. Skip rows where the input amount is 0 or not provided.\n  W-2 Wages: $[gross_income_w2]\n  Self-Employment / 1099 Income: $[gross_income_1099_self_employment]\n  Investment Income (interest, dividends, capital gains): $[gross_income_investment]\n  Other Income: $[gross_income_other]\nSubtotal row using class \"subtotal-row\" labeled \"Estimated Gross Income\" with the sum.\nFormat currency consistently. If all income inputs are 0, state \"No income provided in this estimate.\""
      },
      {
        "key": "deductions",
        "label": "Deductions",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "DEDUCTIONS: Branch on deduction_method:\n  - 'standard': \"Deduction Method: Standard Deduction. The standard deduction for [tax_year] for filing status [filing_status] is set by the IRS and adjusts annually for inflation. The applicable amount must be verified against current IRS Publication 17 or the current year's Form 1040 instructions; this estimate does NOT compute the standard deduction amount automatically. Indicate as: 'Standard Deduction (TO BE VERIFIED — consult current IRS publications or a CPA): $[TBD]'.\"\n  - 'itemized': \"Deduction Method: Itemized Deductions.\" Then <table class=\"fin-table\"> with columns Category | Amount, parsed from itemized_deductions_breakdown input. Subtotal \"Total Itemized Deductions\". Common categories: state and local taxes (SALT, capped), mortgage interest, charitable contributions, medical expenses (above AGI threshold), miscellaneous deductions.\nEnd the section with: \"Reminder: Deduction limits and rules change annually. Some deductions are subject to AGI phase-outs, caps (e.g., SALT $10,000), or substantiation requirements. Confirm with a tax professional.\""
      },
      {
        "key": "taxable_income_calculation",
        "label": "Taxable Income Calculation",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "TAXABLE INCOME CALCULATION: Brief computation block:\n  Estimated Gross Income: $[from Income Summary]\n  Less: Deductions: -$[deduction amount or \"TO BE VERIFIED\"]\n  Estimated Taxable Income: $[gross - deductions, or \"TO BE COMPUTED\" if standard deduction TBD]\nIf standard deduction was used and not yet computed, mark Estimated Taxable Income as \"TO BE COMPUTED — depends on standard deduction figure.\""
      },
      {
        "key": "tax_liability_estimate",
        "label": "Estimated Tax Liability",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ESTIMATED TAX LIABILITY: This section is intentionally NON-COMPUTATIONAL. Render the following exactly:\n  \"Estimated tax liability cannot be precisely calculated in this document without applying the current tax brackets, capital-gains rates, alternative minimum tax thresholds, and self-employment tax rates specific to [tax_year], [filing_status], and [state_residence]. The taxpayer must consult a licensed CPA or tax attorney to determine actual federal and state tax liability. The figures below are placeholders requiring professional computation:\"\nThen a small table:\n  Estimated Federal Income Tax: TO BE COMPUTED BY TAX PROFESSIONAL\n  Self-Employment Tax (if applicable, on $[gross_income_1099_self_employment]): TO BE COMPUTED\n  Alternative Minimum Tax (if applicable): TO BE COMPUTED\n  Estimated State Income Tax ([state_residence]): TO BE COMPUTED\n  Local Tax (if applicable to jurisdiction): TO BE COMPUTED\nDO NOT invent specific bracket calculations. DO NOT estimate \"approximately X%\". This is the responsible boundary of what an automated estimate can responsibly provide."
      },
      {
        "key": "credits_and_payments",
        "label": "Credits and Payments",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "CREDITS AND PAYMENTS: If tax_credits input is non-empty, render as <table class=\"fin-table\"> with columns Credit | Amount. Subtotal \"Total Tax Credits\".\nThen payments-to-date block:\n  Withholdings YTD: $[withholdings_ytd]\n  Estimated Payments YTD: $[estimated_payments_ytd]\n  Subtotal: Total Credits and Payments: $[sum]\nNote: \"Credits eligibility, phase-outs, and refundability depend on the taxpayer's specific situation and current rules. A tax professional must confirm which credits actually apply.\""
      },
      {
        "key": "balance_or_refund",
        "label": "Estimated Balance Due or Refund",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "ESTIMATED BALANCE DUE OR REFUND: Render as a structured calculation block, preserving the TO BE COMPUTED placeholder:\n  Estimated Tax Liability (federal + state + local + SE + AMT): TO BE COMPUTED\n  Less: Total Credits and Payments: -$[sum from prior section]\n  ─────\n  Estimated Balance Due (or Refund): TO BE COMPUTED\n\"If the actual tax liability when computed is less than the credits and payments above, the difference would be a refund. If greater, the difference would be a balance due. Specific amount depends on the figures noted above as TO BE COMPUTED.\""
      },
      {
        "key": "quarterly_safe_harbor",
        "label": "Quarterly Estimated Payments and Safe Harbor",
        "required": true,
        "min_words": 100,
        "max_words": 600,
        "instructions": "QUARTERLY ESTIMATED PAYMENTS AND SAFE HARBOR: Branch on whether prior_year_tax_liability is provided.\nIf provided: \"Safe Harbor Analysis: To avoid an underpayment penalty under IRC §6654, the taxpayer should pay through withholdings and estimated quarterly payments by the year-end deadline at least the LESSER of:\n  (a) 90% of the current year's actual tax liability, or\n  (b) 100% of the prior year's tax liability ($[prior_year_tax_liability]) — increased to 110% if prior year AGI exceeded $150,000 ($75,000 if married filing separately).\nCurrent YTD payments (withholdings + estimated): $[withholdings_ytd + estimated_payments_ytd].\nWhether this meets safe harbor depends on the actual current-year tax liability (currently TBD). Consult a CPA to confirm safe harbor compliance and determine if additional Q3/Q4 estimated payments are advisable. Quarterly due dates for the tax year are typically April 15, June 15, September 15, and January 15 of the following year — verify against current IRS schedule.\"\nIf not provided: \"Safe Harbor Analysis Not Available: Prior-year tax liability is required for safe harbor analysis. To compute whether current YTD payments meet IRC §6654 safe harbor thresholds, provide the prior year's total tax liability. Without this data, the taxpayer should consult a CPA to evaluate underpayment penalty risk.\"\n\nEnd the document with a final reminder paragraph (NOT a separate section): \"Reminder: This document is an estimate prepared for planning purposes only. It is not tax advice. Consult a licensed CPA or tax attorney before relying on these figures, filing any return, or making decisions affecting tax liability. — [prepared_by], [prepared_date].\""
      }
    ]
  }
};

export const SCHEMAS_RAW: Record<string, unknown> = {
  "audit-readiness": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Audit Readiness Report",
    "description": "Structured output schema for an audit readiness report deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "organization",
          "audit_type",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "audit-readiness"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "organization": {
            "type": "string"
          },
          "audit_type": {
            "type": "string"
          },
          "audit_framework": {
            "type": "string"
          },
          "target_audit_date": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "prepared_by": {
            "type": "string"
          },
          "classification": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 6,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "executive_summary",
                "scope_and_objectives",
                "control_environment",
                "documentation_status",
                "gap_analysis",
                "risk_heat_map",
                "remediation_timeline",
                "resource_requirements",
                "appendices"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "control_findings": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "control_id": {
                    "type": "string"
                  },
                  "control_name": {
                    "type": "string"
                  },
                  "status": {
                    "type": "string",
                    "enum": [
                      "ready",
                      "partially_ready",
                      "not_ready",
                      "not_applicable"
                    ]
                  },
                  "gap_description": {
                    "type": "string"
                  },
                  "remediation_action": {
                    "type": "string"
                  },
                  "owner": {
                    "type": "string"
                  },
                  "target_date": {
                    "type": "string"
                  },
                  "priority": {
                    "type": "string",
                    "enum": [
                      "critical",
                      "high",
                      "medium",
                      "low"
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "board-report": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Board Report",
    "description": "Structured output schema for a board report deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "organization",
          "reporting_period",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "board-report"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "organization": {
            "type": "string"
          },
          "reporting_period": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "prepared_by": {
            "type": "string"
          },
          "board_meeting_date": {
            "type": "string"
          },
          "classification": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 6,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "executive_summary",
                "financial_performance",
                "strategic_initiatives",
                "operational_highlights",
                "risk_assessment",
                "compliance_update",
                "forward_outlook",
                "board_actions_required",
                "appendices"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "kpis": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "metric": {
                    "type": "string"
                  },
                  "current_value": {
                    "type": "string"
                  },
                  "prior_value": {
                    "type": "string"
                  },
                  "target_value": {
                    "type": "string"
                  },
                  "trend": {
                    "type": "string",
                    "enum": [
                      "up",
                      "down",
                      "flat"
                    ]
                  },
                  "commentary": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "budget-vs-actual": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/budget-vs-actual.schema.json",
    "title": "Budget vs. Actual Report",
    "description": "Period budget-vs-actual report with revenue and expense variance analysis, threshold-based commentary, and optional forecast revision.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "budget-vs-actual"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      },
      "rows": {
        "type": "array",
        "description": "Per-row financial data. Each row interpretation depends on the deliverable.",
        "items": {
          "type": "object",
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "business-plan": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Business Plan",
    "description": "Structured output schema for a business plan deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "company_name",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "business-plan"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "company_name": {
            "type": "string"
          },
          "industry": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "prepared_by": {
            "type": "string"
          },
          "version": {
            "type": "string"
          },
          "confidentiality_notice": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 9,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "executive_summary",
                "company_overview",
                "market_analysis",
                "competitive_landscape",
                "products_services",
                "marketing_strategy",
                "operations_plan",
                "management_team",
                "financial_projections",
                "funding_requirements",
                "risk_analysis",
                "appendices"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 100
            },
            "financial_tables": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "table_type": {
                    "type": "string"
                  },
                  "title": {
                    "type": "string"
                  },
                  "periods": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "rows": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "label": {
                          "type": "string"
                        },
                        "values": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "capability-statement": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Capability Statement",
    "description": "Structured output schema for a capability statement deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "company_name",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "capability-statement"
          },
          "company_name": {
            "type": "string"
          },
          "cage_code": {
            "type": "string"
          },
          "duns_uei": {
            "type": "string"
          },
          "naics_codes": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "set_aside_status": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "website": {
            "type": "string"
          },
          "contact_name": {
            "type": "string"
          },
          "contact_email": {
            "type": "string"
          },
          "contact_phone": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 4,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "core_competencies",
                "past_performance",
                "differentiators",
                "company_overview",
                "contact_information"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 20
            },
            "bullet_points": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "past_performance_entries": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "client": {
                    "type": "string"
                  },
                  "project": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "outcome": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "cash-flow-forecast": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/cash-flow-forecast.schema.json",
    "title": "Cash Flow Forecast",
    "description": "13-week (configurable) rolling cash flow forecast with weekly bridge, inflow/outflow detail, aging schedules, and threshold-based alerts.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "cash-flow-forecast"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      },
      "rows": {
        "type": "array",
        "description": "Per-row financial data. Each row interpretation depends on the deliverable.",
        "items": {
          "type": "object",
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "change-order": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/change-order.schema.json",
    "title": "Change Order",
    "description": "Formal contractual amendment with running totals on contract sum and contract time, cost-cause categorization, and reservation of rights.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "change-order"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "compliance-report": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Compliance Report",
    "description": "Structured output schema for a compliance report deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "organization",
          "regulatory_framework",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "compliance-report"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "organization": {
            "type": "string"
          },
          "regulatory_framework": {
            "type": "string"
          },
          "assessment_period": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "prepared_by": {
            "type": "string"
          },
          "classification": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 6,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "executive_summary",
                "scope_and_methodology",
                "regulatory_landscape",
                "current_state_assessment",
                "gap_analysis",
                "risk_scoring",
                "remediation_roadmap",
                "appendices"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "findings": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "finding_id": {
                    "type": "string"
                  },
                  "severity": {
                    "type": "string",
                    "enum": [
                      "critical",
                      "high",
                      "medium",
                      "low"
                    ]
                  },
                  "description": {
                    "type": "string"
                  },
                  "recommendation": {
                    "type": "string"
                  },
                  "remediation_deadline": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "contract-package": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Contract Package",
    "description": "Structured output schema for a contract package deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "parties",
          "effective_date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "contract-package"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "parties": {
            "type": "array",
            "minItems": 2,
            "items": {
              "type": "object",
              "required": [
                "name",
                "role"
              ],
              "properties": {
                "name": {
                  "type": "string"
                },
                "role": {
                  "type": "string"
                },
                "address": {
                  "type": "string"
                },
                "signatory_name": {
                  "type": "string"
                },
                "signatory_title": {
                  "type": "string"
                }
              }
            }
          },
          "effective_date": {
            "type": "string",
            "format": "date"
          },
          "governing_law": {
            "type": "string"
          },
          "confidentiality_notice": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 8,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "recitals",
                "definitions",
                "scope_of_work",
                "term_and_termination",
                "compensation",
                "intellectual_property",
                "confidentiality",
                "representations_warranties",
                "indemnification",
                "limitation_of_liability",
                "dispute_resolution",
                "general_provisions",
                "signature_block",
                "exhibits"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 30
            },
            "subsections": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "number": {
                    "type": "string"
                  },
                  "title": {
                    "type": "string"
                  },
                  "text": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "discovery-summary": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Discovery Summary",
    "description": "Structured output schema for a discovery summary deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "case_name",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "discovery-summary"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "case_name": {
            "type": "string"
          },
          "case_number": {
            "type": "string"
          },
          "court": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "prepared_by": {
            "type": "string"
          },
          "confidentiality_notice": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 5,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "executive_summary",
                "discovery_overview",
                "document_review_findings",
                "deposition_highlights",
                "key_evidence",
                "timeline",
                "recommendations"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "exhibits": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "exhibit_id": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  },
                  "relevance": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "engagement-letter": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/engagement-letter.schema.json",
    "title": "Client Engagement Letter",
    "description": "Professional services engagement letter with firm-type variants (legal, accounting, consulting, advisory) and full clause set including scope limitations, conflicts, privilege, retention, withdrawal, and dispute resolution.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "engagement-letter"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "exec-presentation": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Executive Presentation",
    "description": "Structured output schema for an executive presentation deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "organization",
          "date",
          "audience"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "exec-presentation"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "subtitle": {
            "type": "string"
          },
          "organization": {
            "type": "string"
          },
          "presenter": {
            "type": "string"
          },
          "audience": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "confidentiality": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 6,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "title_slide",
                "executive_summary",
                "situation_analysis",
                "strategic_options",
                "recommendation",
                "financial_impact",
                "implementation_timeline",
                "risk_assessment",
                "next_steps",
                "appendix"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 20
            },
            "slide_notes": {
              "type": "string"
            },
            "data_visualizations": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "chart_type": {
                    "type": "string",
                    "enum": [
                      "bar",
                      "line",
                      "pie",
                      "table",
                      "matrix",
                      "flow"
                    ]
                  },
                  "title": {
                    "type": "string"
                  },
                  "data_description": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "expense-report": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/expense-report.schema.json",
    "title": "Expense Report",
    "description": "AP/T&E expense report with itemized lines, mileage, per diem, foreign currency conversions, structured reimbursement calculation, and audit-ready attestation.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "expense-report"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      },
      "expense_lines": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "date",
            "category",
            "amount"
          ],
          "properties": {
            "date": {
              "type": "string"
            },
            "category": {
              "type": "string"
            },
            "merchant": {
              "type": "string"
            },
            "amount": {
              "type": "number"
            },
            "currency": {
              "type": "string"
            },
            "payment_method": {
              "type": "string"
            },
            "accounting_code": {
              "type": "string"
            }
          }
        }
      }
    },
    "additionalProperties": true
  },
  "federal-proposal": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Federal Proposal Response",
    "description": "Structured output schema for a federal proposal response deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "solicitation_number",
          "agency",
          "offeror",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "federal-proposal"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "solicitation_number": {
            "type": "string"
          },
          "agency": {
            "type": "string"
          },
          "office": {
            "type": "string"
          },
          "offeror": {
            "type": "string"
          },
          "cage_code": {
            "type": "string"
          },
          "duns_uei": {
            "type": "string"
          },
          "naics_code": {
            "type": "string"
          },
          "set_aside": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "proposal_valid_through": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 7,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "cover_letter",
                "executive_summary",
                "technical_approach",
                "management_approach",
                "staffing_plan",
                "past_performance",
                "quality_assurance",
                "transition_plan",
                "pricing_volume",
                "compliance_matrix",
                "appendices"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "compliance_references": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "requirement_id": {
                    "type": "string"
                  },
                  "requirement_text": {
                    "type": "string"
                  },
                  "response_location": {
                    "type": "string"
                  },
                  "compliant": {
                    "type": "boolean"
                  }
                }
              }
            },
            "past_performance_refs": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "contract_name": {
                    "type": "string"
                  },
                  "agency": {
                    "type": "string"
                  },
                  "contract_number": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "period": {
                    "type": "string"
                  },
                  "relevance": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "fsr": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/fsr.schema.json",
    "title": "Field Service Report",
    "description": "Technician visit report with SLA timestamps, structured readings (pre/post), parts and materials, safety observations, regulatory compliance codes, and customer attestation.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "fsr"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "incident-report": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/incident-report.schema.json",
    "title": "Incident Report",
    "description": "Formal incident report with severity classification, regulatory reporting obligations (OSHA/EPA), structured persons-involved tracking, contributing factors analysis, and corrective actions chain.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "incident-report"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "investor-memo": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Investor Memo",
    "description": "Structured output schema for an investor memo deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "target_company",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "investor-memo"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "target_company": {
            "type": "string"
          },
          "sector": {
            "type": "string"
          },
          "deal_type": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "prepared_by": {
            "type": "string"
          },
          "fund_name": {
            "type": "string"
          },
          "classification": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 6,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "investment_thesis",
                "company_overview",
                "market_opportunity",
                "financial_analysis",
                "valuation",
                "risk_factors",
                "due_diligence_findings",
                "recommendation"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "financial_data": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "metric": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "period": {
                    "type": "string"
                  },
                  "growth_rate": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "investor-update": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Investor Update",
    "description": "Structured output schema for an investor update deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "company_name",
          "reporting_period",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "investor-update"
          },
          "company_name": {
            "type": "string"
          },
          "reporting_period": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "ceo_name": {
            "type": "string"
          },
          "round": {
            "type": "string"
          },
          "confidentiality_notice": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 5,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "tldr",
                "key_metrics",
                "milestones",
                "challenges",
                "burn_and_runway",
                "product_updates",
                "team_updates",
                "upcoming_priorities",
                "asks"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 20
            },
            "metrics": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "metric": {
                    "type": "string"
                  },
                  "current": {
                    "type": "string"
                  },
                  "previous": {
                    "type": "string"
                  },
                  "change_pct": {
                    "type": "string"
                  },
                  "target": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "invoice": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/invoice.schema.json",
    "title": "Invoice",
    "description": "AP-ready invoice with full structured metadata: tax IDs (supplier and customer), PO reference, contract reference, currency selection, per-line taxability, discount handling, late-payment terms, and structured banking instructions.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "invoice"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      },
      "line_items": {
        "type": "array",
        "description": "Structured line items. Each row contributes to subtotal.",
        "items": {
          "type": "object",
          "required": [
            "description",
            "amount"
          ],
          "properties": {
            "description": {
              "type": "string"
            },
            "quantity": {
              "type": "number"
            },
            "unit_price": {
              "type": "number"
            },
            "amount": {
              "type": "number"
            },
            "taxable": {
              "type": "boolean"
            }
          },
          "additionalProperties": true
        }
      },
      "totals": {
        "type": "object",
        "properties": {
          "subtotal": {
            "type": "number"
          },
          "tax": {
            "type": "number"
          },
          "discount": {
            "type": "number"
          },
          "total_due": {
            "type": "number"
          },
          "currency": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    },
    "additionalProperties": true
  },
  "legal-memo": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Legal Memorandum",
    "description": "Structured output schema for a legal memorandum deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "client_name",
          "date",
          "prepared_by"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "legal-memo"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "client_name": {
            "type": "string"
          },
          "opposing_party": {
            "type": "string"
          },
          "jurisdiction": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "prepared_by": {
            "type": "string"
          },
          "confidentiality_notice": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 5,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "issue_statement",
                "brief_answer",
                "facts",
                "analysis",
                "conclusion"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "citations": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "reference": {
                    "type": "string"
                  },
                  "pin_cite": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "market-analysis": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Market Analysis",
    "description": "Structured output schema for a market analysis deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "target_market",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "market-analysis"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "target_market": {
            "type": "string"
          },
          "geography": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "prepared_for": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "confidentiality_notice": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 6,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "executive_summary",
                "market_overview",
                "industry_trends",
                "target_segments",
                "competitive_landscape",
                "swot_analysis",
                "market_entry_strategy",
                "financial_opportunity",
                "recommendations"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "data_points": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "metric": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "source": {
                    "type": "string"
                  },
                  "year": {
                    "type": "string"
                  }
                }
              }
            },
            "competitors": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "market_share": {
                    "type": "string"
                  },
                  "strengths": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "weaknesses": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "meeting-minutes": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/meeting-minutes.schema.json",
    "title": "Meeting Minutes / Decision Log",
    "description": "Formal meeting minutes with quorum tracking, structured voting records, executive session handling, formal resolutions, recusals, and corporate-secretary attestation.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "meeting-minutes"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "nda": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/nda.schema.json",
    "title": "Non-Disclosure Agreement",
    "description": "Professional mutual or one-way NDA with configurable optional clauses.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "nda"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "one-pager": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "One-Pager",
    "description": "Structured output schema for a one-pager deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "company_name",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "one-pager"
          },
          "company_name": {
            "type": "string"
          },
          "tagline": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "website": {
            "type": "string"
          },
          "contact_email": {
            "type": "string"
          },
          "contact_phone": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 4,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "headline",
                "value_proposition",
                "problem_solution",
                "key_features",
                "traction",
                "market_opportunity",
                "call_to_action"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 10
            },
            "bullet_points": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "stat_callouts": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "label": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "personal-monthly": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/personal-monthly.schema.json",
    "title": "Personal Monthly Summary",
    "description": "Personal financial monthly summary with income, expenses, savings, debt, optional net worth snapshot, goal tracking, and outlook.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "personal-monthly"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "pitch-deck": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Pitch Deck",
    "description": "Structured output schema for a pitch deck deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "company_name",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "pitch-deck"
          },
          "company_name": {
            "type": "string"
          },
          "tagline": {
            "type": "string"
          },
          "round": {
            "type": "string"
          },
          "ask_amount": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "presenter": {
            "type": "string"
          },
          "website": {
            "type": "string"
          },
          "confidentiality_notice": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 8,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "title_slide",
                "problem",
                "solution",
                "market_size",
                "business_model",
                "traction",
                "competition",
                "team",
                "financials",
                "the_ask",
                "closing"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 20
            },
            "slide_notes": {
              "type": "string"
            },
            "visual_description": {
              "type": "string"
            },
            "data_points": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "label": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "context": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "proposal": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/proposal.schema.json",
    "title": "Consulting/Services Proposal",
    "description": "Full services proposal with executive summary, methodology phases, team, past performance, risk register, pricing, and optional compliance matrix for RFP responses.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "proposal"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  },
  "pwp": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Past Performance Write-Up",
    "description": "Structured output schema for a past performance write-up deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "company_name",
          "contract_name",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "pwp"
          },
          "company_name": {
            "type": "string"
          },
          "contract_name": {
            "type": "string"
          },
          "contract_number": {
            "type": "string"
          },
          "client_agency": {
            "type": "string"
          },
          "contract_value": {
            "type": "string"
          },
          "period_of_performance": {
            "type": "string"
          },
          "target_solicitation": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 5,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "project_overview",
                "scope_and_complexity",
                "challenges_and_solutions",
                "outcomes_and_results",
                "relevance_to_opportunity",
                "client_reference"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 50
            },
            "metrics": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "metric": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "context": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "quote": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/quote.schema.json",
    "title": "Quote",
    "description": "Field-service or contractor quote: customer-binding offer with line items, totals, and acceptance block.",
    "type": "object",
    "required": [
      "metadata",
      "sections",
      "line_items",
      "totals"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "customer_name",
          "quote_date",
          "valid_until"
        ],
        "properties": {
          "deliverable_type": {
            "const": "quote"
          },
          "title": {
            "type": "string"
          },
          "customer_name": {
            "type": "string"
          },
          "customer_address": {
            "type": "string"
          },
          "quote_number": {
            "type": "string"
          },
          "quote_date": {
            "type": "string",
            "description": "ISO date"
          },
          "valid_until": {
            "type": "string",
            "description": "ISO date"
          },
          "preparer_name": {
            "type": "string"
          },
          "preparer_contact": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "minItems": 6,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string"
            }
          },
          "additionalProperties": true
        }
      },
      "line_items": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": [
            "description",
            "line_total"
          ],
          "properties": {
            "description": {
              "type": "string"
            },
            "quantity": {
              "type": "number"
            },
            "unit": {
              "type": "string"
            },
            "unit_price": {
              "type": "number"
            },
            "line_total": {
              "type": "number"
            }
          },
          "additionalProperties": true
        }
      },
      "totals": {
        "type": "object",
        "required": [
          "grand_total",
          "currency"
        ],
        "properties": {
          "subtotal": {
            "type": "number"
          },
          "tax": {
            "type": "number"
          },
          "grand_total": {
            "type": "number"
          },
          "currency": {
            "type": "string",
            "default": "USD"
          }
        },
        "additionalProperties": true
      }
    },
    "additionalProperties": true
  },
  "sow": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Statement of Work",
    "description": "Structured output schema for a statement of work deliverable.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "additionalProperties": false,
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title",
          "client_name",
          "provider_name",
          "date"
        ],
        "properties": {
          "deliverable_type": {
            "type": "string",
            "const": "sow"
          },
          "title": {
            "type": "string",
            "minLength": 5
          },
          "sow_number": {
            "type": "string"
          },
          "client_name": {
            "type": "string"
          },
          "provider_name": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "version": {
            "type": "string"
          },
          "master_agreement_ref": {
            "type": "string"
          }
        }
      },
      "sections": {
        "type": "array",
        "minItems": 7,
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string",
              "enum": [
                "purpose_and_background",
                "scope_of_work",
                "deliverables",
                "timeline_and_milestones",
                "acceptance_criteria",
                "roles_and_responsibilities",
                "pricing_and_payment",
                "assumptions_and_constraints",
                "change_management",
                "governance",
                "signature_block"
              ]
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "minLength": 30
            },
            "milestones": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "milestone_id": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  },
                  "due_date": {
                    "type": "string"
                  },
                  "deliverables": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "acceptance_criteria": {
                    "type": "string"
                  },
                  "payment_amount": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "tax-estimate": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://apollomc.ai/schemas/tax-estimate.schema.json",
    "title": "Tax Estimate",
    "description": "Tax estimate for planning purposes only — with prominent IMPORTANT NOTICE, footer-recurring disclaimer, structured income/deduction summaries, conservative non-computational tax liability section, and IRC §6654 safe harbor analysis.",
    "type": "object",
    "required": [
      "metadata",
      "sections"
    ],
    "properties": {
      "metadata": {
        "type": "object",
        "required": [
          "deliverable_type",
          "title"
        ],
        "properties": {
          "deliverable_type": {
            "const": "tax-estimate"
          },
          "title": {
            "type": "string"
          },
          "subtitle": {
            "type": "string"
          },
          "prepared_by": {
            "type": "string"
          },
          "prepared_for": {
            "type": "string"
          }
        },
        "additionalProperties": true
      },
      "sections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "key",
            "label",
            "content"
          ],
          "properties": {
            "key": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "content": {
              "type": "string",
              "description": "Markdown or HTML content for this section."
            }
          },
          "additionalProperties": true
        }
      }
    },
    "additionalProperties": true
  }
};

export const STYLES_RAW: Record<string, Record<string, string>> = {
  "consulting": {
    "consulting-bold": "# Consulting Bold — Style Specification\n**Version:** 1\n**Industry:** Consulting\n\n## Typography\n- Heading font: Montserrat\n- Body font: Open Sans\n- Heading sizes: H1 32pt extra-bold, H2 24pt bold, H3 18pt semibold, H4 14pt semibold\n- Body size: 11pt\n- Line height: 1.55\n- Pull quote size: 20pt Montserrat light italic\n- Stat callout size: 48pt Montserrat extra-bold\n- Caption size: 9pt\n\n## Color palette\n- Primary: #E76F51 — use for headings, primary callouts, key action items, and chart emphasis\n- Secondary: #264653 — use for body section headers, secondary chart series, and footer\n- Accent: #2A9D8F — use for success indicators, positive metrics, and supporting callouts\n- Tertiary: #E9C46A — use for warning states, attention badges, and highlight backgrounds\n- Body text: #264653\n- Background: #FFFFFF\n- Hero section background: #264653 with white text\n- Callout background: #FFF3EE\n- Table header background: #E76F51 with white text\n- Table alternating rows: #FEF9F6\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 0.75in top, 0.75in bottom, 0.85in left, 0.85in right\n- Section spacing: 30pt before H1, 20pt before H2, 14pt before H3\n- Paragraph spacing: 8pt after each paragraph\n- Column structure: flexible — full-width for narrative, two-column for impact metrics, three-column for feature comparisons\n- Page numbers: bottom right, 10pt bold, #E76F51\n- Header: bold orange (#E76F51) bar (4pt) across top of every page\n- Footer: dark (#264653) bar with white page number and document title\n- Hero blocks: full-width #264653 background sections for major transitions\n\n## Formatting conventions\n- Impact statements in large-format stat blocks: 48pt number + descriptor below in 11pt\n- Key takeaways in orange-bordered boxes with #FFF3EE background\n- Icon usage encouraged: checkmarks, arrows, warning triangles for quick visual scanning\n- Before/after comparisons in side-by-side panels with contrasting backgrounds\n- Progress bars and percentage indicators for completion or growth metrics\n- Section dividers: full-width #E76F51 rule (3pt) between major parts\n- No Roman numerals — use bold decimal numbering (1, 2, 3) or no numbering at all\n- Bullet points: filled orange circles for primary, gray circles for secondary\n- Call-to-action boxes: #E76F51 background, white bold text, centered\n\n## Tone and voice\n- Energetic, confident, and action-oriented\n- Write as a transformation advisor who sees opportunity everywhere\n- Lead with impact: \"This initiative will save $2.4M annually\" not \"We have identified potential savings\"\n- Short, punchy sentences for emphasis. Longer sentences for explanation.\n- Use imperatives for recommendations: \"Implement,\" \"Launch,\" \"Accelerate,\" \"Prioritize\"\n- Rhetorical questions permitted to engage readers: \"What would 30% faster delivery mean for your pipeline?\"\n- Superlatives acceptable when supported by data\n- First person plural (\"we\") for engagement team; second person (\"you,\" \"your team\") for client\n- Bold claims backed by bold evidence\n\n## What this style MUST produce\n- High-energy documents that feel more like a pitch than a report\n- At least two large-format stat callouts per document (48pt numbers)\n- Hero sections with dark backgrounds for major document transitions\n- Orange accent elements visible on every page\n- Impact-first writing: conclusions and numbers before explanations\n- Before/after or current-state/future-state comparisons where relevant\n- Call-to-action elements for all recommendation sections\n- Page count: per deliverable type specification\n- All sections in the order specified by the deliverable module\n",
    "consulting-executive": "# Consulting Executive — Style Specification\n**Version:** 1\n**Industry:** Consulting\n\n## Typography\n- Heading font: Georgia\n- Body font: Georgia\n- Heading sizes: H1 30pt bold, H2 22pt bold, H3 16pt semibold, H4 13pt semibold italic\n- Body size: 11.5pt\n- Line height: 1.5\n- Caption and label size: 9pt\n- Chart annotation size: 8.5pt\n\n## Color palette\n- Primary: #0A2463 — use for headings, key metric callouts, chart primary series, and section dividers\n- Secondary: #1E5288 — use for subheadings, secondary chart series, and table headers\n- Accent: #D4AF37 — use for highlight indicators, key figure underlines, and executive summary borders\n- Body text: #1C1C1C\n- Background: #FFFFFF\n- Callout background: #F4F6FA\n- Table header background: #0A2463 with white text\n- Table alternating rows: #F8F9FB\n- Chart palette: #0A2463, #1E5288, #3A7CA5, #D4AF37, #81B29A\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 0.85in top, 0.85in bottom, 1in left, 1in right\n- Section spacing: 24pt before H1, 18pt before H2, 12pt before H3\n- Paragraph spacing: 8pt after each paragraph\n- Column structure: single column for narrative; two-column permitted for key metrics dashboards\n- Page numbers: bottom right, 9pt, \"Page X\" format\n- Header: company logo placeholder left, document classification right, separated by #0A2463 rule (2pt)\n- Footer: thin gold (#D4AF37) accent line, confidential notice centered, 8pt #888888\n- Cover page: required for all documents over 5 pages — title centered vertically, client name, date, prepared by\n\n## Formatting conventions\n- Executive summary box on page 1 or 2: bordered with #D4AF37 left accent (4pt), #F4F6FA background\n- Key metrics presented in large-format callout numbers: 36pt bold #0A2463 with label below in 9pt\n- Section numbering: Roman numerals for top level (I, II, III), decimal for subsections (1.1, 1.2)\n- Recommendations formatted as numbered action items in a distinct box\n- All financial figures right-aligned in tables, formatted with commas and appropriate currency symbols\n- Charts preferred over tables where data supports visualization\n- Appendices numbered separately (Appendix A, B, C)\n- Source citations as footnotes, 9pt, gray text\n\n## Tone and voice\n- Authoritative, measured, and commanding\n- Write as a senior partner addressing a board of directors\n- Lead every section with the conclusion or recommendation, then provide supporting evidence\n- Use \"we recommend,\" \"our analysis indicates,\" \"the evidence supports\"\n- Avoid hedging unless genuinely uncertain — state findings with confidence\n- No jargon without immediate definition in parentheses\n- Quantify everything possible: \"revenue increased 23%\" not \"revenue increased significantly\"\n- Third person for the client organization; first person plural for the consulting engagement\n\n## What this style MUST produce\n- Boardroom-ready documents that convey authority and analytical depth\n- Cover page for documents exceeding 5 pages\n- Executive summary within the first 2 pages with gold accent border\n- At least one key metrics callout per major section (large-format numbers)\n- Numbered action items in a visually distinct recommendations section\n- Professional chart styling using the defined color palette\n- All financial data properly formatted and right-aligned\n- Page count: per deliverable type specification\n- All sections in the order specified by the deliverable module\n",
    "consulting-strategy": "# Consulting Strategy — Style Specification\n**Version:** 1\n**Industry:** Consulting\n\n## Typography\n- Heading font: Calibri\n- Body font: Calibri\n- Heading sizes: H1 26pt bold, H2 20pt semibold, H3 15pt semibold, H4 12pt bold\n- Body size: 11pt\n- Line height: 1.45\n- Table cell text: 10pt\n- Data labels and annotations: 9pt\n- Footnote size: 8.5pt\n\n## Color palette\n- Primary: #006D77 — use for headings, primary chart series, key insight borders, and section dividers\n- Secondary: #83C5BE — use for secondary chart series, callout backgrounds, and progress indicators\n- Accent: #E29578 — use for warnings, risk indicators, and attention-required highlights\n- Body text: #2B2B2B\n- Background: #FFFFFF\n- Insight box background: #EDF6F7\n- Table header background: #006D77 with white text\n- Table alternating rows: #F5FAFA\n- Chart palette: #006D77, #83C5BE, #E29578, #264653, #FFDDD2\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 0.8in top, 0.8in bottom, 0.9in left, 0.9in right\n- Section spacing: 22pt before H1, 16pt before H2, 10pt before H3\n- Paragraph spacing: 7pt after each paragraph\n- Column structure: single column for narrative; two-column for comparative analysis and side-by-side data\n- Page numbers: bottom center, 9pt\n- Header: section title left-aligned, page classification right-aligned, thin #006D77 underline\n- Footer: document title centered, 8pt #AAAAAA\n- Data-heavy pages may use landscape orientation where noted\n\n## Formatting conventions\n- Insight callouts: teal left border (3pt #006D77), #EDF6F7 background, bold lead sentence\n- SWOT and matrix frameworks: 2x2 grid layout with colored quadrant headers\n- Risk indicators: traffic light system — green (#006D77), amber (#E29578), red (#C1121F)\n- All quantitative claims must include source reference as inline citation or footnote\n- Comparison tables: use checkmark and cross icons for feature matrices\n- Process flows: numbered steps in horizontal layout with connecting arrows\n- Section numbering: decimal throughout (1.0, 1.1, 2.0, 2.1)\n- Gantt charts and timelines: horizontal bar format using primary and secondary palette\n- Recommendations: numbered list with priority tag (High/Medium/Low) color-coded\n\n## Tone and voice\n- Analytical, evidence-based, and forward-looking\n- Write as a strategy consultant presenting to a C-suite audience\n- Every assertion backed by data, market evidence, or structured reasoning\n- Use frameworks explicitly: \"Applying Porter's Five Forces,\" \"Using a PESTEL lens\"\n- Prefer \"the data indicates\" and \"market analysis reveals\" over opinion-based language\n- Active voice dominant; passive acceptable for methodology descriptions\n- Concise paragraphs — maximum 5 sentences per paragraph\n- Use \"we identify,\" \"this analysis demonstrates,\" \"the strategic imperative is\"\n- Quantify impact wherever possible: time savings, cost reduction percentages, market share shifts\n\n## What this style MUST produce\n- Strategy-grade documents with visible analytical frameworks and data backing\n- At least one insight callout box per major section\n- Quantitative evidence for every major recommendation\n- Risk or opportunity assessment using traffic light or matrix format\n- Clear numbered recommendations with priority indicators\n- Comparison matrices where alternatives are evaluated\n- Professional chart and data visualization styling\n- Page count: per deliverable type specification\n- All sections in the order specified by the deliverable module\n"
  },
  "finance": {
    "finance-audit": "# Finance Audit — Style Specification\n**Version:** 1\n**Industry:** Finance\n\n## Typography\n- Heading font: Arial\n- Body font: Arial\n- Heading sizes: H1 18pt bold, H2 15pt bold, H3 12pt bold, H4 11pt bold\n- Body size: 10.5pt\n- Line height: 1.4\n- Table text: 9.5pt\n- Finding reference codes: 10pt Consolas monospace\n- Footnote and disclaimer size: 8.5pt\n\n## Color palette\n- Primary: #4A4E69 — use for headings, section dividers, and primary table headers\n- Secondary: #6B7094 — use for subheadings and secondary labels\n- Critical finding: #9B2226 — use for material weakness indicators and critical findings\n- Significant finding: #BC6C25 — use for significant deficiency indicators\n- Observation: #4A4E69 — use for standard observations and improvement recommendations\n- Resolved: #606C38 — use for remediated items and closed findings\n- Body text: #22223B\n- Background: #FFFFFF\n- Finding box background: #F8F8FA\n- Table header background: #4A4E69 with white text\n- Table borders: #D0D0D8\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 1in all sides\n- Section spacing: 18pt before H1, 14pt before H2, 8pt before H3\n- Paragraph spacing: 6pt after each paragraph\n- Column structure: single column for narrative; tabular layouts for findings and control matrices\n- Page numbers: bottom center, \"Page X of Y\", 9pt\n- Header: report title left, \"CONFIDENTIAL\" right, 9pt, #4A4E69 rule below (1pt)\n- Footer: firm name left, engagement number center, date right, 8.5pt #999999\n- Title page: engagement title, entity name, period under audit, report date, issuing firm\n\n## Formatting conventions\n- Finding IDs: sequential code format (e.g., FIN-2026-001, FIN-2026-002) in monospace\n- Each finding structured as: ID, Title, Severity, Criteria, Condition, Cause, Effect, Recommendation, Management Response\n- Severity badges: colored inline labels — MATERIAL WEAKNESS (red), SIGNIFICANT DEFICIENCY (amber), OBSERVATION (gray)\n- Control matrix: table mapping control objectives to test results (Effective / Ineffective / Not Tested)\n- Testing summary statistics: total controls tested, pass rate, findings by severity\n- Trend comparison: current period findings vs. prior period in side-by-side table\n- References to accounting standards: ASC, GAAS, PCAOB citations formatted precisely\n- Workpaper cross-references: (WP-[number]) in parentheses after evidence statements\n- Management response section: indented block with \"Management Response:\" header in italic\n- Appendices: detailed testing procedures, sample selection methodology, acronym glossary\n\n## Tone and voice\n- Objective, precise, and methodical\n- Write as an independent auditor — never express opinion beyond what evidence supports\n- Use audit-standard language: \"We noted,\" \"Testing revealed,\" \"Based on our examination\"\n- Findings stated as facts, not judgments: \"The control did not operate effectively during Q2\" not \"Management failed\"\n- Recommendations are specific and actionable: \"Implement automated three-way match by Q3 2026\" not \"Improve controls\"\n- Management responses recorded without editorial comment\n- Risk language calibrated precisely: \"material weakness\" has a defined threshold, do not use casually\n- No passive-aggressive phrasing — audit findings are professional, not adversarial\n- Disclaimer language for scope limitations stated explicitly: \"Our audit did not extend to\"\n\n## What this style MUST produce\n- Audit-standard reports suitable for filing with regulators or audit committees\n- Title page with engagement details\n- Executive summary of findings by severity with totals\n- Standardized finding format for every issue (ID, severity, criteria, condition, cause, effect, recommendation, response)\n- Severity badges with consistent color coding\n- Control testing matrix with pass/fail results\n- Prior period comparison for repeat findings\n- Workpaper cross-references for all evidence-based statements\n- Acronym glossary and scope description\n- Page count: per deliverable type specification\n- All sections in the order specified by the deliverable module\n",
    "finance-board": "# Finance Board Report — Style Specification\n**Version:** 1\n**Industry:** Finance\n\n## Typography\n- Heading font: Garamond Premier Pro\n- Body font: Garamond\n- Heading sizes: H1 28pt bold, H2 20pt bold, H3 16pt semibold, H4 13pt semibold\n- Body size: 11.5pt\n- Line height: 1.45\n- Financial figure size in callouts: 36pt Garamond bold\n- Table text: 10pt\n- Footnote and disclaimer size: 8.5pt\n\n## Color palette\n- Primary: #0D1B2A — use for headings, primary chart series, KPI callout numbers, and section dividers\n- Secondary: #1B3A5C — use for subheadings, secondary chart series, and table headers\n- Accent: #C9A84C — use for positive performance indicators, quarter highlights, and executive summary borders\n- Alert: #9B2226 — use for negative variances, risk flags, and below-target indicators\n- Body text: #1C1C1C\n- Background: #FFFFFF\n- Executive summary background: #F8F6F0\n- Table header background: #0D1B2A with white text\n- Table alternating rows: #FAFAF8\n- Chart palette: #0D1B2A, #1B3A5C, #4A7C9B, #C9A84C, #7B9E6B\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 0.9in top, 0.9in bottom, 1in left, 1in right\n- Section spacing: 24pt before H1, 16pt before H2, 10pt before H3\n- Paragraph spacing: 7pt after each paragraph\n- Column structure: single column for narrative; two-column for KPI dashboard pages\n- Page numbers: bottom right, 9pt, \"Page X\" format\n- Header: \"BOARD REPORT — CONFIDENTIAL\" left, reporting period right, 9pt, #0D1B2A rule below\n- Footer: company name left, \"Prepared for Board of Directors\" center, date right, 8pt #999999\n- Cover page required: company name, \"Board of Directors Report,\" reporting period, date, preparer\n\n## Formatting conventions\n- KPI dashboard: first content page after cover — grid of 4-6 key metrics in large-format callout boxes\n- Each KPI box: metric name (9pt label), value (36pt bold), trend arrow, vs. prior period comparison\n- Positive variances: #7B9E6B with upward arrow; Negative variances: #9B2226 with downward arrow\n- Financial tables: right-aligned numbers, thousands separator, negative values in parentheses and red\n- Basis point and percentage changes: always include direction indicator (+/-) and color coding\n- Charts: clean axis labels, data labels on key points, legend below chart, grid lines #E8E8E8\n- Waterfall charts for variance analysis using primary and alert colors\n- Executive summary: #F8F6F0 background block with gold left border (#C9A84C, 4pt)\n- Appendices for detailed schedules, numbered (Appendix A, B, C)\n- Disclaimers and forward-looking statement warnings in footer-style text, 8.5pt italic\n\n## Tone and voice\n- Authoritative, measured, and fiduciary in nature\n- Write as a CFO presenting to independent board members and audit committee\n- Lead with performance summary, then drill into detail\n- Factual and data-driven — every statement supported by specific figures\n- \"The Company reported,\" \"Performance reflects,\" \"Management expects\"\n- Neutral on negative results — state the fact and the corrective plan, do not apologize\n- Forward-looking statements clearly labeled: \"Management anticipates\" or \"Projections indicate\"\n- Risk discussion balanced: identify risk, quantify potential impact, describe mitigation\n- No marketing language — this is fiduciary communication\n\n## What this style MUST produce\n- Board-ready financial documents with professional gravitas\n- Cover page with company name, report title, and period\n- KPI dashboard as the first content page\n- Large-format metric callouts with trend indicators and period comparisons\n- Financial tables with proper formatting (right-aligned, parenthetical negatives, red for losses)\n- At least one variance analysis (waterfall chart or bridge) per financial section\n- Executive summary with gold accent border\n- Forward-looking statement disclaimer where projections appear\n- Page count: per deliverable type specification\n- All sections in the order specified by the deliverable module\n",
    "finance-investor": "# Finance Investor — Style Specification\n**Version:** 1\n**Industry:** Finance\n\n## Typography\n- Heading font: Helvetica Neue\n- Body font: Helvetica Neue Light\n- Heading sizes: H1 26pt semibold, H2 20pt medium, H3 15pt medium, H4 12pt semibold\n- Body size: 11pt\n- Line height: 1.5\n- Metric callout size: 40pt Helvetica Neue bold\n- Caption and source text: 9pt\n- Disclaimer text: 8pt\n\n## Color palette\n- Primary: #2D6A4F — use for headings, primary chart series, growth indicators, and key metric callouts\n- Secondary: #40916C — use for secondary chart fills, progress bars, and subheading accents\n- Accent: #95D5B2 — use for positive trend backgrounds, success callouts, and supporting chart series\n- Neutral: #6C757D — use for comparative baselines, benchmark lines, and secondary text\n- Alert: #D62828 — use only for negative indicators and risk warnings\n- Body text: #212529\n- Background: #FFFFFF\n- Highlight section background: #F0FAF4\n- Table header background: #2D6A4F with white text\n- Table alternating rows: #F8FBF9\n- Chart palette: #2D6A4F, #40916C, #95D5B2, #74C69D, #6C757D\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 0.85in top, 0.85in bottom, 0.9in left, 0.9in right\n- Section spacing: 22pt before H1, 16pt before H2, 10pt before H3\n- Paragraph spacing: 8pt after each paragraph\n- Column structure: single column for narrative; two-column for side-by-side metrics and comparisons\n- Page numbers: bottom center, 9pt\n- Header: company logo placeholder left, document type right, thin green rule (#2D6A4F, 1.5pt)\n- Footer: legal disclaimer line centered, 8pt #AAAAAA\n- No cover page required — lead with content immediately\n\n## Formatting conventions\n- Growth metrics front and center: large-format callouts (40pt number) with period-over-period delta\n- Positive deltas: green (#2D6A4F) with upward arrow; Negative: red (#D62828) with downward arrow\n- Revenue and user growth charts: area charts with gradient fill (primary to accent)\n- Milestone timeline: horizontal format showing key achievements with dates and context\n- Financial projections in structured table: quarterly columns, clearly labeled as projected vs. actual\n- Use of forward-looking icons (rocket, chart-up) acceptable in milestone sections\n- Key investor highlights in green-bordered callout boxes (#F0FAF4 background)\n- Capitalization table or ownership summary in clean matrix format\n- Unit economics presented as a funnel or waterfall visualization\n- Sources and methodology footnotes for all projected figures\n\n## Tone and voice\n- Confident, growth-oriented, and transparent\n- Write as a portfolio manager communicating to limited partners or institutional investors\n- Lead with performance and momentum before addressing challenges\n- Honest about headwinds: \"Revenue growth decelerated to 18% due to\" — state cause directly\n- Use growth language naturally: \"momentum,\" \"trajectory,\" \"runway,\" \"inflection point\"\n- Quantify everything: ARR, MRR, burn rate, months of runway, customer LTV, CAC payback\n- \"The portfolio company delivered,\" \"Performance reflects,\" \"We project\"\n- Avoid hype — let the numbers convey the story\n- Risk discussion always paired with mitigation strategy\n- Forward-looking statements flagged: \"Based on current trajectory, we project\"\n\n## What this style MUST produce\n- Investor-grade communications that build confidence through data transparency\n- Growth metrics as the first visual element (large-format callouts)\n- Period-over-period comparisons with directional indicators\n- At least one growth visualization (area chart or line chart) per major financial metric\n- Key milestones in timeline format\n- Clean financial tables with clear actual vs. projected labeling\n- Green accent elements on every page reinforcing growth theme\n- Forward-looking statement disclaimers where projections appear\n- Page count: per deliverable type specification\n- All sections in the order specified by the deliverable module\n"
  },
  "government": {
    "gov-compliance": "# Government Compliance — Style Specification\n**Version:** 1\n**Industry:** Government\n\n## Typography\n- Heading font: Times New Roman\n- Body font: Times New Roman\n- Heading sizes: H1 16pt bold, H2 14pt bold, H3 12pt bold, H4 12pt bold underline\n- Body size: 12pt\n- Line height: 1.5\n- Table text: 10pt\n- Regulation citation text: 11pt italic\n- Footnote size: 10pt\n\n## Color palette\n- Primary: #2C2C2C — use for headings, section rules, and emphasis\n- Secondary: #555555 — use for subheadings and secondary labels\n- Alert: #8B0000 — use for non-compliance findings, critical gaps, and corrective action flags\n- Pass indicator: #2E5E3E — use for compliant status indicators only\n- Body text: #2C2C2C\n- Background: #FFFFFF\n- Finding box background: #FFF5F5 (non-compliant) or #F5FFF5 (compliant)\n- Table header background: #E8E8E8 with #2C2C2C text\n- Table borders: #CCCCCC, 1pt solid\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 1in all sides\n- Section spacing: 18pt before H1, 14pt before H2, 8pt before H3\n- Paragraph spacing: 6pt after each paragraph\n- Column structure: single column exclusively\n- Page numbers: bottom center, \"Page X of Y\", 10pt\n- Header: \"COMPLIANCE ASSESSMENT — [REGULATION NAME]\" centered, 10pt bold, with #2C2C2C rule below\n- Footer: classification level centered (e.g., \"FOR OFFICIAL USE ONLY\"), date right-aligned, 9pt\n- Document control: version number, date, author, and review status on title page\n\n## Formatting conventions\n- Regulatory citations formatted precisely: \"48 CFR 52.204-21(b)(1)(ii)\" — no abbreviation of citation format\n- Finding blocks: bordered boxes with status indicator (COMPLIANT in green, NON-COMPLIANT in red, PARTIAL in amber)\n- Each finding includes: requirement reference, finding description, evidence reviewed, risk level, corrective action\n- Compliance matrix: required for all reports — table mapping each regulation clause to compliance status\n- Risk ratings: Critical / High / Medium / Low with corresponding #8B0000 / #B44A00 / #B8860B / #2E5E3E\n- Evidence references: numbered (E-1, E-2, E-3) with full descriptions in an evidence appendix\n- Corrective action plans: numbered (CAP-1, CAP-2) with owner, deadline, and verification method\n- Cross-reference table of acronyms and definitions required\n- Version control table on page 2 showing all document revisions\n\n## Tone and voice\n- Regulatory, precise, and impartial\n- Write as an independent assessor — never advocate for or against the assessed entity\n- State findings as facts: \"The organization does not maintain\" not \"The organization fails to maintain\"\n- Use regulatory language precisely — do not paraphrase requirements, quote them\n- Passive voice preferred for findings: \"It was observed that\" or \"Evidence indicates that\"\n- No subjective qualifiers: avoid \"significant,\" \"substantial,\" \"adequate\" without defining the threshold\n- Severity language must match the risk framework: \"Critical\" means specific operational impact, not emphasis\n- Recommendations phrased as requirements: \"The organization must implement\" or \"Corrective action is required\"\n- Timeline language must be specific: \"within 30 calendar days\" not \"promptly\"\n\n## What this style MUST produce\n- Audit-grade compliance documents suitable for regulatory submission\n- Compliance matrix mapping every applicable requirement to a finding\n- Finding blocks with standardized format: reference, description, evidence, risk, corrective action\n- Risk-rated findings using the four-tier framework (Critical/High/Medium/Low)\n- Evidence appendix with numbered references\n- Corrective action plan table with owners and deadlines\n- Version control table\n- Acronym and definitions glossary\n- Page count: per deliverable type specification\n- All sections in the order specified by the deliverable module\n",
    "gov-federal-standard": "# Government Federal Standard — Style Specification\n**Version:** 1\n**Industry:** Government\n\n## Typography\n- Heading font: Arial\n- Body font: Arial\n- Heading sizes: H1 16pt bold, H2 14pt bold, H3 12pt bold, H4 12pt bold italic\n- Body size: 12pt\n- Line height: 1.5 (single-spaced body with 6pt paragraph spacing, or double-spaced if RFP requires)\n- Table text: 10pt\n- Header/footer text: 10pt\n- Footnote size: 10pt\n\n## Color palette\n- Primary: #000000 — use for all headings, body text, and rules\n- Secondary: #000000 — no color variation in strict federal standard\n- Body text: #000000\n- Background: #FFFFFF\n- Table header background: #D9D9D9 with black text\n- Table borders: #000000, 1pt solid\n- Table alternating rows: #F2F2F2\n- No accent colors — federal submissions must be reproducible in grayscale\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 1in all sides (unless solicitation specifies otherwise)\n- Section spacing: 18pt before H1, 12pt before H2, 6pt before H3\n- Paragraph spacing: 6pt after each paragraph\n- Column structure: single column only — no multi-column layouts\n- Page numbers: bottom center, \"Page X of Y\" format, 10pt\n- Header: document title or solicitation number centered, 10pt\n- Footer: company name left, \"Page X of Y\" center, date right, 10pt\n- No decorative elements of any kind: no colored borders, no accent bars, no icons\n\n## Formatting conventions\n- Section numbering per FAR/solicitation structure: typically L.1, L.2 or Volume I, Section 1\n- Compliance matrix cross-references: every requirement tagged with solicitation paragraph number\n- Tables: full black borders, no rounded corners, header row bold with gray background\n- All acronyms defined on first use: \"Federal Acquisition Regulation (FAR)\"\n- Acronym glossary required for documents exceeding 10 pages\n- Page limitations strictly observed — if solicitation says 15 pages, produce exactly 15 or fewer\n- Font size restrictions strictly observed — never go below minimum specified in solicitation\n- Headers repeat on every page with solicitation number\n- Figures and tables numbered sequentially (Figure 1, Table 1) with descriptive captions\n- Cross-references by section number: \"See Section L.3.2\" not \"see above\"\n\n## Tone and voice\n- Strictly formal, objective, and compliance-focused\n- Write to the evaluation criteria — every paragraph should map to a scoring factor\n- No marketing language, no superlatives, no subjective claims\n- Use \"the contractor shall,\" \"the offeror proposes,\" \"this approach ensures\"\n- Passive voice acceptable and often preferred: \"The requirement will be met by\"\n- Never use first person — use company name or \"the offeror\"\n- Quantify all experience claims: \"15 years,\" \"47 contracts,\" \"$12M annual volume\"\n- Reference specific past performance by contract number where applicable\n- Zero tolerance for unsupported claims — every assertion needs evidence\n\n## What this style MUST produce\n- Documents that pass federal compliance review without formatting objections\n- Strict adherence to page limits, font sizes, and margin requirements\n- Section numbering that mirrors solicitation structure exactly\n- Compliance cross-reference matrix where applicable\n- Acronym glossary for documents over 10 pages\n- All tables with full borders and sequential numbering\n- No color elements — entire document must be grayscale-reproducible\n- Page count: per deliverable type specification and solicitation limits\n- All sections in the order specified by the deliverable module or solicitation\n",
    "gov-proposal": "# Government Proposal — Style Specification\n**Version:** 1\n**Industry:** Government\n\n## Typography\n- Heading font: Calibri\n- Body font: Calibri\n- Heading sizes: H1 18pt bold, H2 15pt bold, H3 12pt bold, H4 11pt bold italic\n- Body size: 11pt\n- Line height: 1.4\n- Table text: 10pt\n- Callout text: 11pt bold\n- Footer/header text: 9pt\n\n## Color palette\n- Primary: #003366 — use for headings, section dividers, compliance header bars, and table headers\n- Secondary: #4A7FB5 — use for subheading accents, secondary table headers, and figure borders\n- Accent: #B8860B — use sparingly for win theme callouts and discriminator highlights only\n- Body text: #1A1A1A\n- Background: #FFFFFF\n- Compliance callout background: #EBF0F7\n- Table header background: #003366 with white text\n- Table alternating rows: #F5F7FA\n- Win theme box background: #FFFDE8 with #B8860B left border\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 1in all sides\n- Section spacing: 18pt before H1, 14pt before H2, 8pt before H3\n- Paragraph spacing: 6pt after each paragraph\n- Column structure: single column primary; two-column for organizational charts and team layouts\n- Page numbers: bottom center, \"Page X of Y\" format, 9pt\n- Header: solicitation number left, volume/section title center, company name right, 9pt, #003366 underline rule\n- Footer: \"PROPRIETARY — USE OR DISCLOSURE RESTRICTED\" centered, 8pt bold #888888\n- Compliance header bars: navy (#003366) bars with white text labeling each RFP section requirement\n\n## Formatting conventions\n- Section numbering mirrors solicitation structure (L, M, or 1.0, 2.0 as RFP dictates)\n- Compliance callout boxes: #EBF0F7 background with navy left border, containing the RFP requirement text verbatim followed by \"Our Approach:\" response\n- Win theme boxes: gold-bordered (#B8860B), placed at the start of each major section, summarizing the key discriminator\n- Past performance references: structured table format (contract name, agency, value, period, relevance)\n- Organizational charts: boxes with navy headers, clear reporting lines\n- Action verbs in proposal text: \"We will deliver,\" \"Our team provides,\" \"This approach ensures\"\n- Feature-benefit tables: two-column layout mapping features to evaluator benefits\n- Graphics numbered sequentially with descriptive captions below\n- Resumes in standardized format: name, role, years of experience, clearance, relevant projects\n\n## Tone and voice\n- Professional, confident, and evaluator-focused\n- Write directly to the evaluation criteria — every section should score points\n- Use \"we\" for the proposing entity and \"you\" or agency name for the customer\n- Confident without arrogance: \"Our proven approach ensures\" not \"We are the best\"\n- Quantify every claim: specific numbers, dates, dollar amounts, percentages\n- Ghost the competition subtly: \"Unlike approaches that require...\" without naming competitors\n- Demonstrate understanding before proposing solutions: restate the problem, then solve it\n- Use benefit statements: not just \"we will do X\" but \"this delivers Y benefit to the agency\"\n- Compliance language: \"The offeror understands and will comply with\" for mandatory requirements\n\n## What this style MUST produce\n- Proposal-ready documents that align precisely with solicitation evaluation criteria\n- Compliance headers or callout boxes mapping every response to its RFP requirement\n- Win theme boxes at the start of each major section\n- Past performance in structured tabular format\n- Feature-benefit linkage visible throughout\n- Proprietary notice on every page footer\n- Solicitation number in the header of every page\n- Professional organizational charts where team structure is relevant\n- Page count: per deliverable type specification and solicitation limits\n- All sections in the order specified by the deliverable module or solicitation\n"
  },
  "legal": {
    "legal-classic": "# Legal Classic — Style Specification\n**Version:** 1\n**Industry:** Legal\n\n## Typography\n- Heading font: Times New Roman\n- Body font: Times New Roman\n- Heading sizes: H1 28pt bold, H2 22pt bold, H3 18pt bold, H4 14pt bold italic\n- Body size: 12pt\n- Line height: 1.5 (double-spaced for court filings, 1.5 for memos)\n- Footnote size: 10pt\n- Block quote indent: 0.5in from both margins, italic\n\n## Color palette\n- Primary: #1B2A4A — use for headings, section dividers, and key legal citations\n- Secondary: #8B0000 — use sparingly for critical warnings, deadline callouts, or action-required flags\n- Body text: #1A1A1A\n- Background: #FFFFFF\n- Table header background: #1B2A4A with white text\n- Table alternating rows: #F5F5F0\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 1in top, 1in bottom, 1.25in left, 1in right\n- Section spacing: 24pt before H1, 18pt before H2, 12pt before H3\n- Paragraph spacing: 6pt after each paragraph\n- Column structure: single column throughout\n- Page numbers: bottom center, 10pt, format \"Page X of Y\"\n- Header: firm/client name right-aligned, 9pt italic, starting page 2\n- Footer: confidentiality notice centered, 8pt, light gray\n\n## Formatting conventions\n- Legal citations in Bluebook format (italicized case names)\n- Numbered paragraphs for findings, conclusions, and contract clauses\n- Roman numeral section numbering (I, II, III) for top-level sections\n- Alphabetical sub-numbering (a, b, c) for subsections\n- All defined terms in bold on first use\n- Cross-references hyperlinked where format supports it\n- Tables of contents for documents exceeding 5 pages\n- Signature blocks: right-aligned, 3in from left margin, with underline rule\n- Exhibits labeled alphabetically (Exhibit A, Exhibit B)\n\n## Tone and voice\n- Formal, precise, and authoritative\n- Use passive voice where convention demands (e.g., \"It is hereby ordered\")\n- Avoid contractions entirely\n- Prefer established legal phrasing over plain-language alternatives\n- Maintain objective analytical tone in memos; persuasive but measured in briefs\n- Never use first person; use \"Counsel,\" \"the Firm,\" or \"the undersigned\"\n- Hedging language where appropriate: \"it appears,\" \"the weight of authority suggests\"\n\n## What this style MUST produce\n- Professional legal documents indistinguishable from top-tier AmLaw firm output\n- Proper Bluebook citation formatting throughout\n- Consistent Roman numeral and alphabetical numbering hierarchy\n- Confidentiality footer on every page\n- Table of contents for documents over 5 pages\n- Signature block where document type requires it\n- Page count: per deliverable type specification (typically 4-20 pages)\n- All sections in the order specified by the deliverable module\n",
    "legal-minimal": "# Legal Minimal — Style Specification\n**Version:** 1\n**Industry:** Legal\n\n## Typography\n- Heading font: Helvetica Neue\n- Body font: Helvetica\n- Heading sizes: H1 24pt medium weight, H2 18pt medium weight, H3 14pt medium weight, H4 12pt bold\n- Body size: 11pt\n- Line height: 1.5\n- Footnote size: 9pt\n- Monospace for statute references: Courier New 10pt\n\n## Color palette\n- Primary: #333333 — use for headings and all emphasis elements\n- Secondary: #666666 — use for subheadings, captions, and secondary text\n- Accent: #333333 — thin rules and dividers only (no color accents)\n- Body text: #333333\n- Background: #FFFFFF\n- Table header background: #F0F0F0 with #333333 text\n- Table borders: #E0E0E0\n- Highlight background: #FAFAFA\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 1in all sides\n- Section spacing: 28pt before H1, 20pt before H2, 14pt before H3\n- Paragraph spacing: 10pt after each paragraph\n- Column structure: single column exclusively — no sidebars, no multi-column\n- Page numbers: bottom center, 9pt, simple numeral only\n- Header: document title only, left-aligned, 8pt, #999999, starting page 2\n- Footer: page number only — no confidentiality boilerplate unless client requires it\n- Generous whitespace: minimum 16pt between end of section and next heading\n\n## Formatting conventions\n- Section numbering: simple numeric (1, 2, 3) with dot notation for subsections (1.1, 1.2)\n- No decorative elements: no colored boxes, no sidebar accents, no pull quotes\n- Horizontal rules: 0.5pt #E0E0E0 between major sections only\n- Defined terms in bold, no separate definitions appendix — define inline on first use\n- Legal citations in standard Bluebook, minimal formatting\n- Lists: bullet points using em dash (—) character, not circles or squares\n- Tables: minimal borders, header row with light gray background, no vertical rules\n- Signature area: simple \"___\" underline with name and title below, left-aligned\n- Block quotes: 0.75in indent both sides, no italic, no border\n\n## Tone and voice\n- Direct, concise, and efficient\n- Strip all unnecessary verbal padding: no \"it should be noted that\" or \"it is important to recognize\"\n- Active voice mandatory — passive voice only when the actor is genuinely unknown\n- Short sentences preferred; maximum 35 words per sentence as a guideline\n- No contractions in any document type\n- State conclusions first, then provide supporting analysis\n- Use \"the firm advises\" or direct imperatives for recommendations\n- Eliminate redundant legal doublets: use \"modify\" not \"alter and modify\"\n\n## What this style MUST produce\n- Ultra-clean legal documents with maximum information density and minimum decoration\n- No visual clutter: no colored boxes, no accent borders, no decorative elements\n- Whitespace as the primary organizational tool between sections\n- Conclusions and recommendations stated within the first page\n- Em dash bullet lists for all non-sequential enumerations\n- Minimal table styling with no vertical rules\n- Page count: typically at the lower end of deliverable type range due to concise writing\n- All sections in the order specified by the deliverable module\n",
    "legal-modern": "# Legal Modern — Style Specification\n**Version:** 1\n**Industry:** Legal\n\n## Typography\n- Heading font: Garamond Premier Pro\n- Body font: Garamond\n- Heading sizes: H1 26pt semibold, H2 20pt semibold, H3 16pt semibold, H4 13pt bold\n- Body size: 11.5pt\n- Line height: 1.45\n- Footnote size: 9.5pt\n- Caption size: 9pt italic\n\n## Color palette\n- Primary: #3D5A80 — use for headings, horizontal rules, and sidebar accents\n- Secondary: #98C1D9 — use for highlight boxes, callout backgrounds, and table headers\n- Accent: #EE6C4D — use only for urgent flags or action-required indicators\n- Body text: #2E2E2E\n- Background: #FFFFFF\n- Light background blocks: #F7F9FC\n- Table header background: #3D5A80 with white text\n- Table borders: #D1D9E6\n\n## Layout rules\n- Page size: 8.5in x 11in (US Letter)\n- Margins: 0.9in top, 0.9in bottom, 1in left, 1in right\n- Section spacing: 20pt before H1, 16pt before H2, 10pt before H3\n- Paragraph spacing: 8pt after each paragraph\n- Column structure: single column for body; two-column layout permitted for executive summary sidebars\n- Page numbers: bottom right, 9pt, simple numeral\n- Header: thin #3D5A80 rule across top with document title left-aligned, date right-aligned, 8.5pt\n- Footer: thin #D1D9E6 rule with confidentiality note centered, 8pt\n\n## Formatting conventions\n- Section numbering: decimal (1.0, 1.1, 1.2) rather than Roman numerals\n- Key findings presented in light blue (#F7F9FC) callout boxes with left border accent\n- Defined terms in bold on first use, with a definitions appendix for complex documents\n- Legal citations follow Bluebook but with minimal formatting (no full italics on case names — use regular weight)\n- Pull quotes for critical holdings: indented, 13pt, #3D5A80 left border\n- Bullet lists preferred over numbered lists for non-sequential items\n- Tables with rounded header styling and generous cell padding (8pt)\n- Signature blocks: clean horizontal rule, left-aligned\n\n## Tone and voice\n- Professional but accessible — avoid archaic legal phrasing where modern equivalents exist\n- Prefer active voice: \"The court held\" over \"It was held by the court\"\n- Contractions acceptable in client-facing memos (not in filings)\n- Explain legal concepts with brief parenthetical context for non-lawyer stakeholders\n- Maintain analytical rigor while prioritizing readability\n- Use \"we\" when representing the firm's position in advisory memos\n- Direct recommendations encouraged: \"We recommend\" rather than \"It may be advisable\"\n\n## What this style MUST produce\n- Clean, contemporary legal documents that balance professionalism with readability\n- Decimal section numbering throughout (1.0, 1.1, 2.0)\n- At least one callout box per major section highlighting key findings\n- Executive summary on page 1 for documents exceeding 6 pages\n- Consistent header and footer treatment on every page\n- Definitions appendix if more than 5 defined terms are used\n- Page count: per deliverable type specification\n- All sections in the order specified by the deliverable module\n"
  },
  "startup": {
    "startup-bold": "# Startup Bold — Style Specification\n**Version:** 1\n**Industry:** Startup\n\n## Typography\n- Heading font: Poppins\n- Body font: Poppins Light\n- Heading sizes: H1 40pt extra-bold, H2 28pt bold, H3 20pt semibold, H4 16pt medium\n- Body size: 14pt for slides, 11pt for narrative documents\n- Line height: 1.6\n- Stat callout size: 64pt Poppins extra-bold\n- Tagline/hook size: 32pt Poppins semibold\n- Caption: 10pt Poppins light\n\n## Color palette\n- Primary: #FF6B6B — use for headings, hero sections, key stats, and primary CTA buttons\n- Secondary: #4ECDC4 — use for supporting data, secondary charts, success indicators, and contrast elements\n- Dark: #2C3E50 — use for body text, dark slide backgrounds, and footer bars\n- Light accent: #FFE66D — use for highlight markers, callout badges, and attention pops\n- Body text: #2C3E50\n- Background: #FFFFFF for standard slides; #2C3E50 for hero and section divider slides\n- Card background: #FFF5F5\n- Chart palette: #FF6B6B, #4ECDC4, #FFE66D, #45B7D1, #96CEB4\n\n## Layout rules\n- Page size: 16:9 widescreen (13.33in x 7.5in) for presentations; 8.5in x 11in for documents\n- Margins: 0.5in all sides for slides (edge-to-edge feel); 0.8in for documents\n- Section spacing: one concept per slide; 28pt before H1 for documents\n- Content per slide: maximum 4 lines of text or one hero visual\n- Column structure: bold asymmetric layouts — 60/40 splits, full-bleed images with text overlays\n- Slide numbers: bottom right, 12pt bold, #FF6B6B\n- No traditional headers — use full-width color bars as section dividers\n- Dark slides (#2C3E50) alternate with white slides for visual rhythm\n\n## Formatting conventions\n- Hero stats: 64pt number centered with one-word descriptor below in 16pt\n- Full-bleed color sections: coral (#FF6B6B) background with white text for impact statements\n- Problem slide: dark background with single provocative question in 32pt white text\n- Solution slide: white background with product screenshot/mockup and three benefit bullets\n- Market opportunity: oversized number (64pt) with context line — \"$47B and growing\"\n- Traction: counter-style metrics in a horizontal row (Users / Revenue / Growth Rate)\n- Team: bold headshot placeholders with first-name-only labels and one-line bios\n- Roadmap: three-phase horizontal timeline with milestone icons\n- Testimonial/social proof: large quote marks, customer quote in 18pt italic, attribution below\n- CTA/Ask: full coral background slide with white text, specific dollar amount, one line of context\n- Emoji and icons used liberally for energy and quick scanning\n\n## Tone and voice\n- High-energy, direct, and unapologetically ambitious\n- Write as a founder who believes deeply and has the numbers to back it up\n- One-line hooks open every section: \"Insurance is broken.\" \"We fixed hiring.\" \"Growth is not optional.\"\n- Fragment sentences for impact. Full sentences for explanation.\n- Use active, visceral verbs: \"crush,\" \"unlock,\" \"accelerate,\" \"dominate,\" \"ship\"\n- Numbers are always impressive because you frame them right: \"47 customers in 90 days\"\n- Do not hedge — if the data is real, state it boldly\n- Second person to the audience: \"You know this problem.\" \"Your portfolio needs this.\"\n- Humor and personality acceptable: be human, not corporate\n- The ask is bold and clear: \"We need $5M to own this market.\"\n\n## What this style MUST produce\n- High-impact pitch materials that command attention from slide one\n- Alternating dark and light slides for visual energy\n- At least three full-bleed color slides per deck\n- Hero stat callouts at 64pt for every key number\n- Provocative one-liner problem statement\n- Counter-style traction metrics in horizontal layout\n- Bold color palette visible on every slide\n- Clear, confident ask with use-of-funds visualization\n- Maximum 5 words per bullet point on any slide\n- Slide count: per deliverable type specification (typically 12-20 slides)\n- All sections in the order specified by the deliverable module\n",
    "startup-minimal": "# Startup Minimal — Style Specification\n**Version:** 1\n**Industry:** Startup\n\n## Typography\n- Heading font: SF Pro Display (fallback: -apple-system, Segoe UI)\n- Body font: SF Pro Text (fallback: -apple-system, Segoe UI)\n- Heading sizes: H1 32pt medium weight, H2 24pt medium weight, H3 18pt medium weight, H4 14pt semibold\n- Body size: 14pt for slides, 11pt for narrative documents\n- Line height: 1.65\n- Stat callout size: 48pt SF Pro Display light\n- Caption: 10pt SF Pro Text light, tracking +0.5pt\n- Label text: 9pt SF Pro Text medium, uppercase, tracking +1pt\n\n## Color palette\n- Primary: #1A1A2E — use for headings, primary text, and key metric numbers\n- Secondary: #16213E — use for secondary headings and dark section backgrounds\n- Accent: #0F3460 — use for links, interactive elements, and subtle emphasis\n- Highlight: #E94560 — use extremely sparingly — one element per page maximum for critical emphasis\n- Body text: #1A1A2E\n- Secondary text: #6B7280\n- Background: #FFFFFF\n- Alternate section background: #FAFBFC\n- Card background: #F9FAFB with 1pt #E5E7EB border\n- Chart palette: #1A1A2E, #374151, #6B7280, #9CA3AF, #E94560 (accent only)\n\n## Layout rules\n- Page size: 16:9 widescreen for presentations; 8.5in x 11in for documents\n- Margins: 0.8in all sides for slides; 1in for documents\n- Section spacing: 40pt before H1, 28pt before H2, 16pt before H3\n- Paragraph spacing: 12pt after each paragraph\n- Content per slide: one idea, maximum 3 lines of text\n- Column structure: centered single column preferred; two-column for data comparisons only\n- Slide numbers: bottom right, 9pt, #9CA3AF\n- No headers, no footers on slides — absolute minimal chrome\n- Section dividers: extra whitespace (60pt) or a new slide with single centered heading\n- Generous negative space — at least 30% of every slide should be empty\n\n## Formatting conventions\n- Stat callouts: 48pt light weight, centered, with label above in 9pt uppercase tracking\n- No boxes, no borders, no background fills on callouts — numbers stand alone on white space\n- Charts: thin-line only, no fills, no gridlines, axis labels in 9pt #9CA3AF\n- Sparklines preferred over full charts where trend is the message\n- Tables: no borders except light gray bottom rule per row, no header background fill\n- Lists: no bullet characters — use indentation and spacing as the only hierarchy indicator\n- Icons: thin-line stroke style only (1.5pt), monochrome #1A1A2E\n- Team: name and title only, no bios, no headshots — let the names speak\n- Product images: clean device mockups with generous surrounding whitespace\n- No gradients, no shadows, no rounded corners on containers\n- The single red accent (#E94560) reserved for: the revenue number, the ask amount, or one key CTA\n\n## Tone and voice\n- Restrained, intelligent, and quietly confident\n- Write as a second-time founder who does not need to shout\n- Let the product and numbers speak — minimal commentary\n- Short, precise sentences. No filler words. No intensifiers.\n- Do not use \"revolutionary,\" \"disruptive,\" \"game-changing\" or any similar buzzwords\n- State what you built, what it does, and who pays for it\n- Numbers presented cleanly without exclamation: \"$8.2M ARR\" not \"$8.2M ARR!\"\n- Problem stated in one sentence. Solution in one sentence. The rest is evidence.\n- \"We built X. It does Y. Z customers pay for it. We need $A to reach B.\"\n- Sophistication through brevity — every word earns its place\n\n## What this style MUST produce\n- Refined, Apple-aesthetic pitch materials that signal design sophistication\n- Maximum whitespace — at least 30% negative space on every slide\n- No decorative elements: no boxes, no colored backgrounds, no gradients\n- Thin-line charts and sparklines only for data visualization\n- One red accent element per document for the single most important number\n- Ultra-concise text: maximum 3 lines per slide, maximum 8 words per line\n- Clean typography hierarchy as the primary design tool\n- Team presented as names and titles only\n- Product shown in clean device mockups\n- Slide count: per deliverable type specification (typically 12-20 slides)\n- All sections in the order specified by the deliverable module\n",
    "startup-pitch": "# Startup Pitch — Style Specification\n**Version:** 1\n**Industry:** Startup\n\n## Typography\n- Heading font: Inter\n- Body font: Inter\n- Heading sizes: H1 36pt bold, H2 24pt semibold, H3 18pt medium, H4 14pt semibold\n- Body size: 14pt (presentation-optimized, larger for slide readability)\n- Body size for narrative documents: 11pt\n- Line height: 1.6\n- Stat callout size: 56pt Inter bold\n- Caption and source: 10pt Inter light\n\n## Color palette\n- Primary: #3A86FF — use for headings, primary chart series, key metric numbers, and CTA elements\n- Secondary: #8338EC — use for secondary data series, accent gradients, and category highlights\n- Accent: #FF006E — use for urgency indicators, market opportunity callouts, and emphasis arrows\n- Success: #06D6A0 — use for traction metrics, growth arrows, and positive trend indicators\n- Body text: #1A1A2E\n- Background: #FFFFFF\n- Slide section backgrounds: alternate between #FFFFFF and #F0F4FF\n- Card/callout background: #F7F9FF\n- Chart palette: #3A86FF, #8338EC, #FF006E, #06D6A0, #FFB703\n\n## Layout rules\n- Page size: 16:9 widescreen (13.33in x 7.5in) for presentations; 8.5in x 11in for narrative documents\n- Margins: 0.6in all sides for slides; 0.85in for documents\n- Section spacing: one slide per major topic for presentations; 24pt before H1 for documents\n- Content per slide: maximum 6 lines of text OR one key visual with supporting caption\n- Column structure: flexible — single, two-column, or three-column based on content type\n- Page/slide numbers: bottom right, 10pt, #AAAAAA\n- No headers on slides — let content fill the space\n- Footer on slides: company logo bottom-left, slide number bottom-right\n\n## Formatting conventions\n- One big number per slide for key metrics: 56pt stat + one-line context below\n- Market size as a series of concentric circles or TAM/SAM/SOM funnel\n- Traction slide: hockey stick chart or milestone timeline with growth arrows\n- Team slide: headshot placeholders with name, title, and one-line credential\n- Business model: simple flow diagram with revenue arrows in primary blue\n- Competitive landscape: 2x2 matrix with company positioned in upper-right quadrant\n- Use case / customer journey: 3-5 step horizontal flow with icons\n- Ask slide: specific dollar amount, use of funds breakdown as horizontal stacked bar\n- Bullet points: short phrases, not sentences — maximum 8 words per bullet\n- Icons encouraged throughout for quick visual comprehension\n- Gradient backgrounds permitted: #3A86FF to #8338EC for hero slides\n\n## Tone and voice\n- Compelling, visionary, and momentum-driven\n- Write as a founder presenting to Tier 1 VCs\n- Open with the problem — make it visceral and relatable in one sentence\n- Every slide answers one question: \"Why now?\" \"How big?\" \"Why us?\" \"What traction?\"\n- Numbers tell the story: \"$4.2B market,\" \"312% YoY growth,\" \"47 enterprise customers\"\n- Confidence without arrogance: \"We have built\" not \"We are disrupting\" (show, do not claim)\n- Future tense for roadmap: \"By Q4 2027, we will\" — specific and time-bound\n- Social proof: name-drop customers, investors, advisors where applicable\n- The ask is clear and specific: \"$3M Series A to achieve [specific milestone]\"\n- Short sentences. Sentence fragments acceptable on slides. Let visuals carry the detail.\n\n## What this style MUST produce\n- Investor-grade pitch materials that follow the standard VC pitch flow\n- One key message per slide — no information overload\n- Large-format stat callouts for every key metric (56pt numbers)\n- TAM/SAM/SOM market sizing visualization\n- Traction chart showing growth trajectory\n- Competitive positioning matrix\n- Team slide with credentials\n- Clear ask with use-of-funds breakdown\n- Blue-to-purple visual identity consistent throughout\n- Page/slide count: per deliverable type specification (typically 12-20 slides)\n- All sections in the order specified by the deliverable module\n"
  }
};
