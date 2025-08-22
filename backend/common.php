<?php
// backend/common.php
require_once __DIR__.'/config.php';

/**
 * config.php already sent CORS headers and handles OPTIONS,
 * but other files call cors(); keep it as a no-op for safety.
 */
function cors(): void {
  // no-op; headers already sent in config.php
}

/** Get PDO created in config.php */
function db(): PDO {
  global $pdo;
  return $pdo;
}

/** Read JSON body safely */
function read_json(): array {
  return json_input();
}

/** Success response in a consistent envelope */
function ok($data, int $code = 200): void {
  respond(['success' => true, 'data' => $data], $code);
}

/** Error response in the same envelope */
function err(string $message, int $code = 400): void {
  respond(['success' => false, 'error' => $message], $code);
}
