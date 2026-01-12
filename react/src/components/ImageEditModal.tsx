import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface ImageEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: number;
    currentImage: string;
    itemType: 'umkm' | 'product';
    itemName: string;
    onSuccess: () => void;
}

export function ImageEditModal({
    isOpen,
    onClose,
    itemId,
    currentImage,
    itemType,
    itemName,
    onSuccess
}: ImageEditModalProps) {
    const [newImageUrl, setNewImageUrl] = useState(currentImage || '');
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImage || '');
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');

    if (!isOpen) return null;

    // Compress and resize image
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if too large
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with quality 0.7
                    const base64String = canvas.toDataURL('image/jpeg', 0.7);

                    // Check size
                    const sizeInBytes = (base64String.length * 3) / 4;
                    const sizeInKB = sizeInBytes / 1024;

                    if (sizeInKB > 500) {
                        // Try lower quality
                        const lowerQuality = canvas.toDataURL('image/jpeg', 0.5);
                        resolve(lowerQuality);
                    } else {
                        resolve(base64String);
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Show loading
        toast.loading('Compressing image...');

        try {
            // Compress the image
            const base64String = await compressImage(file);

            // Calculate final size
            const sizeInBytes = (base64String.length * 3) / 4;
            const sizeInKB = Math.round(sizeInBytes / 1024);

            setNewImageUrl(base64String);
            setPreviewUrl(base64String);
            toast.dismiss();
            toast.success(`Image compressed to ${sizeInKB}KB`);
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to compress image');
            console.error(error);
        }
    };

    const handlePreview = () => {
        if (uploadMode === 'url') {
            setPreviewUrl(newImageUrl);
        }
    };

    const handleSave = async () => {
        if (!newImageUrl.trim()) {
            toast.error('Please enter an image URL or upload an image');
            return;
        }

        // Basic URL validation (skip for base64)
        if (!newImageUrl.startsWith('data:image/')) {
            try {
                new URL(newImageUrl);
            } catch {
                toast.error('Please enter a valid URL or upload an image');
                return;
            }
        }

        setIsLoading(true);

        try {
            // FIXED: Don't add /api/ prefix since VITE_API_BASE_URL already includes it
            const endpoint = itemType === 'umkm'
                ? `/umkm/${itemId}/update-image`
                : `/products/${itemId}/update-image`;

            const fieldName = itemType === 'umkm' ? 'foto_toko' : 'gambar';

            const apiUrl = import.meta.env.VITE_API_BASE_URL + endpoint;
            console.log('Updating image at:', apiUrl);

            await axios.put(apiUrl, {
                [fieldName]: newImageUrl
            });

            toast.success(`${itemType === 'umkm' ? 'Store' : 'Product'} image updated successfully!`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating image:', error);
            toast.error(error.response?.data?.message || 'Failed to update image');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Edit Image</h2>
                        <p className="text-sm text-gray-500 mt-1">{itemName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Current Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Image
                        </label>
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                            {currentImage ? (
                                <img
                                    src={currentImage}
                                    alt="Current"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Mode Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose Upload Method
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUploadMode('url')}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${uploadMode === 'url'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                Enter URL
                            </button>
                            <button
                                onClick={() => setUploadMode('file')}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${uploadMode === 'file'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                Upload File
                            </button>
                        </div>
                    </div>

                    {/* URL Input or File Upload */}
                    {uploadMode === 'url' ? (
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                New Image URL
                            </label>
                            <input
                                id="imageUrl"
                                type="url"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <button
                                onClick={handlePreview}
                                className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Preview Image
                            </button>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Image from Device
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="fileUpload"
                                />
                                <label
                                    htmlFor="fileUpload"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                    <Upload className="w-12 h-12 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Any image (auto-compressed to ~100KB)
                                    </p>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {previewUrl && previewUrl !== currentImage && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preview
                            </label>
                            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        toast.error('Failed to load image preview');
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
