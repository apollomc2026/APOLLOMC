# On Spot Solutions — GC Scope & Pre-Proposal Workbook

**Claude Code build spec.**
**Target output:** Branded PDF via ReportLab + companion editable markdown.
**Project folder:** `c:/claude-code/apollomc`
**Client:** Pyramid Hotel Management Group — Marriott-flag property, Commonwealth Ave., MA
**Author role:** On Spot Solutions LLC acting as General Contractor of Record
**Scope of this document:** General contracting / civil / soft costs / project management ONLY. PARCS equipment scope is appended separately by Jon.

---

## 0. Build Instructions for Claude Code

### Environment setup

1. Confirm working directory is `c:/claude-code/apollomc`
2. Create subdirectories: `./output`, `./assets`, `./src`
3. Install requirements if missing:
   ```
   pip install reportlab pillow
   ```
4. Brand logo: if `./assets/OnSpot_FULL_nearTouch.png` is not present, fetch from `https://onspot-solutions.com/assets/OnSpot_FULL_nearTouch.png` and save to that path. Pre-process with PIL to convert black pixels to transparent before embedding.

### Build targets

- `./output/OnSpot_GC_Scope_Workbook.pdf` — branded, print-ready PDF
- `./output/OnSpot_GC_Scope_Workbook.md` — editable markdown companion (for revising pricing inline)
- `./src/build_workbook.py` — the ReportLab builder script

### Brand rules (non-negotiable — pulled from Jon's standing spec)

- White background throughout. No dark themes.
- Cone Orange `#FF6B1A` and Lime Green `#A4D65E` as accents ONLY.
- Charcoal `#2B2B2B` for body text.
- IBM Plex Sans–style typography via Helvetica family.
- On Spot logo PNG must have black-to-transparent PIL pre-processing before embedding.
- Orange-ruled section headers, orange-to-green gradient footer bar on every page.
- Card-based layout for scope items — matches Jon's DSR aesthetic.
- Every page has masthead (wordmark + document type) and footer (company info + page N of M).

### Typography and layout specs

- Page size: US Letter (8.5" × 11")
- Margins: 0.55" left/right, 0.55" top, 0.70" bottom
- Body copy: Helvetica 10pt, 13pt leading
- Section headers: Helvetica-Bold 12pt, Cone Orange number + Charcoal title, orange hairline rule below
- Subsection headers: Helvetica-Bold 10pt, Charcoal
- Tables: 9pt Helvetica, alternating row fill with `#FAFAFA`
- Pricing numbers: Helvetica-Bold, right-aligned in table cells
- Callout boxes: light grey `#E5E5E5` 0.6pt border, 0.15" interior padding

### Self-inspection requirement

After generating the PDF, Claude Code MUST:
1. Rasterize every page using `pdftoppm` or `pdf2image` at 110 DPI
2. Visually inspect each page for: text clipping off right edge, overlapping elements, rule-through-text issues, orphaned headers at page bottom
3. If any issues detected, fix and regenerate. Do not ship until clean.
4. Report to user: "X pages generated, self-inspected, [no issues / issues corrected: list]"

---

## 1. Document Structure

The workbook is organized into 7 sections across approximately 16–20 pages:

