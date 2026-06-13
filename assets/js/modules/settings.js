/**
 * JLPT Master — Settings Module
 * All settings stored in localStorage (no login required).
 */

import { toast } from '../shared/utils.js';

// ─────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────
const DEFAULTS = {
  // Display
  meaning_language:  'es',        // es | en | both
  furigana_visible:  true,        // show furigana on vocab lists
  romaji_visible:    false,       // show romaji in examples

  // SRS
  srs_enabled:       true,        // global SRS on/off
  daily_new_cards:   10,          // new cards to add per day
  daily_review_limit: 50,         // max reviews per day

  // Flashcards
  autoflip:          false,       // auto-flip after N seconds
  autoflip_delay:    3,           // seconds before auto-flip

  // Study goals
  daily_vocab_goal:  15,          // new words per day
  daily_kanji_goal:  5,           // new kanji per day

  // Exam
  default_exam_count: 10,
  default_exam_mode:  'practice', // practice | exam

  // Misc
  theme:             'light',     // light (only option for now)
  font_size:         'normal',    // small | normal | large
};

// ─────────────────────────────────────────────
export function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('jlpt_settings') ?? '{}');
    return { ...DEFAULTS, ...saved };
  } catch { return { ...DEFAULTS }; }
}

export function saveSetting(key, value) {
  const current = getSettings();
  current[key]  = value;
  localStorage.setItem('jlpt_settings', JSON.stringify(current));
  applySettings(current);
}

export function resetSettings() {
  localStorage.removeItem('jlpt_settings');
  applySettings(DEFAULTS);
}

// Apply visual settings to document
export function applySettings(settings) {
  const s = settings ?? getSettings();
  const root = document.documentElement;

  // Font size
  root.style.setProperty('--user-font-size', {
    small:  '13px',
    normal: '15px',
    large:  '17px',
  }[s.font_size] ?? '15px');
  document.documentElement.style.fontSize = {
    small:  '13px',
    normal: '15px',
    large:  '17px',
  }[s.font_size] ?? '15px';
}

// ─────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────
export async function render(container) {
  const s = getSettings();
  container.innerHTML = buildSettings(s);
  bindEvents(container);
  applySettings(s);
}

