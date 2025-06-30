<?php
// enrollments.php - Enrollment management API
require_once 'config.php';

setupCORS();

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

// ADD THIS AUTHENTICATION SECTION
// Get and verify user authentication
$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
} elseif (isset($headers['authorization'])) {
    $token = str_replace('Bearer ', '', $headers['authorization']);
}

if (!$token) {
    sendError("Authorization token required", 401);
}

// Verify token and get user
$user = verifyAuthToken($db, $token);

if (!$user) {
    sendError("Invalid or expired token", 401);
}

// UPDATED HELPER FUNCTION TO MATCH YOUR AUTH.PHP
function verifyAuthToken($db, $token) {
    try {
        // Your auth.php uses base64_encode($user['id']) to create tokens
        // So we need to base64_decode to get the user ID
        $decoded_user_id = base64_decode($token);
        
        if (!$decoded_user_id || !is_numeric($decoded_user_id)) {
            // Fallback: try treating token as direct user ID (for testing)
            if (is_numeric($token)) {
                $decoded_user_id = $token;
            } else {
                return null;
            }
        }
        
        $user_id = intval($decoded_user_id);
        
        if ($user_id <= 0) {
            return null;
        }
        
        $query = "SELECT * FROM users WHERE id = :id AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Debug logging
        error_log("Token verification: token=$token, decoded_id=$decoded_user_id, user_found=" . ($user ? 'yes' : 'no'));
        
        return $user;
    } catch (Exception $e) {
        error_log("Token verification error: " . $e->getMessage());
        return null;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$enrollment_id = isset($_GET['id']) ? intval($_GET['id']) : null;
$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : null;

switch ($method) {
    case 'GET':
        handleGetEnrollments($db, $user, $course_id);
        break;
    case 'POST':
        handleCreateEnrollment($db, $user);
        break;
    case 'PUT':
        handleUpdateEnrollment($db, $user, $enrollment_id);
        break;
    case 'DELETE':
        handleDeleteEnrollment($db, $user, $enrollment_id);
        break;
    default:
        sendError("Method not allowed", 405);
}

function handleGetEnrollments($db, $user, $course_id = null) {
    try {
        if ($course_id) {
            // Check if user is enrolled in specific course
            $query = "
                SELECT 
                    e.*,
                    c.title as course_title,
                    c.description as course_description,
                    c.price as course_price,
                    c.thumbnail as course_thumbnail,
                    u.name as instructor_name
                FROM enrollments e
                LEFT JOIN courses c ON e.course_id = c.id
                LEFT JOIN users u ON c.instructor_id = u.id
                WHERE e.student_id = :student_id AND e.course_id = :course_id
            ";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":student_id", $user['id']);
            $stmt->bindParam(":course_id", $course_id);
            $stmt->execute();
            
            $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($enrollment) {
                $enrollment = formatEnrollmentData($enrollment);
                sendSuccess($enrollment);
            } else {
                sendSuccess(null, "Not enrolled");
            }
        } else {
            // Get all enrollments for current user
            $query = "
                SELECT 
                    e.*,
                    c.title as course_title,
                    c.description as course_description,
                    c.price as course_price,
                    c.thumbnail as course_thumbnail,
                    u.name as instructor_name,
                    COUNT(m.id) as module_count
                FROM enrollments e
                LEFT JOIN courses c ON e.course_id = c.id
                LEFT JOIN users u ON c.instructor_id = u.id
                LEFT JOIN modules m ON c.id = m.course_id AND m.is_published = 1
                WHERE e.student_id = :student_id
                GROUP BY e.id
                ORDER BY e.enrolled_at DESC
            ";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":student_id", $user['id']);
            $stmt->execute();
            
            $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format data for frontend
            foreach ($enrollments as &$enrollment) {
                $enrollment = formatEnrollmentData($enrollment);
            }
            
            sendSuccess($enrollments);
        }
    } catch (Exception $e) {
        error_log("Get enrollments error: " . $e->getMessage());
        sendError("Failed to fetch enrollments", 500);
    }
}

function formatEnrollmentData($enrollment) {
    return [
        'id' => intval($enrollment['id']),
        'course_id' => intval($enrollment['course_id']),
        'student_id' => intval($enrollment['student_id']),
        'enrolled_at' => $enrollment['enrolled_at'],
        'completed_at' => $enrollment['completed_at'],
        'status' => $enrollment['status'],
        'progress' => floatval($enrollment['progress']),
        'course' => [
            'id' => intval($enrollment['course_id']),
            'title' => $enrollment['course_title'],
            'description' => $enrollment['course_description'],
            'price' => floatval($enrollment['course_price']),
            'thumbnail' => $enrollment['course_thumbnail'],
            'instructor_name' => $enrollment['instructor_name'],
            'module_count' => intval($enrollment['module_count'] ?? 0)
        ]
    ];
}

function handleCreateEnrollment($db, $user) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $input = sanitizeInput($input);
        
        // Validate required fields
        $required = ['course_id'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        $course_id = intval($input['course_id']);
        $student_id = $user['id'];
        
        // Check if course exists and is published
        $courseQuery = "SELECT id, title, price, is_published FROM courses WHERE id = :course_id";
        $courseStmt = $db->prepare($courseQuery);
        $courseStmt->bindParam(":course_id", $course_id);
        $courseStmt->execute();
        
        if ($courseStmt->rowCount() == 0) {
            sendError("Course not found", 404);
        }
        
        $course = $courseStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$course['is_published']) {
            sendError("Course is not available for enrollment", 400);
        }
        
        // Check if user is already enrolled
        $checkQuery = "SELECT id FROM enrollments WHERE student_id = :student_id AND course_id = :course_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":student_id", $student_id);
        $checkStmt->bindParam(":course_id", $course_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            sendError("Already enrolled in this course", 409);
        }
        
        // Check if user has STUDENT role
        if ($user['role'] !== 'STUDENT') {
            sendError("Only students can enroll in courses", 403);
        }
        
        // Create enrollment
        $status = 'ACTIVE';
        $progress = 0.00;
        
        $query = "
            INSERT INTO enrollments (student_id, course_id, status, progress) 
            VALUES (:student_id, :course_id, :status, :progress)
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->bindParam(":course_id", $course_id);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":progress", $progress);
        
        if ($stmt->execute()) {
            $enrollment_id = $db->lastInsertId();
            
            // Get the created enrollment with course data
            $getQuery = "
                SELECT 
                    e.*,
                    c.title as course_title,
                    c.description as course_description,
                    c.price as course_price,
                    c.thumbnail as course_thumbnail,
                    u.name as instructor_name
                FROM enrollments e
                LEFT JOIN courses c ON e.course_id = c.id
                LEFT JOIN users u ON c.instructor_id = u.id
                WHERE e.id = :enrollment_id
            ";
            $getStmt = $db->prepare($getQuery);
            $getStmt->bindParam(":enrollment_id", $enrollment_id);
            $getStmt->execute();
            
            $enrollment = $getStmt->fetch(PDO::FETCH_ASSOC);
            $enrollment = formatEnrollmentData($enrollment);
            
            sendSuccess($enrollment, "Successfully enrolled in course");
        } else {
            sendError("Failed to create enrollment", 500);
        }
    } catch (Exception $e) {
        error_log("Create enrollment error: " . $e->getMessage());
        sendError("Failed to enroll in course", 500);
    }
}

