import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, User, Mail, Phone, MapPin, Check, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";

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
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isOpen && user) {
        isInitialLoad.current = true;
        const userPhone = (user as any).no_telepon || (user as any).telepon || (user as any).phone || "";

        try {
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              "Content-Type": "application/json",
              "X-User-ID": user.id,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setProfile({
                name: data.data.nama_lengkap || data.data.nama || data.data.name || user.name,
                email: data.data.email || user.email,
                phone: data.data.no_telepon || data.data.telepon || data.data.phone || userPhone || "",
                address: data.data.alamat || "",
                city: data.data.kota || "",
                postalCode: data.data.kode_pos || "",
              });
              // Allow auto-save after initial data is loaded
              setTimeout(() => { isInitialLoad.current = false; }, 500);
              return;
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }

        // Fallback to localStorage + user data
        const savedProfile = localStorage.getItem(`pasar_umkm_profile_${user.id}`);
        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          setProfile({
            name: user.name,
            email: user.email,
            phone: profileData.phone || userPhone || "",
            address: profileData.address || "",
            city: profileData.city || "",
            postalCode: profileData.postalCode || "",
          });
        } else {
          setProfile({
            name: user.name,
            email: user.email,
            phone: userPhone || "",
            address: "",
            city: "",
            postalCode: "",
          });
        }
        setTimeout(() => { isInitialLoad.current = false; }, 500);
      }
    };

    fetchProfile();
  }, [isOpen, user]);

  const saveProfile = useCallback(async (profileData: UserProfile) => {
    if (!user?.id) return;

    // Validate before saving
    if (profileData.phone && !/^08\d{8,11}$/.test(profileData.phone)) return;
    if (profileData.postalCode && !/^\d{5}$/.test(profileData.postalCode)) return;

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const backendResponse = await fetch(
        `${API_BASE_URL}/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": user.id,
          },
          body: JSON.stringify({
            nama: profileData.name,
            email: profileData.email,
            telepon: profileData.phone,
            alamat: profileData.address,
            kota: profileData.city,
            kode_pos: profileData.postalCode,
          }),
        }
      );

      if (!backendResponse.ok) {
        throw new Error("Failed to save");
      }

      // Save to localStorage too
      localStorage.setItem(
        `pasar_umkm_profile_${user.id}`,
        JSON.stringify({
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          postalCode: profileData.postalCode,
        })
      );

      await refreshUser();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus("error");
      toast.error("Gagal menyimpan profile");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [user, refreshUser]);

  // Auto-save with debounce when profile changes
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (!isOpen || !user) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      saveProfile(profile);
    }, 1000); // Save 1 second after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [profile, isOpen, user, saveProfile]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div className="flex items-center gap-3">
            {/* Auto-save status indicator */}
            {saveStatus === "saving" && (
              <div className="flex items-center gap-1.5 text-indigo-200 text-sm">
                <Loader2 className="size-4 animate-spin" />
                <span>Menyimpan...</span>
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="flex items-center gap-1.5 text-green-300 text-sm">
                <Check className="size-4" />
                <span>Tersimpan</span>
              </div>
            )}
            {saveStatus === "error" && (
              <div className="text-red-300 text-sm">Gagal menyimpan</div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="size-5 text-white" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
          <div className="p-6 space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>💡 Tips:</strong> Data profile akan otomatis tersimpan saat Anda mengubahnya.
              </p>
            </div>

            {/* Account Info */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Mail className="size-5 text-gray-600 dark:text-gray-400" />
                Informasi Akun
              </h3>
              <div className="space-y-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Phone className="size-5 text-gray-600 dark:text-gray-400" />
                Informasi Kontak
              </h3>
              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                  No. Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="08xx xxxx xxxx"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Format: 08xxxxxxxxxx (10-13 digit)
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <MapPin className="size-5 text-gray-600 dark:text-gray-400" />
                Alamat Pengiriman
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Alamat Lengkap{" "}
                    <span className="text-gray-500 dark:text-gray-500">(Opsional)</span>
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    placeholder="Jl. Contoh No. 123, RT/RW 01/02, Kelurahan..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                      Kota <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) =>
                        setProfile({ ...profile, city: e.target.value })
                      }
                      placeholder="Jakarta, Bandung, Surabaya..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                      Kode Pos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.postalCode}
                      onChange={(e) =>
                        setProfile({ ...profile, postalCode: e.target.value })
                      }
                      placeholder="12345"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 digit angka</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
