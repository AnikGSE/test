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


if ($data === null || !isset($data['id'])) {
    echo json_encode(["success" => false, "message" => "Invalid input or product ID not provided."]);
    $conn->close();
    exit();
}

$product_id_to_delete = $data['id'];


$stmt = $conn->prepare("DELETE FROM products WHERE id = ?");


if ($stmt === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare delete statement: " . $conn->error]);
    $conn->close();
    exit();
}


$stmt->bind_param("i", $product_id_to_delete);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Product deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Product not found or no changes made."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Error deleting product: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
