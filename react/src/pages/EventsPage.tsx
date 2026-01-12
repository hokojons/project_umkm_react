import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { EventList } from "../components/EventList";
import { EventApplicationModal } from "../components/EventApplicationModal";
import EventBazarModal from "../components/EventBazarModal";
import { EventDetailModal } from "../components/EventDetailModal";

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const [isEventApplicationOpen, setIsEventApplicationOpen] = useState(false);
  const [isEventBazarOpen, setIsEventBazarOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Check for eventId in URL params
  useEffect(() => {
    const eventId = searchParams.get("eventId");
    if (eventId) {
      // Load event from API
      fetch(`http://localhost:8000/api/events/${eventId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setSelectedEvent(data.data);
            setShowEventDetail(true);
          }
        })
        .catch(error => console.error('Error loading event:', error));
    }
  }, [searchParams]);

  const handleApplyToEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsEventApplicationOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Event & Bazar UMKM
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Ikuti berbagai event dan bazar untuk memperluas jaringan bisnis Anda
          </p>
        </div>

        {/* Event List with built-in modal */}
        <EventList
          onApplyToEvent={handleApplyToEvent}
          showApplyButton={true}
          userRole="customer"
          isLoggedIn={true}
        />
      </div>

      {/* Modals */}
      {showEventDetail && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => {
            setShowEventDetail(false);
            setSelectedEvent(null);
          }}
          onApply={() => {
            setShowEventDetail(false);
            setSelectedEventId(selectedEvent.id);
            setIsEventApplicationOpen(true);
          }}
          userRole="user"
          isLoggedIn={false}
        />
      )}

      {isEventApplicationOpen && (
        <EventApplicationModal
          isOpen={isEventApplicationOpen}
          onClose={() => setIsEventApplicationOpen(false)}
          eventId={selectedEventId}
        />
      )}

      {isEventBazarOpen && (
        <EventBazarModal
          isOpen={isEventBazarOpen}
          onClose={() => setIsEventBazarOpen(false)}
        />
      )}
    </div>
  );
}
