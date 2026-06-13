/**
 * JLPT Master — Vocabulary Module
 * Views: list | cards | flashcards
 */

import { vocabAPI, srsAPI, favAPI } from '../api.js';
import {
  showLoading, toast, showModal, levelBadge, statusBadge,
  renderExamples, renderPagination, debounce, escapeHtml, shuffle
} from '../shared/utils.js';

let state = {
  level: null, view: 'list', page: 1, search: '', category: '',
  status: '', favorites: false, items: [], total: 0, stats: null,
  flashIndex: 0, flashFlipped: false, flashItems: [],
  srsEnabled: false,
};

export async function render(container, params = {}) {
  // Apply route params
  if (params.level) state.level = params.level;
  if (params.view)  state.view  = params.view;
  state.page = 1;

  showLoading(container);
  await loadAndRender(container);
}

// ─────────────────────────────────────────────
async function loadAndRender(container) {
  try {
    const data = await vocabAPI.list({
      level:     state.level,
      search:    state.search,
      category:  state.category,
      status:    state.status,
      favorites: state.favorites ? 1 : '',
      page:      state.page,
      limit:     state.view === 'flashcards' ? 50 : 30,
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
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error: ${escapeHtml(err.message)}</p></div>`;
  }
}

// ─────────────────────────────────────────────
// Layout shell
// ─────────────────────────────────────────────
function buildLayout() {
  const s = state.stats ?? {};
  return `
    <div class="page-header">
      <h1>📖 Vocabulario${state.level ? ` — ${state.level}` : ''}</h1>
      <p>Busca, estudia y repasa palabras del JLPT.</p>
    </div>

    <!-- Stats -->
    <div class="stats-row" id="vocab-stats">
      <div class="stat-chip"><span class="num">${s.total ?? 0}</span><span class="lbl">Total</span></div>
      <div class="stat-chip warning"><span class="num">${s.learning ?? 0}</span><span class="lbl">Aprendiendo</span></div>
      <div class="stat-chip success"><span class="num">${parseInt(s.known ?? 0) + parseInt(s.mastered ?? 0)}</span><span class="lbl">Conocidas</span></div>
      <div class="stat-chip"><span class="num">${s.new_count ?? 0}</span><span class="lbl">Nuevas</span></div>
    </div>

    <!-- Toolbar -->
    <div class="module-toolbar">
      <input class="input" id="vocab-search" style="width:220px" placeholder="Buscar…" value="${escapeHtml(state.search)}">

      <select class="select" id="vocab-level" style="width:90px">
        <option value="">Todos</option>
        <option value="N5" ${state.level==='N5'?'selected':''}>N5</option>
        <option value="N4" ${state.level==='N4'?'selected':''}>N4</option>
        <option value="N3" ${state.level==='N3'?'selected':''}>N3</option>
        <option value="N2" ${state.level==='N2'?'selected':''}>N2</option>
        <option value="N1" ${state.level==='N1'?'selected':''}>N1</option>
      </select>

      <select class="select" id="vocab-status" style="width:140px">
        <option value="">Todos los estados</option>
        <option value="new"      ${state.status==='new'?'selected':''}>Nuevas</option>
        <option value="learning" ${state.status==='learning'?'selected':''}>Aprendiendo</option>
        <option value="known"    ${state.status==='known'?'selected':''}>Conocidas</option>
        <option value="mastered" ${state.status==='mastered'?'selected':''}>Dominadas</option>
      </select>

      <button class="btn btn-outline btn-sm ${state.favorites ? 'btn-primary' : ''}" id="vocab-fav-toggle">
        ${state.favorites ? '⭐ Favoritos' : '☆ Favoritos'}
      </button>

      <div class="view-toggle ml-auto">
        <button class="view-toggle-btn ${state.view==='list'       ? 'active' : ''}" data-view="list">Lista</button>
        <button class="view-toggle-btn ${state.view==='cards'      ? 'active' : ''}" data-view="cards">Tarjetas</button>
        <button class="view-toggle-btn ${state.view==='flashcards' ? 'active' : ''}" data-view="flashcards">Flashcards</button>
      </div>

      <label class="flex items-center gap-8 text-sm" style="white-space:nowrap">
        <input type="checkbox" id="srs-toggle" ${state.srsEnabled ? 'checked' : ''}>
        SRS activado
      </label>
    </div>

    <!-- Content -->
    <div id="vocab-content">
      ${state.view === 'list'       ? buildListView()  : ''}
      ${state.view === 'cards'      ? buildCardsView() : ''}
      ${state.view === 'flashcards' ? buildFlashcardView() : ''}
    </div>

    <!-- Pagination -->
    ${state.view !== 'flashcards' ? `<div id="vocab-pagination"></div>` : ''}
  `;
}

// ─────────────────────────────────────────────
// List view
// ─────────────────────────────────────────────
function buildListView() {
  if (!state.items.length) return emptyState();
  return `
    <div style="overflow-x:auto">
      <table class="vocab-table">
        <thead>
          <tr>
            <th>Palabra</th><th>Lectura</th><th>Significado</th>
            <th>Nivel</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${state.items.map(w => `
            <tr data-id="${w.id}">
              <td><div class="vocab-word-cell">
                <span class="kanji jp-text">${escapeHtml(w.kanji || w.kana)}</span>
                ${w.kanji ? `<span class="kana jp-text">${escapeHtml(w.kana)}</span>` : ''}
              </div></td>
              <td class="jp-text text-sm text-muted">${escapeHtml(w.kana)}</td>
              <td class="text-sm">${escapeHtml(w.meaning_es)}</td>
              <td>${levelBadge(w.level)}</td>
              <td>${statusBadge(w.status)}</td>
              <td>
                <div class="flex gap-8">
                  <button class="btn-ghost btn-sm" data-action="detail" data-id="${w.id}" title="Ver detalle">🔍</button>
                  <button class="btn-ghost btn-sm" data-action="favorite" data-id="${w.id}"
                          title="${w.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                    ${w.is_favorite ? '⭐' : '☆'}
                  </button>
                  <button class="btn-ghost btn-sm" data-action="srs-add" data-id="${w.id}"
                          data-type="vocabulary" title="Añadir a SRS">🔄</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
// Cards view
// ─────────────────────────────────────────────
function buildCardsView() {
  if (!state.items.length) return emptyState();
  return `
    <div class="vocab-card-grid">
      ${state.items.map(w => `
        <div class="vocab-card" data-id="${w.id}">
          <div class="word-jp jp-text">${escapeHtml(w.kanji || w.kana)}</div>
          <div class="word-kana jp-text">${w.kanji ? escapeHtml(w.kana) : ''}</div>
          <div class="word-meaning">${escapeHtml(w.meaning_es)}</div>
          <div class="card-footer">
            ${levelBadge(w.level)}
            ${statusBadge(w.status)}
            <button class="btn-ghost btn-sm ml-auto" data-action="favorite" data-id="${w.id}">
              ${w.is_favorite ? '⭐' : '☆'}
            </button>
          </div>
        </div>`).join('')}
    </div>`;
}

// ─────────────────────────────────────────────
// Flashcard view
// ─────────────────────────────────────────────
function buildFlashcardView() {
  const items = state.flashItems;
  if (!items.length) return emptyState('No hay palabras para mostrar con estos filtros.');

  const word       = items[state.flashIndex] ?? items[0];
  const total      = items.length;
  const idx        = state.flashIndex;
  const flipped    = state.flashFlipped;
  const srs        = state.srsEnabled;
  const examplesHtml = flipped ? renderExamples(word.examples ?? []) : '';

  return `
    <div class="srs-container">
      <div class="srs-progress-text">${idx + 1} / ${total}</div>
      <div class="exam-progress-bar">
        <div class="exam-progress-fill" style="width:${((idx + 1) / total) * 100}%"></div>
      </div>

      <div class="flashcard-scene" id="flashcard-scene">
        <div class="flashcard ${flipped ? 'is-flipped' : ''}" id="flashcard">
          <!-- Front -->
          <div class="flashcard-face front">
            <div class="flashcard-word jp-text">${escapeHtml(word.kanji || word.kana)}</div>
            ${word.kanji ? `<div class="flashcard-kana jp-text">${escapeHtml(word.kana)}</div>` : ''}
            ${levelBadge(word.level)}
            <div class="flashcard-hint">Haz clic para ver el significado</div>
          </div>
          <!-- Back -->
          <div class="flashcard-face back">
            <div class="flashcard-meaning">${escapeHtml(word.meaning_es)}</div>
            <div class="text-sm text-muted mt-4 jp-text">${escapeHtml(word.kana)}</div>
            ${examplesHtml}
          </div>
        </div>
      </div>

      <!-- Controls -->
      ${flipped ? `
        <div class="flashcard-controls mt-16">
          ${srs ? `
            <button class="btn btn-again"   data-srs="0" data-id="${word.id}">↩ Again</button>
            <button class="btn btn-hard"    data-srs="1" data-id="${word.id}">◑ Hard</button>
            <button class="btn btn-good"    data-srs="2" data-id="${word.id}">✓ Good</button>
            <button class="btn btn-easy"    data-srs="3" data-id="${word.id}">✦ Easy</button>
          ` : `
            <button class="btn btn-danger"  data-answer="wrong"   data-id="${word.id}">✗ No lo sé</button>
            <button class="btn btn-success" data-answer="correct" data-id="${word.id}">✓ Lo sé</button>
          `}
        </div>` : `
        <div class="flashcard-controls mt-16">
          <button class="btn btn-outline" id="flip-btn">Voltear tarjeta</button>
        </div>`}

      <div class="flashcard-nav mt-12">
        <button class="btn btn-ghost btn-sm" id="fc-prev" ${idx === 0 ? 'disabled' : ''}>← Anterior</button>
        <button class="btn btn-ghost btn-sm" data-action="detail" data-id="${word.id}">🔍 Detalle</button>
        <button class="btn btn-ghost btn-sm" data-action="favorite" data-id="${word.id}">
          ${word.is_favorite ? '⭐' : '☆'} Favorito
        </button>
        <button class="btn btn-ghost btn-sm" id="fc-next" ${idx >= total - 1 ? 'disabled' : ''}>Siguiente →</button>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
// Word detail modal
// ─────────────────────────────────────────────
async function showWordDetail(id, container) {
  try {
    const w = await vocabAPI.get(id);
    showModal({
      title: `${w.kanji || w.kana} — Detalle`,
      body: `
        <div>
          <div class="flex gap-16 items-center mb-16">
            <span style="font-family:var(--font-jp);font-size:3.5rem;font-weight:700">${escapeHtml(w.kanji || w.kana)}</span>
            <div>
              <div class="jp-text" style="font-size:1.1rem">${escapeHtml(w.kana)}</div>
              ${w.furigana ? `<div class="text-sm text-muted jp-text">${escapeHtml(w.furigana)}</div>` : ''}
              <div class="flex gap-8 mt-8">${levelBadge(w.level)} ${statusBadge(w.status)}</div>
            </div>
          </div>

          <div class="card card-sm mb-8">
            <span class="text-xs text-muted">Significado</span>
            <p style="font-size:1.1rem;font-weight:600">${escapeHtml(w.meaning_es)}</p>
            ${w.meaning_en ? `<p class="text-sm text-muted">${escapeHtml(w.meaning_en)}</p>` : ''}
          </div>

          ${w.notes ? `<div class="card card-sm mb-8"><span class="text-xs text-muted">Notas</span><p class="text-sm">${escapeHtml(w.notes)}</p></div>` : ''}

          ${renderExamples(w.examples)}

          <div class="flex gap-8 mt-16">
            <button class="btn btn-outline btn-sm"
              data-action="mark-status" data-id="${w.id}" data-status="learning">📖 Aprendiendo</button>
            <button class="btn btn-outline btn-sm"
              data-action="mark-status" data-id="${w.id}" data-status="known">✓ Conocido</button>
            <button class="btn btn-success btn-sm"
              data-action="mark-status" data-id="${w.id}" data-status="mastered">★ Dominado</button>
            <button class="btn btn-outline btn-sm ml-auto"
              data-action="srs-add" data-id="${w.id}" data-type="vocabulary">🔄 Añadir a SRS</button>
          </div>
        </div>
      `,
    });

    // Modal action listeners
    setTimeout(() => {
      document.querySelectorAll('[data-action="mark-status"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await vocabAPI.update({ vocabulary_id: parseInt(btn.dataset.id), status: btn.dataset.status });
          toast('Estado actualizado', 'success');
          hideModalAndReload(container);
        });
      });
      document.querySelectorAll('[data-action="srs-add"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await srsAPI.add({ item_type: btn.dataset.type, item_id: parseInt(btn.dataset.id) });
          toast('Añadida al mazo SRS', 'success');
        });
      });
    }, 50);
  } catch { toast('Error al cargar detalle', 'error'); }
}

