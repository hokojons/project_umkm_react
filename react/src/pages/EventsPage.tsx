import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { EventList } from "../components/EventList";
import { EventApplicationModal } from "../components/EventApplicationModal";
import EventBazarModal from "../components/EventBazarModal";
import { EventDetailModal } from "../components/EventDetailModal";
import { SubmitBusinessModal } from "../components/SubmitBusinessModal";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const [isEventApplicationOpen, setIsEventApplicationOpen] = useState(false);
  const [isEventBazarOpen, setIsEventBazarOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isSubmitBusinessOpen, setIsSubmitBusinessOpen] = useState(false);
  const [hasApprovedUmkm, setHasApprovedUmkm] = useState(false);

  // Check if user is logged in from localStorage
  const userData = localStorage.getItem("pasar_umkm_current_user");
  const isLoggedIn = !!userData;
  const user = userData ? JSON.parse(userData) : null;
  const userRole = user?.role || "customer";

  // Check if user has approved UMKM
  useEffect(() => {
    const checkUmkmStatus = async () => {
      if (user?.role === "umkm" && user?.id) {
        try {
          const response = await fetch(`${API_BASE_URL}/umkm/my-umkm`, {
            headers: {
              "X-User-ID": String(user.id),
            },
          });
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            const hasApproved = data.data.some((u: any) => u.status === "active");
            setHasApprovedUmkm(hasApproved);
          }
        } catch (error) {
          console.error("Error checking UMKM status:", error);
        }
      }
    };
    checkUmkmStatus();
  }, [user?.id, user?.role]);

  // Check for eventId in URL params
  useEffect(() => {
    const eventId = searchParams.get("eventId");
    if (eventId) {

      fetch(`${API_BASE_URL}/events/${eventId}`)
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

  const handleRegisterStore = () => {
    setShowEventDetail(false);
    setIsSubmitBusinessOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-12 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-2 md:mb-4">
            Event & Bazar UMKM
          </h1>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Ikuti berbagai event dan bazar untuk memperluas jaringan bisnis Anda
          </p>
        </div>

        {/* Event List with built-in modal */}
        <EventList
          onApplyToEvent={handleApplyToEvent}
          showApplyButton={true}
          userRole={userRole}
          isLoggedIn={isLoggedIn}
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
          userRole={userRole}
          isLoggedIn={isLoggedIn}
          hasApprovedUmkm={hasApprovedUmkm}
          onRegisterStore={handleRegisterStore}
        />
      )}

      {isEventApplicationOpen && (
        <EventApplicationModal
          isOpen={isEventApplicationOpen}
          onClose={() => setIsEventApplicationOpen(false)}
          eventId={selectedEventId}
          onRegisterStore={handleRegisterStore}
        />
      )}

      {isEventBazarOpen && (
        <EventBazarModal
          isOpen={isEventBazarOpen}
          onClose={() => setIsEventBazarOpen(false)}
        />
      )}

      {isSubmitBusinessOpen && (
        <SubmitBusinessModal
          isOpen={isSubmitBusinessOpen}
          onClose={() => setIsSubmitBusinessOpen(false)}
        />
      )}
    </div>
  );
}
