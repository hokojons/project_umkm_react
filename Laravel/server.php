<?php
/**
 * Laravel Router Script for PHP Built-in Server
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'
);

// If the file exists in public directory, serve it directly
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    // PHP built-in server needs help with some MIME types
    $extension = pathinfo($uri, PATHINFO_EXTENSION);
    $mimeTypes = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'webp' => 'image/webp',
        'ico'  => 'image/x-icon',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'pdf'  => 'application/pdf',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'  => 'font/ttf',
        'jfif' => 'image/jpeg',
    ];

    $ext = strtolower($extension);
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
        header('Cache-Control: public, max-age=31536000');
        header('Access-Control-Allow-Origin: *');
        readfile(__DIR__.'/public'.$uri);
        return true;
    }

    return false;
}

// Otherwise, route through Laravel's index.php
require_once __DIR__.'/public/index.php';
