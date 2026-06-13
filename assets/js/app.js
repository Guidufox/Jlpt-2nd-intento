/**
 * JLPT Master — Main Application
 * Hash-based SPA router.  Entry point loaded by index.html.
 *
 * Routes
 *  #/                    → Home
 *  #/dashboard           → Dashboard
 *  #/vocabulary          → Vocabulary (all levels)
 *  #/vocabulary/N5       → Vocabulary filtered to N5
 *  #/vocabulary/N5/flashcards → Vocabulary flashcard mode
 *  #/grammar             → Grammar
 *  #/grammar/N3          → Grammar N3
 *  #/grammar/42          → Grammar detail (numeric id)
 *  #/kanji               → Kanji
 *  #/kanji/N4            → Kanji N4
 *  #/theory              → Theory articles
 *  #/theory/2            → Theory article detail
 *  #/exams               → Exams setup
 *  #/srs                 → SRS review
 *  #/intensive           → Intensive preparation guide
 *  #/favorites           → Favorites list
 */

import { refreshSRSBadge, favAPI } from './api.js';
import { toast, showLoading, levelBadge, escapeHtml } from './shared/utils.js';
import { applySettings, getSettings }               from './modules/settings.js';

// Lazy module imports
const modules = {
  dashboard:  () => import('./modules/dashboard.js'),
  vocabulary: () => import('./modules/vocabulary.js'),
  grammar:    () => import('./modules/grammar.js'),
  kanji:      () => import('./modules/kanji.js'),
  theory:     () => import('./modules/theory.js'),
  exams:      () => import('./modules/exams.js'),
  srs:        () => import('./modules/srs.js'),
  settings:   () => import('./modules/settings.js'),
};

// ─────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────
const content  = document.getElementById('main-content');
const topTitle = document.getElementById('topbar-title');

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '') || '';
  const parts = hash.split('/').filter(Boolean);
  return parts;
}

async function handleRoute() {
  const parts  = parseHash();
  const route  = parts[0] ?? 'home';

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(a => {
    const r = a.dataset.route;
    a.classList.toggle('active', r === route);
  });

  // Update level pills
  const levelPart = parts.find(p => /^N[1-5]$/.test(p));
  document.querySelectorAll('.level-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === levelPart);
  });

  switch (route) {
    case 'home':
    case '':
      topTitle.textContent = 'JLPT Master';
      renderHome();
      break;

    case 'dashboard':
      topTitle.textContent = 'Dashboard';
      await loadModule('dashboard', content, {});
      break;

    case 'vocabulary': {
      const level = parts[1]?.match(/^N[1-5]$/) ? parts[1] : null;
      const view  = parts[2] ?? 'list';
      topTitle.textContent = `Vocabulario${level ? ' — ' + level : ''}`;
      await loadModule('vocabulary', content, { level, view });
      break;
    }

    case 'grammar': {
      // Could be /grammar, /grammar/N3, /grammar/42 (detail)
      const second = parts[1];
      if (second && /^\d+$/.test(second)) {
        // numeric → detail
        topTitle.textContent = 'Gramática — Detalle';
        await loadModule('grammar', content, { id: second });
      } else {
        const level = second?.match(/^N[1-5]$/) ? second : null;
        topTitle.textContent = `Gramática${level ? ' — ' + level : ''}`;
        await loadModule('grammar', content, { level });
      }
      break;
    }

    case 'kanji': {
      const level = parts[1]?.match(/^N[1-5]$/) ? parts[1] : null;
      const view  = parts[2] ?? 'grid';
      topTitle.textContent = `Kanji${level ? ' — ' + level : ''}`;
      await loadModule('kanji', content, { level, view });
      break;
    }

    case 'theory': {
      const second = parts[1];
      if (second && /^\d+$/.test(second)) {
        topTitle.textContent = 'Teoría — Artículo';
        await loadModule('theory', content, { id: second });
      } else {
        const level = second?.match(/^N[1-5]$/) ? second : null;
        topTitle.textContent = 'Teoría';
        await loadModule('theory', content, { level });
      }
      break;
    }

    case 'exams': {
      const level = parts[1]?.match(/^N[1-5]$/) ? parts[1] : null;
      topTitle.textContent = 'Simulacros JLPT';
      await loadModule('exams', content, { level });
      break;
    }

    case 'srs':
      topTitle.textContent = 'Repaso SRS';
      await loadModule('srs', content, {});
      break;

    case 'intensive':
      topTitle.textContent = 'Preparación Intensiva';
      renderIntensive();
      break;

    case 'favorites':
      topTitle.textContent = 'Favoritos';
      await renderFavorites();
      break;

    case 'settings':
      topTitle.textContent = 'Configuración';
      await loadModule('settings', content, {});
      break;

    default:
      topTitle.textContent = 'No encontrado';
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div>
        <p>Página no encontrada.</p><a href="#/" class="btn btn-primary mt-16">← Inicio</a></div>`;
  }
}

async function loadModule(name, container, params) {
  showLoading(container);
  try {
    const mod = await modules[name]();
    await mod.render(container, params);
  } catch (err) {
    console.error(`Module ${name} error:`, err);
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div>
      <p>Error al cargar el módulo.<br><small>${escapeHtml(err.message)}</small></p></div>`;
  }
}

