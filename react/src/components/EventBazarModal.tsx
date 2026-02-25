/**
 * Event & Bazar UMKM Modal - Slideshow with event listings
 * Shows events and bazaars provided by admin with automatic slideshow
 */

import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

interface Event {
  id: string;
  name: string;
  description: string;
  image?: string;
  date: string;
  location?: string;
  quota?: number;
  participants_count?: number;
}

interface EventBazarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events?: Event[];
}

export default function EventBazarModal({
  isOpen,
  onClose,
  events = [],
}: EventBazarModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadedEvents, setLoadedEvents] = useState<Event[]>([]);

  // Load events from API on mount
  useEffect(() => {
    if (isOpen && events.length === 0) {
      fetch(`${API_BASE_URL}/events`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setLoadedEvents(data.data);
          }
        })
        .catch(error => console.error('Error loading events:', error));
    }
  }, [isOpen, events.length]);

  const sampleEvents: Event[] = events.length > 0 ? events : loadedEvents;

  const defaultImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";
  const allImages = sampleEvents.map(event => event.image || defaultImage);

  // Auto-play slideshow
  useEffect(() => {
    if (!isOpen || allImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isOpen, allImages.length]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setSelectedEvent(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-200 transition"
        >
          <X size={20} className="text-gray-900" />
        </button>

        {/* Slideshow Section */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-t-2xl">
          {allImages.length > 0 && (
            <>
              <img
                src={allImages[currentImageIndex]}
                alt={`Event ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80" />

              {/* Slideshow Controls */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition"
              >
                <ChevronRight size={24} />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition ${index === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/75"
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Event & Bazar UMKM
            </h2>
            <p className="text-gray-400 text-sm">
              Klik pada event untuk melihat detail lengkap
            </p>
          </div>

          {/* Event List */}
          <div className="space-y-4">
            {sampleEvents.map((event) => {
              const eventImage = event.image || defaultImage;
              return (
                <div
                  key={event.id}
                  className="bg-gray-800/50 rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 transition transform hover:scale-[1.02]"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={eventImage}
                      alt={event.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {event.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.quota && (
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{event.participants_count || 0} / {event.quota} Peserta</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-90">
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
              >
                <X size={20} className="text-gray-900" />
              </button>

              {/* Event Image */}
              <div className="p-4">
                <img
                  src={selectedEvent.image || defaultImage}
                  alt={selectedEvent.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  {selectedEvent.name}
                </h2>

                <p className="text-gray-300 leading-relaxed">
                  {selectedEvent.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar size={20} className="text-indigo-400" />
                    <div>
                      <p className="text-sm text-gray-400">Tanggal</p>
                      <p className="font-semibold">{new Date(selectedEvent.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin size={20} className="text-indigo-400" />
                      <div>
                        <p className="text-sm text-gray-400">Lokasi</p>
                        <p className="font-semibold">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.quota && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Users size={20} className="text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Peserta</p>
                        <p className="font-semibold">
                          {selectedEvent.participants_count || 0} / {selectedEvent.quota} Peserta
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
