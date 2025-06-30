<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Connect to DB
$host = 'localhost';
$dbname = 'learning_management';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
$action = $data['action'] ?? '';
$video_id = intval($data['video_id'] ?? 0);
$watched_seconds = intval($data['watched_seconds'] ?? 0);
$is_completed = $data['is_completed'] ? 1 : 0;

// Static user ID for now (replace with session or auth token)
$user_id = 4;

if ($action !== 'update_video_progress' || $video_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid input or missing parameters'
    ]);
    exit();
}

// Check if a progress record already exists
$sql_check = "SELECT id FROM video_progress WHERE user_id = ? AND video_id = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $user_id, $video_id);
$stmt_check->execute();
$result = $stmt_check->get_result();

if ($result->num_rows > 0) {
    // Update existing record
    $sql_update = "UPDATE video_progress SET watched_seconds = ?, is_completed = ?, updated_at = NOW() WHERE user_id = ? AND video_id = ?";
    $stmt = $conn->prepare($sql_update);
    $stmt->bind_param("iiii", $watched_seconds, $is_completed, $user_id, $video_id);
} else {
    // Insert new record
    $sql_insert = "INSERT INTO video_progress (user_id, video_id, watched_seconds, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
    $stmt = $conn->prepare($sql_insert);
    $stmt->bind_param("iiii", $user_id, $video_id, $watched_seconds, $is_completed);
}

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Video progress updated successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update progress',
        'error' => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
