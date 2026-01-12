<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\RoleUpgradeRequestController;
use App\Http\Controllers\Api\RoleRequestController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UmkmController;
use App\Http\Controllers\Api\UmkmApiController;
use App\Http\Controllers\Api\GiftPackageController;
use App\Http\Controllers\ImageController;

// Debug route
Route::get('/test', function () {
    return response()->json(['status' => 'API is working']);
});

// Debug gift package creation
require __DIR__.'/test_gift.php';
// Test register endpoint
Route::post('/test-register', function (Request $request) {
    try {
        $data = $request->all();
        return response()->json([
            'received' => $data,
            'status' => 'received'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});
// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('/admin/login', [AuthController::class, 'loginAdmin']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('profile', [AuthController::class, 'getProfile']);
    Route::put('profile', [AuthController::class, 'updateProfile']);
    Route::post('send-otp-register', [AuthController::class, 'sendOtpRegister']);
    Route::post('verify-otp-register', [AuthController::class, 'verifyOtpRegister']);
});

// Admin Management Routes (Protected - hanya admin yang bisa akses)
Route::prefix('admin')->group(function () {
    Route::get('/admins', [AdminController::class, 'index']);
    Route::post('/admins', [AdminController::class, 'store']);
    Route::get('/admins/{id}', [AdminController::class, 'show']);
    Route::put('/admins/{id}', [AdminController::class, 'update']);
    Route::patch('/admins/{id}/toggle-status', [AdminController::class, 'toggleStatus']);
    Route::delete('/admins/{id}', [AdminController::class, 'destroy']);

    // Get all users
    Route::get('/users', [AdminController::class, 'users']); // Changed from getAllUsers to users
    Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
});

// UMKM Public API Routes (untuk frontend)
Route::prefix('umkm')->group(function () {
    Route::get('/', [UmkmApiController::class, 'index']); // Get active UMKM
    Route::get('/pending', [UmkmApiController::class, 'pending']); // Get pending UMKM for admin
    Route::get('/my-umkm', [UmkmApiController::class, 'getUserUmkm']); // NEW: Get user's own UMKM (all statuses)
    
    // NEW: Get rejection comments for user (must be before /{id} route)
    Route::get('/rejection-comments', [UmkmController::class, 'getRejectionComments']);
    
    Route::post('/submit', [UmkmController::class, 'submit']); // Submit UMKM store
    Route::get('/{id}', [UmkmApiController::class, 'show']); // Get single UMKM (must be after /pending)
    Route::get('/{id}/products', [UmkmApiController::class, 'products']); // Get products by UMKM
    Route::post('/{id}/approve', [UmkmController::class, 'approveStore']); // Approve UMKM store
    Route::post('/{id}/reject', [UmkmController::class, 'rejectStore']); // Reject UMKM store
    
    // NEW: Approve with product-level control and comments
    Route::post('/{id}/approve-with-products', [UmkmController::class, 'approveStoreWithProducts']);
    
    // NEW: Add product to approved UMKM
    Route::post('/add-product', [UmkmController::class, 'addProduct']);
    
    // NEW: Bulk actions for UMKM stores
    Route::post('/bulk-approve', [UmkmController::class, 'bulkApprove']);
    Route::post('/bulk-reject', [UmkmController::class, 'bulkReject']);
    
    // DELETE UMKM store (admin only)
    Route::delete('/{id}', [UmkmController::class, 'destroy']);
});

// Product Admin Routes
Route::prefix('products')->group(function () {
    Route::get('/pending', [UmkmController::class, 'getPendingProducts']); // Get pending products for admin
    Route::post('/{id}/approve', [UmkmController::class, 'approveProduct']); // Approve product
    Route::post('/{id}/reject', [UmkmController::class, 'rejectProduct']); // Reject product with reason
    Route::post('/{id}/resubmit', [UmkmController::class, 'resubmitProduct']); // Resubmit rejected product for review
    Route::get('/rejection-reasons', [UmkmController::class, 'getProductRejectionReasons']); // Get user's product rejection reasons
});

// Category Routes
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::put('/{id}', [CategoryController::class, 'update']);
    Route::delete('/{id}', [CategoryController::class, 'destroy']);
});

// Product Routes
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/{id}', [ProductController::class, 'show']);
    Route::post('/', [ProductController::class, 'store']);
    Route::put('/{id}', [ProductController::class, 'update']);
    Route::put('/{id}/update-image', [ProductController::class, 'updateImage']);
    Route::delete('/{id}', [ProductController::class, 'destroy']);
    Route::get('business/{userId}', [ProductController::class, 'getByBusiness']);
});

