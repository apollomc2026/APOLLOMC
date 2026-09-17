import type { DocumentWorkOrder } from './contracts'

export interface FinancialVerificationReport {
  required: boolean
  checks: string[]
  verified_values: number
}

function parseMoney(raw: string): number {
  const trimmed = raw.trim()
  const negative = /^\(.*\)$/.test(trimmed) || trimmed.startsWith('-')
  const numeric = Number(trimmed.replace(/[,$()\s]/g, ''))
  if (!Number.isFinite(numeric)) throw new Error(`invalid financial value '${raw}'`)
  return negative ? -Math.abs(numeric) : numeric
}

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.005
}

function rows(raw: unknown, expectedColumns: number): string[][] {
  if (typeof raw !== 'string') throw new Error('financial schedule must be text')
  const parsed = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    const columns = line.split('|').map((value) => value.trim())
    if (columns.length !== expectedColumns) throw new Error(`financial row ${index + 1} must contain ${expectedColumns} pipe-delimited columns`)
    return columns
  })
  const header = ['month', 'opening cash', 'inflows', 'outflows', 'net change', 'closing cash']
  return parsed.filter((columns, index) => {
    if (columns.every(column => /^:?-{3,}:?$/.test(column))) return false
    if (index !== 0) return true
    return !columns.every((column, columnIndex) => column.toLowerCase() === header[columnIndex])
  })
}

function normalizedFigure(raw: string): string {
  return raw.replace(/\s/g, '').replace(/\$/g, '')
}

function htmlText(contentHtml: string): string {
  return contentHtml
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
}

function associationText(value:string):string {
  return value.replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/[^a-z0-9]+/gi,' ').trim().toLowerCase()
}

function verifyNarrativeFields(order:DocumentWorkOrder,contentHtml:string,fields:string[]):number {
  const documentText=associationText(contentHtml)
  let verified=0
  for(const field of fields){
    const raw=order.fields[field]
    if(typeof raw!=='string'||!raw.trim())continue
    const segments=raw.split(/\r?\n|\s*;\s*/).map(value=>value.trim()).filter(Boolean)
    for(const [index,segment] of segments.entries()){
      const approved=associationText(segment.replace(/\|/g,' '))
      if(!approved||!documentText.includes(approved))throw new Error(`rendered ${order.deliverable_type} changed or omitted ${field} item ${index+1}`)
      verified+=1
    }
  }
  return verified
}

function verifyScheduleRowAssociation(order:DocumentWorkOrder,contentHtml:string,fields:string[]):number {
  const documentText=associationText(contentHtml)
  let verified=0
  for(const field of fields){
    const raw=order.fields[field]
    if(typeof raw!=='string'||!raw.trim())continue
    const parsed=rows(raw,6)
    for(const [index,columns] of parsed.entries()){
      const approved=associationText(columns.join(' '))
      if(!approved||!documentText.includes(approved))throw new Error(`rendered ${order.deliverable_type} changed, reordered, or omitted ${field} row ${index+1}`)
      verified+=1
    }
  }
  return verified
}

function financialValues(contentHtml: string): number[] {
  return (htmlText(contentHtml).match(/\(?-?\$?\s*\d[\d,]*(?:\.\d+)?\)?/g) ?? [])
    .flatMap(value => {
      try { return [parseMoney(value)] } catch { return [] }
    })
}

function verifySourceBasis(order: DocumentWorkOrder, contentHtml: string, schedules: Record<string, number[]>, directMoneyFields: string[] = []): number {
  const outputValues = financialValues(contentHtml)
  const expected: Array<{ field:string; raw:string }> = []
  for (const [field, indices] of Object.entries(schedules)) {
    const raw = order.fields[field]
    if (typeof raw !== 'string' || !raw.trim()) continue
    for (const [lineIndex, line] of raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean).entries()) {
      const columns = line.split('|').map(value => value.trim())
      if (columns.every(column => /^:?-{3,}:?$/.test(column))) continue
      for (const index of indices) {
        const value = columns[index]
        if (!value || !/\d/.test(value)) continue
        try { parseMoney(value) } catch { throw new Error(`${field} row ${lineIndex + 1} contains invalid financial value '${value}'`) }
        expected.push({ field, raw:value })
      }
    }
  }
  for (const field of directMoneyFields) {
    const raw = order.fields[field]
    if (raw === undefined || raw === null || raw === '') continue
    expected.push({ field, raw:String(raw) })
  }
  for (const item of expected) {
    const value = parseMoney(item.raw)
    if (!outputValues.some(output => nearlyEqual(output, value))) throw new Error(`rendered ${order.deliverable_type} changed or omitted ${item.field} value '${item.raw}'`)
  }
  return expected.length
}

function verifyVerbatimFigures(order: DocumentWorkOrder, contentHtml: string): number {
  const keys = ['balance_sheet_lines', 'income_statement_lines', 'cash_flow_lines', 'statement_of_equity_lines']
  let count = 0
  const normalizedOutput = normalizedFigure(contentHtml)
  for (const key of keys) {
    const raw = order.fields[key]
    if (typeof raw !== 'string' || !raw.trim()) continue
    for (const line of raw.split(/\r?\n/).filter(Boolean)) {
      for (const figure of line.split('|').slice(1)) {
        if (!/\d/.test(figure)) continue
        const expected = normalizedFigure(figure)
        if (expected && !normalizedOutput.includes(expected)) throw new Error(`rendered financial statement changed or omitted supplied figure '${figure.trim()}'`)
        if (expected) count += 1
      }
    }
  }
  return count
}

