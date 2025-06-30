    <?php
// videos.php - Videos API
require_once 'config.php';

setupCORS();

// Verify authentication
$user = verifyToken();
if (!$user) {
    sendError("Authentication required", 401);
}

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle different routes
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Check if this is a module-specific videos request
// Expected format: /videos/module/{moduleId} or /videos.php?module_id={moduleId}
$module_id = null;

if (isset($_GET['module_id'])) {
    $module_id = intval($_GET['module_id']);
} elseif (count($pathParts) >= 3 && $pathParts[count($pathParts)-2] === 'module') {
    $module_id = intval($pathParts[count($pathParts)-1]);
}

if ($method !== 'GET') {
    sendError("Method not allowed", 405);
}

try {
    if ($module_id) {
        // Get videos for specific module
        $query = "
            SELECT 
                v.*,
                m.title as module_title,
                m.course_id,
                c.title as course_title
            FROM videos v
            LEFT JOIN modules m ON v.module_id = m.id
            LEFT JOIN courses c ON m.course_id = c.id
            WHERE v.module_id = :module_id
            ORDER BY v.order_num ASC, v.created_at ASC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":module_id", $module_id);
        $stmt->execute();
        
        $videos = $stmt->fetchAll();
        
        // Format the response
        foreach ($videos as &$video) {
            $video['module'] = [
                'id' => $module_id,
                'title' => $video['module_title'],
                'course_id' => $video['course_id']
            ];
            
            $video['course'] = [
                'id' => $video['course_id'],
                'title' => $video['course_title']
            ];
            
            // Clean up redundant fields
            unset($video['module_title'], $video['course_title']);
        }
        
        sendSuccess($videos, "Videos for module retrieved successfully");
    } else {
        // Get all videos (with module and course info)
        $query = "
            SELECT 
                v.*,
                m.title as module_title,
                m.course_id,
                c.title as course_title
            FROM videos v
            LEFT JOIN modules m ON v.module_id = m.id
            LEFT JOIN courses c ON m.course_id = c.id
            ORDER BY c.title ASC, m.title ASC, v.order_num ASC, v.created_at ASC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $videos = $stmt->fetchAll();
        
        // Format the response
        foreach ($videos as &$video) {
            $video['module'] = [
                'id' => $video['module_id'],
                'title' => $video['module_title'],
                'course_id' => $video['course_id']
            ];
            
            $video['course'] = [
                'id' => $video['course_id'],
                'title' => $video['course_title']
            ];
            
            // Clean up redundant fields
            unset($video['module_title'], $video['course_title']);
        }
        
        sendSuccess($videos, "All videos retrieved successfully");
    }
    
} catch (Exception $e) {
    error_log("Get videos error: " . $e->getMessage());
    sendError("Failed to fetch videos", 500);
}
?>