<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'learning_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
    exit();
}

// Validate and sanitize input
$comment_text = trim($_POST['comment'] ?? '');
$course_id = trim($_POST['courseId'] ?? '');

if (empty($comment_text)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Comment is required'
    ]);
    exit();
}

if (empty($course_id) || !is_numeric($course_id)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid or missing courseId'
    ]);
    exit();
}

// Insert comment into database
try {
    $stmt = $pdo->prepare("
        INSERT INTO comments (text, user_id, video_id, parent_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
    ");

    $user_id = 4;       // Example static user ID
    if(isset($_POST['parent_id'])){
        $parent_id = intval($_POST['parent_id']);
    }else{
    $parent_id = null;     // Example static video ID
    }

    $stmt->execute([
        $comment_text,
        $user_id,
        $course_id,
        $parent_id
    ]);

    $comment_id = $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Comment saved successfully',
        'data' => [
            'id' => $comment_id,
            'text' => $comment_text,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save comment'.$e,
        'error' => $e->getMessage()
    ]);
}
?>
