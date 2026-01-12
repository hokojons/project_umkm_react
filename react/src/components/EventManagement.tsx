import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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
  status?: "upcoming" | "ongoing" | "completed";
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

  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    image: "",
    quota: 100,
    status: "upcoming" as "upcoming" | "ongoing" | "completed",
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
    return `http://localhost:8000/${imagePath}`;
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/events');
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
      // Fetch from API
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/participants`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setApplications(data.data);
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
        } else if (eventForm.image && !eventForm.image.startsWith('http://localhost:8000/')) {
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
        ? `http://localhost:8000/api/events/${editingEvent.id}`
        : 'http://localhost:8000/api/events';
      
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
      status: "upcoming",
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
      status: event.status || "upcoming",
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
      const response = await fetch(`http://localhost:8000/api/events/${eventId}`, {
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
    fetchApplicationsForEvent(event.id);
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: "approved" | "rejected",
    adminNotes?: string
  ) => {
    try {
      const response = await fetch(`http://localhost:8000/api/event-applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(
          status === "approved" ? "Aplikasi disetujui" : "Aplikasi ditolak"
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

  if (selectedEventForApplications) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2">
              Aplikasi Event: {selectedEventForApplications.name}
            </h2>
            <p className="text-gray-600">
              {applications.length} aplikasi •{" "}
              {applications.filter((a) => a.status === "pending").length}{" "}
              menunggu review
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedEventForApplications(null);
              setApplications([]);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="size-6" />
          </button>
        </div>

        {isLoadingApplications ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Memuat aplikasi...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="size-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada aplikasi untuk event ini</p>
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
                    <h3 className="mb-1">{application.umkmName || application.name || 'Nama tidak tersedia'}</h3>
                    <p className="text-sm text-gray-600">
                      {application.umkmEmail || application.email || application.phone || '-'}
                    </p>
                    {application.submittedAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Diajukan: {formatDate(application.submittedAt)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      application.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : application.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
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
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Catatan: </span>
                      {application.notes}
                    </p>
                  </div>
                )}

                {application.organization && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Organisasi: </span>
                      {application.organization}
                    </p>
                  </div>
                )}

                {application.products && application.products.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">
                      Produk yang akan dijual ({application.products?.length || 0}):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {application.products?.map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                          )}
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-indigo-600">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {application.adminNotes && (
                  <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Catatan Admin: </span>
                      {application.adminNotes}
                    </p>
                  </div>
                )}

                {application.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                      onClick={() => {
                        const notes = prompt("Catatan penolakan (opsional):");
                        handleUpdateApplicationStatus(
                          application.id,
                          "rejected",
                          notes || undefined
                        );
                      }}
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
      </div>
    );
  }

  if (showEventForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2>{editingEvent ? "Edit Event" : "Buat Event Baru"}</h2>
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
                status: "upcoming",
              });
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmitEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Event</label>
            <input
              type="text"
              required
              value={eventForm.name}
              onChange={(e) =>
                setEventForm({ ...eventForm, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Festival Kuliner Nusantara"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              required
              value={eventForm.description}
              onChange={(e) =>
                setEventForm({ ...eventForm, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Jelaskan tentang event ini..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tanggal</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  required
                  value={dateForm.day}
                  onChange={(e) => {
                    setDateForm({ ...dateForm, day: e.target.value });
                    if (dateForm.month && dateForm.year && e.target.value) {
                      const formattedDate = `${
                        dateForm.year
                      }-${dateForm.month.padStart(
                        2,
                        "0"
                      )}-${e.target.value.padStart(2, "0")}`;
                      setEventForm({ ...eventForm, date: formattedDate });
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">Hari</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <select
                  required
                  value={dateForm.month}
                  onChange={(e) => {
                    setDateForm({ ...dateForm, month: e.target.value });
                    if (dateForm.day && dateForm.year && e.target.value) {
                      const formattedDate = `${
                        dateForm.year
                      }-${e.target.value.padStart(
                        2,
                        "0"
                      )}-${dateForm.day.padStart(2, "0")}`;
                      setEventForm({ ...eventForm, date: formattedDate });
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">Bulan</option>
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>

                <select
                  required
                  value={dateForm.year}
                  onChange={(e) => {
                    setDateForm({ ...dateForm, year: e.target.value });
                    if (dateForm.day && dateForm.month && e.target.value) {
                      const formattedDate = `${
                        e.target.value
                      }-${dateForm.month.padStart(
                        2,
                        "0"
                      )}-${dateForm.day.padStart(2, "0")}`;
                      setEventForm({ ...eventForm, date: formattedDate });
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">Tahun</option>
                  {Array.from(
                    { length: 10 },
                    (_, i) => new Date().getFullYear() + i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={eventForm.status}
                onChange={(e) =>
                  setEventForm({ ...eventForm, status: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="upcoming">Akan Datang</option>
                <option value="ongoing">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lokasi</label>
            <input
              type="text"
              required
              value={eventForm.location}
              onChange={(e) =>
                setEventForm({ ...eventForm, location: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Jakarta Convention Center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kuota Peserta</label>
            <input
              type="number"
              min="1"
              value={eventForm.quota || 100}
              onChange={(e) =>
                setEventForm({ ...eventForm, quota: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Gambar Event (opsional)
            </label>
            
            {/* Size recommendation info */}
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 mb-1">
                <strong>📏 Ukuran yang disarankan:</strong>
              </p>
              <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
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
                <label className="block text-xs text-gray-600 mb-1">
                  Upload dari perangkat:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              {/* OR separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">ATAU</span>
                </div>
              </div>

              {/* URL input */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
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
                    if (newValue && !newValue.startsWith('http://localhost:8000/')) {
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="https://example.com/event-image.jpg"
                  disabled={!!imageFile}
                />
                <p className="text-xs text-gray-500 mt-1">
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
                resetForm();
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Event Management</h2>
          <p className="text-gray-600">{events.length} event total</p>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="size-5" />
          Buat Event
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Belum ada event</p>
          <button
            onClick={() => setShowEventForm(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Buat Event Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {event.image && (
                  <img
                    src={getImageUrl(event.image)}
                    alt={event.name}
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80";
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="mb-1">{event.name}</h3>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          event.status === "upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : event.status === "ongoing"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {event.status === "upcoming"
                          ? "Akan Datang"
                          : event.status === "ongoing"
                          ? "Berlangsung"
                          : "Selesai"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewApplications(event)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Lihat Aplikasi"
                      >
                        <Eye className="size-5" />
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="size-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {event.description}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {event.location}
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
