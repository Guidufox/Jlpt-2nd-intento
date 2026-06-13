/**
 * JLPT Master — Kanji Module
 * Views: grid | list | flashcards
 */

import { kanjiAPI, srsAPI, favAPI } from '../api.js';
import {
  showLoading, toast, showModal,
  levelBadge, statusBadge, renderExamples,
  renderPagination, debounce, escapeHtml, shuffle
} from '../shared/utils.js';

let state = {
  level: null, search: '', status: '', favorites: false,
  view: 'grid', page: 1, items: [], total: 0, stats: null,
  flashIndex: 0, flashFlipped: false, flashItems: [],
  srsEnabled: false,
};

export async function render(container, params = {}) {
  if (params.level) state.level = params.level;
  if (params.view)  state.view  = params.view;
  state.page = 1;
  showLoading(container);
  await loadAndRender(container);
}

// ─────────────────────────────────────────────
async function loadAndRender(container) {
  try {
    const data = await kanjiAPI.list({
      level:     state.level,
      search:    state.search,
      status:    state.status,
      favorites: state.favorites ? 1 : '',
      page:      state.page,
      limit:     state.view === 'flashcards' ? 60 : 48,
    });

    state.items = data.items ?? [];
    state.total = data.total ?? 0;
    state.stats = data.stats ?? {};

    if (state.view === 'flashcards') {
      state.flashItems  = shuffle(state.items);
      state.flashIndex  = 0;
      state.flashFlipped = false;
    }

    container.innerHTML = buildLayout();
    bindEvents(container);
  } catch (err) {
    container.innerHTML = errorState(err.message);
  }
}

// ─────────────────────────────────────────────
function buildLayout() {
  const s = state.stats ?? {};
  return `
    <div class="page-header">
      <h1>漢 Kanji${state.level ? ` — ${state.level}` : ''}</h1>
      <p>Aprende y repasa los kanji del JLPT.</p>
    </div>

    <!-- Stats -->
    <div class="stats-row mb-16">
      <div class="stat-chip"><span class="num">${s.total ?? 0}</span><span class="lbl">Total</span></div>
      <div class="stat-chip warning"><span class="num">${s.learning ?? 0}</span><span class="lbl">Aprendiendo</span></div>
      <div class="stat-chip success"><span class="num">${parseInt(s.known ?? 0) + parseInt(s.mastered ?? 0)}</span><span class="lbl">Conocidos</span></div>
      <div class="stat-chip"><span class="num">${s.new_count ?? 0}</span><span class="lbl">Nuevos</span></div>
    </div>

    <!-- Toolbar -->
    <div class="module-toolbar">
      <input class="input" id="kanji-search" style="width:200px"
             placeholder="Buscar kanji, lectura…" value="${escapeHtml(state.search)}">

      <select class="select" id="kanji-level" style="width:90px">
        <option value="">Todos</option>
        ${['N5','N4','N3','N2','N1'].map(lv =>
          `<option value="${lv}" ${state.level === lv ? 'selected' : ''}>${lv}</option>`
        ).join('')}
      </select>

      <select class="select" id="kanji-status" style="width:140px">
        <option value="">Todos los estados</option>
        <option value="new"      ${state.status === 'new'      ? 'selected' : ''}>Nuevos</option>
        <option value="learning" ${state.status === 'learning' ? 'selected' : ''}>Aprendiendo</option>
        <option value="known"    ${state.status === 'known'    ? 'selected' : ''}>Conocidos</option>
        <option value="mastered" ${state.status === 'mastered' ? 'selected' : ''}>Dominados</option>
      </select>

      <button class="btn btn-outline btn-sm ${state.favorites ? 'btn-primary' : ''}"
              id="kanji-fav-toggle">
        ${state.favorites ? '⭐ Favoritos' : '☆ Favoritos'}
      </button>

      <div class="view-toggle ml-auto">
        <button class="view-toggle-btn ${state.view === 'grid'       ? 'active' : ''}" data-view="grid">Rejilla</button>
        <button class="view-toggle-btn ${state.view === 'list'       ? 'active' : ''}" data-view="list">Lista</button>
        <button class="view-toggle-btn ${state.view === 'flashcards' ? 'active' : ''}" data-view="flashcards">Flashcards</button>
      </div>

      <label class="flex items-center gap-8 text-sm" style="white-space:nowrap">
        <input type="checkbox" id="kanji-srs" ${state.srsEnabled ? 'checked' : ''}> SRS
      </label>
    </div>

    <!-- Content -->
    <div id="kanji-content">
      ${state.view === 'grid'       ? buildGrid()       : ''}
      ${state.view === 'list'       ? buildList()       : ''}
      ${state.view === 'flashcards' ? buildFlashcard()  : ''}
    </div>

    ${state.view !== 'flashcards' ? `<div id="kanji-pagination"></div>` : ''}
  `;
}

