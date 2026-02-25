FROM php:8.2-cli

# Force rebuild - v2
# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy all files first
COPY . .

# Debug: List files to see what was copied
RUN ls -la && ls -la composer.json || echo "composer.json NOT FOUND"

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions for storage and cache
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose port (Railway will use $PORT)
EXPOSE 8080

# Start command - use PHP built-in server directly
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t public"]
