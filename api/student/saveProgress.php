<?php
// student/saveProgress.php - Store watched time in ACTUAL MINUTES
require_once '../config.php';

setupCORS();

// Simple MySQLi connection
$mysqli = new mysqli("localhost", "root", "", "learning_management");

// Check connection
if ($mysqli->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    die(json_encode(['success' => false, 'error' => 'Method not allowed: ' . $method]));
}

try {
    // Get JSON data from request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        die(json_encode(['success' => false, 'error' => 'Invalid JSON data']));
    }
    
    // Get data from JSON input
    $time = $input['timestamp'] ?? null;
    $course_id = $input['course_id'] ?? null;
    $user_id = $input['user_id'] ?? null;
    
    if (!$time || !$course_id || !$user_id) {
        die(json_encode(['success' => false, 'error' => 'Missing required data']));
    }
    
    // Validate inputs
    $course_id = intval($course_id);
    $user_id = intval($user_id);
    
    if ($course_id <= 0 || $user_id <= 0) {
        die(json_encode(['success' => false, 'error' => 'Invalid IDs']));
    }

    // Initialize values
    $duration_minutes = 30; // Default 30 minutes
    $watched_minutes = 0; // Store actual minutes watched
    $is_completed = false;
    $progress_percentage = 0;
    $debug_info = [];

    // Step 1: Get course duration in MINUTES
    $courseQuery = "SELECT duration FROM courses WHERE id = ?";
    if ($stmt = $mysqli->prepare($courseQuery)) {
        $stmt->bind_param("i", $course_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $course = $result->fetch_assoc();
            $duration_minutes = intval($course['duration']) ?: 30;
            $debug_info[] = "Found course duration: {$duration_minutes} minutes";
        } else {
            $debug_info[] = "Course not found, using default 30 minutes";
        }
        $stmt->close();
    } else {
        $debug_info[] = "Course query failed: " . $mysqli->error;
    }

    // Step 2: Get current progress in MINUTES
    $progressQuery = "SELECT watched_seconds, is_completed FROM video_progress WHERE video_id = ? AND user_id = ?";
    $existing_record = false;
    
    if ($stmt = $mysqli->prepare($progressQuery)) {
        $stmt->bind_param("ii", $course_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Existing progress found - watched_seconds column stores PERCENTAGE
            $current_progress = $result->fetch_assoc();
            $stored_percentage = floatval($current_progress['watched_seconds']); // This is percentage
            $watched_minutes = ($stored_percentage / 100) * $duration_minutes; // Convert back to minutes
            $is_completed = (bool)$current_progress['is_completed'];
            $existing_record = true;
            $debug_info[] = "Found existing progress: {$stored_percentage}% ({$watched_minutes} mins), completed: " . ($is_completed ? 'YES' : 'NO');
        } else {
            // No existing progress
            $watched_minutes = 0;
            $is_completed = false;
            $existing_record = false;
            $debug_info[] = "No existing progress found, starting fresh";
        }
        $stmt->close();
    } else {
        $debug_info[] = "Progress query failed: " . $mysqli->error;
        $watched_minutes = 0;
        $is_completed = false;
        $existing_record = false;
    }

    // Step 3: Increment logic - add 5 seconds = 5/60 = 0.083 minutes
    $old_watched_minutes = $watched_minutes;
    $increment_minutes = 5 / 60; // 5 seconds = 0.083 minutes
    $should_increment = false;
    
    if (!$is_completed && $watched_minutes < $duration_minutes) {
        $watched_minutes += $increment_minutes; // Increment by ~0.083 minutes
        $should_increment = true;
        $debug_info[] = "Incremented from " . round($old_watched_minutes, 3) . " mins to " . round($watched_minutes, 3) . " mins";
        
        // Check for completion - if watched time meets or exceeds duration
        if ($watched_minutes >= $duration_minutes) {
            $watched_minutes = $duration_minutes; // Cap at maximum duration
            $is_completed = true;
            $debug_info[] = "Marked as completed - reached full duration of {$duration_minutes} minutes";
        }
    } else {
        if ($is_completed) {
            $debug_info[] = "Not incrementing - already completed";
        } else {
            $debug_info[] = "Not incrementing - watched: " . round($watched_minutes, 3) . " mins >= duration: {$duration_minutes} mins";
        }
    }

    // Calculate progress percentage for display/enrollment
    $progress_percentage = $duration_minutes > 0 ? min(100, ($watched_minutes / $duration_minutes) * 100) : 0;

    // Step 4: Update database - watched_seconds column stores PERCENTAGE of duration
    $database_updated = false;
    
    // Store the percentage of duration_minutes (not actual minutes)
    $watched_minutes_rounded = round($progress_percentage, 3);
    
    $upsertQuery = "INSERT INTO video_progress (video_id, user_id, watched_seconds, is_completed, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, NOW(), NOW()) 
                    ON DUPLICATE KEY UPDATE 
                    watched_seconds = VALUES(watched_seconds), 
                    is_completed = VALUES(is_completed), 
                    updated_at = NOW()";
    
    if ($stmt = $mysqli->prepare($upsertQuery)) {
        // Store percentage of duration in watched_seconds column
        $stmt->bind_param("iidi", $course_id, $user_id, $watched_minutes_rounded, $is_completed);
        
        if ($stmt->execute()) {
            $database_updated = true;
            if ($stmt->affected_rows == 1) {
                $debug_info[] = "Inserted new progress record - stored " . $watched_minutes_rounded . "% of duration";
            } else if ($stmt->affected_rows == 2) {
                $debug_info[] = "Updated existing progress record - stored " . $watched_minutes_rounded . "% of duration";
            } else {
                $debug_info[] = "No changes made to database";
            }
        } else {
            $debug_info[] = "Failed to upsert progress: " . $stmt->error;
        }
        $stmt->close();
    } else {
        $debug_info[] = "Upsert prepare failed: " . $mysqli->error;
    }

    // Optional: Update enrollment progress with percentage
    $enrollmentQuery = "UPDATE enrollments SET progress = ?, updated_at = NOW() WHERE student_id = ? AND course_id = ?";
    if ($stmt = $mysqli->prepare($enrollmentQuery)) {
        $stmt->bind_param("dii", $progress_percentage, $user_id, $course_id);
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $debug_info[] = "Updated enrollment progress to " . round($progress_percentage, 1) . "%";
        }
        $stmt->close();
    }

    // Close database connection
    $mysqli->close();

    // Calculate remaining time
    $remaining_minutes = max(0, $duration_minutes - $watched_minutes);
    $remaining_seconds = $remaining_minutes * 60;

    // Your original file writing
    $Write="<?php $" . "time='" . $time . "'; " . "echo $" . "time;" . " ?>";
    file_put_contents('time.php',$Write);

    $debug_text = implode(" | ", $debug_info);
    $attendance = fopen("time.txt", "w") or die("Unable to open file!");
    $txt = "[" . date('Y-m-d H:i:s') . "] User: $user_id | Course: $course_id | Watched: " . round($watched_minutes, 3) . "/{$duration_minutes} mins | Progress: " . round($progress_percentage, 1) . "% | " . $debug_text;
    fwrite($attendance, $txt);
    fclose($attendance);
    
    $attendancetxt = fopen("text.php", "w") or die("Unable to open file!");
    fwrite($attendancetxt, $time);
    fclose($attendancetxt);
    
    // Return detailed response
    echo json_encode([
        'success' => true,
        'data' => [
            'user_id' => $user_id,
            'course_id' => $course_id,
            'timestamp' => $time,
            'duration_minutes' => $duration_minutes,
            'old_watched_minutes' => round($old_watched_minutes, 3),
            'new_watched_minutes' => round($watched_minutes, 3),
            'watched_minutes_stored' => $watched_minutes_rounded, // Percentage stored in DB
            'progress_percentage' => round($progress_percentage, 2), // Same as above for consistency
            'is_completed' => $is_completed,
            'should_increment' => $should_increment,
            'database_updated' => $database_updated,
            'existing_record' => $existing_record,
            'remaining_minutes' => round($remaining_minutes, 3),
            'remaining_seconds' => round($remaining_seconds),
            'increment_per_call' => round($increment_minutes, 3),
            'debug_info' => $debug_info,
            'message' => $should_increment ? 'Incremented by ' . round($increment_minutes, 3) . ' minutes' : 'No increment - ' . ($is_completed ? 'completed' : 'duration exceeded')
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Save progress error: " . $e->getMessage());
    
    // Fallback file write
    try {
        $Write="<?php $" . "time='" . $time . "'; " . "echo $" . "time;" . " ?>";
        file_put_contents('time.php',$Write);
        
        $attendance = fopen("time.txt", "w");
        if ($attendance) {
            $txt = "[ERROR] " . $e->getMessage();
            fwrite($attendance, $txt);
            fclose($attendance);
        }
    } catch (Exception $fileError) {
        // Ignore file errors
    }
    
    echo json_encode(['success' => false, 'error' => 'Failed to save progress: ' . $e->getMessage()]);
}
?>