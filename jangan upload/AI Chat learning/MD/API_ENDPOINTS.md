# 📡 API Endpoints Reference

Complete API documentation untuk Pasar UMKM backend.

## 🔗 Base URL

```
Development: http://localhost:8000/api
Production: https://yourdomain.com/api
```

## 📌 Response Format

Semua responses menggunakan format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## 🔐 Authentication

### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "id": "USER001",
  "name": "John Doe",
  "phone": "081234567890",
  "password": "password123",
  "password_confirmation": "password123"
}

Response: 201
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "USER001",
    "name": "John Doe",
    "phone": "081234567890",
    "status": "active",
    "created_at": "2025-12-18T...",
    "updated_at": "2025-12-18T..."
  }
}
```

### Login User

```
POST /api/auth/login
Content-Type: application/json

{
  "phone": "081234567890",
  "password": "password123"
}

Response: 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "USER001",
    "name": "John Doe",
    "phone": "081234567890",
    "status": "active"
  }
}
```

### Logout

```
POST /api/auth/logout

Response: 200
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🏷️ Categories

### Get All Categories

```
GET /api/categories

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "CAT001",
      "name": "Food & Beverage",
      "status": "active",
      "created_at": "...",
      "updated_at": "..."
    },
    ...
  ]
}
```

### Create Category (Admin Only)

```
POST /api/categories
Content-Type: application/json

{
  "id": "CAT005",
  "name": "Electronics"
}

Response: 201
{
  "success": true,
  "message": "Category created successfully",
  "data": { ... }
}
```

### Update Category

```
PUT /api/categories/{id}
Content-Type: application/json

{
  "name": "Food & Beverages",
  "status": "active"
}

Response: 200
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

### Delete Category

```
DELETE /api/categories/{id}

Response: 200
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 🛍️ Products

### Get All Products

```
GET /api/products

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "PROD001",
      "user_id": "USER001",
      "name": "Roti Coklat Premium",
      "price": 35000.00,
      "description": "Roti coklat lezat...",
      "status": "active",
      "created_at": "...",
      "updated_at": "..."
    },
    ...
  ]
}
```

### Get Product Detail

```
GET /api/products/{id}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Get Products by Business

```
GET /api/products/business/{userId}

Response: 200
{
  "success": true,
  "data": [ ... ]
}
```

### Create Product

```
POST /api/products
Content-Type: application/json

{
  "id": "PROD005",
  "user_id": "USER001",
  "name": "Kue Brownies",
  "price": 50000,
  "description": "Brownies coklat homemade"
}

Response: 201
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}
```

### Update Product

```
PUT /api/products/{id}
Content-Type: application/json

{
  "name": "Kue Brownies Premium",
  "price": 55000,
  "description": "Brownies coklat premium homemade"
}

Response: 200
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

### Delete Product

```
DELETE /api/products/{id}

Response: 200
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🏢 Businesses

### Get All Businesses

```
GET /api/businesses

Response: 200
{
  "success": true,
  "data": [
    {
      "user_id": "USER001",
      "owner_name": "Budi Santoso",
      "business_name": "Bakery Emas",
      "address": "Jl. Merdeka No. 10, Jakarta",
      "category_id": "CAT001",
      "status": "approved",
      "created_at": "...",
      "updated_at": "..."
    },
    ...
  ]
}
```

### Get Business Detail

```
GET /api/businesses/{userId}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Get Businesses by Category

```
GET /api/businesses/category/{categoryId}

Response: 200
{
  "success": true,
  "data": [ ... ]
}
```

### Submit Business Application

```
POST /api/businesses
Content-Type: application/json

{
  "user_id": "USER004",
  "owner_name": "Rini Wijaya",
  "business_name": "Toko Kue Rini",
  "address": "Jl. Diponegoro No. 8, Surabaya",
  "category_id": "CAT001"
}

Response: 201
{
  "success": true,
  "message": "Business application submitted successfully",
  "data": {
    "user_id": "USER004",
    "status": "pending",
    ...
  }
}
```

### Update Business

```
PUT /api/businesses/{userId}
Content-Type: application/json

{
  "business_name": "Toko Kue Rini Premium",
  "address": "Jl. Diponegoro No. 8A, Surabaya"
}

Response: 200
{
  "success": true,
  "message": "Business updated successfully",
  "data": { ... }
}
```

### Get Pending Applications (Admin)

```
GET /api/businesses/admin/pending

Response: 200
{
  "success": true,
  "data": [
    {
      "user_id": "USER003",
      "status": "pending",
      ...
    },
    ...
  ]
}
```

