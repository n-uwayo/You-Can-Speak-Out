<?php
// dashboard.php - Dashboard data API
require_once 'config.php';

setupCORS();

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

// Only accept POST requests as per your frontend
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Method not allowed. Use POST request.", 405);
}

try {
    $data = [];
    
    // Total Users
    $query = "SELECT COUNT(*) as total FROM users WHERE is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    $data['total_users'] = intval($result['total']);
    
    // Total Videos  
    $query = "SELECT COUNT(*) as total FROM videos WHERE is_published = 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    $data['total_videos'] = intval($result['total']);
    
    // Active Tasks (changed to work with your new structure)
    $query = "SELECT COUNT(*) as total FROM tasks WHERE status = 'ACTIVE'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    $data['active_tasks'] = intval($result['total']);
    
    // Total Feedback (comments)
    $query = "SELECT COUNT(*) as total FROM comments";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    $data['total_feedback'] = intval($result['total']);
    
    // Recent Activities (last 24 hours)
    $activities = [];
    
    // Get recent user registrations
    $query = "SELECT 'user_registration' as type, name, created_at 
              FROM users 
              WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
              ORDER BY created_at DESC 
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    while ($row = $stmt->fetch()) {
        $activities[] = [
            'type' => $row['type'],
            'name' => $row['name'],
            'created_at' => $row['created_at']
        ];
    }
    
    // Get recent video uploads
    $query = "SELECT 'video_upload' as type, title as name, created_at 
              FROM videos 
              WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
              ORDER BY created_at DESC 
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    while ($row = $stmt->fetch()) {
        $activities[] = [
            'type' => $row['type'],
            'name' => $row['name'],
            'created_at' => $row['created_at']
        ];
    }
    
    // Get recent task submissions
    $query = "SELECT 'task_submission' as type, 
                     CONCAT(u.name, ' submitted ', t.title) as name, 
                     ts.submitted_at as created_at
              FROM task_submissions ts
              JOIN users u ON ts.student_id = u.id
              JOIN tasks t ON ts.task_id = t.id
              WHERE ts.submitted_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
              ORDER BY ts.submitted_at DESC 
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    while ($row = $stmt->fetch()) {
        $activities[] = [
            'type' => $row['type'],
            'name' => $row['name'],
            'created_at' => $row['created_at']
        ];
    }
    
    // Sort activities by date
    usort($activities, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    // Limit to 10 most recent
    $data['recent_activities'] = array_slice($activities, 0, 10);
    
    // Top Performers
    $query = "SELECT 
                u.id,
                u.name,
                COUNT(DISTINCT e.course_id) as courses_completed,
                COALESCE(AVG(ts.grade), 0) as average_score
              FROM users u
              LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'COMPLETED'
              LEFT JOIN task_submissions ts ON u.id = ts.student_id AND ts.status = 'graded'
              WHERE u.role = 'STUDENT' AND u.is_active = 1
              GROUP BY u.id, u.name
              HAVING courses_completed > 0 OR average_score > 0
              ORDER BY average_score DESC, courses_completed DESC
              LIMIT 10";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $performers = [];
    while ($row = $stmt->fetch()) {
        $performers[] = [
            'id' => intval($row['id']),
            'name' => $row['name'],
            'courses_completed' => intval($row['courses_completed']),
            'score' => round(floatval($row['average_score']), 1)
        ];
    }
    
    $data['top_performers'] = $performers;
    
    // Add some additional useful stats
    $additionalStats = [];
    
    // Total enrollments
    $query = "SELECT COUNT(*) as total FROM enrollments";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    $additionalStats['total_enrollments'] = intval($result['total']);
    
    // Active students (users with at least one enrollment)
    $query = "SELECT COUNT(DISTINCT student_id) as total FROM enrollments";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    $additionalStats['active_students'] = intval($result['total']);
    
    // Total instructors
    $query = "SELECT COUNT(*) as total FROM users WHERE role = 'INSTRUCTOR' AND is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    $additionalStats['total_instructors'] = intval($result['total']);
    
    // Published courses
    $query = "SELECT COUNT(*) as total FROM courses WHERE is_published = 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    $additionalStats['published_courses'] = intval($result['total']);
    
    $data['additional_stats'] = $additionalStats;
    
    // Send successful response
    sendSuccess($data);
    
} catch (Exception $e) {
    error_log("Dashboard error: " . $e->getMessage());
    sendError("Failed to fetch dashboard data: " . $e->getMessage(), 500);
}
?>