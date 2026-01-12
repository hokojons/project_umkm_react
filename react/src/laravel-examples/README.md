# Laravel Controller Examples

Folder ini berisi contoh implementasi Laravel Controllers untuk Pasar UMKM API.

## 📁 Files

- `AuthController.php` - Authentication (Login, Register, Logout)
- `BusinessController.php` - Business CRUD operations
- `README.md` - This file

## 🚀 Cara Penggunaan

### 1. Copy Files ke Laravel Project

Copy file-file controller ke Laravel project Anda:

```bash
# Copy ke app/Http/Controllers/Api/
cp laravel-examples/AuthController.php ../pasar-umkm-backend/app/Http/Controllers/Api/
cp laravel-examples/BusinessController.php ../pasar-umkm-backend/app/Http/Controllers/Api/
```

### 2. Create Base Controller

Buat `app/Http/Controllers/BaseController.php`:

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

### 3. Create Models

**User Model (`app/Models/User.php`):**

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'email', 'password', 'role', 'is_suspended'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'is_suspended' => 'boolean',
    ];

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relationships
    public function businesses()
    {
        return $this->hasMany(Business::class, 'owner_id');
    }
}
```

**Business Model (`app/Models/Business.php`):**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'owner_id', 'name', 'owner', 'description', 'about',
        'image', 'category', 'rating', 'whatsapp', 'phone', 
        'email', 'instagram', 'is_featured'
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'is_featured' => 'boolean',
    ];

    // Relationships
    public function ownerUser()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
```

### 4. Create Migrations

**Users Migration:**

```bash
php artisan make:migration create_users_table
```

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

**Businesses Migration:**

```bash
php artisan make:migration create_businesses_table
```

```php
public function up()
{
    Schema::create('businesses', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->foreignUuid('owner_id')->constrained('users')->onDelete('cascade');
        $table->string('name');
        $table->string('owner');
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
}
```

### 5. Setup Routes

Edit `routes/api.php`:

```php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessController;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::put('password', [AuthController::class, 'changePassword']);
    });
});

// Business routes
Route::get('businesses', [BusinessController::class, 'index']);
Route::get('businesses/featured', [BusinessController::class, 'featured']);
Route::get('businesses/category/{category}', [BusinessController::class, 'byCategory']);
Route::get('businesses/{id}', [BusinessController::class, 'show']);

Route::middleware('auth:api')->group(function () {
    Route::get('businesses/my-businesses', [BusinessController::class, 'myBusinesses']);
    
    Route::middleware('role:umkm,admin')->group(function () {
        Route::post('businesses', [BusinessController::class, 'store']);
        Route::post('businesses/{id}', [BusinessController::class, 'update']);
        Route::delete('businesses/{id}', [BusinessController::class, 'destroy']);
    });
});
```

### 6. Run Migrations

```bash
php artisan migrate
```

### 7. Test API

```bash
# Start Laravel server
php artisan serve

# Test endpoints using Postman or curl
```

## 📚 Additional Controllers Needed

Anda masih perlu membuat controller untuk:

- ProductController
- CartController
- OrderController
- TrackingController
- GiftPackageController
- EventController
- AdminController
- RoleUpgradeController

Silakan gunakan pattern yang sama seperti contoh di atas.

## 🔗 Resources

- **Full API Documentation:** `/API_DOCUMENTATION.md`
- **Integration Guide:** `/LARAVEL_INTEGRATION.md`
- **Type Definitions:** `/types/api.ts`

## 💡 Tips

1. Gunakan UUID untuk primary keys
2. Implement soft deletes jika diperlukan
3. Add validation pada semua requests
4. Implement proper error handling
5. Use Laravel Resources untuk format response (optional)
6. Implement rate limiting
7. Add logging untuk audit trail

## ⚠️ Security Notes

1. Validate semua user inputs
2. Sanitize file uploads
3. Implement CSRF protection
4. Use prepared statements (default di Eloquent)
5. Hash passwords (default di Laravel)
6. Validate JWT tokens
7. Implement role-based access control (RBAC)
