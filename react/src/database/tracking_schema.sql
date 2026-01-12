-- ============================================
-- SHIPPING TRACKING SCHEMA
-- Tambahan untuk fitur tracking pengiriman
-- ============================================

USE `pasar_umkm`;

-- ============================================
-- TABLE: shipping_tracking
-- Menyimpan informasi tracking pengiriman
-- ============================================
CREATE TABLE IF NOT EXISTS `shipping_tracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(100) NOT NULL,
  `tracking_number` VARCHAR(100) NOT NULL UNIQUE,
  `courier` VARCHAR(50) NOT NULL COMMENT 'JNE, J&T, SiCepat, Anteraja, etc',
  `current_status` ENUM(
    'pending_pickup',
    'picked_up', 
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
    'returned'
  ) NOT NULL DEFAULT 'pending_pickup',
  `estimated_delivery` DATE,
  `actual_delivery` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_tracking_number` (`tracking_number`),
  INDEX `idx_current_status` (`current_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: tracking_history
-- Timeline/history setiap perubahan status
-- ============================================
CREATE TABLE IF NOT EXISTS `tracking_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tracking_id` INT NOT NULL,
  `status` ENUM(
    'order_created',
    'payment_confirmed',
    'processing',
    'ready_to_ship',
    'picked_up',
    'in_sorting_center',
    'in_transit',
    'arrived_at_destination',
    'out_for_delivery',
    'delivery_attempted',
    'delivered',
    'failed',
    'returned_to_sender'
  ) NOT NULL,
  `location` VARCHAR(255) COMMENT 'Lokasi saat update (kota/cabang)',
  `description` TEXT COMMENT 'Deskripsi detail status',
  `updated_by` VARCHAR(100) COMMENT 'User/system yang update',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`tracking_id`) REFERENCES `shipping_tracking`(`id`) ON DELETE CASCADE,
  INDEX `idx_tracking_id` (`tracking_id`),
  INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: courier_services
-- Daftar jasa pengiriman yang tersedia
-- ============================================
CREATE TABLE IF NOT EXISTS `courier_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `logo` TEXT,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `estimated_days_min` INT DEFAULT 1,
  `estimated_days_max` INT DEFAULT 7,
  `tracking_url_template` TEXT COMMENT 'URL tracking dengan placeholder {tracking_number}',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT COURIER SERVICES DATA
-- ============================================
INSERT INTO `courier_services` (`name`, `code`, `estimated_days_min`, `estimated_days_max`, `tracking_url_template`) VALUES
('JNE Express', 'JNE', 1, 3, 'https://www.jne.co.id/id/tracking/trace/{tracking_number}'),
('J&T Express', 'JNT', 1, 4, 'https://www.jet.co.id/track/{tracking_number}'),
('SiCepat Express', 'SICEPAT', 1, 3, 'https://www.sicepat.com/checkAwb/{tracking_number}'),
('Anteraja', 'ANTERAJA', 2, 5, 'https://anteraja.id/tracking/{tracking_number}'),
('Ninja Express', 'NINJA', 2, 4, 'https://www.ninjaxpress.co.id/tracking/{tracking_number}'),
('ID Express', 'IDX', 2, 5, 'https://www.idexpress.com/tracking/{tracking_number}'),
('POS Indonesia', 'POS', 3, 7, 'https://www.posindonesia.co.id/id/tracking/{tracking_number}'),
('Grab Express', 'GRAB', 1, 1, 'https://www.grab.com/id/express/'),
('GoSend', 'GOSEND', 1, 1, 'https://www.gojek.com/gosend/');

-- ============================================
-- VIEW: v_tracking_details
-- View lengkap untuk tracking dengan history
-- ============================================
CREATE OR REPLACE VIEW `v_tracking_details` AS
SELECT 
  st.id as tracking_id,
  st.order_id,
  st.tracking_number,
  st.courier,
  st.current_status,
  st.estimated_delivery,
  st.actual_delivery,
  st.created_at as tracking_created,
  o.user_id,
  o.total_amount,
  o.shipping_name,
  o.shipping_phone,
  o.shipping_address,
  o.shipping_city,
  o.shipping_postal_code,
  o.payment_method,
  o.order_status,
  o.created_at as order_created,
  u.name as customer_name,
  u.email as customer_email,
  cs.name as courier_name,
  cs.tracking_url_template,
  cs.estimated_days_min,
  cs.estimated_days_max,
  (
    SELECT COUNT(*) 
    FROM tracking_history 
    WHERE tracking_id = st.id
  ) as total_updates
FROM shipping_tracking st
LEFT JOIN orders o ON st.order_id = o.id
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN courier_services cs ON st.courier = cs.code;

-- ============================================
-- STORED PROCEDURE: sp_create_tracking
-- Buat tracking number untuk order
-- ============================================
DELIMITER //
CREATE PROCEDURE `sp_create_tracking`(
  IN p_order_id VARCHAR(100),
  IN p_courier VARCHAR(50),
  IN p_estimated_days INT
)
BEGIN
  DECLARE v_tracking_number VARCHAR(100);
  DECLARE v_tracking_id INT;
  DECLARE v_estimated_delivery DATE;
  
  -- Generate tracking number (format: COURIER-TIMESTAMP-RANDOM)
  SET v_tracking_number = CONCAT(
    p_courier, '-',
    DATE_FORMAT(NOW(), '%Y%m%d'), '-',
    UPPER(SUBSTRING(MD5(RAND()), 1, 8))
  );
  
  -- Calculate estimated delivery
  SET v_estimated_delivery = DATE_ADD(CURDATE(), INTERVAL p_estimated_days DAY);
  
  -- Insert tracking
  INSERT INTO shipping_tracking (
    order_id, 
    tracking_number, 
    courier, 
    estimated_delivery,
    current_status
  ) VALUES (
    p_order_id,
    v_tracking_number,
    p_courier,
    v_estimated_delivery,
    'pending_pickup'
  );
  
  SET v_tracking_id = LAST_INSERT_ID();
  
  -- Add initial history
  INSERT INTO tracking_history (
    tracking_id,
    status,
    location,
    description,
    updated_by
  ) VALUES (
    v_tracking_id,
    'order_created',
    'Warehouse',
    'Pesanan telah dibuat dan menunggu diproses',
    'SYSTEM'
  );
  
  -- Update order status
  UPDATE orders 
  SET order_status = 'processing'
  WHERE id = p_order_id;
  
  -- Return tracking info
  SELECT 
    v_tracking_id as tracking_id,
    v_tracking_number as tracking_number,
    v_estimated_delivery as estimated_delivery;
END //
DELIMITER ;

-- ============================================
-- STORED PROCEDURE: sp_update_tracking
-- Update status tracking dengan history
-- ============================================
DELIMITER //
CREATE PROCEDURE `sp_update_tracking`(
  IN p_tracking_number VARCHAR(100),
  IN p_status VARCHAR(50),
  IN p_location VARCHAR(255),
  IN p_description TEXT,
  IN p_updated_by VARCHAR(100)
)
BEGIN
  DECLARE v_tracking_id INT;
  DECLARE v_order_id VARCHAR(100);
  
  -- Get tracking ID
  SELECT id, order_id INTO v_tracking_id, v_order_id
  FROM shipping_tracking
  WHERE tracking_number = p_tracking_number;
  
  IF v_tracking_id IS NOT NULL THEN
    -- Update current status di shipping_tracking
    UPDATE shipping_tracking
    SET 
      current_status = CASE 
        WHEN p_status IN ('picked_up') THEN 'picked_up'
        WHEN p_status IN ('in_sorting_center', 'in_transit', 'arrived_at_destination') THEN 'in_transit'
        WHEN p_status = 'out_for_delivery' THEN 'out_for_delivery'
        WHEN p_status = 'delivered' THEN 'delivered'
        WHEN p_status = 'failed' THEN 'failed'
        WHEN p_status IN ('returned_to_sender') THEN 'returned'
        ELSE current_status
      END,
      actual_delivery = CASE 
        WHEN p_status = 'delivered' THEN NOW()
        ELSE actual_delivery
      END,
      updated_at = NOW()
    WHERE id = v_tracking_id;
    
    -- Add history entry
    INSERT INTO tracking_history (
      tracking_id,
      status,
      location,
      description,
      updated_by
    ) VALUES (
      v_tracking_id,
      p_status,
      p_location,
      p_description,
      p_updated_by
    );
    
    -- Update order status
    UPDATE orders
    SET order_status = CASE
      WHEN p_status = 'picked_up' THEN 'processing'
      WHEN p_status IN ('in_transit', 'out_for_delivery') THEN 'shipped'
      WHEN p_status = 'delivered' THEN 'delivered'
      WHEN p_status IN ('failed', 'returned_to_sender') THEN 'cancelled'
      ELSE order_status
    END
    WHERE id = v_order_id;
    
    SELECT v_tracking_id as tracking_id, 'Success' as message;
  ELSE
    SELECT NULL as tracking_id, 'Tracking number not found' as message;
  END IF;
END //
DELIMITER ;

-- ============================================
-- FUNCTION: fn_get_tracking_status_text
-- Convert status code ke text bahasa Indonesia
-- ============================================
DELIMITER //
CREATE FUNCTION `fn_get_tracking_status_text`(p_status VARCHAR(50))
RETURNS VARCHAR(255)
DETERMINISTIC
BEGIN
  RETURN CASE p_status
    WHEN 'order_created' THEN 'Pesanan Dibuat'
    WHEN 'payment_confirmed' THEN 'Pembayaran Dikonfirmasi'
    WHEN 'processing' THEN 'Sedang Diproses'
    WHEN 'ready_to_ship' THEN 'Siap Dikirim'
    WHEN 'picked_up' THEN 'Diambil Kurir'
    WHEN 'in_sorting_center' THEN 'Di Gudang Sortir'
    WHEN 'in_transit' THEN 'Dalam Perjalanan'
    WHEN 'arrived_at_destination' THEN 'Tiba di Kota Tujuan'
    WHEN 'out_for_delivery' THEN 'Sedang Dikirim'
    WHEN 'delivery_attempted' THEN 'Percobaan Pengiriman'
    WHEN 'delivered' THEN 'Terkirim'
    WHEN 'failed' THEN 'Gagal Terkirim'
    WHEN 'returned_to_sender' THEN 'Dikembalikan'
    ELSE 'Status Tidak Diketahui'
  END;
END //
DELIMITER ;

-- ============================================
-- SAMPLE DATA untuk testing
-- ============================================
-- Create tracking untuk order yang sudah ada
CALL sp_create_tracking('order_001', 'JNE', 3);

-- Update tracking dengan beberapa status
SET @tracking_num = (SELECT tracking_number FROM shipping_tracking WHERE order_id = 'order_001' LIMIT 1);

CALL sp_update_tracking(@tracking_num, 'payment_confirmed', 'Jakarta', 'Pembayaran telah dikonfirmasi', 'ADMIN');
CALL sp_update_tracking(@tracking_num, 'processing', 'Jakarta', 'Pesanan sedang dikemas', 'WAREHOUSE');
CALL sp_update_tracking(@tracking_num, 'picked_up', 'Jakarta', 'Paket telah diambil kurir JNE', 'JNE_COURIER_001');
CALL sp_update_tracking(@tracking_num, 'in_transit', 'Bandung', 'Paket dalam perjalanan ke kota tujuan', 'SYSTEM');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Lihat semua tracking
SELECT * FROM v_tracking_details;

-- Lihat tracking history untuk order tertentu
SELECT 
  th.*,
  fn_get_tracking_status_text(th.status) as status_text
FROM tracking_history th
JOIN shipping_tracking st ON th.tracking_id = st.id
WHERE st.order_id = 'order_001'
ORDER BY th.timestamp DESC;

-- Lihat courier services
SELECT * FROM courier_services WHERE is_active = 1;

-- Stats tracking
SELECT 
  current_status,
  COUNT(*) as total
FROM shipping_tracking
GROUP BY current_status;
