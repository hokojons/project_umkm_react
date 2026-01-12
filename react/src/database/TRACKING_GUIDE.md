# 📦 Panduan Fitur Tracking Pengiriman - Pasar UMKM

## 🎯 Gambaran Umum

Fitur tracking pengiriman memungkinkan pembeli untuk:
- ✅ Melihat status real-time pengiriman barang
- ✅ Melacak lokasi paket saat ini
- ✅ Melihat timeline lengkap perjalanan paket
- ✅ Estimasi waktu tiba
- ✅ Riwayat pesanan dengan tracking terintegrasi

---

## 📊 Komponen Fitur

### 1. **Database Schema** (`tracking_schema.sql`)

#### Tabel Utama:

**A. `shipping_tracking`** - Data tracking utama
```sql
- tracking_number: Nomor resi unik (JNE-20241217-ABC12345)
- courier: Kurir pengiriman (JNE, J&T, SiCepat, dll)
- current_status: Status terkini (pending_pickup, in_transit, delivered, dll)
- estimated_delivery: Estimasi tiba
- actual_delivery: Waktu aktual terkirim
```

**B. `tracking_history`** - Timeline perjalanan paket
```sql
- status: Status di setiap checkpoint
- location: Lokasi saat update (Jakarta, Bandung, Surabaya)
- description: Detail status
- timestamp: Waktu update
```

**C. `courier_services`** - Daftar jasa kurir
```sql
- name: Nama kurir (JNE Express, J&T Express)
- code: Kode kurir (JNE, JNT)
- tracking_url_template: URL tracking external
- estimated_days: Estimasi hari pengiriman
```

#### Stored Procedures:

**`sp_create_tracking`** - Generate tracking untuk order baru
```sql
CALL sp_create_tracking('order_001', 'JNE', 3);
-- Generates: JNE-20241217-ABC12345
```

**`sp_update_tracking`** - Update status tracking
```sql
CALL sp_update_tracking(
  'JNE-20241217-ABC12345',
  'in_transit',
  'Bandung',
  'Paket dalam perjalanan',
  'SYSTEM'
);
```

---

### 2. **Frontend Components**

#### A. **TrackingModal** (`/components/TrackingModal.tsx`)

Modal utama untuk menampilkan info tracking dengan:

**Fitur:**
- 📍 Nomor resi & nama kurir
- ⏱️ Status terkini dengan warna indikator
- 📅 Estimasi waktu tiba
- 🗺️ Alamat pengiriman
- 📜 Timeline lengkap perjalanan paket
- 🔗 Link ke website kurir

**Visual Timeline:**
```
[●] Sedang Dikirim ← Terbaru (Indigo)
 │  Paket sedang dalam pengiriman oleh kurir
 │  📍 Surabaya | 🕐 17 Des 2024, 10:30
 │
[○] Tiba di Kota Tujuan
 │  Paket telah tiba di kota tujuan
 │  📍 Surabaya | 🕐 17 Des 2024, 06:00
 │
[○] Dalam Perjalanan
    Paket dalam perjalanan ke kota tujuan
    📍 Bandung | 🕐 16 Des 2024, 20:00
```

**Props:**
```typescript
interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;  // ID order yang akan dilacak
}
```

**Usage:**
```tsx
<TrackingModal
  isOpen={isTrackingOpen}
  onClose={() => setIsTrackingOpen(false)}
  orderId="order_123_abc"
/>
```

---

#### B. **OrderHistoryModal** (`/components/OrderHistoryModal.tsx`)

Modal riwayat pesanan dengan integrasi tracking:

**Fitur:**
- 📦 Daftar semua pesanan user
- 🏷️ Status pesanan (pending, processing, shipped, delivered)
- 💰 Total pembayaran
- 📍 Alamat pengiriman
- 🚚 Tombol "Lacak Pesanan" untuk order yang sudah dikirim
- 📱 Responsive design

**Order Status:**
| Status | Warna | Deskripsi | Aksi |
|--------|-------|-----------|------|
| pending | Yellow | Menunggu pembayaran | Bayar Sekarang |
| processing | Blue | Sedang diproses | Lacak Pesanan |
| shipped | Indigo | Sedang dikirim | Lacak Pesanan |
| delivered | Green | Terkirim | Beli Lagi |
| cancelled | Red | Dibatalkan | - |