function buildSettings(s) {
  return `
    <div class="page-header">
      <h1>⚙️ Configuración</h1>
      <p>Preferencias guardadas localmente en tu navegador.</p>
    </div>

    <div style="max-width:680px;display:flex;flex-direction:column;gap:16px">

      <!-- ── Display ─────────────────────────── -->
      <div class="card">
        <h2 class="settings-section-title">🖥️ Visualización</h2>

        <div class="settings-row">
          <div>
            <label class="settings-label">Idioma del significado</label>
            <p class="settings-desc">Cómo se muestran las traducciones de vocabulario.</p>
          </div>
          <select class="select" id="s-meaning-language" style="width:160px">
            <option value="es"   ${s.meaning_language === 'es'   ? 'selected' : ''}>Solo español</option>
            <option value="en"   ${s.meaning_language === 'en'   ? 'selected' : ''}>Solo inglés</option>
            <option value="both" ${s.meaning_language === 'both' ? 'selected' : ''}>Ambos</option>
          </select>
        </div>

        <div class="settings-row">
          <div>
            <label class="settings-label">Furigana visible</label>
            <p class="settings-desc">Mostrar lectura en hiragana sobre el kanji en listas.</p>
          </div>
          <label class="toggle">
            <input type="checkbox" id="s-furigana" ${s.furigana_visible ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-row">
          <div>
            <label class="settings-label">Tamaño de letra</label>
            <p class="settings-desc">Tamaño base del texto en la aplicación.</p>
          </div>
          <select class="select" id="s-font-size" style="width:130px">
            <option value="small"  ${s.font_size === 'small'  ? 'selected' : ''}>Pequeño</option>
            <option value="normal" ${s.font_size === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="large"  ${s.font_size === 'large'  ? 'selected' : ''}>Grande</option>
          </select>
        </div>

        <div class="settings-row">
          <div>
            <label class="settings-label">Mostrar romanización</label>
            <p class="settings-desc">Mostrar lectura latina (romaji) en los ejemplos.</p>
          </div>
          <label class="toggle">
            <input type="checkbox" id="s-romaji" ${s.romaji_visible ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- ── SRS ─────────────────────────────── -->
      <div class="card">
        <h2 class="settings-section-title">🔄 Sistema SRS</h2>

        <div class="settings-row">
          <div>
            <label class="settings-label">SRS activado</label>
            <p class="settings-desc">Usar repetición espaciada en flashcards.</p>
          </div>
          <label class="toggle">
            <input type="checkbox" id="s-srs-enabled" ${s.srs_enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-row">
          <div>
            <label class="settings-label">Nuevas tarjetas por día</label>
            <p class="settings-desc">Cuántas tarjetas nuevas añadir al mazo diariamente.</p>
          </div>
          <div class="flex items-center gap-8">
            <input type="number" class="input" id="s-daily-new" min="1" max="100"
                   value="${s.daily_new_cards}" style="width:80px">
            <span class="text-muted text-sm">/ día</span>
          </div>
        </div>

        <div class="settings-row">
          <div>
            <label class="settings-label">Límite de repasos diarios</label>
            <p class="settings-desc">Máximo de tarjetas a repasar por sesión diaria.</p>
          </div>
          <div class="flex items-center gap-8">
            <input type="number" class="input" id="s-daily-review" min="10" max="500"
                   value="${s.daily_review_limit}" style="width:80px">
            <span class="text-muted text-sm">/ día</span>
          </div>
        </div>
      </div>

      <!-- ── Flashcards ───────────────────────── -->
      <div class="card">
        <h2 class="settings-section-title">🃏 Flashcards</h2>

        <div class="settings-row">
          <div>
            <label class="settings-label">Volteo automático</label>
            <p class="settings-desc">Voltear la tarjeta automáticamente después de N segundos.</p>
          </div>
          <label class="toggle">
            <input type="checkbox" id="s-autoflip" ${s.autoflip ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-row ${!s.autoflip ? 'settings-row--disabled' : ''}" id="autoflip-delay-row">
          <div>
            <label class="settings-label">Retraso de volteo</label>
            <p class="settings-desc">Segundos antes de voltear automáticamente.</p>
          </div>
          <div class="flex items-center gap-8">
            <input type="number" class="input" id="s-autoflip-delay" min="1" max="30"
                   value="${s.autoflip_delay}" style="width:80px" ${!s.autoflip ? 'disabled' : ''}>
            <span class="text-muted text-sm">seg</span>
          </div>
        </div>
      </div>

      <!-- ── Goals ───────────────────────────── -->
      <div class="card">
        <h2 class="settings-section-title">🎯 Objetivos diarios</h2>
        <p class="text-sm text-muted mb-16">
          Solo de referencia: no bloquea el estudio si no se alcanza.
        </p>

        <div class="settings-row">
          <div>
            <label class="settings-label">Palabras nuevas por día</label>
          </div>
          <div class="flex items-center gap-8">
            <input type="number" class="input" id="s-vocab-goal" min="1" max="200"
                   value="${s.daily_vocab_goal}" style="width:80px">
            <span class="text-muted text-sm">palabras</span>
          </div>
        </div>

        <div class="settings-row">
          <div>
            <label class="settings-label">Kanji nuevos por día</label>
          </div>
          <div class="flex items-center gap-8">
            <input type="number" class="input" id="s-kanji-goal" min="1" max="50"
                   value="${s.daily_kanji_goal}" style="width:80px">
            <span class="text-muted text-sm">kanji</span>
          </div>
        </div>
      </div>

      <!-- ── Exams ───────────────────────────── -->
      <div class="card">
        <h2 class="settings-section-title">📋 Exámenes</h2>

        <div class="settings-row">
          <div>
            <label class="settings-label">Preguntas por defecto</label>
            <p class="settings-desc">Número de preguntas al iniciar un simulacro.</p>
          </div>
          <select class="select" id="s-exam-count" style="width:100px">
            ${[5,10,20,30].map(n =>
              `<option value="${n}" ${s.default_exam_count === n ? 'selected' : ''}>${n}</option>`
            ).join('')}
          </select>
        </div>

        <div class="settings-row">
          <div>
            <label class="settings-label">Modo por defecto</label>
          </div>
          <select class="select" id="s-exam-mode" style="width:140px">
            <option value="practice" ${s.default_exam_mode === 'practice' ? 'selected' : ''}>Práctica</option>
            <option value="exam"     ${s.default_exam_mode === 'exam'     ? 'selected' : ''}>Examen</option>
          </select>
        </div>
      </div>

      <!-- ── Actions ─────────────────────────── -->
      <div class="card" style="background:var(--gray-50)">
        <h2 class="settings-section-title" style="color:var(--danger)">⚠️ Zona de riesgo</h2>
        <div class="settings-row">
          <div>
            <label class="settings-label">Restaurar configuración</label>
            <p class="settings-desc">Vuelve a los valores predeterminados.</p>
          </div>
          <button class="btn btn-outline" id="s-reset">Restaurar</button>
        </div>
      </div>

    </div><!-- /max-width -->

    <style>
      .settings-section-title {
        font-size:.9rem;font-weight:700;margin-bottom:16px;
        padding-bottom:8px;border-bottom:1px solid var(--gray-100);
        color:var(--gray-600);text-transform:uppercase;letter-spacing:.06em;
      }
      .settings-row {
        display:flex;align-items:center;justify-content:space-between;
        gap:16px;padding:12px 0;border-bottom:1px solid var(--gray-100);
      }
      .settings-row:last-child { border-bottom:none; }
      .settings-row--disabled  { opacity:.45;pointer-events:none; }
      .settings-label { font-size:.88rem;font-weight:600;display:block;margin-bottom:2px; }
      .settings-desc  { font-size:.78rem;color:var(--gray-500);margin:0; }

      /* Toggle switch */
      .toggle { position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0; }
      .toggle input { opacity:0;width:0;height:0; }
      .toggle-slider {
        position:absolute;inset:0;background:var(--gray-300);
        border-radius:24px;cursor:pointer;transition:.2s;
      }
      .toggle-slider::before {
        content:'';position:absolute;left:3px;top:3px;
        width:18px;height:18px;background:white;border-radius:50%;transition:.2s;
        box-shadow:0 1px 3px rgba(0,0,0,.2);
      }
      .toggle input:checked + .toggle-slider { background:var(--primary); }
      .toggle input:checked + .toggle-slider::before { transform:translateX(20px); }
    </style>
  `;
}

