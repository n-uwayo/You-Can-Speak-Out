<?php
// Prevent any HTML error output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set headers first
header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration
$host = 'localhost';
$dbname = 'learning_management';
$username = 'root';
$password = '';

// Create mysqli connection
$mysqli = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'error' => $mysqli->connect_error // Remove this in production
    ]);
    exit;
}

// Set charset
$mysqli->set_charset('utf8mb4');

try {
    // Check if user_id is provided
    if (!isset($_GET['user_id']) || empty($_GET['user_id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    $user_id = filter_var($_GET['user_id'], FILTER_VALIDATE_INT);
    
    if ($user_id === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid User ID format'
        ]);
        exit;
    }
    
    // SQL query to fetch tasks with course information
    $sql = "
        SELECT 
            t.id,
            t.title,
            t.description,
            t.instructions,
            t.due_date,
            t.points,
            t.task_type,
            t.status,
            c.title as course_title,
            c.id as course_id
        FROM tasks t
        LEFT JOIN courses c ON t.course_id = c.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = ?
        AND t.status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')
        ORDER BY 
            CASE 
                WHEN t.status = 'ACTIVE' THEN 1
                WHEN t.status = 'INACTIVE' THEN 2
                WHEN t.status = 'ARCHIVED' THEN 3
            END,
            t.due_date ASC
    ";
    
    // Prepare statement
    $stmt = $mysqli->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $mysqli->error);
    }
    
    // Bind parameters
    $stmt->bind_param('i', $user_id);
    
    // Execute statement
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    // Get result
    $result = $stmt->get_result();
    $tasks = $result->fetch_all(MYSQLI_ASSOC);
    
    // Close statement
    $stmt->close();
    
    // Format the data
    $formatted_tasks = [];
    foreach ($tasks as $task) {
        $formatted_tasks[] = [
            'id' => (int)$task['id'],
            'title' => $task['title'],
            'description' => $task['description'],
            'instructions' => $task['instructions'],
            'due_date' => $task['due_date'],
            'points' => (int)$task['points'],
            'task_type' => $task['task_type'],
            'status' => $task['status'],
            'course_title' => $task['course_title'],
            'course_id' => (int)$task['course_id']
        ];
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $formatted_tasks,
        'count' => count($formatted_tasks)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage() // Remove this in production
    ]);
} finally {
    // Close connection
    if (isset($mysqli)) {
        $mysqli->close();
    }
}
?>