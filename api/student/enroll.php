<?php
// student/enroll.php - Handle course enrollment
require_once '../config.php';

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
    handleEnrollment($db, $user_id);
} else {
    sendError("Method not allowed", 405);
}

function handleEnrollment($db, $user_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError("Invalid JSON data", 400);
    }
    
    $course_id = $input['course_id'] ?? null;
    
    if (!$course_id) {
        sendError("Course ID is required", 400);
    }
    
    try {
        // Check if course exists and is published
        $courseQuery = "SELECT id, title, price FROM courses WHERE id = :course_id AND is_published = 1";
        $courseStmt = $db->prepare($courseQuery);
        $courseStmt->bindParam(":course_id", $course_id);
        $courseStmt->execute();
        
        $course = $courseStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$course) {
            sendError("Course not found or not available", 404);
        }
        
        // Check if already enrolled
        $enrollmentQuery = "SELECT id, status FROM enrollments WHERE student_id = :user_id AND course_id = :course_id";
        $enrollmentStmt = $db->prepare($enrollmentQuery);
        $enrollmentStmt->bindParam(":user_id", $user_id);
        $enrollmentStmt->bindParam(":course_id", $course_id);
        $enrollmentStmt->execute();
        
        $existingEnrollment = $enrollmentStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingEnrollment) {
            if ($existingEnrollment['status'] === 'ACTIVE') {
                sendError("You are already enrolled in this course", 400);
            } else {
                // Reactivate enrollment
                $updateQuery = "UPDATE enrollments SET status = 'ACTIVE', enrolled_at = NOW() WHERE id = :enrollment_id";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->bindParam(":enrollment_id", $existingEnrollment['id']);
                
                if ($updateStmt->execute()) {
                    sendSuccess(['course_id' => $course_id], "Successfully re-enrolled in course");
                } else {
                    sendError("Failed to re-enroll in course", 500);
                }
                return;
            }
        }
        
        // Create new enrollment
        $insertQuery = "INSERT INTO enrollments (student_id, course_id, status, enrolled_at) VALUES (:user_id, :course_id, 'ACTIVE', NOW())";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->bindParam(":user_id", $user_id);
        $insertStmt->bindParam(":course_id", $course_id);
        
        if ($insertStmt->execute()) {
            sendSuccess([
                'course_id' => $course_id,
                'course_title' => $course['title'],
                'enrollment_id' => $db->lastInsertId()
            ], "Successfully enrolled in course");
        } else {
            sendError("Failed to enroll in course", 500);
        }
        
    } catch (Exception $e) {
        error_log("Enrollment error: " . $e->getMessage());
        sendError("Failed to process enrollment", 500);
    }
}
?>