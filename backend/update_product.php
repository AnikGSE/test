<?php
// Necessary CORS Code
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Access-Control-Max-Age: 3600");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


header("Content-Type: application/json");

// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "cloudtrack_db";

$conn = new mysqli($servername, $username, $password, $dbname);


if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Get the raw POST data
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

if ($data === null || !isset($data['id']) || !isset($data['stock_quantity']) || !isset($data['price'])) {
    echo json_encode(["success" => false, "message" => "Invalid input or missing fields."]);
    $conn->close();
    exit();
}

$product_id = $data['id'];
$new_stock_quantity = $data['stock_quantity'];
$new_price = $data['price'];

if (!is_numeric($new_stock_quantity) || $new_stock_quantity < 0) {
    echo json_encode(["success" => false, "message" => "Invalid stock quantity. Must be a non-negative number."]);
    $conn->close();
    exit();
}

if (!is_numeric($new_price) || $new_price < 0) {
    echo json_encode(["success" => false, "message" => "Invalid price. Must be a non-negative number."]);
    $conn->close();
    exit();
}


$stmt = $conn->prepare("UPDATE products SET stock_quantity = ?, price = ? WHERE id = ?");


if ($stmt === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare update statement: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("idi", $new_stock_quantity, $new_price, $product_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Product updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Product not found or no changes made."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Error updating product: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
