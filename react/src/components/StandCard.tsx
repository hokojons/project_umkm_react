import { FoodStand } from "../types";
import { Star, User, MessageCircle, Instagram } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface StandCardProps {
  stand: FoodStand;
  onClick: () => void;
}

export function StandCard({ stand, onClick }: StandCardProps) {
  return (
    <div
      onClick={onClick}
      data-stand-id={stand.id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-indigo-100 dark:border-gray-700"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={stand.image}
          alt={stand.name}
          className="w-full h-full object-cover"
        />
        {stand.whatsapp && (
          <div className="absolute top-3 left-3 bg-green-600 px-2 py-1 rounded-full flex items-center gap-1 text-white">
            <MessageCircle className="size-3" />
            <span className="text-xs">Kontak</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-gray-900 dark:text-gray-100">{stand.name}</h3>
        <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
          <User className="size-4" />
          <span className="text-sm">Pemilik: {stand.owner}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {stand.description}
        </p>

        {/* Contact Icons */}
        {(stand.whatsapp || stand.instagram) && (
          <div className="flex items-center gap-2 mb-3">
            {stand.whatsapp && (
              <a
                href={`https://wa.me/${stand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs transition-colors"
                title="Hubungi via WhatsApp"
              >
                <MessageCircle className="size-3" />
                WhatsApp
              </a>
            )}
            {stand.instagram && (
              <a
                href={`https://instagram.com/${stand.instagram.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-xs transition-colors"
                title="Kunjungi Instagram"
              >
                <Instagram className="size-3" />
                Instagram
              </a>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="inline-block bg-gradient-to-r from-orange-100 to-pink-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-700">
            {stand.category}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {stand.products?.length || 0} item produk
          </span>
        </div>
      </div>
    </div>
  );
}
