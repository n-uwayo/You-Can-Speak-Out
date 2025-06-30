<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$db = 'learning_management';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit();
}

$student_id = intval($_GET['user_id'] ?? 0);
if ($student_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user_id']);
    exit();
}

$sql = "SELECT ts.id, c.title, t.title as task_title, ts.text_submission, ts.feedback, ts.grade, ts.status, ts.file_urls, ts.submitted_at 
        FROM task_submissions ts
        JOIN tasks t ON ts.task_id = t.id
        JOIN courses c ON t.course_id = c.id
        WHERE ts.student_id = ?
        ORDER BY ts.submitted_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $student_id);
$stmt->execute();
$result = $stmt->get_result();

$assignments = [];
while ($row = $result->fetch_assoc()) {
    $assignments[] = $row;
}

echo json_encode(['success' => true, 'data' => $assignments]);
$conn->close();