**Props:**
```typescript
interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

---

### 3. **Data Structure (LocalStorage)**

#### A. Order Data (`pasar_umkm_orders`)
```json
{
  "id": "order_1734569500_abc123",
  "items": [...],
  "totalAmount": 350000,
  "shippingAddress": {
    "name": "Budi Santoso",
    "phone": "081234567890",
    "address": "Jl. Merdeka No. 123",
    "city": "Jakarta",
    "postalCode": "12345"
  },
  "paymentMethod": "bank_transfer",
  "status": "shipped",
  "createdAt": "2024-12-17T10:30:00.000Z"
}
```

#### B. Tracking Data (`tracking_${orderId}`)
```json
{
  "trackingNumber": "JNE-20241217-ABC12345",
  "courier": "JNE",
  "courierName": "JNE Express",
  "currentStatus": "in_transit",
  "currentStatusText": "Dalam Perjalanan",
  "estimatedDelivery": "2024-12-20T10:00:00.000Z",
  "orderId": "order_1734569500_abc123",
  "shippingAddress": "Jl. Merdeka No. 123",
  "shippingCity": "Jakarta",
  "history": [
    {
      "id": "hist_0",
      "status": "order_created",
      "statusText": "Pesanan Dibuat",
      "location": "Jakarta",
      "description": "Pesanan telah dibuat dan menunggu konfirmasi",
      "timestamp": "2024-12-15T10:00:00.000Z",
      "icon": "package"
    },
    {
      "id": "hist_1",
      "status": "picked_up",
      "statusText": "Diambil Kurir",
      "location": "Jakarta",
      "description": "Paket telah diambil oleh kurir JNE",
      "timestamp": "2024-12-16T08:00:00.000Z",
      "icon": "truck"
    }
  ]
}
```

---

## 🚀 Cara Menggunakan

### 1. **Untuk User (Pembeli)**

#### Langkah 1: Akses Riwayat Pesanan
```
1. Login ke akun
2. Klik avatar/nama di kanan atas
3. Pilih "Riwayat Pesanan" (ikon Package)
4. Modal riwayat pesanan akan terbuka
```

#### Langkah 2: Lacak Pesanan
```
1. Cari order yang ingin dilacak
2. Klik tombol "Lacak Pesanan" (dengan ikon truck)
3. Modal tracking akan terbuka
4. Lihat detail tracking dan timeline
```

#### Langkah 3: Lihat Detail Tracking
```
📦 Informasi yang ditampilkan:
   - Nomor Resi
   - Nama Kurir
   - Status Terkini
   - Estimasi Tiba
   - Alamat Pengiriman
   - Timeline Lengkap
   - Link ke Website Kurir
```

---

### 2. **Untuk Developer**

#### Setup Database (MySQL/XAMPP)

```sql
-- 1. Import schema tracking
source /path/to/tracking_schema.sql

-- 2. Verifikasi tabel
SHOW TABLES LIKE '%tracking%';
-- Output:
-- shipping_tracking
-- tracking_history
-- courier_services

-- 3. Cek sample data
SELECT * FROM courier_services;
SELECT * FROM v_tracking_details;
```

#### Generate Tracking untuk Order Baru

**Otomatis saat checkout:**
```javascript
// Setelah order dibuat
const generateTracking = (orderId) => {
  // Auto-generate tracking di frontend
  const couriers = ['JNE', 'JNT', 'SICEPAT'];
  const courier = couriers[Math.floor(Math.random() * couriers.length)];
  const trackingNumber = `${courier}-${Date.now()}-${randomString()}`;
  
  const tracking = {
    trackingNumber,
    courier,
    currentStatus: 'pending_pickup',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    orderId,
    history: [...]
  };
  
  localStorage.setItem(`tracking_${orderId}`, JSON.stringify(tracking));
};
```

**Manual via Database:**
```sql
-- Create tracking
CALL sp_create_tracking('order_123', 'JNE', 3);

