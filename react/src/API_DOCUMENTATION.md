# Pasar UMKM - Laravel API Documentation

Dokumentasi lengkap untuk Laravel Backend API yang dibutuhkan oleh aplikasi React.

## Table of Contents

- [Setup](#setup)
- [Authentication](#authentication)
- [Businesses](#businesses)
- [Products](#products)
- [Cart](#cart)
- [Orders](#orders)
- [Tracking](#tracking)
- [Gift Packages](#gift-packages)
- [Events](#events)
- [Role Upgrades](#role-upgrades)
- [Admin](#admin)
- [Error Handling](#error-handling)

---

## Setup

### Environment Variables

Tambahkan di `.env` Laravel Anda:

```env
# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com

# JWT Configuration (jika pakai JWT)
JWT_SECRET=your-secret-key
JWT_TTL=60
```

### CORS Setup

Install Laravel CORS:
```bash
composer require fruitcake/laravel-cors
```

Update `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

### API Response Format

Semua endpoint harus return JSON dengan format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": ["Error detail 1", "Error detail 2"]
  }
}
```

---

## Authentication

### Register

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    },
    "access_token": "token_here",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as Register

### Get Current User

**Endpoint:** `GET /api/auth/user`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer {token}`

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Headers:** `Authorization: Bearer {token}`

### Update Profile

**Endpoint:** `PUT /api/auth/profile`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

### Change Password

**Endpoint:** `PUT /api/auth/password`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass123",
  "new_password_confirmation": "newpass123"
}
```

---

## Businesses

### Get All Businesses

**Endpoint:** `GET /api/businesses`

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search by name, owner, description
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Toko Fashion Cantik",
      "owner": "Jane Doe",
      "description": "Menjual fashion wanita",
      "about": "About me section",
      "image": "https://storage.com/image.jpg",
      "category": "Fashion",
      "rating": 4.5,
      "whatsapp": "6281234567890",
      "phone": "081234567890",
      "email": "business@example.com",
      "instagram": "tokofashion",
      "products": [
        {
          "id": "uuid",
          "name": "Dress Batik",
          "description": "Dress batik modern",
          "price": 150000,
          "image": "https://storage.com/product.jpg",
          "category": "product"
        }
      ],
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

### Get Business by ID

**Endpoint:** `GET /api/businesses/{id}`

### Get My Businesses

**Endpoint:** `GET /api/businesses/my-businesses`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** UMKM or Admin

### Get Featured Businesses

**Endpoint:** `GET /api/businesses/featured`

**Query Parameters:**
- `limit` (optional): Number of businesses to return

### Get Businesses by Category

**Endpoint:** `GET /api/businesses/category/{category}`

### Create Business

**Endpoint:** `POST /api/businesses`

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data` (if uploading image)

**Role Required:** UMKM or Admin

**Request Body (FormData):**
```
name: "Toko Baru"
description: "Deskripsi toko"
about: "About me section"
category: "Fashion"
image: [File]
whatsapp: "6281234567890"
phone: "081234567890"
email: "toko@example.com"
instagram: "tokobaru"
```

### Update Business

**Endpoint:** `PUT /api/businesses/{id}` atau `POST /api/businesses/{id}` (dengan `_method: PUT` jika upload file)

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Business Owner or Admin

### Delete Business

**Endpoint:** `DELETE /api/businesses/{id}`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Business Owner or Admin

---

## Products

### Get All Products

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `business_id` (optional): Filter by business
- `category` (optional): Filter by category
- `search` (optional): Search by name, description

### Get Product by ID

**Endpoint:** `GET /api/products/{id}`

### Get Products by Business ID

**Endpoint:** `GET /api/products/business/{businessId}`

### Get My Products

**Endpoint:** `GET /api/products/my-products`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** UMKM or Admin

### Create Product

**Endpoint:** `POST /api/products`

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data` (if uploading image)

**Role Required:** UMKM or Admin

**Request Body (FormData):**
```
business_id: "uuid"
name: "Product Name"
description: "Product description"
price: 100000
category: "product"
image: [File]
```

### Update Product

**Endpoint:** `PUT /api/products/{id}` atau `POST /api/products/{id}` (dengan `_method: PUT`)

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Product Owner or Admin

### Delete Product

**Endpoint:** `DELETE /api/products/{id}`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Product Owner or Admin

### Get Featured Products

**Endpoint:** `GET /api/products/featured`

**Query Parameters:**
- `limit` (optional): Number of products to return

---

## Cart

### Get Cart

**Endpoint:** `GET /api/cart`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Product Name",
        "description": "Description",
        "price": 100000,
        "image": "url",
        "category": "product",
        "businessId": "uuid",
        "businessName": "Business Name",
        "quantity": 2
      }
    ],
    "total_items": 2,
    "total_price": 200000
  }
}
```

### Add to Cart

**Endpoint:** `POST /api/cart/add`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "product_id": "uuid",
  "business_id": "uuid",
  "quantity": 1
}
```

### Update Cart Item

**Endpoint:** `PUT /api/cart/update`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "cart_item_id": "uuid",
  "quantity": 3
}
```

### Remove from Cart

**Endpoint:** `DELETE /api/cart/remove/{cartItemId}`

**Headers:** `Authorization: Bearer {token}`

### Clear Cart

**Endpoint:** `DELETE /api/cart/clear`

**Headers:** `Authorization: Bearer {token}`

### Sync Cart

**Endpoint:** `POST /api/cart/sync`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "business_id": "uuid",
      "quantity": 2
    }
  ]
}
```

---

## Orders

### Checkout

**Endpoint:** `POST /api/orders/checkout`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_phone": "081234567890",
  "customer_address": "Jl. Contoh No. 123",
  "payment_method": "cod",
  "notes": "Optional notes",
  "items": [
    {
      "product_id": "uuid",
      "business_id": "uuid",
      "quantity": 2,
      "price": 100000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "ORD-20240101-001",
    "customer_name": "John Doe",
    "customer_phone": "081234567890",
    "customer_address": "Jl. Contoh No. 123",
    "payment_method": "cod",
    "status": "pending",
    "total_amount": 200000,
    "items": [...],
    "tracking": {
      "order_id": "uuid",
      "current_step": 1,
      "steps": [...]
    },
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Get My Orders

**Endpoint:** `GET /api/orders`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional)
- `per_page` (optional)

### Get Order by ID

**Endpoint:** `GET /api/orders/{id}`

**Headers:** `Authorization: Bearer {token}`

### Get Order by Order Number

**Endpoint:** `GET /api/orders/number/{orderNumber}`

**Headers:** `Authorization: Bearer {token}`

### Update Order Status

**Endpoint:** `PUT /api/orders/{id}/status`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** UMKM (for own orders) or Admin

**Request Body:**
```json
{
  "status": "processing"
}
```

Status values: `paid`, `processing`, `shipped`, `delivered`, `cancelled`

### Cancel Order

**Endpoint:** `PUT /api/orders/{id}/cancel`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

### Get Business Orders

**Endpoint:** `GET /api/orders/business/{businessId}`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Business Owner or Admin

### Confirm Payment

**Endpoint:** `POST /api/orders/{id}/confirm-payment`

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
```
payment_proof: [File]
```

---

## Tracking

### Get Tracking by Order ID

**Endpoint:** `GET /api/tracking/order/{orderId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "current_step": 3,
    "estimated_delivery": "2024-01-05",
    "steps": [
      {
        "step": 1,
        "title": "Menunggu Pembayaran",
        "description": "Menunggu konfirmasi pembayaran",
        "status": "completed",
        "timestamp": "2024-01-01T10:00:00.000000Z"
      },
      {
        "step": 2,
        "title": "Pembayaran Dikonfirmasi",
        "description": "Pembayaran telah dikonfirmasi",
        "status": "completed",
        "timestamp": "2024-01-01T14:00:00.000000Z"
      },
      {
        "step": 3,
        "title": "Pesanan Diproses",
        "description": "Pesanan sedang dikemas",
        "status": "current",
        "timestamp": null
      }
    ]
  }
}
```

### Get Tracking by Order Number

**Endpoint:** `GET /api/tracking/{orderNumber}`

### Update Tracking

**Endpoint:** `PUT /api/tracking/update`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** UMKM or Admin

**Request Body:**
```json
{
  "order_id": "uuid",
  "current_step": 4,
  "step_data": {
    "step": 4,
    "timestamp": "2024-01-02T10:00:00.000000Z"
  }
}
```

### Complete Step

**Endpoint:** `POST /api/tracking/complete-step`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** UMKM or Admin

**Request Body:**
```json
{
  "order_id": "uuid",
  "step": 3
}
```

### Skip to Step (Demo Mode)

**Endpoint:** `POST /api/tracking/skip-step`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "order_id": "uuid",
  "step": 5
}
```

---

## Gift Packages

### Get All Gift Packages

**Endpoint:** `GET /api/gift-packages`

**Query Parameters:**
- `is_active` (optional): Filter by active status

### Get Active Gift Packages

**Endpoint:** `GET /api/gift-packages/active`

### Get Gift Package by ID

**Endpoint:** `GET /api/gift-packages/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Paket Lebaran Spesial",
    "description": "Paket hadiah untuk lebaran",
    "price": 500000,
    "image": "url",
    "is_active": true,
    "items": [
      {
        "product": {
          "id": "uuid",
          "name": "Product Name",
          "image": "url"
        },
        "quantity": 2
      }
    ],
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Create Gift Package

**Endpoint:** `POST /api/gift-packages`

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Role Required:** Admin

**Request Body (FormData):**
```
name: "Paket Lebaran"
description: "Description"
price: 500000
image: [File]
items[0][product_id]: "uuid"
items[0][quantity]: 2
items[1][product_id]: "uuid"
items[1][quantity]: 1
is_active: true
```

### Update Gift Package

**Endpoint:** `PUT /api/gift-packages/{id}` atau `POST /api/gift-packages/{id}` (dengan `_method: PUT`)

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Delete Gift Package

**Endpoint:** `DELETE /api/gift-packages/{id}`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Toggle Active Status

**Endpoint:** `PUT /api/gift-packages/{id}/toggle-active`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Add Gift Package to Cart

**Endpoint:** `POST /api/gift-packages/{id}/add-to-cart`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "quantity": 1
}
```

---

## Events

### Get All Events

**Endpoint:** `GET /api/events`

**Query Parameters:**
- `status` (optional): Filter by status (upcoming, ongoing, completed, cancelled)

### Get Upcoming Events

**Endpoint:** `GET /api/events/upcoming`

### Get Event by ID

**Endpoint:** `GET /api/events/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Bazar UMKM 2024",
    "description": "Event description",
    "location": "Jakarta Convention Center",
    "start_date": "2024-06-01",
    "end_date": "2024-06-03",
    "image": "url",
    "max_participants": 50,
    "current_participants": 25,
    "requirements": "Syarat dan ketentuan",
    "status": "upcoming",
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Create Event

**Endpoint:** `POST /api/events`

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Role Required:** Admin

**Request Body (FormData):**
```
title: "Event Title"
description: "Description"
location: "Location"
start_date: "2024-06-01"
end_date: "2024-06-03"
image: [File]
max_participants: 50
requirements: "Requirements text"
```

### Update Event

**Endpoint:** `PUT /api/events/{id}` atau `POST /api/events/{id}` (dengan `_method: PUT`)

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Delete Event

**Endpoint:** `DELETE /api/events/{id}`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Apply to Event

**Endpoint:** `POST /api/events/{eventId}/apply`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** UMKM

**Request Body:**
```json
{
  "event_id": "uuid",
  "business_id": "uuid",
  "message": "Optional application message"
}
```

### Get Event Applications

**Endpoint:** `GET /api/events/{eventId}/applications`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Get My Applications

**Endpoint:** `GET /api/events/my-applications`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** UMKM

### Approve Application

**Endpoint:** `PUT /api/events/applications/{applicationId}/approve`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Reject Application

**Endpoint:** `PUT /api/events/applications/{applicationId}/reject`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Request Body:**
```json
{
  "reason": "Rejection reason"
}
```

### Cancel Application

**Endpoint:** `DELETE /api/events/applications/{applicationId}`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** UMKM

---

## Role Upgrades

### Submit Role Upgrade Request

**Endpoint:** `POST /api/role-upgrade/request`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** User

**Request Body:**
```json
{
  "reason": "Saya ingin menjual produk kerajinan tangan"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "requestedRole": "umkm",
    "currentRole": "user",
    "reason": "Saya ingin menjual produk",
    "status": "pending",
    "submittedAt": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Get My Role Requests

**Endpoint:** `GET /api/role-upgrade/my-requests`

**Headers:** `Authorization: Bearer {token}`

### Get Latest Role Request

**Endpoint:** `GET /api/role-upgrade/latest`

**Headers:** `Authorization: Bearer {token}`

### Cancel Role Request

**Endpoint:** `DELETE /api/role-upgrade/request/{requestId}`

**Headers:** `Authorization: Bearer {token}`

### Can Request Upgrade

**Endpoint:** `GET /api/role-upgrade/can-request`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "can_request": true
  }
}
```

---

## Admin

### Get All Users

**Endpoint:** `GET /api/admin/users`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Query Parameters:**
- `role` (optional): Filter by role
- `search` (optional): Search by name or email
- `page` (optional)
- `per_page` (optional)

### Update User Role

**Endpoint:** `PUT /api/admin/users/{userId}/role`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Request Body:**
```json
{
  "role": "umkm"
}
```

### Delete User

**Endpoint:** `DELETE /api/admin/users/{userId}`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Suspend User

**Endpoint:** `PUT /api/admin/users/{userId}/suspend`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Request Body:**
```json
{
  "reason": "Violation of terms"
}
```

### Unsuspend User

**Endpoint:** `PUT /api/admin/users/{userId}/unsuspend`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Get Role Upgrade Requests

**Endpoint:** `GET /api/admin/role-requests`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Query Parameters:**
- `status` (optional): pending, approved, rejected

### Get Pending Role Requests

**Endpoint:** `GET /api/admin/role-requests/pending`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Approve Role Request

**Endpoint:** `PUT /api/admin/role-requests/{requestId}/approve`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Reject Role Request

**Endpoint:** `PUT /api/admin/role-requests/{requestId}/reject`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Request Body:**
```json
{
  "notes": "Rejection notes"
}
```

### Get Admin Stats

**Endpoint:** `GET /api/admin/stats`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "total_businesses": 45,
    "total_orders": 230,
    "total_revenue": 50000000,
    "pending_role_requests": 5,
    "recent_orders": [...]
  }
}
```

### Get Business Stats

**Endpoint:** `GET /api/admin/stats/businesses`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Get Order Stats

**Endpoint:** `GET /api/admin/stats/orders`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD

### Get Revenue Stats

**Endpoint:** `GET /api/admin/stats/revenue`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

**Query Parameters:**
- `period` (optional): daily, weekly, monthly, yearly

### Remove Business (Admin)

**Endpoint:** `DELETE /api/admin/businesses/{businessId}`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

### Toggle Featured Business

**Endpoint:** `PUT /api/admin/businesses/{businessId}/toggle-featured`

**Headers:** `Authorization: Bearer {token}`

**Role Required:** Admin

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

### Validation Errors

**Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Authentication Errors

**Response:**
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### Authorization Errors

**Response:**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

---

## Database Schema

### Users Table
```php
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['user', 'umkm', 'admin'])->default('user');
    $table->boolean('is_suspended')->default(false);
    $table->timestamps();
});
```

### Businesses Table
```php
Schema::create('businesses', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('owner_id')->constrained('users')->onDelete('cascade');
    $table->string('name');
    $table->text('description');
    $table->text('about')->nullable();
    $table->string('image')->nullable();
    $table->string('category');
    $table->decimal('rating', 3, 2)->default(0);
    $table->string('whatsapp')->nullable();
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->string('instagram')->nullable();
    $table->boolean('is_featured')->default(false);
    $table->timestamps();
});
```

### Products Table
```php
Schema::create('products', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('business_id')->constrained()->onDelete('cascade');
    $table->string('name');
    $table->text('description');
    $table->decimal('price', 12, 2);
    $table->string('image')->nullable();
    $table->enum('category', ['product', 'food', 'accessory', 'craft']);
    $table->timestamps();
});
```

### Orders Table
```php
Schema::create('orders', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('order_number')->unique();
    $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
    $table->string('customer_name');
    $table->string('customer_phone');
    $table->text('customer_address');
    $table->enum('payment_method', ['cod', 'transfer', 'e-wallet']);
    $table->enum('status', ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
    $table->decimal('total_amount', 12, 2);
    $table->text('notes')->nullable();
    $table->string('payment_proof')->nullable();
    $table->timestamps();
});
```

### Order Items Table
```php
Schema::create('order_items', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('order_id')->constrained()->onDelete('cascade');
    $table->foreignUuid('product_id')->constrained();
    $table->foreignUuid('business_id')->constrained();
    $table->integer('quantity');
    $table->decimal('price', 12, 2);
    $table->decimal('subtotal', 12, 2);
    $table->timestamps();
});
```

### Tracking Table
```php
Schema::create('trackings', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('order_id')->constrained()->onDelete('cascade');
    $table->integer('current_step')->default(1);
    $table->json('steps'); // Store tracking steps as JSON
    $table->date('estimated_delivery')->nullable();
    $table->timestamps();
});
```

---

## Laravel Implementation Tips

### 1. Setup JWT Authentication

```bash
composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

