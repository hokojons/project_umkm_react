<?php

use Illuminate\Support\Facades\Route;

// Halaman utama Laravel menunjukkan info API (bukan welcome page)
Route::get('/', function () {
    return response()->json([
        'status'   => 'running',
        'message'  => 'UMKM Digital API Server',
        'api_url'  => url('/api'),
        'version'  => '1.0.0',
    ]);
});

// Serve uploaded files (fallback if server.php static serving fails)
Route::get('/uploads/{path}', function ($path) {
    $filePath = public_path("uploads/{$path}");
    
    if (!file_exists($filePath)) {
        return response()->json(['error' => 'File not found', 'path' => "uploads/{$path}"], 404);
    }
    
    $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=31536000',
        'Access-Control-Allow-Origin' => '*',
    ]);
})->where('path', '.*');

// Debug: List uploaded files (remove in production)
Route::get('/debug-uploads', function () {
    $uploadPath = public_path('uploads');
    $files = [];
    
    if (is_dir($uploadPath)) {
        $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($uploadPath));
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $relativePath = str_replace(public_path() . DIRECTORY_SEPARATOR, '', $file->getPathname());
                $relativePath = str_replace('\\', '/', $relativePath);
                $files[] = [
                    'path' => $relativePath,
                    'size' => $file->getSize(),
                ];
            }
        }
    }
    
    return response()->json([
        'upload_path' => $uploadPath,
        'exists' => is_dir($uploadPath),
        'file_count' => count($files),
        'files' => array_slice($files, 0, 50),
    ]);
});

