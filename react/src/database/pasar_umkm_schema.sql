-- ============================================
-- DATABASE SCHEMA: PASAR UMKM MARKETPLACE
-- untuk XAMPP MySQL/MariaDB
-- ============================================

-- Buat database baru
CREATE DATABASE IF NOT EXISTS `pasar_umkm` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `pasar_umkm`;

-- ============================================
-- TABLE: users
-- Menyimpan data pengguna dengan 3 role
-- ============================================
CREATE TABLE `users` (
  `id` VARCHAR(100) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL COMMENT 'Hash password dengan bcrypt',
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'umkm', 'admin') NOT NULL DEFAULT 'user',
  `phone` VARCHAR(20),
  `avatar` TEXT,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: businesses
-- Menyimpan data bisnis/toko UMKM
-- ============================================
CREATE TABLE `businesses` (
  `id` VARCHAR(100) PRIMARY KEY,
  `owner_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `owner_name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `about` TEXT COMMENT 'Cerita About Me pemilik',
  `image` TEXT,
  `rating` DECIMAL(2,1) DEFAULT 0.0,
  `category` ENUM('Fashion', 'Kerajinan', 'Kuliner', 'Kecantikan', 'Aksesoris', 'UMKM') NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_rating` (`rating`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: products
-- Menyimpan produk dari setiap bisnis
-- ============================================
CREATE TABLE `products` (
  `id` VARCHAR(100) PRIMARY KEY,
  `business_id` VARCHAR(100) NOT NULL,
  `owner_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(12,2) NOT NULL,
  `image` TEXT,
  `category` ENUM('product', 'food', 'accessory', 'craft') NOT NULL DEFAULT 'product',
  `stock` INT DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_business_id` (`business_id`),
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_price` (`price`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: cart_items
-- Menyimpan item dalam keranjang belanja
-- ============================================
CREATE TABLE `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `business_id` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: orders
-- Menyimpan data pesanan
-- ============================================
CREATE TABLE `orders` (
  `id` VARCHAR(100) PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `shipping_name` VARCHAR(255) NOT NULL,
  `shipping_phone` VARCHAR(20) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_postal_code` VARCHAR(10) NOT NULL,
  `payment_method` ENUM('bank_transfer', 'e_wallet', 'cod') NOT NULL,
  `payment_status` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  `order_status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_order_status` (`order_status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: order_items
-- Detail item dalam setiap pesanan
-- ============================================
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(100) NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `business_id` VARCHAR(100) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_price` DECIMAL(12,2) NOT NULL,
  `business_name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_business_id` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: role_upgrade_requests
-- Permintaan upgrade role dari user ke UMKM
-- ============================================
CREATE TABLE `role_upgrade_requests` (
  `id` VARCHAR(100) PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `requested_role` ENUM('umkm') NOT NULL DEFAULT 'umkm',
  `current_role` ENUM('user', 'umkm') NOT NULL,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` TIMESTAMP NULL,
  `reviewed_by` VARCHAR(100),
  `admin_notes` TEXT,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_submitted_at` (`submitted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: sessions (optional - untuk token management)
-- ============================================
CREATE TABLE `sessions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `access_token` TEXT NOT NULL,
  `refresh_token` TEXT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reviews (optional - untuk review produk)
-- ============================================
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `business_id` VARCHAR(100) NOT NULL,
  `product_id` VARCHAR(100),
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_business_id` (`business_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIEWS untuk query yang sering dipakai
-- ============================================

-- View untuk melihat semua bisnis dengan info pemilik
CREATE VIEW `v_businesses_with_owner` AS
SELECT 
  b.*,
  u.email as owner_email,
  u.phone as owner_phone,
  (SELECT COUNT(*) FROM products WHERE business_id = b.id AND is_active = 1) as total_products
FROM businesses b
LEFT JOIN users u ON b.owner_id = u.id;

-- View untuk melihat produk dengan info bisnis
CREATE VIEW `v_products_with_business` AS
SELECT 
  p.*,
  b.name as business_name,
  b.owner_name as business_owner,
  b.category as business_category
FROM products p
LEFT JOIN businesses b ON p.business_id = b.id;

-- View untuk statistics dashboard
CREATE VIEW `v_dashboard_stats` AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'umkm') as total_umkm,
  (SELECT COUNT(*) FROM businesses WHERE status = 'approved') as total_businesses,
  (SELECT COUNT(*) FROM products WHERE is_active = 1) as total_products,
  (SELECT COUNT(*) FROM orders WHERE order_status != 'cancelled') as total_orders,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status != 'cancelled') as total_revenue;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure untuk menambahkan item ke cart
DELIMITER //
CREATE PROCEDURE `sp_add_to_cart`(
  IN p_user_id VARCHAR(100),
  IN p_product_id VARCHAR(100),
  IN p_business_id VARCHAR(100),
  IN p_quantity INT
)
BEGIN
  INSERT INTO cart_items (user_id, product_id, business_id, quantity)
  VALUES (p_user_id, p_product_id, p_business_id, p_quantity)
  ON DUPLICATE KEY UPDATE 
    quantity = quantity + p_quantity,
    updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Procedure untuk checkout (convert cart to order)
DELIMITER //
CREATE PROCEDURE `sp_checkout`(
  IN p_user_id VARCHAR(100),
  IN p_order_id VARCHAR(100),
  IN p_shipping_name VARCHAR(255),
  IN p_shipping_phone VARCHAR(20),
  IN p_shipping_address TEXT,
  IN p_shipping_city VARCHAR(100),
  IN p_shipping_postal_code VARCHAR(10),
  IN p_payment_method VARCHAR(20)
)
BEGIN
  DECLARE v_total DECIMAL(12,2);
  
  -- Calculate total
  SELECT SUM(p.price * c.quantity) INTO v_total
  FROM cart_items c
  JOIN products p ON c.product_id = p.id
  WHERE c.user_id = p_user_id;
  
  -- Create order
  INSERT INTO orders (
    id, user_id, total_amount, 
    shipping_name, shipping_phone, shipping_address, 
    shipping_city, shipping_postal_code, payment_method
  ) VALUES (
    p_order_id, p_user_id, v_total,
    p_shipping_name, p_shipping_phone, p_shipping_address,
    p_shipping_city, p_shipping_postal_code, p_payment_method
  );
  
  -- Move cart items to order_items
  INSERT INTO order_items (
    order_id, product_id, business_id, 
    product_name, product_price, business_name,
    quantity, subtotal
  )
  SELECT 
    p_order_id, c.product_id, c.business_id,
    p.name, p.price, b.name,
    c.quantity, (p.price * c.quantity)
  FROM cart_items c
  JOIN products p ON c.product_id = p.id
  JOIN businesses b ON c.business_id = b.id
  WHERE c.user_id = p_user_id;
  
  -- Clear cart
  DELETE FROM cart_items WHERE user_id = p_user_id;
  
  SELECT p_order_id as order_id, v_total as total_amount;
END //
DELIMITER ;

-- Procedure untuk approve role upgrade request
DELIMITER //
CREATE PROCEDURE `sp_approve_role_upgrade`(
  IN p_request_id VARCHAR(100),
  IN p_admin_id VARCHAR(100),
  IN p_admin_notes TEXT
)
BEGIN
  DECLARE v_user_id VARCHAR(100);
  
  -- Get user_id from request
  SELECT user_id INTO v_user_id
  FROM role_upgrade_requests
  WHERE id = p_request_id;
  
  -- Update user role
  UPDATE users 
  SET role = 'umkm'
  WHERE id = v_user_id;
  
  -- Update request status
  UPDATE role_upgrade_requests
  SET 
    status = 'approved',
    reviewed_at = CURRENT_TIMESTAMP,
    reviewed_by = p_admin_id,
    admin_notes = p_admin_notes
  WHERE id = p_request_id;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger untuk auto-update rating bisnis saat ada review baru
DELIMITER //
CREATE TRIGGER `tr_update_business_rating` 
AFTER INSERT ON `reviews`
FOR EACH ROW
BEGIN
  UPDATE businesses
  SET rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE business_id = NEW.business_id
  )
  WHERE id = NEW.business_id;
END //
DELIMITER ;

-- ============================================
-- INDEXES untuk performa
-- ============================================
-- Sudah ditambahkan di setiap CREATE TABLE

-- ============================================
-- GRANTS (optional - untuk user management)
-- ============================================
-- CREATE USER 'pasar_umkm_user'@'localhost' IDENTIFIED BY 'password_here';
-- GRANT ALL PRIVILEGES ON pasar_umkm.* TO 'pasar_umkm_user'@'localhost';
-- FLUSH PRIVILEGES;
