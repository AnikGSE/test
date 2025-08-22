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
$data = json_decode($json_data, true); // Decode JSON into an associative array

// Check if data is received and valid
if ($data === null || !isset($data['id'])) {
    echo json_encode(["success" => false, "message" => "Invalid input or user ID not provided."]);
    $conn->close();
    exit();
}

$user_id_to_delete = $data['id'];

// IMPORTANT SECURITY CHECK:
// Prevent deleting admin users from the backend
// First, check the role of the user being targeted for deletion
$stmt_check_role = $conn->prepare("SELECT role FROM users WHERE id = ?");
if ($stmt_check_role === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare role check statement: " . $conn->error]);
    $conn->close();
    exit();
}
$stmt_check_role->bind_param("i", $user_id_to_delete);
$stmt_check_role->execute();
$result_check_role = $stmt_check_role->get_result();

if ($result_check_role->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    $stmt_check_role->close();
    $conn->close();
    exit();
}

$user_to_delete_info = $result_check_role->fetch_assoc();
if ($user_to_delete_info['role'] === 'admin') {
    echo json_encode(["success" => false, "message" => "Admin users cannot be deleted."]);
    $stmt_check_role->close();
    $conn->close();
    exit();
}
$stmt_check_role->close();


// Prepare SQL statement for deletion
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");

// Check if the statement preparation was successful
if ($stmt === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare delete statement: " . $conn->error]);
    $conn->close();
    exit();
}

// Bind parameter (i = integer for ID)
$stmt->bind_param("i", $user_id_to_delete);

// Execute the statement
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "User deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found or no changes made."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Error deleting user: " . $stmt->error]);
}

// Close statement and connection
$stmt->close();
$conn->close();
?>
