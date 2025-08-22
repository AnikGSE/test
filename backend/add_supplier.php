<?php
require_once __DIR__.'/config.php';
require_once __DIR__.'/common.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') err('Method Not Allowed', 405);
$body = read_json();

$name = trim($body['name'] ?? '');
$contact = trim($body['contactInfo'] ?? '');
$productIds = $body['productIds'] ?? [];

if ($name==='' || $contact==='') err('name and contactInfo are required', 422);
if (!is_array($productIds)) $productIds = [];

try {
  $pdo = db();
  $pdo->beginTransaction();

  // insert supplier
  $st = $pdo->prepare("INSERT INTO suppliers (name, contact_info) VALUES (?,?)");
  $st->execute([$name, $contact]);
  $sid = (int)$pdo->lastInsertId();

  // link products
  if (!empty($productIds)) {
    $link = $pdo->prepare("INSERT IGNORE INTO product_suppliers (product_id, supplier_id) VALUES (?,?)");
    foreach ($productIds as $pid) {
      if (is_numeric($pid)) $link->execute([(int)$pid, $sid]);
    }
  }

  $pdo->commit();
  ok(['id' => $sid], 201);
} catch (Exception $e) {
  if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
  err($e->getMessage(), 500);
}
