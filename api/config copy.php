<?php
// config.php - Database configuration
class Database {
    private $host = "localhost";
    private $db_name = "learning_management";
    private $username = "root";  // Change as needed
    private $password = "";      // Change as needed
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            return null;
        }
        return $this->conn;
    }
}

// CORS and Headers setup
function setupCORS() {
    // Handle CORS
    if (isset($_SERVER['HTTP_ORIGIN'])) {
         header("Content-Type: application/json");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    }

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        
        exit(0);
    }

    header('Content-Type: application/json');
}

// Authentication helper
function verifyToken() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    
    // Simple token verification - in production, use proper JWT validation
    // For now, we'll just check if token exists and decode user info
    // You should implement proper JWT token validation here
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        if (!$db) {
            return null;
        }
        
        // For demo purposes, we'll assume token format is base64 encoded user_id
        // In production, use proper JWT with secret key validation
        $userId = base64_decode($token);
        
        if (!is_numeric($userId)) {
            return null;
        }
        
        $query = "SELECT id, name, email, role, is_active FROM users WHERE id = :user_id AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        
        if ($stmt->rowCount() == 1) {
            return $stmt->fetch();
        }
        
        return null;
    } catch (Exception $e) {
        error_log("Token verification error: " . $e->getMessage());
        return null;
    }
}

// Response helpers
function sendResponse($success, $data = null, $message = "", $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('c')
    ]);
    exit();
}

function sendError($message, $statusCode = 400, $data = null) {
    sendResponse(false, $data, $message, $statusCode);
}

function sendSuccess($data = null, $message = "Success") {
    sendResponse(true, $data, $message, 200);
}

// Input validation and sanitization
function validateInput($data, $required_fields = []) {
    $errors = [];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = ucfirst($field) . " is required";
        }
    }
    
    return $errors;
}

function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}


function getUser($db, $user_id) {
    $query = "SELECT id, name, email, role, avatar FROM users WHERE id = :user_id AND is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>