# Laravel Integration Guide

Panduan lengkap untuk mengintegrasikan aplikasi React Pasar UMKM dengan Laravel Backend.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup React Frontend](#setup-react-frontend)
4. [Setup Laravel Backend](#setup-laravel-backend)
5. [API Service Layer](#api-service-layer)
6. [Authentication Flow](#authentication-flow)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## 🎯 Overview

Aplikasi Pasar UMKM kini **siap diintegrasikan dengan Laravel backend**. Semua fitur telah direfactor menggunakan **API Service Layer** yang terstruktur.

### Fitur yang Sudah Siap:
✅ Authentication (Login, Register, JWT)  
✅ Business Management (CRUD)  
✅ Product Management (CRUD)  
✅ Shopping Cart  
✅ Orders & Checkout  
✅ Order Tracking  
✅ Gift Packages  
✅ Events & Applications  
✅ Role Management (User, UMKM, Admin)  
✅ Admin Panel  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)          │
│                                         │
│  Components → Services → API Client    │
│                    ↓                    │
└────────────────────┼────────────────────┘
                     │ HTTP/JSON
                     ↓
┌─────────────────────────────────────────┐
│         Laravel Backend API             │
│                                         │
│  Routes → Controllers → Models → DB    │
│                                         │
└─────────────────────────────────────────┘
```

### Tech Stack:

**Frontend:**
- React + TypeScript
- Tailwind CSS
- Axios (HTTP Client)
- Context API (State Management)

**Backend (Yang perlu Anda buat):**
- Laravel 10+
- MySQL/PostgreSQL
- JWT Authentication
- RESTful API

---

## ⚙️ Setup React Frontend

### 1. Clone & Install

```bash
# Install dependencies
npm install
```

### 2. Configure Environment

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Laravel API URL
VITE_API_BASE_URL=http://localhost:8000/api

# Set to false untuk pakai Laravel API
VITE_MOCK_MODE=false
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

---

## 🚀 Setup Laravel Backend

### 1. Create Laravel Project

```bash
composer create-project laravel/laravel pasar-umkm-backend
cd pasar-umkm-backend
```

### 2. Install Required Packages

```bash
# JWT Authentication
composer require tymon/jwt-auth

# CORS Support
composer require fruitcake/laravel-cors

# UUID Support (optional)
composer require ramsey/uuid
```

### 3. Configure Database

Edit `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pasar_umkm
DB_USERNAME=root
DB_PASSWORD=
```

Create database:

```bash
mysql -u root -p
CREATE DATABASE pasar_umkm;
```

### 4. Setup JWT

```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

Update `config/auth.php`:

```php
'defaults' => [
    'guard' => 'api',
    'passwords' => 'users',
],

'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

### 5. Configure CORS

Update `config/cors.php`:

```php
return [
    'paths' => ['api/*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### 6. Create Database Tables

Lihat schema di `API_DOCUMENTATION.md` bagian **Database Schema**.

Contoh migration untuk `users`:

```bash
php artisan make:migration create_users_table
```

Edit migration:

```php
public function up()
{
    Schema::create('users', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->enum('role', ['user', 'umkm', 'admin'])->default('user');
        $table->boolean('is_suspended')->default(false);
        $table->rememberToken();
        $table->timestamps();
    });
}
```

Run migrations:

```bash
php artisan migrate
```

### 7. Create Models

```bash
php artisan make:model User
php artisan make:model Business
php artisan make:model Product
php artisan make:model Order
php artisan make:model OrderItem
php artisan make:model Tracking
# ... etc
```

### 8. Create Controllers

```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/BusinessController
php artisan make:controller Api/ProductController
php artisan make:controller Api/CartController
php artisan make:controller Api/OrderController
# ... etc
```

### 9. Setup Routes

Edit `routes/api.php`:

```php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public business & product routes
Route::get('/businesses', [BusinessController::class, 'index']);
Route::get('/businesses/{id}', [BusinessController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    
    // Orders
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'index']);
    
    // UMKM routes
    Route::middleware('role:umkm,admin')->group(function () {
        Route::post('/businesses', [BusinessController::class, 'store']);
        Route::post('/products', [ProductController::class, 'store']);
    });
    
    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::put('/admin/users/{id}/role', [AdminController::class, 'updateRole']);
    });
});
```

### 10. Create Base Controller

`app/Http/Controllers/BaseController.php`:

```php
<?php

namespace App\Http\Controllers;

class BaseController extends Controller
{
    public function sendResponse($data, $message = 'Success', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    public function sendError($message, $errors = [], $code = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $code);
    }
}
```

### 11. Create Role Middleware

```bash
php artisan make:middleware CheckRole
```

Edit `app/Http/Middleware/CheckRole.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;

class CheckRole
{
    public function handle($request, Closure $next, ...$roles)
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Required role: ' . implode(', ', $roles)
            ], 403);
        }

        return $next($request);
    }
}
```

Register di `app/Http/Kernel.php`:

```php
protected $middlewareAliases = [
    // ...
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

### 12. Run Laravel Server

```bash
php artisan serve
```

Laravel akan berjalan di: `http://localhost:8000`

---

## 🔌 API Service Layer

Frontend sudah dilengkapi dengan **Service Layer** yang terstruktur:

### Structure:

```
/services/
├── api.ts                  # Base Axios config
├── authService.ts          # Authentication
├── businessService.ts      # Business CRUD
├── productService.ts       # Product CRUD
├── cartService.ts          # Shopping cart
├── orderService.ts         # Orders & checkout
├── trackingService.ts      # Order tracking
├── giftPackageService.ts   # Gift packages
├── eventService.ts         # Events & applications
├── adminService.ts         # Admin operations
├── roleUpgradeService.ts   # Role upgrades
└── index.ts                # Export all services
```

### Usage Example:

```typescript
import { authService, businessService } from '../services';

// Login
const loginUser = async () => {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    console.log(response.user);
    console.log(response.access_token);
  } catch (error) {
    console.error(error.message);
  }
};

// Get all businesses
const getBusinesses = async () => {
  try {
    const businesses = await businessService.getAll({
      category: 'Fashion',
      search: 'batik'
    });
    
    console.log(businesses);
  } catch (error) {
    console.error(error.message);
  }
};
```

---

## 🔐 Authentication Flow

### 1. Register/Login

```typescript
// User registers or logs in
const { user, access_token } = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

// Token automatically saved to localStorage
// All subsequent requests include: Authorization: Bearer {token}
```

### 2. Auto Token Injection

API client (`/services/api.ts`) automatically adds token to all requests:

```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pasar_umkm_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Handle Token Expiry

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      localStorage.removeItem('pasar_umkm_access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 Testing

### Test API Endpoints

Gunakan **Postman** atau **Insomnia** untuk test Laravel API:

**1. Register User:**
```
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**2. Login:**
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**3. Get User (with token):**
```
GET http://localhost:8000/api/auth/user
Authorization: Bearer {your_token_here}
```

### Test Frontend Integration

1. Pastikan Laravel API running (`php artisan serve`)
2. Pastikan React app running (`npm run dev`)
3. Set `VITE_MOCK_MODE=false` di `.env`
4. Test login, register, dan fitur lainnya

---

## 📦 Deployment

### Frontend (React)

**Deploy ke Vercel/Netlify:**

```bash
# Build production
npm run build

# Deploy folder 'dist' ke Vercel/Netlify
```

Set environment variables di dashboard:
```
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_MOCK_MODE=false
```

### Backend (Laravel)

**Deploy ke VPS/Shared Hosting:**

1. Upload Laravel files
2. Point domain to `public` folder
3. Run migrations: `php artisan migrate`
4. Set `.env` production values
5. Configure CORS allowed origins

**Environment:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.your-domain.com

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

---

## 📚 Additional Resources

- **API Documentation:** `/API_DOCUMENTATION.md`
- **Database Schema:** Lihat di API_DOCUMENTATION.md
- **Type Definitions:** `/types/api.ts`
- **Service Layer:** `/services/`

---

## 🐛 Troubleshooting

### CORS Error

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check `config/cors.php` di Laravel
2. Ensure frontend URL ada di `allowed_origins`
3. Restart Laravel server

### 401 Unauthorized

**Problem:** Token expired atau invalid

**Solution:**
1. Check token ada di localStorage
2. Verify JWT configuration di Laravel
3. Login ulang untuk get new token

### 422 Validation Error

**Problem:** Request validation failed

**Solution:**
1. Check request body format
2. Lihat error details di response
3. Adjust request sesuai Laravel validation rules

---

## 💡 Tips

1. **Development:** Gunakan `VITE_MOCK_MODE=true` jika Laravel backend belum ready
2. **Production:** Selalu gunakan `VITE_MOCK_MODE=false`
3. **Security:** Jangan commit `.env` file
4. **Testing:** Test API dengan Postman sebelum integrate ke frontend
5. **Logging:** Enable Laravel logging untuk debug

---

## 🤝 Support

Untuk pertanyaan atau bantuan:
1. Check API_DOCUMENTATION.md untuk endpoint details
2. Lihat type definitions di `/types/api.ts`
3. Check service implementation di `/services/`

---

**Happy Coding! 🚀**
