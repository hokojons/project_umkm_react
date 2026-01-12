# 🏪 Pasar UMKM - Full Stack Application

Aplikasi e-commerce berbasis web untuk mendukung penjualan produk UMKM (Usaha Mikro, Kecil, dan Menengah) dengan fitur lengkap.

## 📚 Dokumentasi

- **[QUICK_START.md](./QUICK_START.md)** - Mulai dalam 5 menit ⚡
- **[SETUP_INTEGRATION.md](./SETUP_INTEGRATION.md)** - Setup lengkap & dokumentasi API 📖
- **[API_DOCUMENTATION.md](<./Food%20and%20Beverage%20Website%20(Copy)/src/API_DOCUMENTATION.md>)** - Detail endpoints

---

## 🎯 Fitur Utama

### 👤 User Management

- ✅ Register & Login
- ✅ Profile Management
- ✅ User Roles (Customer, UMKM, Admin)

### 🏢 UMKM Management

- ✅ Business Registration
- ✅ Business Profile
- ✅ Admin Approval System
- ✅ Category Management

### 🛍️ Shopping

- ✅ Product Catalog
- ✅ Add to Cart
- ✅ Cart Management
- ✅ Product Search & Filter

### 📅 Events

- ✅ Event Management
- ✅ Event Registration
- ✅ Participant Tracking

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client

### Backend

- **Laravel 11** - PHP Framework
- **Eloquent ORM** - Database ORM
- **MySQL/MariaDB** - Database
- **Composer** - Dependency Manager

### Database

- **MySQL 5.7+** / **MariaDB 10.4+**
- Structured tables untuk UMKM ecosystem

---

## 📁 Project Structure

```
Workspace/
│
├── Laravel/                              # Backend API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── ProductController.php
│   │   │   │       ├── BusinessController.php
│   │   │   │       ├── CartController.php
│   │   │   │       ├── EventController.php
│   │   │   │       └── CategoryController.php
│   │   │   └── Middleware/
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Product.php
│   │       ├── Business.php
│   │       ├── Category.php
│   │       ├── CartItem.php
│   │       ├── Event.php
│   │       ├── EventParticipant.php
│   │       └── Admin.php
│   ├── routes/
│   │   └── api.php                      # API Routes
│   ├── config/
│   │   └── cors.php                     # CORS Configuration
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 2025_12_18_000001_create_umkm_tables.php
│   │   └── seeders/
│   │       └── DatabaseSeeder.php
│   └── .env                             # Environment Config
│
├── Food and Beverage Website (Copy)/    # Frontend React App
│   ├── src/
│   │   ├── components/
│   │   │   └── [React Components]
│   │   ├── services/
│   │   │   ├── api.ts                   # Axios Setup
│   │   │   ├── authService.ts           # Auth API
│   │   │   ├── productService.ts        # Product API
│   │   │   ├── businessService.ts       # Business API
│   │   │   ├── cartService.ts           # Cart API
│   │   │   ├── eventService.ts          # Event API
│   │   │   └── [Other Services]
│   │   ├── config/
│   │   │   └── api.ts                   # API Configuration
│   │   ├── types/
│   │   │   └── api.ts                   # Type Definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env                             # Environment Config
│   └── vite.config.ts                   # Vite Configuration
│
├── SETUP_INTEGRATION.md                 # Setup Guide
├── QUICK_START.md                       # Quick Start Guide
└── dbumkm.sql                          # Database SQL Dump
```

---

## 📡 API Architecture

### Base URL

```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Key Endpoints

| Method | Endpoint               | Purpose                     |
| ------ | ---------------------- | --------------------------- |
| POST   | `/api/auth/register`   | User Registration           |
| POST   | `/api/auth/login`      | User Login                  |
| GET    | `/api/products`        | Get All Products            |
| POST   | `/api/products`        | Create Product              |
| POST   | `/api/businesses`      | Submit Business Application |
| GET    | `/api/cart/{userId}`   | Get User Cart               |
| POST   | `/api/events/register` | Register for Event          |

Lihat [SETUP_INTEGRATION.md](./SETUP_INTEGRATION.md#-api-endpoints) untuk endpoint lengkap.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & npm
- PHP 8.2+
- MySQL 5.7+ atau MariaDB 10.4+
- Composer

### Installation

1. **Clone/Download Project**

```bash
# Sudah di c:\Coding\Pak andre web\,
```

2. **Setup Database**

```bash
# Buat database
mysql -u root -p
CREATE DATABASE dbumkm;

