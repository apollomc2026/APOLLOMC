# APOLLO deliverable quality bar

Status: mandatory internal-release standard. The reference set is evidence of the minimum level of workmanship; it is not a template library and its visual language must not be copied indiscriminately.

## Governing sequence

1. Content integrity: reconcile supplied facts, evidence, calculations, scope boundaries, unknowns, and source status. No styling work can cure a factual defect.
2. Operational usefulness: organize the approved content for the reader's actual decision or field task. Convert comparable information into tables, checklists, issue maps, action registers, and sign-off blocks where appropriate.
3. Decoration and brand: apply the selected brand system, page grammar, visual hierarchy, semantic color, typography, spacing, and restrained document furniture only after the first two gates pass.
4. Rendered QA: inspect the final pages for overflow, split headers, orphan headings, ambiguous totals, broken controls, low contrast, excess whitespace, duplicated marks, and missing continuity metadata.

## Evidence set and transferable lessons

| Reference family | Evidence inspected | Transferable quality floor |
|---|---:|---|
| Noctoptics contract-redline system | 28 pages across the synchronized meeting guide, integrated internal copy, and meeting copy | Separate facilitator guidance from the marked source; synchronize one marker system across artifacts; distinguish add, replace/delete, and correct/clarify semantically; explain current language, risk, desired outcome, and exact talk track; close with an action path. |
| Site-walk assessment | 4 pages | Use a field-complete intake instrument: identification, access/ownership, installed assets, proposed scope, infrastructure verification, loop/camera schedules, commercial risks, owner/due actions, photo references, and sign-off. Provide writable space without sacrificing section navigation. |
| Cabin scope and estimate | 6 pages across scope/materials and phase estimate | Tie narrative scope to itemized materials, labor basis, mobilization, subtotals, allowances, assumptions, exclusions, total, and acceptance. Keep commercial arithmetic transparent and visually dominant at the decision point. |
| Nashua field records | 13 pages across QC, toolbox talk, and daily report | Establish continuity across related documents through job identifiers, dates, locations, people, reference documents, test criteria, instruments, measurable results, status cells, safety controls, work chronology, next-day plan, certification, and signatures. |

## Universal workmanship rules

- Every page must reveal what the artifact is, whose work it records, and where the reader is in the document.
- Identity, purpose, document identifier, date/version, and preparation or ownership context must be discoverable without hunting.
- Page density follows the work. High-information forms may be dense; executive narrative gets more air. Neither ornamental emptiness nor unreadable compression is acceptable.
- Tables are used for comparison, quantities, chronology, responsibility, status, risk, and calculations. Paragraphs are used for reasoning, explanation, and nuance.
- Color has a job. It identifies brand or meaning such as accepted, pending, exception, correction, or deletion. It is not filler.
- Unknowns remain explicit and visible. APOLLO never invents a value to make a page look complete.
- A related document set shares identifiers, terminology, numbering, dates, and status logic.
- Every actionable artifact ends with ownership, next action, acceptance, certification, or sign-off appropriate to its purpose.

## Archetype gates

### Field records

- At least two substantive tables and eight data rows across the record.
- At least three operational structures across tables, checklists, scope/status lists, results, action registers, or sign-off.
- Measurable criteria and actual results remain distinguishable.
- PASS, VERIFIED, PENDING, OPEN, EXCEPTION, and failure states receive semantic—not decorative—treatment.

### Commercial and financial documents

- At least one substantive itemized/calculation table.
- Basis, quantities or rates, subtotals, adjustments, and final totals are unambiguous.
- Assumptions, exclusions, validity, and acceptance are visible near the decision boundary.
- Financial packages retain deterministic calculation verification in addition to workmanship review.

### Proposals and statements of work

- At least two decision-useful tables and multiple scannable structures.
- The problem, desired outcome, method/phases, deliverables, responsibilities, dependencies, risk, investment, and next step remain connected.
- Brand and confidence come from specificity and organization, never unsupported adjectives.

### Decision guides and review artifacts

- At least two structured issue/action mechanisms.
- Each issue connects source location, present condition, consequence or risk, intended outcome, exact proposed action/language, owner, and disposition.
- When multiple artifacts are produced for one meeting, marker identifiers and order must synchronize across the set.

## Enforcement in APOLLO

- `deliverable-quality.ts` classifies each deliverable and audits rendered content structure before visual rendering.
- A schema-valid draft that fails workmanship receives one focused Claude repair pass preserving facts and schema.
- A second failure stops execution with a quality error; the pipeline does not decorate or deliver substandard content.
- The durable validation checkpoint records archetype, score, metrics, and visible warnings.
- The PDF renderer then applies brand-specific decoration, semantic status cells, real brand marks, stable headers/footers, checklist controls, and print-safe table behavior.
- Final browser/PDF inspection remains required for release evidence; a numeric score is not a substitute for looking at the pages.
