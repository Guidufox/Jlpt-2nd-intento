/**
 * JLPT Master — Grammar Module
 * Views: list | detail
 */

import { grammarAPI, favAPI } from '../api.js';
import {
  showLoading, toast, showModal, levelBadge,
  renderExamples, renderPagination, debounce,
  escapeHtml, breadcrumb
} from '../shared/utils.js';

let state = {
  level: null, search: '', category: '',
  favorites: false, page: 1, items: [], total: 0,
  categories: [], view: 'list', detailId: null,
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
    const data = await grammarAPI.list({
      level:     state.level,
      search:    state.search,
      category:  state.category,
      favorites: state.favorites ? 1 : '',
      page:      state.page,
      limit:     30,
    });

    state.items      = data.items      ?? [];
    state.total      = data.total      ?? 0;
    state.categories = data.categories ?? [];

    container.innerHTML = buildLayout();
    bindListEvents(container);
  } catch (err) {
    container.innerHTML = errorState(err.message);
  }
}

// ─────────────────────────────────────────────
function buildLayout() {
  const catOptions = state.categories.map(c =>
    `<option value="${escapeHtml(c)}" ${state.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>`
  ).join('');

  return `
    <div class="page-header">
      <h1>📝 Gramática${state.level ? ` — ${state.level}` : ''}</h1>
      <p>Patrones gramaticales explicados con ejemplos.</p>
    </div>

    <!-- Toolbar -->
    <div class="module-toolbar">
      <input class="input" id="grammar-search" style="width:220px"
             placeholder="Buscar patrón…" value="${escapeHtml(state.search)}">

      <select class="select" id="grammar-level" style="width:90px">
        <option value="">Todos</option>
        ${['N5','N4','N3','N2','N1'].map(lv =>
          `<option value="${lv}" ${state.level === lv ? 'selected' : ''}>${lv}</option>`
        ).join('')}
      </select>

      <select class="select" id="grammar-category" style="width:140px">
        <option value="">Todas las categorías</option>
        ${catOptions}
      </select>

      <button class="btn btn-outline btn-sm ml-auto ${state.favorites ? 'btn-primary' : ''}"
              id="grammar-fav-toggle">
        ${state.favorites ? '⭐ Favoritos' : '☆ Favoritos'}
      </button>
    </div>

    <!-- Count -->
    <p class="text-sm text-muted mb-16">${state.total} punto${state.total !== 1 ? 's' : ''} gramatical${state.total !== 1 ? 'es' : ''} encontrado${state.total !== 1 ? 's' : ''}</p>

    <!-- Grid -->
    <div id="grammar-grid">
      ${buildGrid()}
    </div>

    <div id="grammar-pagination"></div>
  `;
}

