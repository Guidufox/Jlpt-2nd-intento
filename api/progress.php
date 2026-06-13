<?php
/**
 * JLPT Master - Progress / Study Session API
 *
 * POST /api/progress.php?action=log      → log a study session
 * GET  /api/progress.php?action=today    → today's summary
 * GET  /api/progress.php?action=streak   → study streak
 * GET  /api/progress.php?action=weekly   → last 7-day breakdown
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = param('action', 'today');
$db     = getDB();

// ─────────────────────────────────────────────
// POST: Log a study session
// ─────────────────────────────────────────────
if ($method === 'POST' && $action === 'log') {
    $input    = getInput();
    $module   = trim($input['module']   ?? '');
    $level    = sanitizeLevel($input['level'] ?? null);
    $items    = (int)($input['items']   ?? 0);
    $duration = (int)($input['duration'] ?? 0);

    $validModules = ['vocabulary','kanji','grammar','theory','exams','srs'];
    if (!in_array($module, $validModules)) jsonError('Módulo inválido');

    $db->prepare("
        INSERT INTO study_sessions (module, level, items_studied, duration_seconds)
        VALUES (?, ?, ?, ?)
    ")->execute([$module, $level, $items, $duration]);

    jsonOk(['logged' => true, 'session_id' => $db->lastInsertId()]);
}

// ─────────────────────────────────────────────
// GET: Today's summary
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'today') {
    $today = $db->query("
        SELECT
            COUNT(*)                        AS sessions,
            COALESCE(SUM(items_studied), 0) AS items_total,
            COALESCE(SUM(duration_seconds),0) AS time_total,
            GROUP_CONCAT(DISTINCT module)   AS modules_studied
        FROM study_sessions
        WHERE date(created_at) = date('now')
    ")->fetch();

    // SRS reviewed today
    $srsToday = (int)$db->query("
        SELECT COUNT(*) FROM srs_cards
        WHERE date(last_review) = date('now')
    ")->fetchColumn();

    // Exam sessions today
    $examsToday = $db->query("
        SELECT COUNT(*) AS count, ROUND(AVG(score),1) AS avg_score
        FROM exam_sessions
        WHERE date(completed_at) = date('now')
    ")->fetch();

    jsonOk([
        'study'        => $today,
        'srs_reviewed' => $srsToday,
        'exams'        => $examsToday,
        'date'         => date('Y-m-d'),
    ]);
}

// ─────────────────────────────────────────────
// GET: Study streak (consecutive days)
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'streak') {
    // Get distinct study days descending
    $days = $db->query("
        SELECT DISTINCT date(created_at) AS day
        FROM study_sessions
        ORDER BY day DESC
        LIMIT 365
    ")->fetchAll(PDO::FETCH_COLUMN);

    $streak  = 0;
    $today   = date('Y-m-d');
    $current = $today;

    foreach ($days as $day) {
        if ($day === $current) {
            $streak++;
            $current = date('Y-m-d', strtotime($current . ' -1 day'));
        } else {
            break;
        }
    }

    // Longest streak ever
    $longest = 0; $cur = 0; $prev = null;
    foreach (array_reverse($days) as $day) {
        if ($prev === null) {
            $cur = 1;
        } elseif (strtotime($day) - strtotime($prev) === 86400) {
            $cur++;
        } else {
            $longest = max($longest, $cur);
            $cur = 1;
        }
        $prev    = $day;
        $longest = max($longest, $cur);
    }

    jsonOk([
        'current_streak' => $streak,
        'longest_streak' => $longest,
        'studied_today'  => in_array($today, $days),
    ]);
}

// ─────────────────────────────────────────────
// GET: Weekly breakdown (last 7 days)
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'weekly') {
    $rows = $db->query("
        SELECT
            date(created_at)                    AS day,
            module,
            SUM(items_studied)                  AS items,
            SUM(duration_seconds)               AS seconds
        FROM study_sessions
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY date(created_at), module
        ORDER BY day DESC, module
    ")->fetchAll();

    // Pivot by day
    $byDay = [];
    foreach ($rows as $row) {
        $d = $row['day'];
        if (!isset($byDay[$d])) $byDay[$d] = ['day' => $d, 'total_items' => 0, 'total_seconds' => 0, 'modules' => []];
        $byDay[$d]['modules'][$row['module']] = ['items' => $row['items'], 'seconds' => $row['seconds']];
        $byDay[$d]['total_items']   += $row['items'];
        $byDay[$d]['total_seconds'] += $row['seconds'];
    }

    jsonOk(['days' => array_values($byDay)]);
}

// ─────────────────────────────────────────────
// GET: Per-module totals
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'totals') {
    $rows = $db->query("
        SELECT
            module,
            COUNT(*)           AS sessions,
            SUM(items_studied) AS items,
            SUM(duration_seconds) AS seconds
        FROM study_sessions
        GROUP BY module
    ")->fetchAll();

    jsonOk($rows);
}

jsonError('Acción no válida', 400);
