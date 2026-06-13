<?php
/**
 * JLPT Master - Favorites API
 * POST /api/favorites.php          → toggle favorite
 * GET  /api/favorites.php          → list favorites
 * GET  /api/favorites.php?type=X   → list favorites by type
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ─────────────────────────────────────────────
// GET favorites list
// ─────────────────────────────────────────────
if ($method === 'GET') {
    $type  = param('type');   // vocabulary|kanji|grammar
    $level = sanitizeLevel(param('level'));

    $validTypes = ['vocabulary','kanji','grammar'];
    if ($type && !in_array($type, $validTypes)) jsonError('Tipo inválido');

    // Build query based on type
    if ($type === 'vocabulary' || !$type) {
        $lWhere = $level ? "AND v.level = '$level'" : '';
        $vocab  = $db->query("
            SELECT 'vocabulary' AS item_type, v.id AS item_id,
                   v.kanji, v.kana, v.meaning_es, v.level, f.created_at
            FROM favorites f
            JOIN vocabulary v ON v.id = f.item_id
            WHERE f.item_type = 'vocabulary' $lWhere
            ORDER BY f.created_at DESC
        ")->fetchAll();
    }

    if ($type === 'kanji' || !$type) {
        $lWhere = $level ? "AND k.level = '$level'" : '';
        $kanji  = $db->query("
            SELECT 'kanji' AS item_type, k.id AS item_id,
                   k.character AS kanji, k.kunyomi AS kana, k.meaning_es, k.level, f.created_at
            FROM favorites f
            JOIN kanji k ON k.id = f.item_id
            WHERE f.item_type = 'kanji' $lWhere
            ORDER BY f.created_at DESC
        ")->fetchAll();
    }

    if ($type === 'grammar' || !$type) {
        $lWhere = $level ? "AND gp.level = '$level'" : '';
        $grammar = $db->query("
            SELECT 'grammar' AS item_type, gp.id AS item_id,
                   gp.title AS kanji, gp.pattern AS kana, gp.explanation_es AS meaning_es, gp.level, f.created_at
            FROM favorites f
            JOIN grammar_points gp ON gp.id = f.item_id
            WHERE f.item_type = 'grammar' $lWhere
            ORDER BY f.created_at DESC
        ")->fetchAll();
    }

    $result = [];
    if (isset($vocab))   $result = array_merge($result, $vocab);
    if (isset($kanji))   $result = array_merge($result, $kanji);
    if (isset($grammar)) $result = array_merge($result, $grammar);

    // Sort by date if mixed
    if (!$type) {
        usort($result, fn($a,$b) => strcmp($b['created_at'], $a['created_at']));
    }

    jsonOk(['items' => $result, 'total' => count($result)]);
}

// ─────────────────────────────────────────────
// POST: Toggle favorite
// ─────────────────────────────────────────────
if ($method === 'POST') {
    $input    = getInput();
    $itemType = $input['item_type'] ?? '';
    $itemId   = (int)($input['item_id'] ?? 0);

    $validTypes = ['vocabulary','kanji','grammar'];
    if (!in_array($itemType, $validTypes)) jsonError('item_type inválido');
    if (!$itemId) jsonError('item_id requerido');

    // Check if already favorited
    $check = $db->prepare('SELECT id FROM favorites WHERE item_type = ? AND item_id = ?');
    $check->execute([$itemType, $itemId]);
    $existing = $check->fetch();

    if ($existing) {
        // Remove
        $db->prepare('DELETE FROM favorites WHERE item_type = ? AND item_id = ?')
           ->execute([$itemType, $itemId]);
        jsonOk(['action' => 'removed', 'is_favorite' => false]);
    } else {
        // Add
        $db->prepare("INSERT INTO favorites (item_type, item_id) VALUES (?, ?)")
           ->execute([$itemType, $itemId]);
        jsonOk(['action' => 'added', 'is_favorite' => true]);
    }
}

jsonError('Método no permitido', 405);
