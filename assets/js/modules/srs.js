/**
 * JLPT Master — SRS Review Module
 * Full SM-2 review session with Again / Hard / Good / Easy
 */

import { srsAPI } from '../api.js';
import { showLoading, toast, levelBadge, renderExamples, escapeHtml, shuffle } from '../shared/utils.js';

let state = {
  phase:    'stats',   // stats | session | done
  cards:    [],
  index:    0,
  flipped:  false,
  reviewed: 0,
  correct:  0,
  level:    null,
  type:     null,       // vocabulary | kanji | null
  stats:    null,
};

export async function render(container, params = {}) {
  if (params.level) state.level = params.level;
  state.phase = 'stats';
  showLoading(container);
  await loadStats(container);
}

// ─────────────────────────────────────────────
async function loadStats(container) {
  try {
    state.stats = await srsAPI.stats();
    state.phase = 'stats';
    renderStats(container);
  } catch (err) {
    container.innerHTML = errState(err.message);
  }
}

// ═════════════════════════════════════════════
// STATS SCREEN
// ═════════════════════════════════════════════
function renderStats(container) {
  const s       = state.stats ?? {};
  const dueNow  = parseInt(s.due_now ?? 0);
  const upcoming = s.upcoming ?? [];

  container.innerHTML = `
    <div class="page-header">
      <h1>🔄 Repaso SRS</h1>
      <p>Sistema de repetición espaciada basado en SM-2.</p>
    </div>

    <!-- Due now banner -->
    ${dueNow > 0 ? `
      <div class="card mb-16" style="border-left:4px solid var(--primary);background:var(--primary-light)">
        <div class="flex items-center gap-12">
          <span style="font-size:2rem">🔄</span>
          <div>
            <strong style="font-size:1.2rem;color:var(--primary-dark)">${dueNow} tarjeta${dueNow !== 1 ? 's' : ''} para repasar</strong>
            <p class="text-sm text-muted">Lista${dueNow !== 1 ? 's' : ''} para revisión ahora</p>
          </div>
          <button class="btn btn-primary ml-auto btn-lg" id="start-srs">Comenzar repaso →</button>
        </div>
      </div>` : `
      <div class="card mb-16" style="border-left:4px solid var(--success);background:var(--success-light)">
        <div class="flex items-center gap-12">
          <span style="font-size:2rem">✅</span>
          <div>
            <strong style="color:var(--success)">¡Sin pendientes ahora!</strong>
            <p class="text-sm text-muted">Vuelve más tarde para repasar.</p>
          </div>
        </div>
      </div>`}

    <!-- Stats grid -->
    <div class="grid-2 gap-16 mb-24">
      <div class="card">
        <h3 style="font-size:.9rem;font-weight:700;margin-bottom:14px;color:var(--gray-600)">Estado del mazo</h3>
        <div class="stats-row" style="flex-wrap:wrap">
          <div class="stat-chip warning"><span class="num">${s.due_now ?? 0}</span><span class="lbl">Pendientes</span></div>
          <div class="stat-chip"><span class="num">${s.new_cards ?? 0}</span><span class="lbl">Nuevas</span></div>
          <div class="stat-chip"><span class="num">${s.learning ?? 0}</span><span class="lbl">Aprendiendo</span></div>
          <div class="stat-chip success"><span class="num">${s.mature ?? 0}</span><span class="lbl">Maduras</span></div>
        </div>
      </div>

      <div class="card">
        <h3 style="font-size:.9rem;font-weight:700;margin-bottom:14px;color:var(--gray-600)">Hoy</h3>
        <div class="stats-row">
          <div class="stat-chip"><span class="num">${s.reviewed_today ?? 0}</span><span class="lbl">Repasadas</span></div>
          <div class="stat-chip"><span class="num">${s.vocab_cards ?? 0}</span><span class="lbl">Vocab en mazo</span></div>
          <div class="stat-chip"><span class="num">${s.kanji_cards ?? 0}</span><span class="lbl">Kanji en mazo</span></div>
          <div class="stat-chip"><span class="num">${s.total_cards ?? 0}</span><span class="lbl">Tarjetas totales</span></div>
        </div>
      </div>
    </div>

    <!-- Upcoming forecast -->
    ${upcoming.length ? `
      <div class="card mb-16">
        <h3 style="font-size:.9rem;font-weight:700;margin-bottom:12px;color:var(--gray-600)">Próximos 7 días</h3>
        <div class="flex gap-12 items-end" style="height:70px">
          ${(() => {
            const maxVal = Math.max(...upcoming.map(u => parseInt(u.count)), 1);
            return upcoming.map(u => {
              const h = Math.max(8, Math.round((parseInt(u.count) / maxVal) * 56));
              return `
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
                  <span class="text-xs text-muted">${u.count}</span>
                  <div style="width:100%;max-width:48px;height:${h}px;background:var(--primary);border-radius:4px 4px 0 0;opacity:.7"></div>
                  <span class="text-xs text-muted">${u.day.slice(5)}</span>
                </div>`;
            }).join('');
          })()}
        </div>
      </div>` : ''}

    <!-- Filter options before starting -->
    <div class="card">
      <h3 style="font-size:.9rem;font-weight:700;margin-bottom:14px;color:var(--gray-600)">Opciones de repaso</h3>
      <div class="flex gap-12 flex-wrap items-center">
        <div>
          <label class="form-label">Filtrar por tipo</label>
          <select class="select" id="srs-type-filter" style="width:160px">
            <option value="">Vocabulario y Kanji</option>
            <option value="vocabulary" ${state.type === 'vocabulary' ? 'selected' : ''}>Solo vocabulario</option>
            <option value="kanji"      ${state.type === 'kanji'      ? 'selected' : ''}>Solo kanji</option>
          </select>
        </div>
        <div>
          <label class="form-label">Filtrar por nivel</label>
          <select class="select" id="srs-level-filter" style="width:100px">
            <option value="">Todos</option>
            ${['N5','N4','N3','N2','N1'].map(lv =>
              `<option value="${lv}" ${state.level === lv ? 'selected' : ''}>${lv}</option>`
            ).join('')}
          </select>
        </div>
        ${dueNow > 0 ? `<button class="btn btn-primary mt-auto" id="start-srs-filtered">Iniciar con filtros →</button>` : ''}
      </div>
    </div>

    <!-- SRS Explanation -->
    <div class="card mt-16" style="background:var(--gray-50)">
      <h3 style="font-size:.9rem;font-weight:700;margin-bottom:10px">¿Cómo funciona el SRS?</h3>
      <p class="text-sm text-muted">
        El sistema SM-2 ajusta automáticamente el intervalo de revisión según tu respuesta.
        Cuanto mejor recuerdes una tarjeta, más días pasarán antes de volver a verla.
      </p>
      <div class="flex gap-8 mt-12 flex-wrap">
        <span class="btn btn-again" style="cursor:default;font-size:.75rem;padding:4px 12px">↩ Again — 1 día</span>
        <span class="btn btn-hard"  style="cursor:default;font-size:.75rem;padding:4px 12px">◑ Hard — ~1.2×</span>
        <span class="btn btn-good"  style="cursor:default;font-size:.75rem;padding:4px 12px">✓ Good — intervalo normal</span>
        <span class="btn btn-easy"  style="cursor:default;font-size:.75rem;padding:4px 12px">✦ Easy — intervalo largo</span>
      </div>
    </div>
  `;

  container.querySelector('#srs-type-filter')?.addEventListener('change', e => { state.type = e.target.value || null; });
  container.querySelector('#srs-level-filter')?.addEventListener('change', e => { state.level = e.target.value || null; });
  container.querySelector('#start-srs')?.addEventListener('click', () => startSession(container));
  container.querySelector('#start-srs-filtered')?.addEventListener('click', () => startSession(container));
}

