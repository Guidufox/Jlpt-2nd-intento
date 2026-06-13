<?php
/**
 * JLPT Master - Kanji API
 * GET  /api/kanji.php         → list kanji (with filters)
 * GET  /api/kanji.php?id=N   → single kanji
 * POST /api/kanji.php        → update user progress
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ─────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────
if ($method === 'GET') {

    // Single kanji
    if ($id = param('id')) {
        $stmt = $db->prepare("
            SELECT k.*,
                   COALESCE(uk.status,'new')    AS status,
                   COALESCE(uk.times_seen,0)    AS times_seen,
                   COALESCE(uk.times_correct,0) AS times_correct,
                   uk.last_seen,
                   CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite,
                   sc.next_review, sc.interval_days, sc.ease_factor
            FROM kanji k
            LEFT JOIN user_kanji uk ON uk.kanji_id = k.id
            LEFT JOIN favorites f ON f.item_type='kanji' AND f.item_id = k.id
            LEFT JOIN srs_cards sc ON sc.item_type='kanji' AND sc.item_id = k.id
            WHERE k.id = ?
        ");
        $stmt->execute([(int)$id]);
        $row = $stmt->fetch();
        if (!$row) jsonError('Kanji no encontrado', 404);
        $row['examples'] = json_decode($row['examples'] ?? '[]', true);
        jsonOk($row);
    }

    // Single kanji by character
    if ($char = param('char')) {
        $stmt = $db->prepare("
            SELECT k.*,
                   COALESCE(uk.status,'new') AS status,
                   CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
            FROM kanji k
            LEFT JOIN user_kanji uk ON uk.kanji_id = k.id
            LEFT JOIN favorites f ON f.item_type='kanji' AND f.item_id = k.id
            WHERE k.character = ?
        ");
        $stmt->execute([$char]);
        $row = $stmt->fetch();
        if (!$row) jsonError('Kanji no encontrado', 404);
        $row['examples'] = json_decode($row['examples'] ?? '[]', true);
        jsonOk($row);
    }

    // List
    $level  = sanitizeLevel(param('level'));
    $search = param('search');
    $status = param('status');
    $fav    = param('favorites');
    $p      = pagination();

    $where  = [];
    $params = [];

    if ($level)  { $where[] = 'k.level = ?';  $params[] = $level; }
    if ($status) { $where[] = "COALESCE(uk.status,'new') = ?"; $params[] = $status; }
    if ($fav)    { $where[] = 'f.id IS NOT NULL'; }
    if ($search) {
        $where[]  = '(k.character LIKE ? OR k.onyomi LIKE ? OR k.kunyomi LIKE ? OR k.meaning LIKE ? OR k.meaning_es LIKE ?)';
        $like     = '%' . $search . '%';
        array_push($params, $like, $like, $like, $like, $like);
    }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // Count
    $cStmt = $db->prepare("
        SELECT COUNT(*) FROM kanji k
        LEFT JOIN user_kanji uk ON uk.kanji_id = k.id
        LEFT JOIN favorites f ON f.item_type='kanji' AND f.item_id = k.id
        $whereSQL
    ");
    $cStmt->execute($params);
    $total = (int)$cStmt->fetchColumn();

    $params[] = $p['limit'];
    $params[] = $p['offset'];

    $stmt = $db->prepare("
        SELECT k.id, k.character, k.onyomi, k.kunyomi, k.meaning, k.meaning_es,
               k.level, k.stroke_count, k.radical, k.examples,
               COALESCE(uk.status,'new')    AS status,
               COALESCE(uk.times_seen,0)    AS times_seen,
               COALESCE(uk.times_correct,0) AS times_correct,
               uk.last_seen,
               CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
        FROM kanji k
        LEFT JOIN user_kanji uk ON uk.kanji_id = k.id
        LEFT JOIN favorites f ON f.item_type='kanji' AND f.item_id = k.id
        $whereSQL
        ORDER BY
            CASE k.level WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3 WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 END,
            k.stroke_count, k.id
        LIMIT ? OFFSET ?
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['examples'] = json_decode($row['examples'] ?? '[]', true);
    }

    // Stats
    $statsWhere = $level ? "WHERE k.level = '$level'" : '';
    $stats = $db->query("
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN COALESCE(uk.status,'new')='new'      THEN 1 ELSE 0 END) as new_count,
            SUM(CASE WHEN COALESCE(uk.status,'new')='learning' THEN 1 ELSE 0 END) as learning,
            SUM(CASE WHEN COALESCE(uk.status,'new')='known'    THEN 1 ELSE 0 END) as known,
            SUM(CASE WHEN COALESCE(uk.status,'new')='mastered' THEN 1 ELSE 0 END) as mastered
        FROM kanji k
        LEFT JOIN user_kanji uk ON uk.kanji_id = k.id
        $statsWhere
    ")->fetch();

    jsonOk([
        'items' => $rows,
        'total' => $total,
        'page'  => $p['page'],
        'limit' => $p['limit'],
        'stats' => $stats,
    ]);
}

// ─────────────────────────────────────────────
// POST – update user progress
// ─────────────────────────────────────────────
if ($method === 'POST') {
    $input   = getInput();
    $kanjiId = (int)($input['kanji_id'] ?? 0);
    $status  = $input['status'] ?? 'learning';
    $correct = isset($input['correct']) ? (int)$input['correct'] : 0;

    if (!$kanjiId) jsonError('kanji_id requerido');

    $exists = $db->prepare('SELECT id FROM kanji WHERE id = ?');
    $exists->execute([$kanjiId]);
    if (!$exists->fetch()) jsonError('Kanji no encontrado', 404);

    $validStatuses = ['new','learning','known','mastered'];
    if (!in_array($status, $validStatuses)) $status = 'learning';

    $stmt = $db->prepare("
        INSERT INTO user_kanji (kanji_id, status, times_seen, times_correct, last_seen)
        VALUES (?, ?, 1, ?, datetime('now'))
        ON CONFLICT(kanji_id) DO UPDATE SET
            status        = excluded.status,
            times_seen    = times_seen + 1,
            times_correct = times_correct + excluded.times_correct,
            last_seen     = datetime('now')
    ");
    $stmt->execute([$kanjiId, $status, $correct]);

    jsonOk(['updated' => true, 'kanji_id' => $kanjiId, 'status' => $status]);
}

jsonError('Método no permitido', 405);
