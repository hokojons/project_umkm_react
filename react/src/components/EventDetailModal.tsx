import { Calendar, MapPin, X, Store, AlertCircle, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL, BASE_HOST } from "../config/api";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  status: "upcoming" | "ongoing" | "completed";
  quota?: number;
  participants_count?: number;
  available_slots?: number;
}

interface Participant {
  id: string;
  name: string;
  phone: string;
  status: string;
}

interface EventDetailModalProps {
  event: Event;
  onClose: () => void;
  onApply?: () => void;
  userRole?: string;
  isLoggedIn: boolean;
  hasApprovedUmkm?: boolean;
  onRegisterStore?: () => void;
}

export function EventDetailModal({
  event,
  onClose,
  onApply,
  userRole,
  isLoggedIn,
  hasApprovedUmkm = false,
  onRegisterStore,
}: EventDetailModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Get user data from localStorage to pre-fill form
  const storedUser = localStorage.getItem("pasar_umkm_current_user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Also get profile data which may have phone number
  const storedProfile = currentUser ? localStorage.getItem(`pasar_umkm_profile_${currentUser.id}`) : null;
  const userProfile = storedProfile ? JSON.parse(storedProfile) : null;

  const [formData, setFormData] = useState({
    name: currentUser?.name || currentUser?.namapengguna || currentUser?.nama_lengkap || "",
    email: currentUser?.email || "",
    phone: userProfile?.phone || currentUser?.phone || currentUser?.teleponpengguna || currentUser?.no_telepon || "",
    organization: "",
    notes: "",
  });

  const loadParticipants = async () => {
    setLoadingParticipants(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${event.id}/participants`);
      const data = await response.json();

      if (data.success) {
        setParticipants(data.data);
      } else {
        toast.error('Gagal memuat data peserta');
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Gagal memuat data peserta');
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    if (showParticipants) {
      loadParticipants();
    }
  }, [showParticipants]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: {
        text: "Akan Datang",
        className:
          "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
      },
      ongoing: {
        text: "Sedang Berlangsung",
        className:
          "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
      },
      completed: {
        text: "Selesai",
        className:
          "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
      },
    };
    return badges[status as keyof typeof badges] || badges.upcoming;
  };

  const statusBadge = getStatusBadge(event.status);
  // User can apply only if: logged in + UMKM role + has approved store + event not completed
  const canApply =
    isLoggedIn && userRole === "umkm" && hasApprovedUmkm && event.status !== "completed";
  // User is UMKM but doesn't have approved store
  const needsToRegisterStore = isLoggedIn && userRole === "umkm" && !hasApprovedUmkm;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Nama, email, dan telepon wajib diisi");
      return;
    }

    try {
      // Get user ID from localStorage if logged in
      const userData = localStorage.getItem("pasar_umkm_current_user");
      const user = userData ? JSON.parse(userData) : null;

      const response = await fetch(`${API_BASE_URL}/events/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: String(event.id),
          user_id: user?.id ? String(user.id) : null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization || '',
          notes: formData.notes || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Pendaftaran berhasil! Kami akan menghubungi Anda segera.");
        setFormData({ name: "", email: "", phone: "", organization: "", notes: "" });
        setIsRegistering(false);
        onClose();
      } else {
        toast.error(data.message || "Gagal mendaftar. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error("Gagal mendaftar. Silakan coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header Image */}
        {event.image && (
          <div className="relative h-64 md:h-80">
            <img
              src={
                event.image.startsWith('http://') || event.image.startsWith('https://')
                  ? event.image
                  : `${BASE_HOST}/${event.image}`
              }
              alt={event.name}
              className="w-full h-full object-cover rounded-t-2xl"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";
              }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg text-gray-900 dark:text-gray-100"
            >
              <X className="size-6" />
            </button>
            <div className="absolute bottom-4 left-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${statusBadge.className}`}
              >
                {statusBadge.text}
              </span>
            </div>
          </div>
        )}

        {/* Close button if no image */}
        {!event.image && (
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="size-6" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Title and Status */}
          <div className="mb-6">
            <h2 className="mb-3 text-gray-900 dark:text-white">{event.name}</h2>
            {!event.image && (
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${statusBadge.className}`}
              >
                {statusBadge.text}
              </span>
            )}
          </div>

          {/* Event Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
              <Calendar className="size-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Tanggal
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
              <MapPin className="size-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Lokasi
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {event.location || "TBA"}
                </p>
              </div>
            </div>

            {event.quota && (
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
                <Users className="size-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Kuota Peserta
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.participants_count || 0} / {event.quota} Peserta
                    </p>
                    <button
                      onClick={() => setShowParticipants(!showParticipants)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {showParticipants ? 'Sembunyikan' : 'Lihat Peserta'}
                    </button>
                  </div>
                  {event.available_slots !== undefined && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sisa slot: {event.available_slots}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Participants List */}
          {showParticipants && (
            <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="size-5" />
                Daftar Peserta ({participants.length})
              </h3>
              {loadingParticipants ? (
                <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
              ) : participants.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="p-3 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-medium text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {participant.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {participant.phone}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${participant.status === 'aktif'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                      >
                        {participant.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Belum ada peserta terdaftar</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h3 className="mb-3 text-gray-900 dark:text-white">
              Tentang Event
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Benefits for UMKM */}
          <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
            <h3 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Store className="size-5 text-purple-600 dark:text-purple-400" />
              Keuntungan Berjualan di Event Ini
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">
                  •
                </span>
                <span>
                  Kesempatan bertemu langsung dengan pelanggan potensial
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">
                  •
                </span>
                <span>Meningkatkan brand awareness produk UMKM Anda</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">
                  •
                </span>
                <span>Networking dengan pelaku UMKM lainnya</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">
                  •
                </span>
                <span>Booth dan promosi gratis dari Pasar UMKM</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {canApply ? (
              <button
                onClick={onApply}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-lg transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-200 dark:shadow-none"
              >
                <Store className="size-5" />
                Ajukan Berjualan di Event Ini
              </button>
            ) : !isLoggedIn ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
                      Login Diperlukan
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Silakan login terlebih dahulu untuk mengajukan berjualan
                      di event ini
                    </p>
                  </div>
                </div>
              </div>
            ) : userRole !== "umkm" ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
                      Hanya untuk UMKM
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Hanya akun dengan role UMKM yang dapat mengajukan
                      berjualan di event ini.
                      {userRole === "user" &&
                        " Silakan ajukan upgrade ke UMKM terlebih dahulu."}
                    </p>
                  </div>
                </div>
              </div>
            ) : needsToRegisterStore ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Store className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                      Daftarkan Toko UMKM Anda
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                      Anda belum memiliki toko UMKM yang terdaftar. Silakan daftarkan toko Anda terlebih dahulu untuk bisa mengajukan berjualan di event ini.
                    </p>
                    {onRegisterStore && (
                      <button
                        onClick={onRegisterStore}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Store className="size-4" />
                        Daftar Toko UMKM
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : event.status === "completed" ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Event Telah Selesai
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Event ini sudah selesai. Nantikan event-event menarik
                      lainnya!
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Registration Form or Button */}
            {event.status !== "completed" && !isRegistering && (
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    toast.error("Silakan login atau buat akun terlebih dahulu sebelum mendaftar event");
                    return;
                  }
                  setIsRegistering(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Users className="size-5" />
                Daftar Sebagai Pengunjung
              </button>
            )}

            {isRegistering && (
              <form onSubmit={handleRegister} className="space-y-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Form Pendaftaran Pengunjung
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organisasi / Komunitas (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  >
                    Kirim Pendaftaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            <button
              onClick={onClose}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
