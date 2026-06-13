<?php
/**
 * JLPT Master - Exams API
 * GET  /api/exams.php?action=questions  → get exam questions
 * POST /api/exams.php?action=start      → start a session
 * POST /api/exams.php?action=answer     → record answer
 * POST /api/exams.php?action=finish     → finish session
 * GET  /api/exams.php?action=sessions   → exam history
 * GET  /api/exams.php?action=session&id=N → session detail
 */

require_once __DIR__ . '/db.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = param('action', 'questions');
$db     = getDB();

// ─────────────────────────────────────────────
// GET: Fetch questions for an exam
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'questions') {
    $level    = sanitizeLevel(param('level'));
    $type     = param('type');       // vocabulary|grammar|kanji|reading
    $count    = min(50, max(5, (int)param('count', 10)));

    $where  = $level ? ['eq.level = ?'] : [];
    $params = $level ? [$level] : [];

    $validTypes = ['vocabulary','grammar','kanji','reading','listening'];
    if ($type && in_array($type, $validTypes)) {
        $where[]  = 'eq.question_type = ?';
        $params[] = $type;
    }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // Count available
    $avail = $db->prepare("SELECT COUNT(*) FROM exam_questions eq $whereSQL");
    $avail->execute($params);
    $available = (int)$avail->fetchColumn();

    $params[] = min($count, $available);

    $stmt = $db->prepare("
        SELECT eq.id, eq.question_text, eq.question_type, eq.level, eq.difficulty,
               eq.correct_answer, eq.explanation
        FROM exam_questions eq
        $whereSQL
        ORDER BY RANDOM()
        LIMIT ?
    ");
    $stmt->execute($params);
    $questions = $stmt->fetchAll();

    // Load options for each question
    foreach ($questions as &$q) {
        $opts = $db->prepare('SELECT option_label, option_text FROM exam_options WHERE question_id = ? ORDER BY option_label');
        $opts->execute([$q['id']]);
        $q['options'] = $opts->fetchAll();
        // Don't send correct_answer to client in exam mode — only send if requested
        // (client-side will re-fetch when needed)
    }

    jsonOk([
        'questions' => $questions,
        'count'     => count($questions),
        'available' => $available,
        'level'     => $level,
        'type'      => $type,
    ]);
}

// ─────────────────────────────────────────────
// GET: Exam sessions history
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'sessions') {
    $level = sanitizeLevel(param('level'));
    $where = $level ? 'WHERE level = ?' : '';
    $params = $level ? [$level] : [];

    $stmt = $db->prepare("
        SELECT * FROM exam_sessions $where
        ORDER BY completed_at DESC
        LIMIT 50
    ");
    $stmt->execute($params);
    $sessions = $stmt->fetchAll();
    jsonOk($sessions);
}

// ─────────────────────────────────────────────
// GET: Single session detail
// ─────────────────────────────────────────────
if ($method === 'GET' && $action === 'session') {
    $id = (int)requireParam('id', 'int');
    $session = $db->prepare('SELECT * FROM exam_sessions WHERE id = ?');
    $session->execute([$id]);
    $sess = $session->fetch();
    if (!$sess) jsonError('Sesión no encontrada', 404);

    $results = $db->prepare("
        SELECT er.*, eq.question_text, eq.question_type, eq.correct_answer,
               eq.explanation, eq.level
        FROM exam_results er
        JOIN exam_questions eq ON eq.id = er.question_id
        WHERE er.session_id = ?
    ");
    $results->execute([$id]);
    $sess['results'] = $results->fetchAll();

    // Load options
    foreach ($sess['results'] as &$r) {
        $opts = $db->prepare('SELECT option_label, option_text FROM exam_options WHERE question_id = ? ORDER BY option_label');
        $opts->execute([$r['question_id']]);
        $r['options'] = $opts->fetchAll();
    }

    jsonOk($sess);
}

// ─────────────────────────────────────────────
// POST: Start exam session
// ─────────────────────────────────────────────
if ($method === 'POST' && $action === 'start') {
    $input = getInput();
    $level = sanitizeLevel($input['level'] ?? null);
    $type  = $input['type'] ?? null;
    $mode  = in_array($input['mode'] ?? 'practice', ['exam','practice']) ? $input['mode'] : 'practice';
    $count = (int)($input['count'] ?? 10);

    $stmt = $db->prepare("
        INSERT INTO exam_sessions (level, exam_type, mode, total_questions, completed_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    ");
    $stmt->execute([$level, $type, $mode, $count]);
    $sessionId = $db->lastInsertId();

    jsonOk(['session_id' => $sessionId, 'mode' => $mode]);
}

// ─────────────────────────────────────────────
// POST: Record answer
// ─────────────────────────────────────────────
if ($method === 'POST' && $action === 'answer') {
    $input      = getInput();
    $sessionId  = (int)($input['session_id']  ?? 0);
    $questionId = (int)($input['question_id'] ?? 0);
    $userAnswer = $input['user_answer'] ?? '';
    $timeTaken  = (int)($input['time_taken'] ?? 0);

    if (!$sessionId || !$questionId) jsonError('session_id y question_id requeridos');

    // Get correct answer
    $q = $db->prepare('SELECT correct_answer, explanation, question_text, question_type, level FROM exam_questions WHERE id = ?');
    $q->execute([$questionId]);
    $question = $q->fetch();
    if (!$question) jsonError('Pregunta no encontrada', 404);

    $isCorrect = strtoupper(trim($userAnswer)) === strtoupper(trim($question['correct_answer'])) ? 1 : 0;

    // Insert result
    $stmt = $db->prepare("
        INSERT OR IGNORE INTO exam_results (session_id, question_id, user_answer, is_correct, time_taken)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$sessionId, $questionId, $userAnswer, $isCorrect, $timeTaken]);

    // Update session correct count
    if ($isCorrect) {
        $db->prepare('UPDATE exam_sessions SET correct_answers = correct_answers + 1 WHERE id = ?')
           ->execute([$sessionId]);
    }

    jsonOk([
        'is_correct'     => (bool)$isCorrect,
        'correct_answer' => $question['correct_answer'],
        'explanation'    => $question['explanation'],
    ]);
}

// ─────────────────────────────────────────────
// POST: Finish exam session
// ─────────────────────────────────────────────
if ($method === 'POST' && $action === 'finish') {
    $input     = getInput();
    $sessionId = (int)($input['session_id'] ?? 0);
    $timeTaken = (int)($input['time_taken'] ?? 0);

    if (!$sessionId) jsonError('session_id requerido');

    $sess = $db->prepare('SELECT * FROM exam_sessions WHERE id = ?');
    $sess->execute([$sessionId]);
    $session = $sess->fetch();
    if (!$session) jsonError('Sesión no encontrada', 404);

    $score = $session['total_questions'] > 0
        ? round(($session['correct_answers'] / $session['total_questions']) * 100, 1)
        : 0;

    $db->prepare("
        UPDATE exam_sessions
        SET time_taken = ?, score = ?, completed_at = datetime('now')
        WHERE id = ?
    ")->execute([$timeTaken, $score, $sessionId]);

    // Log study session
    $db->prepare("
        INSERT INTO study_sessions (module, level, items_studied, duration_seconds)
        VALUES ('exams', ?, ?, ?)
    ")->execute([$session['level'], $session['total_questions'], $timeTaken]);

    jsonOk([
        'session_id'     => $sessionId,
        'score'          => $score,
        'correct'        => $session['correct_answers'],
        'total'          => $session['total_questions'],
        'time_taken'     => $timeTaken,
        'passed'         => $score >= 60,
    ]);
}

jsonError('Acción no válida', 400);
