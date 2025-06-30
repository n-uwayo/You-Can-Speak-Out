    <?php
    // header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    include_once 'config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, title, description, video_url, duration, order_num , is_published, module_id, created_at, updated_at FROM videos ORDER BY created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['data' => $videos]);