// Role Upgrade Request Routes - TRUE role upgrades (customer → umkm_owner)
Route::prefix('role-upgrade')->group(function () {
    Route::get('/pending', [RoleRequestController::class, 'getPending']); // Admin: get pending requests
    Route::get('/user/{userId}', [RoleRequestController::class, 'checkUserRequest']); // Check user request
    Route::post('/', [RoleRequestController::class, 'store']); // Submit role upgrade request
    Route::post('/{requestId}/approve', [RoleRequestController::class, 'approve']); // Admin: approve
    Route::post('/{requestId}/reject', [RoleRequestController::class, 'reject']); // Admin: reject
});

// Business/Store Submission Routes - UMKM owners submit their stores
// Previously named "role-requests" but actually handles business submissions
Route::prefix('role-requests')->group(function () {
    Route::get('/pending', [RoleUpgradeRequestController::class, 'getPending']); // Get pending business submissions
    Route::get('/user/{userId}', [RoleUpgradeRequestController::class, 'checkUserRequest']);
    Route::post('/', [RoleUpgradeRequestController::class, 'store']); // Submit business/store
    Route::post('/{userId}/approve', [RoleUpgradeRequestController::class, 'approve']);
    Route::post('/{userId}/reject', [RoleUpgradeRequestController::class, 'reject']);
});

// Business Routes (DEPRECATED - for backward compatibility)
Route::prefix('businesses')->group(function () {
    // Redirect to new role-requests endpoints
    Route::get('/{userId}', [RoleUpgradeRequestController::class, 'checkUserRequest']);
    Route::post('/', [RoleUpgradeRequestController::class, 'store']);
    Route::get('admin/pending', [RoleUpgradeRequestController::class, 'getPending']);
    Route::post('admin/{userId}/approve', [RoleUpgradeRequestController::class, 'approve']);
    Route::post('admin/{userId}/reject', [RoleUpgradeRequestController::class, 'reject']);
});

// Cart Routes
Route::prefix('cart')->group(function () {
    Route::get('/{userId}', [CartController::class, 'index']);
    Route::get('/{userId}/grouped', [CartController::class, 'getGroupedByBusiness']);
    Route::post('/', [CartController::class, 'add']);
    Route::put('/{userId}/{productId}', [CartController::class, 'update']);
    Route::delete('/{userId}/{productId}', [CartController::class, 'remove']);
    Route::delete('/{userId}/clear', [CartController::class, 'clear']);
    Route::post('/{userId}/checkout/{businessId}', [CartController::class, 'checkoutBusiness']);
});

// Event Routes
Route::prefix('events')->group(function () {
    Route::get('/', [EventController::class, 'index']);
    Route::post('/', [EventController::class, 'store']);
    Route::post('register', [EventController::class, 'register']); // MUST BE BEFORE /{id}
    Route::get('user/{userId}', [EventController::class, 'getUserEvents']);
    Route::put('/{id}', [EventController::class, 'update']);
    Route::delete('/{id}', [EventController::class, 'destroy']);
    Route::get('/{id}', [EventController::class, 'show']);
    Route::get('/{id}/participants', [EventController::class, 'getParticipants']);
    Route::delete('/{eventId}/{userId}', [EventController::class, 'unregister']);
});

// Order Routes (NEW)
Route::prefix('orders')->group(function () {
    Route::post('/', [OrderController::class, 'create']);
    Route::get('/{orderId}', [OrderController::class, 'getDetail']);
    Route::get('user/all', [OrderController::class, 'getUserOrders']);
    Route::get('business/all', [OrderController::class, 'getBusinessOrders']);
    Route::put('/{orderId}/status', [OrderController::class, 'updateStatus']);
});

// Gift Package Routes (NEW)
Route::prefix('gift-packages')->group(function () {
    Route::get('/', [GiftPackageController::class, 'index']);
    Route::post('/', [GiftPackageController::class, 'store']);
    Route::put('/{id}', [GiftPackageController::class, 'update']);
    Route::delete('/{id}', [GiftPackageController::class, 'destroy']);
});

// UMKM Routes
Route::prefix('umkm')->group(function () {
    Route::put('/{id}/update-image', [UmkmController::class, 'updateImage']);
});

// Image Management Routes (NEW)
Route::prefix('images')->group(function () {
    Route::post('/upload', [ImageController::class, 'upload']);
    Route::post('/update', [ImageController::class, 'update']);
    Route::post('/delete', [ImageController::class, 'delete']);
    Route::post('/info', [ImageController::class, 'info']);
});