-- Update status
CALL sp_update_tracking(
  'JNE-20241217-ABC12345',
  'picked_up',
  'Jakarta',
  'Paket telah diambil kurir',
  'SYSTEM'
);
```

#### Custom Tracking Status Flow

```javascript
// Status progression
const statusFlow = [
  'order_created',        // Pesanan dibuat
  'payment_confirmed',    // Pembayaran dikonfirmasi
  'processing',           // Sedang dikemas
  'ready_to_ship',        // Siap dikirim
  'picked_up',            // Diambil kurir
  'in_sorting_center',    // Di gudang sortir
  'in_transit',           // Dalam perjalanan
  'arrived_at_destination', // Tiba di kota tujuan
  'out_for_delivery',     // Sedang dikirim
  'delivered'             // Terkirim
];

// Icon mapping
const iconMap = {
  order_created: 'package',
  picked_up: 'truck',
  in_transit: 'truck',
  arrived_at_destination: 'location',
  delivered: 'check'
};
```

---

## 🎨 UI/UX Features

### Status Colors
```css
pending_pickup    → Yellow (Menunggu)
picked_up         → Blue (Diproses)
in_transit        → Indigo (Dalam Perjalanan)
out_for_delivery  → Blue (Sedang Dikirim)
delivered         → Green (Terkirim)
failed            → Red (Gagal)
returned          → Red (Dikembalikan)
```

### Timeline Design
- **Latest status**: Indigo filled circle dengan badge "Terbaru"
- **Past status**: Gray outlined circle
- **Vertical line**: Connects all timeline items
- **Icons**: Dynamic based on status type
- **Timestamps**: Indonesian locale format

### Responsive Layout
- **Desktop**: Full modal dengan max-width 2xl
- **Mobile**: Full screen modal dengan scroll
- **Tablet**: Optimized padding dan spacing

---

## 🔧 API Integration (Backend)

### Endpoint untuk Tracking

#### 1. Create Tracking
```php
POST /api/tracking/create
{
  "order_id": "order_123",
  "courier": "JNE",
  "estimated_days": 3
}

Response:
{
  "tracking_number": "JNE-20241217-ABC12345",
  "estimated_delivery": "2024-12-20"
}
```

#### 2. Get Tracking Info
```php
GET /api/tracking/{tracking_number}

Response:
{
  "tracking_number": "JNE-20241217-ABC12345",
  "courier": "JNE",
  "current_status": "in_transit",
  "history": [...]
}
```

#### 3. Update Tracking
```php
PUT /api/tracking/{tracking_number}
{
  "status": "in_transit",
  "location": "Bandung",
  "description": "Paket dalam perjalanan"
}
```

#### 4. Get Order Tracking
```php
GET /api/orders/{order_id}/tracking

Response:
{
  "order_id": "order_123",
  "tracking": {...},
  "history": [...]
}
```

### Sample API Code (PHP)
```php
// api/tracking.php
$endpoint = $_GET['endpoint'] ?? '';

switch ($endpoint) {
  case 'create':
    $orderId = $data['order_id'];
    $courier = $data['courier'];
    $days = $data['estimated_days'];
    
    $stmt = $pdo->prepare("CALL sp_create_tracking(?, ?, ?)");
    $stmt->execute([$orderId, $courier, $days]);
    $result = $stmt->fetch();
    
    echo json_encode([
      'success' => true,
      'tracking_number' => $result['tracking_number']
    ]);
    break;
    
  case 'get':
    $trackingNumber = $_GET['tracking_number'];
    
    $stmt = $pdo->prepare("
      SELECT * FROM v_tracking_details 
      WHERE tracking_number = ?
    ");
    $stmt->execute([$trackingNumber]);
    $tracking = $stmt->fetch();
    
    // Get history
    $stmt = $pdo->prepare("
      SELECT * FROM tracking_history th
      JOIN shipping_tracking st ON th.tracking_id = st.id
      WHERE st.tracking_number = ?
      ORDER BY th.timestamp DESC
    ");
    $stmt->execute([$trackingNumber]);
    $history = $stmt->fetchAll();
    
    echo json_encode([
      'success' => true,
      'tracking' => $tracking,
      'history' => $history
    ]);
    break;
}
```

---

## 📱 Testing Guide

### 1. Test Dummy Data

Aplikasi akan auto-generate tracking saat pertama kali buka modal. Untuk testing:

```javascript
// Test data generation
const testOrder = {
  id: 'order_test_001',
  status: 'shipped',
  items: [...],
  totalAmount: 350000,
  createdAt: new Date().toISOString()
};

// Save order
localStorage.setItem('pasar_umkm_orders', JSON.stringify([testOrder]));

// Open tracking modal
// Tracking akan auto-generate dengan:
// - Random courier (JNE/J&T/SiCepat)
// - Random tracking number
// - 5-7 timeline events
// - Realistic timestamps
```

### 2. Test Scenarios

**Scenario 1: Order Baru**
```
1. Checkout order baru
2. Status: pending → processing
3. Tracking belum tersedia
4. Tombol: "Lihat Status"
```

**Scenario 2: Order Dikirim**
```
1. Update order status → shipped
2. Auto-generate tracking
3. Tracking tersedia
4. Tombol: "Lacak Pesanan"
5. Modal tracking muncul
```

**Scenario 3: Order Terkirim**
```
1. Status: delivered
2. Tracking lengkap
3. actual_delivery terisi
4. Timeline complete
```

---

## 🚀 Fitur Lanjutan (Future Enhancement)

### 1. Real-time Updates
```javascript
// WebSocket integration
const ws = new WebSocket('ws://tracking-server');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  updateTracking(update);
};
```

### 2. Push Notifications
```javascript
// Service Worker for push
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      new Notification('Paket Anda telah tiba!');
    }
  });
}
```

### 3. Email/SMS Notifications
```sql
-- Add notification preferences
ALTER TABLE users ADD COLUMN notify_email TINYINT(1) DEFAULT 1;
ALTER TABLE users ADD COLUMN notify_sms TINYINT(1) DEFAULT 0;

