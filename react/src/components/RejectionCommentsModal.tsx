import { useState, useEffect } from "react";
import { X, AlertCircle, Package, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

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
}

interface UmkmComment {
  id: number;
  comment: string;
  created_at: string;
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
      console.log('Fetching rejection comments for user:', user.id, user.email);
      
      const response = await fetch(
        "http://localhost:8000/api/umkm/rejection-comments",
        {
          headers: {
            "X-User-ID": user.id.toString(),
          },
        }
      );

      const data = await response.json();
      console.log('Rejection comments response:', data);

      if (data.success) {
        setUmkmComments(data.data.umkm_comments || []);
        setProductComments(data.data.product_comments || []);
        
        if (data.message) {
          console.log('Server message:', data.message);
        }
      } else {
        console.error('Failed to fetch rejection comments:', data.message);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="size-6 text-red-600" />
            Komentar Penolakan
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Memuat komentar...</p>
            </div>
          ) : !hasComments ? (
            <div className="text-center py-8">
              <AlertCircle className="size-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">
                Tidak ada komentar penolakan saat ini
              </p>
            </div>
          ) : (
            <>
              {/* UMKM Store Comments */}
              {umkmComments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="size-5 text-red-600" />
                    Penolakan Toko
                  </h3>
                  <div className="space-y-3">
                    {umkmComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-red-50 border border-red-200 rounded-lg p-4"
                      >
                        <p className="text-slate-900">{comment.comment}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(comment.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Comments */}
              {productComments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package className="size-5 text-red-600" />
                    Penolakan Produk
                  </h3>
                  <div className="space-y-3">
                    {productComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {comment.nama_produk && (
                              <span className="text-sm font-semibold text-slate-900 block mb-1">
                                {comment.nama_produk}
                              </span>
                            )}
                            <span className="text-xs font-medium text-slate-500">
                              Kode: {comment.kodeproduk}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-900 mt-2">{comment.comment}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(comment.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-200">
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
