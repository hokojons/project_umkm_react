# 🚀 Panduan Setup Integrasi React + Laravel + Database UMKM

Ini adalah dokumentasi lengkap untuk menjalankan full-stack application Pasar UMKM dengan React frontend dan Laravel backend.

## 📋 Requirements

- **PHP**: 8.2 atau lebih tinggi
- **Node.js**: 18 atau lebih tinggi
- **MySQL/MariaDB**: 5.7 atau lebih tinggi
- **Composer**: Latest version
- **npm** atau **yarn**: Package manager

## 🗄️ Database Setup

### 1. Buat Database

```bash
# Masuk ke MySQL
mysql -u root -p

# Di MySQL console, jalankan:
CREATE DATABASE dbumkm;
USE dbumkm;
```

### 2. Import Data dari SQL File (Opsional)

Jika Anda memiliki data dari `dbumkm.sql`:

```bash
mysql -u root -p dbumkm < dbumkm.sql
```

### 3. Konfigurasi Laravel

Edit file `Laravel/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dbumkm
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Jalankan Migrations

```bash
cd Laravel
php artisan migrate
```

Ini akan membuat tabel-tabel baru yang sesuai dengan struktur Eloquent:

- `users` - Pengguna/Customers
- `categories` - Kategori Produk
- `businesses` - Data UMKM
- `products` - Produk
- `cart_items` - Item di Cart
- `events` - Event/Acara
- `event_participants` - Peserta Event
- `admins` - Admin

## 🔧 Laravel Setup

```bash
cd Laravel

# Install dependencies
composer install

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database (optional - untuk test data)
php artisan db:seed

# Start development server
php artisan serve
```

Server Laravel akan berjalan di: **http://localhost:8000**

## ⚛️ React Frontend Setup

```bash
cd "Food and Beverage Website (Copy)"

# Install dependencies
npm install

# Create .env file
# Edit .env dengan:
VITE_API_BASE_URL=http://localhost:8000/api

# Start development server
npm run dev
```

React akan berjalan di: **http://localhost:5173**

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register          - Register user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
```

### Products

```
GET    /api/products               - Get all products
GET    /api/products/{id}          - Get product detail
POST   /api/products               - Create product (UMKM)
PUT    /api/products/{id}          - Update product
DELETE /api/products/{id}          - Delete product
GET    /api/products/business/{userId}  - Get products by business
```

### Businesses (UMKM)

```
GET    /api/businesses             - Get all businesses
GET    /api/businesses/{userId}    - Get business detail
POST   /api/businesses             - Submit business application
PUT    /api/businesses/{userId}    - Update business
GET    /api/businesses/category/{categoryId}  - Get by category
GET    /api/businesses/admin/pending           - Get pending applications
POST   /api/businesses/admin/{userId}/approve - Approve application
POST   /api/businesses/admin/{userId}/reject  - Reject application
```

### Cart

```
GET    /api/cart/{userId}          - Get user cart
POST   /api/cart                   - Add item to cart
PUT    /api/cart/{userId}/{productId}   - Update cart item
DELETE /api/cart/{userId}/{productId}   - Remove item from cart
DELETE /api/cart/{userId}/clear         - Clear entire cart
```

### Events

```
GET    /api/events                 - Get all events
GET    /api/events/{id}            - Get event detail
POST   /api/events                 - Create event (Admin)
POST   /api/events/register        - Register for event
DELETE /api/events/{eventId}/{userId}   - Unregister from event
GET    /api/events/user/{userId}   - Get user's events
```

### Categories

```
GET    /api/categories             - Get all categories
POST   /api/categories             - Create category
PUT    /api/categories/{id}        - Update category
DELETE /api/categories/{id}        - Delete category
```

## 🔐 CORS Configuration

CORS sudah dikonfigurasi di `Laravel/config/cors.php` untuk mengizinkan semua origin selama development.

**Untuk Production**, ubah di `config/cors.php`:

```php
'allowed_origins' => [
    'https://your-domain.com',
    'https://www.your-domain.com',
],
```

## 📝 Struktur Models

### User

- id (string, primary)
- name
- phone (unique)
- password
- status (active/inactive)
- relationships: business, products, cartItems, eventParticipations

### Business

- user_id (string, primary)
- owner_name
- business_name
- address
- category_id
- status (pending/approved/rejected)
- relationships: user, category, products

### Product

- id (string, primary)
- user_id
- name
- price
- description
- status (active/inactive)
- relationships: user, cartItems

### Category

- id (string, primary)
- name
- status (active/inactive)
- relationships: businesses

## 🧪 Testing API

Gunakan Postman atau similar tools:

1. **Register User**

```
POST http://localhost:8000/api/auth/register
Body:
{
  "id": "USER001",
  "name": "John Doe",
  "phone": "081234567890",
  "password": "password123",
  "password_confirmation": "password123"
}
```

2. **Login**

```
POST http://localhost:8000/api/auth/login
Body:
{
  "phone": "081234567890",
  "password": "password123"
}
```

3. **Get Products**

```
GET http://localhost:8000/api/products
```

## 🚨 Troubleshooting

### Database Connection Error

- Pastikan MySQL service running
- Check `.env` database credentials
- Run `php artisan migrate` untuk membuat tables

### CORS Error

- Check `config/cors.php` configuration
- Ensure Laravel server running di correct URL
- React `.env` must have correct `VITE_API_BASE_URL`

### Frontend tidak bisa connect ke API

- Verify Laravel server running: `php artisan serve`
- Check network tab di browser DevTools
- Ensure `.env` file di React folder dengan correct BASE_URL

### Port Conflict

- Laravel default: 8000 (bisa ubah: `php artisan serve --port=8001`)
- React default: 5173 (bisa ubah di `vite.config.ts`)

## 📚 Dokumentasi Lebih Lanjut

- [Laravel Documentation](https://laravel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Axios Documentation](https://axios-http.com/)

## 📦 Project Structure

```
Workspace/
├── Laravel/                     # Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/    # API Controllers
│   │   └── Models/                  # Eloquent Models
│   ├── routes/
│   │   └── api.php               # API Routes
│   ├── config/
│   │   └── cors.php              # CORS Config
│   ├── database/
│   │   ├── migrations/           # Database Migrations
│   │   └── seeders/              # Database Seeders
│   └── .env                      # Environment Config
│
└── Food and Beverage Website (Copy)/  # Frontend
    ├── src/
    │   ├── components/           # React Components
    │   ├── services/             # API Services
    │   ├── config/
    │   │   └── api.ts            # API Configuration
    │   ├── types/
    │   │   └── api.ts            # API Type Definitions
    │   └── App.tsx               # Main App Component
    ├── .env                      # Environment Config
    └── vite.config.ts            # Vite Configuration
```

## ✅ Checklist Setup

- [ ] Database MySQL created dan running
- [ ] Laravel `.env` configured with database credentials
- [ ] Laravel migrations run successfully
- [ ] Laravel server running on http://localhost:8000
- [ ] React `.env` configured with VITE_API_BASE_URL
- [ ] React dependencies installed
- [ ] React server running on http://localhost:5173
- [ ] Test API endpoints dengan Postman/Insomnia
- [ ] Frontend can communicate with backend

---

**Happy Coding! 🎉**
