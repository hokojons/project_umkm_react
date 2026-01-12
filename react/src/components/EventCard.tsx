import { Calendar, MapPin, Store } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    date: string;
    location: string;
    image?: string;
    status: "upcoming" | "ongoing" | "completed";
  };
  onApply?: (eventId: string) => void;
  onClick?: (event: EventCardProps["event"]) => void;
  showApplyButton?: boolean;
  userRole?: string;
}

export function EventCard({
  event,
  onApply,
  onClick,
  showApplyButton = false,
  userRole,
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (event.status) {
      case "upcoming":
        return (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            Akan Datang
          </span>
        );
      case "ongoing":
        return (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
            Sedang Berlangsung
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
            Selesai
          </span>
        );
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-purple-100 dark:border-gray-700"
      onClick={onClick ? () => onClick(event) : undefined}
    >
      {event.image && (
        <div className="h-48 overflow-hidden">
          <img
            src={
              event.image.startsWith('http://') || event.image.startsWith('https://')
                ? event.image
                : `http://localhost:8000/${event.image}`
            }
            alt={event.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";
            }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="flex-1 text-gray-900 dark:text-white font-bold">
            {event.name}
          </h3>
          {getStatusBadge()}
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="size-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick(event);
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg"
          >
            Lihat Detail
          </button>

          {showApplyButton &&
            userRole === "umkm" &&
            event.status !== "completed" &&
            onApply && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(event.id);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-purple-200 dark:shadow-none"
              >
                <Store className="size-4" />
                Ajukan Berjualan
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
