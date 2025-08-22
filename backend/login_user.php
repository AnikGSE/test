<?php
// Necessary CORS Code
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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

if ($data === null) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input or no data received."]);
    $conn->close();
    exit();
}

$email = $data['email'] ?? '';
$raw_password = $data['password'] ?? '';

if (empty($email) || empty($raw_password)) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    $conn->close();
    exit();
}

$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");

if ($stmt === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare statement: " . $conn->error]);
    $conn->close();
    exit();
}


$stmt->bind_param("s", $email);


$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    // User found, fetch the user data
    $user = $result->fetch_assoc();
    $hashed_password_from_db = $user['password'];

    // Verify the provided password against the hashed password from the database
    if (password_verify($raw_password, $hashed_password_from_db)) {
        // Password match
        unset($user['password']);
        echo json_encode(["success" => true, "message" => "Login successful!", "user" => $user]);
    } else {
        // Password does not match
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }
} else {
    // No user found with that email
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
}

$stmt->close();
$conn->close();
?>
