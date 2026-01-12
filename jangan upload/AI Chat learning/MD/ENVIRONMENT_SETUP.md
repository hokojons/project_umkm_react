# 🔧 Environment Setup Guide

Panduan lengkap mengkonfigurasi environment untuk development.

## 🌍 Environment Files

### Laravel (.env)

**Location:** `Laravel/.env`

```env
# Application Settings
APP_NAME=Pasar_UMKM
APP_ENV=local
APP_KEY=base64:YOUR_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dbumkm
DB_USERNAME=root
DB_PASSWORD=

# Session & Caching
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Mail Configuration (Optional)
MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"

# API Settings
API_PAGINATION_LIMIT=20
```

### React (.env)

**Location:** `Food and Beverage Website (Copy)/.env`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Development Mode
VITE_MOCK_MODE=false
```

## 📋 Setup Checklist

### Before Starting

- [ ] PHP 8.2+ installed (`php -v`)
- [ ] MySQL/MariaDB installed & running
- [ ] Node.js 18+ & npm installed (`node -v`, `npm -v`)
- [ ] Composer installed (`composer -v`)
- [ ] Git configured (if needed)

### Laravel Setup

```bash
cd Laravel

# 1. Install Dependencies
composer install

# 2. Generate App Key
php artisan key:generate

# 3. Database Setup
# - Create database dbumkm
# - Update .env DB credentials
# - Run migrations
php artisan migrate

# 4. Seed Test Data (Optional)
php artisan db:seed

# 5. Clear Cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### React Setup

```bash
cd "Food and Beverage Website (Copy)"

# 1. Install Dependencies
npm install

# 2. Create/Verify .env file
# Make sure VITE_API_BASE_URL=http://localhost:8000/api

# 3. Verify Configuration
npm run build --dry-run
```

## 🚀 Running Development Servers

### Terminal 1 - Laravel Backend

```bash
cd Laravel
php artisan serve
# Output: http://localhost:8000
```

### Terminal 2 - React Frontend

```bash
cd "Food and Beverage Website (Copy)"
npm run dev
# Output: http://localhost:5173
```

## 🔐 Security Notes

### Development vs Production

**Development (.env)**

```env
APP_DEBUG=true          # Enable debugging
APP_ENV=local           # Local environment
API_BASE_URL=http://localhost:8000/api
```

**Production (.env.production)**

```env
APP_DEBUG=false         # Disable debugging
APP_ENV=production      # Production environment
API_BASE_URL=https://yourdomain.com/api
```

### Important Files to Never Commit

Add to `.gitignore`:

```
.env
.env.*.php
.env.*.local
*.log
node_modules/
vendor/
storage/
```

## 🌐 Cross-Origin Resource Sharing (CORS)

### Current Setup (Development)

**File:** `Laravel/config/cors.php`

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],
```

### For Production

Update `allowed_origins`:

```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

## 📱 Testing Environment

### Test Data Available After Seeding

**Users (Test Credentials):**

- User 1: phone=081234567890, password=password123
- User 2: phone=082345678901, password=password123
- User 3: phone=083456789012, password=password123

**Sample Data:**

- 4 Categories
- 3 Businesses
- 4 Products
- 2 Events

## 🔄 Environment Variables Explanation

### Laravel

| Variable       | Purpose           | Example           |
| -------------- | ----------------- | ----------------- |
| APP_KEY        | Encryption key    | base64:...        |
| DB_HOST        | Database host     | 127.0.0.1         |
| DB_DATABASE    | Database name     | dbumkm            |
| DB_USERNAME    | Database user     | root              |
| DB_PASSWORD    | Database password | (empty for local) |
| SESSION_DRIVER | Session storage   | database          |
| CACHE_STORE    | Cache driver      | database          |

### React/Vite

| Variable          | Purpose       | Example                   |
| ----------------- | ------------- | ------------------------- |
| VITE_API_BASE_URL | API base URL  | http://localhost:8000/api |
| VITE_MOCK_MODE    | Use mock data | false                     |

## 🧪 Environment Verification

### Verify Laravel Setup

```bash
cd Laravel

# Check PHP version
php -v

# Check Laravel installation
php artisan --version

# Test database connection
php artisan tinker
>>> DB::connection()->getPDO();
>>> exit
```

### Verify React Setup

```bash
cd "Food and Beverage Website (Copy)"

# Check Node version
node -v

# Check npm version
npm -v

# List installed packages
npm list (shows dependencies)
```

### Test API Connection

```bash
# From command line
curl http://localhost:8000/api/products

# Expected Response:
# {"success":true,"data":[...]}
```

## 🔧 Common Environment Issues

### Issue: "PHP version requirement not met"

**Solution:** Check PHP version `php -v` must be 8.2+

### Issue: "MySQL connection refused"

**Solution:**

1. Verify MySQL is running
2. Check credentials in `.env`
3. Ensure database exists: `mysql -u root dbumkm`

### Issue: "npm ERR! code ERESOLVE"

**Solution:**

```bash
npm install --legacy-peer-deps
# or
npm cache clean --force
npm install
```

### Issue: "Port 8000 already in use"

**Solution:**

```bash
# Use different port
php artisan serve --port=8001

# Update React .env
VITE_API_BASE_URL=http://localhost:8001/api
```

### Issue: "CORS error in browser console"

**Solution:**

1. Verify Laravel is running on 8000
2. Check React .env has correct VITE_API_BASE_URL
3. Verify CORS config allows React origin

## 📦 Dependency Management

### Laravel Dependencies

```bash
cd Laravel

# Update dependencies
composer update

# Install specific package
composer require package/name

# Remove package
composer remove package/name
```

### React Dependencies

```bash
cd "Food and Beverage Website (Copy)"

# Update dependencies
npm update

# Install specific package
npm install package-name

# Remove package
npm uninstall package-name
```

## 🚀 Environment Switching

### Switch to Production Build

```bash
# React Production Build
cd "Food and Beverage Website (Copy)"
npm run build

# Output in dist/ folder
# Upload dist/ to web server
```

### Laravel Production Deployment

```bash
cd Laravel

# Build assets
npm run build

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 📝 Environment Templates

### Laravel .env.example

```env
APP_NAME=Pasar_UMKM
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dbumkm
DB_USERNAME=root
DB_PASSWORD=

CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

### React .env.example

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MOCK_MODE=false
```

## ✅ Final Verification Checklist

- [ ] PHP version 8.2+
- [ ] Node.js 18+
- [ ] MySQL/MariaDB running
- [ ] Laravel .env configured
- [ ] React .env configured
- [ ] Database created (dbumkm)
- [ ] Migrations run successfully
- [ ] Laravel server running on :8000
- [ ] React server running on :5173
- [ ] Test API endpoint working
- [ ] CORS properly configured
- [ ] Ready for development!

---

**You're all set! Time to start coding! 🎉**
