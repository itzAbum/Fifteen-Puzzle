<?php
header('Content-Type: application/json');

$host = "localhost";
$db_name = "manyaegbunam1";
$user = "manyaegbunam1";
$db_pass = "manyaegbunam1";

try {
    $db = new PDO("mysql:host=$host;dbname=$db_name", $user, $db_pass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'User ID required']);
    exit;
}

try {
    $stmt = $db->prepare(
        "SELECT 
            default_puzzle_size, 
            preferred_background_image_id, 
            sound_enabled, 
            animations_enabled 
        FROM users_preference 
        WHERE user_id = ?"
    );
    $stmt->execute([$user_id]);
    
    if ($stmt->rowCount() > 0) {
        $prefs = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get the actual image URL
        $imgStmt = $db->prepare(
            "SELECT image_url FROM background_images WHERE image_id = ?"
        );
        $imgStmt->execute([$prefs['preferred_background_image_id']]);
        $image = $imgStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'preferences' => [
                'defaultPuzzleSize' => $prefs['default_puzzle_size'],
                'preferredBackground' => $image['image_url'],
                'soundEnabled' => (bool)$prefs['sound_enabled'],
                'animationsEnabled' => (bool)$prefs['animations_enabled']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Preferences not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
?>