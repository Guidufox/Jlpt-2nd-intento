<?php
/**
 * JLPT Master - Theory API
 * GET /api/theory.php        → list articles
 * GET /api/theory.php?id=N  → single article
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Método no permitido', 405);

$db = getDB();

// Single article
if ($id = param('id')) {
    $stmt = $db->prepare('SELECT * FROM theory_articles WHERE id = ?');
    $stmt->execute([(int)$id]);
    $row = $stmt->fetch();
    if (!$row) jsonError('Artículo no encontrado', 404);
    jsonOk($row);
}

// List articles
$level    = param('level');   // may include 'ALL'
$category = param('category');
$p        = pagination();

$where  = [];
$params = [];

if ($level && $level !== 'ALL') {
    $where[] = "(ta.level = ? OR ta.level = 'ALL')";
    $params[] = $level;
}
if ($category) { $where[] = 'ta.category = ?'; $params[] = $category; }

$whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

// Count
$cStmt = $db->prepare("SELECT COUNT(*) FROM theory_articles ta $whereSQL");
$cStmt->execute($params);
$total = (int)$cStmt->fetchColumn();

$params[] = $p['limit'];
$params[] = $p['offset'];

$stmt = $db->prepare("
    SELECT id, title, level, category, order_index,
           SUBSTR(content, 1, 200) AS excerpt
    FROM theory_articles ta
    $whereSQL
    ORDER BY
        CASE ta.level WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3 WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 ELSE 6 END,
        ta.order_index, ta.id
    LIMIT ? OFFSET ?
");
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Get categories
$catStmt = $db->query('SELECT DISTINCT category FROM theory_articles ORDER BY category');
$categories = $catStmt->fetchAll(PDO::FETCH_COLUMN);

jsonOk([
    'items'      => $rows,
    'total'      => $total,
    'page'       => $p['page'],
    'categories' => $categories,
]);
