<?php
// api/delete_video.php
// header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow DELETE method
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(array(
        "success" => false,
        "message" => "Method not allowed. Use DELETE method."
    ));
    exit();
}

// Include database connection
include_once 'config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database connection failed"
    ));
    exit();
}

// Get video ID from query parameter
$video_id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$video_id || $video_id <= 0) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Valid video ID is required"
    ));
    exit();
}

try {
    // First, check if video exists and get its details
    $checkQuery = "SELECT id, title FROM videos WHERE id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$video_id]);
    $video = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$video) {
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Video not found"
        ));
        exit();
    }
    
    // Begin transaction for data integrity
    $db->beginTransaction();
    
    try {
        // Delete related data first to maintain referential integrity
        
        // Delete video progress records
        $deleteProgressQuery = "DELETE FROM video_progress WHERE video_id = ?";
        $deleteProgressStmt = $db->prepare($deleteProgressQuery);
        $deleteProgressStmt->execute([$video_id]);
        
        // Delete comments on this video
        $deleteCommentsQuery = "DELETE FROM comments WHERE video_id = ?";
        $deleteCommentsStmt = $db->prepare($deleteCommentsQuery);
        $deleteCommentsStmt->execute([$video_id]);
        
        // Update tasks that reference this video (set related_video_id to NULL)
        $updateTasksQuery = "UPDATE tasks SET related_video_id = NULL WHERE related_video_id = ?";
        $updateTasksStmt = $db->prepare($updateTasksQuery);
        $updateTasksStmt->execute([$video_id]);
        
        // Finally, delete the video itself
        $deleteVideoQuery = "DELETE FROM videos WHERE id = ?";
        $deleteVideoStmt = $db->prepare($deleteVideoQuery);
        $deleteVideoStmt->execute([$video_id]);
        
        // Check if video was actually deleted
        if ($deleteVideoStmt->rowCount() === 0) {
            throw new Exception("Failed to delete video");
        }
        
        // Commit the transaction
        $db->commit();
        
        // Return success response
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Video '{$video['title']}' deleted successfully",
            "deleted_video_id" => $video_id
        ));
        
    } catch (Exception $e) {
        // Rollback transaction if anything fails
        $db->rollback();
        throw $e;
    }
    
} catch (PDOException $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $exception->getMessage()
    ));
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error deleting video: " . $exception->getMessage()
    ));
}
?>