function buildGrid() {
  if (!state.items.length) {
    return `<div class="empty-state"><div class="empty-icon">📝</div>
            <p>No se encontraron puntos gramaticales.</p></div>`;
  }
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">
      ${state.items.map(g => `
        <div class="grammar-card" data-id="${g.id}">
          <div class="gp-pattern jp-text">${escapeHtml(g.pattern)}</div>
          <div class="gp-title">${escapeHtml(g.title)}</div>
          <div class="gp-expl">${escapeHtml((g.explanation_es ?? '').slice(0, 100))}${(g.explanation_es ?? '').length > 100 ? '…' : ''}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:12px">
            ${levelBadge(g.level)}
            <span class="status-badge status-learning" style="background:var(--gray-100);color:var(--gray-600)">
              ${escapeHtml(g.category ?? '')}
            </span>
            <button class="btn-ghost btn-sm ml-auto" data-action="favorite" data-id="${g.id}"
                    title="${g.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
              ${g.is_favorite ? '⭐' : '☆'}
            </button>
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
    const g = await grammarAPI.get(state.detailId);
    container.innerHTML = buildDetail(g);
    bindDetailEvents(container, g);
  } catch (err) {
    container.innerHTML = errorState(err.message);
  }
}

function buildDetail(g) {
  const examples    = g.examples   ?? [];
  const related     = g.related    ?? [];

  return `
    ${breadcrumb(
      { label: 'Gramática', href: '#/grammar' },
      { label: g.level },
      { label: g.title }
    )}

    <div class="grammar-detail">
      <div class="flex items-center gap-12 mb-4">
        ${levelBadge(g.level)}
        <span class="status-badge status-learning"
              style="background:var(--gray-100);color:var(--gray-600)">${escapeHtml(g.category ?? '')}</span>
        <button class="btn btn-ghost btn-sm ml-auto" id="detail-fav" data-id="${g.id}">
          ${g.is_favorite ? '⭐ Favorito' : '☆ Añadir a favoritos'}
        </button>
      </div>

      <h2>${escapeHtml(g.title)}</h2>

      <!-- Pattern -->
      <div class="pattern-block">${escapeHtml(g.pattern)}</div>

      <!-- Explanation -->
      <p>${escapeHtml(g.explanation_es ?? g.explanation ?? '')}</p>

      ${g.structure ? `
        <h3>Estructura</h3>
        <div class="structure-block">${escapeHtml(g.structure)}</div>` : ''}

      <!-- Examples -->
      ${examples.length ? `
        <h3>Ejemplos</h3>
        ${examples.map(ex => `
          <div class="example-block">
            <div class="jp-sentence jp-text">${escapeHtml(ex.jp ?? '')}</div>
            ${ex.rom ? `<div class="romanji">${escapeHtml(ex.rom)}</div>` : ''}
            <div class="translation">${escapeHtml(ex.es ?? '')}</div>
          </div>`).join('')}` : ''}

      ${g.notes ? `
        <h3>Notas</h3>
        <div class="card card-sm">
          <p class="text-sm">${escapeHtml(g.notes)}</p>
        </div>` : ''}

      <!-- Related -->
      ${related.length ? `
        <h3>Gramática relacionada</h3>
        <div class="flex gap-8" style="flex-wrap:wrap">
          ${related.map(r => `
            <a href="#/grammar/${r.id}" class="btn btn-outline btn-sm">
              <span class="jp-text">${escapeHtml(r.pattern)}</span>
              ${levelBadge(r.level)}
            </a>`).join('')}
        </div>` : ''}

      <div class="mt-24">
        <a href="#/grammar${state.level ? '/' + state.level : ''}" class="btn btn-outline">
          ← Volver a la lista
        </a>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
// Event binding — List
// ─────────────────────────────────────────────
function bindListEvents(container) {
  // Search
  container.querySelector('#grammar-search')?.addEventListener('input', debounce(async (e) => {
    state.search = e.target.value;
    state.page   = 1;
    await loadAndRender(container);
  }));

  // Level
  container.querySelector('#grammar-level')?.addEventListener('change', async (e) => {
    state.level = e.target.value || null;
    state.page  = 1;
    await loadAndRender(container);
  });

  // Category
  container.querySelector('#grammar-category')?.addEventListener('change', async (e) => {
    state.category = e.target.value;
    state.page     = 1;
    await loadAndRender(container);
  });

  // Favorites
  container.querySelector('#grammar-fav-toggle')?.addEventListener('click', async () => {
    state.favorites = !state.favorites;
    state.page      = 1;
    await loadAndRender(container);
  });

  // Card click → detail
  container.querySelectorAll('.grammar-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      window.location.hash = `#/grammar/${card.dataset.id}`;
    });
  });

  // Favorite buttons
  container.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await favAPI.toggle({ item_type: 'grammar', item_id: parseInt(btn.dataset.id) });
      await loadAndRender(container);
    });
  });

  // Pagination
  const pagDiv = container.querySelector('#grammar-pagination');
  if (pagDiv) {
    renderPagination(pagDiv, {
      page: state.page, total: state.total, limit: 30,
      onPage: async (p) => { state.page = p; await loadAndRender(container); },
    });
  }
}

// Event binding — Detail
function bindDetailEvents(container, g) {
  container.querySelector('#detail-fav')?.addEventListener('click', async (btn) => {
    const b   = btn.currentTarget;
    const res = await favAPI.toggle({ item_type: 'grammar', item_id: parseInt(b.dataset.id) });
    b.textContent = res.is_favorite ? '⭐ Favorito' : '☆ Añadir a favoritos';
    toast(res.is_favorite ? 'Añadido a favoritos' : 'Quitado de favoritos', 'success');
  });
}

function errorState(msg) {
  return `<div class="empty-state"><div class="empty-icon">⚠️</div>
          <p>Error al cargar: ${escapeHtml(msg)}</p></div>`;
}
