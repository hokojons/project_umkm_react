import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, BASE_HOST } from "../config/api";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { ImagePositionEditor } from "./ImagePositionEditor";


interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location?: string;
  image?: string;
  gambar_position_x?: number;
  gambar_position_y?: number;
  gambar_scale?: number;
  quota?: number;
  participants_count?: number;
  available_slots?: number;
  registration_date?: string;
  status?: "upcoming" | "ongoing" | "completed" | "active";
  is_expired?: boolean; // Added for expired events indicator
  createdAt?: string;
}

interface EventApplication {
  id: string;
  eventId?: string;
  umkmId?: string;
  umkmEmail?: string;
  umkmName?: string;
  businessId?: string;
  name?: string;
  phone?: string;
  email?: string;
  organization?: string;
  status?: "pending" | "approved" | "rejected";
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
  eventProducts?: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
    isEventExclusive: boolean;
  }>;
  notes?: string;
  submittedAt?: string;
  adminNotes?: string;
}

interface EventManagementProps {
  onClose?: () => void;
}

export function EventManagement({ onClose }: EventManagementProps) {
  const { accessToken } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEventForApplications, setSelectedEventForApplications] =
    useState<Event | null>(null);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  // Tab for detail view: "umkm" (vendors) or "peserta" (participants)
  const [detailTab, setDetailTab] = useState<"umkm" | "peserta">("umkm");
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // State for viewing full UMKM detail
  const [selectedUMKMDetail, setSelectedUMKMDetail] = useState<any>(null);
  const [isLoadingUMKMDetail, setIsLoadingUMKMDetail] = useState(false);

  // State for viewing full application/submission detail
  const [selectedApplicationDetail, setSelectedApplicationDetail] = useState<EventApplication | null>(null);

  // State for rejection modal
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; applicationId: string | null; notes: string }>({
    isOpen: false,
    applicationId: null,
    notes: ""
  });

  // Tab for filtering events: "upcoming" or "completed"
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    image: "",
    quota: 100,
    // Status is now automatic based on date, no longer user-selectable
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, scale: 1 });
  const [imageChanged, setImageChanged] = useState(false); // Track if user changed image

  const [dateForm, setDateForm] = useState({
    day: "",
    month: "",
    year: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    return `${BASE_HOST}/${imagePath}`;
  };

  const fetchEvents = async () => {
    try {
      // Use /events/all for admin to see all events including expired ones
      const response = await fetch(`${API_BASE_URL}/events/all`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Gagal memuat events');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplicationsForEvent = async (eventId: string) => {
    setIsLoadingApplications(true);
    try {
      // Fetch vendor registrations from API
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/vendors`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Map API response to expected format
        const mappedApplications = data.data.map((vendor: any) => ({
          id: vendor.id.toString(),
          eventId: vendor.event_id,
          umkmId: vendor.umkm_id,
          umkmName: vendor.umkmName || vendor.ownerName,
          umkmEmail: vendor.userEmail,
          status: vendor.status,
          notes: vendor.notes,
          adminNotes: vendor.admin_notes,
          submittedAt: vendor.created_at,
          products: vendor.productDetails?.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            price: p.price,
            image: p.image ? (p.image.startsWith('http') ? p.image : `${BASE_HOST}/${p.image}`) : '',
          })) || [],
          agreementFile: vendor.agreement_file ?
            (vendor.agreement_file.startsWith('http') ? vendor.agreement_file : `${BASE_HOST}/${vendor.agreement_file}`)
            : null,
        }));
        setApplications(mappedApplications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // Fetch participants (visitors) for event
  const fetchParticipantsForEvent = async (eventId: string) => {
    setIsLoadingParticipants(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/participants`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setParticipants(data.data);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipants([]);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Fetch full UMKM detail for viewing before approval
  const fetchUMKMDetail = async (umkmId: string) => {
    setIsLoadingUMKMDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/umkm/${umkmId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedUMKMDetail(data.data);
      } else {
        toast.error('Gagal memuat detail UMKM');
      }
    } catch (error) {
      console.error('Error loading UMKM detail:', error);
      toast.error('Gagal memuat detail UMKM');
    } finally {
      setIsLoadingUMKMDetail(false);
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !eventForm.name ||
      !eventForm.description ||
      !eventForm.date ||
      !eventForm.location
    ) {
      toast.error("Semua field wajib diisi");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', eventForm.name);
      formData.append('description', eventForm.description);
      formData.append('date', eventForm.date);
      formData.append('location', eventForm.location);
      formData.append('quota', eventForm.quota.toString());

      // Always send position if there's an image preview or existing image
      if (imagePreview || eventForm.image) {
        formData.append('gambar_position_x', Math.round(imagePosition.x).toString());
        formData.append('gambar_position_y', Math.round(imagePosition.y).toString());
        formData.append('gambar_scale', imagePosition.scale.toString());
      }

      // Only send image if user changed it
      if (imageChanged) {
        if (imageFile) {
          // User uploaded a new file
          formData.append('image', imageFile);
        } else if (eventForm.image && !eventForm.image.startsWith(`${BASE_HOST}/`)) {
          // User entered a new URL (not from our server)
          formData.append('image', eventForm.image);
        }
      }
      // If imageChanged is false, don't send image field at all (keep existing image on server)

      // For update, use POST with _method=PUT for FormData compatibility
      if (editingEvent) {
        formData.append('_method', 'PUT');
      }

      const url = editingEvent
        ? `${API_BASE_URL}/events/${editingEvent.id}`
        : `${API_BASE_URL}/events`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingEvent ? "Event berhasil diupdate" : "Event berhasil dibuat");
        fetchEvents();
      } else {
        toast.error(data.message || 'Gagal menyimpan event');
        return;
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Gagal menyimpan event');
      return;
    }

    setShowEventForm(false);
    setEditingEvent(null);
    setImageFile(null);
    setImagePreview("");
    setImagePosition({ x: 0, y: 0, scale: 1 });
    setImageChanged(false); // Reset image changed flag
    setEventForm({
      name: "",
      description: "",
      date: "",
      location: "",
      image: "",
      quota: 100,
    });
    setDateForm({
      day: "",
      month: "",
      year: "",
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);

    // Parse existing date
    const dateObj = new Date(event.date);
    setDateForm({
      day: dateObj.getDate().toString(),
      month: (dateObj.getMonth() + 1).toString(),
      year: dateObj.getFullYear().toString(),
    });

    // Convert relative image path to full URL if needed
    const imageUrl = getImageUrl(event.image || "");

    setEventForm({
      name: event.name,
      description: event.description,
      date: event.date,
      location: event.location || "",
      image: imageUrl,
      quota: event.quota || 100,
    });

    // Load image position from event data
    setImagePosition({
      x: event.gambar_position_x || 0,
      y: event.gambar_position_y || 0,
      scale: event.gambar_scale || 1,
    });

    // Reset image upload state
    setImageFile(null);
    setImagePreview("");
    setImageChanged(false); // Reset - user hasn't changed image yet

    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus event ini? Semua aplikasi untuk event ini juga akan dihapus."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Event berhasil dihapus");
        fetchEvents();
      } else {
        toast.error(data.message || 'Gagal menghapus event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Gagal menghapus event');
    }
  };

  const handleViewApplications = (event: Event) => {
    setSelectedEventForApplications(event);
    setDetailTab("umkm"); // Reset to UMKM tab
    fetchApplicationsForEvent(event.id);
    fetchParticipantsForEvent(event.id);
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: "approved" | "rejected",
    adminNotes?: string
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/vendors/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          status === "approved" ? "Pendaftaran UMKM disetujui" : "Pendaftaran UMKM ditolak"
        );
        if (selectedEventForApplications) {
          fetchApplicationsForEvent(selectedEventForApplications.id);
        }
      } else {
        toast.error(data.message || 'Gagal update status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Gagal update status');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setImageFile(file);
      setImageChanged(true); // Mark that user changed the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // UMKM Detail Modal
  const UMKMDetailModal = () => {
    if (!selectedUMKMDetail) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white">Detail UMKM</h2>
            <button
              onClick={() => setSelectedUMKMDetail(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Store Info */}
            <div className="flex items-start gap-4">
              {selectedUMKMDetail.foto_toko && (
                <img
                  src={getImageUrl(selectedUMKMDetail.foto_toko)}
                  alt={selectedUMKMDetail.nama_toko}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold dark:text-white">{selectedUMKMDetail.nama_toko || selectedUMKMDetail.nama_usaha}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedUMKMDetail.kategori}</p>
                {selectedUMKMDetail.alamat && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="size-4" /> {selectedUMKMDetail.alamat}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedUMKMDetail.deskripsi && (
              <div>
                <h4 className="font-semibold mb-2 dark:text-white">Deskripsi</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{selectedUMKMDetail.deskripsi}</p>
              </div>
            )}

            {/* About / Tentang */}
            {selectedUMKMDetail.tentang && (
              <div>
                <h4 className="font-semibold mb-2 dark:text-white">Tentang Usaha</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{selectedUMKMDetail.tentang}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 dark:text-white">Kontak</h4>
                {selectedUMKMDetail.whatsapp && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">📱 {selectedUMKMDetail.whatsapp}</p>
                )}
                {selectedUMKMDetail.instagram && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">📸 @{selectedUMKMDetail.instagram}</p>
                )}
                {selectedUMKMDetail.pemilik?.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">✉️ {selectedUMKMDetail.pemilik.email}</p>
                )}
              </div>

              {/* Bank Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 dark:text-white">Info Rekening</h4>
                {selectedUMKMDetail.nama_bank ? (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">🏦 {selectedUMKMDetail.nama_bank}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">💳 {selectedUMKMDetail.no_rekening}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">👤 {selectedUMKMDetail.atas_nama}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">Belum ada info rekening</p>
                )}
              </div>
            </div>

            {/* Products */}
            {selectedUMKMDetail.products && selectedUMKMDetail.products.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 dark:text-white">Produk ({selectedUMKMDetail.products.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedUMKMDetail.products.slice(0, 8).map((product: any) => (
                    <div key={product.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                      {product.gambar && (
                        <img
                          src={getImageUrl(product.gambar)}
                          alt={product.nama_produk}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      )}
                      <p className="text-xs font-medium truncate dark:text-white">{product.nama_produk}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">{formatCurrency(product.harga)}</p>
                    </div>
                  ))}
                </div>
                {selectedUMKMDetail.products.length > 8 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    +{selectedUMKMDetail.products.length - 8} produk lainnya
                  </p>
                )}
              </div>
            )}

            {/* Owner Info */}
            {selectedUMKMDetail.pemilik && (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 dark:text-white">Pemilik</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">👤 {selectedUMKMDetail.pemilik.nama || selectedUMKMDetail.nama_pemilik}</p>
                {selectedUMKMDetail.pemilik.no_telepon && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">📞 {selectedUMKMDetail.pemilik.no_telepon}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4">
            <button
              onClick={() => setSelectedUMKMDetail(null)}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rejection Modal - replaces browser prompt with custom modal
  const RejectionModal = () => {
    if (!rejectionModal.isOpen) return null;

    const handleReject = () => {
      if (rejectionModal.applicationId) {
        handleUpdateApplicationStatus(
          rejectionModal.applicationId,
          "rejected",
          rejectionModal.notes || undefined
        );
      }
      setRejectionModal({ isOpen: false, applicationId: null, notes: "" });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white">Tolak Pendaftaran</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Berikan catatan penolakan (opsional)
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <textarea
              value={rejectionModal.notes}
              onChange={(e) => setRejectionModal({ ...rejectionModal, notes: e.target.value })}
              placeholder="Masukkan alasan penolakan (opsional)..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
              rows={4}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex gap-3">
            <button
              onClick={() => setRejectionModal({ isOpen: false, applicationId: null, notes: "" })}
              className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tolak Pendaftaran
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Application Detail Modal - shows products submitted for event and event-exclusive items
  const ApplicationDetailModal = () => {
    if (!selectedApplicationDetail) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold dark:text-white">Detail Pengajuan Event</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedApplicationDetail.umkmName || selectedApplicationDetail.name}
              </p>
            </div>
            <button
              onClick={() => setSelectedApplicationDetail(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Submission Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium dark:text-white">{selectedApplicationDetail.umkmEmail || selectedApplicationDetail.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Pengajuan</p>
                  <p className="font-medium dark:text-white">
                    {selectedApplicationDetail.submittedAt ? formatDate(selectedApplicationDetail.submittedAt) : '-'}
                  </p>
                </div>
              </div>
              {selectedApplicationDetail.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Catatan dari UMKM</p>
                  <p className="font-medium dark:text-white whitespace-pre-line">{selectedApplicationDetail.notes}</p>
                </div>
              )}
            </div>

            {/* Products for Event */}
            {selectedApplicationDetail.products && selectedApplicationDetail.products.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
                  📦 Produk yang akan dijual ({selectedApplicationDetail.products.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplicationDetail.products.map((product) => (
                    <div key={product.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-3">
                        <p className="font-medium dark:text-white">{product.name}</p>
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event-Exclusive Products */}
            {selectedApplicationDetail.eventProducts && selectedApplicationDetail.eventProducts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">KHUSUS EVENT</span>
                  Produk Khusus Event ({selectedApplicationDetail.eventProducts.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplicationDetail.eventProducts.map((product) => (
                    <div key={product.id} className="border-2 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="font-medium dark:text-white">{product.name}</p>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {formatCurrency(product.price)}
                      </p>
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{product.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No products message */}
            {(!selectedApplicationDetail.products || selectedApplicationDetail.products.length === 0) &&
              (!selectedApplicationDetail.eventProducts || selectedApplicationDetail.eventProducts.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Tidak ada produk yang diajukan</p>
                </div>
              )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4">
            <button
              onClick={() => setSelectedApplicationDetail(null)}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (selectedEventForApplications) {
    return (
      <div className="space-y-6">
        {/* Rejection Modal */}
        <RejectionModal />
        {/* Application Detail Modal */}
        <ApplicationDetailModal />
        {/* UMKM Detail Modal */}
        <UMKMDetailModal />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2 dark:text-white">
              Pendaftar Event: {selectedEventForApplications.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {applications.length} UMKM • {participants.length} Peserta
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedEventForApplications(null);
              setApplications([]);
              setParticipants([]);
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setDetailTab("umkm")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${detailTab === "umkm"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
          >
            🏪 UMKM ({applications.length})
          </button>
          <button
            onClick={() => setDetailTab("peserta")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${detailTab === "peserta"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
          >
            👥 Peserta ({participants.length})
          </button>
        </div>

        {/* UMKM Tab Content */}
        {detailTab === "umkm" && (
          <>
            {isLoadingApplications ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Memuat data UMKM...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Users className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Belum ada UMKM yang mendaftar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="mb-1 dark:text-white">{application.umkmName || application.name || 'Nama tidak tersedia'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {application.umkmEmail || application.email || application.phone || '-'}
                        </p>
                        {application.submittedAt && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Diajukan: {formatDate(application.submittedAt)}
                          </p>
                        )}
                        {/* Button to view full application detail */}
                        <button
                          onClick={() => setSelectedApplicationDetail(application)}
                          className="mt-2 flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                        >
                          <Eye className="size-4" />
                          Lihat Detail Pengajuan
                        </button>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${application.status === "approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                          : application.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                          }`}
                      >
                        {application.status === "approved"
                          ? "Disetujui"
                          : application.status === "rejected"
                            ? "Ditolak"
                            : "Menunggu"}
                      </span>
                    </div>

                    {application.notes && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <p className="text-sm dark:text-gray-200">
                          <span className="font-medium">Catatan: </span>
                          {application.notes}
                        </p>
                      </div>
                    )}

                    {application.products && application.products.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2 dark:text-gray-200">
                          Produk yang akan dijual ({application.products?.length || 0}):
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {application.products?.map((product) => (
                            <div
                              key={product.id}
                              className="border border-gray-200 dark:border-gray-500 rounded-lg p-3 dark:bg-gray-600"
                            >
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                              )}
                              <p className="text-sm font-medium truncate dark:text-white">
                                {product.name}
                              </p>
                              <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                    {application.adminNotes && (
                      <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <p className="text-sm dark:text-indigo-200">
                          <span className="font-medium">Catatan Admin: </span>
                          {application.adminNotes}
                        </p>
                      </div>
                    )}

                    {/* Agreement File Display */}
                    {application.agreementFile && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                          📋 Surat Perjanjian
                        </h4>
                        <a
                          href={application.agreementFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Lihat/Download Dokumen
                        </a>
                      </div>
                    )}

                    {application.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-500">
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(
                              application.id,
                              "approved"
                            )
                          }
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => setRejectionModal({
                            isOpen: true,
                            applicationId: application.id,
                            notes: ""
                          })}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Peserta Tab Content */}
        {detailTab === "peserta" && (
          <>
            {isLoadingParticipants ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Memuat data peserta...</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Users className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Belum ada peserta yang mendaftar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Participant List Table */}
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telepon</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Organisasi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {participants.map((participant, index) => (
                        <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{participant.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{participant.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{participant.phone}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{participant.organization || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${participant.status === "confirmed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                              : participant.status === "cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                              }`}>
                              {participant.status === "confirmed" ? "Terkonfirmasi" : participant.status === "cancelled" ? "Dibatalkan" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (showEventForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="dark:text-white">{editingEvent ? "Edit Event" : "Buat Event Baru"}</h2>
          <button
            onClick={() => {
              setShowEventForm(false);
              setEditingEvent(null);
              setImagePosition({ x: 50, y: 50 });
              setImageFile(null);
              setImagePreview("");
              setImageChanged(false);
              setEventForm({
                name: "",
                description: "",
                date: "",
                location: "",
                image: "",
                quota: 100,
              });
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmitEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Nama Event</label>
            <input
              type="text"
              required
              value={eventForm.name}
              onChange={(e) =>
                setEventForm({ ...eventForm, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Festival Kuliner Nusantara"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Deskripsi</label>
            <textarea
              required
              value={eventForm.description}
              onChange={(e) =>
                setEventForm({ ...eventForm, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
              rows={4}
              placeholder="Jelaskan tentang event ini..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Tanggal Event</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => {
                  setEventForm({ ...eventForm, date: e.target.value });
                  // Also update dateForm for compatibility
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-');
                    setDateForm({
                      year: year,
                      month: String(parseInt(month)),
                      day: String(parseInt(day)),
                    });
                  }
                }}
                min={new Date().toISOString().split('T')[0]} // Minimum today
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white cursor-pointer"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📅 Klik untuk memilih tanggal dari kalender
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Status</label>
              <div className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ✨ <strong>Otomatis</strong>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Status ditentukan otomatis berdasarkan tanggal event.
                  Event akan tampil di website jika tanggalnya belum lewat.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Lokasi</label>
            <input
              type="text"
              required
              value={eventForm.location}
              onChange={(e) =>
                setEventForm({ ...eventForm, location: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Jakarta Convention Center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Kuota Peserta</label>
            <input
              type="number"
              min="1"
              value={eventForm.quota || 100}
              onChange={(e) =>
                setEventForm({ ...eventForm, quota: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Gambar Event (opsional)
            </label>

            {/* Size recommendation info */}
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                <strong>📏 Ukuran yang disarankan:</strong>
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-disc">
                <li>Rasio: 16:9 atau 4:3</li>
                <li>Dimensi: 1200x675px atau 1200x900px</li>
                <li>Format: JPG, PNG, WEBP</li>
                <li>Ukuran maksimal: 2MB</li>
              </ul>
            </div>

            {/* Image Preview with Position Controls */}
            {(imagePreview || eventForm.image) && (
              <div className="mb-3">
                <ImagePositionEditor
                  imageUrl={imagePreview || eventForm.image}
                  initialX={imagePosition.x}
                  initialY={imagePosition.y}
                  initialScale={imagePosition.scale}
                  onPositionChange={(x, y, scale) => {
                    setImagePosition({ x, y, scale });
                    setImageChanged(true); // Mark as changed when position changes
                  }}
                  containerHeight="400px"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                    setEventForm({ ...eventForm, image: "" });
                    setImagePosition({ x: 0, y: 0, scale: 1 });
                    setImageChanged(true); // Mark as changed since user removed image
                  }}
                  className="mt-3 w-full bg-red-50 text-red-700 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="size-4" />
                  Hapus Gambar
                </button>
              </div>
            )}

            <div className="space-y-3">
              {/* Upload from device */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Upload dari perangkat:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* OR separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">ATAU</span>
                </div>
              </div>

              {/* URL input */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  URL gambar:
                </label>
                <input
                  type="url"
                  value={eventForm.image}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEventForm({ ...eventForm, image: newValue });
                    setImageFile(null);
                    setImagePreview("");
                    // Only mark as changed if user is entering a new URL (not from our server)
                    if (newValue && !newValue.startsWith(`${BASE_HOST}/`)) {
                      setImageChanged(true);
                    }
                  }}
                  onBlur={(e) => {
                    // Trigger preview when URL is entered
                    if (e.target.value && !imageFile && !imagePreview) {
                      // Force re-render to show preview
                      setEventForm({ ...eventForm, image: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/event-image.jpg"
                  disabled={!!imageFile}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Masukkan URL gambar dan klik di luar untuk melihat preview
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {editingEvent ? "Update Event" : "Buat Event"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEventForm(false);
                setEditingEvent(null);
                setImageFile(null);
                setImagePreview("");
                setImagePosition({ x: 0, y: 0, scale: 1 });
                setImageChanged(false);
                setEventForm({
                  name: "",
                  description: "",
                  date: "",
                  location: "",
                  image: "",
                  quota: 100,
                });
                setDateForm({
                  day: "",
                  month: "",
                  year: "",
                });
              }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-200"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  }
  // Filter events based on active tab
  const upcomingEvents = events.filter(e => !e.is_expired);
  const completedEvents = events.filter(e => e.is_expired);
  const filteredEvents = activeTab === "upcoming" ? upcomingEvents : completedEvents;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="mb-1 sm:mb-2 text-gray-900 dark:text-white text-lg sm:text-xl">Event Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {upcomingEvents.length} mendatang • {completedEvents.length} selesai
          </p>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 self-start sm:self-auto text-sm sm:text-base"
        >
          <Plus className="size-4 sm:size-5" />
          Buat Event
        </button>
      </div>

      {/* Tabs for filtering */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "upcoming"
            ? "border-orange-500 text-orange-600 dark:text-orange-400"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
        >
          📅 Acara Mendatang ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "completed"
            ? "border-orange-500 text-orange-600 dark:text-orange-400"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
        >
          📜 Riwayat Acara ({completedEvents.length})
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Memuat events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Calendar className="size-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {activeTab === "upcoming"
              ? "Belum ada acara mendatang"
              : "Belum ada riwayat acara"}
          </p>
          {activeTab === "upcoming" && (
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Buat Event Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-white dark:bg-gray-700 border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow ${event.is_expired
                ? "border-gray-300 dark:border-gray-500 opacity-75"
                : "border-gray-200 dark:border-gray-600"
                }`}
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {event.image && (
                  <img
                    src={getImageUrl(event.image)}
                    alt={event.name}
                    className={`w-full sm:w-32 h-40 sm:h-32 object-cover rounded-lg ${event.is_expired ? "grayscale" : ""}`}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-gray-900 dark:text-white text-sm sm:text-base">{event.name}</h3>
                      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                        {/* Expired badge - show prominently if event has passed */}
                        {event.is_expired && (
                          <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                            ⏰ Sudah Lewat
                          </span>
                        )}
                        {/* Status badge */}
                        <span
                          className={`inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs ${event.is_expired
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                            : event.status === "upcoming" || event.status === "active"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                              : event.status === "ongoing"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                            }`}
                        >
                          {event.is_expired
                            ? "Selesai"
                            : event.status === "upcoming" || event.status === "active"
                              ? "Akan Datang"
                              : event.status === "ongoing"
                                ? "Berlangsung"
                                : "Selesai"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewApplications(event)}
                        className="p-1.5 sm:p-2 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                        title="Lihat Aplikasi"
                      >
                        <Eye className="size-4 sm:size-5" />
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="size-4 sm:size-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="size-4 sm:size-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-3 sm:line-clamp-none">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5 sm:size-4" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3.5 sm:size-4" />
                      <span className="truncate max-w-[150px] sm:max-w-none">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
