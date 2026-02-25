/*
 * Product Detail Modal - Opens when clicking a product
 * Supports both light and dark theme
 * Includes Tokopedia/Shopee-style variant selection
 */

import React, { useState, useMemo } from "react";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";
import ImageCarousel from "./ImageCarousel";
import type { VariantType, VariantOption } from "../types";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    all_images?: string[];
    description?: string;
    stock?: number;
    variant_types?: VariantType[];
    seller?: {
      name: string;
      whatsapp?: string;
      instagram?: string;
    };
  };
  onAddToCart?: (
    productId: string,
    quantity: number,
    selectedVariants?: Record<string, { optionId: number; value: string; priceAdjustment: number }>
  ) => void;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  // Track selected variant option per variant type: { [variantTypeName]: optionId }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const hasVariants = product.variant_types && product.variant_types.length > 0;

  // Check if all variant types have a selection
  const allVariantsSelected = hasVariants
    ? product.variant_types!.every((vt) => selectedOptions[vt.name] !== undefined)
    : true;

  // Calculate total price adjustment from selected variants
  const priceAdjustment = useMemo(() => {
    if (!hasVariants) return 0;
    let adjustment = 0;
    product.variant_types!.forEach((vt) => {
      const selectedOptId = selectedOptions[vt.name];
      if (selectedOptId !== undefined) {
        const option = vt.options.find((o) => o.id === selectedOptId);
        if (option) adjustment += Number(option.price_adjustment) || 0;
      }
    });
    return adjustment;
  }, [selectedOptions, hasVariants, product.variant_types]);

  const finalPrice = product.price + priceAdjustment;

  // Get selected variant image (from first variant type)
  const variantImage = useMemo(() => {
    if (!hasVariants || !product.variant_types![0]) return null;
    const firstType = product.variant_types![0];
    const selectedOptId = selectedOptions[firstType.name];
    if (selectedOptId !== undefined) {
      const option = firstType.options.find((o) => o.id === selectedOptId);
      if (option?.image) return option.image;
    }
    return null;
  }, [selectedOptions, hasVariants, product.variant_types]);

  // Get variant stock if available
  const variantStock = useMemo(() => {
    if (!hasVariants) return product.stock;
    // If not all variants selected, show no specific stock
    if (!allVariantsSelected) return undefined;
    // Use the last selected variant's stock if available
    for (const vt of [...product.variant_types!].reverse()) {
      const selectedOptId = selectedOptions[vt.name];
      if (selectedOptId !== undefined) {
        const option = vt.options.find((o) => o.id === selectedOptId);
        if (option?.stock !== null && option?.stock !== undefined) return option.stock;
      }
    }
    return product.stock;
  }, [selectedOptions, hasVariants, allVariantsSelected, product.variant_types, product.stock]);

  const handleSelectOption = (typeName: string, optionId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [typeName]: prev[typeName] === optionId ? undefined! : optionId,
    }));
  };

  const handleAddToCart = () => {
    if (hasVariants && !allVariantsSelected) return;

    if (onAddToCart) {
      // Build selected variants info
      const selectedVariants: Record<string, { optionId: number; value: string; priceAdjustment: number }> = {};
      if (hasVariants) {
        product.variant_types!.forEach((vt) => {
          const selectedOptId = selectedOptions[vt.name];
          if (selectedOptId !== undefined) {
            const option = vt.options.find((o) => o.id === selectedOptId);
            if (option) {
              selectedVariants[vt.name] = {
                optionId: option.id,
                value: option.value,
                priceAdjustment: Number(option.price_adjustment) || 0,
              };
            }
          }
        });
      }
      onAddToCart(product.id, quantity, Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined);
    }
    onClose();
  };

  // Determine which image to show
  const displayImage = variantImage || product.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition text-gray-600 dark:text-gray-300"
        >
          <X size={20} />
        </button>

        {/* Banner/Header Image */}
        {displayImage && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30 dark:to-gray-800/50" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Section */}
          {(product.seller?.whatsapp || product.seller?.instagram) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Hubungi Penjual
              </h3>
              <div className="flex gap-3">
                {product.seller?.whatsapp && (
                  <a
                    href={`https://wa.me/${product.seller.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    📱 WhatsApp
                  </a>
                )}
                {product.seller?.instagram && (
                  <a
                    href={`https://instagram.com/${product.seller.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    📷 Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Product Image */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex justify-center">
            <div className="relative w-full" style={{ maxWidth: '320px' }}>
              {((product.all_images && product.all_images.length > 1) || (product.images && product.images.length > 1)) ? (
                <ImageCarousel
                  images={product.all_images || product.images || [product.image]}
                  aspectRatio="1/1"
                  showDots={true}
                  showArrows={true}
                  autoRotateMs={4000}
                />
              ) : (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-48 h-48 object-cover rounded-lg mx-auto"
                />
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Produk</h3>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm">{product.description}</p>
            )}
          </div>

          {/* === VARIANT SELECTION (Tokopedia/Shopee Style) === */}
          {hasVariants && (
            <div className="space-y-4">
              {product.variant_types!.map((variantType) => (
                <div key={variantType.id}>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {variantType.name}
                    {selectedOptions[variantType.name] !== undefined && (
                      <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-normal">
                        : {variantType.options.find((o) => o.id === selectedOptions[variantType.name])?.value}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variantType.options.map((option) => {
                      const isSelected = selectedOptions[variantType.name] === option.id;
                      const isOutOfStock = option.stock !== null && option.stock !== undefined && option.stock <= 0;

                      return (
                        <button
                          key={option.id}
                          onClick={() => !isOutOfStock && handleSelectOption(variantType.name, option.id)}
                          disabled={isOutOfStock}
                          className={`
                            relative px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                            ${isSelected
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                              : isOutOfStock
                                ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed line-through'
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500'
                            }
                          `}
                        >
                          {/* Variant image thumbnail (only for first variant type) */}
                          {variantType.display_order === 0 && option.image && (
                            <img
                              src={option.image}
                              alt={option.value}
                              className="w-6 h-6 rounded object-cover inline-block mr-1.5 -mt-0.5"
                            />
                          )}
                          {option.value}
                          {Number(option.price_adjustment) > 0 && (
                            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                              +Rp {Number(option.price_adjustment).toLocaleString("id-ID")}
                            </span>
                          )}
                          {Number(option.price_adjustment) < 0 && (
                            <span className="ml-1 text-xs text-green-600 dark:text-green-400">
                              -Rp {Math.abs(Number(option.price_adjustment)).toLocaleString("id-ID")}
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="ml-1 text-xs text-red-500">Habis</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Variant selection hint */}
              {!allVariantsSelected && (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                  ⚠️ Pilih semua varian sebelum menambahkan ke keranjang
                </p>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Harga</span>
            <div className="text-right">
              {priceAdjustment !== 0 && (
                <span className="text-sm text-gray-400 line-through mr-2">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
              )}
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Rp {finalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Stock Info */}
          {variantStock !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Stok</span>
              <span className={`font-medium ${variantStock <= 5 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {variantStock > 0 ? `${variantStock} tersisa` : 'Habis'}
              </span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Jumlah</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-gray-700 dark:text-gray-200 transition"
              >
                <Minus size={16} />
              </button>
              <span className="text-gray-900 dark:text-white font-bold w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(variantStock ? Math.min(variantStock, quantity + 1) : quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-gray-700 dark:text-gray-200 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={hasVariants && !allVariantsSelected}
            className={`w-full font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg
              ${hasVariants && !allVariantsSelected
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }
            `}
          >
            <ShoppingCart size={20} />
            {hasVariants && !allVariantsSelected
              ? 'Pilih Varian Terlebih Dahulu'
              : 'Tambah ke keranjang'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
