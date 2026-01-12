import { X, Clock, CheckCircle, XCircle, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface UmkmStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubmissionStatus {
  id: string;
  nama_toko: string;
  nama_pemilik: string;
  alamat_toko: string;
  status: "pending" | "approved" | "rejected";
  kategori_id: string;
  category?: {
    nama_kategori: string;
  };
}

export function UmkmStatusModal({ isOpen, onClose }: UmkmStatusModalProps) {
  const { user, refreshUser } = useAuth();
  const [submission, setSubmission] = useState<SubmissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchSubmissionStatus();
    }
  }, [isOpen, user]);

  const fetchSubmissionStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get from role-requests first
      const roleResponse = await fetch(
        `http://localhost:8000/api/role-requests/user/${user?.id}`
      );
      const roleData = await roleResponse.json();

      if (roleResponse.ok && roleData.success) {
        const submissionData = {
          id: roleData.data.kodepengguna || roleData.data.id,
          nama_toko: roleData.data.namatoko,
          nama_pemilik: roleData.data.namapemilik,
          alamat_toko: roleData.data.alamattoko,
          status: roleData.data.statuspengajuan,
          kategori_id: roleData.data.kodekategori,
          category: {
            nama_kategori: roleData.data.category?.nama_kategori || "Tidak diketahui",
          },
        };
        
        setSubmission(submissionData);
        
        // Auto-refresh user data if status is approved
        if (submissionData.status === 'approved' && refreshUser) {
          await refreshUser();
        }
      } else {
        setError("Belum ada pengajuan toko");
      }
    } catch (err) {
      console.error("Error fetching submission status:", err);
      setError("Gagal memuat status pengajuan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-12 h-12 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "rejected":
        return <XCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Store className="w-12 h-12 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Persetujuan";
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return "Tidak Diketahui";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Status Pengajuan Toko
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Memuat status...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">{error}</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        ) : submission ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex justify-center mb-4">
                {getStatusIcon(submission.status)}
              </div>
              <span
                className={`inline-block px-6 py-3 rounded-full text-lg font-semibold border-2 ${getStatusColor(
                  submission.status
                )}`}
              >
                {getStatusText(submission.status)}
              </span>
            </div>

            {/* Submission Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detail Pengajuan
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Nama Toko
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {submission.nama_toko}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Nama Pemilik
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {submission.nama_pemilik}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Alamat Toko
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {submission.alamat_toko}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Kategori
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {submission.category?.nama_kategori || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    ID Pengajuan
                  </p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {submission.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <div
              className={`p-4 rounded-xl border-2 ${
                submission.status === "pending"
                  ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20"
                  : submission.status === "approved"
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20"
              }`}
            >
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {submission.status === "pending" && (
                  <>
                    📋 Pengajuan Anda sedang dalam proses review oleh admin. Mohon
                    tunggu pemberitahuan lebih lanjut.
                  </>
                )}
                {submission.status === "approved" && (
                  <>
                    🎉 Selamat! Pengajuan toko Anda telah disetujui. Toko Anda
                    sekarang aktif dan dapat dilihat oleh pelanggan.
                  </>
                )}
                {submission.status === "rejected" && (
                  <>
                    ❌ Pengajuan toko Anda ditolak. Silakan hubungi admin untuk
                    informasi lebih lanjut atau ajukan kembali dengan perbaikan.
                  </>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={fetchSubmissionStatus}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Refresh Status
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
