<?php
// submissions.php - Complete version
include "config.php";

setupCORS();

// Get database connection
$database = new Database();
$db = $database->getConnection();

// If database connection fails, return dummy data
if (!$db) {    
    sendSuccess([
        'stats' => [
            'total' => 1,
            'pending' => 1,
            'reviewed' => 0,
            'graded' => 0,
            'late' => 0,
            'averageGrade' => 0
        ],
        'submissions' => [
            [
                'id' => 1,
                'student' => 'Demo Student',
                'task' => 'Demo Assignment',
                'course' => 'Demo Course',
                'type' => 'assignment',
                'status' => 'pending',
                'submittedAt' => '2024-01-15 10:30:00',
                'dueDate' => '2024-01-20 23:59:59',
                'grade' => null,
                'feedback' => null,
                'fileName' => null,
                'fileSize' => null
            ]
        ]
    ], 'Database connection failed - showing dummy data');
}

// Handle request
$method = $_SERVER['REQUEST_METHOD'];
$submission_id = isset($_GET['id']) ? intval($_GET['id']) : null;
$action = isset($_GET['action']) ? $_GET['action'] : null;

// GET - Fetch submissions
if ($method === 'GET' && !$submission_id) {
    try {
        $statusFilter = isset($_GET['status']) ? $_GET['status'] : 'all';
        
        // Build query with optional status filter
        $whereClause = "";
        $params = [];
        
        if ($statusFilter !== 'all') {
            $whereClause = "WHERE ts.status = :status";
            $params[':status'] = $statusFilter;
        }
        
        // Fetch submissions
        $query = "SELECT 
            ts.id,
            CONCAT(u.first_name, ' ', u.last_name) as student,
            t.title as task,
            c.name as course,
            t.type,
            ts.status,
            DATE_FORMAT(ts.submitted_at, '%Y-%m-%d %H:%i') as submittedAt,
            DATE_FORMAT(t.due_date, '%Y-%m-%d %H:%i') as dueDate,
            ts.grade,
            ts.feedback,
            ts.file_name as fileName,
            ts.file_size as fileSize,
            ts.submission_text as submissionText,
            ts.file_path as filePath
            FROM task_submissions ts
            JOIN users u ON ts.student_id = u.id
            JOIN tasks t ON ts.task_id = t.id
            JOIN courses c ON t.course_id = c.id
            $whereClause
            ORDER BY ts.submitted_at DESC";
            
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate stats
        $statsQuery = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
            SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded,
            SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
            COALESCE(AVG(CASE WHEN grade IS NOT NULL THEN grade END), 0) as averageGrade
            FROM task_submissions";
            
        $statsStmt = $db->prepare($statsQuery);
        $statsStmt->execute();
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
        
        sendSuccess([
            'submissions' => $submissions,
            'stats' => $stats
        ], 'Submissions fetched successfully');
        
    } catch (Exception $e) {
        sendError('Failed to fetch submissions: ' . $e->getMessage(), 500);
    }
}

// GET - Download file
if ($method === 'GET' && $submission_id && $action === 'download') {
    try {
        $query = "SELECT file_path, file_name FROM task_submissions WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':id', $submission_id);
        $stmt->execute();
        $submission = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($submission && $submission['file_path'] && file_exists($submission['file_path'])) {
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . $submission['file_name'] . '"');
            readfile($submission['file_path']);
            exit;
        } else {
            sendError('File not found', 404);
        }
    } catch (Exception $e) {
        sendError('Failed to download file: ' . $e->getMessage(), 500);
    }
}

// PUT - Update submission
if ($method === 'PUT' && $submission_id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Update submission
        $updates = [];
        $params = [':id' => $submission_id];
        
        if (isset($input['grade'])) {
            $updates[] = "grade = :grade";
            $params[':grade'] = intval($input['grade']);
        }
        
        if (isset($input['feedback'])) {
            $updates[] = "feedback = :feedback";
            $params[':feedback'] = $input['feedback'];
        }
        
        if (isset($input['status'])) {
            $updates[] = "status = :status";
            $params[':status'] = $input['status'];
        }
        
        
        if (!empty($updates)) {
            $updates[] = "graded_at = NOW()";
            
            $query = "UPDATE task_submissions SET " . implode(", ", $updates) . " WHERE id = :id";
            $stmt = $db->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            
            sendSuccess(['id' => $submission_id], 'Submission updated successfully');
        } else {
            sendError('No data to update', 400);
        }
    } catch (Exception $e) {
        sendError('Failed to update submission: ' . $e->getMessage(), 500);
    }
}

// Default error for unsupported methods
sendError('Method not allowed', 405);
?>