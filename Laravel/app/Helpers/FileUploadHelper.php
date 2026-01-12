<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadHelper
{
    /**
     * Allowed image MIME types
     */
    const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    /**
     * Maximum file size in bytes (5MB)
     */
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Sanitize filename to prevent directory traversal and remove dangerous characters
     *
     * @param string $filename
     * @return string
     */
    public static function sanitizeFilename(string $filename): string
    {
        // Get file extension
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $basename = pathinfo($filename, PATHINFO_FILENAME);
        
        // Remove any directory traversal attempts
        $basename = str_replace(['..', '/', '\\'], '', $basename);
        
        // Remove special characters, keep only alphanumeric, dash, and underscore
        $basename = preg_replace('/[^a-zA-Z0-9_-]/', '', $basename);
        
        // Limit length
        $basename = substr($basename, 0, 100);
        
        // If basename is empty after sanitization, use random string
        if (empty($basename)) {
            $basename = Str::random(10);
        }
        
        // Add timestamp to make filename unique
        $basename = $basename . '_' . time();
        
        return $basename . '.' . strtolower($extension);
    }

    /**
     * Validate image file
     *
     * @param UploadedFile $file
     * @return array ['valid' => bool, 'error' => string|null]
     */
    public static function validateImageFile(UploadedFile $file): array
    {
        // Check if file is valid
        if (!$file->isValid()) {
            return [
                'valid' => false,
                'error' => 'File upload gagal. Silakan coba lagi.'
            ];
        }

        // Check file size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            $maxSizeMB = self::MAX_FILE_SIZE / (1024 * 1024);
            return [
                'valid' => false,
                'error' => "Ukuran file terlalu besar. Maksimal {$maxSizeMB}MB."
            ];
        }

        // Check MIME type
        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, self::ALLOWED_MIMES)) {
            return [
                'valid' => false,
                'error' => 'Tipe file tidak diizinkan. Hanya JPG, PNG, dan WEBP yang diperbolehkan.'
            ];
        }

        // Check file extension
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
            return [
                'valid' => false,
                'error' => 'Ekstensi file tidak valid.'
            ];
        }

        return ['valid' => true, 'error' => null];
    }

    /**
     * Store image file with sanitized filename
     *
     * @param UploadedFile $file
     * @param string $directory Directory inside public/uploads/ (e.g., 'produk', 'toko')
     * @return array ['success' => bool, 'path' => string|null, 'error' => string|null]
     */
    public static function storeImage(UploadedFile $file, string $directory): array
    {
        // Validate file first
        $validation = self::validateImageFile($file);
        if (!$validation['valid']) {
            return [
                'success' => false,
                'path' => null,
                'error' => $validation['error']
            ];
        }

        try {
            // Sanitize filename
            $originalName = $file->getClientOriginalName();
            $sanitizedName = self::sanitizeFilename($originalName);
            
            // Ensure upload directory exists
            $uploadPath = public_path("uploads/{$directory}");
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }
            
            // Move file to public/uploads/{directory}
            $file->move($uploadPath, $sanitizedName);
            
            // Return relative path for database storage
            $relativePath = "uploads/{$directory}/{$sanitizedName}";
            
            return [
                'success' => true,
                'path' => $relativePath,
                'error' => null
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'path' => null,
                'error' => 'Gagal menyimpan file: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Delete image file from storage
     *
     * @param string $path Relative path (e.g., 'uploads/produk/image.jpg')
     * @return bool
     */
    public static function deleteImage(string $path): bool
    {
        try {
            $fullPath = public_path($path);
            if (file_exists($fullPath)) {
                return unlink($fullPath);
            }
            return true; // File doesn't exist, consider it deleted
        } catch (\Exception $e) {
            \Log::error('Failed to delete image: ' . $e->getMessage());
            return false;
        }
    }
}
