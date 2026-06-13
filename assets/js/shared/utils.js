/**
 * JLPT Master — Shared Utilities
 */

// ─────────────────────────────────────────────
// DOM helpers
// ─────────────────────────────────────────────

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class')           e.className = v;
    else if (k === 'html')       e.innerHTML = v;
    else if (k === 'text')       e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else                         e.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null) continue;
    e.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return e;
}

// ─────────────────────────────────────────────
// Toast notifications
// ─────────────────────────────────────────────

export function toast(msg, type = 'default', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = el('div', { class: `toast ${type}`, text: msg });
  container.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => { t.classList.add('show'); }); });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ─────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────

export function showModal({ title = '', body = '', footer = '', onClose } = {}) {
  const overlay = document.getElementById('modal-overlay');
  const modal   = document.getElementById('modal');
  const mTitle  = document.getElementById('modal-title');
  const mBody   = document.getElementById('modal-body');
  const mFooter = document.getElementById('modal-footer');
  const mClose  = document.getElementById('modal-close');

  mTitle.textContent = title;
  if (typeof body === 'string') mBody.innerHTML = body;
  else { mBody.innerHTML = ''; mBody.appendChild(body); }

  if (typeof footer === 'string') mFooter.innerHTML = footer;
  else { mFooter.innerHTML = ''; if (footer) mFooter.appendChild(footer); }

  overlay.style.display = 'flex';

  const close = () => {
    overlay.style.display = 'none';
    onClose?.();
  };

  mClose.onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  return { close };
}

export function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ─────────────────────────────────────────────
// Loading state
// ─────────────────────────────────────────────

export function showLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="view-loading" style="display:flex">
      <div class="spinner"></div><p>Cargando…</p>
    </div>`;
}

// ─────────────────────────────────────────────
// Level utilities
// ─────────────────────────────────────────────

export const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export function levelBadge(level) {
  return `<span class="level-badge ${level?.toLowerCase()}">${level}</span>`;
}

export function levelClass(level) {
  return level?.toLowerCase() ?? 'n5';
}

// ─────────────────────────────────────────────
// Status utilities
// ─────────────────────────────────────────────

const STATUS_LABELS = {
  new:      'Nuevo',
  learning: 'Aprendiendo',
  known:    'Conocido',
  mastered: 'Dominado',
};

export function statusBadge(status) {
  const s = status ?? 'new';
  return `<span class="status-badge status-${s}">${STATUS_LABELS[s] ?? s}</span>`;
}

// ─────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

export function renderPagination(container, { page, total, limit, onPage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);

  let html = '<div class="flex gap-8 items-center mt-16">';
  html += `<button class="btn btn-outline btn-sm" ${page <= 1 ? 'disabled' : ''} data-p="${page - 1}">← Anterior</button>`;
  for (let i = start; i <= end; i++) {
    html += `<button class="btn btn-sm ${i === page ? 'btn-primary' : 'btn-outline'}" data-p="${i}">${i}</button>`;
  }
  html += `<button class="btn btn-outline btn-sm" ${page >= totalPages ? 'disabled' : ''} data-p="${page + 1}">Siguiente →</button>`;
  html += `<span class="text-sm text-muted ml-auto">Página ${page} / ${totalPages}</span>`;
  html += '</div>';

  container.innerHTML = html;
  container.querySelectorAll('[data-p]').forEach(btn => {
    btn.addEventListener('click', () => onPage(parseInt(btn.dataset.p)));
  });
}

// ─────────────────────────────────────────────
// Debounce
// ─────────────────────────────────────────────

export function debounce(fn, delay = 350) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ─────────────────────────────────────────────
// Breadcrumb builder
// ─────────────────────────────────────────────

export function breadcrumb(...items) {
  return '<div class="breadcrumb">' +
    items.map((item, i) => {
      const sep = i < items.length - 1 ? '<span class="sep">›</span>' : '';
      if (item.href) return `<a href="${item.href}">${escapeHtml(item.label)}</a>${sep}`;
      return `<span>${escapeHtml(item.label)}</span>${sep}`;
    }).join('') +
    '</div>';
}

// ─────────────────────────────────────────────
// Shuffle array (Fisher-Yates)
// ─────────────────────────────────────────────

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────
// Render examples
// ─────────────────────────────────────────────

export function renderExamples(examples = []) {
  if (!examples?.length) return '';
  return `<div class="mt-12">
    <p class="text-xs text-muted font-bold" style="margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Ejemplos</p>
    ${examples.map(ex => `
      <div class="example-block">
        <div class="jp-sentence jp-text">${escapeHtml(ex.jp ?? '')}</div>
        ${ex.rom ? `<div class="romanji">${escapeHtml(ex.rom)}</div>` : ''}
        <div class="translation">${escapeHtml(ex.es ?? ex.translation ?? '')}</div>
      </div>
    `).join('')}
  </div>`;
}