### Approve Business Application (Admin)

```
POST /api/businesses/admin/{userId}/approve

Response: 200
{
  "success": true,
  "message": "Business approved successfully",
  "data": {
    "user_id": "USER003",
    "status": "approved",
    ...
  }
}
```

### Reject Business Application (Admin)

```
POST /api/businesses/admin/{userId}/reject

Response: 200
{
  "success": true,
  "message": "Business rejected",
  "data": {
    "user_id": "USER003",
    "status": "rejected",
    ...
  }
}
```

---

## 🛒 Cart

### Get Cart Items

```
GET /api/cart/{userId}

Response: 200
{
  "success": true,
  "data": [
    {
      "user_id": "USER003",
      "product_id": "PROD001",
      "quantity": 2,
      "product": {
        "id": "PROD001",
        "name": "Roti Coklat Premium",
        "price": 35000.00,
        ...
      },
      "created_at": "...",
      "updated_at": "..."
    },
    ...
  ]
}
```

### Add Item to Cart

```
POST /api/cart
Content-Type: application/json

{
  "user_id": "USER003",
  "product_id": "PROD002",
  "quantity": 3
}

Response: 200
{
  "success": true,
  "message": "Item added to cart",
  "data": { ... }
}
```

### Update Cart Item Quantity

```
PUT /api/cart/{userId}/{productId}
Content-Type: application/json

{
  "quantity": 5
}

Response: 200
{
  "success": true,
  "message": "Cart item updated",
  "data": { ... }
}
```

### Remove Item from Cart

```
DELETE /api/cart/{userId}/{productId}

Response: 200
{
  "success": true,
  "message": "Item removed from cart"
}
```

### Clear Entire Cart

```
DELETE /api/cart/{userId}/clear

Response: 200
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## 📅 Events

### Get All Events

```
GET /api/events

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "EVENT001",
      "name": "Pameran UMKM 2025",
      "description": "Pameran besar-besaran...",
      "date": "2025-01-18",
      "quota": 100,
      "registration_date": "2025-12-25",
      "participants": [ ... ],
      "created_at": "...",
      "updated_at": "..."
    },
    ...
  ]
}
```

### Get Event Detail

```
GET /api/events/{id}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Create Event (Admin Only)

```
POST /api/events
Content-Type: application/json

{
  "id": "EVENT003",
  "name": "Workshop Cakrawala UMKM",
  "description": "Workshop pengembangan bisnis online",
  "date": "2025-02-15",
  "quota": 50,
  "registration_date": "2026-01-01"
}

Response: 201
{
  "success": true,
  "message": "Event created successfully",
  "data": { ... }
}
```

### Register for Event

```
POST /api/events/register
Content-Type: application/json

{
  "event_id": "EVENT001",
  "user_id": "USER003"
}

Response: 201
{
  "success": true,
  "message": "Registered for event successfully",
  "data": {
    "event_id": "EVENT001",
    "user_id": "USER003",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

Error Response (Quota Full):

```
Response: 400
{
  "success": false,
  "message": "Event quota is full"
}
```

### Unregister from Event

```
DELETE /api/events/{eventId}/{userId}

Response: 200
{
  "success": true,
  "message": "Unregistered from event"
}
```

### Get User's Events

```
GET /api/events/user/{userId}

Response: 200
{
  "success": true,
  "data": [ ... ]
}
```

---

## ❌ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email already registered"],
    "phone": ["Phone number invalid"]
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔑 Headers

Semua requests harus include:

```
Content-Type: application/json
Accept: application/json
```

Optional untuk authenticated endpoints:

```
Authorization: Bearer {token}
```

---

## 📊 Testing Endpoints

### Using cURL

**Get All Products**

```bash
curl -X GET http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

**Login**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"081234567890","password":"password123"}'
```

**Create Product**

```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "id":"PROD005",
    "user_id":"USER001",
    "name":"Kue Baru",
    "price":40000,
    "description":"Kue baru yang enak"
  }'
```

### Using Postman

1. Import endpoints into Postman
2. Set `{{base_url}}` variable: `http://localhost:8000/api`
3. Create requests dengan method yang sesuai
4. Tambahkan JSON body jika diperlukan
5. Send dan lihat response

---

## 📝 Pagination (Future Enhancement)

Currently, endpoints return all data. Future versions will support:

```
GET /api/products?page=1&per_page=20

Response:
{
  "success": true,
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 20,
  "total": 100
}
```

---

**Last Updated:** December 18, 2025
