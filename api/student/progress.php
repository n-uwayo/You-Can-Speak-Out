<?php
// student/progress.php - Video progress tracking API
require_once '../../config.php';

setupCORS();

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

// Authenticate user
$user_id = authenticateUser();
$user = getUser($db, $user_id);

if (!$user || $user['role'] !== 'STUDENT') {
    sendError("Access denied. Students only.", 403);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    handleUpdateProgress($db, $user_id);
} elseif ($method === 'GET') {
    handleGetProgress($db, $user_id);
} else {
    sendError("Method not allowed", 405);
}

function handleUpdateProgress($db, $user_id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $action = $input['action'] ?? '';
        
        if ($action !== 'update_video_progress') {
            sendError("Invalid action", 400);
        }
        
        $video_id = intval($input['video_id'] ?? 0);
        $watched_seconds = intval($input['watched_seconds'] ?? 0);
        $is_completed = (bool)($input['is_completed'] ?? false);
        
        if (!$video_id) {
            sendError("Video ID is required", 400);
        }
        
        if ($watched_seconds < 0) {
            sendError("Watched seconds cannot be negative", 400);
        }
        
        // Check if progress record exists
        $checkQuery = "SELECT id, watched_seconds, is_completed FROM video_progress WHERE video_id = :video_id AND user_id = :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":video_id", $video_id);
        $checkStmt->bindParam(":user_id", $user_id);
        $checkStmt->execute();
        
        $existingProgress = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingProgress) {
            // Update existing progress
            // Only update if new watched time is greater or if marking as completed
            $shouldUpdate = false;
            $newWatchedSeconds = $watched_seconds;
            $newIsCompleted = $is_completed;
            
            if ($watched_seconds > $existingProgress['watched_seconds']) {
                $shouldUpdate = true;
            }
            
            if ($is_completed && !$existingProgress['is_completed']) {
                $shouldUpdate = true;
                $newIsCompleted = true;
            }
            
            if ($shouldUpdate) {
                $updateQuery = "
                    UPDATE video_progress 
                    SET watched_seconds = :watched_seconds, 
                        is_completed = :is_completed, 
                        updated_at = CURRENT_TIMESTAMP 
                    WHERE video_id = :video_id AND user_id = :user_id
                ";
                
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->bindParam(":watched_seconds", $newWatchedSeconds);
                $updateStmt->bindParam(":is_completed", $newIsCompleted);
                $updateStmt->bindParam(":video_id", $video_id);
                $updateStmt->bindParam(":user_id", $user_id);
                
                if ($updateStmt->execute()) {
                    // Update enrollment progress if video is completed
                    if ($newIsCompleted) {
                        updateEnrollmentProgress($db, $user_id, $video_id);
                    }
                    
                    sendSuccess([
                        'video_id' => $video_id,
                        'watched_seconds' => $newWatchedSeconds,
                        'is_completed' => $newIsCompleted,
                        'updated' => true
                    ], "Progress updated successfully");
                } else {
                    sendError("Failed to update progress", 500);
                }
            } else {
                // No update needed
                sendSuccess([
                    'video_id' => $video_id,
                    'watched_seconds' => $existingProgress['watched_seconds'],
                    'is_completed' => (bool)$existingProgress['is_completed'],
                    'updated' => false
                ], "Progress already up to date");
            }
        } else {
            // Create new progress record
            $insertQuery = "
                INSERT INTO video_progress (video_id, user_id, watched_seconds, is_completed) 
                VALUES (:video_id, :user_id, :watched_seconds, :is_completed)
            ";
            
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->bindParam(":video_id", $video_id);
            $insertStmt->bindParam(":user_id", $user_id);
            $insertStmt->bindParam(":watched_seconds", $watched_seconds);
            $insertStmt->bindParam(":is_completed", $is_completed);
            
            if ($insertStmt->execute()) {
                // Update enrollment progress if video is completed
                if ($is_completed) {
                    updateEnrollmentProgress($db, $user_id, $video_id);
                }
                
                sendSuccess([
                    'video_id' => $video_id,
                    'watched_seconds' => $watched_seconds,
                    'is_completed' => $is_completed,
                    'created' => true
                ], "Progress created successfully");
            } else {
                sendError("Failed to create progress record", 500);
            }
        }
        
    } catch (Exception $e) {
        error_log("Update progress error: " . $e->getMessage());
        sendError("Failed to update progress", 500);
    }
}

function handleGetProgress($db, $user_id) {
    try {
        $video_id = isset($_GET['video_id']) ? intval($_GET['video_id']) : null;
        $course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : null;
        
        if ($video_id) {
            // Get progress for specific video
            $query = "
                SELECT video_id, watched_seconds, is_completed, created_at, updated_at 
                FROM video_progress 
                WHERE video_id = :video_id AND user_id = :user_id
            ";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":video_id", $video_id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            $progress = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($progress) {
                $progress['is_completed'] = (bool)$progress['is_completed'];
                sendSuccess($progress, "Progress retrieved successfully");
            } else {
                sendSuccess([
                    'video_id' => $video_id,
                    'watched_seconds' => 0,
                    'is_completed' => false,
                    'created_at' => null,
                    'updated_at' => null
                ], "No progress found");
            }
        } elseif ($course_id) {
            // Get progress for all videos in a course (in this case, just the course video)
            $query = "
                SELECT vp.video_id, vp.watched_seconds, vp.is_completed, vp.created_at, vp.updated_at 
                FROM video_progress vp
                INNER JOIN courses c ON vp.video_id = c.id
                WHERE c.id = :course_id AND vp.user_id = :user_id
            ";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":course_id", $course_id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            $progressList = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert is_completed to boolean
            foreach ($progressList as &$progress) {
                $progress['is_completed'] = (bool)$progress['is_completed'];
            }
            
            sendSuccess($progressList, "Course progress retrieved successfully");
        } else {
            // Get all progress for user
            $query = "
                SELECT video_id, watched_seconds, is_completed, created_at, updated_at 
                FROM video_progress 
                WHERE user_id = :user_id 
                ORDER BY updated_at DESC
            ";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            $progressList = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert is_completed to boolean
            foreach ($progressList as &$progress) {
                $progress['is_completed'] = (bool)$progress['is_completed'];
            }
            
            sendSuccess($progressList, "All progress retrieved successfully");
        }
        
    } catch (Exception $e) {
        error_log("Get progress error: " . $e->getMessage());
        sendError("Failed to retrieve progress", 500);
    }
}

function updateEnrollmentProgress($db, $user_id, $video_id) {
    try {
        // Since video_id is actually course_id in our simplified structure,
        // update the enrollment progress to 100% when video is completed
        $updateEnrollmentQuery = "
            UPDATE enrollments 
            SET progress = 100, 
                completed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE student_id = :user_id AND course_id = :course_id
        ";
        
        $updateStmt = $db->prepare($updateEnrollmentQuery);
        $updateStmt->bindParam(":user_id", $user_id);
        $updateStmt->bindParam(":course_id", $video_id); // video_id is course_id
        $updateStmt->execute();
        
    } catch (Exception $e) {
        error_log("Update enrollment progress error: " . $e->getMessage());
        // Don't throw error here, just log it
    }
}
?>