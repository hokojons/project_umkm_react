# Quick Start Guide - Laravel Integration

Panduan cepat untuk menjalankan aplikasi Pasar UMKM dengan Laravel backend.

## 🚀 Quick Setup (5 Minutes)

### Step 1: Setup React Frontend

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env
# Set VITE_API_BASE_URL=http://localhost:8000/api
# Set VITE_MOCK_MODE=false

# 4. Run development server
npm run dev
```

Frontend running at: **http://localhost:5173**

---

### Step 2: Setup Laravel Backend

```bash
# 1. Create Laravel project
composer create-project laravel/laravel pasar-umkm-backend
cd pasar-umkm-backend

# 2. Install JWT
composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret

# 3. Install CORS
composer require fruitcake/laravel-cors

# 4. Configure database (.env)
DB_CONNECTION=mysql
DB_DATABASE=pasar_umkm
DB_USERNAME=root
DB_PASSWORD=

# 5. Create database
mysql -u root -p
CREATE DATABASE pasar_umkm;
EXIT;

# 6. Run migrations (after creating them)
php artisan migrate

# 7. Start server
php artisan serve
```

Backend running at: **http://localhost:8000**

---

## 📋 What's Included

### Frontend (React) - ✅ Already Done

- ✅ API Service Layer (`/services/`)
- ✅ Type Definitions (`/types/api.ts`)
- ✅ Environment Config (`/config/api.ts`)
- ✅ Axios Setup with interceptors
- ✅ Error handling
- ✅ Authentication flow

### Backend (Laravel) - ⚠️ You Need to Create

- ❌ Database migrations
- ❌ Models (User, Business, Product, Order, etc.)
- ❌ Controllers (Auth, Business, Product, etc.)
- ❌ Routes (`routes/api.php`)
- ❌ Middleware (Role-based access)

---

## 📦 File Structure

```
pasar-umkm/                    # React Frontend (This project)
├── /services/                 # ✅ API Service Layer (DONE)
│   ├── api.ts                 # Base Axios config
│   ├── authService.ts         # Authentication
│   ├── businessService.ts     # Business CRUD
│   ├── productService.ts      # Product CRUD
│   ├── cartService.ts         # Shopping cart
│   ├── orderService.ts        # Orders
│   └── ...
├── /types/
│   └── api.ts                 # ✅ Type Definitions (DONE)
├── /config/
│   └── api.ts                 # ✅ API Config (DONE)
├── API_DOCUMENTATION.md       # ✅ Full API Docs (DONE)
├── LARAVEL_INTEGRATION.md     # ✅ Integration Guide (DONE)
└── .env.example               # ✅ Environment example (DONE)

pasar-umkm-backend/            # Laravel Backend (You create this)
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php      # ❌ To create
│   │   │       ├── BusinessController.php  # ❌ To create
│   │   │       └── ...
│   │   └── Middleware/
│   │       └── CheckRole.php               # ❌ To create
│   └── Models/
│       ├── User.php                        # ❌ To create
│       ├── Business.php                    # ❌ To create
│       └── ...
├── routes/
│   └── api.php                             # ❌ To setup
└── database/
    └── migrations/                         # ❌ To create
```

---

## 🎯 Priority Tasks

### High Priority (Required for Basic Functionality)

1. **Authentication**
   - [ ] User model with JWT
   - [ ] AuthController (login, register, logout)
   - [ ] Auth routes

2. **Businesses**
   - [ ] Business model & migration
   - [ ] BusinessController (CRUD)
   - [ ] Business routes

3. **Products**
   - [ ] Product model & migration
   - [ ] ProductController (CRUD)
   - [ ] Product routes

4. **Orders**
   - [ ] Order & OrderItem models
   - [ ] OrderController (checkout, history)
   - [ ] Order routes

### Medium Priority

5. **Cart**
   - [ ] Cart model & migration
   - [ ] CartController
   - [ ] Cart routes

6. **Tracking**
   - [ ] Tracking model
   - [ ] TrackingController
   - [ ] Tracking routes

7. **Role Management**
   - [ ] Role middleware
   - [ ] Role upgrade requests

### Low Priority

8. **Gift Packages**
   - [ ] GiftPackage model
   - [ ] GiftPackageController

9. **Events**
   - [ ] Event model
   - [ ] EventController

10. **Admin Panel**
    - [ ] AdminController
    - [ ] Statistics endpoints

---

## 🔌 Testing API Connection

### Test 1: Health Check

Create simple route in Laravel `routes/api.php`:

```php
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is running'
    ]);
});
```

Test from React:

```typescript
import { apiClient } from './services/api';

