#!/bin/sh

# Default port if not set
if [ -z "$PORT" ]; then
    PORT=8080
fi

echo "Starting Laravel on port $PORT..."
php -S 0.0.0.0:$PORT server.php
