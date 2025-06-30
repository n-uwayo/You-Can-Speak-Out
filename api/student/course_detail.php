<?php
// student/course_detail.php - Get detailed course information with videos
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
$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : null;

if ($method === 'GET' && $course_id) {
    handleGetCourseDetail($db, $user_id, $course_id);
} else {
    sendError("Course ID required", 400);
}

function handleGetCourseDetail($db, $user_id, $course_id) {
    try {
        // First check if student is enrolled in this course
        $enrollmentQuery = "
            SELECT id, status, progress, enrolled_at, completed_at 
            FROM enrollments 
            WHERE student_id = :user_id AND course_id = :course_id AND status = 'ACTIVE'
        ";
        $enrollmentStmt = $db->prepare($enrollmentQuery);
        $enrollmentStmt->bindParam(":user_id", $user_id);
        $enrollmentStmt->bindParam(":course_id", $course_id);
        $enrollmentStmt->execute();
        
        $enrollment = $enrollmentStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$enrollment) {
            sendError("You are not enrolled in this course", 403);
        }
        
        // Get course details
        $courseQuery = "
            SELECT 
                c.id,
                c.title,
                c.description,
                c.thumbnail,
                c.price,
                c.is_published,
                c.created_at,
                c.updated_at,
                u.id as instructor_id,
                u.name as instructor_name,
                u.email as instructor_email,
                u.avatar as instructor_avatar
            FROM courses c
            INNER JOIN users u ON c.instructor_id = u.id
            WHERE c.id = :course_id AND c.is_published = 1
        ";
        
        $courseStmt = $db->prepare($courseQuery);
        $courseStmt->bindParam(":course_id", $course_id);
        $courseStmt->execute();
        
        $course = $courseStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$course) {
            sendError("Course not found", 404);
        }
        
        // Get videos for this course
        $videosQuery = "
            SELECT 
                v.id,
                v.title,
                v.description,
                v.video_url,
                v.duration,
                v.order_num,
                v.is_published,
                v.created_at,
                v.updated_at,
                m.id as module_id,
                m.title as module_title,
                m.description as module_description,
                m.order_num as module_order,
                COALESCE(vp.is_completed, 0) as is_watched,
                vp.watched_seconds,
                vp.last_watched_at
            FROM modules m
            LEFT JOIN videos v ON m.id = v.module_id AND v.is_published = 1
            LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = :user_id
            WHERE m.course_id = :course_id AND m.is_published = 1
            ORDER BY m.order_num ASC, v.order_num ASC
        ";
        
        $videosStmt = $db->prepare($videosQuery);
        $videosStmt->bindParam(":user_id", $user_id);
        $videosStmt->bindParam(":course_id", $course_id);
        $videosStmt->execute();
        
        $videoResults = $videosStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Organize videos by modules
        $modules = [];
        $videos = [];
        $totalVideos = 0;
        $completedVideos = 0;
        
        foreach ($videoResults as $row) {
            if ($row['id']) { // Video exists
                $video = [
                    'id' => (int)$row['id'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'video_url' => $row['video_url'],
                    'duration' => $row['duration'],
                    'order_num' => (int)$row['order_num'],
                    'is_published' => (bool)$row['is_published'],
                    'module_id' => (int)$row['module_id'],
                    'is_watched' => (bool)$row['is_watched'],
                    'watched_seconds' => (float)($row['watched_seconds'] ?: 0),
                    'last_watched_at' => $row['last_watched_at'],
                    'thumbnail' => generateVideoThumbnail($row['video_url']),
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
                
                $videos[] = $video;
                $totalVideos++;
                
                if ($video['is_watched']) {
                    $completedVideos++;
                }
            }
            
            // Track modules
            $moduleId = (int)$row['module_id'];
            if (!isset($modules[$moduleId])) {
                $modules[$moduleId] = [
                    'id' => $moduleId,
                    'title' => $row['module_title'],
                    'description' => $row['module_description'],
                    'order_num' => (int)$row['module_order'],
                    'course_id' => (int)$course_id
                ];
            }
        }
        
        // Calculate progress
        $progress = $totalVideos > 0 ? round(($completedVideos / $totalVideos) * 100, 2) : 0;
        
        // Format response
        $courseDetail = [
            'id' => (int)$course['id'],
            'title' => $course['title'],
            'description' => $course['description'],
            'thumbnail' => $course['thumbnail'],
            'price' => (float)$course['price'],
            'is_published' => (bool)$course['is_published'],
            'instructor' => [
                'id' => (int)$course['instructor_id'],
                'name' => $course['instructor_name'],
                'email' => $course['instructor_email'],
                'avatar' => $course['instructor_avatar'],
                'bio' => 'Professional instructor and expert'
            ],
            'instructor_name' => $course['instructor_name'],
            'enrollment_status' => $enrollment['status'],
            'enrolled_at' => $enrollment['enrolled_at'],
            'completed_at' => $enrollment['completed_at'],
            'progress' => $progress,
            'total_videos' => $totalVideos,
            'completed_videos' => $completedVideos,
            'total_duration' => calculateTotalDuration($videos),
            'difficulty' => determineDifficulty($totalVideos),
            'modules' => array_values($modules),
            'videos' => $videos,
            'created_at' => $course['created_at'],
            'updated_at' => $course['updated_at']
        ];
        
        sendSuccess($courseDetail, "Course details fetched successfully");
        
    } catch (Exception $e) {
        error_log("Get course detail error: " . $e->getMessage());
        sendError("Failed to fetch course details", 500);
    }
}

function generateVideoThumbnail($videoUrl) {
    // Generate thumbnail URL based on video URL
    if (strpos($videoUrl, 'youtube.com') !== false || strpos($videoUrl, 'youtu.be') !== false) {
        // Extract YouTube video ID and generate thumbnail
        preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/', $videoUrl, $matches);
        if (isset($matches[1])) {
            return "https://img.youtube.com/vi/{$matches[1]}/maxresdefault.jpg";
        }
    }
    
    // Default thumbnail for other videos
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400";
}

function calculateTotalDuration($videos) {
    $totalSeconds = 0;
    
    foreach ($videos as $video) {
        $duration = $video['duration'];
        
        if (preg_match('/^(\d+):(\d+)$/', $duration, $matches)) {
            // Format: MM:SS
            $totalSeconds += ($matches[1] * 60) + $matches[2];
        } elseif (is_numeric($duration)) {
            // Format: seconds or minutes
            $totalSeconds += (int)$duration * 60; // Assume minutes
        }
    }
    
    $hours = floor($totalSeconds / 3600);
    $minutes = floor(($totalSeconds % 3600) / 60);
    
    return $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m";
}

function determineDifficulty($totalVideos) {
    if ($totalVideos <= 5) return 'Beginner';
    if ($totalVideos <= 15) return 'Intermediate';
    return 'Advanced';
}
?>