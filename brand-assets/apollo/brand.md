# Apollo MC Brand Guide

> Last updated: 2026-04-23

## Identity
- Name: Apollo MC
- Slug: apollo
- Tagline: Mission Control for Deliverables
- Description: Apollo MC is an AI-powered deliverables execution platform that converts professional services intake into completed, board-ready documents through deterministic orchestration — not chat.
- Parent: On Spot Solutions LLC

## Voice
- Tone: Precise, operational, confident, terse. Mission-control register — briefings, not prose. Never apologetic, never effusive.
- Example (correct): "Mission complete. Deliverable packaged and ready for download."
- Example (correct): "Queue depth: 3. Estimated completion: 14 minutes."
- Example (wrong): "Yay! 🎉 We finished your awesome report — hope you love it!"
- Example (wrong): "Sorry if this isn't quite what you were looking for. Let me know if you'd like me to try again!"
- Avoid: emojis in product copy, exclamation points, hedging language ("maybe," "I think," "sort of"), apologetic framing ("sorry," "unfortunately"), consumer-AI-assistant tropes ("happy to help," "let me know if you need anything else"), the word "prompt" used as a product feature, generic SaaS clichés ("seamless," "revolutionary," "powered by AI"). Write like a flight director, not a hype account.

## Typography
- Headings: Syne — Google Fonts — weights 500 / 600 / 700 / 800. Used for all display type, cover titles, H1–H3.
- Body: Inter — Google Fonts — weights 400 / 500 / 600. Used for paragraph text and long-form reading.
- Mono: JetBrains Mono — Google Fonts — weights 400 / 500 / 600. Used for labels, badges, IDs, timestamps, technical data, and any mission-telemetry style element.

## Color palette

Deliverables palette — use for all generated client-facing documents (DOCX, PDF, printed output) and any light-background surface:

| Role             | Name            | Hex       |
|------------------|-----------------|-----------|
| Primary accent   | Cone Orange     | `#FF6B1A` |
| Secondary accent | Lime Green      | `#A4D65E` |
| Text             | Charcoal        | `#2B2B2B` |
| Background       | White           | `#FFFFFF` |

Semantic (deliverables):

| Role    | Name        | Hex       |
|---------|-------------|-----------|
| Success | Signal Green | `#00B86B` |
| Warning | Caution Amber | `#F5A524` |
| Error   | Alert Red    | `#E5484D` |
| Muted   | Gray 500     | `#6B7280` |

## Product surface palette (dark)

Used only for the Apollo MC portal and in-product UI at `portal.apollomc.ai`. Never used for generated deliverables.

| Role             | Name            | Hex       |
|------------------|-----------------|-----------|
| Void background  | Apollo Void     | `#080810` |
| Surface (glass)  | Glass White 4%  | `rgba(255,255,255,0.048)` |
| Primary accent   | Signal Cyan     | `#5EE7FF` |
| Secondary accent | Launch Orange   | `#FF8C1A` |
| Text primary     | Pure White      | `#FFFFFF` |
| Text secondary   | White 65%       | `rgba(255,255,255,0.65)` |
| Success          | Telemetry Green | `#00E87A` |
| Error            | Abort Red       | `#FF4560` |
| Legal vertical   | Counsel Purple  | `#B06EFF` |

## Logo usage

All logo assets live alongside this file in the `apollo/` folder. Reference them by relative filename.

| Role | File | Notes |
|------|------|-------|
| Primary wordmark — master (color, light backgrounds) | `apollo_logo_master.png` | Canonical wordmark source |
| Primary wordmark — transparent | `apollo_logo_transparent.png` | Use when compositing over non-white light surfaces |
| Alternate wordmark (Apollo MC lockup) | `apollomc-logo.png` | Apollo MC product lockup variant |
| Icon / mark (rocket) | `Rocket.png` | Use when the wordmark would fall below its minimum width |
| Icon / mark (rocket, transparent) | `Rocket_transparent.png` | Rocket mark over non-white surfaces |
| UDI Apollo variant | `UDI_APOLLO.png` | <!-- inferred from filename — retain pending role clarification --> |

<!-- TODO: no inverted wordmark variant in folder as of 2026-04-23 — use primary transparent on dark surfaces only with a navy plate behind it -->
<!-- TODO: no favicon.ico or social card (1200×630 OG image) in folder as of 2026-04-23 -->

Usage rules:

- Minimum width: 120px for the full wordmark. Below that, use the icon-only mark.
- Icon minimum: 24px.
- Clear space: 1× logo height on all sides. No text, graphic, or edge may enter that zone.
- Never stretch, skew, rotate, or recolor the logo.
- Never apply drop shadows, outlines, or gradients that are not part of the master file.
- Never place the color logo on busy photographic backgrounds without a solid color plate behind it.
- Never place the color logo on the Cone Orange fill — use the inverted logo on orange surfaces.
- Never reproduce the logo below 72 DPI for print.

## Document conventions

- Cover page: Apollo logo top-left (120px wide), deliverable title centered in Syne 32pt Cone Orange, client name in Inter 14pt Charcoal directly below, date bottom-right in JetBrains Mono 10pt Charcoal.
- Section headings: Syne 18pt weight 700, Cone Orange `#FF6B1A`.
- Subsection headings: Syne 14pt weight 600, Charcoal `#2B2B2B`.
- Body text: Inter 11pt weight 400, Charcoal `#2B2B2B`, line height 1.5.
- Callout / emphasis blocks: 2px left border in Lime Green `#A4D65E`, Inter 11pt body, 6pt left padding.
- Footer (every page except cover): `Generated by Apollo MC · apollomc.ai · Page X of Y` — JetBrains Mono 9pt, Charcoal 60% opacity, centered. Page numbers in the same style right-aligned.
- Tables: header row in Lime Green `#A4D65E` background with white text, body rows alternating white and `#F7F7F7`, 0.5pt Charcoal 20% grid lines.
- Watermarks: none on production deliverables. Drafts may carry a `DRAFT` watermark in Cone Orange 15% opacity, Syne 72pt, rotated -30°.
- No dark themes on deliverables. Ever. All generated documents are white-background.

## Positioning

**Apollo MC is:**
- A deterministic deliverables execution platform for professional services firms where document production directly gates revenue (consulting, government contracting, legal).
- A completion engine — it sells finished, board-ready outputs, not prompts, drafts, or suggestions.
- A mission-control interface: structured intake in, orchestrated task graph executed, packaged deliverable out.

**Apollo MC is NOT:**
- Not a chatbot. It does not converse, it executes.
- Not an AI writing assistant. It does not suggest — it delivers.
- Not consumer-facing. It is a B2B platform for professionals whose time is billable.
- Not a prompt tool. Users never write prompts; they complete structured intake.

## Contact

- Domain: `apollomc.ai`
- Product: `portal.apollomc.ai`
- Support: `support@apollomc.ai`
- Parent entity: On Spot Solutions LLC · Revere, MA