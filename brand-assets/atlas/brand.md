# ATLAS

> **Fixed at Your Fingertips.**

Canonical brand reference for ATLAS — a field intelligence platform for parking and access control technicians, built and operated by **On Spot Solutions LLC** (Boston, Massachusetts).

This file is the single source of truth. Every deliverable — print, digital, slide, spec, social, AI-generated — derives from this document. Do not modify downstream materials without first updating this file.

- **Brand slug:** `atlas`
- **Parent entity:** On Spot Solutions LLC
- **Version:** 1.0

---

## 1. Identity

### What ATLAS is

ATLAS is a field intelligence platform for parking and access control technicians. It delivers structured diagnostic guidance — on any phone, on any piece of equipment, at 2am in a parking garage — without a service call, without a wait, and without losing the institutional knowledge a senior tech takes with them when they leave.

ATLAS is the collective tribal knowledge of every user. Every technician, facility manager, and engineer who runs a session contributes to a living system that compounds for everyone.

### What ATLAS is not

- Not a chatbot. Not an AI assistant. Not a search engine.
- Not a replacement for a service contract.
- Not competing with the technician or the service industry.
- Not a generic troubleshooting tool.

### The gap ATLAS fills

The hours between equipment failure and technician arrival. That gap currently has no owner. ATLAS owns it.

### Positioning line (locked)

> **ATLAS doesn't eliminate your service budget. It makes sure every dollar of it goes to a real repair, not a diagnostic visit.**

### ROI hammer (locked)

> **If ATLAS saves you two service calls a year, it has paid for itself.**

Two calls × $500+ = $1,000+. Full year of PRO = $479.88. The math is not close.

### Lifeline narrative

Technicians are freed from low-hanging-fruit dispatches for high-value complex work. Facility managers self-resolve simple issues. Service companies increase technician effectiveness per shift. ATLAS handles the rest. It empowers the industry — it does not replace it.

---

## 2. Voice and tone

### Adjectives

Precise. Operational. Field-authentic. Direct. Never apologetic.

### Sounds like ATLAS

> "ATLAS fills the gap that currently has no owner: the hours between equipment failure and technician arrival."

> "If ATLAS saves you two service calls a year, it has paid for itself."

### Wrong for ATLAS

> "Our delightful AI-powered platform seamlessly transforms your workflow."

> "ATLAS is a smart AI assistant that learns over time."

### Hard-banned phrases

The following words and phrases never appear in ATLAS materials under any circumstance:

- **AI** / **artificial intelligence** — always use *field intelligence* or *structured diagnostic guidance*
- **30-year technician** (any variation)
- **trained on thousands of pages** — say *built from generations of field service experience and tribal knowledge*
- **smart** / **clever** — say *precise* or *structured*
- **seamless** / **delightful** / **intuitive** — consumer-SaaS vocabulary
- **truck roll** — always *dispatch* or *deployment*
- Any statistic not listed in §8 Locked Content

### Required field language

Always use: dispatch, diagnostics, service call, load draw, amperage, downtime, site, triage, deployment.

Speak to the operator first. The technician second.

---

## 3. Typography

All four fonts are available free on Google Fonts. Load via the single import below.

### Font stack

| Role | Family | Weights | Source |
|---|---|---|---|
| Headlines / display | **Bebas Neue** | 400 | Google Fonts |
| Subheads | **Barlow Condensed** | 400 / 600 / 700 | Google Fonts |
| Body | **Barlow** | 400 / 500 / 600 | Google Fonts |
| Labels / monospace | **Space Mono** | 400 / 700 | Google Fonts |

### Google Fonts import

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Typographic scale (reference)

| Token | Font | Size | Use |
|---|---|---|---|
| `display-xl` | Bebas Neue | 104px | Hero headlines, poster-scale |
| `display-l` | Bebas Neue | 72px | Section titles |
| `display-m` | Bebas Neue | 44–54px | Subheadlines |
| `heading-l` | Barlow Condensed 700 | 28px | H1 in documents |
| `heading-m` | Barlow Condensed 600 | 20px | H2 |
| `body-m` | Barlow 400 | 15px | Default body |
| `body-s` | Barlow 400 | 13px | Supporting text |
| `label` | Space Mono 400 | 10–11px | Eyebrows, credentials, footer |

---

## 4. Color palette

ATLAS is a **dark-theme brand**. Navy is the canonical surface. White is the light-context alternate — used only for invoices, legal letterhead, plain-text exports, and government forms.

### Primary tokens

