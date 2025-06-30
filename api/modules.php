<?php
// modules.php - Modules API for course modules
require_once 'config.php';

setupCORS();


$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle different routes
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Check if this is a course-specific modules request
// Expected format: /modules/course/{courseId} or /modules.php?course_id={courseId}
$course_id = null;

if (isset($_GET['course_id'])) {
    $course_id = intval($_GET['course_id']);
} elseif (count($pathParts) >= 3 && $pathParts[count($pathParts)-2] === 'course') {
    $course_id = intval($pathParts[count($pathParts)-1]);
}

if ($method !== 'GET') {
    sendError("Method not allowed", 405);
}

try {
    if ($course_id) {
        // Get modules for specific course
        $query = "
            SELECT 
                m.*,
                c.title as course_title,
                c.instructor_id,
                COUNT(v.id) as video_count
            FROM modules m
            LEFT JOIN courses c ON m.course_id = c.id
            LEFT JOIN videos v ON m.id = v.module_id
            WHERE m.course_id = :course_id
            GROUP BY m.id
            ORDER BY m.order_num ASC, m.created_at ASC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":course_id", $course_id);
        $stmt->execute();
        
        $modules = $stmt->fetchAll();
        
        // Format the response
        foreach ($modules as &$module) {
            $module['course'] = [
                'id' => $course_id,
                'title' => $module['course_title'],
                'instructor_id' => $module['instructor_id']
            ];
            $module['video_count'] = intval($module['video_count']);
            
            // Clean up redundant fields
            unset($module['course_title'], $module['instructor_id']);
        }
        
        sendSuccess($modules, "Modules retrieved successfully");
    } else {
        // Get all modules (with course info)
        $query = "
            SELECT 
                m.*,
                c.title as course_title,
                c.instructor_id,
                COUNT(v.id) as video_count
            FROM modules m
            LEFT JOIN courses c ON m.course_id = c.id
            LEFT JOIN videos v ON m.id = v.module_id
            GROUP BY m.id
            ORDER BY c.title ASC, m.order_num ASC, m.created_at ASC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $modules = $stmt->fetchAll();
        
        // Format the response
        foreach ($modules as &$module) {
            $module['course'] = [
                'id' => $module['course_id'],
                'title' => $module['course_title'],
                'instructor_id' => $module['instructor_id']
            ];
            $module['video_count'] = intval($module['video_count']);
            
            // Clean up redundant fields
            unset($module['course_title'], $module['instructor_id']);
        }
        
        sendSuccess($modules, "All modules retrieved successfully");
    }
    
} catch (Exception $e) {
    error_log("Get modules error: " . $e->getMessage());
    sendError("Failed to fetch modules", 500);
}
?>