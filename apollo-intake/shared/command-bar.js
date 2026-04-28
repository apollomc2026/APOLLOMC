// Apollo command bar — pinned glass header on every page.
//
// Brand selector replaces yesterday's "click to cycle" hack with a real
// dropdown via createCustomSelect. When the user picks a brand, we both
//   1. set document.documentElement.dataset.brand so theme.css's
//      [data-brand="X"] rules apply (cyan accent shifts), and
//   2. invoke onBrandChange(slug) so the page can refresh derived data.
//
// The CSS classes used here all live in theme.css.

import { el, escapeHtml, createCustomSelect } from './ui.js';
import { signOut } from './auth.js';

const BAR_ID = 'apolloCommandBar';

// Brand display labels — keep in sync with the picker option set.
const BRAND_LABELS = {
  apollo: 'Apollo',
  atlas: 'Atlas',
  'on-spot-solutions': 'On Spot Solutions',
  habi: 'Habi',
  themis: 'Themis',
};

// mount(opts) — renders the command bar. Idempotent; subsequent calls
// no-op if the bar is already in the DOM.
//   opts: {
//     user: { email, name, avatar },
//     brand: 'apollo' | 'atlas' | ...,         // initial selection
//     brands: ['apollo', 'atlas', ...],         // list to expose in picker
//     onBrandChange?: (slug) => void,           // page refresh hook
//     status?: 'pending' | 'operational',       // initial LED state
//   }
export function mount(opts) {
  if (document.getElementById(BAR_ID)) return;
  const o = opts || {};
  // Brand still drives [data-brand] for theme accent shifts. The
  // dashboard no longer surfaces a brand picker — brand belongs to a
  // document. We seed the data attr from the last wizard pick so the
  // accent stays consistent for the operator's session, but the bar
  // itself doesn't expose a control.
  const initialBrand = o.brand || localStorage.getItem('apollo:brand') || 'apollo';
  document.documentElement.dataset.brand = initialBrand;
  // showBrandSelector is opt-in. Pages that genuinely need a brand
  // dropdown can pass `brands: [...]`; the dashboard does not.
  const showBrandSelector = Array.isArray(o.brands) && o.brands.length > 0;

  const bar = el('header',
    { class: 'command-bar', id: BAR_ID, role: 'banner' },
    el('div', { class: 'cb-left' },
      el('a', { href: '/apollo/', class: 'cb-logomark', 'aria-label': 'Apollo Mission Control' },
        el('img', { src: '/apollo/logo.png', alt: '', onerror: "this.style.display='none'" })
      ),
      el('div', { class: 'cb-status', role: 'status', 'aria-live': 'polite' },
        el('span', { class: 'cb-led', id: BAR_ID + 'Led', 'data-state': o.status === 'operational' ? 'ready' : 'degraded' }),
        el('span', { class: 'cb-status-text', id: BAR_ID + 'StatusText' },
          o.status === 'operational' ? 'ALL SYSTEMS OPERATIONAL' : 'PENDING OPERATOR AUTH'
        )
      ),
      el('div', { class: 'cb-clock', id: BAR_ID + 'Clock', 'aria-label': 'Session clock' }, '00:00:00')
    ),
    el('div', { class: 'cb-right' },
      showBrandSelector
        ? el('div', { class: 'cb-brand-selector', id: BAR_ID + 'BrandSelector' })
        : null,
      el('div', { class: 'cb-operator', id: BAR_ID + 'Operator' })
    )
  );
  document.body.appendChild(bar);

  // Brand picker — only mounted when the page opted in.
  if (showBrandSelector) {
    const brandOptions = o.brands.map((slug) => ({
      key: slug,
      label: (BRAND_LABELS[slug] || slug).toUpperCase(),
    }));
    const brandHost = document.getElementById(BAR_ID + 'BrandSelector');
    brandHost.classList.add('cb-brand', 'custom-select');
    createCustomSelect(
      brandHost,
      brandOptions,
      (slug) => {
        document.documentElement.dataset.brand = slug;
        if (typeof o.onBrandChange === 'function') o.onBrandChange(slug);
      },
      initialBrand
    );
  }

  // Operator menu — avatar (fallback to initial) + Sign out
  const operatorHost = document.getElementById(BAR_ID + 'Operator');
  if (o.user && o.user.email) {
    const initial = (o.user.name || o.user.email || '?').charAt(0).toUpperCase();
    const avatar = o.user.avatar
      ? el('span', { class: 'cb-operator-avatar' },
          el('img', { src: o.user.avatar, alt: '', onerror: "this.parentNode.textContent=" + JSON.stringify(initial) })
        )
      : el('span', { class: 'cb-operator-avatar' }, initial);
    operatorHost.appendChild(avatar);
    operatorHost.appendChild(
      el('button', { class: 'cb-signout', type: 'button', onclick: signOut, title: o.user.email }, 'SIGN OUT')
    );
  }
}

// updateStatus(state, text) — change LED color + status label without
// remounting the bar.
//   state: 'pending' | 'operational' | 'degraded' | 'blocked' | 'ready'
export function updateStatus(state, text) {
  const led = document.getElementById(BAR_ID + 'Led');
  const txt = document.getElementById(BAR_ID + 'StatusText');
  if (led) {
    if (state === 'operational' || state === 'ready') led.dataset.state = 'ready';
    else if (state === 'degraded' || state === 'pending') led.dataset.state = 'degraded';
    else if (state === 'blocked') led.dataset.state = 'blocked';
  }
  if (txt && typeof text === 'string') txt.textContent = text;
}

// Mission clock — counts up from the moment startClock() runs.
let clockInterval = null;
let clockStart = 0;

export function startClock() {
  const el = document.getElementById(BAR_ID + 'Clock');
  if (!el) return;
  clockStart = Date.now();
  const tick = () => {
    const elapsed = Math.floor((Date.now() - clockStart) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    el.textContent = h + ':' + m + ':' + s;
  };
  tick();
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(tick, 1000);
}

export function stopClock() {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
}

// Suppress unused-import warning on escapeHtml — kept available for
// future fields that may surface user-supplied strings in the bar.
void escapeHtml;
