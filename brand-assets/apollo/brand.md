# Apollo MC — Brand Reference

> Canonical source of truth for Apollo-branded deliverables.
> Last updated: 2026-04-24

## Document palette

Machine-readable palette block consumed by the Apollo PDF pipeline. Paper stays warm off-white; ink is a near-black with cool undertone; accent is a cool cyan-blue used only on hairlines and section eyebrows; metadata grey is for labels, IDs, and footer text.

<!-- apollo-pdf-palette: START -->
```yaml
paper: "#fafafa"
ink: "#14151a"
accent: "#6be3ff"
metadata: "#5a5e66"
hairline: "rgba(20,21,26,0.22)"
```
<!-- apollo-pdf-palette: END -->


## Identity
- **Legal name:** Apollo MC (operating as a product of On Spot Solutions LLC)
- **Tagline:** Mission Control for Deliverables
- **One-sentence:** Apollo is a deliverables execution platform that turns structured intake into polished, professional documents.
- **Parent:** On Spot Solutions LLC, Revere, Massachusetts

## Voice
Apollo's voice is mission-control precision. Confident, terse, operational. It does not explain itself, does not apologize, does not pad.

**Correct:** "Mission complete. Download your deliverable below."
**Correct:** "This NDA is executed between the parties listed below and governs the confidential information exchanged in connection with the stated purpose."
**Wrong:** "Great news! Your document is ready!"
**Wrong:** "This Non-Disclosure Agreement is hereby enthusiastically entered into..."

Avoid: exclamation points, emoji, filler phrases ("please note that," "it is important to understand that"), marketing language in legal/financial documents.

## Visual identity
- **Primary background:** #0a0a0f (deep near-black with blue undertone) — for web surfaces only. **Documents use white.**
- **Primary accent (for web):** #6be3ff (cyan)
- **Secondary accent (for web):** #4a9eff (blue)
- **Tertiary accent (for web):** #ff7a00 (orange) — used sparingly, for warnings and emphasis
- **Document text:** #1a1a1a (near-black, never pure black)
- **Document accent (for headings, section dividers):** #0a1628 (dark navy)
- **Document muted text:** #555555 (for labels, captions, footer text)

**Critical distinction:** Apollo's *web interface* uses dark backgrounds with cyan/orange accents. Apollo's *generated documents* use white backgrounds with dark-navy accents. Do not apply web colors to documents — they're unprofessional in printed form.

## Typography
- **Web surfaces:** Inter (300/400/500/600/700/800/900)
- **Documents:**
  - Headings: "Calibri" (or "Segoe UI Semibold" as fallback), weight 600-700
  - Body: "Calibri" (or "Segoe UI"), weight 400
  - Monospace (code blocks, technical references): "Cascadia Mono" or "Consolas"

Do not use display fonts (Syne, Playfair, etc.) in generated documents. They read as gimmicky in professional contexts.

## Logo usage in documents
- **Primary logo file:** `apollo_logo_master.png` (repo: `brand-assets/apollo/`)
- **Rendered size:** Maximum 1.5 inches wide (EMU ~1371600). The DOCX builder enforces this — do not attempt to override.
- **Position:** Top-left of first page only. Not repeated in headers/footers.
- **Clear space:** 0.25" on all sides.

## Generation rules — read before writing anything
When generating Apollo-branded documents, Claude must:

1. **Emit the logo exactly once** — the pipeline handles this via the brand loader. Do not include additional logo references, `<img>` tags, or visual filler in the generated HTML.
2. **Emit the document title exactly once** — a single `<h1>` at the top with the template's canonical title (e.g., "NON-DISCLOSURE AGREEMENT"). Do not repeat the title in subtitles, headers, or as decorative text. Do not translate the title.
3. **No emoji. No decorative unicode. No ASCII art.** This is non-negotiable for all document types except where explicitly permitted by the template (none currently).
4. **No spaced-out letter display** ("A T L A S"). The brand name appears exactly as written in the brand file or not at all.
5. **Section headings use `<h2>`**, not bold-and-larger paragraphs. Use hierarchy correctly.
6. **One blank paragraph between sections, never more.** Do not emit runs of whitespace for visual padding.
7. **Numbered lists for sequential obligations, bulleted lists for parallel items.** Never mix.
8. **Signature blocks: emit a `<table>` with two cells. Each cell contains: role label (bold), typed name, blank line for handwritten signature, and a "Date: _______" line.** Do not emit the word "Signature" as a standalone line.
9. **Footer is set by the document builder, not by you.** Do not emit footer content (page numbers, brand stamps, URLs) in the body HTML.
10. **Currency, dates, and numbers** follow standard US conventions: dates as "April 24, 2026", currency as "$1,234.56", percentages as "12.5%".

## Positioning — what this brand IS
- A professional deliverables platform for business users
- Output-focused — the generated document is the product, the UI is incidental
- Invite-only while under development

## Positioning — what this brand is NOT
- A chatbot
- An AI writing assistant
- Consumer-facing social content
- A marketing platform

## Contact
- Domain: apollomc.ai
- Support: support@apollomc.ai
- Parent company: On Spot Solutions LLC (onspot-solutions.com)
