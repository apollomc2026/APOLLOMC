# Apollo — UI Gaps

An honest inventory of what `apollo-intake/index.html` does **not** yet do well. Severity and effort are for Jon's triage after he runs the MVP.

Legend: **severity** = `blocking` (stops real use) / `nice-to-have`; **effort** = `S` (<1hr) / `M` (half day) / `L` (day+).

---

## Visual polish

1. **No loading skeletons.** Template and brand grids appear as empty space for a beat on cold cache, then pop in. A simple three-card shimmer skeleton would close the perceived-latency gap. — `nice-to-have`, `S`.
2. **No step-transition animation.** Steps swap with an instant `innerHTML = ''`. A crossfade or slide would soften the 6-step flow. — `nice-to-have`, `S`.
3. **Buttons lack pressed/focused states.** Focus ring is browser default; no `:active` treatment. — `nice-to-have`, `S`.
4. **Empty states are bare.** If the templates list is empty (misconfigured server), the user sees a blank grid instead of "No templates configured — contact admin." — `nice-to-have`, `S`.
5. **Result Drive link is a single button.** No copy-to-clipboard, no file-size/page-count summary, no thumbnail. — `nice-to-have`, `S`.
6. **No dark-mode variant.** Apollo's deliverables palette is white-only, but a browser-level dark preference currently leaves the form glaringly white on OLED phones at night. — `nice-to-have`, `M`.

---

## Accessibility

7. **No ARIA live region** for status updates (`Generating…` / `Delivered`). Screen readers won't announce success/failure automatically. — `blocking` for accessibility-audit clients, `S`.
8. **Modal focus trap missing.** The API-key modal opens but doesn't trap Tab, and doesn't return focus to the trigger on close. — `nice-to-have`, `S`.
9. **Brand-card buttons have image-only children** on hover (before logo loads) — assistive tech sees only the text label, which works, but the interim `<div class="brand-placeholder">—</div>` has no label. — `nice-to-have`, `S`.
10. **No `aria-required` on required form fields**, only the visual `*`. — `nice-to-have`, `S`.
11. **Color contrast:** muted (`#6B7280` ~4.6:1 on white) and `field-help` lines are borderline at WCAG AA for small body text. — `nice-to-have`, `S`.
12. **`lang="en"` is hardcoded**, no translation surface. — `nice-to-have`, `M`.
13. **File-upload drop zone** has no keyboard-only equivalent beyond clicking the label. A visible "Browse files" button inside the zone would help. — `nice-to-have`, `S`.

---

## Mobile responsiveness

14. **Breakpoints are one-shot at 640px.** Between 640–900px the brand grid collapses to 2 columns and the long template-card descriptions wrap awkwardly. — `nice-to-have`, `S`.
15. **Progress bar is tiny on mobile** (3px). Touch users miss the cue. — `nice-to-have`, `S`.
16. **No viewport-height handling for iOS keyboard.** On iPhone, the API-key modal input can get occluded when the keyboard opens. — `nice-to-have`, `M`.
17. **Image thumbnails are 90px fixed height.** On portrait phones a full column of thumbnails takes most of the viewport. — `nice-to-have`, `S`.

---

## Error handling

18. **Network failure shows `Failed to fetch`.** No retry, no offline hint. — `blocking` in low-connectivity settings, `S`.
19. **500 responses show the raw `error` field** verbatim. For Drive/Claude stack-trace strings, this is honest but could be noisy. A "details" disclosure triangle would help. — `nice-to-have`, `S`.
20. **No request timeout.** If a Claude call hangs past 5 minutes, the Vercel function will time out (300s `maxDuration`) but the browser's `fetch` will continue to hang until the server closes the connection. A client-side abort controller at 5m30s is worth adding. — `nice-to-have`, `S`.
21. **No idempotency key.** Double-clicking the Generate button could create a duplicate submission + duplicate Drive upload. Disabling the button during submit helps but a server-side dedupe key would be stricter. — `nice-to-have`, `M`.
22. **Submission row stuck in `generating`** if Vercel instance is killed mid-flight. No background reconciliation. — `nice-to-have`, `M`.
23. **No partial save of inputs.** If a user fills 10 fields and the page reloads, all inputs are lost. — `blocking` for longer templates (proposal, incident report), `M` (localStorage) / `L` (server-side drafts).

---