# Exit mysql
exit
```

3. **Setup Laravel Backend**

```bash
cd Laravel
composer install
# Edit .env dengan database credentials
php artisan migrate
php artisan db:seed  # Optional
php artisan serve
```

4. **Setup React Frontend**

```bash
cd "Food and Beverage Website (Copy)"
npm install
# Buat .env dengan VITE_API_BASE_URL=http://localhost:8000/api
npm run dev
```

**Done!** ✅ Open `http://localhost:5173`

---

## 🔐 Database Schema

### Tabel Utama

#### `users` (tpengguna)

- User/Customer data
- Fields: id, name, phone, password, status

#### `businesses` (tumkm)

- UMKM business data
- Fields: user_id, owner_name, business_name, address, category_id, status

#### `products` (tproduk)

- Product listings
- Fields: id, user_id, name, price, description, status

#### `categories` (tkategori)

- Product categories
- Fields: id, name, status

#### `cart_items` (tcart)

- Shopping cart items
- Fields: user_id, product_id, quantity

#### `events` (tacara)

- Event data
- Fields: id, name, description, date, quota, registration_date

#### `event_participants` (tpesertaacara)

- Event registration
- Fields: event_id, user_id

---

## 🧪 Testing API

### Using Postman

1. Download Postman
2. Create new request
3. Use endpoints dari [API Documentation](./SETUP_INTEGRATION.md#-api-endpoints)
4. Add headers: `Content-Type: application/json`

### Using cURL

```bash
# Get all products
curl http://localhost:8000/api/products

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"081234567890","password":"password123"}'
```

---

## 📊 Development Workflow

```
1. Start Laravel Server (Terminal 1)
   └─ php artisan serve

2. Start React Dev Server (Terminal 2)
   └─ npm run dev

3. Open Browser
   └─ http://localhost:5173

4. Make Changes
   └─ Changes auto-reload thanks to Vite & Laravel live reload

5. Test API
   └─ Use Postman or Browser DevTools Network tab
```

---

## 🔄 Workflow Integrasi

```
┌─────────────────────────────────────────────────────┐
│          React Frontend (Vite)                      │
│  http://localhost:5173                             │
│                                                     │
│  Services → API Client (Axios) → HTTP Request     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼ CORS Enabled
┌─────────────────────────────────────────────────────┐
│       Laravel Backend API                           │
│  http://localhost:8000/api                         │
│                                                     │
│  Routes → Controllers → Models → Database         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼ Eloquent ORM
┌─────────────────────────────────────────────────────┐
│       MySQL Database (dbumkm)                       │
│                                                     │
│  Tables: users, products, businesses, etc          │
└─────────────────────────────────────────────────────┘
```

---

## 🚨 Common Issues & Solutions

| Issue                      | Solution                                           |
| -------------------------- | -------------------------------------------------- |
| CORS Error                 | Check `config/cors.php` allow origins              |
| Database Connection Failed | Verify MySQL running & .env credentials            |
| Port Already in Use        | Change port dengan `php artisan serve --port=8001` |
| npm dependencies error     | `npm install` & `npm ci`                           |
| React can't reach API      | Verify VITE_API_BASE_URL in .env                   |
| Migrations failed          | Check database exists & MySQL running              |

---

## 📝 Environment Variables

### Laravel (.env)

```env
APP_NAME=Laravel
APP_ENV=local
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dbumkm
DB_USERNAME=root
DB_PASSWORD=
```

### React (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MOCK_MODE=false
```

---

## 🎓 Learning Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📞 Support

Untuk pertanyaan atau issue:

1. Check [SETUP_INTEGRATION.md](./SETUP_INTEGRATION.md)
2. Check [QUICK_START.md](./QUICK_START.md)
3. Review API endpoints di `/api` endpoints

---

## 📄 License

Proyek ini adalah untuk kebutuhan UMKM marketplace.

---

## 🎉 Ready to Go!

Sudah siap? Mulai dengan [QUICK_START.md](./QUICK_START.md) untuk setup dalam 5 menit!

**Happy Coding!** 🚀