-- Trigger notification
DELIMITER //
CREATE TRIGGER tr_notify_status_change
AFTER INSERT ON tracking_history
FOR EACH ROW
BEGIN
  -- Send email/SMS notification
  -- Implementation depends on email/SMS service
END //
DELIMITER ;
```

### 4. Map Integration
```javascript
// Google Maps API
<div id="tracking-map"></div>
<script>
  const map = new google.maps.Map(document.getElementById('tracking-map'), {
    center: { lat: -6.2088, lng: 106.8456 },
    zoom: 10
  });
  
  // Add markers for each location
  locations.forEach(loc => {
    new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map: map,
      title: loc.location
    });
  });
</script>
```

---

## 🔒 Security & Privacy

### 1. Data Protection
```javascript
// Only show tracking to order owner
const canViewTracking = (order, user) => {
  return order.userId === user.id || user.role === 'admin';
};
```

### 2. Tracking Number Security
```sql
-- Use UUID for tracking numbers
SELECT UUID() as tracking_number;

-- Or secure random
SELECT CONCAT(
  courier_code, '-',
  DATE_FORMAT(NOW(), '%Y%m%d'), '-',
  UPPER(SUBSTRING(MD5(RAND()), 1, 12))
) as tracking_number;
```

---

## 📊 Analytics & Reporting

### Delivery Performance
```sql
-- Average delivery time
SELECT 
  courier,
  AVG(DATEDIFF(actual_delivery, created_at)) as avg_days
FROM shipping_tracking
WHERE actual_delivery IS NOT NULL
GROUP BY courier;

-- On-time delivery rate
SELECT 
  courier,
  COUNT(CASE WHEN actual_delivery <= estimated_delivery THEN 1 END) * 100.0 / COUNT(*) as on_time_rate
FROM shipping_tracking
WHERE actual_delivery IS NOT NULL
GROUP BY courier;

-- Popular routes
SELECT 
  CONCAT(o.shipping_city, ' → ', th.location) as route,
  COUNT(*) as total_shipments
FROM tracking_history th
JOIN shipping_tracking st ON th.tracking_id = st.id
JOIN orders o ON st.order_id = o.id
GROUP BY route
ORDER BY total_shipments DESC
LIMIT 10;
```

---

## 📞 Support

**Troubleshooting:**

1. **Tracking tidak muncul**
   - Cek localStorage: `localStorage.getItem('tracking_${orderId}')`
   - Verifikasi order status (minimal 'processing')
   - Clear cache dan reload

2. **Timeline kosong**
   - Periksa format data tracking.history
   - Cek console untuk errors
   - Regenerate tracking data

3. **Status tidak update**
   - Manual update via localStorage
   - Atau call stored procedure `sp_update_tracking`

---

**Last Updated**: December 17, 2024

**Version**: 1.0

**Compatible With**: React 18+, MySQL 5.7+, localStorage
