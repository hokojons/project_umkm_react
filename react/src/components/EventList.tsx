import { useState, useEffect, forwardRef } from "react";
import { EventCard } from "./EventCard";
import { EventDetailModal } from "./EventDetailModal";
import { Calendar } from "lucide-react";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location?: string;
  image?: string;
  quota?: number;
  participants_count?: number;
  available_slots?: number;
  status: "upcoming" | "ongoing" | "completed";
}

interface EventListProps {
  onApplyToEvent?: (eventId: string) => void;
  showApplyButton?: boolean;
  userRole?: string;
  isLoggedIn?: boolean;
}

export const EventList = forwardRef<HTMLElement, EventListProps>(
  (
    { onApplyToEvent, showApplyButton = false, userRole, isLoggedIn = false },
    ref
  ) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<
      "all" | "upcoming" | "ongoing" | "completed"
    >("all");
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
      fetchEvents();
    }, []);

    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/events');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Map backend data dengan status
          const eventsWithStatus = data.data.map((event: any) => ({
            ...event,
            status: getEventStatus(event.date)
          }));
          setEvents(eventsWithStatus);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    const getEventStatus = (dateString: string): "upcoming" | "ongoing" | "completed" => {
      const eventDate = new Date(dateString);
      const today = new Date();
      const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return "completed";
      if (diffDays <= 7) return "ongoing";
      return "upcoming";
    };

    const filteredEvents = events.filter((event) => {
      if (filter === "all") return true;
      return event.status === filter;
    });

    if (isLoading) {
      return (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-500">Memuat events...</p>
            </div>
          </div>
        </section>
      );
    }

    if (events.length === 0) {
      return null; // Don't show section if no events
    }

    return (
      <section
        ref={ref}
        className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-full transition-all shadow-sm font-medium ${
                filter === "all"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-gray-600 border border-purple-200 dark:border-gray-600"
              }`}
            >
              Semua ({events.length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-6 py-2 rounded-full transition-all shadow-sm font-medium ${
                filter === "upcoming"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-gray-600 border border-purple-200 dark:border-gray-600"
              }`}
            >
              Akan Datang (
              {events.filter((e) => e.status === "upcoming").length})
            </button>
            <button
              onClick={() => setFilter("ongoing")}
              className={`px-6 py-2 rounded-full transition-all shadow-sm font-medium ${
                filter === "ongoing"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-gray-600 border border-purple-200 dark:border-gray-600"
              }`}
            >
              Berlangsung ({events.filter((e) => e.status === "ongoing").length}
              )
            </button>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <Calendar className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Tidak ada event{" "}
                {filter !== "all" &&
                  `yang ${
                    filter === "upcoming" ? "akan datang" : "sedang berlangsung"
                  }`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onApply={onApplyToEvent}
                  onClick={setSelectedEvent}
                  showApplyButton={showApplyButton}
                  userRole={userRole}
                />
              ))}
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onApply={() => {
              if (onApplyToEvent) {
                onApplyToEvent(selectedEvent.id);
              }
              setSelectedEvent(null);
            }}
            userRole={userRole}
            isLoggedIn={isLoggedIn}
          />
        )}
      </section>
    );
  }
);

EventList.displayName = "EventList";
