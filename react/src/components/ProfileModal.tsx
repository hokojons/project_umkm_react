import { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Load profile from localStorage
      const savedProfile = localStorage.getItem(
        `pasar_umkm_profile_${user.id}`
      );
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setProfile({
          name: user.name,
          email: user.email,
          phone: profileData.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
          postalCode: profileData.postalCode || "",
        });
      } else {
        setProfile({
          name: user.name,
          email: user.email,
          phone: "",
          address: "",
          city: "",
          postalCode: "",
        });
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== ProfileModal Submit ===");
    console.log("Current user:", user);
    console.log("User ID:", user?.id);
    console.log("Profile data:", profile);

    // Validate phone number
    if (profile.phone && !/^08\d{8,11}$/.test(profile.phone)) {
      toast.error("Nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx");
      return;
    }

    // Validate postal code
    if (profile.postalCode && !/^\d{5}$/.test(profile.postalCode)) {
      toast.error("Kode pos harus 5 digit angka");
      return;
    }

    if (!user?.id) {
      console.error("User ID not found!");
      toast.error("User ID tidak ditemukan. Silakan login kembali.");
      return;
    }

    setIsLoading(true);

    try {
      // Save profile to Laravel backend
      if (user?.id) {
        console.log("Sending profile update request with user ID:", user.id);
        console.log("Profile data:", {
          nama: profile.name,
          email: profile.email,
          telepon: profile.phone,
          alamat: profile.address,
          kota: profile.city,
          kode_pos: profile.postalCode,
        });

        const backendResponse = await fetch(
          "http://localhost:8000/api/auth/profile",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-User-ID": user.id,
            },
            body: JSON.stringify({
              nama: profile.name,
              email: profile.email,
              telepon: profile.phone,
              alamat: profile.address,
              kota: profile.city,
              kode_pos: profile.postalCode,
            }),
          }
        );

        console.log("Backend response status:", backendResponse.status);

        if (!backendResponse.ok) {
          const error = await backendResponse.json();
          console.error("Backend error response:", error);
          throw new Error(
            error.message ||
              JSON.stringify(error.errors) ||
              "Failed to save profile to database"
          );
        }

        const backendData = await backendResponse.json();
        console.log("Profile saved to database:", backendData);
        toast.success("Profile berhasil disimpan di database!");
      }

      // Save profile to localStorage for offline support
      const profileData = {
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postalCode: profile.postalCode,
      };

      localStorage.setItem(
        `pasar_umkm_profile_${user?.id}`,
        JSON.stringify(profileData)
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      onClose();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Gagal menyimpan profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <User className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-white mb-1">Profile Saya</h2>
              <p className="text-indigo-100 text-sm">
                Kelola informasi pribadi Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="size-5 text-white" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-5rem)]"
        >
          <div className="p-6 space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Tips:</strong> Lengkapi profile Anda agar data
                pengiriman otomatis terisi saat checkout.
              </p>
            </div>

            {/* Account Info (Read-only) */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Mail className="size-5 text-gray-600" />
                Informasi Akun
              </h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Phone className="size-5 text-gray-600" />
                Informasi Kontak
              </h3>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  No. Telepon <span className="text-gray-500">(Opsional)</span>
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="08xx xxxx xxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 08xxxxxxxxxx (10-13 digit)
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <MapPin className="size-5 text-gray-600" />
                Alamat Pengiriman
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Alamat Lengkap{" "}
                    <span className="text-gray-500">(Opsional)</span>
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    placeholder="Jl. Contoh No. 123, RT/RW 01/02, Kelurahan..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Kota <span className="text-gray-500">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) =>
                        setProfile({ ...profile, city: e.target.value })
                      }
                      placeholder="Jakarta, Bandung, Surabaya..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Kode Pos <span className="text-gray-500">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={profile.postalCode}
                      onChange={(e) =>
                        setProfile({ ...profile, postalCode: e.target.value })
                      }
                      placeholder="12345"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">5 digit angka</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="size-5" />
              {isLoading ? "Menyimpan..." : "Simpan Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