// ─────────────────────────────────────────────
// Grid view
// ─────────────────────────────────────────────
function buildGrid() {
  if (!state.items.length) return emptyState();
  return `
    <div class="kanji-grid">
      ${state.items.map(k => `
        <div class="kanji-tile" data-id="${k.id}" title="${escapeHtml(k.meaning_es ?? k.meaning)}">
          <span class="status-dot ${k.status ?? 'new'}"></span>
          <span class="kanji-char jp-text">${escapeHtml(k.character)}</span>
          <span class="kanji-meaning">${escapeHtml((k.meaning_es ?? k.meaning ?? '').slice(0, 12))}</span>
          ${levelBadge(k.level)}
        </div>`).join('')}
    </div>`;
}

// ─────────────────────────────────────────────
// List view
// ─────────────────────────────────────────────
function buildList() {
  if (!state.items.length) return emptyState();
  return `
    <div style="overflow-x:auto">
      <table class="vocab-table">
        <thead>
          <tr><th>Kanji</th><th>On'yomi</th><th>Kun'yomi</th><th>Significado</th><th>Nivel</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          ${state.items.map(k => `
            <tr data-id="${k.id}" style="cursor:pointer">
              <td style="font-family:var(--font-jp);font-size:1.8rem;font-weight:700;padding:8px 12px">
                ${escapeHtml(k.character)}
              </td>
              <td class="jp-text text-sm">${escapeHtml(k.onyomi  ?? '—')}</td>
              <td class="jp-text text-sm">${escapeHtml(k.kunyomi ?? '—')}</td>
              <td class="text-sm">${escapeHtml(k.meaning_es ?? k.meaning)}</td>
              <td>${levelBadge(k.level)}</td>
              <td>${statusBadge(k.status)}</td>
              <td>
                <div class="flex gap-8">
                  <button class="btn-ghost btn-sm" data-action="favorite" data-id="${k.id}">
                    ${k.is_favorite ? '⭐' : '☆'}
                  </button>
                  <button class="btn-ghost btn-sm" data-action="srs-add" data-id="${k.id}" title="Añadir a SRS">🔄</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
// Flashcard view
// ─────────────────────────────────────────────
function buildFlashcard() {
  const items   = state.flashItems;
  if (!items.length) return emptyState();

  const k       = items[state.flashIndex] ?? items[0];
  const flipped = state.flashFlipped;
  const srs     = state.srsEnabled;
  const total   = items.length;
  const idx     = state.flashIndex;
  const examplesHtml = flipped ? renderExamples(k.examples ?? []) : '';

  return `
    <div class="srs-container">
      <div class="srs-progress-text">${idx + 1} / ${total}</div>
      <div class="exam-progress-bar">
        <div class="exam-progress-fill" style="width:${((idx + 1) / total) * 100}%"></div>
      </div>

      <div class="flashcard-scene" id="flashcard-scene">
        <div class="flashcard ${flipped ? 'is-flipped' : ''}" id="kanji-flashcard">
          <!-- Front: kanji character -->
          <div class="flashcard-face front" style="gap:8px">
            <div style="font-family:var(--font-jp);font-size:5rem;font-weight:700;line-height:1">
              ${escapeHtml(k.character)}
            </div>
            ${levelBadge(k.level)}
            <div class="flashcard-hint">Haz clic para ver lecturas y significado</div>
          </div>
          <!-- Back: readings + meaning -->
          <div class="flashcard-face back">
            <div style="font-family:var(--font-jp);font-size:3rem;font-weight:700;margin-bottom:8px">
              ${escapeHtml(k.character)}
            </div>
            <div style="text-align:left;width:100%">
              <dl class="kanji-readings">
                ${k.onyomi  ? `<dt>On'yomi</dt><dd class="jp-text">${escapeHtml(k.onyomi)}</dd>`  : ''}
                ${k.kunyomi ? `<dt>Kun'yomi</dt><dd class="jp-text">${escapeHtml(k.kunyomi)}</dd>` : ''}
                <dt>Significado</dt>
                <dd>${escapeHtml(k.meaning_es ?? k.meaning)}</dd>
              </dl>
              ${examplesHtml}
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      ${flipped ? `
        <div class="flashcard-controls mt-16">
          ${srs ? `
            <button class="btn btn-again" data-srs="0" data-id="${k.id}">↩ Again</button>
            <button class="btn btn-hard"  data-srs="1" data-id="${k.id}">◑ Hard</button>
            <button class="btn btn-good"  data-srs="2" data-id="${k.id}">✓ Good</button>
            <button class="btn btn-easy"  data-srs="3" data-id="${k.id}">✦ Easy</button>
          ` : `
            <button class="btn btn-danger"  data-answer="wrong"   data-id="${k.id}">✗ No lo sé</button>
            <button class="btn btn-success" data-answer="correct" data-id="${k.id}">✓ Lo sé</button>
          `}
        </div>` : `
        <div class="flashcard-controls mt-16">
          <button class="btn btn-outline" id="kanji-flip-btn">Ver lecturas</button>
        </div>`}

      <div class="flashcard-nav mt-12">
        <button class="btn btn-ghost btn-sm" id="kfc-prev" ${idx === 0 ? 'disabled' : ''}>← Anterior</button>
        <button class="btn btn-ghost btn-sm" data-action="favorite" data-id="${k.id}">
          ${k.is_favorite ? '⭐' : '☆'} Favorito
        </button>
        <button class="btn btn-ghost btn-sm" id="kfc-next" ${idx >= total - 1 ? 'disabled' : ''}>Siguiente →</button>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
// Kanji detail modal
// ─────────────────────────────────────────────
async function showKanjiDetail(id, container) {
  try {
    const k = await kanjiAPI.get(id);
    showModal({
      title: `${k.character} — Detalle`,
      body: `
        <div>
          <div class="kanji-detail-header">
            <div class="kanji-big jp-text">${escapeHtml(k.character)}</div>
            <div style="flex:1">
              <div class="flex gap-8 mb-8">${levelBadge(k.level)} ${statusBadge(k.status)}</div>
              <dl class="kanji-readings">
                ${k.onyomi  ? `<dt>On'yomi</dt><dd class="jp-text">${escapeHtml(k.onyomi)}</dd>`  : ''}
                ${k.kunyomi ? `<dt>Kun'yomi</dt><dd class="jp-text">${escapeHtml(k.kunyomi)}</dd>` : ''}
                <dt>Significado</dt>
                <dd>${escapeHtml(k.meaning_es ?? k.meaning)}</dd>
                ${k.stroke_count ? `<dt>Trazos</dt><dd>${k.stroke_count}</dd>` : ''}
                ${k.radical     ? `<dt>Radical</dt><dd class="jp-text">${escapeHtml(k.radical)}</dd>` : ''}
              </dl>
            </div>
          </div>

          ${renderExamples(k.examples)}

          <div class="flex gap-8 mt-16 flex-wrap">
            <button class="btn btn-outline btn-sm" data-action="mark" data-id="${k.id}" data-status="learning">📖 Aprendiendo</button>
            <button class="btn btn-outline btn-sm" data-action="mark" data-id="${k.id}" data-status="known">✓ Conocido</button>
            <button class="btn btn-success btn-sm" data-action="mark" data-id="${k.id}" data-status="mastered">★ Dominado</button>
            <button class="btn btn-outline btn-sm ml-auto" data-action="srs-add" data-id="${k.id}">🔄 SRS</button>
          </div>
        </div>
      `,
    });

    setTimeout(() => {
      document.querySelectorAll('[data-action="mark"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await kanjiAPI.update({ kanji_id: parseInt(btn.dataset.id), status: btn.dataset.status });
          toast('Estado actualizado', 'success');
          const { hideModal } = await import('../shared/utils.js');
          hideModal();
          await loadAndRender(container);
        });
      });
      document.querySelectorAll('[data-action="srs-add"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await srsAPI.add({ item_type: 'kanji', item_id: parseInt(btn.dataset.id) });
          toast('Añadido al mazo SRS', 'success');
        });
      });
    }, 50);
  } catch { toast('Error al cargar kanji', 'error'); }
}

// ─────────────────────────────────────────────
function bindEvents(container) {
  // Search
  container.querySelector('#kanji-search')?.addEventListener('input', debounce(async (e) => {
    state.search = e.target.value;
    state.page   = 1;
    await loadAndRender(container);
  }));

  // Level
  container.querySelector('#kanji-level')?.addEventListener('change', async (e) => {
    state.level = e.target.value || null;
    state.page  = 1;
    await loadAndRender(container);
  });

  // Status
  container.querySelector('#kanji-status')?.addEventListener('change', async (e) => {
    state.status = e.target.value;
    state.page   = 1;
    await loadAndRender(container);
  });

  // Favorites
  container.querySelector('#kanji-fav-toggle')?.addEventListener('click', async () => {
    state.favorites = !state.favorites;
    state.page      = 1;
    await loadAndRender(container);
  });

  // SRS toggle
  container.querySelector('#kanji-srs')?.addEventListener('change', (e) => {
    state.srsEnabled = e.target.checked;
    if (state.view === 'flashcards') loadAndRender(container);
  });

  // View toggle
  container.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.view = btn.dataset.view;
      state.page = 1;
      await loadAndRender(container);
    });
  });

  // Grid tile click → detail
  container.querySelectorAll('.kanji-tile').forEach(tile => {
    tile.addEventListener('click', () => showKanjiDetail(tile.dataset.id, container));
  });

  // List row click → detail
  container.querySelectorAll('tbody tr[data-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      showKanjiDetail(row.dataset.id, container);
    });
  });

  // Favorite buttons
  container.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await favAPI.toggle({ item_type: 'kanji', item_id: parseInt(btn.dataset.id) });
      await loadAndRender(container);
    });
  });

  // SRS add
  container.querySelectorAll('[data-action="srs-add"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await srsAPI.add({ item_type: 'kanji', item_id: parseInt(btn.dataset.id) });
      toast('Añadido al mazo SRS', 'success');
    });
  });

  // ── Flashcard events ──
  if (state.view === 'flashcards') {
    container.querySelector('#kanji-flashcard')?.addEventListener('click', () => {
      state.flashFlipped = !state.flashFlipped;
      loadAndRender(container);
    });
    container.querySelector('#kanji-flip-btn')?.addEventListener('click', () => {
      state.flashFlipped = true;
      loadAndRender(container);
    });

    container.querySelectorAll('[data-srs]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id);
        try {
          await srsAPI.add({ item_type: 'kanji', item_id: id });
          await srsAPI.review({ item_type: 'kanji', item_id: id, quality: parseInt(btn.dataset.srs) });
        } catch {}
        advanceFlash(container);
      });
    });

    container.querySelectorAll('[data-answer]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const correct = btn.dataset.answer === 'correct';
        await kanjiAPI.update({
          kanji_id: parseInt(btn.dataset.id),
          status:  correct ? 'known' : 'learning',
          correct: correct ? 1 : 0,
        });
        advanceFlash(container);
      });
    });

    container.querySelector('#kfc-prev')?.addEventListener('click', () => {
      if (state.flashIndex > 0) { state.flashIndex--; state.flashFlipped = false; loadAndRender(container); }
    });
    container.querySelector('#kfc-next')?.addEventListener('click', () => advanceFlash(container));
  }

  // Pagination
  const pagDiv = container.querySelector('#kanji-pagination');
  if (pagDiv) {
    renderPagination(pagDiv, {
      page: state.page, total: state.total, limit: 48,
      onPage: async (p) => { state.page = p; await loadAndRender(container); },
    });
  }
}

function advanceFlash(container) {
  if (state.flashIndex < state.flashItems.length - 1) {
    state.flashIndex++;
    state.flashFlipped = false;
    loadAndRender(container);
  } else {
    container.querySelector('#kanji-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <p>¡Completaste todos los kanji!</p>
        <button class="btn btn-primary mt-16" id="kanji-restart">Repetir</button>
      </div>`;
    container.querySelector('#kanji-restart')?.addEventListener('click', () => {
      state.flashIndex   = 0;
      state.flashFlipped = false;
      state.flashItems   = shuffle(state.flashItems);
      loadAndRender(container);
    });
  }
}

function emptyState(msg = 'No se encontraron kanji con estos filtros.') {
  return `<div class="empty-state"><div class="empty-icon">漢</div><p>${msg}</p></div>`;
}

function errorState(msg) {
  return `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error: ${escapeHtml(msg)}</p></div>`;
}
