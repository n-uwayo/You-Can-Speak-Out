<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Check file upload
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit();
}

// Destination folder
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// File validation
$file = $_FILES['file'];
$originalName = basename($file['name']);
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$allowedExts = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar','mp4','avi'];

if (!in_array($ext, $allowedExts)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    exit();
}

// Rename and move file
$filename = uniqid('assignment_', true) . '.' . $ext;
$destination = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
    exit();
}

// Sanitize and extract POST data
$course_id = intval(trim($_POST['course_id'] ?? 0));
$student_id = intval(trim($_POST['user_id'] ?? 0));
$text_submission = trim($_POST['brief'] ?? '');
$file_urls = $filename;

// Validate course_id and student_id
if ($course_id <= 0 || $student_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid course_id or user_id']);
    exit();
}

// DB Connection
$conn = new mysqli('localhost', 'root', '', 'learning_management');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

// Check task existence
$task_stmt = $conn->prepare("SELECT id FROM tasks WHERE course_id = ?");
$task_stmt->bind_param("i", $course_id);
$task_stmt->execute();
$task_result = $task_stmt->get_result();

if ($task_row = $task_result->fetch_assoc()) {
    $task_id = $task_row['id'];

    // Insert submission
    $insert_stmt = $conn->prepare("INSERT INTO task_submissions (task_id, student_id, text_submission, file_urls) VALUES (?, ?, ?, ?)");
    $insert_stmt->bind_param("iiss", $task_id, $student_id, $text_submission, $file_urls);

    if ($insert_stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => [
                'file_name' => $filename,
                'original_name' => $originalName,
                'url' => 'http://localhost/api/student/uploads/' . $filename
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database insert failed',
            'error' => $insert_stmt->error
        ]);
    }

    $insert_stmt->close();
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'No task found for given course_id']);
}

$task_stmt->close();
$conn->close();
exit();
