// Apollo shared uploads client — POST/GET/DELETE wrappers, drag-drop
// helper, file validator. Pages drive state; this module only talks to
// the backend and provides reusable DOM glue.

import { API, apiCall, apiJson } from './api.js';

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

// upload(file, kind, opts) — POSTs multipart, returns the row object
// the backend echoes back on success.
//   opts: { caption?, onProgress?(loaded, total) }
// onProgress is wired via XMLHttpRequest because fetch() doesn't expose
// upload progress. The promise resolves with the parsed JSON body.
export function upload(file, kind, opts) {
  const o = opts || {};
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.set('file', file);
    form.set('upload_kind', kind);
    if (typeof o.caption === 'string' && o.caption.trim()) form.set('caption', o.caption.trim());
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API + '/api/apollo/uploads', true);
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    if (typeof o.onProgress === 'function' && xhr.upload) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) o.onProgress(e.loaded, e.total);
      });
    }
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onload = () => {
      const body = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body && body.upload ? body.upload : body);
      } else {
        const msg = (body && body.error) || ('HTTP ' + xhr.status);
        reject(new Error(msg));
      }
    };
    xhr.send(form);
  });
}

// remove(id) — DELETE /api/apollo/uploads/<id>. 404 is treated as success
// (already gone). Throws on other non-2xx with the backend's error
// message when present.
export async function remove(id) {
  if (!id) return;
  const res = await apiCall('/api/apollo/uploads/' + encodeURIComponent(id), { method: 'DELETE' });
  if (res.status === 404) return; // already gone
  if (!res.ok) {
    let parsed = null;
    try { parsed = await res.json(); } catch {}
    throw new Error((parsed && parsed.error) || ('HTTP ' + res.status));
  }
}

// list(opts) — current user's recent uploads via the unscoped GET.
// opts.slug is reserved for future per-deliverable filtering; the
// backend currently ignores it.
export async function list(opts) {
  const o = opts || {};
  const params = new URLSearchParams();
  if (o.slug) params.set('slug', o.slug);
  const qs = params.toString();
  const data = await apiJson('/api/apollo/uploads' + (qs ? '?' + qs : ''));
  return (data && data.uploads) || [];
}

// getOne(id) — fetch a single upload row with a fresh signed URL.
export async function getOne(id) {
  if (!id) return null;
  const data = await apiJson('/api/apollo/uploads/' + encodeURIComponent(id));
  return data && data.upload ? data.upload : null;
}

// attachDragDrop(zoneEl, onFiles) — wires drag highlight + drop handler
// onto an element. Returns a cleanup function that removes listeners.
export function attachDragDrop(zoneEl, onFiles) {
  if (!zoneEl) return () => {};
  const onOver = (e) => { e.preventDefault(); zoneEl.classList.add('hot'); };
  const onLeave = () => { zoneEl.classList.remove('hot'); };
  const onDrop = (e) => {
    e.preventDefault();
    zoneEl.classList.remove('hot');
    if (onFiles && e.dataTransfer && e.dataTransfer.files) {
      onFiles(e.dataTransfer.files);
    }
  };
  zoneEl.addEventListener('dragover', onOver);
  zoneEl.addEventListener('dragleave', onLeave);
  zoneEl.addEventListener('drop', onDrop);
  return () => {
    zoneEl.removeEventListener('dragover', onOver);
    zoneEl.removeEventListener('dragleave', onLeave);
    zoneEl.removeEventListener('drop', onDrop);
  };
}

// validateFile(file, opts) — { ok: true } or { ok: false, error: string }.
//   opts.maxBytes (default 50 MB)
//   opts.allowedMime — array of mime strings; if set, file.type must match.
export function validateFile(file, opts) {
  const o = opts || {};
  if (!file) return { ok: false, error: 'No file' };
  const maxBytes = typeof o.maxBytes === 'number' ? o.maxBytes : DEFAULT_MAX_BYTES;
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: file.name + ' exceeds ' + mb + ' MB' };
  }
  if (Array.isArray(o.allowedMime) && o.allowedMime.length > 0) {
    if (!o.allowedMime.includes(file.type)) {
      return { ok: false, error: file.name + ' has unsupported type ' + (file.type || 'unknown') };
    }
  }
  return { ok: true };
}
