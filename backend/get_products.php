<?php
// ---------- CORS ----------
$allowed_origins = [
  'http://localhost:3000',      // CRA
  'http://127.0.0.1:3000',
  'http://localhost:5173',      // Vite
  'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
  header("Access-Control-Allow-Origin: $origin");
} else {
  // Allow same-origin when served via Apache/PHP directly
  header("Access-Control-Allow-Origin: *");
}
header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Access-Control-Max-Age: 3600");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

header('Content-Type: application/json; charset=utf-8');

// ---------- DB ----------
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "cloudtrack_db";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
  $conn = new mysqli($servername, $username, $password, $dbname);
  $conn->set_charset('utf8mb4');
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'DB connection failed']);
  exit();
}

// ---------- Inputs (all optional) ----------
// ?q=search&category=Electronics&min_stock=1&page=1&page_size=50&sortBy=price&sortDir=desc
$q          = trim($_GET['q'] ?? '');
$category   = trim($_GET['category'] ?? '');
$min_stock  = isset($_GET['min_stock']) ? (int)$_GET['min_stock'] : null;
$page       = max(1, (int)($_GET['page'] ?? 1));
$page_size  = min(200, max(1, (int)($_GET['page_size'] ?? 50)));
$sortBy     = $_GET['sortBy'] ?? 'id';
$sortDir    = strtolower($_GET['sortDir'] ?? 'desc');

// Whitelist sorting
$sortColumns = ['id','name','price','stock_quantity','category'];
if (!in_array($sortBy, $sortColumns, true)) $sortBy = 'id';
$sortDir = $sortDir === 'asc' ? 'asc' : 'desc';

$offset = ($page - 1) * $page_size;

// ---------- Build WHERE with prepared params ----------
$where = [];
$params = [];
$types  = '';

if ($q !== '') {
  $where[] = "(name LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%'))";
  $params[] = $q; $params[] = $q;
  $types   .= 'ss';
}
if ($category !== '') {
  $where[] = "category = ?";
  $params[] = $category;
  $types   .= 's';
}
if ($min_stock !== null) {
  $where[] = "stock_quantity >= ?";
  $params[] = $min_stock;
  $types   .= 'i';
}

$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

// ---------- Count total for pagination ----------
try {
  $countSql = "SELECT COUNT(*) AS total FROM products $whereSql";
  $stmt = $conn->prepare($countSql);
  if (!empty($params)) { $stmt->bind_param($types, ...$params); }
  $stmt->execute();
  $total = (int)($stmt->get_result()->fetch_assoc()['total'] ?? 0);
  $stmt->close();
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to count products']);
  $conn->close();
  exit();
}

// ---------- Fetch page ----------
$products = [];
try {
  $sql = "SELECT id, name, description, price, stock_quantity, category
          FROM products
          $whereSql
          ORDER BY $sortBy $sortDir
          LIMIT ? OFFSET ?";
  $stmt = $conn->prepare($sql);

  // Add LIMIT/OFFSET to bindings
  $typesWithLimit = $types . 'ii';
  $paramsWithLimit = $params;
  $paramsWithLimit[] = $page_size;
  $paramsWithLimit[] = $offset;

  $stmt->bind_param($typesWithLimit, ...$paramsWithLimit);
  $stmt->execute();
  $res = $stmt->get_result();

  while ($row = $res->fetch_assoc()) {
    $products[] = [
      'id'             => (int)$row['id'],
      'name'           => $row['name'],
      'description'    => $row['description'],
      'price'          => (float)$row['price'],
      'stock_quantity' => (int)$row['stock_quantity'],
      'category'       => $row['category'],
    ];
  }
  $stmt->close();
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to fetch products']);
  $conn->close();
  exit();
}

$conn->close();

// ---------- Response ----------
echo json_encode([
  'success'     => true,
  'products'    => $products,
  'page'        => $page,
  'page_size'   => $page_size,
  'total'       => $total,
  'total_pages' => (int)ceil($total / max(1, $page_size)),
], JSON_UNESCAPED_UNICODE);
