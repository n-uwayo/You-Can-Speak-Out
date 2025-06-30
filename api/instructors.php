<?php
// instructors.php - Get instructors for course assignment
require_once 'config.php';

setupCORS();


$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError("Method not allowed", 405);
}

try {
    // Get all active instructors
    $query = "
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.avatar,
            u.created_at,
            COUNT(c.id) as course_count
        FROM users u
        LEFT JOIN courses c ON u.id = c.instructor_id
        WHERE u.role = 'INSTRUCTOR' 
        AND u.is_active = 1
        GROUP BY u.id
        ORDER BY u.name ASC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $instructors = $stmt->fetchAll();
    
    // Format the response to include additional useful information
    foreach ($instructors as &$instructor) {
        // Add some computed fields that might be useful
        $instructor['full_name'] = $instructor['name'];
        $instructor['display_name'] = $instructor['name'] . ' (' . $instructor['email'] . ')';
        $instructor['course_count'] = intval($instructor['course_count']);
    }
    
    sendSuccess($instructors, "Instructors retrieved successfully");
    echo json_encode([
        "success" => true,
        "message" => "Instructors retrieved successfully"
    ]);
    
} catch (Exception $e) {
    error_log("Get instructors error: " . $e->getMessage());
    sendError("Failed to fetch instructors", 500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch instructors"
    ]);
}
?>