<?php
/**
 * JLPT Master - Shared Database Layer
 * Provides PDO connection and utility functions for all API endpoints.
 */

define('DB_PATH', __DIR__ . '/../data/jlpt.db');
define('APP_VERSION', '1.0.0');

// ─────────────────────────────────────────────
// CORS & Response headers
// ─────────────────────────────────────────────

function setCorsHeaders(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    header('Content-Type: application/json; charset=UTF-8');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// ─────────────────────────────────────────────
// Database connection (singleton)
// ─────────────────────────────────────────────

function getDB(): PDO {
    static $db = null;
    if ($db === null) {
        if (!file_exists(DB_PATH)) {
            jsonError('Base de datos no encontrada. Ejecuta setup.php primero.', 503);
        }
        $db = new PDO('sqlite:' . DB_PATH);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $db->exec('PRAGMA foreign_keys = ON');
        $db->exec('PRAGMA journal_mode = WAL');
    }
    return $db;
}

// ─────────────────────────────────────────────
// Response helpers
// ─────────────────────────────────────────────

function jsonOk(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function jsonError(string $message, int $status = 400): never {
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// ─────────────────────────────────────────────
// Input helpers
// ─────────────────────────────────────────────

function getInput(): array {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

function param(string $key, mixed $default = null): mixed {
    return $_GET[$key] ?? $_POST[$key] ?? $default;
}

function requireParam(string $key, string $type = 'string'): mixed {
    $val = param($key);
    if ($val === null || $val === '') jsonError("Parámetro requerido: $key");
    return match($type) {
        'int'   => (int)$val,
        'float' => (float)$val,
        default => trim((string)$val),
    };
}

// ─────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────

function validLevel(?string $level): bool {
    return in_array($level, ['N5', 'N4', 'N3', 'N2', 'N1'], true);
}

function sanitizeLevel(?string $level): ?string {
    return validLevel($level) ? $level : null;
}

// ─────────────────────────────────────────────
// Pagination helper
// ─────────────────────────────────────────────

function pagination(): array {
    $page  = max(1, (int)param('page', 1));
    $limit = min(100, max(10, (int)param('limit', 30)));
    return [
        'page'   => $page,
        'limit'  => $limit,
        'offset' => ($page - 1) * $limit,
    ];
}
