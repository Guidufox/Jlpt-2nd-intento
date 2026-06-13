/**
 * JLPT Master — Theory Module
 */

import { theoryAPI } from '../api.js';
import {
  showLoading, levelBadge, renderPagination,
  escapeHtml, breadcrumb, debounce
} from '../shared/utils.js';

let state = {
  level: null, category: '', page: 1,
  items: [], total: 0, categories: [],
  detailId: null,
};

export async function render(container, params = {}) {
  if (params.level) state.level = params.level;
  if (params.id)    { state.detailId = params.id; await renderDetail(container); return; }
  state.detailId = null;
  state.page     = 1;
  showLoading(container);
  await loadAndRender(container);
}

// ─────────────────────────────────────────────
async function loadAndRender(container) {
  try {
    const data = await theoryAPI.list({
      level:    state.level,
      category: state.category,
      page:     state.page,
      limit:    20,
    });

    state.items      = data.items      ?? [];
    state.total      = data.total      ?? 0;
    state.categories = data.categories ?? [];

    container.innerHTML = buildLayout();
    bindEvents(container);
  } catch (err) {
    container.innerHTML = errState(err.message);
  }
}

// ─────────────────────────────────────────────
function buildLayout() {
  const catOpts = state.categories.map(c =>
    `<option value="${escapeHtml(c)}" ${state.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>`
  ).join('');

  return `
    <div class="page-header">
      <h1>📚 Teoría${state.level ? ` — ${state.level}` : ''}</h1>
      <p>Biblioteca de referencia gramatical y cultural del japonés.</p>
    </div>

    <!-- Toolbar -->
    <div class="module-toolbar">
      <select class="select" id="theory-level" style="width:90px">
        <option value="">Todos</option>
        ${['N5','N4','N3','N2','N1','ALL'].map(lv =>
          `<option value="${lv === 'ALL' ? '' : lv}" ${state.level === lv ? 'selected' : ''}>${lv}</option>`
        ).join('')}
      </select>

      <select class="select" id="theory-category" style="width:160px">
        <option value="">Todas las categorías</option>
        ${catOpts}
      </select>
    </div>

    <!-- Count -->
    <p class="text-sm text-muted mb-16">${state.total} artículo${state.total !== 1 ? 's' : ''}</p>

    <!-- Grid -->
    <div id="theory-grid">
      ${buildGrid()}
    </div>

    <div id="theory-pagination"></div>
  `;
}

function buildGrid() {
  if (!state.items.length) {
    return `<div class="empty-state"><div class="empty-icon">📚</div>
            <p>No se encontraron artículos.</p></div>`;
  }

  const catIcons = {
    partículas: '🔤', verbos: '⚡', adjetivos: '🎨',
    vocabulario: '📖', expresiones: '💬', consejos: '💡',
    general: '📄',
  };

  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
      ${state.items.map(a => `
        <div class="theory-article-card" data-id="${a.id}">
          <div style="font-size:1.6rem;margin-bottom:8px">
            ${catIcons[a.category] ?? '📄'}
          </div>
          <h3>${escapeHtml(a.title)}</h3>
          <p class="excerpt text-sm text-muted mt-4">
            ${escapeHtml(stripTags(a.excerpt ?? '').slice(0, 120))}…
          </p>
          <div class="meta">
            ${a.level && a.level !== 'ALL' ? levelBadge(a.level) : `<span class="level-badge" style="background:var(--gray-100);color:var(--gray-600)">General</span>`}
            <span class="text-xs text-muted" style="background:var(--gray-100);padding:2px 8px;border-radius:4px">
              ${escapeHtml(a.category ?? '')}
            </span>
          </div>
        </div>`).join('')}
    </div>`;
}

// ─────────────────────────────────────────────
// Detail view
// ─────────────────────────────────────────────
async function renderDetail(container) {
  showLoading(container);
  try {
    const article = await theoryAPI.get(state.detailId);
    container.innerHTML = buildDetail(article);
    bindDetailEvents(container);
  } catch (err) {
    container.innerHTML = errState(err.message);
  }
}

function buildDetail(a) {
  return `
    ${breadcrumb(
      { label: 'Teoría', href: '#/theory' },
      { label: a.category ?? 'General' },
      { label: a.title }
    )}

    <div class="theory-content card card-lg" style="max-width:780px">
      <div class="flex items-center gap-8 mb-16">
        ${a.level && a.level !== 'ALL' ? levelBadge(a.level) : ''}
        <span class="text-xs text-muted" style="background:var(--gray-100);padding:2px 8px;border-radius:4px">
          ${escapeHtml(a.category ?? '')}
        </span>
      </div>
      ${a.content}
    </div>

    <div class="mt-24">
      <a href="#/theory" class="btn btn-outline">← Volver a teoría</a>
    </div>
  `;
}

// ─────────────────────────────────────────────
function bindEvents(container) {
  container.querySelector('#theory-level')?.addEventListener('change', async (e) => {
    state.level = e.target.value || null;
    state.page  = 1;
    await loadAndRender(container);
  });

  container.querySelector('#theory-category')?.addEventListener('change', async (e) => {
    state.category = e.target.value;
    state.page     = 1;
    await loadAndRender(container);
  });

  container.querySelectorAll('.theory-article-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = `#/theory/${card.dataset.id}`;
    });
  });

  const pagDiv = container.querySelector('#theory-pagination');
  if (pagDiv) {
    renderPagination(pagDiv, {
      page: state.page, total: state.total, limit: 20,
      onPage: async (p) => { state.page = p; await loadAndRender(container); },
    });
  }
}

function bindDetailEvents(container) {
  // Nothing special needed — content is static HTML
}

// ─────────────────────────────────────────────
function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function errState(msg) {
  return `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error: ${escapeHtml(msg)}</p></div>`;
}
