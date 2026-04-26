// Apollo shared UI helpers — DOM factory, formatters, SVG factories.
// Behavior identical to the monolith's helpers; just packaged as ES exports.

// ---- DOM factory ----

// el(tag, attrs, ...children) — concise DOM builder.
//   - attrs.class becomes className; attrs.style passes through; on* keys
//     attach event listeners; boolean true → presence attribute.
//   - children may be strings, nodes, arrays, or null/false (skipped).
export function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'style') n.setAttribute('style', v);
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (v === true) n.setAttribute(k, '');
      else n.setAttribute(k, v);
    }
  }
  for (const kid of kids) {
    if (kid == null || kid === false) continue;
    if (Array.isArray(kid)) {
      kid.forEach((k) => {
        if (k != null && k !== false) {
          n.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
        }
      });
    } else if (typeof kid === 'string') n.appendChild(document.createTextNode(kid));
    else n.appendChild(kid);
  }
  return n;
}

// ---- Toast ----

// toast(msg, opts) — transient notification mounted into #toastHost.
//   opts: { variant: 'info'|'success'|'error', ttl: ms (default 4500) }
// Creates #toastHost if missing.
export function toast(msg, opts) {
  const o = opts || {};
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    document.body.appendChild(host);
  }
  const variant = o.variant || 'info';
  const ttl = typeof o.ttl === 'number' ? o.ttl : 4500;
  const t = el('div', { class: 'toast', 'data-variant': variant }, msg);
  host.appendChild(t);
  setTimeout(() => t.remove(), ttl);
  return t;
}

// ---- String sanitizers ----

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---- Time + value formatters ----

export function formatRelativeTime(iso) {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 14) return d + 'd ago';
  const w = Math.floor(d / 7);
  return w + 'w ago';
}

export function formatTimestamp(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' +
         pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export function formatPriceCents(cents) {
  if (typeof cents !== 'number' || !Number.isFinite(cents) || cents <= 0) return null;
  const dollars = Math.round(cents / 100);
  return '$' + dollars;
}

export function bytesToHuman(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

// ---- Composed UI fragments ----

// priceLineEl(deliverable) — strikethrough $N · FREE PREVIEW · M min · X-Yp
// Accepts a deliverable summary or the full template payload (both have
// base_price_cents / estimated_minutes / estimated_pages_*).
export function priceLineEl(d) {
  const wrap = el('span', { class: 'wiz-price-line' });
  const cents = d.base_price_cents || 0;
  const price = formatPriceCents(cents);
  if (price) {
    wrap.appendChild(el('span', { class: 'price-strike' }, price));
    wrap.appendChild(el('span', { class: 'price-active' }, 'FREE PREVIEW'));
  } else {
    wrap.appendChild(el('span', { class: 'price-active' }, 'FREE PREVIEW'));
  }
  const meta = [];
  if (typeof d.estimated_minutes === 'number') meta.push(d.estimated_minutes + ' min');
  if (typeof d.estimated_pages_min === 'number' && typeof d.estimated_pages_max === 'number') {
    meta.push(
      d.estimated_pages_min === d.estimated_pages_max
        ? d.estimated_pages_min + 'p'
        : d.estimated_pages_min + '–' + d.estimated_pages_max + 'p'
    );
  }
  if (meta.length) wrap.appendChild(el('span', { class: 'price-meta' }, meta.join(' · ')));
  return wrap;
}

// createCustomSelect — dark-themed dropdown (replaces native <select>
// because dark-mode native option lists hit white-on-white on most browsers).
//   container: a <div class="custom-select"> mount point
//   options: [{ key, label, description? }]
//   onChange(key, opt) optional
//   currentValue: initial selection (defaults to first option)
export function createCustomSelect(container, options, onChange, currentValue) {
  if (!container) return;
  const escA = (s) => String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const escT = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  container.innerHTML = `
    <button class="custom-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
      <span class="custom-select-value"></span>
      <span class="custom-select-chevron">⌄</span>
    </button>
    <ul class="custom-select-menu" role="listbox" hidden>
      ${options.map((o) => `
        <li class="custom-select-option" role="option" data-value="${escA(o.key)}">
          <div class="custom-select-option-label">${escT(o.label)}</div>
          ${o.description ? `<div class="custom-select-option-desc">${escT(o.description)}</div>` : ''}
        </li>
      `).join('')}
    </ul>
  `;
  const trigger = container.querySelector('.custom-select-trigger');
  const menu = container.querySelector('.custom-select-menu');
  const valueEl = container.querySelector('.custom-select-value');
  function setValue(key) {
    const opt = options.find((o) => o.key === key);
    if (!opt) return;
    valueEl.textContent = opt.label;
  }
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    trigger.setAttribute('aria-expanded', String(!isOpen));
  });
  menu.querySelectorAll('.custom-select-option').forEach((li) => {
    li.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = li.dataset.value;
      setValue(key);
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      const opt = options.find((o) => o.key === key);
      if (onChange) onChange(key, opt);
    });
  });
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
  setValue(currentValue || (options[0] && options[0].key));
}

// ---- SVG factories ----

const SVG_NS = 'http://www.w3.org/2000/svg';

export function uploadIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  for (const d of ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12']) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  }
  return svg;
}

export function checkmarkSvg() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 72 72');
  svg.setAttribute('class', 'checkmark');
  const c = document.createElementNS(SVG_NS, 'circle');
  c.setAttribute('cx', '36');
  c.setAttribute('cy', '36');
  c.setAttribute('r', '30');
  svg.appendChild(c);
  const p = document.createElementNS(SVG_NS, 'path');
  p.setAttribute('d', 'M22 38 L32 48 L52 26');
  svg.appendChild(p);
  return svg;
}

export function rocketIcon(launching) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('class', 'launch-icon' + (launching ? ' launching' : ''));
  const parts = [
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
    'M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
    'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0',
    'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  ];
  for (const d of parts) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  }
  return svg;
}

export function googleIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const paths = [
    ['M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z', '#4285F4'],
    ['M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z', '#34A853'],
    ['M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z', '#FBBC05'],
    ['M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z', '#EA4335'],
  ];
  for (const [d, fill] of paths) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', fill);
    svg.appendChild(p);
  }
  return svg;
}

// industryIconSvg(iconKey) — Lucide-shape inline SVG keyed by industry
// catalog.json icon_key. Returns an HTML string (used inside template
// literals when building station cards), not a node.
const INDUSTRY_ICONS = {
  'scale':       '<path d="M16 16h-2"/><path d="M16 16l3-7 3 7"/><path d="M22 16h-6"/><path d="M2 16l3-7 3 7"/><path d="M2 16h6"/><path d="M12 3v18"/><path d="M5 9V6h14v3"/><path d="M5 21h14"/>',
  'briefcase':   '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  'landmark':    '<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  'bar-chart':   '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/><line x1="3" y1="20" x2="21" y2="20"/>',
  'rocket':      '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  'wrench':      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'utensils':    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/><line x1="18" y1="15" x2="18" y2="22"/>',
  'video':       '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
};

export function industryIconSvg(iconKey) {
  const inner = INDUSTRY_ICONS[iconKey] || INDUSTRY_ICONS['briefcase'];
  return '<svg class="station-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
}
