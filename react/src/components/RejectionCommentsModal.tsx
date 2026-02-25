import { useState, useEffect } from "react";
import { X, AlertCircle, Package, Store, ImageOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL, BASE_HOST } from "../config/api";

interface RejectionCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductComment {
  id: number;
  kodeproduk: string;
  comment: string;
  created_at: string;
  nama_produk?: string;
  product_id?: number;
  product_image?: string;
}

interface UmkmComment {
  id: number;
  comment: string;
  created_at: string;
  nama_toko?: string;
  foto_toko?: string;
}

function getImageUrl(src: string | undefined | null): string | null {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("data:")) return src;
  return `${BASE_HOST}/${src}`;
}

export function RejectionCommentsModal({
  isOpen,
  onClose,
}: RejectionCommentsModalProps) {
  const { user } = useAuth();
  const [umkmComments, setUmkmComments] = useState<UmkmComment[]>([]);
  const [productComments, setProductComments] = useState<ProductComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchRejectionComments();
    }
  }, [isOpen, user]);

  const fetchRejectionComments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/umkm/rejection-comments`,
        {
          headers: {
            "X-User-ID": user.id.toString(),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUmkmComments(data.data.umkm_comments || []);
        setProductComments(data.data.product_comments || []);
      } else {
        console.error("Failed to fetch rejection comments:", data.message);
      }
    } catch (error) {
      console.error("Error fetching rejection comments:", error);
      toast.error("Gagal memuat komentar penolakan");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasComments = umkmComments.length > 0 || productComments.length > 0;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="size-6 text-red-600" />
            Komentar Penolakan
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="size-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400 mt-4">Memuat komentar...</p>
            </div>
          ) : !hasComments ? (
            <div className="text-center py-8">
              <AlertCircle className="size-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Tidak ada komentar penolakan saat ini
              </p>
            </div>
          ) : (
            <>
              {/* UMKM Store Comments */}
              {umkmComments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Store className="size-5 text-red-600" />
                    Penolakan Toko
                  </h3>
                  <div className="space-y-3">
                    {umkmComments.map((comment) => {
                      const imgUrl = getImageUrl(comment.foto_toko);
                      return (
                        <div
                          key={comment.id}
                          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                        >
                          <div className="flex gap-4">
                            {/* Store image */}
                            <div className="flex-shrink-0">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={comment.nama_toko || "Toko"}
                                  className="w-16 h-16 rounded-lg object-cover border border-red-200 dark:border-red-700"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                  }}
                                />
                              ) : null}
                              <div className={`w-16 h-16 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center ${imgUrl ? "hidden" : ""}`}>
                                <Store className="size-7 text-red-400" />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {comment.nama_toko && (
                                <span className="text-sm font-semibold text-slate-900 dark:text-white block mb-1">
                                  {comment.nama_toko}
                                </span>
                              )}
                              <p className="text-slate-800 dark:text-slate-200">{comment.comment}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                {formatDate(comment.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Comments */}
              {productComments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Package className="size-5 text-orange-600" />
                    Penolakan Produk
                  </h3>
                  <div className="space-y-3">
                    {productComments.map((comment) => {
                      const imgUrl = getImageUrl(comment.product_image);
                      return (
                        <div
                          key={comment.id}
                          className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4"
                        >
                          <div className="flex gap-4">
                            {/* Product image */}
                            <div className="flex-shrink-0">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={comment.nama_produk || "Produk"}
                                  className="w-16 h-16 rounded-lg object-cover border border-orange-200 dark:border-orange-700"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                  }}
                                />
                              ) : null}
                              <div className={`w-16 h-16 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center ${imgUrl ? "hidden" : ""}`}>
                                <ImageOff className="size-7 text-orange-400" />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {comment.nama_produk && (
                                <span className="text-sm font-semibold text-slate-900 dark:text-white block mb-1">
                                  {comment.nama_produk}
                                </span>
                              )}
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Kode: {comment.kodeproduk}
                              </span>
                              <p className="text-slate-800 dark:text-slate-200 mt-2">{comment.comment}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                {formatDate(comment.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