function verifyCashFlowBudget(order: DocumentWorkOrder): number {
  const schedules = ['base_case_lines', 'best_case_lines', 'worst_case_lines']
  let checked = 0
  for (const key of schedules) {
    const raw = order.fields[key]
    if (raw === undefined || raw === null || raw === '') continue
    const parsed = rows(raw, 6)
    let previousClosing: number | null = null
    parsed.forEach((columns, index) => {
      const opening = parseMoney(columns[1] ?? '')
      const inflows = parseMoney(columns[2] ?? '')
      const outflows = parseMoney(columns[3] ?? '')
      const net = parseMoney(columns[4] ?? '')
      const closing = parseMoney(columns[5] ?? '')
      const expectedNet = inflows + (outflows < 0 ? outflows : -outflows)
      if (!nearlyEqual(net, expectedNet)) throw new Error(`${key} row ${index + 1} net change does not equal inflows less outflows`)
      if (!nearlyEqual(closing, opening + net)) throw new Error(`${key} row ${index + 1} closing cash does not equal opening cash plus net change`)
      if (previousClosing !== null && !nearlyEqual(opening, previousClosing)) throw new Error(`${key} row ${index + 1} opening cash does not match prior closing cash`)
      previousClosing = closing
      checked += 3
    })
  }
  return checked
}

export function verifyFinancialDocument(order: DocumentWorkOrder, contentHtml: string): FinancialVerificationReport {
  if (!order.quality_gates.deterministic_financial_verification) return { required: false, checks: [], verified_values: 0 }
  if (order.deliverable_type === 'financial-statements-package') {
    const count = verifyVerbatimFigures(order, contentHtml)
    return { required: true, checks: ['practitioner-supplied figures preserved verbatim'], verified_values: count }
  }
  if (order.deliverable_type === 'cash-flow-budget-package') {
    const arithmetic = verifyCashFlowBudget(order)
    const associatedRows=verifyScheduleRowAssociation(order,contentHtml,['base_case_lines','best_case_lines','worst_case_lines'])
    const narrative=verifyNarrativeFields(order,contentHtml,['entity_name','forecast_period','scenario_summary','key_assumptions','prepared_by','working_capital_lines','budget_lines'])
    const figures = verifyVerbatimFigures({ ...order, fields: { balance_sheet_lines: order.fields.base_case_lines, income_statement_lines: order.fields.best_case_lines, cash_flow_lines: order.fields.worst_case_lines } }, contentHtml)
    return { required: true, checks: ['cash continuity', 'net change arithmetic', 'closing balance arithmetic', 'schedule row association', 'approved context and assumptions preserved', 'supplied figures preserved'], verified_values: arithmetic + associatedRows + narrative + figures }
  }
  if (order.deliverable_type === 'budget-vs-actual') {
    const count = verifySourceBasis(order, contentHtml, { revenue_lines:[1,2], expense_lines:[1,2] })
    return { required:true, checks:['budget and actual source figures preserved'], verified_values:count }
  }
  if (order.deliverable_type === 'cash-flow-forecast') {
    const count = verifySourceBasis(order, contentHtml, { recurring_inflows:[1], recurring_outflows:[1], receivables_aging:[1], payables_aging:[1], one_time_items:[1] }, ['starting_cash_position','minimum_cash_threshold'])
    return { required:true, checks:['forecast source figures preserved'], verified_values:count }
  }
  if (order.deliverable_type === 'expense-report') {
    const count = verifySourceBasis(order, contentHtml, { expense_lines:[3], mileage_entries:[3,4], foreign_currency_conversions:[1,3,4] }, ['mileage_rate_per_mile','per_diem_rate','total_advance_received'])
    return { required:true, checks:['expense and reimbursement source figures preserved'], verified_values:count }
  }
  if (order.deliverable_type === 'invoice') {
    const count = verifySourceBasis(order, contentHtml, { line_items:[2,3] }, ['tax_rate_percent','late_payment_interest_percent_monthly'])
    return { required:true, checks:['invoice quantity, rate, tax, and payment figures preserved'], verified_values:count }
  }
  if (order.deliverable_type === 'personal-monthly') {
    const count = verifySourceBasis(order, contentHtml, { income_sources:[1], fixed_expenses:[1], variable_expenses:[1], savings_deposits:[1], debt_payments:[1], assets_snapshot:[1], liabilities_snapshot:[1], goals_progress:[1,2] })
    return { required:true, checks:['personal finance source figures preserved'], verified_values:count }
  }
  if (order.deliverable_type === 'tax-estimate') {
    const count = verifySourceBasis(order, contentHtml, { itemized_deductions_breakdown:[1], tax_credits:[1] }, ['gross_income_w2','gross_income_1099_self_employment','gross_income_investment','gross_income_other','withholdings_ytd','estimated_payments_ytd','prior_year_tax_liability'])
    if (!/planning purposes|not (?:tax|legal) advice|not a tax return/i.test(htmlText(contentHtml))) throw new Error('tax estimate is missing its planning-only professional boundary')
    return { required:true, checks:['tax source figures preserved', 'planning-only boundary present'], verified_values:count }
  }
  throw new Error(`deterministic financial verification is not implemented for ${order.deliverable_type}`)
}
