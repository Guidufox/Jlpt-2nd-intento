/**
 * JLPT Master — API Client
 * Central HTTP layer for all backend calls.
 */

const BASE = 'api';

// ─────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────

async function request(endpoint, params = {}, options = {}) {
  const url = new URL(`${BASE}/${endpoint}`, window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/'));

  // GET params
  if (options.method !== 'POST' && options.method !== 'PUT') {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
    });
  }

  const init = {
    method:  options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  if (['POST', 'PUT', 'DELETE'].includes(init.method)) {
    init.body = JSON.stringify(params);
  }

  try {
    const res  = await fetch(url.toString(), init);
    const json = await res.json();

    if (!json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
    return json.data;
  } catch (err) {
    console.error(`[API] ${endpoint}`, err);
    throw err;
  }
}

const get  = (ep, params)  => request(ep, params, { method: 'GET' });
const post = (ep, body)    => request(ep, body,   { method: 'POST' });

// ─────────────────────────────────────────────
// Vocabulary
// ─────────────────────────────────────────────

export const vocabAPI = {
  list:       (params)         => get('vocabulary.php', params),
  get:        (id)             => get('vocabulary.php', { id }),
  update:     (body)           => post('vocabulary.php', body),
};

// ─────────────────────────────────────────────
// Grammar
// ─────────────────────────────────────────────

export const grammarAPI = {
  list:  (params) => get('grammar.php', params),
  get:   (id)     => get('grammar.php', { id }),
};

// ─────────────────────────────────────────────
// Kanji
// ─────────────────────────────────────────────

export const kanjiAPI = {
  list:   (params) => get('kanji.php', params),
  get:    (id)     => get('kanji.php', { id }),
  update: (body)   => post('kanji.php', body),
};

// ─────────────────────────────────────────────
// Theory
// ─────────────────────────────────────────────

export const theoryAPI = {
  list: (params) => get('theory.php', params),
  get:  (id)     => get('theory.php', { id }),
};

// ─────────────────────────────────────────────
// Exams
// ─────────────────────────────────────────────

export const examAPI = {
  questions: (params) => get('exams.php',  { action: 'questions', ...params }),
  sessions:  (params) => get('exams.php',  { action: 'sessions',  ...params }),
  session:   (id)     => get('exams.php',  { action: 'session', id }),
  start:     (body)   => post('exams.php?action=start',  body),
  answer:    (body)   => post('exams.php?action=answer', body),
  finish:    (body)   => post('exams.php?action=finish', body),
};

// ─────────────────────────────────────────────
// SRS
// ─────────────────────────────────────────────

export const srsAPI = {
  due:    (params) => get('srs.php', { action: 'due', ...params }),
  stats:  ()       => get('srs.php', { action: 'stats' }),
  add:    (body)   => post('srs.php?action=add',    body),
  review: (body)   => post('srs.php?action=review', body),
  remove: (body)   => post('srs.php?action=remove', body),
};

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export const dashboardAPI = {
  summary: () => get('dashboard.php', { action: 'summary' }),
  history: () => get('dashboard.php', { action: 'history' }),
};

// ─────────────────────────────────────────────
// Favorites
// ─────────────────────────────────────────────

export const favAPI = {
  list:   (params) => get('favorites.php', params),
  toggle: (body)   => post('favorites.php', body),
};

// ─────────────────────────────────────────────
// Progress / Study sessions
// ─────────────────────────────────────────────

export const progressAPI = {
  log:     (body)   => post('progress.php?action=log',    body),
  today:   ()       => get('progress.php', { action: 'today'   }),
  streak:  ()       => get('progress.php', { action: 'streak'  }),
  weekly:  ()       => get('progress.php', { action: 'weekly'  }),
  totals:  ()       => get('progress.php', { action: 'totals'  }),
};

// ─────────────────────────────────────────────
// SRS badge (global, polled)
// ─────────────────────────────────────────────

export async function refreshSRSBadge() {
  try {
    const stats = await srsAPI.stats();
    const due   = parseInt(stats?.due_now ?? 0);
    const badge = document.getElementById('srs-badge');
    const mini  = document.getElementById('srs-mini');
    const count = document.getElementById('srs-due-count');

    if (badge) {
      badge.textContent = due;
      badge.style.display = due > 0 ? 'inline-block' : 'none';
    }
    if (mini && count) {
      count.textContent = due;
      mini.style.display = due > 0 ? 'block' : 'none';
    }
    return due;
  } catch { return 0; }
}
