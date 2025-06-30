<?php
// submissions.php - Full version with database connection
include "config.php";
// Prevent any output before headers
// ob_start();

// // Clear any output buffer
// ob_end_clean();

setupCORS();


// Get database connection
$database = new Database();
$db = $database->getConnection();

// If database connection fails, return dummy data
if (!$db) {
    // Return the same dummy data as minimal version
    $dummySubmissions = [
        [
            'id' => 1,
            'student' => 'John Doe (DB Connection Failed)',
            'studentId' => 2,
            'studentEmail' => 'john@example.com',
            'task' => 'React Component Design',
            'taskId' => 1,
            'course' => 'Advanced React',
            'courseId' => 1,
            'type' => 'Assignment',
            'submittedAt' => '2024-03-15 14:30',
            'status' => 'pending',
            'fileName' => 'assignment.pdf',
            'fileSize' => '2.5MB',
            'filePath' => null,
            'submissionText' => 'This is my submission',
            'grade' => null,
            'feedback' => null,
            'gradedAt' => null,
            'gradedBy' => null,
            'dueDate' => '2024-03-20',
            'maxPoints' => 100
        ]
    ];
    
    sendSuccess([
        'submissions' => $dummySubmissions,
        'stats' => [
            'total' => 1,
            'pending' => 1,
            'reviewed' => 0,
            'graded' => 0,
            'late' => 0,
            'averageGrade' => 0
        ]
    ], 'Database connection failed - showing dummy data');
}

// Handle request
$method = $_SERVER['REQUEST_METHOD'];
$submission_id = isset($_GET['id']) ? intval($_GET['id']) : null;

if ($method === 'GET') {
    try {
        // Build query
        $query = "
            SELECT 
                ts.*,
                t.title as task_title,
                t.description as task_description,
                t.due_date as task_due_date,
                t.points as task_points,
                t.task_type,
                c.id as course_id,
                c.title as course_title,
                u.name as student_name,
                u.email as student_email
            FROM task_submissions ts
            LEFT JOIN tasks t ON ts.task_id = t.id
            LEFT JOIN courses c ON t.course_id = c.id
            LEFT JOIN users u ON ts.student_id = u.id
        ";
        
        // Add status filter if provided
        $params = [];
        if (isset($_GET['status']) && $_GET['status'] !== 'all') {
            $query .= " WHERE ts.status = :status";
            $params[':status'] = $_GET['status'];
        }
        
        $query .= " ORDER BY ts.submitted_at DESC";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        $submissions = [];
        while ($row = $stmt->fetch()) {
            // Format submission data
            $submissions[] = [
                'id' => $row['id'],
                'student' => $row['student_name'] ?? 'Unknown',
                'studentId' => $row['student_id'],
                'studentEmail' => $row['student_email'] ?? '',
                'task' => $row['task_title'] ?? 'Unknown Task',
                'taskId' => $row['task_id'],
                'course' => $row['course_title'] ?? 'Unknown Course',
                'courseId' => $row['course_id'],
                'type' => 'Assignment', // Default type
                'submittedAt' => date('Y-m-d H:i', strtotime($row['submitted_at'])),
                'status' => $row['status'],
                'fileName' => null,
                'fileSize' => null,
                'filePath' => null,
                'submissionText' => $row['submission_text'] ?? '',
                'grade' => $row['grade'],
                'feedback' => $row['feedback'],
                'gradedAt' => null,
                'gradedBy' => 'Instructor',
                'dueDate' => date('Y-m-d', strtotime($row['task_due_date'])),
                'maxPoints' => $row['task_points'] ?? 100
            ];
        }
        
        // Calculate stats
        $statsQuery = "
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed,
                COUNT(CASE WHEN status = 'graded' THEN 1 END) as graded,
                AVG(CASE WHEN grade IS NOT NULL THEN grade END) as average_grade
            FROM task_submissions
        ";
        
        $statsStmt = $db->query($statsQuery);
        $statsRow = $statsStmt->fetch();
        
        $stats = [
            'total' => intval($statsRow['total']),
            'pending' => intval($statsRow['pending']),
            'reviewed' => intval($statsRow['reviewed']),
            'graded' => intval($statsRow['graded']),
            'late' => 0, // Calculate this if needed
            'averageGrade' => round($statsRow['average_grade'] ?? 0, 2)
        ];
        
        sendSuccess([
            'submissions' => $submissions,
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        // If query fails, return empty data
        sendSuccess([
            'submissions' => [],
            'stats' => [
                'total' => 0,
                'pending' => 0,
                'reviewed' => 0,
                'graded' => 0,
                'late' => 0,
                'averageGrade' => 0
            ]
        ], 'Error: ' . $e->getMessage());
    }
}

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
            $updates[] = "graded_by = 1"; // Dummy user ID
            
            $query = "UPDATE task_submissions SET " . implode(", ", $updates) . " WHERE id = :id";
            $stmt = $db->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            
            sendSuccess(['id' => $submission_id], 'Submission graded successfully');
        } else {
            sendError('No data to update', 400);
        }
    } catch (Exception $e) {
        sendError('Failed to update submission: ' . $e->getMessage(), 500);
    }
}

// Default error for unsupported methods
sendError('Method not allowed', 405);

// Helper function
function formatFileSize($bytes) {
    if ($bytes === null || $bytes === 0) return null;
    $units = ['B', 'KB', 'MB', 'GB'];
    $i = 0;
    while ($bytes > 1024 && $i < count($units) - 1) {
        $bytes /= 1024;
        $i++;
    }
    return round($bytes, 2) . $units[$i];
}
?>