<?php
/**
 * JLPT Master - Grammar API
 * GET  /api/grammar.php          → list grammar points
 * GET  /api/grammar.php?id=N     → single grammar point
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

if ($method !== 'GET') jsonError('Método no permitido', 405);

// ─────────────────────────────────────────────
// Single grammar point
// ─────────────────────────────────────────────
if ($id = param('id')) {
    $stmt = $db->prepare("
        SELECT gp.*,
               CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
        FROM grammar_points gp
        LEFT JOIN favorites f ON f.item_type='grammar' AND f.item_id = gp.id
        WHERE gp.id = ?
    ");
    $stmt->execute([(int)$id]);
    $row = $stmt->fetch();
    if (!$row) jsonError('Punto gramatical no encontrado', 404);

    $row['examples']     = json_decode($row['examples']     ?? '[]', true);
    $row['related_ids']  = json_decode($row['related_ids']  ?? '[]', true);

    // Related grammar (load full objects)
    if (!empty($row['related_ids'])) {
        $placeholders = implode(',', array_fill(0, count($row['related_ids']), '?'));
        $rel = $db->prepare("SELECT id, title, pattern, level FROM grammar_points WHERE id IN ($placeholders)");
        $rel->execute($row['related_ids']);
        $row['related'] = $rel->fetchAll();
    } else {
        $row['related'] = [];
    }

    jsonOk($row);
}

// ─────────────────────────────────────────────
// List grammar points
// ─────────────────────────────────────────────
$level    = sanitizeLevel(param('level'));
$category = param('category');
$search   = param('search');
$fav      = param('favorites');
$p        = pagination();

$where  = [];
$params = [];

if ($level)    { $where[] = 'gp.level = ?';    $params[] = $level; }
if ($category) { $where[] = 'gp.category = ?'; $params[] = $category; }
if ($search)   {
    $where[] = '(gp.title LIKE ? OR gp.pattern LIKE ? OR gp.explanation_es LIKE ?)';
    $like    = '%' . $search . '%';
    array_push($params, $like, $like, $like);
}
if ($fav) { $where[] = 'f.id IS NOT NULL'; }

$whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

// Count
$cStmt = $db->prepare("
    SELECT COUNT(*) FROM grammar_points gp
    LEFT JOIN favorites f ON f.item_type='grammar' AND f.item_id = gp.id
    $whereSQL
");
$cStmt->execute($params);
$total = (int)$cStmt->fetchColumn();

// Data
$params[] = $p['limit'];
$params[] = $p['offset'];

$stmt = $db->prepare("
    SELECT gp.id, gp.title, gp.pattern, gp.explanation_es, gp.structure,
           gp.level, gp.category, gp.examples, gp.notes,
           CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
    FROM grammar_points gp
    LEFT JOIN favorites f ON f.item_type='grammar' AND f.item_id = gp.id
    $whereSQL
    ORDER BY
        CASE gp.level WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3 WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 END,
        gp.id
    LIMIT ? OFFSET ?
");
$stmt->execute($params);
$rows = $stmt->fetchAll();

foreach ($rows as &$row) {
    $row['examples'] = json_decode($row['examples'] ?? '[]', true);
}

// Categories available for this level
$catParams = $level ? [$level] : [];
$catWhere  = $level ? 'WHERE level = ?' : '';
$categories = $db->prepare("SELECT DISTINCT category FROM grammar_points $catWhere ORDER BY category");
$categories->execute($catParams);
$catList = $categories->fetchAll(PDO::FETCH_COLUMN);

jsonOk([
    'items'      => $rows,
    'total'      => $total,
    'page'       => $p['page'],
    'limit'      => $p['limit'],
    'categories' => $catList,
]);