// ═════════════════════════════════════════════
// START SESSION
// ═════════════════════════════════════════════
async function startSession(container) {
  showLoading(container);
  try {
    const params = { limit: 30 };
    if (state.type)  params.type  = state.type;
    if (state.level) params.level = state.level;

    const data = await srsAPI.due(params);

    if (!data.cards?.length) {
      toast('No hay tarjetas pendientes con estos filtros.', 'info');
      await loadStats(container);
      return;
    }

    state.cards    = data.cards;
    state.index    = 0;
    state.flipped  = false;
    state.reviewed = 0;
    state.correct  = 0;
    state.phase    = 'session';

    renderCard(container);
  } catch (err) {
    toast('Error: ' + err.message, 'error');
    await loadStats(container);
  }
}

// ═════════════════════════════════════════════
// CARD SESSION
// ═════════════════════════════════════════════
function renderCard(container) {
  const card    = state.cards[state.index];
  const total   = state.cards.length;
  const idx     = state.index;
  const flipped = state.flipped;
  const isVocab = card.item_type === 'vocabulary';

  const front = isVocab
    ? escapeHtml(card.display_front || card.display_kana || '')
    : escapeHtml(card.display_front || '');

  const kana = isVocab ? escapeHtml(card.vocab_kana || '') : '';
  const back  = escapeHtml(card.display_meaning || '');

  const examplesHtml = flipped ? renderExamples(card.examples ?? []) : '';

  // Reading info for kanji
  let readingHtml = '';
  if (!isVocab && flipped) {
    readingHtml = `
      <div style="text-align:left;width:100%;margin-top:10px">
        <dl class="kanji-readings" style="font-size:.9rem">
          ${card.onyomi  ? `<dt>On'yomi</dt><dd class="jp-text">${escapeHtml(card.onyomi)}</dd>`  : ''}
          ${card.kunyomi ? `<dt>Kun'yomi</dt><dd class="jp-text">${escapeHtml(card.kunyomi)}</dd>` : ''}
        </dl>
      </div>`;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="flex items-center gap-12">
        <h1>🔄 Repaso SRS</h1>
        <button class="btn btn-ghost btn-sm ml-auto" id="srs-abort">✕ Salir</button>
      </div>
    </div>

    <div class="srs-container">
      <!-- Progress -->
      <div class="srs-progress-text">${idx + 1} / ${total} · Repasadas: ${state.reviewed}</div>
      <div class="exam-progress-bar">
        <div class="exam-progress-fill" style="width:${((idx) / total) * 100}%"></div>
      </div>

      <!-- Type + Level badge -->
      <div class="flex gap-8 mt-12 mb-8" style="justify-content:center">
        <span class="status-badge" style="background:var(--gray-100);color:var(--gray-600);text-transform:capitalize">
          ${card.item_type}
        </span>
        ${card.level ? levelBadge(card.level) : ''}
      </div>

      <!-- Flashcard -->
      <div class="flashcard-scene" style="height:${flipped ? '340px' : '250px'}">
        <div class="flashcard ${flipped ? 'is-flipped' : ''}" id="srs-card">
          <!-- Front -->
          <div class="flashcard-face front">
            <div class="flashcard-word jp-text" style="font-size:${front.length > 2 ? '2.4rem' : '4rem'}">${front}</div>
            ${kana ? `<div class="flashcard-kana jp-text">${kana}</div>` : ''}
            <div class="flashcard-hint mt-8">Haz clic para revelar</div>
          </div>
          <!-- Back -->
          <div class="flashcard-face back" style="overflow-y:auto">
            <div class="flashcard-word jp-text" style="font-size:${front.length > 2 ? '1.8rem' : '3rem'}">${front}</div>
            <div class="flashcard-meaning" style="margin-top:8px">${back}</div>
            ${readingHtml}
            ${examplesHtml}
          </div>
        </div>
      </div>

      <!-- Interval info -->
      <p class="text-xs text-muted text-center mt-8">
        Intervalo actual: <strong>${card.interval_days ?? 1} día${(card.interval_days ?? 1) !== 1 ? 's' : ''}</strong>
      </p>

      <!-- Buttons -->
      ${flipped ? `
        <div class="flashcard-controls mt-16">
          <button class="btn btn-again" data-quality="0">↩ Again</button>
          <button class="btn btn-hard"  data-quality="1">◑ Hard</button>
          <button class="btn btn-good"  data-quality="2">✓ Good</button>
          <button class="btn btn-easy"  data-quality="3">✦ Easy</button>
        </div>
        <p class="text-xs text-muted text-center mt-8">
          Again→1d &nbsp;·&nbsp; Hard→~${Math.max(1,Math.round((card.interval_days??1)*1.2))}d &nbsp;·&nbsp;
          Good→~${Math.max(1,Math.round((card.interval_days??1)*(card.ease_factor??2.5)))}d &nbsp;·&nbsp;
          Easy→más
        </p>` : `
        <div class="flashcard-controls mt-16">
          <button class="btn btn-outline btn-lg" id="srs-reveal">Mostrar respuesta</button>
        </div>`}
    </div>
  `;

  // Events
  container.querySelector('#srs-card')?.addEventListener('click', () => {
    state.flipped = !state.flipped;
    renderCard(container);
  });
  container.querySelector('#srs-reveal')?.addEventListener('click', () => {
    state.flipped = true;
    renderCard(container);
  });
  container.querySelector('#srs-abort')?.addEventListener('click', () => {
    if (confirm('¿Salir del repaso?')) { state.phase = 'stats'; loadStats(container); }
  });

  container.querySelectorAll('[data-quality]').forEach(btn => {
    btn.addEventListener('click', () => handleReview(parseInt(btn.dataset.quality), card, container));
  });
}

async function handleReview(quality, card, container) {
  try {
    await srsAPI.review({ card_id: card.id, quality });
    if (quality >= 2) state.correct++;
  } catch {}

  state.reviewed++;

  if (state.index < state.cards.length - 1) {
    state.index++;
    state.flipped = false;
    renderCard(container);
  } else {
    renderDone(container);
  }
}

// ═════════════════════════════════════════════
// DONE
// ═════════════════════════════════════════════
function renderDone(container) {
  const total   = state.reviewed;
  const correct = state.correct;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

  container.innerHTML = `
    <div class="page-header"><h1>🔄 Repaso completado</h1></div>

    <div class="card card-lg" style="max-width:480px;margin:0 auto;text-align:center">
      <div class="score-circle ${pct >= 70 ? 'pass' : 'fail'}">
        <span class="score-num">${pct}%</span>
        <span class="text-sm text-muted">${correct}/${total}</span>
      </div>

      <h2 style="margin-bottom:6px">${pct >= 70 ? '🎉 ¡Buen trabajo!' : '📖 Sigue practicando'}</h2>
      <p class="text-muted">
        Respondiste correctamente ${correct} de ${total} tarjetas.
      </p>

      <div class="flex gap-12 mt-24 justify-center">
        <button class="btn btn-primary" id="srs-again">Otro repaso</button>
        <button class="btn btn-outline" id="srs-home">Ver estadísticas</button>
      </div>
    </div>
  `;

  container.querySelector('#srs-again')?.addEventListener('click',  () => startSession(container));
  container.querySelector('#srs-home')?.addEventListener('click',   () => loadStats(container));
}

function errState(msg) {
  return `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error: ${escapeHtml(msg)}</p></div>`;
}
