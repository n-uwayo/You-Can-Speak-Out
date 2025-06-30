<?php
// tasks.php - Task management API
require_once 'config.php';

setupCORS();

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$task_id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        handleGetTasks($db, $task_id);
        break;
    case 'POST':
        handleCreateTask($db, $user);
        break;
    case 'PUT':
        handleUpdateTask($db, $user, $task_id);
        break;
    case 'DELETE':
        handleDeleteTask($db, $user, $task_id);
        break;
    default:
        sendError("Method not allowed", 405);
}

function handleGetTasks($db, $task_id = null) {
    try {
        if ($task_id) {
            // Get single task with related data
            $query = "
                SELECT 
                    t.*,
                    c.id as course_id,
                    c.title as course_title,
                    COUNT(DISTINCT ts.id) as submission_count
                FROM tasks t
                LEFT JOIN courses c ON t.course_id = c.id
                LEFT JOIN task_submissions ts ON t.id = ts.task_id
                WHERE t.id = :task_id
                GROUP BY t.id
            ";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":task_id", $task_id);
            $stmt->execute();
            
            if ($stmt->rowCount() == 0) {
                sendError("Task not found", 404);
            }
            
            $task = $stmt->fetch();
            $task = formatTaskData($task);
            
            sendSuccess($task);
        } else {
            // Get all tasks with related data
            $query = "
                SELECT 
                    t.*,
                    c.id as course_id,
                    c.title as course_title,
                    COUNT(DISTINCT ts.id) as submission_count
                FROM tasks t
                LEFT JOIN courses c ON t.course_id = c.id
                LEFT JOIN task_submissions ts ON t.id = ts.task_id
                GROUP BY t.id
                ORDER BY t.created_at DESC
            ";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $tasks = $stmt->fetchAll();
            
            // Format data for frontend consistency
            foreach ($tasks as &$task) {
                $task = formatTaskData($task);
            }
            
            sendSuccess($tasks);
        }
    } catch (Exception $e) {
        error_log("Get tasks error: " . $e->getMessage());
        sendError("Failed to fetch tasks", 500);
    }
}

function formatTaskData($task) {
    // Format task data to match frontend expectations
    $formatted = [
        'id' => $task['id'],
        'title' => $task['title'],
        'description' => $task['description'],
        'instructions' => $task['instructions'],
        'dueDate' => $task['due_date'],
        'points' => intval($task['points']),
        'taskType' => $task['task_type'],
        'status' => $task['status'],
        'courseId' => $task['course_id'],
        'createdAt' => $task['created_at'],
        'updatedAt' => $task['updated_at']
    ];
    
    // Add course information
    if ($task['course_title']) {
        $formatted['course'] = [
            'id' => $task['course_id'],
            'title' => $task['course_title']
        ];
    }
    
    // Add submissions array (empty for now, can be populated with actual submissions)
    $formatted['submissions'] = array_fill(0, intval($task['submission_count'] ?? 0), null);
    
    return $formatted;
}

function handleCreateTask($db, $user) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $input = sanitizeInput($input);
        
        // Validate required fields
        $required = ['title', 'description', 'courseId', 'dueDate'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        // Verify course exists and user has access
        $courseQuery = "
            SELECT id, instructor_id 
            FROM courses 
            WHERE id = :course_id
        ";
        $courseStmt = $db->prepare($courseQuery);
        $courseStmt->bindParam(":course_id", $input['courseId']);
        $courseStmt->execute();
        
        if ($courseStmt->rowCount() == 0) {
            sendError("Invalid course selected", 400);
        }
        
        $course = $courseStmt->fetch();
        
        // Check if user is admin or the instructor of the course
        // if ($user['role'] !== 'ADMIN' && $course['instructor_id'] != $user['id']) {
        //     sendError("You can only create tasks for your own courses", 403);
        // }
        
        // Prepare data
        $title = $input['title'];
        $description = $input['description'];
        $instructions = isset($input['instructions']) ? $input['instructions'] : null;
        $due_date = date('Y-m-d H:i:s', strtotime($input['dueDate']));
        $points = isset($input['points']) ? intval($input['points']) : 0;
        $task_type = isset($input['taskType']) ? $input['taskType'] : 'TEXT';
        $status = isset($input['status']) ? $input['status'] : 'ACTIVE';
        $course_id = intval($input['courseId']);
        
        // Validate enum values
        if (!in_array($task_type, ['TEXT', 'FILE', 'BOTH'])) {
            $task_type = 'TEXT';
        }
        
        if (!in_array($status, ['ACTIVE', 'INACTIVE', 'ARCHIVED'])) {
            $status = 'ACTIVE';
        }
        
        $query = "
            INSERT INTO tasks (title, description, instructions, due_date, points, task_type, status, course_id) 
            VALUES (:title, :description, :instructions, :due_date, :points, :task_type, :status, :course_id)
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":instructions", $instructions);
        $stmt->bindParam(":due_date", $due_date);
        $stmt->bindParam(":points", $points);
        $stmt->bindParam(":task_type", $task_type);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":course_id", $course_id);
        
        if ($stmt->execute()) {
            $task_id = $db->lastInsertId();
            
            // Get the created task with full data
            handleGetTasks($db, $task_id);
        } else {
            sendError("Failed to create task", 500);
        }
    } catch (Exception $e) {
        error_log("Create task error: " . $e->getMessage());
        sendError("Failed to create task", 500);
    }
}

