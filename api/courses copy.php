<?php
// courses.php - Course management API
require_once 'config.php';

setupCORS();


$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$course_id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        handleGetCourses($db, $course_id);
        break;
    case 'POST':
        handleCreateCourse($db, $user);
        break;
    case 'PUT':
        handleUpdateCourse($db, $user, $course_id);
        break;
    case 'DELETE':
        handleDeleteCourse($db, $user, $course_id);
        break;
    default:
        sendError("Method not allowed", 405);
}

function handleGetCourses($db, $course_id = null) {
    try {
        if ($course_id) {
            // Get single course with related data
            $query = "
                SELECT 
                    c.*,
                    u.name as instructor_name,
                    u.email as instructor_email,
                    u.avatar as instructor_avatar,
                    vp.watched_seconds as progress,
                    COUNT(DISTINCT e.id) as enrollment_count,
                    COUNT(DISTINCT m.id) as module_count
                FROM courses c
                LEFT JOIN users u ON c.instructor_id = u.id
                LEFT JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN modules m ON c.id = m.course_id
                LEFT JOIN video_progress vp ON vp.video_id = c.id
                WHERE c.id = :course_id
                GROUP BY c.id
            ";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":course_id", $course_id);
            $stmt->execute();
            
            if ($stmt->rowCount() == 0) {
                sendError("Course not found", 404);
            }
            
            $course = $stmt->fetch();
            
            // Add instructor object for consistency with frontend
            $course['instructor'] = [
                'id' => $course['instructor_id'],
                'name' => $course['instructor_name'],
                'email' => $course['instructor_email'],
                'avatar' => $course['instructor_avatar']
            ];
            
            // Add modules and enrollments as arrays for consistency
            $course['modules'] = [];
            $course['enrollments'] = [];
            
            // Get modules
            $moduleQuery = "SELECT * FROM modules WHERE course_id = :course_id ORDER BY order_num";
            $moduleStmt = $db->prepare($moduleQuery);
            $moduleStmt->bindParam(":course_id", $course_id);
            $moduleStmt->execute();
            $course['modules'] = $moduleStmt->fetchAll();
            
            // Get enrollments
            $enrollmentQuery = "SELECT * FROM enrollments WHERE course_id = :course_id";
            $enrollmentStmt = $db->prepare($enrollmentQuery);
            $enrollmentStmt->bindParam(":course_id", $course_id);
            $enrollmentStmt->execute();
            $course['enrollments'] = $enrollmentStmt->fetchAll();
            
            // Clean up redundant fields
            unset($course['instructor_name'], $course['instructor_email'], $course['instructor_avatar']);
            unset($course['enrollment_count'], $course['module_count']);
            
            sendSuccess($course);
        } else {
            // Get all courses with related data
            $query = "
                SELECT 
                    c.*,
                    u.name as instructor_name,
                    u.email as instructor_email,
                    u.avatar as instructor_avatar,
                    vp.watched_seconds as progress,
                    COUNT(DISTINCT e.id) as enrollment_count,
                    COUNT(DISTINCT m.id) as module_count
                FROM courses c
                LEFT JOIN users u ON c.instructor_id = u.id
                LEFT JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN modules m ON c.id = m.course_id
                LEFT JOIN video_progress vp ON vp.video_id = c.id
                GROUP BY c.id
                ORDER BY c.created_at DESC
            ";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $courses = $stmt->fetchAll();
            
            // Format data for frontend consistency
            foreach ($courses as &$course) {
                $course['instructor'] = [
                    'id' => $course['instructor_id'],
                    'name' => $course['instructor_name'],
                    'email' => $course['instructor_email'],
                    'avatar' => $course['instructor_avatar']
                ];
                
                // Create empty arrays for modules and enrollments
                $course['modules'] = array_fill(0, $course['module_count'], null);
                $course['enrollments'] = array_fill(0, $course['enrollment_count'], null);
                
                // Clean up redundant fields
                unset($course['instructor_name'], $course['instructor_email'], $course['instructor_avatar']);
                unset($course['enrollment_count'], $course['module_count']);
            }
            
            sendSuccess($courses);
        }
    } catch (Exception $e) {
        error_log("Get courses error: " . $e->getMessage());
        sendError("Failed to fetch courses", 500);
    }
}

