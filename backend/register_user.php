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

// Validate required fields
if ($data === null || !isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Invalid input or missing required fields."]);
    $conn->close();
    exit();
}

$name = $data['name'];
$email = $data['email'];
$password = $data['password']; // Password will be hashed
// Default role to 'customer' if not provided
$role = isset($data['role']) && !empty($data['role']) ? $data['role'] : 'customer';

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Check if email already exists
$stmt_check = $conn->prepare("SELECT id FROM users WHERE email = ?");
if ($stmt_check === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare email check statement: " . $conn->error]);
    $conn->close();
    exit();
}
$stmt_check->bind_param("s", $email);
$stmt_check->execute();
$stmt_check->store_result();

if ($stmt_check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered."]);
    $stmt_check->close();
    $conn->close();
    exit();
}
$stmt_check->close();

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
if ($stmt === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare insert statement: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("ssss", $name, $email, $hashed_password, $role);

if ($stmt->execute()) {
    $new_user_id = $conn->insert_id;

    // Fetch the newly inserted user info (without password)
    $stmt_fetch = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
    if ($stmt_fetch === false) {
        echo json_encode(["success" => true, "message" => "Registration successful, but failed to fetch user info: " . $conn->error]);
        $stmt->close();
        $conn->close();
        exit();
    }
    $stmt_fetch->bind_param("i", $new_user_id);
    $stmt_fetch->execute();
    $result_fetch = $stmt_fetch->get_result();

    $user_info = null;
    if ($result_fetch->num_rows > 0) {
        $user_info = $result_fetch->fetch_assoc();
    }
    $stmt_fetch->close();

    echo json_encode([
        "success" => true,
        "message" => "Registration successful! You are now logged in.",
        "user_info" => $user_info
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error registering user: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
