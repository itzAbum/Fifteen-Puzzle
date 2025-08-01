<?php
header('Content-Type: application/json');

$host = "localhost";
$db_name = "manyaegbunam1";
$user = "manyaegbunam1";
$db_pass = "manyaegbunam1";

try {
    $attempt = new PDO("mysql:host=$host;dbname=$db_name", $user, $db_pass);
    $attempt->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Handle registration form
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'register') {
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'All fields required']);
        exit;
    }
    
    $check = $attempt->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $check->execute([$username, $email]);
    
    if ($check->rowCount() > 0) {
        echo json_encode(['success' => false, 'error' => 'Username/email exists']);
        exit;
    }
    


    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
   try {
        $attempt->beginTransaction();
        
        // Insert user
        $stmt = $attempt->prepare(
            "INSERT INTO users (username, password_hash, email, role, registration_date) 
            VALUES (?, ?, ?, 'player', NOW())"
        );
        $stmt->execute([$username, $hashedPassword, $email]);
        $user_id = $attempt->lastInsertId();
        
        // Insert default preferences
        $prefStmt = $attempt->prepare(
            "INSERT INTO user_preferences 
            (user_id, default_puzzle_size, preferred_background_image_id, sound_enabled, animations_enabled) 
            VALUES (?, '4x4', 1, 1, 1)"  // assume here that 1 = true, and 0 = false; //question mark placeholder is used for userid collected FROM users table
            // also 4x4 is the default size of the grid, so this can be static
        );
        $prefStmt->execute([$user_id]);
        
        $attempt->commit();
        echo json_encode(['success' => true, 'message' => 'Registered', 'user_id' => $user_id]);
    } catch (Exception $e) {
        $attempt->rollBack();
        echo json_encode(['success' => false, 'error' => 'Registration failed: ' . $e->getMessage()]);
    }
    exit;
}



// assume
$user_id = null;

//input handling
$input = json_decode(file_get_contents('php://input'), true);

// Update the game stats section
if (!$input || !isset($input['puzzle_size']) || !isset($input['time_taken']) || 
    !isset($input['moves_count']) || !isset($input['bg_image_id']) || 
    !isset($input['win_status']) || !isset($input['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid, try again please.']);
    exit;
}

try {
    $stats = $attempt->prepare(
        "INSERT INTO game_stats 
        (user_id, puzzle_size, time_taken_seconds, moves_count, background_image_id, win_status, game_date) 
        VALUES 
        (:user_id, :puzzle_size, :time_taken, :moves_count, :bg_image_id, :win_status, NOW())"
    );

    $stats->execute([
        ':user_id' => $input['user_id'],
        ':puzzle_size' => $input['puzzle_size'],
        ':time_taken' => $input['time_taken'],
        ':moves_count' => $input['moves_count'],
        ':bg_image_id' => $input['bg_image_id'],
        ':win_status' => $input['win_status'] ? 1 : 0
    ]);

    echo json_encode(['success' => true, 'stat_id' => $attempt->lastInsertId()]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>