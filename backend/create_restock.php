<?php
require_once __DIR__.'/config.php';
require_once __DIR__.'/common.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') err('Method Not Allowed', 405);
$body = read_json();

$pid = $body['productId']  ?? 0;
$sid = $body['supplierId'] ?? 0;
$qty = $body['quantity']   ?? 0;
$dd  = $body['deliveryDate'] ?? null;
$st  = $body['status'] ?? 'Processing';

if (!is_numeric($pid) || $pid<=0 ||
    !is_numeric($sid) || $sid<=0 ||
    !is_numeric($qty) || $qty<=0 ||
    !$dd) {
  err('productId, supplierId, quantity>0, deliveryDate required', 422);
}

try {
  $pdo = db();
  $pdo->beginTransaction();

  // ensure mapping exists (optional, keeps data consistent)
  $chk = $pdo->prepare("SELECT 1 FROM product_suppliers WHERE product_id=? AND supplier_id=?");
  $chk->execute([(int)$pid, (int)$sid]);
  if (!$chk->fetch()) {
    $ins = $pdo->prepare("INSERT IGNORE INTO product_suppliers (product_id, supplier_id) VALUES (?,?)");
    $ins->execute([(int)$pid, (int)$sid]);
  }

  $insR = $pdo->prepare("INSERT INTO restocks (product_id, supplier_id, quantity, delivery_date, status)
                         VALUES (?,?,?,?,?)");
  $insR->execute([(int)$pid, (int)$sid, (int)$qty, $dd, $st]);

  $pdo->commit();
  ok(['id' => (int)$pdo->lastInsertId()], 201);
} catch (Exception $e) {
  if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
  err($e->getMessage(), 500);
}