// ─────────────────────────────────────────────
// Home Screen
// ─────────────────────────────────────────────
function renderHome() {
  const modules = [
    { icon: '📖', title: 'Vocabulario',        desc: 'Aprende palabras esenciales por nivel y categoría.',   route: 'vocabulary' },
    { icon: '📝', title: 'Gramática',           desc: 'Patrones gramaticales con ejemplos y estructura.',      route: 'grammar'    },
    { icon: '漢', title: 'Kanji',              desc: 'Caracteres chino-japoneses con lecturas y ejemplos.',   route: 'kanji'      },
    { icon: '📚', title: 'Teoría',             desc: 'Biblioteca de referencia gramatical y cultural.',       route: 'theory'     },
    { icon: '📋', title: 'Simulacros JLPT',    desc: 'Preguntas tipo examen con corrección y puntuación.',   route: 'exams'      },
    { icon: '🎯', title: 'Preparación Intensiva', desc: 'Guías y estrategias para maximizar tu puntuación.', route: 'intensive'  },
  ];

  content.innerHTML = `
    <!-- Welcome -->
    <div class="home-welcome">
      <h1>🇯🇵 JLPT Master</h1>
      <p>Plataforma completa de preparación para el Japanese Language Proficiency Test</p>
      <p style="margin-top:8px;opacity:.7;font-size:.88rem">
        N5 → N4 → N3 → N2 → N1 &nbsp;·&nbsp; Vocabulario · Gramática · Kanji · Exámenes · SRS
      </p>
    </div>

    <!-- Module grid -->
    <h2 style="font-size:1rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;
               letter-spacing:.08em;margin-bottom:14px">¿Qué deseas estudiar?</h2>
    <div class="module-grid mb-32">
      ${modules.map(m => `
        <a class="module-card" href="#/${m.route}">
          <div class="module-icon">${m.icon}</div>
          <h3>${m.title}</h3>
          <p>${m.desc}</p>
          <div class="module-levels">
            ${['N5','N4','N3','N2','N1'].map(lv =>
              `<span class="level-badge ${lv.toLowerCase()}">${lv}</span>`
            ).join('')}
          </div>
        </a>`).join('')}
    </div>

    <!-- Level quick access -->
    <h2 style="font-size:1rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;
               letter-spacing:.08em;margin-bottom:14px">Acceso rápido por nivel</h2>
    <div class="level-selector">
      <div class="level-buttons">
        ${[
          { lv: 'N5', desc: 'Principiante · ~800 palabras' },
          { lv: 'N4', desc: 'Elemental · ~1500 palabras' },
          { lv: 'N3', desc: 'Intermedio · ~3750 palabras' },
          { lv: 'N2', desc: 'Avanzado · ~6000 palabras' },
          { lv: 'N1', desc: 'Experto · ~10000 palabras' },
        ].map(({lv, desc}) => `
          <div>
            <button class="level-btn ${lv.toLowerCase()}" data-home-level="${lv}">${lv}</button>
            <p class="text-xs text-muted mt-4">${desc}</p>
          </div>`).join('')}
      </div>
    </div>

    <!-- SRS reminder if due -->
    <div id="home-srs-prompt"></div>
  `;

  // Level buttons → vocabulary for that level
  content.querySelectorAll('[data-home-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = `#/vocabulary/${btn.dataset.homeLevel}`;
    });
  });

  // SRS prompt
  refreshSRSBadge().then(due => {
    const el = document.getElementById('home-srs-prompt');
    if (el && due > 0) {
      el.innerHTML = `
        <div class="card mt-24" style="border-left:4px solid var(--warning);background:var(--warning-light)">
          <div class="flex items-center gap-12">
            <span style="font-size:1.5rem">🔄</span>
            <div>
              <strong>${due} tarjeta${due !== 1 ? 's' : ''} SRS pendiente${due !== 1 ? 's' : ''}</strong>
              <p class="text-sm text-muted">Tienes tarjetas listas para repasar ahora</p>
            </div>
            <a href="#/srs" class="btn btn-primary ml-auto">Repasar →</a>
          </div>
        </div>`;
    }
  });
}

