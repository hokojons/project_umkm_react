# API Services

Centralized API service layer untuk komunikasi dengan Laravel backend.

## 📁 File Structure

```
/services/
├── api.ts                  # Base Axios configuration & interceptors
├── authService.ts          # Authentication (login, register, logout)
├── businessService.ts      # Business CRUD operations
├── productService.ts       # Product CRUD operations
├── cartService.ts          # Shopping cart operations
├── orderService.ts         # Order & checkout operations
├── trackingService.ts      # Order tracking operations
├── giftPackageService.ts   # Gift package operations
├── eventService.ts         # Event & application operations
├── adminService.ts         # Admin panel operations
├── roleUpgradeService.ts   # Role upgrade requests
├── index.ts                # Centralized exports
└── README.md               # This file
```

## 🚀 Usage

### Import Services

```typescript
// Import individual service
import { authService } from '../services/authService';
import { businessService } from '../services/businessService';

// Or import from index
import { authService, businessService, productService } from '../services';
```

### Example: Authentication

```typescript
import { authService } from '../services';

// Register
const register = async () => {
  try {
    const response = await authService.register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    });
    
    console.log('User:', response.user);
    console.log('Token:', response.access_token);
  } catch (error) {
    console.error(error.message);
  }
};

// Login
const login = async () => {
  try {
    const response = await authService.login({
      email: 'john@example.com',
      password: 'password123'
    });
    
    // Token automatically saved to localStorage
    console.log('Logged in:', response.user);
  } catch (error) {
    console.error(error.message);
  }
};

// Logout
const logout = async () => {
  await authService.logout();
  // Token automatically removed from localStorage
};
```

### Example: Business Operations

```typescript
import { businessService } from '../services';

// Get all businesses
const getBusinesses = async () => {
  const businesses = await businessService.getAll({
    category: 'Fashion',
    search: 'batik'
  });
  console.log(businesses);
};

// Get business by ID
const getBusiness = async (id: string) => {
  const business = await businessService.getById(id);
  console.log(business);
};

// Create business (requires UMKM or Admin role)
const createBusiness = async () => {
  const business = await businessService.create({
    name: 'Toko Fashion',
    description: 'Menjual fashion wanita',
    category: 'Fashion',
    image: fileObject, // File object from input
    whatsapp: '6281234567890'
  });
  console.log('Created:', business);
};

// Update business
const updateBusiness = async (id: string) => {
  const business = await businessService.update({
    id: id,
    name: 'Toko Fashion Updated'
  });
  console.log('Updated:', business);
};

// Delete business
const deleteBusiness = async (id: string) => {
  await businessService.delete(id);
  console.log('Deleted');
};
```

### Example: Shopping Cart

```typescript
import { cartService } from '../services';

// Get cart
const getCart = async () => {
  const cart = await cartService.getCart();
  console.log('Items:', cart.items);
  console.log('Total:', cart.total_price);
};

// Add to cart
const addToCart = async (productId: string, businessId: string) => {
  const cart = await cartService.addToCart({
    product_id: productId,
    business_id: businessId,
    quantity: 1
  });
  console.log('Cart updated:', cart);
};

// Update quantity
const updateQuantity = async (cartItemId: string, quantity: number) => {
  const cart = await cartService.updateCartItem({
    cart_item_id: cartItemId,
    quantity: quantity
  });
  console.log('Cart updated:', cart);
};

// Remove item
const removeItem = async (cartItemId: string) => {
  const cart = await cartService.removeFromCart(cartItemId);
  console.log('Item removed');
};

// Clear cart
const clearCart = async () => {
  await cartService.clearCart();
  console.log('Cart cleared');
};
```

### Example: Checkout

```typescript
import { orderService } from '../services';

// Checkout
const checkout = async () => {
  const order = await orderService.checkout({
    customer_name: 'John Doe',
    customer_phone: '081234567890',
    customer_address: 'Jl. Contoh No. 123',
    payment_method: 'cod',
    notes: 'Tolong kirim cepat',
    items: [
      {
        product_id: 'prod-1',
        business_id: 'biz-1',
        quantity: 2,
        price: 100000
      }
    ]
  });
  
  console.log('Order created:', order.order_number);
  console.log('Tracking:', order.tracking);
};

// Get order history
const getOrders = async () => {
  const orders = await orderService.getMyOrders({
    status: 'pending'
  });
  console.log(orders);
};

// Get order by ID
const getOrder = async (orderId: string) => {
  const order = await orderService.getById(orderId);
  console.log(order);
};
```

### Example: Admin Operations

```typescript
import { adminService } from '../services';

// Get all users (Admin only)
const getUsers = async () => {
  const users = await adminService.getAllUsers({
    role: 'umkm'
  });
  console.log(users);
};

// Update user role (Admin only)
const updateUserRole = async (userId: string) => {
  const user = await adminService.updateUserRole({
    user_id: userId,
    role: 'umkm'
  });
  console.log('Role updated:', user);
};

// Get statistics (Admin only)
const getStats = async () => {
  const stats = await adminService.getStats();
  console.log('Total users:', stats.total_users);
  console.log('Total businesses:', stats.total_businesses);
  console.log('Total revenue:', stats.total_revenue);
};

// Approve role request (Admin only)
const approveRoleRequest = async (requestId: string) => {
  const request = await adminService.approveRoleRequest(requestId);
  console.log('Request approved:', request);
};
```

## 🔑 Features

### Automatic Token Management

Token otomatis ditambahkan ke semua requests:

```typescript
// api.ts handles this automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pasar_umkm_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling

Semua errors dihandle secara otomatis:

```typescript
// Validation errors (422)
// Authentication errors (401)
// Authorization errors (403)
// Server errors (500)
// Network errors

