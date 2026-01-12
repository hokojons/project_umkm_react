import { Calendar, MapPin, Users } from "lucide-react";
import { forwardRef, useState, useEffect } from "react";

interface Event {
  id: string;
  name: string;
  description: string;
  image?: string;
  date: string;
  location?: string;
  quota?: number;
  participants_count?: number;
  available_slots?: number;
  registration_date?: string;
}

interface EventsSectionProps {
  onEventClick: (eventId: string) => void;
}

export const EventsSection = forwardRef<HTMLElement, EventsSectionProps>(
  ({ onEventClick }, ref) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadEvents();
    }, []);

    const loadEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/events');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    const getStatus = (dateString: string): "upcoming" | "ongoing" | "past" => {
      const eventDate = new Date(dateString);
      const today = new Date();
      const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return "past";
      if (diffDays <= 7) return "ongoing";
      return "upcoming";
    };

    const getStatusBadge = (status: string) => {
      const badges = {
        upcoming: {
          text: "Akan Datang",
          className: "bg-blue-500",
        },
        ongoing: {
          text: "Sedang Berlangsung",
          className: "bg-green-500",
        },
        past: {
          text: "Telah Selesai",
          className: "bg-gray-500",
        },
      };
      return badges[status as keyof typeof badges] || badges.upcoming;
    };

    if (loading) {
      return (
        <section ref={ref} className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Memuat acara...</p>
          </div>
        </section>
      );
    }

    if (events.length === 0) {
      return (
        <section ref={ref} className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Event & Bazar UMKM
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Jangan lewatkan kesempatan untuk berpartisipasi dalam event dan
              bazar yang kami selenggarakan
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Belum ada acara tersedia</p>
          </div>
        </section>
      );
    }

    const eventsWithStatus = events.map(event => ({
      ...event,
      status: getStatus(event.date)
    }));

    const upcomingEvents = eventsWithStatus.filter((e) => e.status === "upcoming");
    const ongoingEvents = eventsWithStatus.filter((e) => e.status === "ongoing");

    return (
      <section
        ref={ref}
        className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Event & Bazar UMKM
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Jangan lewatkan kesempatan untuk berpartisipasi dalam event dan
            bazar yang kami selenggarakan
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button className="px-4 py-2 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-medium">
            Semua ({eventsWithStatus.length})
          </button>
          <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Akan Datang ({upcomingEvents.length})
          </button>
          <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Berlangsung ({ongoingEvents.length})
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsWithStatus.map((event) => {
            const badge = getStatusBadge(event.status);
            const defaultImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
            
            // Handle image URL
            let eventImage = defaultImage;
            if (event.image) {
              if (event.image.startsWith('http://') || event.image.startsWith('https://')) {
                eventImage = event.image;
              } else {
                eventImage = `http://localhost:8000/${event.image}`;
              }
            }
            
            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={eventImage}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = defaultImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div
                    className={`absolute top-4 right-4 ${badge.className} text-white text-xs font-bold px-3 py-1 rounded-full`}
                  >
                    {badge.text}
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Calendar size={16} className="text-indigo-500" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin size={16} className="text-indigo-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.quota && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Users size={16} className="text-indigo-500" />
                        <span>{event.participants_count || 0} / {event.quota} Peserta</span>
                      </div>
                    )}
                  </div>

                  <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors text-sm font-medium">
                    Lihat Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
);

EventsSection.displayName = "EventsSection";