| Token | Hex | Role |
|---|---|---|
| `--navy` | `#09091A` | Canonical background |
| `--gold` | `#C9A84C` | Primary accent |
| `--gold-bright` | `#E0C06A` | Emphasis / hover |
| `--white` | `#FFFFFF` | Primary text on navy |

### Support tokens

| Token | Hex | Role |
|---|---|---|
| `--navy-mid` | `#111126` | Header bands, secondary surfaces |
| `--navy-card` | `#161630` | Cards, panels, elevated surfaces |
| `--gold-dim` | `#8A6E2F` | De-emphasized gold accents |
| `--off-white` | `#E8E8F0` | Soft body text on navy |
| `--muted` | `rgba(255,255,255,0.45)` | Captions, metadata |

### Print CMYK

Navy requires a rich-black build. Standard hex-to-CMYK conversion causes banding on large dark areas.

- `--navy` CMYK: **C60 M40 Y30 K100**

### Color usage rules

- Gold is an accent, never a surface. Gold fills above 10% of a composition read as decorative, not premium.
- White text on navy is the default pairing. White on gold is banned — contrast fails.
- Navy on white is permitted only for the light-context alternate.
- Never pair gold with red, green, or any non-palette color.

---

## 5. Logo system

### Asset inventory

All logo assets live alongside this file in the `atlas/` folder. Reference them by relative filename.

| Variant | Filename | Use |
|---|---|---|
| Primary wordmark (dark bg) | `atlas-logo-hires.png` | Every dark-theme deliverable — canonical hi-res wordmark |
| Statue mark (square) | `atlas-statue.png` | Source file, print at scale, watermark source |
| Statue mark — alternate | `atlas-statue-1.png` | <!-- inferred: alternate crop/variant of statue mark --> |
| App icon 16 | `atlas-icon-16.png` | Browser tab (low-DPI) |
| App icon 32 | `atlas-icon-32.png` | Browser tab (standard-DPI) |
| App icon 192 | `atlas-icon-192.png` | PWA install icon, Android home screen |
| App icon 512 | `atlas-icon-512.png` | PWA install icon (high-DPI), splash |
| App icon 192 — maskable | `atlas-icon-maskable-192.png` | PWA maskable icon (Android adaptive) |
| App icon 512 — maskable | `atlas-icon-maskable-512.png` | PWA maskable icon (high-DPI adaptive) |
| Dallas tenant — icon 192 | `dallas-icon-192.png` | <!-- inferred: Dallas tenant / deployment-scoped PWA icon --> |
| Dallas tenant — icon 512 | `dallas-icon-512.png` | <!-- inferred: Dallas tenant / deployment-scoped PWA icon --> |
| Dallas tenant — maskable 192 | `dallas-icon-maskable-192.png` | <!-- inferred: Dallas tenant maskable PWA icon --> |
| Dallas tenant — maskable 512 | `dallas-icon-maskable-512.png` | <!-- inferred: Dallas tenant maskable PWA icon --> |
| Enterprise variant — icon 16 | `enterprise-icon-16.png` | <!-- inferred: enterprise-tier PWA icon --> |
| Enterprise variant — icon 32 | `enterprise-icon-32.png` | <!-- inferred: enterprise-tier PWA icon --> |
| Enterprise variant — icon 192 | `enterprise-icon-192.png` | <!-- inferred: enterprise-tier PWA icon --> |
| Enterprise variant — icon 512 | `enterprise-icon-512.png` | <!-- inferred: enterprise-tier PWA icon --> |
| Enterprise variant — maskable 512 | `enterprise-icon-maskable-512.png` | <!-- inferred: enterprise-tier maskable PWA icon --> |

<!-- TODO: no inverted wordmark (light-bg variant) in folder as of 2026-04-23 -->
<!-- TODO: no statue-mark circle-crop variant in folder as of 2026-04-23 -->
<!-- TODO: no transparent-background wordmark overlay variant in folder as of 2026-04-23 -->
<!-- TODO: no dedicated Apple touch icon (180px) in folder as of 2026-04-23 — use atlas-icon-192.png as the closest substitute -->
<!-- TODO: no SVG favicon in folder as of 2026-04-23 — all assets are PNG -->
<!-- TODO: no enterprise-icon-maskable-192.png in folder as of 2026-04-23 (only the 512 variant is present) -->

### Wordmark construction (non-negotiable)

The ATLAS wordmark is built in Bebas Neue with four letters in white (`#FFFFFF`) and the **second A in gold (`#C9A84C`)**. The wordmark is always used as a PNG or SVG — **never typeset from scratch**, even in Bebas Neue.

