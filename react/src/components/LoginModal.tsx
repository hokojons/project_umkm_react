import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { WhatsAppOtpModal } from "./WhatsAppOtpModal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createAsAdmin, setCreateAsAdmin] = useState(false);
  const [isSettingUpAdmin, setIsSettingUpAdmin] = useState(false);
  const [showWhatsAppOtp, setShowWhatsAppOtp] = useState(false);
  const [whatsAppOtpType, setWhatsAppOtpType] = useState<"user" | "business">(
    "user"
  );
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // State untuk menyimpan data form sebelum 2FA verification
  const [pendingRegistration, setPendingRegistration] = useState<{
    email: string;
    password: string;
    name: string;
    type: "user" | "business";
  } | null>(null);
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // REGISTRASI - Validasi form dulu
        if (!name.trim()) {
          toast.error("Nama harus diisi");
          setIsLoading(false);
          return;
        }
        if (!email.trim()) {
          toast.error("Email harus diisi");
          setIsLoading(false);
          return;
        }
        if (!password.trim() || password.length < 6) {
          toast.error("Password minimal 6 karakter");
          setIsLoading(false);
          return;
        }

        // Tentukan tipe akun (user atau business/UMKM)
        const registrationType = createAsAdmin ? "business" : "user";

        // Simpan data form untuk nanti setelah 2FA verified
        setPendingRegistration({
          email,
          password,
          name,
          type: registrationType,
        });

        // Trigger WhatsApp 2FA modal
        setWhatsAppOtpType(registrationType);
        setShowWhatsAppOtp(true);
        toast.info("📱 Silakan verifikasi nomor WhatsApp Anda");
      } else {
        // LOGIN
        await signIn(email, password);
        toast.success("Berhasil masuk!");
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setName("");
    setCreateAsAdmin(false);
    // Reset WhatsApp state juga
    setVerifiedPhoneNumber("");
    setPhoneNumber("");
    setShowWhatsAppOtp(false);
    setPendingRegistration(null);
  };

  // Handle WhatsApp 2FA verification success
  const handleWhatsAppOtpSuccess = async (phoneNumber: string) => {
    if (!pendingRegistration) {
      toast.error("Data registrasi tidak ditemukan");
      return;
    }

    try {
      console.log("OTP verified! Account successfully created");
      console.log("Registered email:", pendingRegistration.email);

      // PENTING: Jangan auto-login karena mungkin akun sudah ada sebelumnya
      // User harus login manual dengan password yang benar
      toast.success(
        "Akun berhasil diverifikasi! Silakan login dengan email dan password Anda."
      );

      // Pre-fill email untuk memudahkan user
      setEmail(pendingRegistration.email);
      setPassword(""); // Kosongkan password, user harus input
      setIsSignUp(false); // Switch ke login mode
      setShowWhatsAppOtp(false);

      // Clear registration data
      setName("");
      setCreateAsAdmin(false);
      setVerifiedPhoneNumber("");
      setPhoneNumber("");
      setPendingRegistration(null);

      // JANGAN close modal, biarkan user login manual
    } catch (error: any) {
      console.error("Error during verification:", error);
      toast.error(error.message || "Gagal memverifikasi OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="size-5" />
        </button>

        <h2 className="mb-6">{isSignUp ? "Daftar Akun" : "Masuk"}</h2>

        {!isSignUp ? (
          // LOGIN FORM
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="Minimal 6 karakter"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        ) : (
          // REGISTRATION FORM
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="Minimal 6 karakter"
                minLength={6}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="businessType"
                checked={createAsAdmin}
                onChange={(e) => setCreateAsAdmin(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="businessType" className="text-sm">
                Daftar sebagai UMKM (Penjual)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              💡 Setelah klik "Daftar", Anda akan diminta verifikasi nomor
              WhatsApp
            </p>
          </form>
        )}

        <div className="mt-6 text-center space-y-4">
          {!isSignUp && (
            <button
              type="button"
              onClick={toggleMode}
              className="text-indigo-600 hover:underline text-sm"
            >
              Belum punya akun? Daftar di sini
            </button>
          )}

          {isSignUp && (
            <button
              type="button"
              onClick={toggleMode}
              className="text-indigo-600 hover:underline text-sm mb-4"
            >
              Sudah punya akun? Masuk di sini
            </button>
          )}
        </div>

        {/* WhatsApp 2FA Modal - Triggered setelah user klik "Daftar" */}
        <WhatsAppOtpModal
          isOpen={showWhatsAppOtp}
          onClose={() => {
            setShowWhatsAppOtp(false);
            setPendingRegistration(null);
          }}
          onSuccess={handleWhatsAppOtpSuccess}
          type={whatsAppOtpType}
          registrationData={
            pendingRegistration
              ? {
                email: pendingRegistration.email,
                name: pendingRegistration.name,
                password: pendingRegistration.password,
              }
              : undefined
          }
        />
      </div>
    </div>
  );
}
