/**
 * JLPT Master — Exams Module
 * Phases: setup → running → results | history
 */

import { examAPI } from '../api.js';
import {
  showLoading, toast, levelBadge, formatTime,
  escapeHtml, breadcrumb
} from '../shared/utils.js';

let state = {
  phase: 'setup',         // setup | running | results | history
  level: null,
  type:  'all',
  mode:  'practice',      // practice | exam
  count: 10,
  sessionId: null,
  questions: [],
  currentIdx: 0,
  answers: [],            // { questionId, userAnswer, isCorrect, timeTaken }
  startTime: null,
  questionStartTime: null,
  timer: null,
  elapsed: 0,
  timerLimit: 0,          // seconds; 0 = no limit
  results: null,
  locked: false,          // prevent re-answering in exam mode
};

export async function render(container, params = {}) {
  if (params.level) state.level = params.level;
  if (params.phase) state.phase = params.phase;
  else              state.phase = 'setup';

  clearTimer();
  await renderPhase(container);
}

// ─────────────────────────────────────────────
async function renderPhase(container) {
  switch (state.phase) {
    case 'setup':   renderSetup(container);           break;
    case 'running': await renderRunning(container);   break;
    case 'results': renderResults(container);         break;
    case 'history': await renderHistory(container);   break;
  }
}

