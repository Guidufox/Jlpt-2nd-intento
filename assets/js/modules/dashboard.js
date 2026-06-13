/**
 * JLPT Master — Dashboard Module
 */

import { dashboardAPI, srsAPI, progressAPI } from '../api.js';
import { showLoading, levelBadge, formatDate, percent, escapeHtml } from '../shared/utils.js';

export async function render(container, params = {}) {
  showLoading(container);
  try {
    const [data, srs, streak, today] = await Promise.all([
      dashboardAPI.summary(),
      srsAPI.stats(),
      progressAPI.streak().catch(() => ({ current_streak: 0, longest_streak: 0 })),
      progressAPI.today().catch(() => null),
    ]);
    container.innerHTML = buildDashboard(data, srs, streak, today);
    bindEvents(container, data);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error al cargar el dashboard.<br><small>${escapeHtml(err.message)}</small></p></div>`;
  }
}

function buildDashboard(d, srs, streak = {}, today = null) {
  const t = d.totals;
  const vocabMastered  = parseInt(t?.mastered_vocab ?? 0);
  const kanjiMastered  = parseInt(t?.mastered_kanji ?? 0);
  const totalVocab     = parseInt(t?.total_vocab ?? 0);
  const totalKanji     = parseInt(t?.total_kanji ?? 0);
  const avgScore       = t?.avg_score ?? '—';
  const dueNow         = parseInt(srs?.due_now ?? 0);

  return `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Tu progreso de estudio al día de hoy</p>
    </div>

    <!-- Global stat chips -->
    <div class="stats-row mb-24">
      <div class="stat-chip primary">
        <span class="num">${totalVocab}</span>
        <span class="lbl">Palabras totales</span>
      </div>
      <div class="stat-chip success">
        <span class="num">${vocabMastered}</span>
        <span class="lbl">Palabras dominadas</span>
      </div>
      <div class="stat-chip">
        <span class="num">${totalKanji}</span>
        <span class="lbl">Kanji totales</span>
      </div>
      <div class="stat-chip success">
        <span class="num">${kanjiMastered}</span>
        <span class="lbl">Kanji dominados</span>
      </div>
      <div class="stat-chip ${dueNow > 0 ? 'warning' : ''}">
        <span class="num">${dueNow}</span>
        <span class="lbl">SRS pendientes</span>
      </div>
      <div class="stat-chip">
        <span class="num">${avgScore}${avgScore !== '—' ? '%' : ''}</span>
        <span class="lbl">Nota media exámenes</span>
      </div>
    </div>

    ${(streak.current_streak > 0) ? `
    <div class="card mb-16" style="border-left:4px solid var(--warning);background:var(--warning-light)">
      <div class="flex items-center gap-12">
        <span style="font-size:2rem">🔥</span>
        <div>
          <strong style="font-size:1.1rem;color:var(--warning)">
            ${streak.current_streak} día${streak.current_streak > 1 ? 's' : ''} de racha
          </strong>
          <p class="text-sm text-muted">
            Racha más larga: ${streak.longest_streak} días ·
            ${today?.study?.items_total ?? 0} elementos estudiados hoy
          </p>
        </div>
      </div>
    </div>` : ''}

    ${dueNow > 0 ? `
    <div class="card mb-24" style="border-left:4px solid var(--warning);background:var(--warning-light)">
      <div class="flex items-center gap-12">
        <span style="font-size:1.5rem">🔄</span>
        <div style="flex:1">
          <strong>${dueNow} tarjeta${dueNow === 1 ? '' : 's'} SRS pendiente${dueNow === 1 ? '' : 's'}</strong>
          <p class="text-sm text-muted mt-4">Tienes repaso${dueNow === 1 ? '' : 's'} que hacer hoy</p>
        </div>
        <a href="#/srs" class="btn btn-primary btn-sm">Repasar ahora</a>
      </div>
    </div>
    ` : ''}

    <!-- Progress by level -->
    <div class="card mb-24">
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:16px">Progreso por nivel — Vocabulario</h2>
      <div class="level-progress-row" id="vocab-level-progress">
        ${buildLevelProgressCards(d.vocab_levels, 'vocab')}
      </div>
    </div>

    <div class="card mb-24">
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:16px">Progreso por nivel — Kanji</h2>
      <div class="level-progress-row" id="kanji-level-progress">
        ${buildLevelProgressCards(d.kanji_levels, 'kanji')}
      </div>
    </div>

    <!-- SRS detail + Recent exams side by side -->
    <div class="grid-2 mb-24">
      ${buildSRSCard(srs)}
      ${buildRecentExams(d.recent_exams)}
    </div>

    <!-- Activity -->
    ${buildActivity(d.activity)}
  `;
}

function buildLevelProgressCards(levels = [], type) {
  const order = ['N5','N4','N3','N2','N1'];
  const map   = {};
  levels.forEach(l => { map[l.level] = l; });

  return order.map(lv => {
    const l   = map[lv] ?? { total: 0, known: 0, mastered: 0, learning: 0, new_count: 0 };
    const total   = parseInt(l.total ?? 0);
    const done    = parseInt(l.mastered ?? 0) + parseInt(l.known ?? 0);
    const pct     = percent(done, total);

    return `
      <div class="level-progress-card ${lv.toLowerCase()}">
        <div class="lv">${lv}</div>
        <div class="progress-bar" style="margin:8px 0">
          <div class="progress-fill ${lv.toLowerCase() === 'n5' ? 'success' : 'primary'}"
               style="width:${pct}%;background:var(--${lv.toLowerCase()})"></div>
        </div>
        <div style="font-size:1.1rem;font-weight:700">${pct}%</div>
        <div class="count">${done} / ${total}</div>
      </div>`;
  }).join('');
}

function buildSRSCard(srs) {
  if (!srs) return '<div class="card"><p class="text-muted">Sin datos SRS</p></div>';
  const upcoming = srs.upcoming ?? [];
  return `
    <div class="card">
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:16px">Sistema SRS</h2>
      <div class="grid-2 gap-8 mb-16">
        <div class="stat-chip warning">
          <span class="num">${srs.due_now ?? 0}</span>
          <span class="lbl">Pendientes ahora</span>
        </div>
        <div class="stat-chip">
          <span class="num">${srs.reviewed_today ?? 0}</span>
          <span class="lbl">Repasadas hoy</span>
        </div>
        <div class="stat-chip">
          <span class="num">${srs.total_cards ?? 0}</span>
          <span class="lbl">Tarjetas totales</span>
        </div>
        <div class="stat-chip success">
          <span class="num">${srs.mature ?? 0}</span>
          <span class="lbl">Maduras (≥21d)</span>
        </div>
      </div>
      ${upcoming.length ? `
        <p class="text-xs text-muted font-bold" style="text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Próximos 7 días</p>
        <div class="flex gap-8" style="flex-wrap:wrap">
          ${upcoming.map(u => `
            <div style="text-align:center;min-width:44px">
              <div style="font-size:.95rem;font-weight:700">${u.count}</div>
              <div class="text-xs text-muted">${u.day.slice(5)}</div>
            </div>`).join('')}
        </div>` : ''}
    </div>`;
}

function buildRecentExams(exams = []) {
  return `
    <div class="card">
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:16px">Últimos exámenes</h2>
      ${exams.length === 0 ? '<p class="text-muted text-sm">No has realizado ningún simulacro todavía.</p>' : `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${exams.map(e => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
              ${levelBadge(e.level)}
              <span class="text-sm" style="flex:1">${e.exam_type ?? 'General'}</span>
              <span style="font-weight:700;font-size:1rem;color:${parseFloat(e.score)>=60?'var(--success)':'var(--danger)'}">${e.score ?? 0}%</span>
              <span class="text-xs text-muted">${formatDate(e.completed_at)}</span>
            </div>`).join('')}
        </div>`}
      <a href="#/exams" class="btn btn-outline btn-sm mt-12">Ver todos</a>
    </div>`;
}

function buildActivity(activity = []) {
  if (!activity.length) return '';
  const max = Math.max(...activity.map(a => parseInt(a.items ?? 0)), 1);
  return `
    <div class="card">
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:16px">Actividad reciente (7 días)</h2>
      <div class="flex gap-8 items-center" style="height:60px;align-items:flex-end">
        ${activity.map(a => {
          const h = Math.max(8, Math.round((parseInt(a.items ?? 0) / max) * 52));
          return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
              <div style="width:100%;max-width:40px;background:var(--primary);border-radius:4px 4px 0 0;height:${h}px" title="${a.items} items"></div>
              <span class="text-xs text-muted">${a.day.slice(5)}</span>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function bindEvents(container, data) {
  // Level progress cards are clickable
  container.querySelectorAll('.level-progress-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const level = card.querySelector('.lv').textContent;
      window.location.hash = `#/vocabulary/${level}`;
    });
  });
}
