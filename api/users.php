<?php
// header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// If it's a preflight request, respond with 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(array("error" => "Database connection failed"));
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Get user ID from query parameter for PUT/DELETE
$user_id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Simple authentication check (you can enhance this)
function checkAuth() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(array("error" => "Authorization header missing"));
        return false;
    }
    // In a real app, validate the JWT token here
    return true;
}

switch ($method) {
    case 'GET':
        getUsers($db);
        break;
    case 'POST':
        if (!checkAuth()) exit();
        createUser($db, $input);
        break;
    case 'PUT':
        if (!checkAuth()) exit();
        updateUser($db, $user_id, $input);
        break;
    case 'DELETE':
        if (!checkAuth()) exit();
        deleteUser($db, $user_id);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("error" => "Method not allowed"));
        break;
}

// GET - Fetch all users
function getUsers($db) {
    try {
        $query = "
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                u.avatar,
                u.is_active,
                u.created_at,
                u.updated_at,
                CASE 
                    WHEN u.role = 'INSTRUCTOR' THEN 
                        (SELECT COUNT(*) FROM courses WHERE instructor_id = u.id)
                    WHEN u.role = 'STUDENT' THEN 
                        (SELECT COUNT(*) FROM enrollments WHERE student_id = u.id)
                    ELSE 0
                END as course_count
            FROM users u 
            ORDER BY u.created_at DESC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(array("data" => $users));
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("error" => "Failed to fetch users: " . $exception->getMessage()));
    }
}

// POST - Create new user
function createUser($db, $input) {
    if (!$input || !isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(array("error" => "Missing required fields: name, email, password"));
        return;
    }

    try {
        // Check if email already exists
        $checkQuery = "SELECT id FROM users WHERE email = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$input['email']]);
        
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("error" => "Email already exists"));
            return;
        }

        $query = "
            INSERT INTO users (name, email, password, role, avatar, is_active) 
            VALUES (?, ?, ?, ?, ?, ?)
        ";
        
        $stmt = $db->prepare($query);
        $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
        
        $stmt->execute([
            $input['name'],
            $input['email'],
            $hashedPassword,
            $input['role'] ?? 'STUDENT',
            $input['avatar'] ?? null,
            $input['is_active'] ?? 1
        ]);
        
        $userId = $db->lastInsertId();
        
        // Fetch the created user
        $fetchQuery = "SELECT id, name, email, role, avatar, is_active, created_at FROM users WHERE id = ?";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->execute([$userId]);
        $user = $fetchStmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode(array(
            "message" => "User created successfully",
            "data" => $user
        ));
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("error" => "Failed to create user: " . $exception->getMessage()));
    }
}

// PUT - Update user
function updateUser($db, $user_id, $input) {
    if (!$user_id || !$input) {
        http_response_code(400);
        echo json_encode(array("error" => "User ID and data required"));
        return;
    }

    try {
        // Check if user exists
        $checkQuery = "SELECT id FROM users WHERE id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$user_id]);
        
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(array("error" => "User not found"));
            return;
        }

        // Build dynamic update query
        $updateFields = [];
        $params = [];
        
        if (isset($input['name'])) {
            $updateFields[] = "name = ?";
            $params[] = $input['name'];
        }
        if (isset($input['email'])) {
            // Check if email already exists for other users
            $emailCheckQuery = "SELECT id FROM users WHERE email = ? AND id != ?";
            $emailCheckStmt = $db->prepare($emailCheckQuery);
            $emailCheckStmt->execute([$input['email'], $user_id]);
            
            if ($emailCheckStmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(array("error" => "Email already exists"));
                return;
            }
            
            $updateFields[] = "email = ?";
            $params[] = $input['email'];
        }
        if (isset($input['password']) && !empty($input['password'])) {
            $updateFields[] = "password = ?";
            $params[] = password_hash($input['password'], PASSWORD_DEFAULT);
        }
        if (isset($input['role'])) {
            $updateFields[] = "role = ?";
            $params[] = $input['role'];
        }
        if (isset($input['avatar'])) {
            $updateFields[] = "avatar = ?";
            $params[] = $input['avatar'];
        }
        if (isset($input['is_active'])) {
            $updateFields[] = "is_active = ?";
            $params[] = $input['is_active'];
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(array("error" => "No fields to update"));
            return;
        }
        
        $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
        $params[] = $user_id;
        
        $query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        
        // Fetch updated user
        $fetchQuery = "SELECT id, name, email, role, avatar, is_active, created_at, updated_at FROM users WHERE id = ?";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->execute([$user_id]);
        $user = $fetchStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(array(
            "message" => "User updated successfully",
            "data" => $user
        ));
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("error" => "Failed to update user: " . $exception->getMessage()));
    }
}

// DELETE - Delete user
function deleteUser($db, $user_id) {
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(array("error" => "User ID required"));
        return;
    }

    try {
        // Check if user exists
        $checkQuery = "SELECT id, name FROM users WHERE id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$user_id]);
        $user = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(array("error" => "User not found"));
            return;
        }

        // Start transaction for data integrity
        $db->beginTransaction();
        
        try {
            // Delete related data first (adjust based on your schema)
            $db->prepare("DELETE FROM enrollments WHERE student_id = ?")->execute([$user_id]);
            $db->prepare("DELETE FROM task_submissions WHERE student_id = ?")->execute([$user_id]);
            $db->prepare("DELETE FROM comments WHERE user_id = ?")->execute([$user_id]);
            $db->prepare("DELETE FROM video_progress WHERE user_id = ?")->execute([$user_id]);
            
            // Delete courses if instructor
            $db->prepare("DELETE FROM courses WHERE instructor_id = ?")->execute([$user_id]);
            
            // Finally delete the user
            $deleteQuery = "DELETE FROM users WHERE id = ?";
            $deleteStmt = $db->prepare($deleteQuery);
            $deleteStmt->execute([$user_id]);
            
            $db->commit();
            
            echo json_encode(array("message" => "User '{$user['name']}' deleted successfully"));
        } catch(Exception $e) {
            $db->rollback();
            throw $e;
        }
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("error" => "Failed to delete user: " . $exception->getMessage()));
    }
}