### 2. Create Base Controller

```php
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

### 3. Middleware for Roles

```php
namespace App\Http\Middleware;

class CheckRole
{
    public function handle($request, Closure $next, ...$roles)
    {
        if (!$request->user() || !in_array($request->user()->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return $next($request);
    }
}
```

### 4. Example Controller

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Models\Business;

class BusinessController extends BaseController
{
    public function index(Request $request)
    {
        $query = Business::with('products');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $businesses = $query->get();

        return $this->sendResponse($businesses);
    }
}
```

---

## Next Steps

1. **Setup Laravel Project**
   ```bash
   composer create-project laravel/laravel pasar-umkm-backend
   cd pasar-umkm-backend
   ```

2. **Install Dependencies**
   ```bash
   composer require tymon/jwt-auth
   composer require fruitcake/laravel-cors
   ```

3. **Create Models & Migrations**
   ```bash
   php artisan make:model Business -m
   php artisan make:model Product -m
   php artisan make:model Order -m
   # ... etc
   ```

4. **Create Controllers**
   ```bash
   php artisan make:controller Api/AuthController
   php artisan make:controller Api/BusinessController
   # ... etc
   ```

5. **Setup Routes** in `routes/api.php`

6. **Configure CORS** in `config/cors.php`

7. **Test API** using Postman or Insomnia

---

## Support

Jika ada pertanyaan tentang API ini, silakan hubungi tim development.
