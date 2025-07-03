<?php
// student/saveProgress.php - Auto-save progress API
require_once '../config.php'; // Adjusted path for student folder

setupCORS();

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError("Method not allowed: ".$method, 405);
}

try {
    // Get JSON data from request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError("Invalid JSON data", 400);
    }
    
    // Get data from JSON input
    $time = $input['timestamp'] ?? null;
    $course_id = $input['course_id'] ?? null;
    $user_id = $input['user_id'] ?? null;
    
    if (!$time || !$course_id || !$user_id) {
        sendError("Missing required data (timestamp, course_id, or user_id)", 400);
    }
    
    // Validate inputs
    $course_id = intval($course_id);
    $user_id = intval($user_id);
    
    if ($course_id <= 0 || $user_id <= 0) {
        sendError("Invalid course_id or user_id", 400);
    }

    
    $Write="<?php $" . "time='" . $time . "'; " . "echo $" . "time;" . " ?>";
    file_put_contents('time.php',$Write);

    $attendance = fopen("time.txt", "w") or die("Unable to open file!");
    $txt = $time;
    fwrite($attendance, $txt);
    $attendancetxt = fopen("text.php", "w") or die("Unable to open file!");
    fwrite($attendancetxt, $time);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => [
            'user_id' => $user_id,
            'course_id' => $course_id,
            'timestamp' => $time,
            'message' => 'Progress saved successfully'
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Save progress error: " . $e->getMessage());
    sendError("Failed to save progress: " . $e->getMessage(), 500);
}


?>