// Apollo shared auth modal — glass dialog over a dimmed console.
//
// All three pages call mount({ status: 'loading' }) at boot, then
// updateStatus({ status: 'signed-out' | 'not-authorized' | 'loading' })
// or dismiss() based on the requireAuth() handler that fires.
//
// The DOM is built once, idempotent: subsequent mount() calls just
// updateStatus() rather than re-creating the panel.

import { el, googleIcon } from './ui.js';
import { signInUrl } from './auth.js';

const MODAL_ID = 'apolloAuthModal';

// mount(opts) — creates the modal in document.body if missing, then
// applies opts. Idempotent.
//   opts: { status: 'loading' | 'signed-out' | 'not-authorized', email?, error? }
export function mount(opts) {
  let modal = document.getElementById(MODAL_ID);
  if (!modal) {
    modal = el('div',
      { class: 'auth-modal', id: MODAL_ID, hidden: true, 'aria-modal': 'true', role: 'dialog', 'aria-labelledby': MODAL_ID + 'Title' },
      el('div', { class: 'auth-modal-backdrop', 'aria-hidden': 'true' }),
      el('div', { class: 'auth-modal-panel' },
        el('h2', { id: MODAL_ID + 'Title' }, 'OPERATOR AUTHENTICATION REQUIRED'),
        el('p', { class: 'auth-modal-desc' }, 'Sign in with your authorized Google account to bring mission control online.'),
        el('div', { class: 'auth-modal-error', id: MODAL_ID + 'Error', hidden: true }),
        el('button',
          {
            class: 'auth-google-btn',
            id: MODAL_ID + 'Btn',
            type: 'button',
            onclick: () => { window.location.href = signInUrl(); },
          },
          googleIcon(),
          ' CONTINUE WITH GOOGLE'
        ),
        el('p', { class: 'auth-modal-note' }, 'Authorized operators only. Contact mission control to request access.')
      )
    );
    document.body.appendChild(modal);
  }
  updateStatus(opts);
}

// dismiss() — animates out, then hides. Survives being called when the
// modal isn't mounted or is already hidden.
export function dismiss() {
  const modal = document.getElementById(MODAL_ID);
  if (!modal || modal.hidden) return;
  modal.classList.add('dissolving');
  setTimeout(() => {
    modal.hidden = true;
    modal.classList.remove('dissolving');
  }, 600);
}

// updateStatus(opts) — change content without re-mounting. Safe to call
// before mount() (no-ops in that case, but mount() runs updateStatus()
// anyway when it ends, so prefer mount({ status }) at first call).
export function updateStatus(opts) {
  const o = opts || { status: 'loading' };
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;
  const titleEl = document.getElementById(MODAL_ID + 'Title');
  const errEl = document.getElementById(MODAL_ID + 'Error');
  const btn = document.getElementById(MODAL_ID + 'Btn');
  const note = modal.querySelector('.auth-modal-note');
  const desc = modal.querySelector('.auth-modal-desc');

  if (errEl) {
    errEl.hidden = true;
    errEl.textContent = '';
  }

  if (o.status === 'not-authorized') {
    if (titleEl) titleEl.textContent = 'OPERATOR NOT AUTHORIZED';
    if (desc) {
      desc.textContent =
        'This Google account is not on the allowlist. Sign in with an authorized account or contact mission control.';
    }
    if (errEl && o.email) {
      errEl.textContent = 'Signed in as ' + o.email + ' — not on the allowlist.';
      errEl.hidden = false;
    }
    if (btn) btn.style.display = '';
    if (note) note.textContent = 'Authorized operators only. Contact mission control to request access.';
  } else if (o.status === 'loading') {
    if (titleEl) titleEl.textContent = 'CONNECTING TO MISSION CONTROL';
    if (desc) desc.textContent = 'Establishing operator session…';
    if (btn) btn.style.display = 'none';
    if (note) note.textContent = '';
  } else {
    // 'signed-out' or default
    if (titleEl) titleEl.textContent = 'OPERATOR AUTHENTICATION REQUIRED';
    if (desc) {
      desc.textContent =
        'Sign in with your authorized Google account to bring mission control online.';
    }
    if (btn) btn.style.display = '';
    if (note) note.textContent = 'Authorized operators only. Contact mission control to request access.';
  }

  if (o.error && errEl) {
    errEl.textContent = o.error;
    errEl.hidden = false;
  }

  modal.hidden = false;
  modal.classList.remove('dissolving');
  if (btn && o.status !== 'loading') {
    setTimeout(() => { try { btn.focus(); } catch (e) {} }, 80);
  }
}