const testConnection = async () => {
  try {
    const response = await apiClient.get('/health');
    console.log('✅ API Connected:', response.data);
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
  }
};
```

### Test 2: Register User

```bash
# Using curl
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "access_token": "eyJ0eXAi...",
    "token_type": "Bearer"
  }
}
```

### Test 3: Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📚 Documentation

- **📖 Full API Docs:** `API_DOCUMENTATION.md`
- **🔗 Integration Guide:** `LARAVEL_INTEGRATION.md`
- **💻 Laravel Examples:** `laravel-examples/`
- **🎨 Type Definitions:** `types/api.ts`

---

## 🐛 Common Issues

### Issue 1: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173'],
```

### Issue 2: 401 Unauthorized

**Error:** Token not being sent

**Solution:** Check localStorage contains token:
```javascript
localStorage.getItem('pasar_umkm_access_token')
```

### Issue 3: Connection Refused

**Error:** `ERR_CONNECTION_REFUSED`

**Solution:** 
1. Ensure Laravel is running: `php artisan serve`
2. Check `VITE_API_BASE_URL` in `.env`

---

## 💡 Development Tips

### Mock Mode vs API Mode

**Mock Mode (VITE_MOCK_MODE=true):**
- Uses localStorage
- No Laravel needed
- Good for frontend development

**API Mode (VITE_MOCK_MODE=false):**
- Uses Laravel API
- Real database persistence
- Production-ready

### Switch Between Modes

```env
# Development without Laravel
VITE_MOCK_MODE=true

# Development with Laravel
VITE_MOCK_MODE=false
VITE_API_BASE_URL=http://localhost:8000/api

# Production
VITE_MOCK_MODE=false
VITE_API_BASE_URL=https://api.your-domain.com/api
```

---

## ✅ Checklist

### Frontend Setup
- [ ] npm install
- [ ] .env configured
- [ ] npm run dev running
- [ ] Can access http://localhost:5173

### Backend Setup
- [ ] Laravel installed
- [ ] JWT configured
- [ ] CORS configured
- [ ] Database created
- [ ] Migrations created
- [ ] php artisan serve running
- [ ] Can access http://localhost:8000

### Integration
- [ ] API connection tested
- [ ] Register works
- [ ] Login works
- [ ] Token stored in localStorage
- [ ] Protected routes work

---

## 🎓 Next Steps

1. **Study API Documentation**
   - Read `API_DOCUMENTATION.md`
   - Understand request/response format

2. **Create Laravel Models**
   - User, Business, Product, Order, etc.
   - Follow database schema in docs

3. **Implement Controllers**
   - Start with AuthController
   - Use examples in `laravel-examples/`

4. **Setup Routes**
   - Configure `routes/api.php`
   - Apply middleware

5. **Test Endpoints**
   - Use Postman
   - Test each endpoint

6. **Connect Frontend**
   - Set VITE_MOCK_MODE=false
   - Test React integration

---

## 🤝 Support

**Questions?**
- Check `API_DOCUMENTATION.md` for endpoint details
- See `LARAVEL_INTEGRATION.md` for setup guide
- Look at `laravel-examples/` for code examples

**Issues?**
- Verify Laravel is running
- Check CORS configuration
- Ensure database is setup
- Validate .env variables

---

**Ready to start? Follow Step 1 and Step 2 above!** 🚀
