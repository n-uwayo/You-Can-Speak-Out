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
                    m.title as module_title,
                    m.description as module_description,
                    c.id as course_id,
                    c.title as course_title,
                    v.title as video_title,
                    v.duration as video_duration,
                    COUNT(DISTINCT ts.id) as submission_count
                FROM tasks t
                LEFT JOIN modules m ON t.module_id = m.id
                LEFT JOIN courses c ON m.course_id = c.id
                LEFT JOIN videos v ON t.related_video_id = v.id
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
                    m.title as module_title,
                    m.description as module_description,
                    c.id as course_id,
                    c.title as course_title,
                    v.title as video_title,
                    v.duration as video_duration,
                    COUNT(DISTINCT ts.id) as submission_count
                FROM tasks t
                LEFT JOIN modules m ON t.module_id = m.id
                LEFT JOIN courses c ON m.course_id = c.id
                LEFT JOIN videos v ON t.related_video_id = v.id
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
        'moduleId' => $task['module_id'],
        'relatedVideoId' => $task['related_video_id'],
        'createdAt' => $task['created_at'],
        'updatedAt' => $task['updated_at']
    ];
    
    // Add module information
    if ($task['module_title']) {
        $formatted['module'] = [
            'id' => $task['module_id'],
            'title' => $task['module_title'],
            'description' => $task['module_description']
        ];
        
        // Add course information to module
        if ($task['course_title']) {
            $formatted['module']['course'] = [
                'id' => $task['course_id'],
                'title' => $task['course_title']
            ];
        }
    }
    
    // Add video information
    if ($task['video_title']) {
        $formatted['relatedVideo'] = [
            'id' => $task['related_video_id'],
            'title' => $task['video_title'],
            'duration' => $task['video_duration']
        ];
    }
    
    // Add submissions array (empty for now, can be populated with actual submissions)
    $formatted['submissions'] = array_fill(0, intval($task['submission_count'] ?? 0), null);
    
    // Clean up temporary fields
    unset($formatted['module_title'], $formatted['module_description']);
    unset($formatted['course_id'], $formatted['course_title']);
    unset($formatted['video_title'], $formatted['video_duration']);
    unset($formatted['submission_count']);
    
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
        $required = ['title', 'description', 'moduleId', 'dueDate'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        // Verify module exists and user has access
        $moduleQuery = "
            SELECT m.id, c.instructor_id 
            FROM modules m 
            LEFT JOIN courses c ON m.course_id = c.id 
            WHERE m.id = :module_id
        ";
        $moduleStmt = $db->prepare($moduleQuery);
        $moduleStmt->bindParam(":module_id", $input['moduleId']);
        $moduleStmt->execute();
        
        if ($moduleStmt->rowCount() == 0) {
            sendError("Invalid module selected", 400);
        }
        
        $module = $moduleStmt->fetch();
        
        // Check if user is admin or the instructor of the course
        // if ($user['role'] !== 'ADMIN' && $module['instructor_id'] != $user['id']) {
        //     sendError("You can only create tasks for your own courses", 403);
        // }
        
        // Verify video exists if provided
        if (!empty($input['relatedVideoId'])) {
            $videoQuery = "SELECT id FROM videos WHERE id = :video_id AND module_id = :module_id";
            $videoStmt = $db->prepare($videoQuery);
            $videoStmt->bindParam(":video_id", $input['relatedVideoId']);
            $videoStmt->bindParam(":module_id", $input['moduleId']);
            $videoStmt->execute();
            
            if ($videoStmt->rowCount() == 0) {
                sendError("Invalid video selected for this module", 400);
            }
        }
        
        // Prepare data
        $title = $input['title'];
        $description = $input['description'];
        $instructions = isset($input['instructions']) ? $input['instructions'] : null;
        $due_date = date('Y-m-d H:i:s', strtotime($input['dueDate']));
        $points = isset($input['points']) ? intval($input['points']) : 0;
        $task_type = isset($input['taskType']) ? $input['taskType'] : 'TEXT';
        $status = isset($input['status']) ? $input['status'] : 'ACTIVE';
        $module_id = intval($input['moduleId']);
        $related_video_id = !empty($input['relatedVideoId']) ? intval($input['relatedVideoId']) : null;
        
        // Validate enum values
        if (!in_array($task_type, ['TEXT', 'FILE', 'BOTH'])) {
            $task_type = 'TEXT';
        }
        
        if (!in_array($status, ['ACTIVE', 'INACTIVE', 'ARCHIVED'])) {
            $status = 'ACTIVE';
        }
        
        $query = "
            INSERT INTO tasks (title, description, instructions, due_date, points, task_type, status, module_id, related_video_id) 
            VALUES (:title, :description, :instructions, :due_date, :points, :task_type, :status, :module_id, :related_video_id)
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":instructions", $instructions);
        $stmt->bindParam(":due_date", $due_date);
        $stmt->bindParam(":points", $points);
        $stmt->bindParam(":task_type", $task_type);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":module_id", $module_id);
        $stmt->bindParam(":related_video_id", $related_video_id);
        
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
            LEFT JOIN modules m ON t.module_id = m.id
            LEFT JOIN courses c ON m.course_id = c.id
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
        $required = ['title', 'description', 'moduleId', 'dueDate'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        // Verify module exists
        $moduleQuery = "SELECT id FROM modules WHERE id = :module_id";
        $moduleStmt = $db->prepare($moduleQuery);
        $moduleStmt->bindParam(":module_id", $input['moduleId']);
        $moduleStmt->execute();
        
        if ($moduleStmt->rowCount() == 0) {
            sendError("Invalid module selected", 400);
        }
        
        // Verify video exists if provided
        if (!empty($input['relatedVideoId'])) {
            $videoQuery = "SELECT id FROM videos WHERE id = :video_id AND module_id = :module_id";
            $videoStmt = $db->prepare($videoQuery);
            $videoStmt->bindParam(":video_id", $input['relatedVideoId']);
            $videoStmt->bindParam(":module_id", $input['moduleId']);
            $videoStmt->execute();
            
            if ($videoStmt->rowCount() == 0) {
                sendError("Invalid video selected for this module", 400);
            }
        }
        
        // Prepare data
        $title = $input['title'];
        $description = $input['description'];
        $instructions = isset($input['instructions']) ? $input['instructions'] : null;
        $due_date = date('Y-m-d H:i:s', strtotime($input['dueDate']));
        $points = isset($input['points']) ? intval($input['points']) : 0;
        $task_type = isset($input['taskType']) ? $input['taskType'] : 'TEXT';
        $status = isset($input['status']) ? $input['status'] : 'ACTIVE';
        $module_id = intval($input['moduleId']);
        $related_video_id = !empty($input['relatedVideoId']) ? intval($input['relatedVideoId']) : null;
        
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
                status = :status, module_id = :module_id, related_video_id = :related_video_id,
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
        $stmt->bindParam(":module_id", $module_id);
        $stmt->bindParam(":related_video_id", $related_video_id);
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
            LEFT JOIN modules m ON t.module_id = m.id
            LEFT JOIN courses c ON m.course_id = c.id
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