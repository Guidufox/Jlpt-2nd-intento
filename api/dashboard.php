<?php
/**
 * JLPT Master - Dashboard API
 * GET /api/dashboard.php            → main dashboard stats
 * GET /api/dashboard.php?action=history → study history
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Método no permitido', 405);

$action = param('action', 'summary');
$db     = getDB();

// ─────────────────────────────────────────────
// Main dashboard summary
// ─────────────────────────────────────────────
if ($action === 'summary') {

    // Vocabulary stats per level
    $vocabByLevel = $db->query("
        SELECT v.level,
            COUNT(*)                                                          AS total,
            SUM(CASE WHEN COALESCE(uv.status,'new')='new'      THEN 1 ELSE 0 END) AS new_count,
            SUM(CASE WHEN COALESCE(uv.status,'new')='learning' THEN 1 ELSE 0 END) AS learning,
            SUM(CASE WHEN COALESCE(uv.status,'new')='known'    THEN 1 ELSE 0 END) AS known,
            SUM(CASE WHEN COALESCE(uv.status,'new')='mastered' THEN 1 ELSE 0 END) AS mastered
        FROM vocabulary v
        LEFT JOIN user_vocabulary uv ON uv.vocabulary_id = v.id
        GROUP BY v.level
        ORDER BY CASE v.level WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3 WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 END
    ")->fetchAll();

    // Kanji stats per level
    $kanjiByLevel = $db->query("
        SELECT k.level,
            COUNT(*)                                                          AS total,
            SUM(CASE WHEN COALESCE(uk.status,'new')='new'      THEN 1 ELSE 0 END) AS new_count,
            SUM(CASE WHEN COALESCE(uk.status,'new')='learning' THEN 1 ELSE 0 END) AS learning,
            SUM(CASE WHEN COALESCE(uk.status,'new')='known'    THEN 1 ELSE 0 END) AS known,
            SUM(CASE WHEN COALESCE(uk.status,'new')='mastered' THEN 1 ELSE 0 END) AS mastered
        FROM kanji k
        LEFT JOIN user_kanji uk ON uk.kanji_id = k.id
        GROUP BY k.level
        ORDER BY CASE k.level WHEN 'N5' THEN 1 WHEN 'N4' THEN 2 WHEN 'N3' THEN 3 WHEN 'N2' THEN 4 WHEN 'N1' THEN 5 END
    ")->fetchAll();

    // SRS overview
    $srs = $db->query("
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN next_review <= datetime('now') THEN 1 ELSE 0 END) AS due_now,
            SUM(CASE WHEN date(next_review) = date('now') THEN 1 ELSE 0 END) AS due_today,
            SUM(CASE WHEN date(last_review) = date('now') THEN 1 ELSE 0 END) AS reviewed_today
        FROM srs_cards
    ")->fetch();

    // Global totals
    $totals = $db->query("
        SELECT
            (SELECT COUNT(*) FROM vocabulary) AS total_vocab,
            (SELECT COUNT(*) FROM kanji)      AS total_kanji,
            (SELECT COUNT(*) FROM grammar_points) AS total_grammar,
            (SELECT COUNT(*) FROM exam_questions) AS total_questions,
            (SELECT COUNT(*) FROM user_vocabulary WHERE status IN ('known','mastered')) AS mastered_vocab,
            (SELECT COUNT(*) FROM user_kanji      WHERE status IN ('known','mastered')) AS mastered_kanji,
            (SELECT COUNT(*) FROM exam_sessions)  AS total_exams,
            (SELECT ROUND(AVG(score),1) FROM exam_sessions WHERE score > 0) AS avg_score
    ")->fetch();

    // Recent exam sessions (last 5)
    $recentExams = $db->query("
        SELECT id, level, exam_type, mode, total_questions, correct_answers, score, completed_at
        FROM exam_sessions
        ORDER BY completed_at DESC
        LIMIT 5
    ")->fetchAll();

    // Study activity last 7 days
    $activity = $db->query("
        SELECT date(created_at) AS day,
               SUM(items_studied) AS items,
               SUM(duration_seconds) AS seconds
        FROM study_sessions
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY day
    ")->fetchAll();

    // Favorites count
    $favCounts = $db->query("
        SELECT item_type, COUNT(*) AS cnt
        FROM favorites
        GROUP BY item_type
    ")->fetchAll();
    $favMap = [];
    foreach ($favCounts as $fc) $favMap[$fc['item_type']] = $fc['cnt'];

    jsonOk([
        'totals'        => $totals,
        'vocab_levels'  => $vocabByLevel,
        'kanji_levels'  => $kanjiByLevel,
        'srs'           => $srs,
        'recent_exams'  => $recentExams,
        'activity'      => $activity,
        'favorites'     => $favMap,
    ]);
}

// ─────────────────────────────────────────────
// Study history
// ─────────────────────────────────────────────
if ($action === 'history') {
    $limit = min(100, max(10, (int)param('limit', 30)));
    $stmt  = $db->prepare("
        SELECT * FROM study_sessions
        ORDER BY created_at DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    jsonOk($stmt->fetchAll());
}

jsonError('Acción no válida', 400);