function handleUpdateTask($db, $user, $task_id) {
    try {
        if (!$task_id) {
            sendError("Task ID is required", 400);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $input = sanitizeInput($input);
        
        // Check if task exists and user has access
        $checkQuery = "
            SELECT t.id, c.instructor_id 
            FROM tasks t
            LEFT JOIN courses c ON t.course_id = c.id
            WHERE t.id = :task_id
        ";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":task_id", $task_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            sendError("Task not found", 404);
        }
        
        $task = $checkStmt->fetch();
        
        // Check if user is admin or the instructor of the course
        // if ($user['role'] !== 'ADMIN' && $task['instructor_id'] != $user['id']) {
        //     sendError("You can only edit tasks for your own courses", 403);
        // }
        
        // Validate required fields
        $required = ['title', 'description', 'courseId', 'dueDate'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        // Verify course exists
        $courseQuery = "SELECT id FROM courses WHERE id = :course_id";
        $courseStmt = $db->prepare($courseQuery);
        $courseStmt->bindParam(":course_id", $input['courseId']);
        $courseStmt->execute();
        
        if ($courseStmt->rowCount() == 0) {
            sendError("Invalid course selected", 400);
        }
        
        // Prepare data
        $title = $input['title'];
        $description = $input['description'];
        $instructions = isset($input['instructions']) ? $input['instructions'] : null;
        $due_date = date('Y-m-d H:i:s', strtotime($input['dueDate']));
        $points = isset($input['points']) ? intval($input['points']) : 0;
        $task_type = isset($input['taskType']) ? $input['taskType'] : 'TEXT';
        $status = isset($input['status']) ? $input['status'] : 'ACTIVE';
        $course_id = intval($input['courseId']);
        
        // Validate enum values
        if (!in_array($task_type, ['TEXT', 'FILE', 'BOTH'])) {
            $task_type = 'TEXT';
        }
        
        if (!in_array($status, ['ACTIVE', 'INACTIVE', 'ARCHIVED'])) {
            $status = 'ACTIVE';
        }
        
        $query = "
            UPDATE tasks 
            SET title = :title, description = :description, instructions = :instructions,
                due_date = :due_date, points = :points, task_type = :task_type, 
                status = :status, course_id = :course_id,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :task_id
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":instructions", $instructions);
        $stmt->bindParam(":due_date", $due_date);
        $stmt->bindParam(":points", $points);
        $stmt->bindParam(":task_type", $task_type);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":course_id", $course_id);
        $stmt->bindParam(":task_id", $task_id);
        
        if ($stmt->execute()) {
            // Get the updated task with full data
            handleGetTasks($db, $task_id);
        } else {
            sendError("Failed to update task", 500);
        }
    } catch (Exception $e) {
        error_log("Update task error: " . $e->getMessage());
        sendError("Failed to update task", 500);
    }
}

function handleDeleteTask($db, $user, $task_id) {
    try {
        if (!$task_id) {
            sendError("Task ID is required", 400);
        }
        
        // Check if task exists and user has access
        $checkQuery = "
            SELECT t.id, c.instructor_id 
            FROM tasks t
            LEFT JOIN courses c ON t.course_id = c.id
            WHERE t.id = :task_id
        ";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":task_id", $task_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            sendError("Task not found", 404);
        }
        
        $task = $checkStmt->fetch();
        
        // Check if user is admin or the instructor of the course
        // if ($user['role'] !== 'ADMIN' && $task['instructor_id'] != $user['id']) {
        //     sendError("You can only delete tasks for your own courses", 403);
        // }
        
        // Start transaction
        $db->beginTransaction();
        
        try {
            // The foreign key constraints will handle cascading deletes for task_submissions
            $query = "DELETE FROM tasks WHERE id = :task_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":task_id", $task_id);
            
            if ($stmt->execute()) {
                $db->commit();
                sendSuccess(null, "Task deleted successfully");
            } else {
                $db->rollBack();
                sendError("Failed to delete task", 500);
            }
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    } catch (Exception $e) {
        error_log("Delete task error: " . $e->getMessage());
        sendError("Failed to delete task", 500);
    }
}
?>