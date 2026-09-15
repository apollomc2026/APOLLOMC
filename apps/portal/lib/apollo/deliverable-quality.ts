export type QualityArchetype = 'editorial' | 'proposal' | 'decision-guide' | 'field-record' | 'commercial' | 'financial' | 'presentation'

export interface DeliverableQualityReport {
  archetype: QualityArchetype
  score: number
  passed: boolean
  metrics: {
    sections: number
    tables: number
    tableRows: number
    lists: number
    listItems: number
    words: number
    unresolvedMarkers: number
  }
  violations: string[]
  warnings: string[]
}

const FIELD_RECORDS = new Set(['daily-construction-report', 'final-qc-report', 'project-completion-notice', 'tool-box-talk', 'incident-report'])
const COMMERCIAL = new Set(['quote', 'invoice', 'change-order', 'expense-report', 'budget-vs-actual', 'cash-flow-forecast', 'tax-estimate', 'personal-monthly'])
const FINANCIAL = new Set(['financial-statements-package', 'cash-flow-budget-package'])
const DECISION_GUIDES = new Set(['meeting-minutes', 'legal-memo', 'contract-package', 'contract-intelligence-review', 'audit-readiness', 'compliance-report'])
const PRESENTATIONS = new Set(['pitch-deck', 'exec-presentation'])
const STRATEGIC_REPORTS = new Set(['business-plan','market-analysis','investor-memo','investor-update'])

export function qualityArchetypeForSlug(slug: string): QualityArchetype {
  if (FIELD_RECORDS.has(slug)) return 'field-record'
  if (FINANCIAL.has(slug)) return 'financial'
  if (COMMERCIAL.has(slug)) return 'commercial'
  if (DECISION_GUIDES.has(slug)) return 'decision-guide'
  if (PRESENTATIONS.has(slug)) return 'presentation'
  if (slug === 'proposal' || slug === 'federal-proposal' || slug === 'sow') return 'proposal'
  return 'editorial'
}

export const APOLLO_WORKMANSHIP_STANDARD = `## APOLLO workmanship floor
Every deliverable is a professional decision instrument, not decorated prose. The supplied reference documents establish the minimum quality bar without becoming templates to imitate.

The build order is mandatory: establish factual completeness first; make the content operationally useful second; apply brand and visual decoration third; perform final visual QA last. Styling can clarify approved content, but it may never hide, replace, or compensate for weak content.

- Build a clear page grammar: identity and purpose first, then stable section hierarchy, then page-level continuity through metadata and sign-off.
- Convert comparable facts, scope, quantities, dates, responsibilities, risks, decisions, and status into compact tables or structured lists. Do not bury operational facts in paragraphs.
- Use visual emphasis semantically: status, correction, risk, exception, total, owner, and required action. Decoration without meaning is prohibited.
- Preserve traceability: project/document identifiers, dates, sources or references, owners, approval state, and version context must be easy to locate.
- Make the artifact usable in its real setting. Field records need checklists, measurable results, status and sign-off. Commercial documents need transparent basis, subtotals, totals, assumptions and acceptance. Decision guides need issue-to-action mapping. Proposals need method, governance, risk, investment and next-step structure.
- Prefer disciplined density over empty luxury. Avoid both crowded walls of text and pages with large unexplained voids.
- Never lower content integrity to improve appearance. Unknowns remain explicit; figures remain source-bound; no unsupported claim is introduced.
- Finish every page: no orphan headings, split table headers, ambiguous totals, unlabeled callouts, raw markdown, duplicated titles, or placeholder boilerplate.`

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0
}

function plainText(html: string) {
  return html.replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim()
}

