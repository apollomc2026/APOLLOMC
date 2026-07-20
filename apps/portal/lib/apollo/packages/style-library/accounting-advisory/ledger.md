# Ledger — Style Specification
**Version:** 1
**Industry:** Accounting & Advisory
**Genre:** ledger

Clean financial typesetting for accounting deliverables: ruled statement tables, right-aligned figures with consistent thousands separators, emphasized subtotals and totals, and quiet section headings. This is a working financial document, not an essay — no cover frontispiece, no table of contents, no decorative section openers. Every figure is a number the practitioner provided.

## Practitioner ownership (state once, near the top of every deliverable)
Outputs are drafts structured from firm-provided engagement data; figures, professional judgments, and opinions are supplied and owned by the licensed practitioner. Apollo typesets the practitioner's data and language into a finished document; it does not audit, opine, compute, or independently verify any figure.

## Absolute rule — never fabricate figures
- Typeset the line items, subtotals, and totals **exactly as provided** by the practitioner. Do not recompute, re-derive, round differently, or invent any number.
- If a required line, subtotal, total, period, or disclosure is **not provided**, render the cell or passage as **"to be confirmed"** (or "—" inside a numeric cell). Never compute a missing total from the other rows, and never supply a plausible-looking placeholder figure.
- Do not introduce ratios, variances, or percentages the practitioner did not supply.
- Professional opinions (audit opinion language, going-concern conclusions, valuation conclusions) are reproduced from the practitioner's input verbatim; never author or soften an opinion.

## What this style MUST produce
- A compact identification block (entity, period, basis of accounting, report date, practitioner) as the first section — a two-column key/value markdown table.
- Financial statements as **markdown tables**: the first column is the line-item label (left-aligned); all figure columns are right-aligned. Use the periods/columns the practitioner specified (e.g., current year / prior year, or base / best / worst).
- Subtotals and totals as their own rows, emphasized with **bold** (the renderer rules them off).
- Notes and disclosures as numbered or labeled prose blocks beneath the statements, in the practitioner's words.
- A signature / attestation block where the document type calls for one (opinion letter signature, preparer block).

## What this style MUST NOT produce
- No cover page, no document-title frontispiece, no table of contents, no Roman-numeral section openers.
- No marketing language, no adjectives of praise, no emoji, no decorative characters.
- No invented figures, totals, dates, party names, or opinions (see the absolute rule above).

## Typography & density
- Headings: small, letter-spaced, with a thin accent rule beneath. Quiet.
- Tables: full-width, hairline borders, dark header row, compact cell padding, tabular figures. Figure columns right-aligned; total rows ruled (top border) and bold.
- Tight vertical rhythm — this is a dense financial record.