function handleCreateCourse($db, $user) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $input = sanitizeInput($input);
        
        // Validate required fields
        $required = ['title', 'description', 'instructor_id'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        // Verify instructor exists and is active
        $instructorQuery = "SELECT id FROM users WHERE id = :instructor_id AND role = 'INSTRUCTOR' AND is_active = 1";
        $instructorStmt = $db->prepare($instructorQuery);
        $instructorStmt->bindParam(":instructor_id", $input['instructor_id']);
        $instructorStmt->execute();
        
        if ($instructorStmt->rowCount() == 0) {
            sendError("Invalid instructor selected", 400);
        }
        
        // Prepare data
        $title = $input['title'];
        $description = $input['description'];
        $thumbnail = isset($input['thumbnail']) ? $input['thumbnail'] : null;        
        $video_url = isset($input['video_url']) ? $input['video_url'] : null;
        $price = isset($input['price']) ? floatval($input['price']) : 0.00;
        $is_published = isset($input['is_published']) ? ($input['is_published'] ? 1 : 0) : 0;
        $instructor_id = intval($input['instructor_id']);
        
        $query = "
            INSERT INTO courses (title, description, thumbnail, price, is_published, instructor_id, youtube_url) 
            VALUES (:title, :description, :thumbnail, :price, :is_published, :instructor_id, :video_url)
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":thumbnail", $thumbnail);
        $stmt->bindParam(":price", $price);
        $stmt->bindParam(":is_published", $is_published);
        $stmt->bindParam(":instructor_id", $instructor_id);
        $stmt->bindParam(":video_url", $video_url);
        
        if ($stmt->execute()) {
            $course_id = $db->lastInsertId();
            
            // Get the created course with instructor data
            $getQuery = "
                SELECT c.*, u.name as instructor_name, u.email as instructor_email 
                FROM courses c 
                LEFT JOIN users u ON c.instructor_id = u.id 
                WHERE c.id = :course_id
            ";
            $getStmt = $db->prepare($getQuery);
            $getStmt->bindParam(":course_id", $course_id);
            $getStmt->execute();
            
            $course = $getStmt->fetch();
            $course['instructor'] = [
                'id' => $course['instructor_id'],
                'name' => $course['instructor_name'],
                'email' => $course['instructor_email']
            ];
            $course['modules'] = [];
            $course['enrollments'] = [];
            
            unset($course['instructor_name'], $course['instructor_email']);
            
            sendSuccess($course, "Course created successfully");
        } else {
            sendError("Failed to create course", 500);
        }
    } catch (Exception $e) {
        error_log("Create course error: " . $e->getMessage());
        sendError("Failed to create course", 500);
    }
}

function handleUpdateCourse($db, $user, $course_id) {
    try {
        if (!$course_id) {
            sendError("Course ID is required", 400);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $input = sanitizeInput($input);
        
        // Check if course exists
        $checkQuery = "SELECT id FROM courses WHERE id = :course_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":course_id", $course_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            sendError("Course not found", 404);
        }
        
        // Validate required fields
        $required = ['title', 'description', 'instructor_id'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        // Verify instructor exists and is active
        $instructorQuery = "SELECT id FROM users WHERE id = :instructor_id AND role = 'INSTRUCTOR' AND is_active = 1";
        $instructorStmt = $db->prepare($instructorQuery);
        $instructorStmt->bindParam(":instructor_id", $input['instructor_id']);
        $instructorStmt->execute();
        
        if ($instructorStmt->rowCount() == 0) {
            sendError("Invalid instructor selected", 400);
        }
        
        // Prepare data
        $title = $input['title'];
        $description = $input['description'];
        $thumbnail = isset($input['thumbnail']) ? $input['thumbnail'] : null;
        $video_url = isset($input['video_url']) ? $input['video_url'] : null;
        $price = isset($input['price']) ? floatval($input['price']) : 0.00;
        $is_published = isset($input['is_published']) ? ($input['is_published'] ? 1 : 0) : 0;
        $instructor_id = intval($input['instructor_id']);
        
        $query = "
            UPDATE courses 
            SET title = :title, description = :description, thumbnail = :thumbnail, 
                price = :price, is_published = :is_published, instructor_id = :instructor_id, youtube_url = :video_url,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :course_id
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":thumbnail", $thumbnail);
        $stmt->bindParam(":price", $price);
        $stmt->bindParam(":is_published", $is_published);
        $stmt->bindParam(":instructor_id", $instructor_id);
        $stmt->bindParam(":video_url", $video_url);
        $stmt->bindParam(":course_id", $course_id);
        
        if ($stmt->execute()) {
            // Get the updated course with instructor data
            $getQuery = "
                SELECT c.*, u.name as instructor_name, u.email as instructor_email 
                FROM courses c 
                LEFT JOIN users u ON c.instructor_id = u.id 
                WHERE c.id = :course_id
            ";
            $getStmt = $db->prepare($getQuery);
            $getStmt->bindParam(":course_id", $course_id);
            $getStmt->execute();
            
            $course = $getStmt->fetch();
            $course['instructor'] = [
                'id' => $course['instructor_id'],
                'name' => $course['instructor_name'],
                'email' => $course['instructor_email']
            ];
            $course['modules'] = [];
            $course['enrollments'] = [];
            
            unset($course['instructor_name'], $course['instructor_email']);
            
            sendSuccess($course, "Course updated successfully");
        } else {
            sendError("Failed to update course", 500);
        }
    } catch (Exception $e) {
        error_log("Update course error: " . $e->getMessage());
        sendError("Failed to update course", 500);
    }
}

function handleDeleteCourse($db, $user, $course_id) {
    try {
        if (!$course_id) {
            sendError("Course ID is required", 400);
        }
        
        // Check if course exists
        $checkQuery = "SELECT id FROM courses WHERE id = :course_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":course_id", $course_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            sendError("Course not found", 404);
        }
        
        // Start transaction
        $db->beginTransaction();
        
        try {
            // The foreign key constraints will handle cascading deletes
            // for modules, videos, enrollments, etc.
            $query = "DELETE FROM courses WHERE id = :course_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":course_id", $course_id);
            
            if ($stmt->execute()) {
                $db->commit();
                sendSuccess(null, "Course deleted successfully");
            } else {
                $db->rollBack();
                sendError("Failed to delete course", 500);
            }
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    } catch (Exception $e) {
        error_log("Delete course error: " . $e->getMessage());
        sendError("Failed to delete course", 500);
    }
}
?>