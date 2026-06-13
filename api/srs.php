<?php
/**
 * JLPT Master - SRS API  (SM-2 simplified)
 * GET  /api/srs.php?action=due         → cards due for review
 * GET  /api/srs.php?action=stats       → SRS statistics
 * POST /api/srs.php?action=add         → add card to SRS deck
 * POST /api/srs.php?action=review      → record review response
 * POST /api/srs.php?action=remove      → remove card from SRS
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = param('action', 'due');
$db     = getDB();

// ─────────────────────────────────────────────
// SM-2 Algorithm
// quality: 0=Again 1=Hard 2=Good 3=Easy (mapped to SM2 q: 1,2,4,5)
// ─────────────────────────────────────────────
function sm2(int $repetitions, float $easeFactor, int $intervalDays, int $quality): array {
    // Map UI quality (0-3) to SM2 quality (0-5)
    $q = match($quality) {
        0 => 1,  // Again
        1 => 2,  // Hard
        2 => 4,  // Good
        3 => 5,  // Easy
        default => 3,
    };

    if ($q < 3) {
        // Failed – restart
        $repetitions = 0;
        $newInterval = 1;
    } else {
        $newInterval = match($repetitions) {
            0 => 1,
            1 => 6,
            default => (int)round($intervalDays * $easeFactor),
        };
        $repetitions++;
    }

    // Update ease factor
    $newEase = $easeFactor + (0.1 - (5 - $q) * (0.08 + (5 - $q) * 0.02));
    $newEase = max(1.3, $newEase);

    return [
        'repetitions'  => $repetitions,
        'ease_factor'  => round($newEase, 4),
        'interval_days' => max(1, $newInterval),
    ];
}

// ─────────────────────────────────────────────
// GET: Due cards
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'due') {
    $itemType = param('type');   // vocabulary|kanji|null
    $level    = sanitizeLevel(param('level'));
    $limit    = min(100, max(1, (int)param('limit', 20)));

    $typeWhere  = $itemType ? "AND sc.item_type = '$itemType'" : '';
    $levelWhere = '';
    $levelJoin  = '';

    if ($level) {
        $levelWhere = "AND COALESCE(v.level, k.level) = '$level'";
        $levelJoin  = "
            LEFT JOIN vocabulary v ON sc.item_type='vocabulary' AND sc.item_id = v.id
            LEFT JOIN kanji k      ON sc.item_type='kanji'      AND sc.item_id = k.id
        ";
    }

    $stmt = $db->prepare("
        SELECT sc.id, sc.item_type, sc.item_id,
               sc.repetitions, sc.ease_factor, sc.interval_days, sc.next_review,
               COALESCE(v.kanji, k.character) AS display_front,
               COALESCE(v.kana,  k.kunyomi)  AS display_kana,
               COALESCE(v.meaning_es, k.meaning_es) AS display_meaning,
               COALESCE(v.level, k.level) AS level,
               v.furigana, v.examples AS v_examples, k.examples AS k_examples,
               v.kana AS vocab_kana, k.onyomi, k.kunyomi
        FROM srs_cards sc
        LEFT JOIN vocabulary v ON sc.item_type='vocabulary' AND sc.item_id = v.id
        LEFT JOIN kanji k      ON sc.item_type='kanji'      AND sc.item_id = k.id
        $levelJoin
        WHERE sc.next_review <= datetime('now')
        $typeWhere
        $levelWhere
        ORDER BY sc.next_review ASC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $cards = $stmt->fetchAll();

    foreach ($cards as &$card) {
        $card['examples'] = json_decode(
            $card['item_type'] === 'vocabulary' ? ($card['v_examples'] ?? '[]') : ($card['k_examples'] ?? '[]'),
            true
        );
        unset($card['v_examples'], $card['k_examples']);
    }

    // Total due (for badge)
    $totalDue = (int)$db->query("
        SELECT COUNT(*) FROM srs_cards WHERE next_review <= datetime('now')
    ")->fetchColumn();

    jsonOk([
        'cards'     => $cards,
        'count'     => count($cards),
        'total_due' => $totalDue,
    ]);
}

// ─────────────────────────────────────────────
// GET: SRS Stats
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'stats') {
    $stats = $db->query("
        SELECT
            COUNT(*) AS total_cards,
            SUM(CASE WHEN next_review <= datetime('now') THEN 1 ELSE 0 END) AS due_now,
            SUM(CASE WHEN next_review > datetime('now') AND date(next_review) = date('now') THEN 1 ELSE 0 END) AS due_today,
            SUM(CASE WHEN repetitions = 0 THEN 1 ELSE 0 END) AS new_cards,
            SUM(CASE WHEN repetitions >= 1 AND interval_days < 7  THEN 1 ELSE 0 END) AS learning,
            SUM(CASE WHEN interval_days >= 7 AND interval_days < 21 THEN 1 ELSE 0 END) AS review,
            SUM(CASE WHEN interval_days >= 21 THEN 1 ELSE 0 END) AS mature,
            SUM(CASE WHEN item_type = 'vocabulary' THEN 1 ELSE 0 END) AS vocab_cards,
            SUM(CASE WHEN item_type = 'kanji'      THEN 1 ELSE 0 END) AS kanji_cards
        FROM srs_cards
    ")->fetch();

    // Reviews done today
    $today = $db->query("
        SELECT COUNT(*) FROM srs_cards WHERE date(last_review) = date('now')
    ")->fetchColumn();
    $stats['reviewed_today'] = (int)$today;

    // Upcoming reviews (next 7 days)
    $upcoming = $db->query("
        SELECT date(next_review) AS day, COUNT(*) AS count
        FROM srs_cards
        WHERE next_review > datetime('now')
          AND next_review <= datetime('now', '+7 days')
        GROUP BY date(next_review)
        ORDER BY day
    ")->fetchAll();
    $stats['upcoming'] = $upcoming;

    jsonOk($stats);
}

// ─────────────────────────────────────────────
// POST: Add card to SRS
// ─────────────────────────────────────────────
if ($method === 'POST' && $action === 'add') {
    $input    = getInput();
    $itemType = $input['item_type'] ?? '';
    $itemId   = (int)($input['item_id'] ?? 0);

    if (!in_array($itemType, ['vocabulary','kanji'])) jsonError('item_type inválido');
    if (!$itemId) jsonError('item_id requerido');

    // Verify item exists
    $table = $itemType === 'vocabulary' ? 'vocabulary' : 'kanji';
    $check = $db->prepare("SELECT id FROM $table WHERE id = ?");
    $check->execute([$itemId]);
    if (!$check->fetch()) jsonError('Item no encontrado', 404);

    // Insert or ignore
    $stmt = $db->prepare("
        INSERT OR IGNORE INTO srs_cards (item_type, item_id, next_review)
        VALUES (?, ?, datetime('now'))
    ");
    $stmt->execute([$itemType, $itemId]);
    $inserted = $db->lastInsertId();

    jsonOk(['added' => (bool)$inserted, 'item_type' => $itemType, 'item_id' => $itemId]);
}

// ─────────────────────────────────────────────
// POST: Record review response
// ─────────────────────────────────────────────
if ($method === 'POST' && $action === 'review') {
    $input    = getInput();
    $cardId   = (int)($input['card_id']  ?? 0);
    $quality  = (int)($input['quality']  ?? 2);  // 0=Again 1=Hard 2=Good 3=Easy
    $itemType = $input['item_type'] ?? null;
    $itemId   = (int)($input['item_id']  ?? 0);

    // Support lookup by item_type+item_id OR card_id
    if (!$cardId && $itemType && $itemId) {
        $find = $db->prepare('SELECT id FROM srs_cards WHERE item_type = ? AND item_id = ?');
        $find->execute([$itemType, $itemId]);
        $found = $find->fetch();
        if ($found) $cardId = $found['id'];
    }

    if (!$cardId) jsonError('card_id o item_type+item_id requeridos');

    $quality = max(0, min(3, $quality));

    // Fetch current card state
    $fetch = $db->prepare('SELECT * FROM srs_cards WHERE id = ?');
    $fetch->execute([$cardId]);
    $card = $fetch->fetch();
    if (!$card) jsonError('Tarjeta SRS no encontrada', 404);

    // Apply SM-2
    $result = sm2(
        (int)$card['repetitions'],
        (float)$card['ease_factor'],
        (int)$card['interval_days'],
        $quality
    );

    // Calculate next_review datetime
    $nextReview = date('Y-m-d H:i:s', strtotime("+{$result['interval_days']} days"));

    $db->prepare("
        UPDATE srs_cards SET
            repetitions   = ?,
            ease_factor   = ?,
            interval_days = ?,
            next_review   = ?,
            last_review   = datetime('now')
        WHERE id = ?
    ")->execute([
        $result['repetitions'],
        $result['ease_factor'],
        $result['interval_days'],
        $nextReview,
        $cardId,
    ]);

    // Also update user_vocabulary or user_kanji status
    $newStatus = match(true) {
        $result['interval_days'] >= 21 => 'mastered',
        $result['interval_days'] >= 7  => 'known',
        $result['repetitions'] > 0     => 'learning',
        default                         => 'new',
    };

    if ($card['item_type'] === 'vocabulary') {
        $db->prepare("
            INSERT INTO user_vocabulary (vocabulary_id, status, times_seen, times_correct, last_seen)
            VALUES (?, ?, 1, ?, datetime('now'))
            ON CONFLICT(vocabulary_id) DO UPDATE SET
                status        = excluded.status,
                times_seen    = times_seen + 1,
                times_correct = times_correct + excluded.times_correct,
                last_seen     = datetime('now')
        ")->execute([$card['item_id'], $newStatus, $quality >= 2 ? 1 : 0]);
    } else {
        $db->prepare("
            INSERT INTO user_kanji (kanji_id, status, times_seen, times_correct, last_seen)
            VALUES (?, ?, 1, ?, datetime('now'))
            ON CONFLICT(kanji_id) DO UPDATE SET
                status        = excluded.status,
                times_seen    = times_seen + 1,
                times_correct = times_correct + excluded.times_correct,
                last_seen     = datetime('now')
        ")->execute([$card['item_id'], $newStatus, $quality >= 2 ? 1 : 0]);
    }

    jsonOk([
        'card_id'      => $cardId,
        'new_interval' => $result['interval_days'],
        'ease_factor'  => $result['ease_factor'],
        'next_review'  => $nextReview,
        'status'       => $newStatus,
    ]);
}

// ─────────────────────────────────────────────
// POST: Remove card from SRS
// ─────────────────────────────────────────────
if ($method === 'POST' && $action === 'remove') {
    $input    = getInput();
    $itemType = $input['item_type'] ?? '';
    $itemId   = (int)($input['item_id'] ?? 0);

    if (!$itemType || !$itemId) jsonError('item_type e item_id requeridos');

    $db->prepare('DELETE FROM srs_cards WHERE item_type = ? AND item_id = ?')
       ->execute([$itemType, $itemId]);

    jsonOk(['removed' => true]);
}

jsonError('Acción no válida', 400);
