<?php
// Allow requests from any origin
// header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config.php';

$action = $_GET['action'] ?? '';
$courseId = $_GET['course_id'] ?? '';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if ($action === 'detail' && !empty($courseId)) {
    try {
        $database = new Database();
        $db = $database->getConnection();

        $stmt = $db->prepare("
            SELECT c.id, c.title, c.description, c.thumbnail, c.price, c.is_published, c.created_at, u.name AS instructor_name
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$course) {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
            exit();
        }

        // Get modules
        $stmt = $db->prepare("SELECT id, title, description, order_num, is_published FROM modules WHERE course_id = ? ORDER BY order_num ASC");
        $stmt->execute([$courseId]);
        $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($modules as &$module) {
            $stmt = $db->prepare("SELECT id, title, description, video_url, duration, order_num, is_published FROM videos WHERE module_id = ? ORDER BY order_num ASC");
            $stmt->execute([$module['id']]);
            $module['videos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $course['modules'] = $modules;

        echo json_encode(['success' => true, 'course' => $course]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action or missing course_id']);
}
