---
brand: On Spot Solutions
slug: on-spot-solutions
parent: On Spot Solutions LLC
version: 1.0
updated: 2026-04-23
---

# On Spot Solutions — Brand Canon

> **Tagline:** *On site. On spec. On spot.*
>
> **One-line description:** Massachusetts-based field service firm specializing in parking access and revenue control (PARCS) systems, low-voltage electrical work, and security infrastructure.
>
> **Parent entity:** On Spot Solutions LLC *(this is the parent brand — sub-brands inherit unless they explicitly override)*

This file is the single source of truth for the On Spot Solutions brand. Humans read it as a style guide. AI systems (Claude, Claude Code, downstream orchestration) consume it as prompt material. Frontend systems reference its tokens directly via the JSON block in Section 10.

---

## 1. Brand basics

| Field | Value |
|---|---|
| Official name | On Spot Solutions |
| Legal entity | On Spot Solutions LLC |
| Slug | `on-spot-solutions` |
| Tagline | On site. On spec. On spot. |
| One-line description | Massachusetts-based field service firm specializing in parking access and revenue control (PARCS) systems, low-voltage electrical work, and security infrastructure. |
| Parent entity | On Spot Solutions LLC |
| Primary domain | [onspot-solutions.com](https://onspot-solutions.com) |
| Credentials | OSHA 30 certified · Massachusetts low-voltage license · Massachusetts Gaming Commission registered |
| Core clients | Encore Boston Harbor · SKIDATA · TIBA · HUB Parking / Wynn · Pro Park · VPNE |

---

## 2. Voice and tone

### Voice in five words

**Precise · Operational · Confident · Direct · Never apologetic.**

On Spot writes the way a senior field technician writes a service ticket: concrete, specific, focused on what the equipment is doing and what will be done about it. No marketing fluff. No hedging. No superlatives.

### Example sentences that sound like the brand

> *"Barrier is locked down due to a failed loop detector on lane 3. Part ordered; ETA Tuesday. Temporary manual vend installed."*

> *"Inspection fee is $395 per site and is credited toward any service work performed within 30 days."*

### Example sentences that are wrong for this brand

> *"We're so excited to help revolutionize your parking experience with our innovative solutions!"* — promotional fluff, consumer voice, empty verbs.

> *"Sorry for the inconvenience — we'll do our best to get someone out to you when we can."* — apologetic, vague, abandons commitment.

### Words, phrases, and styles to avoid

- **Empty verbs:** *leverage, utilize, unlock, transform, revolutionize, empower.*
- **Hedging language:** *we'll try, hopefully, should be able to, when possible.*
- **Apologetic openers:** *"Sorry, but…"*, *"Unfortunately…"*
- **Marketing superlatives:** *cutting-edge, best-in-class, world-class, next-generation, game-changing.* ("World-class" is an internal build standard — it is not external copy.)
- **Emoji** in any professional communication. **Exclamation points** only when quoting a user or describing a literal alarm state.
- **AI / chatbot language** when describing human technicians. Orbit AI, Atlas, and Spot Node have their own voices — do not mix them with the On Spot field-service voice.
- **Corporate first-person plural about feelings** — *"we love," "we believe," "we're passionate about."* On Spot speaks about work performed, not feelings.

---

## 3. Typography

| Role | Font | Source | Weights | Notes |
|---|---|---|---|---|
| Heading | IBM Plex Sans | Google Fonts | 500, 700 | Canonical sans-serif for all On Spot deliverables. |
| Body | IBM Plex Sans | Google Fonts | 400, 500 | Same family — no secondary sans. |
| Monospace | IBM Plex Mono | Google Fonts | 400, 600 | For part numbers, IPs, MAC addresses, terminal output, technical reference. |
| PDF fallback | Helvetica | System | Regular, Bold | Used when ReportLab builds cannot embed IBM Plex. The visual match is close enough for print. |

**Line height:** 1.4–1.5 for body, 1.2 for headings.
**Tracking on headings:** −0.01em for a tight, engineered feel.
**No decorative or display faces.** No script fonts, no slab serifs, no variable-font gimmicks.

---

## 4. Color palette

### Core palette

| Token | Name | Hex | Role |
|---|---|---|---|
| `--cone-orange` | Cone Orange | `#FF6B1A` | Primary brand color. Used as an accent — rules, badges, section markers, primary CTAs. **Never as a dominant background fill.** |
| `--lime-signal` | Lime Signal Green | `#A4D65E` | Secondary accent. Reserved for positive states (resolved, complete, active, confirmed). |
| `--charcoal` | Charcoal | `#2B2B2B` | Primary text color. Used sparingly for fills (footer bars, badges). |
| `--white` | White | `#FFFFFF` | **Non-negotiable.** All On Spot document and web backgrounds are white. Dark themes, heavy gradients, or complex backgrounds are rejected. |

### Extended palette

| Token | Name | Hex | Role |
|---|---|---|---|
| `--cobalt` | Cobalt Blue | `#1A4EBF` | Accent only — used on the website for trust-signal elements and portal/navigation. Not required in field documents. |
| `--muted` | Muted Grey | `#9A9A9A` | Metadata, secondary labels, form placeholders. |
| `--rule` | Rule Grey | `#E5E5E5` | Thin dividing lines and card borders. |
| `--success` | Success | `#A4D65E` | Alias of Lime Signal. |
| `--warning` | Warning | `#F7A01A` | Slightly deeper than Cone Orange to distinguish warnings from brand accents. |
| `--error` | Error | `#C0392B` | Critical faults, lockouts, failure states. Used sparingly. |

### Usage rules

1. **White background is the law.** No dark headers, no charcoal panels, no gradients spanning the full page. This rule has been broken and corrected enough times that it is now axiomatic.
2. **Cone Orange and Lime Signal are accents.** They appear as thin rules, badge fills, section dividers, and the orange-to-green gradient footer bar — never as dominant fills.
3. **Charcoal is for text first.** Full-width charcoal blocks are used only in the 4px orange-to-green gradient footer strip and small status badges.
4. **Cobalt is web-only.** It does not appear on branded PDFs or field documents.

---

## 5. Logo inventory

All logo assets live alongside this file in the `on-spot-solutions/` folder. Reference them by relative filename. The live website mirrors approved variants at `https://onspot-solutions.com/assets/`.

| Variant | File | Usage |
|---|---|---|
| Primary wordmark (color, light bg) | `OnSpot_FULL_nearTouch.png` | Default. Document headers, covers, letterheads, business cards, email signatures. |
| Animated wordmark | `OSAL.gif` | Web only — site headers, loading states, email where GIFs render. |
| Favicon — 16 | `onspot-icon-16.png` | <!-- inferred: low-DPI favicon; matches standard browser-tab icon role --> |
| Favicon — 32 | `onspot-icon-32.png` | <!-- inferred: standard-DPI favicon --> |

<!-- TODO: no inverted wordmark (dark-background variant) in folder as of 2026-04-23 -->
<!-- TODO: no square mark / icon-only lockup in folder as of 2026-04-23 -->
<!-- TODO: no favicon.ico or 512px PWA/Apple touch icon in folder as of 2026-04-23 — current favicon coverage is PNG-only at 16px and 32px -->

### Sizing

- **Minimum width (digital):** 120px wordmark. Below this the arch motif collapses.
- **Minimum width (print):** 180px (~0.5 inch) wordmark.
- **Header height (web):** 60–70px.
- **Footer height (web):** 50–60px.

### Clear space

Maintain clear space of **1× the logo's cap-height** on all four sides. No text, graphic element, or edge within that bounding box.

### Usage prohibitions

- **Never recreate the logo.** Always use the approved PNG asset. Do not rebuild the arch or wordmark in CSS, SVG, or code.
- **Never stretch, skew, or rotate.** The wordmark is locked at its native aspect ratio.
- **Never change the logo's colors.** The approved color version is final.
- **Never place the logo on a red, magenta, or conflicting-hue background.** If a dark background is required, use the inverted variant on charcoal or near-black only.
- **For PDFs via ReportLab:** the PNG has black pixels that render as opaque black boxes unless PIL-preprocessed (convert black to transparent). This preprocessing step is mandatory for every ReportLab build.

---

## 6. Document conventions

### Cover / first-page layout

- Logo top-left (wordmark, ~180px wide)
- Document title centered below the masthead
- Document type label above the title — e.g., *SERVICE RECORD*, *INSPECTION REPORT*, *PROPOSAL* — in small-caps Cone Orange
- Date, document number, and client reference bottom-right

### Every-page masthead

- Thin header strip: wordmark left, document type and number right
- Below the masthead: a **1.5px Cone Orange rule** spanning the content width

### Every-page footer

- Company line: *On Spot Solutions LLC · onspot-solutions.com · support@onspot-solutions.com*
- Page indicator: *Page X of Y* right-aligned
- Above the footer: the **orange-to-green gradient bar**, 4px tall, spanning the full content width — this is On Spot's signature footer motif

### Section headers

- **Color:** Cone Orange
- **Typography:** IBM Plex Sans 700, small-caps, letter-spaced +0.07em
- **Numeric prefix:** Square Cone Orange chip (24×24px) with white numeral inside, left of the title
- **Rule:** Thin Cone Orange rule below the section title

### Body

- Color: Charcoal
- Paragraphs: IBM Plex Sans 400, 10.5–11pt for print, 15–16px for web
- Card-based layout for scope items, work locations, equipment lists — white card, 1px Rule Grey border, 12px corner radius, interior padding 16–20px

### Tables

- Header row: Cone Orange background, white text, IBM Plex Sans 700
- Alternating row shading: `#FFFFFF` / `#FAFAFA`
- Row rule: 0.5px Rule Grey

### Status badges

| State | Background | Border | Text |
|---|---|---|---|
| Resolved / Complete | `#EDF9D4` | `#A4D65E` | `#3E7200` |
| In Progress / Pending | `#FFF3E8` | `#FFB07A` | `#B84A00` |
| Action Required | `#FFF3E8` | `#FFB07A` | `#B84A00` |
| No Fault Found / Info | `#EAF0FF` | `#9DB8F5` | `#1A4EBF` |
| Critical / Error | `#FCE4E0` | `#E58577` | `#8A1F12` |

### Always-present marks

- Wordmark in the masthead on every page
- Orange-to-green gradient footer bar on every page
- Company footer line with domain and support email

---

## 7. Positioning guardrails

### On Spot Solutions **IS**

- A **Massachusetts-based field service firm** with licensed, certified technicians performing work on site. Credentials: OSHA 30, MA low-voltage license, Mass Gaming Commission registration.
- A **three-tier service operation** — inspections (door-opener, fees credited toward work), field service and maintenance (recurring anchor), installations and upgrades (growth lever).
- A **technology-forward field service company** with an internal Orbit AI division that builds operational tooling (Atlas diagnostic platform, Spot Node parking access and billing platform, Field Ops PWA).

### On Spot Solutions **IS NOT**

- **Not a reseller or broker.** On Spot performs the work with its own technicians and documentation — work is not passed to third parties, and equipment is not drop-shipped without service.
- **Not a software-only company.** Internal tooling exists to strengthen the field service business — field work is always the core deliverable.
- **Not general IT or computer services.** Specialization is deliberately narrow: parking access and revenue control, low-voltage electrical, related security infrastructure.
- **Not consumer-facing.** Customers are gaming properties, parking operators, OEMs and integrators, and enterprise facilities — never retail consumers or residential.

---

## 8. Contact and canonical URLs

| Resource | URL |
|---|---|
| Primary website | https://onspot-solutions.com |
| Support email | support@onspot-solutions.com |
| Atlas diagnostic platform | https://onspot-solutions.com/atlas.html |
| Customer portal | https://onspot-solutions.com/portal/ |
| Primary logo (live site) | https://onspot-solutions.com/assets/OnSpot_FULL_nearTouch.png |
| Animated logo (live site) | https://onspot-solutions.com/assets/OSAL.gif |

---

## 9. Brand family

On Spot Solutions is the parent brand. The following sub-brands operate beneath it, each with its own `brand.md` living inside its own sibling folder in the brand-assets tree (e.g., `brand-assets/<slug>/brand.md`):

| Sub-brand | Slug | Role |
|---|---|---|
| Orbit AI | `orbit-ai` | Technology division — umbrella for all software and AI products. Not customer-facing in field contexts. |
| Atlas | `atlas` | Field-engineer diagnostic PWA. Product of Orbit AI. Positioned as a *diagnostic engine*, not an AI chatbot. |
| Spot Node | `spot-node` | Next-generation parking access and billing platform (Raspberry Pi 5 edge hardware + Supabase backend). Patent-pending Trust Ladder architecture. |
| Apollo | `apollo` | Internal document and proposal generation workflow. Not a chatbot, not an AI writing assistant, not consumer-facing — a production pipeline that produces branded On Spot deliverables. |

Sub-brands **inherit** On Spot's typography, color rules, and white-background law unless their individual `brand.md` explicitly overrides a specific token.

---

## 10. Machine-readable tokens

For frontend and AI consumers that want structured access, the canonical tokens are:

```json
{
  "brand": "On Spot Solutions",
  "slug": "on-spot-solutions",
  "parent": "On Spot Solutions LLC",
  "tagline": "On site. On spec. On spot.",
  "description": "Massachusetts-based field service firm specializing in parking access and revenue control (PARCS) systems, low-voltage electrical work, and security infrastructure.",
  "colors": {
    "cone_orange":  "#FF6B1A",
    "lime_signal":  "#A4D65E",
    "charcoal":     "#2B2B2B",
    "white":        "#FFFFFF",
    "cobalt":       "#1A4EBF",
    "muted":        "#9A9A9A",
    "rule":         "#E5E5E5",
    "success":      "#A4D65E",
    "warning":      "#F7A01A",
    "error":        "#C0392B"
  },
  "fonts": {
    "heading":      { "family": "IBM Plex Sans", "source": "Google Fonts", "weights": [500, 700] },
    "body":         { "family": "IBM Plex Sans", "source": "Google Fonts", "weights": [400, 500] },
    "mono":         { "family": "IBM Plex Mono", "source": "Google Fonts", "weights": [400, 600] },
    "pdf_fallback": "Helvetica"
  },
  "logo": {
    "primary":    "OnSpot_FULL_nearTouch.png",
    "animated":   "OSAL.gif",
    "favicon_16": "onspot-icon-16.png",
    "favicon_32": "onspot-icon-32.png",
    "live_primary":  "https://onspot-solutions.com/assets/OnSpot_FULL_nearTouch.png",
    "live_animated": "https://onspot-solutions.com/assets/OSAL.gif",
    "min_width_px":       120,
    "min_width_print_px": 180,
    "clear_space_rule":   "1x logo cap-height on all sides"
  },
  "domain":        "onspot-solutions.com",
  "support_email": "support@onspot-solutions.com"
}
```

---

*End of brand.md · On Spot Solutions · Version 1.0 · Updated 2026-04-23*
