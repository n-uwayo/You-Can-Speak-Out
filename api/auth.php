<?php
// auth.php - Authentication API
require_once 'config.php';

setupCORS();

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendError("Database connection failed", 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'POST':
        if ($action === 'login') {
            handleLogin($db);
        } elseif ($action === 'register') {
            handleRegister($db);
        } else {
            sendError("Invalid action", 400);
        }
        break;
    case 'GET':
        if ($action === 'verify') {
            handleVerifyToken();
        } else {
            sendError("Invalid action", 400);
        }
        break;
    default:
        sendError("Method not allowed", 405);
}

function handleLogin($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $input = sanitizeInput($input);
        
        // Validate required fields
        $required = ['email', 'password'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        $email = $input['email'];
        $password = $input['password'];
        
        // Get user by email
        $query = "SELECT * FROM users WHERE email = :email AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        
        if ($stmt->rowCount() == 0) {
            sendError("emailInvalid credentials", 401);
        }
        
        $user = $stmt->fetch();
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            sendError("passInvalid credentials", 401);
        }
        
        // Generate token (simple base64 encoding for demo - use JWT in production)
        $token = base64_encode($user['id']);
        
        // Remove password from response
        unset($user['password']);
        
        $response = [
            'user' => $user,
            'token' => $token,
            'expires_in' => 3600 // 1 hour
        ];
        
        sendSuccess($response, "Login successful");
        
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        sendError("Login failed", 500);
    }
}

function handleRegister($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError("Invalid JSON data", 400);
        }
        
        $input = sanitizeInput($input);
        
        // Validate required fields
        $required = ['name', 'email', 'password'];
        $errors = validateInput($input, $required);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors), 400);
        }
        
        $name = $input['name'];
        $email = $input['email'];
        $password = $input['password'];
        $role = isset($input['role']) ? $input['role'] : 'STUDENT';
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendError("Invalid email format", 400);
        }
        
        // Validate role
        if (!in_array($role, ['STUDENT', 'INSTRUCTOR', 'ADMIN'])) {
            $role = 'STUDENT';
        }
        
        // Check if email already exists
        $checkQuery = "SELECT id FROM users WHERE email = :email";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":email", $email);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            sendError("Email already exists", 409);
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert user
        $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $hashedPassword);
        $stmt->bindParam(":role", $role);
        
        if ($stmt->execute()) {
            $userId = $db->lastInsertId();
            
            // Get created user
            $getQuery = "SELECT id, name, email, role, created_at FROM users WHERE id = :user_id";
            $getStmt = $db->prepare($getQuery);
            $getStmt->bindParam(":user_id", $userId);
            $getStmt->execute();
            
            $user = $getStmt->fetch();
            
            // Generate token
            $token = base64_encode($user['id']);
            
            $response = [
                'user' => $user,
                'token' => $token,
                'expires_in' => 3600
            ];
            
            sendSuccess($response, "Registration successful");
        } else {
            sendError("Registration failed", 500);
        }
        
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        sendError("Registration failed", 500);
    }
}

function handleVerifyToken() {
    $user = verifyToken();
    
    if (!$user) {
        sendError("Invalid or expired token", 401);
    }
    
    sendSuccess($user, "Token valid");
}
?>