async function hideModalAndReload(container) {
  const { hideModal } = await import('../shared/utils.js');
  hideModal();
  await loadAndRender(container);
}

// ─────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────
function bindEvents(container) {
  // Search
  const searchInput = container.querySelector('#vocab-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(async (e) => {
      state.search = e.target.value;
      state.page   = 1;
      await loadAndRender(container);
    }));
  }

  // Level filter
  container.querySelector('#vocab-level')?.addEventListener('change', async (e) => {
    state.level = e.target.value || null;
    state.page  = 1;
    await loadAndRender(container);
  });

  // Status filter
  container.querySelector('#vocab-status')?.addEventListener('change', async (e) => {
    state.status = e.target.value;
    state.page   = 1;
    await loadAndRender(container);
  });

  // Favorites toggle
  container.querySelector('#vocab-fav-toggle')?.addEventListener('click', async () => {
    state.favorites = !state.favorites;
    state.page      = 1;
    await loadAndRender(container);
  });

  // SRS toggle
  container.querySelector('#srs-toggle')?.addEventListener('change', (e) => {
    state.srsEnabled = e.target.checked;
    if (state.view === 'flashcards') loadAndRender(container);
  });

  // View toggle
  container.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.view  = btn.dataset.view;
      state.page  = 1;
      await loadAndRender(container);
    });
  });

  // Row / card click → detail
  container.querySelectorAll('[data-id]').forEach(el => {
    if (el.tagName === 'TR' || el.classList.contains('vocab-card')) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        showWordDetail(el.dataset.id, container);
      });
    }
  });

  // Action buttons
  container.querySelectorAll('[data-action="detail"]').forEach(btn => {
    btn.addEventListener('click', () => showWordDetail(btn.dataset.id, container));
  });

  container.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await favAPI.toggle({ item_type: 'vocabulary', item_id: parseInt(btn.dataset.id) });
      await loadAndRender(container);
    });
  });

  container.querySelectorAll('[data-action="srs-add"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await srsAPI.add({ item_type: btn.dataset.type ?? 'vocabulary', item_id: parseInt(btn.dataset.id) });
      toast('Añadida al mazo SRS', 'success');
    });
  });

  // Flashcard events
  if (state.view === 'flashcards') {
    // Flip on click
    container.querySelector('#flashcard')?.addEventListener('click', () => {
      state.flashFlipped = !state.flashFlipped;
      loadAndRender(container);
    });
    container.querySelector('#flip-btn')?.addEventListener('click', () => {
      state.flashFlipped = true;
      loadAndRender(container);
    });

    // SRS quality buttons
    container.querySelectorAll('[data-srs]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const quality = parseInt(btn.dataset.srs);
        const id      = parseInt(btn.dataset.id);
        try {
          await srsAPI.add({ item_type: 'vocabulary', item_id: id });
          await srsAPI.review({ item_type: 'vocabulary', item_id: id, quality });
        } catch {}
        advanceFlashcard(container);
      });
    });

    // Know / Don't know
    container.querySelectorAll('[data-answer]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const correct = btn.dataset.answer === 'correct';
        await vocabAPI.update({
          vocabulary_id: parseInt(btn.dataset.id),
          status:  correct ? 'known' : 'learning',
          correct: correct ? 1 : 0,
        });
        advanceFlashcard(container);
      });
    });

    // Navigation
    container.querySelector('#fc-prev')?.addEventListener('click', () => {
      if (state.flashIndex > 0) { state.flashIndex--; state.flashFlipped = false; loadAndRender(container); }
    });
    container.querySelector('#fc-next')?.addEventListener('click', () => advanceFlashcard(container));
  }

  // Pagination
  const pagDiv = container.querySelector('#vocab-pagination');
  if (pagDiv) {
    renderPagination(pagDiv, {
      page:  state.page,
      total: state.total,
      limit: 30,
      onPage: async (p) => { state.page = p; await loadAndRender(container); },
    });
  }
}

function advanceFlashcard(container) {
  if (state.flashIndex < state.flashItems.length - 1) {
    state.flashIndex++;
    state.flashFlipped = false;
    loadAndRender(container);
  } else {
    // Finished
    container.querySelector('#vocab-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <p>¡Completaste todas las flashcards!</p>
        <button class="btn btn-primary mt-16" id="restart-flash">Repetir</button>
      </div>`;
    container.querySelector('#restart-flash')?.addEventListener('click', () => {
      state.flashIndex   = 0;
      state.flashFlipped = false;
      state.flashItems   = shuffle(state.flashItems);
      loadAndRender(container);
    });
  }
}

function emptyState(msg = 'No se encontraron palabras con estos filtros.') {
  return `<div class="empty-state"><div class="empty-icon">🔍</div><p>${msg}</p></div>`;
}
