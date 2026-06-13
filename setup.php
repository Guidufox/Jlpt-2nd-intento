<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>JLPT Master - Setup</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 700px; margin: 60px auto; padding: 0 20px; background: #f8fafc; color: #1e293b; }
  .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
  h1 { margin: 0 0 8px; font-size: 1.6rem; }
  .subtitle { color: #64748b; margin: 0 0 28px; }
  .step { display: flex; align-items: flex-start; gap: 12px; margin: 12px 0; padding: 12px 16px; border-radius: 8px; background: #f1f5f9; }
  .step.ok  { background: #f0fdf4; color: #16a34a; }
  .step.err { background: #fef2f2; color: #dc2626; }
  .step.info{ background: #eff6ff; color: #2563eb; }
  .icon { font-size: 1.2rem; line-height: 1.4; }
  .btn { display: inline-block; margin-top: 24px; padding: 12px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
  .btn:hover { background: #1d4ed8; }
  pre { background: #1e293b; color: #94a3b8; padding: 16px; border-radius: 8px; font-size: .8rem; overflow-x: auto; }
</style>
</head>
<body>
<div class="card">
  <h1>🇯🇵 JLPT Master — Setup</h1>
  <p class="subtitle">Inicialización de la base de datos SQLite</p>

<?php

$steps = [];

// ── Step 1: Data directory
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    if (mkdir($dataDir, 0755, true)) {
        $steps[] = ['ok',   'Directorio /data creado correctamente.'];
    } else {
        $steps[] = ['err',  'No se pudo crear el directorio /data. Verifica permisos.'];
    }
} else {
    $steps[] = ['ok', 'Directorio /data ya existe.'];
}

// ── Step 2: Create / open DB
$dbPath = $dataDir . '/jlpt.db';
$isNew  = !file_exists($dbPath);

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec('PRAGMA foreign_keys = ON');
    $db->exec('PRAGMA journal_mode = WAL');
    $steps[] = ['ok', $isNew ? 'Base de datos SQLite creada.' : 'Base de datos SQLite abierta.'];
} catch (Exception $e) {
    $steps[] = ['err', 'Error al abrir la base de datos: ' . $e->getMessage()];
    renderSteps($steps);
    die();
}

// ── Step 3: Run schema
$schemaFile = __DIR__ . '/sql/schema.sql';
if (!file_exists($schemaFile)) {
    $steps[] = ['err', 'No se encontró sql/schema.sql'];
} else {
    try {
        $schema = file_get_contents($schemaFile);
        $db->exec($schema);
        $steps[] = ['ok', 'Esquema de base de datos aplicado.'];
    } catch (Exception $e) {
        $steps[] = ['err', 'Error al aplicar esquema: ' . $e->getMessage()];
    }
}

// ── Step 4: Run seed (only if tables are empty)
$seedFile = __DIR__ . '/sql/seed.sql';
if (!file_exists($seedFile)) {
    $steps[] = ['info', 'No se encontró sql/seed.sql (omitido).'];
} else {
    try {
        $count = $db->query('SELECT COUNT(*) FROM vocabulary')->fetchColumn();
        if ((int)$count === 0) {
            $seed = file_get_contents($seedFile);
            // Split by semicolons to handle multi-statement execution
            $statements = array_filter(
                array_map('trim', explode(';', $seed)),
                fn($s) => $s !== '' && !str_starts_with(ltrim($s), '--')
            );
            $db->beginTransaction();
            foreach ($statements as $stmt) {
                if (trim($stmt)) $db->exec($stmt);
            }
            $db->commit();

            $vc = $db->query('SELECT COUNT(*) FROM vocabulary')->fetchColumn();
            $kc = $db->query('SELECT COUNT(*) FROM kanji')->fetchColumn();
            $gc = $db->query('SELECT COUNT(*) FROM grammar_points')->fetchColumn();
            $qc = $db->query('SELECT COUNT(*) FROM exam_questions')->fetchColumn();
            $steps[] = ['ok', "Datos de ejemplo cargados: {$vc} palabras, {$kc} kanji, {$gc} gramática, {$qc} preguntas."];
        } else {
            $steps[] = ['info', "La base de datos ya contiene {$count} palabras. Datos de ejemplo omitidos."];
        }
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        $steps[] = ['err', 'Error al cargar datos de ejemplo: ' . $e->getMessage()];
        $steps[] = ['info', 'Detalle: ' . substr($e->getMessage(), 0, 300)];
    }
}

// ── Step 5: Verify tables
try {
    $tables = ['vocabulary','kanji','grammar_points','theory_articles',
               'exam_questions','exam_options','user_vocabulary','user_kanji',
               'srs_cards','exam_sessions','exam_results','favorites','study_sessions'];
    $existing = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    $missing  = array_diff($tables, $existing);
    if (empty($missing)) {
        $steps[] = ['ok', 'Todas las tablas verificadas (' . count($tables) . ' tablas).'];
    } else {
        $steps[] = ['err', 'Faltan tablas: ' . implode(', ', $missing)];
    }
} catch (Exception $e) {
    $steps[] = ['err', 'Error al verificar tablas.'];
}

// ── Render
renderSteps($steps);

$allOk = !in_array('err', array_column($steps, 0));

function renderSteps(array $steps): void {
    $icons = ['ok' => '✅', 'err' => '❌', 'info' => 'ℹ️'];
    foreach ($steps as [$type, $msg]) {
        echo '<div class="step ' . htmlspecialchars($type) . '">';
        echo '<span class="icon">' . ($icons[$type] ?? '·') . '</span>';
        echo '<span>' . htmlspecialchars($msg) . '</span>';
        echo '</div>';
    }
}

if ($allOk):
?>
  <a class="btn" href="index.html">→ Ir a la aplicación</a>
<?php else: ?>
  <p style="margin-top:20px;color:#dc2626;font-weight:600;">
    Corrige los errores anteriores y recarga esta página.
  </p>
<?php endif; ?>

<p style="margin-top:32px;color:#94a3b8;font-size:.8rem;">
  JLPT Master v1.0 &nbsp;|&nbsp;
  DB: <?= htmlspecialchars($dbPath) ?> &nbsp;|&nbsp;
  PHP <?= PHP_VERSION ?>
</p>
</div>
</body>
</html>