// ═════════════════════════════════════════════
// SETUP
// ═════════════════════════════════════════════
function renderSetup(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1>📋 Simulacros JLPT</h1>
      <p>Practica con preguntas reales del examen.</p>
    </div>

    <div class="exam-setup card card-lg">
      <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:20px">Configurar simulacro</h2>

      <div class="form-group">
        <label class="form-label">Nivel JLPT</label>
        <div class="level-buttons">
          ${['N5','N4','N3','N2','N1'].map(lv => `
            <button class="level-btn ${lv.toLowerCase()} ${state.level === lv ? 'active' : ''}"
                    data-level="${lv}"
                    style="${state.level === lv ? `background:var(--${lv.toLowerCase()});color:white` : ''}"
                    >${lv}</button>`
          ).join('')}
          <button class="level-btn" data-level="" style="border-color:var(--gray-300);color:var(--gray-500)">
            Todos los niveles
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Tipo de preguntas</label>
        <select class="select" id="exam-type" style="max-width:280px">
          <option value="all"        ${state.type === 'all'        ? 'selected' : ''}>Todos los tipos</option>
          <option value="vocabulary" ${state.type === 'vocabulary' ? 'selected' : ''}>Vocabulario</option>
          <option value="grammar"    ${state.type === 'grammar'    ? 'selected' : ''}>Gramática</option>
          <option value="kanji"      ${state.type === 'kanji'      ? 'selected' : ''}>Kanji</option>
          <option value="reading"    ${state.type === 'reading'    ? 'selected' : ''}>Comprensión lectora</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Número de preguntas</label>
        <div class="flex gap-8">
          ${[5, 10, 20, 30].map(n => `
            <button class="btn ${state.count === n ? 'btn-primary' : 'btn-outline'} btn-sm"
                    data-count="${n}">${n}</button>`).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Modo</label>
        <div class="flex gap-12">
          <label class="flex items-center gap-8" style="cursor:pointer">
            <input type="radio" name="exam-mode" value="practice" ${state.mode === 'practice' ? 'checked' : ''}>
            <div>
              <strong>Práctica</strong>
              <p class="text-sm text-muted">Corrección inmediata y explicación.</p>
            </div>
          </label>
          <label class="flex items-center gap-8" style="cursor:pointer">
            <input type="radio" name="exam-mode" value="exam" ${state.mode === 'exam' ? 'checked' : ''}>
            <div>
              <strong>Examen</strong>
              <p class="text-sm text-muted">Cronómetro. Sin corrección hasta el final.</p>
            </div>
          </label>
        </div>
      </div>

      <div class="flex gap-12 mt-24">
        <button class="btn btn-primary btn-lg" id="start-exam">Comenzar →</button>
        <button class="btn btn-outline" id="show-history">Ver historial</button>
      </div>
    </div>
  `;

  // Level buttons
  container.querySelectorAll('[data-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.level = btn.dataset.level || null;
      container.querySelectorAll('[data-level]').forEach(b => {
        const lv = b.dataset.level;
        b.style.background = '';
        b.style.color      = '';
        b.classList.remove('active');
      });
      btn.style.background = state.level ? `var(--${state.level.toLowerCase()})` : 'var(--gray-500)';
      btn.style.color      = 'white';
    });
  });

  // Count
  container.querySelectorAll('[data-count]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.count = parseInt(btn.dataset.count);
      container.querySelectorAll('[data-count]').forEach(b => b.className = 'btn btn-outline btn-sm');
      btn.className = 'btn btn-primary btn-sm';
    });
  });

  // Type
  container.querySelector('#exam-type')?.addEventListener('change', e => { state.type = e.target.value; });

  // Mode
  container.querySelectorAll('[name="exam-mode"]').forEach(r => {
    r.addEventListener('change', e => { state.mode = e.target.value; });
  });

  // Start
  container.querySelector('#start-exam')?.addEventListener('click', () => startExam(container));

  // History
  container.querySelector('#show-history')?.addEventListener('click', () => {
    state.phase = 'history';
    renderPhase(container);
  });
}

// ═════════════════════════════════════════════
// START EXAM
// ═════════════════════════════════════════════
async function startExam(container) {
  showLoading(container);
  try {
    // Fetch questions
    const params = { count: state.count };
    if (state.level)          params.level = state.level;
    if (state.type !== 'all') params.type  = state.type;

    const qData = await examAPI.questions(params);
    if (!qData.questions?.length) {
      toast('No hay preguntas disponibles con estos filtros.', 'error');
      renderSetup(container);
      return;
    }

    // Start session
    const sessData = await examAPI.start({
      level: state.level,
      type:  state.type,
      mode:  state.mode,
      count: qData.questions.length,
    });

    state.questions  = qData.questions;
    state.sessionId  = sessData.session_id;
    state.currentIdx = 0;
    state.answers    = [];
    state.startTime  = Date.now();
    state.locked     = false;

    // Timer setup (exam mode: 90s per question)
    if (state.mode === 'exam') {
      state.timerLimit = qData.questions.length * 90;
    } else {
      state.timerLimit = 0;
    }

    state.phase = 'running';
    renderPhase(container);
  } catch (err) {
    toast('Error al iniciar: ' + err.message, 'error');
    renderSetup(container);
  }
}

// ═════════════════════════════════════════════
// RUNNING
// ═════════════════════════════════════════════
async function renderRunning(container) {
  const q         = state.questions[state.currentIdx];
  const answered  = state.answers[state.currentIdx];
  const pct       = Math.round(((state.currentIdx) / state.questions.length) * 100);

  container.innerHTML = `
    <div class="page-header">
      <h1>📋 ${state.mode === 'exam' ? 'Examen' : 'Práctica'} — ${state.level ?? 'General'}</h1>
    </div>

    <div class="exam-question">
      <!-- Progress -->
      <div class="flex items-center gap-12 mb-8">
        <span class="text-sm text-muted">Pregunta ${state.currentIdx + 1} de ${state.questions.length}</span>
        ${state.mode === 'exam' ? `
          <div class="exam-timer ml-auto">
            <span>⏱</span>
            <span class="time" id="exam-clock">0:00</span>
          </div>` : ''}
      </div>

      <div class="exam-progress-bar">
        <div class="exam-progress-fill" style="width:${pct}%"></div>
      </div>

      <!-- Type badge + Level -->
      <div class="flex gap-8 mt-12 mb-4">
        <span class="status-badge" style="background:var(--gray-100);color:var(--gray-600);text-transform:capitalize">
          ${escapeHtml(q.question_type)}
        </span>
        ${levelBadge(q.level)}
      </div>

      <!-- Question -->
      <div class="question-text">${escapeHtml(q.question_text)}</div>

      <!-- Options -->
      <div class="options-grid" id="options-grid">
        ${(q.options ?? []).map(opt => `
          <button class="option-btn ${answered ? getOptClass(opt.option_label, answered) : ''}"
                  data-label="${opt.option_label}"
                  ${answered ? 'disabled' : ''}>
            <span class="opt-label">${opt.option_label}</span>
            <span class="jp-text">${escapeHtml(opt.option_text)}</span>
          </button>`).join('')}
      </div>

      <!-- Feedback (practice mode) -->
      ${answered && state.mode === 'practice' ? `
        <div class="exam-feedback ${answered.isCorrect ? 'correct' : 'wrong'}">
          <strong>${answered.isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto'}</strong>
          ${!answered.isCorrect ? `<p>Respuesta correcta: <strong>${escapeHtml(q.correct_answer)}</strong></p>` : ''}
          ${q.explanation ? `<p class="explanation">${escapeHtml(q.explanation)}</p>` : ''}
        </div>` : ''}

      <!-- Navigation -->
      <div class="flex gap-12 mt-20">
        ${state.currentIdx > 0 ? `<button class="btn btn-outline" id="prev-q">← Anterior</button>` : ''}
        ${answered || state.mode === 'exam' ? `
          <button class="btn btn-primary ml-auto" id="next-q">
            ${state.currentIdx < state.questions.length - 1 ? 'Siguiente →' : 'Ver resultados →'}
          </button>` : ''}
        <button class="btn btn-ghost" id="abort-exam" style="margin-left:auto">Abandonar</button>
      </div>
    </div>
  `;

  state.questionStartTime = Date.now();

  // Start/update clock
  if (state.mode === 'exam') startClock(container);

  bindRunningEvents(container, q);
}

function getOptClass(label, answered) {
  if (label === answered.correctAnswer) return 'correct';
  if (label === answered.userAnswer && !answered.isCorrect) return 'wrong';
  return '';
}

function bindRunningEvents(container, q) {
  // Answer option
  container.querySelectorAll('.option-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(btn.dataset.label, q, container));
  });

  // Next
  container.querySelector('#next-q')?.addEventListener('click', () => {
    if (state.currentIdx < state.questions.length - 1) {
      state.currentIdx++;
      state.locked = false;
      renderRunning(container);
    } else {
      finishExam(container);
    }
  });

  // Previous
  container.querySelector('#prev-q')?.addEventListener('click', () => {
    if (state.currentIdx > 0) { state.currentIdx--; renderRunning(container); }
  });

  // Abort
  container.querySelector('#abort-exam')?.addEventListener('click', () => {
    clearTimer();
    if (confirm('¿Abandonar el examen?')) {
      state.phase = 'setup';
      renderPhase(container);
    }
  });
}

async function selectAnswer(label, q, container) {
  if (state.locked) return;
  if (state.answers[state.currentIdx]) return; // already answered in practice

  const timeTaken = Math.round((Date.now() - state.questionStartTime) / 1000);

  // Record answer via API
  let result;
  try {
    result = await examAPI.answer({
      session_id:  state.sessionId,
      question_id: q.id,
      user_answer: label,
      time_taken:  timeTaken,
    });
  } catch {
    result = {
      is_correct:     label === q.correct_answer,
      correct_answer: q.correct_answer,
      explanation:    q.explanation,
    };
  }

  state.answers[state.currentIdx] = {
    questionId:    q.id,
    userAnswer:    label,
    correctAnswer: result.correct_answer,
    isCorrect:     result.is_correct,
    timeTaken,
  };

  // In exam mode, just lock and show next button
  if (state.mode === 'exam') {
    state.locked = true;
    renderRunning(container);
  } else {
    // Practice: show feedback immediately
    renderRunning(container);
  }
}

// ─────────────────────────────────────────────
// Timer (exam mode)
// ─────────────────────────────────────────────
function startClock(container) {
  clearTimer();
  const startTs = state.startTime ?? Date.now();

  state.timer = setInterval(() => {
    const el     = document.getElementById('exam-clock');
    if (!el) { clearInterval(state.timer); return; }
    const elapsed = Math.round((Date.now() - startTs) / 1000);
    el.textContent = formatTime(elapsed);
    if (state.timerLimit > 0 && elapsed >= state.timerLimit) {
      clearTimer();
      toast('Tiempo agotado', 'error');
      finishExam(container);
    }
  }, 1000);
}

function clearTimer() {
  if (state.timer) { clearInterval(state.timer); state.timer = null; }
}

// ═════════════════════════════════════════════
// FINISH
// ═════════════════════════════════════════════
async function finishExam(container) {
  clearTimer();
  showLoading(container);
  const timeTaken = Math.round((Date.now() - (state.startTime ?? Date.now())) / 1000);

  try {
    const res = await examAPI.finish({ session_id: state.sessionId, time_taken: timeTaken });
    state.results = { ...res, timeTaken, answers: state.answers, questions: state.questions };
  } catch {
    const correct = state.answers.filter(a => a?.isCorrect).length;
    const total   = state.questions.length;
    state.results = { correct, total, score: Math.round((correct / total) * 100), timeTaken, passed: (correct / total) >= 0.6 };
  }

  state.phase = 'results';
  renderPhase(container);
}

// ═════════════════════════════════════════════
// RESULTS
// ═════════════════════════════════════════════
function renderResults(container) {
  const r       = state.results ?? {};
  const correct = r.correct ?? r.correct_answers ?? 0;
  const total   = r.total   ?? r.total_questions ?? state.questions.length;
  const score   = r.score   ?? 0;
  const passed  = r.passed  ?? score >= 60;

  container.innerHTML = `
    <div class="page-header">
      <h1>📊 Resultados</h1>
    </div>

    <div class="card card-lg" style="max-width:560px;margin:0 auto;text-align:center">
      <div class="score-circle ${passed ? 'pass' : 'fail'}">
        <span class="score-num">${score}%</span>
        <span class="text-sm text-muted">${correct}/${total}</span>
      </div>

      <h2 style="font-size:1.4rem;margin-bottom:6px">
        ${passed ? '🎉 ¡Aprobado!' : '📖 Sigue practicando'}
      </h2>
      <p class="text-muted">
        ${correct} respuestas correctas de ${total} preguntas en ${formatTime(r.timeTaken ?? 0)}.
      </p>

      <div class="stats-row mt-24" style="justify-content:center">
        <div class="stat-chip success"><span class="num">${correct}</span><span class="lbl">Correctas</span></div>
        <div class="stat-chip danger" ><span class="num">${total - correct}</span><span class="lbl">Incorrectas</span></div>
        <div class="stat-chip"><span class="num">${formatTime(r.timeTaken ?? 0)}</span><span class="lbl">Tiempo</span></div>
      </div>

      <!-- Review per question -->
      ${state.answers.length ? `
        <div style="text-align:left;margin-top:24px">
          <h3 style="font-size:.95rem;font-weight:700;margin-bottom:12px">Revisión</h3>
          ${state.questions.map((q, i) => {
            const ans = state.answers[i];
            if (!ans) return '';
            return `
              <div style="padding:10px 0;border-bottom:1px solid var(--gray-100);display:flex;align-items:flex-start;gap:10px">
                <span style="font-size:1.1rem;flex-shrink:0">${ans.isCorrect ? '✅' : '❌'}</span>
                <div>
                  <p class="text-sm jp-text" style="color:var(--dark)">${escapeHtml(q.question_text)}</p>
                  ${!ans.isCorrect ? `<p class="text-xs text-muted mt-4">Tu respuesta: <strong>${escapeHtml(ans.userAnswer)}</strong> · Correcta: <strong>${escapeHtml(ans.correctAnswer)}</strong></p>` : ''}
                  ${q.explanation ? `<p class="text-xs" style="color:var(--gray-600);margin-top:4px">${escapeHtml(q.explanation)}</p>` : ''}
                </div>
              </div>`;
          }).join('')}
        </div>` : ''}

      <div class="flex gap-12 mt-24 justify-center">
        <button class="btn btn-primary" id="retry-exam">Repetir</button>
        <button class="btn btn-outline" id="new-exam">Nuevo examen</button>
      </div>
    </div>
  `;

  container.querySelector('#retry-exam')?.addEventListener('click', () => startExam(container));
  container.querySelector('#new-exam')?.addEventListener('click', () => {
    state.phase = 'setup';
    renderPhase(container);
  });
}

// ═════════════════════════════════════════════
// HISTORY
// ═════════════════════════════════════════════
async function renderHistory(container) {
  showLoading(container);
  try {
    const sessions = await examAPI.sessions({ level: state.level });
    container.innerHTML = `
      ${breadcrumb({ label: 'Simulacros', href: '#/exams' }, { label: 'Historial' })}

      <div class="page-header">
        <h1>📋 Historial de exámenes</h1>
      </div>

      ${!sessions.length ? `
        <div class="empty-state"><div class="empty-icon">📋</div>
        <p>Todavía no has realizado ningún simulacro.</p></div>` : `
        <div style="overflow-x:auto">
          <table class="vocab-table">
            <thead>
              <tr><th>Fecha</th><th>Nivel</th><th>Tipo</th><th>Modo</th><th>Resultado</th><th>Nota</th></tr>
            </thead>
            <tbody>
              ${sessions.map(s => `
                <tr>
                  <td class="text-sm">${new Date(s.completed_at).toLocaleDateString('es')}</td>
                  <td>${s.level ? levelBadge(s.level) : '<span class="text-muted">—</span>'}</td>
                  <td class="text-sm" style="text-transform:capitalize">${escapeHtml(s.exam_type ?? 'General')}</td>
                  <td class="text-sm" style="text-transform:capitalize">${escapeHtml(s.mode)}</td>
                  <td class="text-sm">${s.correct_answers}/${s.total_questions}</td>
                  <td><strong style="color:${parseFloat(s.score)>=60?'var(--success)':'var(--danger)'}">${s.score}%</strong></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`}

      <div class="mt-16">
        <button class="btn btn-outline" id="back-to-setup">← Volver</button>
      </div>
    `;

    container.querySelector('#back-to-setup')?.addEventListener('click', () => {
      state.phase = 'setup';
      renderPhase(container);
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error: ${escapeHtml(err.message)}</p></div>`;
  }
}
