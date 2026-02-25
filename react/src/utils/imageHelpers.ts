import React from 'react';
import { BASE_HOST } from '../config/api';

/**
 * Image Helper Utilities
 * Handles image URL generation, validation, and error handling
 */

// Generate proper image URL
export function getImageUrl(
    image: string | undefined | null,
    baseUrl: string = BASE_HOST,
    fallbackPlaceholder?: string
): string {
    // Return placeholder if no image
    if (!image || image.trim() === "") {
        return fallbackPlaceholder || getPlaceholderDataUrl("No Image");
    }

    const imageTrimmed = image.trim();

    // Handle base64 images - return as is
    if (imageTrimmed.startsWith("data:image")) {
        return imageTrimmed;
    }

    // Handle full URLs (http:// or https://)
    if (
        imageTrimmed.startsWith("http://") ||
        imageTrimmed.startsWith("https://")
    ) {
        return imageTrimmed;
    }

    // Handle relative paths - prepend base URL
    // Remove leading slash if exists to avoid double slashes
    const cleanPath = imageTrimmed.startsWith("/")
        ? imageTrimmed.substring(1)
        : imageTrimmed;

    return `${baseUrl}/${cleanPath}`;
}

// Generate placeholder SVG data URL
export function getPlaceholderDataUrl(
    text: string = "No Image",
    width: number = 400,
    height: number = 300,
    bgColor: string = "#e5e7eb",
    textColor: string = "#9ca3af"
): string {
    const fontSize = Math.min(width, height) / 10;

    const svgString = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${text}
      </text>
    </svg>
  `.trim();

    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
}

// Handle image loading errors
export function handleImageError(
    event: React.SyntheticEvent<HTMLImageElement>,
    fallbackText: string = "No Image"
) {
    const target = event.currentTarget;

    // Don't re-trigger if already using placeholder
    if (target.src.startsWith("data:image/svg+xml")) {
        return;
    }

    console.warn("Image failed to load:", target.src);

    // Replace with placeholder
    target.src = getPlaceholderDataUrl(fallbackText);
    target.alt = fallbackText;
}

// Validate image URL
export function isValidImageUrl(url: string | undefined | null): boolean {
    if (!url || url.trim() === "") return false;

    const trimmed = url.trim();

    // Base64 images are valid
    if (trimmed.startsWith("data:image")) return true;

    // Check for URL format
    try {
        new URL(trimmed);
        return true;
    } catch {
        // Not a valid full URL, check if it's a relative path
        return trimmed.length > 0;
    }
}

// Get image dimensions from URL (if possible)
export function getImageDimensions(url: string): Promise<{
    width: number;
    height: number;
}> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            reject(new Error("Failed to load image"));
        };
        img.src = url;
    });
}

// Format file size for display
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Check if file is an image
export function isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
}

// Validate image file
export function validateImageFile(
    file: File,
    maxSizeBytes: number = 2 * 1024 * 1024 // 2MB default
): { valid: boolean; error?: string } {
    if (!isImageFile(file)) {
        return { valid: false, error: "File harus berupa gambar" };
    }

    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `Ukuran file maksimal ${formatFileSize(maxSizeBytes)}`,
        };
    }

    return { valid: true };
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Optimize image by resizing (client-side)
export function optimizeImage(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
            let { width, height } = img;

            // Calculate new dimensions
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = width * ratio;
                height = height * ratio;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Failed to optimize image"));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () => reject(new Error("Failed to load image"));

        // Convert file to data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}
