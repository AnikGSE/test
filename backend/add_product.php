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

if ($data === null || !isset($data['name']) || !isset($data['price']) || !isset($data['stock_quantity']) || !isset($data['category'])) {
    echo json_encode(["success" => false, "message" => "Invalid input or missing required fields (name, price, stock_quantity, category)."]);
    $conn->close();
    exit();
}

$name = $data['name'];
$description = $data['description'] ?? null;
$price = $data['price'];
$stock_quantity = $data['stock_quantity'];
$category = $data['category'];

if (empty($name) || !is_numeric($price) || $price < 0 || !is_numeric($stock_quantity) || $stock_quantity < 0 || empty($category)) {
    echo json_encode(["success" => false, "message" => "Invalid product data. Ensure name, price, stock, and category are valid."]);
    $conn->close();
    exit();
}

$stmt = $conn->prepare("INSERT INTO products (name, description, price, stock_quantity, category) VALUES (?, ?, ?, ?, ?)");

if ($stmt === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare insert statement: " . $conn->error]);
    $conn->close();
    exit();
}

// Bind parameters (s = string, s = string, d = double, i = integer, s = string)
$stmt->bind_param("ssdis", $name, $description, $price, $stock_quantity, $category);


if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product added successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error adding product: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
