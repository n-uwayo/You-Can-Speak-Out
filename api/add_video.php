<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get DB connection
include_once 'config/database.php';
$database = new Database();
$pdo = $database->getConnection(); // <- FIXED here

// Parse JSON input
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data['title']) || !isset($data['videoUrl'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}

// Sanitize input
$title = $data['title'];
$description = $data['description'] ?? '';
$videoUrl = $data['videoUrl'];
$duration = $data['duration'] ?? '';
$category = $data['category'] ?? 'programming';
$status = $data['status'] ?? 'Draft';

// Use example values
$is_published = ($status === 'Published') ? 1 : 0;
$module_id = 2;

try {
    $stmt = $pdo->prepare("INSERT INTO videos (title, description, video_url, duration, order_num, is_published, module_id) VALUES (?, ?, ?, ?, 0, ?, ?)");
    $stmt->execute([$title, $description, $videoUrl, $duration, $is_published, $module_id]);

    echo json_encode(['success' => true, 'message' => 'Video added successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
