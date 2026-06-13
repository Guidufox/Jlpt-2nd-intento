-- JLPT Master Platform - Database Schema
-- SQLite 3 | UTF-8 | WAL mode

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA encoding = 'UTF-8';

-- ─────────────────────────────────────────────
-- CONTENT TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vocabulary (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji        TEXT,
    kana         TEXT    NOT NULL,
    furigana     TEXT,
    meaning_es   TEXT    NOT NULL,
    meaning_en   TEXT,
    level        TEXT    NOT NULL CHECK(level IN ('N5','N4','N3','N2','N1')),
    category     TEXT    DEFAULT 'sustantivo',
    frequency    INTEGER DEFAULT 0,
    examples     TEXT    DEFAULT '[]',  -- JSON array
    notes        TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vocab_level    ON vocabulary(level);
CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabulary(category);
CREATE INDEX IF NOT EXISTS idx_vocab_kana     ON vocabulary(kana);

-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kanji (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character    TEXT    NOT NULL UNIQUE,
    onyomi       TEXT,
    kunyomi      TEXT,
    meaning      TEXT    NOT NULL,
    meaning_es   TEXT,
    examples     TEXT    DEFAULT '[]',  -- JSON array
    level        TEXT    NOT NULL CHECK(level IN ('N5','N4','N3','N2','N1')),
    stroke_count INTEGER,
    radical      TEXT,
    notes        TEXT
);

CREATE INDEX IF NOT EXISTS idx_kanji_level ON kanji(level);

-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grammar_points (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          TEXT    NOT NULL,
    pattern        TEXT    NOT NULL,
    explanation    TEXT    NOT NULL,
    explanation_es TEXT,
    structure      TEXT,
    examples       TEXT    DEFAULT '[]',  -- JSON array
    level          TEXT    NOT NULL CHECK(level IN ('N5','N4','N3','N2','N1')),
    category       TEXT    DEFAULT 'general',
    notes          TEXT,
    related_ids    TEXT    DEFAULT '[]'   -- JSON array of IDs
);

CREATE INDEX IF NOT EXISTS idx_grammar_level    ON grammar_points(level);
CREATE INDEX IF NOT EXISTS idx_grammar_category ON grammar_points(category);

-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS theory_articles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    content     TEXT    NOT NULL,
    level       TEXT    CHECK(level IN ('N5','N4','N3','N2','N1','ALL')) DEFAULT 'ALL',
    category    TEXT    DEFAULT 'general',
    order_index INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_theory_level    ON theory_articles(level);
CREATE INDEX IF NOT EXISTS idx_theory_category ON theory_articles(category);

-- ─────────────────────────────────────────────
-- EXAM TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exam_questions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT    NOT NULL,
    question_type TEXT    NOT NULL CHECK(question_type IN ('vocabulary','grammar','kanji','reading','listening')),
    level         TEXT    NOT NULL CHECK(level IN ('N5','N4','N3','N2','N1')),
    correct_answer TEXT   NOT NULL,
    explanation   TEXT,
    difficulty    INTEGER DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_q_level ON exam_questions(level);
CREATE INDEX IF NOT EXISTS idx_q_type  ON exam_questions(question_type);

CREATE TABLE IF NOT EXISTS exam_options (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id  INTEGER NOT NULL,
    option_text  TEXT    NOT NULL,
    option_label TEXT    NOT NULL CHECK(option_label IN ('A','B','C','D')),
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opt_question ON exam_options(question_id);

-- ─────────────────────────────────────────────
-- USER PROGRESS TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_vocabulary (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    vocabulary_id INTEGER NOT NULL UNIQUE,
    status        TEXT    DEFAULT 'new' CHECK(status IN ('new','learning','known','mastered')),
    times_seen    INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_seen     DATETIME,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_kanji (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id      INTEGER NOT NULL UNIQUE,
    status        TEXT    DEFAULT 'new' CHECK(status IN ('new','learning','known','mastered')),
    times_seen    INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_seen     DATETIME,
    FOREIGN KEY (kanji_id) REFERENCES kanji(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- SRS TABLE (SM-2 Algorithm)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS srs_cards (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type    TEXT    NOT NULL CHECK(item_type IN ('vocabulary','kanji')),
    item_id      INTEGER NOT NULL,
    repetitions  INTEGER DEFAULT 0,
    ease_factor  REAL    DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    next_review  DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_review  DATETIME,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_srs_next_review ON srs_cards(next_review);
CREATE INDEX IF NOT EXISTS idx_srs_type        ON srs_cards(item_type);

-- ─────────────────────────────────────────────
-- SESSION & HISTORY TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exam_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    level           TEXT,
    exam_type       TEXT,
    mode            TEXT    CHECK(mode IN ('exam','practice')) DEFAULT 'practice',
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    time_taken      INTEGER DEFAULT 0,
    score           REAL    DEFAULT 0,
    completed_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    user_answer TEXT,
    is_correct  INTEGER DEFAULT 0,
    time_taken  INTEGER DEFAULT 0,
    FOREIGN KEY (session_id)  REFERENCES exam_sessions(id)  ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id)
);

CREATE TABLE IF NOT EXISTS favorites (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type  TEXT    NOT NULL CHECK(item_type IN ('vocabulary','kanji','grammar')),
    item_id    INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_type, item_id)
);

CREATE TABLE IF NOT EXISTS study_sessions (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    module           TEXT    NOT NULL,
    level            TEXT,
    items_studied    INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
