<?php
/**
 * JLPT Master - Vocabulary API
 * GET  /api/vocabulary.php              → list (with filters)
 * GET  /api/vocabulary.php?id=N         → single word
 * POST /api/vocabulary.php              → upsert user progress
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ─────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────
if ($method === 'GET') {

    // Single word
    if ($id = param('id')) {
        $stmt = $db->prepare("
            SELECT v.*,
                   uv.status, uv.times_seen, uv.times_correct, uv.last_seen,
                   CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite,
                   sc.next_review, sc.ease_factor, sc.interval_days, sc.repetitions
            FROM vocabulary v
            LEFT JOIN user_vocabulary uv ON uv.vocabulary_id = v.id
            LEFT JOIN favorites f ON f.item_type='vocabulary' AND f.item_id = v.id
            LEFT JOIN srs_cards sc ON sc.item_type='vocabulary' AND sc.item_id = v.id
            WHERE v.id = ?
        ");
        $stmt->execute([(int)$id]);
        $row = $stmt->fetch();
        if (!$row) jsonError('Palabra no encontrada', 404);
        $row['examples'] = json_decode($row['examples'] ?? '[]', true);
        jsonOk($row);
    }

    // List with filters
    $level    = sanitizeLevel(param('level'));
    $category = param('category');
    $search   = param('search');
    $status   = param('status');       // new|learning|known|mastered
    $fav      = param('favorites');    // 1
    $srsMode  = param('srs');          // 1 → only due cards
    $p        = pagination();

    $where  = [];
    $params = [];

    if ($level)    { $where[] = 'v.level = ?';    $params[] = $level; }
    if ($category) { $where[] = 'v.category = ?'; $params[] = $category; }
    if ($search)   {
        $where[]  = '(v.kanji LIKE ? OR v.kana LIKE ? OR v.meaning_es LIKE ? OR v.meaning_en LIKE ?)';
        $like     = '%' . $search . '%';
        array_push($params, $like, $like, $like, $like);
    }
    if ($status)   { $where[] = 'COALESCE(uv.status,\'new\') = ?'; $params[] = $status; }
    if ($fav)      { $where[] = 'f.id IS NOT NULL'; }
    if ($srsMode)  { $where[] = "sc.next_review <= datetime('now')"; }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // Count
    $countSQL = "
        SELECT COUNT(*) FROM vocabulary v
        LEFT JOIN user_vocabulary uv ON uv.vocabulary_id = v.id
        LEFT JOIN favorites f ON f.item_type='vocabulary' AND f.item_id = v.id
        LEFT JOIN srs_cards sc ON sc.item_type='vocabulary' AND sc.item_id = v.id
        $whereSQL
    ";
    $cStmt = $db->prepare($countSQL);
    $cStmt->execute($params);
    $total = (int)$cStmt->fetchColumn();

    // Data
    $sql = "
        SELECT v.id, v.kanji, v.kana, v.furigana, v.meaning_es, v.meaning_en,
               v.level, v.category, v.frequency, v.examples, v.notes,
               COALESCE(uv.status,'new')    AS status,
               COALESCE(uv.times_seen,0)    AS times_seen,
               COALESCE(uv.times_correct,0) AS times_correct,
               uv.last_seen,
               CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite,
               sc.next_review, sc.interval_days
        FROM vocabulary v
        LEFT JOIN user_vocabulary uv ON uv.vocabulary_id = v.id
        LEFT JOIN favorites f ON f.item_type='vocabulary' AND f.item_id = v.id
        LEFT JOIN srs_cards sc ON sc.item_type='vocabulary' AND sc.item_id = v.id
        $whereSQL
        ORDER BY v.level, v.frequency DESC
        LIMIT ? OFFSET ?
    ";
    $params[] = $p['limit'];
    $params[] = $p['offset'];

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['examples'] = json_decode($row['examples'] ?? '[]', true);
    }

    // Stats summary (per level if no level filter)
    $statsLevel = $level ?? 'ALL';
    $statsWhere = $level ? "WHERE v.level = '$level'" : '';
    $stats = $db->query("
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN COALESCE(uv.status,'new')='new'      THEN 1 ELSE 0 END) as new_count,
            SUM(CASE WHEN COALESCE(uv.status,'new')='learning' THEN 1 ELSE 0 END) as learning,
            SUM(CASE WHEN COALESCE(uv.status,'new')='known'    THEN 1 ELSE 0 END) as known,
            SUM(CASE WHEN COALESCE(uv.status,'new')='mastered' THEN 1 ELSE 0 END) as mastered
        FROM vocabulary v
        LEFT JOIN user_vocabulary uv ON uv.vocabulary_id = v.id
        $statsWhere
    ")->fetch();

    jsonOk([
        'items'    => $rows,
        'total'    => $total,
        'page'     => $p['page'],
        'limit'    => $p['limit'],
        'stats'    => $stats,
    ]);
}

// ─────────────────────────────────────────────
// POST – update user progress on a word
// ─────────────────────────────────────────────
if ($method === 'POST') {
    $input  = getInput();
    $vocabId = (int)($input['vocabulary_id'] ?? 0);
    $status  = $input['status'] ?? 'learning';
    $correct = isset($input['correct']) ? (int)$input['correct'] : null;

    if (!$vocabId) jsonError('vocabulary_id requerido');

    // Validate vocab exists
    $exists = $db->prepare('SELECT id FROM vocabulary WHERE id = ?');
    $exists->execute([$vocabId]);
    if (!$exists->fetch()) jsonError('Palabra no encontrada', 404);

    // Valid statuses
    $validStatuses = ['new','learning','known','mastered'];
    if (!in_array($status, $validStatuses)) $status = 'learning';

    // Upsert user_vocabulary
    $stmt = $db->prepare("
        INSERT INTO user_vocabulary (vocabulary_id, status, times_seen, times_correct, last_seen)
        VALUES (?, ?, 1, ?, datetime('now'))
        ON CONFLICT(vocabulary_id) DO UPDATE SET
            status        = excluded.status,
            times_seen    = times_seen + 1,
            times_correct = times_correct + COALESCE(excluded.times_correct, 0),
            last_seen     = datetime('now')
    ");
    $stmt->execute([$vocabId, $status, $correct ?? 0]);

    // Log study session touch
    $db->prepare("
        UPDATE study_sessions SET items_studied = items_studied + 1
        WHERE module = 'vocabulary' AND date(created_at) = date('now')
    ")->execute();

    jsonOk(['updated' => true, 'vocabulary_id' => $vocabId, 'status' => $status]);
}

jsonError('Método no permitido', 405);
