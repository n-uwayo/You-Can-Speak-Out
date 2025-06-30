<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'learning_management';
$username = 'root';
$password = '';

// Create MySQLi connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit();
}

// Parameters
$video_id = $_GET['course_id'] ?? null;
$course_id = $_GET['video_id'] ?? null;
$parent_id = $_GET['parent_id'] ?? null;
$limit = intval($_GET['limit'] ?? 50);
$offset = intval($_GET['offset'] ?? 0);

// Build WHERE clause
$where_clauses = [];
$params = [];
$types = "";

if ($video_id) {
    $where_clauses[] = "c.video_id = ?";
    $params[] = $video_id;
    $types .= "i";
}


$where_clause = "";
if (!empty($where_clauses)) {
    $where_clause = "WHERE " . implode(" AND ", $where_clauses);
}

// Fetch comments
$sql = "
    SELECT 
        c.id, c.text, c.user_id, c.video_id, c.parent_id, c.created_at, c.updated_at
    FROM comments c
    $where_clause AND c.parent_id IS NULL
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
";

$params[] = $limit;
$params[] = $offset;
$types .= "ii";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Query preparation failed']);
    exit();
}

$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$main_comments = [];
while ($row = $result->fetch_assoc()) {
    $main_comments[] = $row;
}
$stmt->close();

// Format comments with replies
$formatted_comments = [];
foreach ($main_comments as $comment) {
    // Get replies for this comment
    $reply_sql = "
        SELECT 
            c.id, c.text, c.user_id, c.created_at
        FROM comments c
        WHERE c.parent_id = ?
        ORDER BY c.created_at ASC
    ";
    
    $reply_stmt = $conn->prepare($reply_sql);
    if ($reply_stmt) {
        $reply_stmt->bind_param("i", $comment['id']);
        $reply_stmt->execute();
        $reply_result = $reply_stmt->get_result();
        
        $replies = [];
        while ($reply_row = $reply_result->fetch_assoc()) {
            $replies[] = [
                'id' => intval($reply_row['id']),
                'text' => $reply_row['text'],
                'user' => [
                    'name' => 'User ' . $reply_row['user_id']
                ],
                'timestamp' => time_ago($reply_row['created_at']),
                'created_at' => $reply_row['created_at'],
                'likes' => rand(0, 5) // Random likes for demo
            ];
        }
        $reply_stmt->close();
    } else {
        $replies = [];
    }
    
    // Format main comment
    $formatted_comments[] = [
        'id' => intval($comment['id']),
        'text' => $comment['text'],
        'user' => [
            'name' => 'User ' . $comment['user_id']
        ],
        'timestamp' => time_ago($comment['created_at']),
        'created_at' => $comment['created_at'],
        'likes' => rand(0, 10), // Random likes for demo
        'replies' => $replies
    ];
}

// Get total count of main comments only
$count_sql = "SELECT COUNT(*) as total FROM comments c $where_clause";
$count_stmt = $conn->prepare($count_sql);

if (!empty($params)) {
    // Remove the limit and offset parameters for count query
    $count_params = array_slice($params, 0, -2);
    $count_types = substr($types, 0, -2);
    
    if (!empty($count_params)) {
        $count_stmt->bind_param($count_types, ...$count_params);
    }
}

$count_stmt->execute();
$count_result = $count_stmt->get_result();
$total = $count_result->fetch_assoc()['total'];
$count_stmt->close();

$conn->close();

// Response
http_response_code(200);
echo json_encode([
    'success' => true,
    'data' => $formatted_comments,
    'pagination' => [
        'total' => intval($total),
        'limit' => $limit,
        'offset' => $offset,
        'has_more' => ($offset + $limit) < $total
    ]
]);


// Helper function
function time_ago($datetime) {
    $time = time() - strtotime($datetime);
    if ($time < 60) return 'Just now';
    elseif ($time < 3600) return floor($time / 60) . ' minute(s) ago';
    elseif ($time < 86400) return floor($time / 3600) . ' hour(s) ago';
    elseif ($time < 2592000) return floor($time / 86400) . ' day(s) ago';
    elseif ($time < 31536000) return floor($time / 2592000) . ' month(s) ago';
    else return floor($time / 31536000) . ' year(s) ago';
}
?>