// ─────────────────────────────────────────────
// Intensive Preparation
// ─────────────────────────────────────────────
function renderIntensive() {
  content.innerHTML = `
    <div class="page-header">
      <h1>🎯 Preparación Intensiva JLPT</h1>
      <p>Estrategias y plan de estudio para maximizar tu puntuación.</p>
    </div>

    <div style="max-width:780px">

      <div class="card mb-16">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:12px">📅 Plan de estudio recomendado</h2>
        <div class="grid-2 gap-12">
          ${[
            { emoji:'🌅', time:'Mañana (15-20 min)', tasks:['Repaso SRS (tarjetas del día)','5-10 kanji nuevos'] },
            { emoji:'📖', time:'Tarde (20-30 min)',   tasks:['Vocabulario nuevo (10-15 palabras)','1-2 puntos gramaticales'] },
            { emoji:'🌙', time:'Noche (15-20 min)',   tasks:['Simulacro de 10 preguntas','Revisar errores y anotarlos'] },
            { emoji:'📋', time:'Fin de semana',        tasks:['Simulacro completo (30 preguntas)','Repasar teoría débil'] },
          ].map(b => `
            <div class="card card-sm" style="background:var(--gray-50)">
              <div style="font-size:1.4rem;margin-bottom:6px">${b.emoji}</div>
              <strong style="font-size:.88rem">${b.time}</strong>
              <ul style="list-style:disc;padding-left:16px;margin-top:6px">
                ${b.tasks.map(t => `<li class="text-sm text-muted">${t}</li>`).join('')}
              </ul>
            </div>`).join('')}
        </div>
      </div>

      <div class="card mb-16">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:12px">🎯 Estrategias por sección</h2>
        ${[
          { title:'知識問題 (Vocabulario y Gramática)', color:'var(--primary)', tips:[
            'Memoriza vocabulario de alta frecuencia primero.',
            'Aprende los patrones gramaticales en contexto, no de memoria aislada.',
            'Usa el SRS para espaciar correctamente la repetición.',
            'Practica identificar la opción incorrecta, no solo la correcta.',
          ]},
          { title:'読解 (Comprensión lectora)', color:'var(--n3)', tips:[
            'Lee la pregunta ANTES de leer el texto completo.',
            'Busca las palabras clave en el texto.',
            'No necesitas entender todo — identifica el tema principal.',
            'Practica con textos cortos primero y aumenta la dificultad.',
          ]},
          { title:'聴解 (Comprensión auditiva)', color:'var(--n2)', tips:[
            'El audio se reproduce una sola vez. Presta atención desde el principio.',
            'Lee las opciones mientras escuchas para anticipar la respuesta.',
            'Anota palabras clave mientras escuchas.',
            'Practica con podcasts y audio japonés lento.',
          ]},
        ].map(s => `
          <div style="border-left:4px solid ${s.color};padding:12px 16px;margin-bottom:12px;border-radius:0 8px 8px 0;background:var(--gray-50)">
            <strong style="color:${s.color}">${s.title}</strong>
            <ul style="list-style:disc;padding-left:16px;margin-top:8px">
              ${s.tips.map(t => `<li class="text-sm mt-4">${t}</li>`).join('')}
            </ul>
          </div>`).join('')}
      </div>

      <div class="card mb-16">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:12px">📊 Puntuación mínima por sección</h2>
        <div style="overflow-x:auto">
          <table class="vocab-table">
            <thead><tr><th>Nivel</th><th>Total</th><th>Conocimiento</th><th>Lectura</th><th>Escucha</th></tr></thead>
            <tbody>
              ${[
                {lv:'N5',total:'80/180',con:'38/120',lec:'19/60',esc:'19/60'},
                {lv:'N4',total:'90/180',con:'38/120',lec:'19/60',esc:'19/60'},
                {lv:'N3',total:'95/180',con:'19/60', lec:'19/60',esc:'19/60'},
                {lv:'N2',total:'90/180',con:'19/60', lec:'19/60',esc:'19/60'},
                {lv:'N1',total:'100/180',con:'19/60',lec:'19/60',esc:'19/60'},
              ].map(r => `
                <tr>
                  <td>${levelBadge(r.lv)}</td>
                  <td class="font-bold">${r.total}</td>
                  <td>${r.con}</td><td>${r.lec}</td><td>${r.esc}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted mt-8">* Debes superar el mínimo en CADA sección para aprobar.</p>
      </div>

      <div class="grid-2 gap-12">
        <a href="#/vocabulary" class="btn btn-primary btn-lg" style="justify-content:center">📖 Estudiar vocabulario</a>
        <a href="#/exams"      class="btn btn-outline btn-lg" style="justify-content:center">📋 Hacer simulacro</a>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────
// Favorites page
// ─────────────────────────────────────────────
async function renderFavorites() {
  showLoading(content);
  try {
    const data = await favAPI.list({});
    const items = data.items ?? [];

    if (!items.length) {
      content.innerHTML = `
        <div class="page-header"><h1>⭐ Favoritos</h1></div>
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <p>No tienes favoritos todavía.<br>Añade palabras, kanji o gramática marcando ☆.</p>
        </div>`;
      return;
    }

    const vocab   = items.filter(i => i.item_type === 'vocabulary');
    const kanji   = items.filter(i => i.item_type === 'kanji');
    const grammar = items.filter(i => i.item_type === 'grammar');

    content.innerHTML = `
      <div class="page-header">
        <h1>⭐ Favoritos</h1>
        <p>${items.length} elemento${items.length !== 1 ? 's' : ''} guardado${items.length !== 1 ? 's' : ''}</p>
      </div>

      ${vocab.length ? `
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px">📖 Vocabulario (${vocab.length})</h2>
        <div class="vocab-card-grid mb-24">
          ${vocab.map(w => `
            <div class="vocab-card" data-type="vocabulary" data-id="${w.item_id}" style="cursor:default">
              <div class="word-jp jp-text">${escapeHtml(w.kanji || w.kana)}</div>
              <div class="word-kana jp-text">${escapeHtml(w.kana || '')}</div>
              <div class="word-meaning">${escapeHtml(w.meaning_es)}</div>
              <div class="card-footer">
                ${levelBadge(w.level)}
                <button class="btn-ghost btn-sm ml-auto" data-remove="vocabulary" data-id="${w.item_id}">🗑 Quitar</button>
              </div>
            </div>`).join('')}
        </div>` : ''}

      ${kanji.length ? `
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px">漢 Kanji (${kanji.length})</h2>
        <div class="kanji-grid mb-24">
          ${kanji.map(k => `
            <div class="kanji-tile" style="cursor:default">
              <span class="kanji-char jp-text">${escapeHtml(k.kanji)}</span>
              <span class="kanji-meaning">${escapeHtml((k.meaning_es ?? '').slice(0, 10))}</span>
              ${levelBadge(k.level)}
              <button class="btn-ghost" data-remove="kanji" data-id="${k.item_id}"
                      style="font-size:.65rem;position:absolute;bottom:4px;right:4px">🗑</button>
            </div>`).join('')}
        </div>` : ''}

      ${grammar.length ? `
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px">📝 Gramática (${grammar.length})</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:24px">
          ${grammar.map(g => `
            <div class="grammar-card" style="cursor:default">
              <div class="gp-pattern jp-text">${escapeHtml(g.kanji)}</div>
              <div class="gp-expl">${escapeHtml(g.meaning_es ?? '')}</div>
              <div style="display:flex;align-items:center;margin-top:10px">
                ${levelBadge(g.level)}
                <button class="btn-ghost btn-sm ml-auto" data-remove="grammar" data-id="${g.item_id}">🗑 Quitar</button>
              </div>
            </div>`).join('')}
        </div>` : ''}
    `;

    // Remove favorites
    content.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await favAPI.toggle({ item_type: btn.dataset.remove, item_id: parseInt(btn.dataset.id) });
        toast('Eliminado de favoritos', 'success');
        await renderFavorites();
      });
    });
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><p>Error: ${escapeHtml(err.message)}</p></div>`;
  }
}

// ─────────────────────────────────────────────
// Sidebar & mobile nav
// ─────────────────────────────────────────────
function initNav() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const toggle   = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('sidebar-close');

  const openSidebar  = () => { sidebar.classList.add('open'); overlay.classList.add('active'); };
  const closeSidebar = () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); };

  toggle?.addEventListener('click',   openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click',  closeSidebar);

  // Close sidebar on nav click (mobile)
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => { if (window.innerWidth < 768) closeSidebar(); });
  });

  // Level pills in topbar
  document.querySelectorAll('.level-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const parts   = parseHash();
      const module  = parts[0] || 'vocabulary';
      const allowed = ['vocabulary','grammar','kanji','exams'];
      const target  = allowed.includes(module) ? module : 'vocabulary';
      window.location.hash = `#/${target}/${btn.dataset.level}`;
    });
  });
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
function init() {
  // Apply saved display settings before first render
  applySettings(getSettings());

  initNav();

  window.addEventListener('hashchange', handleRoute);
  handleRoute();   // initial render

  // Poll SRS badge every 5 minutes
  refreshSRSBadge();
  setInterval(refreshSRSBadge, 5 * 60 * 1000);
}

init();
