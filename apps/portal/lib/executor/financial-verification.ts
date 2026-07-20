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
  return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    const columns = line.split('|').map((value) => value.trim())
    if (columns.length !== expectedColumns) throw new Error(`financial row ${index + 1} must contain ${expectedColumns} pipe-delimited columns`)
    return columns
  })
}

function normalizedFigure(raw: string): string {
  return raw.replace(/\s/g, '').replace(/\$/g, '')
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
    const figures = verifyVerbatimFigures({ ...order, fields: { balance_sheet_lines: order.fields.base_case_lines, income_statement_lines: order.fields.best_case_lines, cash_flow_lines: order.fields.worst_case_lines } }, contentHtml)
    return { required: true, checks: ['cash continuity', 'net change arithmetic', 'closing balance arithmetic', 'supplied figures preserved'], verified_values: arithmetic + figures }
  }
  throw new Error(`deterministic financial verification is not implemented for ${order.deliverable_type}`)
}
