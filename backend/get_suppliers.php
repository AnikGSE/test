<?php
// backend/get_suppliers.php
declare(strict_types=1);

// --- CORS for local React dev (optional; safe to keep) ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header('Content-Type: application/json; charset=utf-8');

// --- DB credentials (edit if needed) ---
$DB_HOST = '127.0.0.1';
$DB_NAME = 'cloudtrack_db';
$DB_USER = 'root';
$DB_PASS = ''; // XAMPP default
$DB_CHARSET = 'utf8mb4';

$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";
$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);

  // Adjust the column names if your table uses different ones.
  $stmt = $pdo->query("
    SELECT id, name, contact_info
    FROM suppliers
    ORDER BY name ASC
  ");
  $rows = $stmt->fetchAll();

  // Normalize keys for frontend (contact_info -> contactInfo)
  $suppliers = array_map(function ($r) {
    return [
      'id'          => (int)$r['id'],
      'name'        => (string)$r['name'],
      'contactInfo' => (string)($r['contact_info'] ?? ''),
    ];
  }, $rows);

  echo json_encode(['success' => true, 'suppliers' => $suppliers], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error'   => 'Failed to load suppliers',
    'detail'  => $e->getMessage()
  ], JSON_UNESCAPED_UNICODE);
}