try {
  await authService.login({ ... });
} catch (error) {
  // error.message akan berisi pesan error yang user-friendly
  console.error(error.message);
}
```

### File Uploads

File uploads otomatis dihandle dengan FormData:

```typescript
const createBusiness = async (file: File) => {
  // Service automatically handles FormData conversion
  const business = await businessService.create({
    name: 'Toko Baru',
    description: 'Description',
    image: file, // File object
    category: 'Fashion'
  });
};
```

## 🎯 Service Methods

### authService
- `login(credentials)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout user
- `getCurrentUser()` - Get current user data
- `refreshToken()` - Refresh JWT token
- `updateProfile(data)` - Update user profile
- `changePassword(current, new)` - Change password

### businessService
- `getAll(params)` - Get all businesses with filters
- `getById(id)` - Get business by ID
- `getMyBusinesses()` - Get current user's businesses
- `getFeatured(limit)` - Get featured businesses
- `getByCategory(category)` - Get businesses by category
- `create(data)` - Create new business
- `update(data)` - Update business
- `delete(id)` - Delete business

### productService
- `getAll(params)` - Get all products
- `getById(id)` - Get product by ID
- `getByBusinessId(businessId)` - Get products by business
- `getMyProducts()` - Get current user's products
- `create(data)` - Create new product
- `update(data)` - Update product
- `delete(id)` - Delete product
- `getFeatured(limit)` - Get featured products

### cartService
- `getCart()` - Get current cart
- `addToCart(data)` - Add item to cart
- `updateCartItem(data)` - Update quantity
- `removeFromCart(cartItemId)` - Remove item
- `clearCart()` - Clear entire cart
- `syncCart(items)` - Sync local cart to server

### orderService
- `checkout(data)` - Create new order
- `getMyOrders(params)` - Get order history
- `getById(id)` - Get order by ID
- `getByOrderNumber(orderNumber)` - Get order by number
- `updateStatus(orderId, status)` - Update order status
- `cancelOrder(orderId, reason)` - Cancel order
- `getBusinessOrders(businessId, params)` - Get business orders
- `confirmPayment(orderId, proof)` - Confirm payment

### trackingService
- `getByOrderId(orderId)` - Get tracking by order ID
- `getByOrderNumber(orderNumber)` - Get tracking by order number
- `updateTracking(data)` - Update tracking status
- `completeStep(orderId, step)` - Mark step as completed
- `skipToStep(orderId, step)` - Skip to specific step

### giftPackageService
- `getAll(params)` - Get all gift packages
- `getActive()` - Get active packages only
- `getById(id)` - Get package by ID
- `create(data)` - Create package (Admin only)
- `update(id, data)` - Update package (Admin only)
- `delete(id)` - Delete package (Admin only)
- `toggleActive(id)` - Toggle active status (Admin only)
- `addToCart(id, quantity)` - Add package to cart

### eventService
- `getAll(params)` - Get all events
- `getUpcoming()` - Get upcoming events
- `getById(id)` - Get event by ID
- `create(data)` - Create event (Admin only)
- `update(id, data)` - Update event (Admin only)
- `delete(id)` - Delete event (Admin only)
- `apply(data)` - Apply to event (UMKM only)
- `getApplications(eventId)` - Get event applications (Admin)
- `getMyApplications()` - Get my applications (UMKM)
- `approveApplication(id)` - Approve application (Admin)
- `rejectApplication(id, reason)` - Reject application (Admin)
- `cancelApplication(id)` - Cancel my application (UMKM)

### adminService
- `getAllUsers(params)` - Get all users
- `updateUserRole(data)` - Update user role
- `deleteUser(userId)` - Delete user
- `suspendUser(userId, reason)` - Suspend user
- `unsuspendUser(userId)` - Unsuspend user
- `getRoleUpgradeRequests(params)` - Get role requests
- `approveRoleRequest(requestId)` - Approve role request
- `rejectRoleRequest(requestId, notes)` - Reject role request
- `getStats()` - Get dashboard statistics
- `removeBusiness(businessId)` - Remove any business
- `toggleFeaturedBusiness(businessId)` - Toggle featured status

### roleUpgradeService
- `submitRequest(reason)` - Submit upgrade request
- `getMyRequests()` - Get my requests
- `getLatestRequest()` - Get latest request
- `cancelRequest(requestId)` - Cancel request
- `canRequest()` - Check if can request upgrade

## 📚 Documentation

- **Full API Docs:** `/API_DOCUMENTATION.md`
- **Integration Guide:** `/LARAVEL_INTEGRATION.md`
- **Quick Start:** `/QUICK_START.md`
- **Type Definitions:** `/types/api.ts`

## 🔧 Configuration

Edit `/config/api.ts` untuk mengubah:
- API base URL
- Request timeout
- Mock mode

Edit `.env` untuk environment variables:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MOCK_MODE=false
```

## 🐛 Error Handling

All services throw errors with user-friendly messages:

```typescript
try {
  await businessService.create({ ... });
} catch (error) {
  // error.message contains user-friendly message
  toast.error(error.message);
}
```

Common error messages:
- "Email atau password salah" (401)
- "Unauthorized" (403)
- "Business not found" (404)
- "Validation failed" (422)
- "Server error" (500)
- "Network error" (no connection)

## 💡 Tips

1. **Always use try-catch** when calling service methods
2. **Check user role** before calling protected endpoints
3. **Handle loading states** in your components
4. **Use TypeScript** for auto-completion
5. **Read error messages** for debugging

## 🎓 Examples

See `/laravel-examples/` for Laravel controller implementations that work with these services.