// ─────────────────────────────────────────────
function bindEvents(container) {
  const save = (key, val) => {
    saveSetting(key, val);
    toast('Configuración guardada', 'success');
  };

  container.querySelector('#s-meaning-language')?.addEventListener('change', e => save('meaning_language', e.target.value));
  container.querySelector('#s-furigana')?.addEventListener('change', e => save('furigana_visible', e.target.checked));
  container.querySelector('#s-romaji')?.addEventListener('change',   e => save('romaji_visible',   e.target.checked));
  container.querySelector('#s-font-size')?.addEventListener('change', e => save('font_size', e.target.value));

  container.querySelector('#s-srs-enabled')?.addEventListener('change', e => save('srs_enabled', e.target.checked));
  container.querySelector('#s-daily-new')?.addEventListener('change',   e => save('daily_new_cards', parseInt(e.target.value)));
  container.querySelector('#s-daily-review')?.addEventListener('change', e => save('daily_review_limit', parseInt(e.target.value)));

  // Autoflip
  const autoflipCb  = container.querySelector('#s-autoflip');
  const delayRow    = container.querySelector('#autoflip-delay-row');
  const delayInput  = container.querySelector('#s-autoflip-delay');

  autoflipCb?.addEventListener('change', e => {
    save('autoflip', e.target.checked);
    if (delayRow)  delayRow.classList.toggle('settings-row--disabled', !e.target.checked);
    if (delayInput) delayInput.disabled = !e.target.checked;
  });
  delayInput?.addEventListener('change', e => save('autoflip_delay', parseInt(e.target.value)));

  container.querySelector('#s-vocab-goal')?.addEventListener('change',  e => save('daily_vocab_goal',  parseInt(e.target.value)));
  container.querySelector('#s-kanji-goal')?.addEventListener('change',  e => save('daily_kanji_goal',  parseInt(e.target.value)));
  container.querySelector('#s-exam-count')?.addEventListener('change',  e => save('default_exam_count', parseInt(e.target.value)));
  container.querySelector('#s-exam-mode')?.addEventListener('change',   e => save('default_exam_mode',  e.target.value));

  container.querySelector('#s-reset')?.addEventListener('click', () => {
    if (confirm('¿Restaurar toda la configuración a valores predeterminados?')) {
      resetSettings();
      render(container);
      toast('Configuración restaurada', 'info');
    }
  });
}
