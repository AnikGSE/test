<?php
// backend/get_restocks.php
require __DIR__ . '/_bootstrap.php';

try {
  $rows = $pdo->query("
    SELECT id, product_id, supplier_id, quantity, delivery_date, status
    FROM restocks
    ORDER BY id DESC
  ")->fetchAll();

  $restocks = array_map(function ($r) {
    return [
      'id'           => (int)$r['id'],
      'productId'    => (int)$r['product_id'],
      'supplierId'   => (int)$r['supplier_id'],
      'quantity'     => (int)$r['quantity'],
      'deliveryDate' => (string)$r['delivery_date'],
      'status'       => (string)$r['status'],
    ];
  }, $rows);

  send_json(['success' => true, 'restocks' => $restocks]);
} catch (Throwable $e) {
  send_json(['success' => false, 'error' => $e->getMessage()], 500);
}