### Minimum sizes

- **Wordmark — digital:** 140px wide minimum
- **Wordmark — print:** 1.25 inches (32mm) wide minimum
- **Statue mark — digital:** 24px minimum
- **Statue mark — print:** 0.5 inches (13mm) minimum

Below the minimum, use the statue mark instead of the wordmark.

### Clear space

- **Wordmark:** 0.5× cap height on all sides
- **Statue mark:** 0.25× icon diameter on all sides

### Watermark rule

The statue mark appears as a watermark on most ATLAS deliverables, centered behind content at **6–8% opacity**, pointer-events disabled, z-index 0. Never above 10%, never visible enough to compete with content.

### Prohibitions

1. Never typeset ATLAS — always use the wordmark PNG or SVG
2. Never change the second-A gold to any other color
3. Never stretch, skew, rotate, or outline the wordmark
4. Never place the wordmark on pure white without a navy container/band behind it
5. Never place the wordmark on gold (the accent becomes invisible)
6. Never place on busy photography without a navy overlay at 60%+ opacity
7. Never add drop shadow, outer glow, bevel, or emboss effects
8. Never recreate the wordmark from scratch, even in Bebas Neue

---

## 6. Document conventions

### Cover page / header band

Formalized from the demo-card pattern. Every multi-page ATLAS document opens with this structure.