## Multi-user

24. **Single shared API key.** No per-user auth, no attribution, no revocation except rotating the one key. All submissions in Supabase are anonymous. — `blocking` for any team use, `L`.
25. **No user identification** — `submission.json` omits who created the doc. — `blocking` for multi-user, `S` (needs auth first).
26. **No rate limiting.** Someone who obtains the API key can hammer the endpoint. Vercel provides platform limits but nothing at the app layer. — `nice-to-have` for single-user MVP, `M`.

---

## Preview / edit

27. **No output preview before Drive upload.** The generated DOCX lands straight in Drive. If Claude hallucinates, the user finds out by opening the doc. — `nice-to-have`, `L` (needs a preview rendering path).
28. **No edit-and-regenerate loop.** If the first draft is close but wrong, the user starts over from Step 1. — `nice-to-have`, `L`.
29. **No section-level retry.** Regenerating one section requires regenerating the whole doc. The `tasks` table in the legacy portal was designed for this but Apollo MVP does not use it. — `nice-to-have`, `L`.

---

## Template coverage gaps (MVP 10)

30. **No purchase order / PO.** Common request adjacent to Invoice + SOW. — `M`.
31. **No RFP response / capability statement.** Close to Proposal but differently structured. — `M`.
32. **No status update / weekly report.** Adjacent to Meeting Minutes but cadence-driven. — `M`.
33. **No customer-facing service agreement (MSA).** Legal-template neighbor to Engagement Letter. — `M`.
34. **No follow-up letter / thank-you.** Simple enough to fit, but unscoped. — `S`.
35. **Invoice template has no tax jurisdiction field.** US-only mental model. — `S`.

---

## Branding

36. **"Other" brand = no brand.** There is no flow for a user to upload a one-off brand.md + logo for a single document. — `nice-to-have`, `L`.
37. **Brand inventory is edit-by-commit.** Adding a brand requires editing `PRIMARY_LOGO_CANDIDATES` in `brands.ts`. This is fine for ~5 brands; it does not scale past 20. — `nice-to-have`, `M`.
38. **Habi / Themis placeholder brands** show up in the picker but generate unbranded output. Users may be confused. Either hide placeholders or show a "coming soon — falls back to generic" overlay. — `nice-to-have`, `S`.

---

## Image handling

39. **No EXIF stripping.** Phone photos embed GPS + camera serial. The uploaded DOCX will leak these to whoever it's shared with. — `blocking` for field-service use with named sites, `S`.
40. **No compression.** A 5MB iPhone photo passes through as-is; DOCX bloats quickly. — `nice-to-have`, `S`.
41. **No re-ordering** of attached images. If a user adds a photo out of order, they must remove and re-add. — `nice-to-have`, `S`.
42. **No captions.** Claude references images as "Figure 1" but has no per-image caption input. — `nice-to-have`, `M`.
43. **No thumbnail quality preview.** The in-page thumbnail is a browser `object-fit: cover` crop, not the actual DOCX render. Users can be surprised by aspect-ratio changes. — `nice-to-have`, `S`.

---

## Cost / rate / observability

44. **No usage tracking.** Nothing reports `n Claude calls this month`, `$X in API cost`, `Y DOCX generated`. — `nice-to-have`, `M`.
45. **No per-template cost estimate.** Proposal (10 sections, large prompt) costs noticeably more than One-Pager, but the UI doesn't surface this. — `nice-to-have`, `M`.
46. **No per-user quotas.** (Requires multi-user first.) — `blocking` for team deployment, `M` after multi-user lands.
47. **No structured failure logging** beyond `console.error` + the `error_message` column. No Sentry, no Supabase function logging, no alert channel. — `nice-to-have`, `S` (wire to Vercel log drain) or `M` (Sentry).
48. **Supabase `apollo_submissions` is the only audit surface.** No daily digest, no email on failure. — `nice-to-have`, `S`.

---

## Summary

- **Blocking items before non-single-user production use:** 7 (screen-reader status), 18 (network-failure UX), 23 (lost inputs on reload), 24–26 (multi-user auth + attribution + rate limiting), 39 (EXIF leak).
- **Blocking items before any client-facing use:** 39 (EXIF leak is the big one — field-service photos must be stripped before the doc ships).
- Everything else is polish. The MVP is usable by Jon on his own for private documents today.