1. **Executive Summary** — 1 page
2. **Project Overview & Scope Boundaries** — 2 pages
3. **General Contracting Scope of Work** — 5–6 pages (the heart of the doc)
4. **Schedule & Milestones** — 1 page
5. **Pricing Summary & Budget Ranges** — 2–3 pages
6. **Owner-Provided Items & Credits** — 1 page
7. **Assumptions, Exclusions, and Risk Register** — 2 pages
8. **Appendix: Subcontractor Bid Worksheet** — 1–2 pages (for Jon's internal use during bid-out)

---

## 2. Section-by-Section Content

### SECTION 1 — Executive Summary

**Layout:** Single page. Large title at top ("GC Scope & Pre-Proposal Workbook"). Two-column body below.

**Content (write as prose, not bullets):**

> This workbook defines the General Contracting scope for the parking access and revenue control project at the Pyramid-managed Marriott-flag property on Commonwealth Avenue. On Spot Solutions LLC is positioned as General Contractor of Record — responsible for permitting, civil subcontractor management, project scheduling, dual-IT coordination with Pyramid Hotel Management Group and Marriott brand IT, commissioning, and closeout. The PARCS equipment, software platform, and service contract are documented under a separate scope.
>
> The project comprises approximately 180,000 square feet of asphalt resurfacing, exit plaza concrete repair, garden bed traffic-control extension, ADA path-of-travel compliance work, new induction loops at four lane positions, striping and signage refresh, and the relocation of the existing on-island network enclosure to an off-ground, code-compliant installation. Estimated project duration is 10–14 weeks from notice to proceed, subject to permitting cycle and dual-IT coordination timeline.
>
> **Estimated General Contracting scope range: $640,000 – $980,000** depending on base condition findings from geotechnical cores and the extent of ADA compliance work triggered by resurfacing. A mid-case estimate of **$790,000** is recommended for initial budget anchoring with ownership. PARCS equipment and software scope is additional and will be provided separately.

**Callout box at bottom of page:** Key decision points highlighted —
- Geotechnical cores required before final pricing (base condition unknown)
- Labor classification (union vs. open-shop) depends on building sale timing
- Dual-IT coordination timeline drives critical path

---

### SECTION 2 — Project Overview & Scope Boundaries

**Page 1 of this section:**

**Subsection 2.1 — Property Context**

> Marriott-flag hotel, approximately 665 parking spaces across a main guest surface lot, an admin/Hertz rental car lot operated under an existing partnership, and an exit plaza approach. The existing Parking Boxx access control system has been non-functional for approximately two years; the property currently operates on an informal honor-system collection model resulting in an estimated 50% or greater loss of parking revenue. Current annual parking revenue is $125,000–$150,000; post-project recovered revenue is projected at approximately 2× current performance.

**Subsection 2.2 — On Spot Solutions as General Contractor of Record**

> In this engagement, On Spot Solutions LLC assumes full General Contractor responsibility for the civil, site work, permitting, and project management scope. On Spot Solutions will:
>
> - Retain and manage all civil subcontractors (paving, concrete, striping, landscaping, electrical where required)
> - Pull and close out all required building, electrical, and conservation permits
> - Coordinate dual-path IT approvals with Pyramid Hotel Management Group IT and Marriott brand IT
> - Carry primary liability during the project lifecycle with appropriate General Liability, Umbrella, and Workers Compensation coverage
> - Conduct weekly Owner-Architect-Contractor (OAC) coordination meetings
> - Maintain submittal, RFI, and change-order documentation
> - Manage punch list and closeout, including as-built drawings and O&M documentation

**Subsection 2.3 — Scope Boundaries (what this document covers)**

Build as a two-column table:

| IN SCOPE (this document) | OUT OF SCOPE (separate PARCS workbook) |
|---|---|
| Asphalt mill and overlay, ~180,000 sq ft | PARCS equipment (readers, gates, pay station) |
| Exit plaza concrete repair | PARCS software and credential platforms |
| Garden bed extension for traffic control | Integration with Marriott MFMS |
| ADA path-of-travel compliance | Cellular/network devices beyond enclosure |
| Induction loop saw-cutting and installation (labor only) | Credential platform subscriptions |
| Striping and signage refresh | Atlas diagnostic platform licensing |
| Curb repair and drainage structure resets | 3-year service and maintenance contract |
| Network enclosure relocation off-ground | PARCS commissioning and training |
| Demolition and removal of existing PARCS cabinetry | |
| Minor core drilling for loop pathways | |
| Low-voltage cable pulls through existing pathways | |
| All permits, engineering stamps, survey | |
| Project management and coordination | |
| Traffic control during active work | |

**Subsection 2.4 — Labor Classification Note**

> Labor classification (organized vs. open-shop) is contingent on the timing of the anticipated building sale relative to the project notice to proceed. All pricing in this workbook is presented at **open-shop rates**; a **20% labor premium** applies to the affected line items if the project executes under organized labor requirements. Applicable line items are flagged ◆ throughout Section 3. This is a contractual and operational preference of Pyramid Hotel Management Group — it is not Massachusetts prevailing wage, which applies to public works only (M.G.L. c.149 §§26–27) and does not govern this privately-owned hotel project.

---

### SECTION 3 — General Contracting Scope of Work

This is the core section. Build each scope item as a **card** with:
- Card title bar (Cone Orange background, white bold text) with item number and name
- Description paragraph
- Quantity / unit / assumptions line
- Median subcontractor cost range (for Jon's internal bidding reference)
- Labor classification flag ◆ if applicable

**Card layout example:**
```
┌─────────────────────────────────────────────────────────────┐
│ 3.01  ASPHALT MILL AND OVERLAY                              │ ← orange bar
├─────────────────────────────────────────────────────────────┤
│ Mill existing asphalt to depth of 1.5"-2.0" across the main │
│ guest lot (RED boundary on site aerial). Overlay with 2" of │
│ new asphalt binder and surface course. Tack coat between    │
│ lifts. Final compaction per MassDOT spec.                   │
│                                                              │
│ Quantity:    ~180,000 sq ft (verify via survey)             │
│ Assumption:  Base condition sound; no full-depth            │
│              reconstruction required.                        │
│ Contingent:  Geotech cores must confirm before pricing      │
│              is final.                                       │
│                                                              │
│ Median sub cost:     $3.00/sq ft  →  ~$540,000              │
│ Bargaining range:    $2.50 – $3.75/sq ft                    │
│ Labor classification: Open-shop priced; ◆ union premium     │
│                       applies if triggered                   │
└─────────────────────────────────────────────────────────────┘
```

**All 16 scope items:**

**3.01 — Asphalt Mill and Overlay**
- Qty: ~180,000 sq ft (verify via survey)
- Assumption: Base condition sound; no full-depth reconstruction
- Median sub cost: $3.00/sq ft → ~$540,000
- Bargaining range: $2.50–$3.75/sq ft
- ◆ Union premium applicable

**3.02 — Asphalt Full-Depth Reconstruction (ALTERNATE)**
- Qty: As determined by geotech cores
- Cost only applies if base condition fails inspection
- Median sub cost: $9.00/sq ft → ~$1,620,000 at full replacement
- Range: $7.00–$12.00/sq ft
- Listed as alternate pricing; included for budget awareness only
- ◆ Union premium applicable

**3.03 — Exit Plaza Concrete Repair**
- Qty: Partial panel replacement, 4–8 panels estimated
- Includes crack sealing for remaining plaza
- Median sub cost: $15,000
- Range: $8,000–$28,000
- Note: Full plaza tear-out and re-pour would run $50,000–$70,000 if required
- ◆ Union premium applicable

**3.04 — Garden Bed Extension**
- Qty: Per aerial markup (GREEN boundary)
- Curb work, fill, plantings
- Cast-in-place concrete curb assumed; granite curb adds $3,000–$5,000
- Median sub cost: $9,000
- Range: $6,000–$15,000

**3.05 — Loop Saw-Cutting and Installation (Labor Only)**
- Qty: 4 lane positions (1 entry, 1 exit, reversible center, pay station if separate)
- Includes saw-cut, loop wire placement, sealant, testing
- Loop wire material cost in PARCS scope
- Median sub cost: $2,200 total ($550/loop)
- Range: $1,800–$3,000

**3.06 — Minor Core Drilling**
- Qty: As required for loop pathways and cable routing
- Existing conduit pathways reused where possible
- Median sub cost: $1,800
- Range: $1,200–$3,000

**3.07 — Striping and Signage Refresh**
- Qty: ~665 spaces + directional arrows + ADA symbols + fire lane markings
- Paint striping assumed; thermoplastic adds ~40% if specified by Marriott brand
- Median sub cost: $11,000
- Range: $8,000–$16,000
- Alternate (thermoplastic): $15,000

**3.08 — ADA Path-of-Travel Compliance**
- Qty: Triggered by resurface; 6–12 ramp cuts estimated plus detectable warning panels
- Assumption: Existing conditions close to compliant; major pathway rebuild not anticipated
- Median sub cost: $22,000
- Range: $12,000–$45,000
- **Risk note:** This is the line with the most budget exposure if existing ADA compliance is far off. Budget toward upper range.
- ◆ Union premium applicable

**3.09 — Curb Repair (Spot Work)**
- Qty: As needed at existing curb failures
- Median sub cost: $6,000
- Range: $3,000–$12,000
- ◆ Union premium applicable

**3.10 — Drainage Structure Resets**
- Qty: 2–3 catch basin frames and grates
- Required to match new pavement grade after mill and overlay
- Median sub cost: $4,000
- Range: $2,000–$8,000
- ◆ Union premium applicable

**3.11 — Network Enclosure Relocation**
- Existing on-island enclosure relocated off-ground to code
- Includes new enclosure, mounting, electrical make-good
- Median sub cost: $3,500
- Range: $2,000–$5,000

**3.12 — Existing PARCS Equipment Demolition & Removal**
- Qty: All Parking Boxx equipment at 4 lane positions + pay station shell
- Owner-provided dumpster on site
- Scrap recovery credit possible; not assumed in pricing
- Median sub cost: $4,000 (labor only)
- Range: $2,500–$7,000

**3.13 — Low-Voltage Cable Pulls**
- Qty: Through existing pathways to 4 lane positions, pay station, network cabinet
- Existing pathway reuse keeps this scope minimal
- Median sub cost: $6,000
- Range: $4,000–$10,000
- **Risk note:** If any existing pathway is blocked or collapsed, cost moves up fast — budget contingency covers.

**3.14 — Traffic Control During Civil Work**
- Flagger details, temporary signage, cone/barrel work zones for Commonwealth Ave-facing lane work
- Median sub cost: $6,000
- Range: $3,000–$12,000
- Dependent on how many days require active traffic control

**3.15 — Site Survey / Measure-Up**
- Stamped plat if Pyramid cannot provide one
- Critical for final asphalt quantity and ADA compliance scope
- Median sub cost: $3,500
- Range: $2,500–$6,000

**3.16 — Geotechnical Coring**
- 4–6 cores across the main lot
- Determines mill-and-overlay vs. full-depth reconstruction path
- **MUST be completed before final GMP is issued**
- Median sub cost: $3,200
- Range: $2,500–$4,500

---

### SECTION 4 — Schedule & Milestones

Single-page Gantt-style visual. Build as a simple horizontal timeline table with weeks across the top and phases down the side. Use Cone Orange fill for active work bars, Lime Green for milestones.

**Phases:**
- Weeks 1–2: Pre-construction (survey, cores, permits initiated, IT kickoff)
- Weeks 2–4: Engineering, permit approval, subcontractor bid-out and award
- Weeks 3–4: Existing PARCS equipment demolition and removal
- Weeks 4–9: Civil work — asphalt, concrete, curbing, drainage
- Weeks 9–10: Striping, signage, ADA work
- Weeks 8–11: Network enclosure relocation, cable pulls, PARCS install (parallel)
- Weeks 11–12: Commissioning and integration testing
- Weeks 12–14: Training, punch list, closeout
- Week 14: Substantial completion / go-live

**Critical path callouts:**
- Geotechnical cores must complete by end of Week 1 or final pricing slips
- Dual-IT approval must close by end of Week 3 or integration testing slips
- Asphalt work is temperature-sensitive; October 15 is the practical cutoff for MassDOT-spec laydown

---

### SECTION 5 — Pricing Summary & Budget Ranges

**Page 1 — Direct Subcontractor Costs Rollup Table**

Build as a clean pricing table with four columns: Scope Item | Low | Mid | High. All 16 items from Section 3 listed. Totals row at bottom in Cone Orange bold.

| Line | Scope Item | Low | Mid | High |
|---|---|---|---|---|
| 3.01 | Asphalt Mill & Overlay | $450,000 | $540,000 | $675,000 |
| 3.03 | Exit Plaza Concrete Repair | $8,000 | $15,000 | $28,000 |
| 3.04 | Garden Bed Extension | $6,000 | $9,000 | $15,000 |
| 3.05 | Loops (Labor) | $1,800 | $2,200 | $3,000 |
| 3.06 | Core Drilling | $1,200 | $1,800 | $3,000 |
| 3.07 | Striping & Signage | $8,000 | $11,000 | $16,000 |
| 3.08 | ADA Compliance | $12,000 | $22,000 | $45,000 |
| 3.09 | Curb Repair | $3,000 | $6,000 | $12,000 |
| 3.10 | Drainage Resets | $2,000 | $4,000 | $8,000 |
| 3.11 | Network Enclosure | $2,000 | $3,500 | $5,000 |
| 3.12 | Demo & Removal | $2,500 | $4,000 | $7,000 |
| 3.13 | Low-Voltage Cable | $4,000 | $6,000 | $10,000 |
| 3.14 | Traffic Control | $3,000 | $6,000 | $12,000 |
| 3.15 | Survey | $2,500 | $3,500 | $6,000 |
| 3.16 | Geotech Cores | $2,500 | $3,200 | $4,500 |
| | **Direct Subtotal** | **$508,500** | **$637,200** | **$849,500** |

Line 3.02 (full-depth reconstruction alternate) documented but not summed.

**Page 2 — Soft Costs, Project Management, Contingency, and Markup**

Build as a summary table with narrative explanation:

| Category | Basis | Amount |
|---|---|---|
| Civil engineering stamp & permit drawings | Fixed | $11,000 |
| Permit fees (building, electrical, conservation) | Fixed est. | $5,000 |
| Project management (internal labor, meetings, dual-IT coordination) | 10% of direct | $63,720 |
| Project contingency | 15% of direct (unknowns: base condition, ADA, IT) | $95,580 |
| Bonding (if required by Pyramid) | 1.5% of contract value | $11,450 |
| Builders risk insurance | 0.4% of contract value | $3,050 |
| On Spot GC markup | 15% on subtotal | $123,450 |
| | | |
| **Total mid-case estimate** | | **~$950,450** |

**Notes under the table:**
- GC markup range is 12%–18%; 15% shown. Adjust per Jon's negotiation position.
- Project management may be structured as line item or rolled into markup; shown as line for transparency.
- Bonding only applies if Pyramid contract requires payment/performance bond.
- Contingency percentage should be reviewed after geotech cores reduce base-condition uncertainty.

**Page 3 — Budget Envelope Summary**

Three scenarios presented as a clean visual:

**Low-case (mill-and-overlay, minimal ADA, favorable conditions): ~$640,000**
**Mid-case (mill-and-overlay, moderate ADA, reasonable conditions): ~$790,000–$950,000**
**High-case (full-depth reconstruction, extensive ADA, complex conditions): ~$1,400,000–$2,400,000**

**Recommended initial budget anchor for ownership discussion: $790,000–$850,000** for mid-case scenario with 10% ownership-held contingency above that for unknowns.

Callout box: "Geotechnical cores will materially narrow this range. Recommended to authorize cores as first pre-construction expenditure."

---

### SECTION 6 — Owner-Provided Items & Credits

Single page. Build as a table with item, estimated value if On Spot had to provide, and the credit to ownership for providing.

**Layout header:** "Items Pyramid Hotel Management Group commits to providing, with estimated credit values for cost transparency."

| Item | On Spot Cost if Provided | Credit to Owner |
|---|---|---|
| Power to cabinets | $4,000–$8,000 | Included |
| Conduit pathways | $12,000–$20,000 | Included |
| Fiber to PARCS locations | $6,000–$12,000 | Included |
| Internet service | $1,200/yr recurring | Included |
| Static IPs / DHCP scope | $0 (administrative) | Included |
| Dumpster on site | $3,000–$5,000 | Included |
| After-hours site access | Schedule flexibility | Included |
| Staging area | $2,000–$4,000 | Included |
| | **Estimated total credit value:** | **$28,000–$49,000** |

**Narrative note below table:**
> The items above represent real project cost that On Spot Solutions would otherwise carry and mark up. By providing these items directly, Pyramid Hotel Management Group reduces total project cost by an estimated $28,000–$49,000 and accelerates the schedule by 2–3 weeks. This credit is reflected in pricing and is not double-counted elsewhere in the budget.

**Operating constraint callout:**
> Active civil work is limited to 9:00 AM – 5:00 PM for noise compliance. After-hours site access is available for non-noise-generating activities including network work, PARCS configuration, and interior commissioning.

---

### SECTION 7 — Assumptions, Exclusions, and Risk Register

**Page 1 — Key Assumptions and Exclusions**

Two-column layout.

**Assumptions (left column):**
1. Existing asphalt base condition is sound and suitable for mill-and-overlay; pending geotech confirmation
2. Existing underground conduit pathways are intact and reusable for low-voltage pulls
3. Power to PARCS cabinet locations exists or will be provided by owner at suitable capacity
4. ADA compliance work scope limited to ramp cuts, detectable warning panels, and grade matching; not path-of-travel rebuild
5. No environmental hazards (lead paint, asbestos, contaminated soil) present in work areas
6. No structural repairs required at exit plaza beyond surface concrete work
7. Dual-IT coordination (Pyramid + Marriott brand) completes within 3 weeks of project kickoff
8. Permit cycle completes within 4 weeks of submission
9. No night work required; all civil work within 9a–5p window
10. Building sale timing does not trigger mid-project labor classification change

**Exclusions (right column):**
1. Environmental remediation of any kind
2. Structural repairs beyond surface concrete
3. Stormwater management improvements beyond grade-matching
4. Landscaping beyond the defined garden bed extension
5. Parking structure or retaining wall work
6. Electrical service upgrades beyond cabinet-level power drops
7. Gas, water, or sewer utility work
8. Marriott brand material upgrades beyond standard commercial spec
9. Fire line or life safety system modifications
10. PARCS equipment, software, and service contract (separate scope)

**Page 2 — Risk Register**

Table format:

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Base condition fails; full-depth reconstruction required | Medium | High (+$1M) | Geotech cores in pre-construction phase |
| 2 | Dual-IT coordination extends beyond 3 weeks | High | Medium (2–4 week schedule slip) | Kickoff IT meeting in Week 1; escalation path to ownership |
| 3 | Building sale mid-project triggers labor reclassification | Medium | Medium (+20% labor on affected items) | Contract clause: change-of-ownership labor adjustment as change order |
| 4 | ADA scope exceeds budget | Medium | Medium–High (+$25K) | Contingency allocation; building dept. pre-review |
| 5 | Permit cycle delays | Medium | Medium (2–6 week slip) | File early; engage expeditor if needed |
| 6 | Weather delays beyond October 15 asphalt cutoff | Medium | High (winter pause, spring restart) | Aggressive pre-construction schedule; weather contingency in timeline |
| 7 | Existing conduit pathways compromised | Low–Medium | Medium (+$10–20K) | Inspect pathways during demo phase; contingency holds |
| 8 | Hidden utilities during core drilling or excavation | Low | Low–Medium | Dig Safe / utility markout before any subsurface work |
| 9 | Marriott brand standards impose material upgrade late in design | Low | Low ($10–15K) | Confirm brand standards in pre-construction phase |
| 10 | Subcontractor default or schedule failure | Low | Medium (rebid delay) | Vet three subs per scope; hold alternates |

---

### SECTION 8 — Appendix: Subcontractor Bid Worksheet

This is a **working tool for Jon** — not meant for owner-facing delivery. Build as a clean fillable table so Jon can record sub bids as they come in and compare against the median ranges in this workbook.

**Page 1 format:**

For each major scope item (3.01 through 3.16), provide a row with:
- Scope Item number and name
- Median estimate from Section 3
- Bid 1: Subcontractor name, date received, amount, notes
- Bid 2: Subcontractor name, date received, amount, notes
- Bid 3: Subcontractor name, date received, amount, notes
- Selected: which bid and why

**Page 2 — Running Total Tracker:**

Simple table showing:
- Scope Item | Median Estimate | Selected Bid | Delta (+/-) | Notes

Plus a totals row at bottom tracking running variance from the mid-case estimate.

**Header callout at top of appendix:**
> **INTERNAL WORKING DOCUMENT — NOT FOR OWNER DISTRIBUTION.** Use this worksheet during subcontractor bid-out to track quotes against median estimates. Delta column flags items coming in significantly above or below the workbook estimate, which may indicate scope misalignment or opportunities for renegotiation.

---

## 3. Final Assembly Notes for Claude Code

1. Build the ReportLab script (`./src/build_workbook.py`) with modular page functions — one function per section — so pricing edits can be made inline without regenerating the whole script.
2. Pricing data should be defined as a Python dict at the top of the script so it can be updated in one place and flow through all tables.
3. After successful PDF generation, also export the markdown companion (`./output/OnSpot_GC_Scope_Workbook.md`) containing all narrative content in editable form. Pricing tables in markdown format.
4. Self-inspect every page (see Section 0). Report findings.
5. Do NOT include PARCS equipment scope, service contract scope, or Atlas platform references in this document — those are separate scope per Jon's direction.
6. Version stamp in footer: "v1.0 — pre-construction draft — [generation date]"
7. Document classification stamp on cover: "WORKING DRAFT — PRICING CONTINGENT ON GEOTECHNICAL FINDINGS"

## 4. Handoff

When complete, present:
- The PDF for review
- A one-paragraph summary of what was built and any decisions made
- A flag list of any assumptions Claude Code had to make that Jon should review
- File locations for both the PDF and markdown versions

---

**END OF CLAUDE CODE BUILD SPEC**