function handleUpdateEnrollment($db, $user, $enrollment_id) {
    try {
        if (!$enrollment_id) {
            sendError("Enrollment ID is required", 400);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $input = sanitizeInput($input);
        
        // Check if enrollment exists and belongs to user
        $checkQuery = "SELECT id, student_id FROM enrollments WHERE id = :enrollment_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":enrollment_id", $enrollment_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            sendError("Enrollment not found", 404);
        }
        
        $enrollment = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        // Only allow students to update their own enrollments, or admins/instructors
        if ($user['role'] === 'STUDENT' && $enrollment['student_id'] != $user['id']) {
            sendError("You can only update your own enrollments", 403);
        }
        
        // Prepare update data
        $updateFields = [];
        $params = [':enrollment_id' => $enrollment_id];
        
        if (isset($input['status']) && in_array($input['status'], ['ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED'])) {
            $updateFields[] = "status = :status";
            $params[':status'] = $input['status'];
        }
        
        if (isset($input['progress']) && is_numeric($input['progress'])) {
            $progress = max(0, min(100, floatval($input['progress'])));
            $updateFields[] = "progress = :progress";
            $params[':progress'] = $progress;
            
            // Auto-complete if progress reaches 100%
            if ($progress >= 100) {
                $updateFields[] = "completed_at = CURRENT_TIMESTAMP";
                $updateFields[] = "status = 'COMPLETED'";
            }
        }
        
        if (empty($updateFields)) {
            sendError("No valid fields to update", 400);
        }
        
        $query = "UPDATE enrollments SET " . implode(', ', $updateFields) . " WHERE id = :enrollment_id";
        
        $stmt = $db->prepare($query);
        
        if ($stmt->execute($params)) {
            // Get updated enrollment data
            $getQuery = "
                SELECT 
                    e.*,
                    c.title as course_title,
                    c.description as course_description,
                    c.price as course_price,
                    c.thumbnail as course_thumbnail,
                    u.name as instructor_name
                FROM enrollments e
                LEFT JOIN courses c ON e.course_id = c.id
                LEFT JOIN users u ON c.instructor_id = u.id
                WHERE e.id = :enrollment_id
            ";
            $getStmt = $db->prepare($getQuery);
            $getStmt->bindParam(":enrollment_id", $enrollment_id);
            $getStmt->execute();
            
            $enrollment = $getStmt->fetch(PDO::FETCH_ASSOC);
            $enrollment = formatEnrollmentData($enrollment);
            
            sendSuccess($enrollment, "Enrollment updated successfully");
        } else {
            sendError("Failed to update enrollment", 500);
        }
    } catch (Exception $e) {
        error_log("Update enrollment error: " . $e->getMessage());
        sendError("Failed to update enrollment", 500);
    }
}

function handleDeleteEnrollment($db, $user, $enrollment_id) {
    try {
        if (!$enrollment_id) {
            sendError("Enrollment ID is required", 400);
        }
        
        // Check if enrollment exists and belongs to user
        $checkQuery = "SELECT id, student_id FROM enrollments WHERE id = :enrollment_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":enrollment_id", $enrollment_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            sendError("Enrollment not found", 404);
        }
        
        $enrollment = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        // Only allow students to delete their own enrollments, or admins
        if ($user['role'] === 'STUDENT' && $enrollment['student_id'] != $user['id']) {
            sendError("You can only unenroll from your own courses", 403);
        }
        
        if ($user['role'] === 'INSTRUCTOR') {
            sendError("Instructors cannot unenroll students", 403);
        }
        
        $query = "DELETE FROM enrollments WHERE id = :enrollment_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":enrollment_id", $enrollment_id);
        
        if ($stmt->execute()) {
            sendSuccess(null, "Successfully unenrolled from course");
        } else {
            sendError("Failed to unenroll from course", 500);
        }
    } catch (Exception $e) {
        error_log("Delete enrollment error: " . $e->getMessage());
        sendError("Failed to unenroll from course", 500);
    }
}
?>