<?php
/**
 * ============================================
 * API EXAMPLES - PASAR UMKM MARKETPLACE
 * Contoh REST API endpoints untuk XAMPP
 * ============================================
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'pasar_umkm');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Create PDO connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$endpoint = $_GET['endpoint'] ?? '';

// ============================================
// ROUTER
// ============================================
switch ($endpoint) {
    // Auth endpoints
    case 'login':
        handleLogin($pdo);
        break;
    case 'register':
        handleRegister($pdo);
        break;
    case 'logout':
        handleLogout($pdo);
        break;
    
    // User endpoints
    case 'users':
        handleUsers($pdo, $method);
        break;
    case 'profile':
        handleProfile($pdo, $method);
        break;
    
    // Business endpoints
    case 'businesses':
        handleBusinesses($pdo, $method);
        break;
    case 'my-businesses':
        handleMyBusinesses($pdo);
        break;
    
    // Product endpoints
    case 'products':
        handleProducts($pdo, $method);
        break;
    case 'products-by-business':
        handleProductsByBusiness($pdo);
        break;
    
    // Cart endpoints
    case 'cart':
        handleCart($pdo, $method);
        break;
    case 'cart-add':
        handleAddToCart($pdo);
        break;
    
    // Order endpoints
    case 'orders':
        handleOrders($pdo, $method);
        break;
    case 'checkout':
        handleCheckout($pdo);
        break;
    
    // Role upgrade endpoints
    case 'role-upgrade-request':
        handleRoleUpgradeRequest($pdo, $method);
        break;
    
    // Dashboard endpoints
    case 'dashboard-stats':
        handleDashboardStats($pdo);
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}

// ============================================
// AUTH HANDLERS
// ============================================

function handleLogin($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email dan password harus diisi']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            // Generate token
            $token = bin2hex(random_bytes(32));
            $sessionId = 'session_' . time() . '_' . bin2hex(random_bytes(8));
            $expiresAt = date('Y-m-d H:i:s', time() + 86400); // 24 hours
            
            // Save session
            $stmt = $pdo->prepare("
                INSERT INTO sessions (id, user_id, access_token, expires_at) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$sessionId, $user['id'], $token, $expiresAt]);
            
            // Remove password from response
            unset($user['password']);
            
            echo json_encode([
                'success' => true,
                'user' => $user,
                'access_token' => $token
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Email atau password salah']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Login failed']);
    }
}

function handleRegister($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    
    if (empty($email) || empty($password) || empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email, password, dan nama harus diisi']);
        return;
    }
    
    try {
        // Check if email exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email sudah terdaftar']);
            return;
        }
        
        // Create user
        $userId = 'user_' . time() . '_' . bin2hex(random_bytes(8));
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $pdo->prepare("
            INSERT INTO users (id, email, password, name, phone, role) 
            VALUES (?, ?, ?, ?, ?, 'user')
        ");
        $stmt->execute([$userId, $email, $hashedPassword, $name, $phone]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'user_id' => $userId
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed']);
    }
}

function handleLogout($pdo) {
    $token = getBearerToken();
    
    if ($token) {
        try {
            $stmt = $pdo->prepare("DELETE FROM sessions WHERE access_token = ?");
            $stmt->execute([$token]);
            echo json_encode(['success' => true, 'message' => 'Logout berhasil']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Logout failed']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
    }
}

// ============================================
// BUSINESS HANDLERS
// ============================================

function handleBusinesses($pdo, $method) {
    switch ($method) {
        case 'GET':
            $category = $_GET['category'] ?? null;
            $status = $_GET['status'] ?? 'approved';
            
            try {
                $query = "SELECT * FROM v_businesses_with_owner WHERE status = ?";
                $params = [$status];
                
                if ($category) {
                    $query .= " AND category = ?";
                    $params[] = $category;
                }
                
                $query .= " ORDER BY rating DESC, created_at DESC";
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $businesses = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'data' => $businesses]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch businesses']);
            }
            break;
            
        case 'POST':
            $user = authenticateUser($pdo);
            if (!$user || $user['role'] !== 'umkm') {
                http_response_code(403);
                echo json_encode(['error' => 'Only UMKM can create businesses']);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            try {
                $bizId = 'biz_' . time() . '_' . bin2hex(random_bytes(6));
                
                $stmt = $pdo->prepare("
                    INSERT INTO businesses (
                        id, owner_id, name, owner_name, description, 
                        about, image, category, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')
                ");
                
                $stmt->execute([
                    $bizId,
                    $user['id'],
                    $data['name'],
                    $data['owner_name'],
                    $data['description'],
                    $data['about'] ?? null,
                    $data['image'],
                    $data['category']
                ]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Business created',
                    'business_id' => $bizId
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create business']);
            }
            break;
    }
}

function handleMyBusinesses($pdo) {
    $user = authenticateUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM v_businesses_with_owner 
            WHERE owner_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $businesses = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $businesses]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch businesses']);
    }
}

// ============================================
// PRODUCT HANDLERS
// ============================================

function handleProducts($pdo, $method) {
    switch ($method) {
        case 'GET':
            $businessId = $_GET['business_id'] ?? null;
            
            try {
                if ($businessId) {
                    $stmt = $pdo->prepare("
                        SELECT * FROM v_products_with_business 
                        WHERE business_id = ? AND is_active = 1
                    ");
                    $stmt->execute([$businessId]);
                } else {
                    $stmt = $pdo->query("
                        SELECT * FROM v_products_with_business 
                        WHERE is_active = 1 
                        ORDER BY created_at DESC
                    ");
                }
                
                $products = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $products]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch products']);
            }
            break;
            
        case 'POST':
            $user = authenticateUser($pdo);
            if (!$user || $user['role'] !== 'umkm') {
                http_response_code(403);
                echo json_encode(['error' => 'Only UMKM can add products']);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            try {
                $prodId = 'prod_' . time() . '_' . bin2hex(random_bytes(6));
                
                $stmt = $pdo->prepare("
                    INSERT INTO products (
                        id, business_id, owner_id, name, description, 
                        price, image, category, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $prodId,
                    $data['business_id'],
                    $user['id'],
                    $data['name'],
                    $data['description'],
                    $data['price'],
                    $data['image'] ?? null,
                    $data['category'],
                    $data['stock'] ?? 0
                ]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Product added',
                    'product_id' => $prodId
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add product']);
            }
            break;
    }
}

// ============================================
// CART HANDLERS
// ============================================

function handleCart($pdo, $method) {
    $user = authenticateUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    switch ($method) {
        case 'GET':
            try {
                $stmt = $pdo->prepare("
                    SELECT 
                        c.*,
                        p.name, p.description, p.price, p.image, p.category,
                        b.name as business_name
                    FROM cart_items c
                    JOIN products p ON c.product_id = p.id
                    JOIN businesses b ON c.business_id = b.id
                    WHERE c.user_id = ?
                ");
                $stmt->execute([$user['id']]);
                $cartItems = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'data' => $cartItems]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch cart']);
            }
            break;
            
        case 'DELETE':
            try {
                $stmt = $pdo->prepare("DELETE FROM cart_items WHERE user_id = ?");
                $stmt->execute([$user['id']]);
                echo json_encode(['success' => true, 'message' => 'Cart cleared']);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to clear cart']);
            }
            break;
    }
}

function handleAddToCart($pdo) {
    $user = authenticateUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $pdo->prepare("CALL sp_add_to_cart(?, ?, ?, ?)")
            ->execute([
                $user['id'],
                $data['product_id'],
                $data['business_id'],
                $data['quantity'] ?? 1
            ]);
        
        echo json_encode(['success' => true, 'message' => 'Added to cart']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add to cart']);
    }
}

// ============================================
// ORDER HANDLERS
// ============================================

function handleCheckout($pdo) {
    $user = authenticateUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $orderId = 'order_' . time() . '_' . bin2hex(random_bytes(8));
        
        $stmt = $pdo->prepare("CALL sp_checkout(?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user['id'],
            $orderId,
            $data['shipping_name'],
            $data['shipping_phone'],
            $data['shipping_address'],
            $data['shipping_city'],
            $data['shipping_postal_code'],
            $data['payment_method']
        ]);
        
        $result = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => 'Order created',
            'order' => $result
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Checkout failed: ' . $e->getMessage()]);
    }
}

// ============================================
// DASHBOARD HANDLERS
// ============================================

function handleDashboardStats($pdo) {
    $user = authenticateUser($pdo);
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin only']);
        return;
    }
    
    try {
        $stmt = $pdo->query("SELECT * FROM v_dashboard_stats");
        $stats = $stmt->fetch();
        
        echo json_encode(['success' => true, 'data' => $stats]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch stats']);
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function authenticateUser($pdo) {
    $token = getBearerToken();
    if (!$token) return null;
    
    try {
        $stmt = $pdo->prepare("
            SELECT u.* 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.access_token = ? 
            AND s.expires_at > NOW()
            AND u.is_active = 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if ($user) {
            unset($user['password']);
            return $user;
        }
    } catch (PDOException $e) {
        return null;
    }
    
    return null;
}

function handleUsers($pdo, $method) {
    $user = authenticateUser($pdo);
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin only']);
        return;
    }
    
    if ($method === 'GET') {
        try {
            $stmt = $pdo->query("
                SELECT id, email, name, role, phone, is_active, created_at 
                FROM users 
                ORDER BY created_at DESC
            ");
            $users = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $users]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch users']);
        }
    }
}

function handleProfile($pdo, $method) {
    $user = authenticateUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    echo json_encode(['success' => true, 'data' => $user]);
}

function handleRoleUpgradeRequest($pdo, $method) {
    switch ($method) {
        case 'GET':
            $user = authenticateUser($pdo);
            if (!$user || $user['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Admin only']);
                return;
            }
            
            try {
                $stmt = $pdo->query("
                    SELECT * FROM role_upgrade_requests 
                    ORDER BY submitted_at DESC
                ");
                $requests = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $requests]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch requests']);
            }
            break;
            
        case 'POST':
            $user = authenticateUser($pdo);
            if (!$user) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            try {
                $reqId = 'req_' . time() . '_' . bin2hex(random_bytes(6));
                
                $stmt = $pdo->prepare("
                    INSERT INTO role_upgrade_requests (
                        id, user_id, user_email, user_name, 
                        current_role, reason
                    ) VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $reqId,
                    $user['id'],
                    $user['email'],
                    $user['name'],
                    $user['role'],
                    $data['reason'] ?? null
                ]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Request submitted',
                    'request_id' => $reqId
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to submit request']);
            }
            break;
    }
}