- **Band background:** `--navy-card` (#161630)
- **Padding:** 28px top/bottom, 48px sides
- **Left:** ATLAS wordmark at 52px height + statue mark alongside at 52px height, 14px left margin
- **Right:** Credential line in Space Mono 10px, `--gold`, letter-spacing 0.22em
- **Divider:** 1px gold rule full-width below the band
- **Body surface:** `--navy` (#09091A) below the divider
- **Watermark:** Statue mark centered behind content at 8% opacity

### Headings

- H1: Bebas Neue, `--white`, 72px
- H2: Bebas Neue, `--gold`, 44px
- H3: Barlow Condensed 700, `--gold`, 20px, letter-spacing 0.04em, uppercase
- Eyebrow: Space Mono 11px, `--gold`, letter-spacing 0.22em, uppercase

### Body

Barlow 400 at 15px, line-height 1.6, color `--off-white` (#E8E8F0).

### Footer

Every page footer follows this pattern:

```
ATLAS · On Spot Solutions LLC · onspot-solutions.com/atlas-landing · p. X
```

- Font: Space Mono 9px
- Color: white at 45% opacity
- Separators: middle dot ( · ), never pipes
- Page number: `p. X` — never `page X of Y`

### Required elements on every deliverable

- ATLAS wordmark (header or header-equivalent position)
- Statue watermark at 6–8% opacity
- Gold accent bar or rule somewhere in the composition
- Footer as specified above
- Canonical landing URL: `onspot-solutions.com/atlas-landing`

---

## 7. Positioning guardrails

### ATLAS IS

- A field intelligence platform for parking and access control
- Built from the collective tribal knowledge of every user
- A lifeline that frees technicians for high-value complex work

### ATLAS IS NOT

- Not a chatbot, AI toy, or search engine
- Not a replacement for a service contract
- Not competing with technicians or the service industry

---

## 8. Locked content

### Locked statistics — the only stats ever used

| Stat | Attribution |
|---|---|
| **$500+** per unplanned service call | On Spot Solutions billing rate |
| **600+** sessions | Beta usage to date |
| **15+** years field service | Founder experience |

When referring to the knowledge base, **do not quantify pages ingested**. Say:

> *"ATLAS learns from real field examples and real data generated from service calls, backed by a comprehensive library of information."*

### Banned statistics — never use

- 70% resolution rate
- 15-minute average resolution
- 60% voice adoption
- 8+ sessions/tech/month
- 2K+ sessions
- 1,000+ field doc pages (retired — do not quantify)

### Emergency call floor

$1,000+ per emergency call. **$630 is retired** and no longer used in materials.

### Anchor field stories

**CEO / strategic audiences:**
10pm Friday. TD Garden. Loop detector reset. 20 minutes of work. $1,000+ invoice. Happened repeatedly.

**Operations audiences:**
Saturday dispatch. Gate down 4 days. Limit switch reset. 10 minutes of work. $1,000+ invoice. April 2026.

### Pricing tiers (exact, never alter)

| Tier | Price | Position |
|---|---|---|
| **FREE** | $0/mo | Entry tier |
| **PRO** | $39.99/mo | Most popular |
| **PRO+** | $79.99/mo | Power users |

### Approved CTAs

| Context | CTA |
|---|---|
| Free tier / general | **Run a Live Session — Free** |
| QR scan | **Scan to See It Work on Your Phone** |
| Demo guide bottom | **Start Your First Session — No Download Required** |
| Enterprise | **Enterprise early access — inquire at booth** |

### Tagline

**Fixed at Your Fingertips.** — period always. No abbreviation, no variant, no translation.

---

## 9. Contact and canonical URLs

| Resource | URL |
|---|---|
| Primary landing | `https://onspot-solutions.com/atlas-landing` |
| Parent company | `https://onspot-solutions.com` |
| Support email | `jon@onspot-solutions.com` |
| Credential | PIE 2026 Accelerate! Contestant |

---

## 10. Machine-readable tokens

For frontend systems and AI orchestration. Parse this block directly.

```json
{
  "brand": "ATLAS",
  "slug": "atlas",
  "parent": "On Spot Solutions LLC",
  "tagline": "Fixed at Your Fingertips.",
  "landing_url": "https://onspot-solutions.com/atlas-landing",
  "colors": {
    "navy": "#09091A",
    "navy_mid": "#111126",
    "navy_card": "#161630",
    "gold": "#C9A84C",
    "gold_bright": "#E0C06A",
    "gold_dim": "#8A6E2F",
    "white": "#FFFFFF",
    "off_white": "#E8E8F0",
    "muted": "rgba(255,255,255,0.45)"
  },
  "canonical_surface": "navy",
  "fonts": {
    "headline": "Bebas Neue",
    "subhead": "Barlow Condensed",
    "body": "Barlow",
    "label": "Space Mono"
  },
  "logos": {
    "wordmark_dark": "atlas-logo-hires.png",
    "mark_square": "atlas-statue.png",
    "mark_square_alt": "atlas-statue-1.png",
    "icon_16": "atlas-icon-16.png",
    "icon_32": "atlas-icon-32.png",
    "icon_192": "atlas-icon-192.png",
    "icon_512": "atlas-icon-512.png",
    "icon_maskable_192": "atlas-icon-maskable-192.png",
    "icon_maskable_512": "atlas-icon-maskable-512.png",
    "dallas_icon_192": "dallas-icon-192.png",
    "dallas_icon_512": "dallas-icon-512.png",
    "dallas_icon_maskable_192": "dallas-icon-maskable-192.png",
    "dallas_icon_maskable_512": "dallas-icon-maskable-512.png",
    "enterprise_icon_16": "enterprise-icon-16.png",
    "enterprise_icon_32": "enterprise-icon-32.png",
    "enterprise_icon_192": "enterprise-icon-192.png",
    "enterprise_icon_512": "enterprise-icon-512.png",
    "enterprise_icon_maskable_512": "enterprise-icon-maskable-512.png"
  },
  "min_wordmark_width_px": 140,
  "min_wordmark_width_print_in": 1.25,
  "clear_space_wordmark": "0.5x cap-height",
  "clear_space_mark": "0.25x icon diameter",
  "watermark_opacity": 0.08,
  "locked_stats": {
    "cost_per_call": "$500+",
    "sessions": "600+",
    "years_experience": "15+",
    "emergency_call_floor": "$1000+"
  },
  "banned_stats": [
    "70% resolution rate",
    "15-minute average",
    "60% voice adoption",
    "8+ sessions/tech/month",
    "2K+ sessions",
    "1000+ field doc pages"
  ],
  "banned_phrases": [
    "AI",
    "artificial intelligence",
    "30-year technician",
    "trained on thousands of pages",
    "smart",
    "clever",
    "seamless",
    "delightful",
    "intuitive",
    "truck roll"
  ],
  "approved_ctas": {
    "free": "Run a Live Session — Free",
    "qr": "Scan to See It Work on Your Phone",
    "demo": "Start Your First Session — No Download Required",
    "enterprise": "Enterprise early access — inquire at booth"
  },
  "pricing": {
    "free": "$0/mo",
    "pro": "$39.99/mo",
    "pro_plus": "$79.99/mo"
  },
  "contact": {
    "email": "jon@onspot-solutions.com",
    "parent_url": "https://onspot-solutions.com",
    "landing_url": "https://onspot-solutions.com/atlas-landing"
  },
  "credential": "PIE 2026 Accelerate! Contestant"
}
```

---

*ATLAS · On Spot Solutions LLC · Boston, Massachusetts · v1.0*