export function auditDeliverableQuality(slug: string, html: string, expectedSections: number): DeliverableQualityReport {
  const archetype = qualityArchetypeForSlug(slug)
  const text = plainText(html)
  const sections = countMatches(html, /<h2\b/gi)
  const tables = countMatches(html, /<table\b/gi)
  const tableRows = countMatches(html, /<tr\b/gi)
  const lists = countMatches(html, /<(?:ul|ol)\b/gi)
  const listItems = countMatches(html, /<li\b/gi)
  const words = text ? text.split(/\s+/).length : 0
  const unresolvedMarkers = countMatches(text, /\b(?:TBD|to be confirmed|not provided)\b/gi)
  const duplicateSectionLeadings = countMatches(html, /<h2\b[^>]*>([\s\S]*?)<\/h2>\s*<(?:h3|p)\b[^>]*>\1<\/(?:h3|p)>/gi)
  const violations: string[] = []
  const warnings: string[] = []

  if (sections < expectedSections) violations.push(`Only ${sections} of ${expectedSections} required sections were rendered.`)
  if (words < Math.max(120, expectedSections * 35)) violations.push('The document is too thin to function as a complete professional deliverable.')

  if (archetype === 'field-record') {
    if (tables < 2 || tableRows < 8) violations.push('Field records require at least two substantive tables and eight total table rows for traceable facts and results.')
    if (lists + tables < 3) violations.push('Field records require structured checklists, scope/status lists, or result tables instead of paragraph-only reporting.')
  } else if (archetype === 'commercial' || archetype === 'financial') {
    if (tables < 1 || tableRows < 4) violations.push('Commercial and financial documents require a substantive itemized table with transparent totals or calculations.')
  } else if (archetype === 'proposal') {
    if (tables < 2 || tableRows < 6) violations.push('Proposals require at least two decision-useful tables covering items such as phases, team, risks, investment, or compliance.')
    if (lists + tables < 4) violations.push('Proposal content is overly narrative; convert method, responsibilities, risks, and next steps into scannable structures.')
    if (unresolvedMarkers > 3) violations.push(`Proposal contains ${unresolvedMarkers} unresolved placeholders and is not client-ready.`)
  } else if (archetype === 'decision-guide') {
    if (tables + lists < 2) violations.push('Decision guides require issue-to-action mapping through tables or structured lists.')
  } else if (archetype === 'presentation') {
    const minimumTables = slug === 'exec-presentation' ? 2 : 1
    if (tables < minimumTables || tableRows < minimumTables * 3) violations.push(`Presentation decks require at least ${minimumTables} substantive decision table${minimumTables === 1 ? '' : 's'} with real rows; pipe-delimited prose is not a table.`)
    if (lists < 4 || listItems < 12) violations.push('Presentation decks require scannable slide-native bullets or decision structures instead of paragraph-led pages.')
    if (words > 1800) violations.push('Presentation decks exceed the executive reading-density ceiling and must be tightened for live delivery.')
  }

  if (STRATEGIC_REPORTS.has(slug)) {
    if (tables < 2 || tableRows < 6) violations.push('Strategic publications require at least two decision-useful tables covering evidence such as market position, milestones, economics, risks, or recommendations.')
    if (lists + tables < 4) violations.push('Strategic publication content is overly narrative; convert comparisons, priorities, risks, and actions into scannable structures.')
  }

  if (FINANCIAL.has(slug) && (tables < 2 || tableRows < 8)) {
    violations.push('Financial packets require at least two substantive tables and eight total rows so schedules, scenarios, and decision figures remain auditable.')
  }
  if (slug === 'federal-proposal') {
    if (!/compliance\s+matrix/i.test(text) || !/requirement/i.test(text)) violations.push('Federal responses require a visible requirement-by-requirement compliance matrix.')
    if (tables < 3 || tableRows < 10) violations.push('Federal responses require substantive compliance, delivery, and responsibility tables rather than proposal narrative alone.')
  }
  if (slug === 'capability-statement') {
    if (tables + lists < 2) violations.push('Capability statements require scannable capabilities and proof structures, not an unbroken marketing narrative.')
    if (!/(?:past performance|proof|evidence|verified)/i.test(text)) violations.push('Capability statements require an explicit proof or past-performance section for credibility.')
    if (words > 1200) violations.push('Capability statements must remain concise enough for rapid executive review.')
  }
  if (slug === 'contract-package') {
    if (!/(?:term and termination|termination)/i.test(text)) violations.push('Agreement packages require explicit term and termination treatment.')
    if (!/(?:signature|acceptance|executed by)/i.test(text)) violations.push('Agreement packages require a visible execution or signature section.')
    if (tables + lists < 2) violations.push('Agreement packages require structured obligations, responsibilities, or commercial terms.')
  }
  if (slug === 'contract-intelligence-review') {
    if (tables < 5 || tableRows < 20) violations.push('Contract intelligence reviews require at least five substantive tables and twenty rows for dates, clauses, obligations, value, risks, and actions.')
    if (!/(?:clause|section|page)\b/i.test(text)) violations.push('Contract intelligence findings require visible clause, section, or page anchors back to the controlling source.')
    if (!/(?:active|expired|upcoming|conditional|unknown)/i.test(text)) violations.push('Contract intelligence reviews require explicit operational status labels for rights, duties, and deadlines.')
  }

  if (unresolvedMarkers > 0) warnings.push(`${unresolvedMarkers} explicit unresolved marker(s) remain and must stay visible to the reviewer.`)
  if (duplicateSectionLeadings > 0) violations.push(`${duplicateSectionLeadings} section heading(s) are duplicated immediately in the body.`)
  if (tables === 0 && words > 500) warnings.push('A long narrative document contains no table; verify that comparable information is not buried in prose.')

  const penalty = violations.length * 18 + warnings.length * 4
  return {
    archetype,
    score: Math.max(0, 100 - penalty),
    passed: violations.length === 0,
    metrics: { sections, tables, tableRows, lists, listItems, words, unresolvedMarkers },
    violations,
    warnings,
  }
}
