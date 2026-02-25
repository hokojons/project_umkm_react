<?php
/**
 * Laravel Router Script for PHP Built-in Server
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'
);

// If the file exists in public directory, serve it directly
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

// Otherwise, route through Laravel's index.php
require_once __DIR__.'/public/index.php';
