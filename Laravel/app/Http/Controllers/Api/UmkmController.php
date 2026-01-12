<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tumkm;
use App\Models\Tproduk;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UmkmController extends Controller
{
    public function submit(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            // Validate user exists and has UMKM role
            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if ($user->role !== 'umkm' && $user->role !== 'umkm_owner') {
                return response()->json([
                    'success' => false,
                    'message' => 'User must have UMKM role to submit a store'
                ], 403);
            }

            // Validate request
            $validator = Validator::make($request->all(), [
                'nama_toko' => 'required|string|max:255',
                'nama_pemilik' => 'required|string|max:255',
                'deskripsi' => 'required|string',
                'foto_toko' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
                'kategori_id' => 'nullable', // Allow any type, will be converted to string
                'whatsapp' => 'nullable|string|max:20',
                'telepon' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'instagram' => 'nullable|string|max:100',
                'about_me' => 'nullable|string|max:1000',
                'produk' => 'required|string', // JSON string
            ]);

            if ($validator->fails()) {
                \Log::error('UMKM Submit Validation Failed', [
                    'errors' => $validator->errors()->toArray(),
                    'input' => $request->except(['foto_toko', 'produk_image_0', 'produk_image_1']),
                    'all_input' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Generate kodepengguna from user_id
            $kodepengguna = 'U' . str_pad($userId, 3, '0', STR_PAD_LEFT);

            // Ensure kategori_id is set, use default if not provided
            $kategoriId = (string)($request->kategori_id ?? '1');
            
            // Note: tpengguna table is now for event visitors only
            // No need to insert into tpengguna for UMKM submissions

            // Parse products from JSON string
            $produkArray = json_decode($request->produk, true);
            if (!$produkArray || !is_array($produkArray) || count($produkArray) < 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'At least one product is required'
                ], 422);
            }

            // Handle foto_toko upload
            $fotoTokoPath = null;
            if ($request->hasFile('foto_toko')) {
                $file = $request->file('foto_toko');
                $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $request->nama_toko);
                $filename = 'toko_' . $sanitizedName . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/toko'), $filename);
                $fotoTokoPath = 'uploads/toko/' . $filename;
            }

            // Check if user already has UMKM store
            $umkm = Tumkm::where('user_id', $userId)->first();

            if ($umkm) {
                // Update existing UMKM store
                $updateData = [
                    'nama_toko' => $request->nama_toko,
                    'nama_pemilik' => $request->nama_pemilik,
                    'deskripsi' => $request->deskripsi,
                    'kategori_id' => $kategoriId,
                    'status' => 'pending', // Reset to pending when resubmitting
                ];
                
                if ($fotoTokoPath) {
                    $updateData['foto_toko'] = $fotoTokoPath;
                }
                
                // Add optional fields
                if ($request->whatsapp) $updateData['whatsapp'] = $request->whatsapp;
                if ($request->telepon) $updateData['telepon'] = $request->telepon;
                if ($request->email) $updateData['email'] = $request->email;
                if ($request->instagram) $updateData['instagram'] = $request->instagram;
                if ($request->about_me) $updateData['about_me'] = $request->about_me;

                $umkm->update($updateData);
            } else {
                // Create new UMKM store
                $createData = [
                    'user_id' => $userId,
                    'nama_toko' => $request->nama_toko,
                    'nama_pemilik' => $request->nama_pemilik,
                    'deskripsi' => $request->deskripsi,
                    'kategori_id' => $kategoriId,
                    'status' => 'pending',
                ];
                
                if ($fotoTokoPath) {
                    $createData['foto_toko'] = $fotoTokoPath;
                }
                
                // Add optional fields
                if ($request->whatsapp) $createData['whatsapp'] = $request->whatsapp;
                if ($request->telepon) $createData['telepon'] = $request->telepon;
                if ($request->email) $createData['email'] = $request->email;
                if ($request->instagram) $createData['instagram'] = $request->instagram;
                if ($request->about_me) $createData['about_me'] = $request->about_me;

                $umkm = Tumkm::create($createData);
            }

            // Save products to tproduk table
            // First, delete old products for this UMKM
            DB::table('tproduk')->where('umkm_id', $umkm->id)->delete();

            // Insert new products
            foreach ($produkArray as $index => $produk) {
                // Handle product image from separate file upload
                $gambarPath = null;
                $imageKey = 'produk_image_' . $index;
                
                if ($request->hasFile($imageKey)) {
                    $file = $request->file($imageKey);
                    $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $produk['nama_produk'] ?? 'product');
                    $filename = 'product_' . $umkm->id . '_' . $index . '_' . time() . '.' . $file->getClientOriginalExtension();
                    
                    if (!file_exists(public_path('uploads/products'))) {
                        mkdir(public_path('uploads/products'), 0777, true);
                    }
                    
                    $file->move(public_path('uploads/products'), $filename);
                    $gambarPath = 'uploads/products/' . $filename;
                    \Log::info("Product image uploaded", ['path' => $gambarPath, 'umkm_id' => $umkm->id]);
                } elseif (!empty($produk['gambar'])) {
                    // Fallback: handle base64 image if sent in JSON
                    if (strpos($produk['gambar'], 'data:image') === 0) {
                        $image = $produk['gambar'];
                        $image = str_replace('data:image/png;base64,', '', $image);
                        $image = str_replace('data:image/jpg;base64,', '', $image);
                        $image = str_replace('data:image/jpeg;base64,', '', $image);
                        $image = str_replace(' ', '+', $image);
                        $imageName = 'product_' . $umkm->id . '_' . $index . '_' . time() . '.png';
                        
                        $imagePath = public_path('uploads/products/' . $imageName);
                        if (!file_exists(public_path('uploads/products'))) {
                            mkdir(public_path('uploads/products'), 0777, true);
                        }
                        file_put_contents($imagePath, base64_decode($image));
                        $gambarPath = 'uploads/products/' . $imageName;
                        \Log::info("Base64 image saved", ['path' => $gambarPath]);
                    } else {
                        $gambarPath = $produk['gambar'];
                    }
                }
                
                // For new tproduk table structure: umkm_id, nama_produk, deskripsi, harga, kategori, stok, gambar, status
                DB::table('tproduk')->insert([
                    'umkm_id' => $umkm->id,
                    'nama_produk' => $produk['nama_produk'] ?? $produk['nama'] ?? '',
                    'deskripsi' => $produk['deskripsi'] ?? '',
                    'harga' => $produk['harga'] ?? 0,
                    'kategori' => $produk['kategori'] ?? 'product',
                    'stok' => $produk['stok'] ?? 0,
                    'gambar' => $gambarPath,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'UMKM store submitted successfully',
                'data' => $umkm
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create UMKM store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $umkm = Tumkm::with(['user', 'category', 'products'])
                ->where('status', 'active')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $umkm
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch UMKM stores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $umkm = Tumkm::with(['user', 'category', 'products'])
                ->where('id', $id)
                ->first();

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'UMKM store not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $umkm
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch UMKM store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPending()
    {
        try {
            $umkm = Tumkm::with(['user', 'category', 'products'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $umkm
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending UMKM stores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approveStore($id)
    {
        try {
            $umkm = Tumkm::find($id);

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'UMKM store not found'
                ], 404);
            }

            $umkm->update(['status' => 'active']);

            return response()->json([
                'success' => true,
                'message' => 'UMKM store approved successfully',
                'data' => $umkm
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve UMKM store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function rejectStore($id)
    {
        try {
            $umkm = Tumkm::find($id);

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'UMKM store not found'
                ], 404);
            }

            $umkm->update(['status' => 'rejected']);

            return response()->json([
                'success' => true,
                'message' => 'UMKM store rejected',
                'data' => $umkm
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject UMKM store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserStore(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            $umkm = Tumkm::with(['category', 'products'])
                ->where('user_id', $userId)
                ->first();

            return response()->json([
                'success' => true,
                'data' => $umkm
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user UMKM store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStore(Request $request, $id)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            $umkm = Tumkm::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'UMKM store not found or unauthorized'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'nama_toko' => 'nullable|string|max:255',
                'nama_pemilik' => 'nullable|string|max:255',
                'deskripsi' => 'nullable|string',
                'foto_toko' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
                'whatsapp' => 'nullable|string|max:20',
                'telepon' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'instagram' => 'nullable|string|max:100',
                'about_me' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle file upload
            $updateData = $request->only([
                'nama_toko',
                'nama_pemilik',
                'deskripsi',
                'whatsapp',
                'telepon',
                'email',
                'instagram',
                'about_me'
            ]);

            if ($request->hasFile('foto_toko')) {
                \Log::info('📸 New image file received: ' . $request->file('foto_toko')->getClientOriginalName());

                // Delete old image if exists
                if ($umkm->foto_toko && file_exists(public_path($umkm->foto_toko))) {
                    \Log::info('🗑️ Deleting old image: ' . $umkm->foto_toko);
                    unlink(public_path($umkm->foto_toko));
                }

                // Save new image
                $file = $request->file('foto_toko');
                $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $request->nama_toko ?? 'toko');
                $filename = 'toko_' . $sanitizedName . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/toko'), $filename);
                $updateData['foto_toko'] = 'uploads/toko/' . $filename;
                \Log::info('✅ Image saved: ' . $updateData['foto_toko']);
            } else {
                \Log::info('ℹ️ No new image file in request');
            }

            $umkm->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'UMKM store updated successfully',
                'data' => $umkm->load(['category', 'products'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update UMKM store',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProduct(Request $request, $id)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            $product = Tproduk::where('id', $id)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Verify ownership through UMKM
            $umkm = Tumkm::where('id', $product->umkm_id)
                ->where('user_id', $userId)
                ->first();

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this product'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nama_produk' => 'nullable|string|max:255',
                'deskripsi' => 'nullable|string',
                'harga' => 'nullable|numeric|min:0',
                'kategori' => 'nullable|string|max:50',
                'gambar' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle file upload
            $updateData = $request->only([
                'nama_produk',
                'deskripsi',
                'harga',
                'kategori'
            ]);

            if ($request->hasFile('gambar')) {
                // Delete old image if exists
                if ($product->gambar && file_exists(public_path($product->gambar))) {
                    unlink(public_path($product->gambar));
                }

                // Save new image
                $file = $request->file('gambar');
                $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $request->nama_produk ?? 'produk');
                $filename = 'produk_' . $sanitizedName . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/produk'), $filename);
                $updateData['gambar'] = 'uploads/produk/' . $filename;
            }

            $product->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve UMKM store with option to reject specific products
     */
    public function approveStoreWithProducts(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'umkm_comment' => 'nullable|string',
                'umkm_action' => 'required|in:approve,reject',
                'products' => 'required|array',
                'products.*.kodeproduk' => 'nullable|string',
                'products.*.id' => 'nullable|integer',
                'products.*.action' => 'required|in:approve,reject',
                'products.*.comment' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $umkm = Tumkm::find($id);
            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'UMKM store not found'
                ], 404);
            }

            // Count approved products
            $approvedCount = 0;
            $rejectedCount = 0;
            
            foreach ($request->products as $productData) {
                if ($productData['action'] === 'approve') {
                    $approvedCount++;
                } else {
                    $rejectedCount++;
                }
            }

            // Logic: Jika ada minimal 1 produk approved, toko bisa disetujui
            // Jika semua produk ditolak, toko otomatis ditolak
            $finalUmkmStatus = 'pending';
            
            if ($request->umkm_action === 'reject') {
                // Admin explicitly reject the store
                $finalUmkmStatus = 'rejected';
            } else if ($approvedCount > 0) {
                // Ada produk yang di-approve, toko bisa aktif
                $finalUmkmStatus = 'active';
            } else {
                // Semua produk ditolak, toko tidak bisa aktif
                $finalUmkmStatus = 'rejected';
            }

            $umkm->update(['status' => $finalUmkmStatus]);

            // Save UMKM rejection comment if rejected
            if ($finalUmkmStatus === 'rejected' && $request->umkm_comment) {
                DB::table('umkm_rejection_comments')->insert([
                    'umkm_id' => $umkm->id,
                    'comment' => $request->umkm_comment,
                    'admin_id' => $request->header('X-User-ID', 1),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Process each product
            foreach ($request->products as $productData) {
                // Get product ID (support both id and kodeproduk for compatibility)
                $productId = $productData['id'] ?? null;
                
                if (!$productId) {
                    continue;
                }

                $product = DB::table('tproduk')->where('id', $productId)->first();

                if ($product) {
                    if ($productData['action'] === 'approve') {
                        // Approve product - set status active
                        DB::table('tproduk')
                            ->where('id', $productId)
                            ->update([
                                'status' => 'active',
                                'updated_at' => now()
                            ]);
                    } else {
                        // Reject product - set status inactive
                        DB::table('tproduk')
                            ->where('id', $productId)
                            ->update([
                                'status' => 'inactive',
                                'updated_at' => now()
                            ]);

                        // Save product rejection comment
                        if (!empty($productData['comment'])) {
                            DB::table('product_rejection_comments')->insert([
                                'kodeproduk' => 'P' . $productId,
                                'kodepengguna' => 'U' . $umkm->user_id,
                                'comment' => $productData['comment'],
                                'status' => 'rejected',
                                'admin_id' => $request->header('X-User-ID', 1),
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            // Prepare response message
            $message = '';
            if ($finalUmkmStatus === 'active') {
                if ($rejectedCount > 0) {
                    $message = "Toko disetujui dengan {$approvedCount} produk. {$rejectedCount} produk ditolak dan perlu diperbaiki.";
                } else {
                    $message = 'Toko dan semua produk berhasil disetujui!';
                }
            } else if ($finalUmkmStatus === 'rejected') {
                if ($request->umkm_action === 'reject') {
                    $message = 'Toko ditolak oleh admin.';
                } else {
                    $message = 'Toko ditolak karena semua produk ditolak. User dapat memperbaiki produk dan mengajukan kembali.';
                }
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'umkm_status' => $finalUmkmStatus,
                    'approved_products' => $approvedCount,
                    'rejected_products' => $rejectedCount,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process UMKM approval',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get rejection comments for a user's UMKM and products
     */
    public function getRejectionComments(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            \Log::info("Getting rejection comments for user ID: $userId");

            // Get user's UMKM
            $umkm = DB::table('tumkm')->where('user_id', $userId)->first();

            $result = [
                'umkm_comments' => [],
                'product_comments' => []
            ];

            if (!$umkm) {
                \Log::info("No UMKM found for user $userId");
                return response()->json([
                    'success' => true,
                    'data' => $result,
                    'message' => 'No UMKM found for this user'
                ]);
            }

            \Log::info("UMKM found: ID {$umkm->id}, Name: {$umkm->nama_toko}");

            // Get product rejection comments for this user's products
            $productComments = DB::table('product_rejection_comments as prc')
                ->join('tproduk as p', function($join) {
                    $join->on('prc.kodeproduk', '=', DB::raw("CONCAT('P', p.id)"));
                })
                ->where('p.umkm_id', $umkm->id)
                ->select(
                    'prc.*',
                    'p.nama_produk',
                    'p.id as product_id'
                )
                ->orderBy('prc.created_at', 'desc')
                ->get();

            \Log::info("Product comments found: " . $productComments->count());

            $result['product_comments'] = $productComments;

            return response()->json([
                'success' => true,
                'data' => $result
            ], 200);

        } catch (\Exception $e) {
            \Log::error("Error in getRejectionComments: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch rejection comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new product to approved UMKM store
     */
    public function addProduct(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            // Check if user has approved UMKM (using new structure)
            $umkm = DB::table('tumkm')
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->first();

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must have an approved UMKM store to add products'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nama_produk' => 'required|string|max:255',
                'harga' => 'required|numeric|min:0',
                'deskripsi' => 'nullable|string',
                'stok' => 'nullable|integer|min:0',
                'kategori' => 'nullable|string|max:50',
                'gambar' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle image upload
            $gambarPath = null;
            if ($request->hasFile('gambar')) {
                $file = $request->file('gambar');
                $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $request->nama_produk);
                $filename = 'product_' . $umkm->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                
                if (!file_exists(public_path('uploads/products'))) {
                    mkdir(public_path('uploads/products'), 0777, true);
                }
                
                $file->move(public_path('uploads/products'), $filename);
                $gambarPath = 'uploads/products/' . $filename;
            }

            // Create product with pending status (needs admin approval)
            $productId = DB::table('tproduk')->insertGetId([
                'umkm_id' => $umkm->id,
                'nama_produk' => $request->nama_produk,
                'harga' => $request->harga,
                'stok' => $request->stok ?? 0,
                'deskripsi' => $request->deskripsi ?? '',
                'gambar' => $gambarPath,
                'kategori' => $request->kategori ?? 'product',
                'approval_status' => 'pending', // Requires admin approval
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $product = DB::table('tproduk')->where('id', $productId)->first();

            \Log::info("New product added", ['product_id' => $productId, 'umkm_id' => $umkm->id, 'user_id' => $userId]);

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil ditambahkan. Menunggu persetujuan admin.',
                'data' => $product
            ], 201);

        } catch (\Exception $e) {
            \Log::error("Error adding product: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all pending products for admin review
     */
    public function getPendingProducts(Request $request)
    {
        try {
            $products = DB::table('tproduk')
                ->join('tumkm', 'tproduk.umkm_id', '=', 'tumkm.id')
                ->where('tproduk.approval_status', 'pending')
                ->select(
                    'tproduk.id',
                    'tproduk.nama_produk',
                    'tproduk.harga',
                    'tproduk.stok',
                    'tproduk.deskripsi',
                    'tproduk.gambar',
                    'tproduk.kategori',
                    'tproduk.status',
                    'tproduk.approval_status',
                    'tumkm.nama_toko',
                    'tumkm.nama_pemilik',
                    'tumkm.id as umkm_id'
                )
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            \Log::error("Error fetching pending products: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a pending product
     */
    public function approveProduct($id)
    {
        try {
            // Find product by ID (not kodeproduk)
            $product = DB::table('tproduk')->where('id', $id)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            DB::table('tproduk')
                ->where('id', $id)
                ->update([
                    'approval_status' => 'approved',
                    'status' => 'active',
                    'updated_at' => now()
                ]);

            \Log::info("Product approved", ['product_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Product approved successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error("Error approving product: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a pending product with reason
     */
    public function rejectProduct(Request $request, $id)
    {
        try {
            // Find product by ID (not kodeproduk)
            $product = DB::table('tproduk')->where('id', $id)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            \Log::info("Rejecting product", [
                'product_id' => $id,
                'request_data' => $request->all()
            ]);

            $validator = Validator::make($request->all(), [
                'comment' => 'required_without:reason|string|min:10',
                'reason' => 'required_without:comment|string|min:10',
            ]);

            if ($validator->fails()) {
                \Log::warning("Product rejection validation failed", [
                    'errors' => $validator->errors(),
                    'data' => $request->all()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $comment = $request->input('comment') ?? $request->input('reason');
            $adminId = $request->header('X-User-ID', 1);

            // Update product status to inactive (rejected) and approval_status
            DB::table('tproduk')
                ->where('id', $id)
                ->update([
                    'approval_status' => 'rejected',
                    'status' => 'inactive',
                    'updated_at' => now()
                ]);

            // Save rejection comment
            DB::table('product_rejection_comments')->insert([
                'kodeproduk' => 'P' . $id,
                'kodepengguna' => 'U' . ($product->umkm_id ?? 0),
                'comment' => $comment,
                'status' => 'rejected',
                'admin_id' => $adminId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            \Log::info("Product rejected successfully", ['product_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Product rejected successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error("Error rejecting product: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product rejection reasons for a user
     * Get rejection reasons for a user's products
     */
    public function getProductRejectionReasons(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            $kodepengguna = 'U' . str_pad($userId, 3, '0', STR_PAD_LEFT);

            $rejections = DB::table('product_rejection_reasons')
                ->join('tproduk', 'product_rejection_reasons.kodeproduk', '=', 'tproduk.kodeproduk')
                ->where('tproduk.kodepengguna', $kodepengguna)
                ->select(
                    'product_rejection_reasons.id',
                    'product_rejection_reasons.kodeproduk',
                    'tproduk.namaproduk as product_name',
                    'product_rejection_reasons.reason',
                    'product_rejection_reasons.created_at'
                )
                ->orderBy('product_rejection_reasons.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $rejections
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch rejection reasons',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resubmit rejected product for review
     */
    public function resubmitProduct(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nama_produk' => 'required|string|max:255',
                'deskripsi' => 'required|string',
                'harga' => 'required|numeric|min:0',
                'kategori' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = DB::table('tproduk')->where('id', $id)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Check if product belongs to user's UMKM
            $userId = $request->header('X-User-ID');
            $umkm = DB::table('tumkm')->where('user_id', $userId)->first();

            if (!$umkm || $product->umkm_id != $umkm->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if product is rejected/inactive (check both status and approval_status)
            $currentStatus = !empty($product->approval_status) ? $product->approval_status : $product->status;
            
            \Log::info("Resubmit attempt", [
                'product_id' => $id,
                'status' => $product->status,
                'approval_status' => $product->approval_status,
                'currentStatus' => $currentStatus
            ]);
            
            if (!in_array($currentStatus, ['rejected', 'inactive'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only rejected products can be resubmitted',
                    'debug' => [
                        'current_status' => $currentStatus,
                        'status' => $product->status,
                        'approval_status' => $product->approval_status
                    ]
                ], 400);
            }

            // Update product data
            $updateData = [
                'nama_produk' => $request->input('nama_produk'),
                'deskripsi' => $request->input('deskripsi'),
                'harga' => $request->input('harga'),
                'kategori' => $request->input('kategori'),
                'approval_status' => 'pending', // Set back to pending for review
                'status' => 'active', // Set status as active
                'updated_at' => now()
            ];

            // Handle image upload if provided
            if ($request->hasFile('gambar')) {
                $file = $request->file('gambar');
                $filename = 'product_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
                
                if (!file_exists(public_path('uploads/products'))) {
                    mkdir(public_path('uploads/products'), 0777, true);
                }
                
                // Delete old image if exists
                if ($product->gambar && file_exists(public_path($product->gambar))) {
                    unlink(public_path($product->gambar));
                }
                
                $file->move(public_path('uploads/products'), $filename);
                $updateData['gambar'] = 'uploads/products/' . $filename;
            }

            DB::table('tproduk')->where('id', $id)->update($updateData);

            // Delete rejection comments since product is being resubmitted with fixes
            $kodeProduk = 'P' . $id;
            $deletedComments = DB::table('product_rejection_comments')
                ->where('kodeproduk', $kodeProduk)
                ->delete();

            \Log::info("Product resubmitted for review", [
                'product_id' => $id, 
                'user_id' => $userId,
                'deleted_comments' => $deletedComments
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil dikirim ulang untuk ditinjau admin'
            ]);

        } catch (\Exception $e) {
            \Log::error("Error resubmitting product: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to resubmit product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk approve UMKM stores
     */
    public function bulkApprove(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'store_ids' => 'required|array|min:1',
                'store_ids.*' => 'required|integer|exists:tumkm,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $storeIds = $request->store_ids;
            $approvedCount = 0;

            foreach ($storeIds as $storeId) {
                $umkm = Tumkm::find($storeId);
                if ($umkm && $umkm->status === 'pending') {
                    $umkm->update(['status' => 'active']);
                    $approvedCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "{$approvedCount} toko UMKM berhasil disetujui",
                'data' => [
                    'approved_count' => $approvedCount
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk approve UMKM stores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk reject UMKM stores with comment
     */
    public function bulkReject(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'store_ids' => 'required|array|min:1',
                'store_ids.*' => 'required|integer|exists:tumkm,id',
                'reason' => 'required|string|min:10',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $storeIds = $request->store_ids;
            $reason = $request->reason;
            $rejectedCount = 0;
            $adminId = $request->header('X-User-ID', 1);

            foreach ($storeIds as $storeId) {
                $umkm = Tumkm::find($storeId);
                if ($umkm && $umkm->status === 'pending') {
                    // Update status to rejected
                    $umkm->update(['status' => 'rejected']);

                    // Save rejection comment
                    DB::table('umkm_rejection_comments')->insert([
                        'umkm_id' => $umkm->id,
                        'comment' => $reason,
                        'admin_id' => $adminId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $rejectedCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "{$rejectedCount} toko UMKM berhasil ditolak",
                'data' => [
                    'rejected_count' => $rejectedCount
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk reject UMKM stores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update UMKM store image (admin only)
    public function updateImage(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'foto_toko' => 'required|string|max:5000000'
            ]);

            $umkm = Tumkm::find($id);

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'UMKM store not found'
                ], 404);
            }

            $umkm->foto_toko = $validated['foto_toko'];
            $umkm->save();

            return response()->json([
                'success' => true,
                'message' => 'UMKM store image updated successfully',
                'data' => $umkm
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update UMKM store image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete UMKM store and all its products (admin only)
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $umkm = Tumkm::find($id);

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'UMKM store not found'
                ], 404);
            }

            \Log::info("Deleting UMKM ID: {$id}, Name: {$umkm->nama_toko}");

            // Delete associated products first
            $deletedProducts = DB::table('tproduk')->where('umkm_id', $umkm->id)->delete();
            \Log::info("Deleted {$deletedProducts} products");

            // Delete UMKM rejection comments if table exists
            try {
                DB::table('umkm_rejection_comments')->where('umkm_id', $umkm->id)->delete();
            } catch (\Exception $e) {
                \Log::warning("Could not delete umkm_rejection_comments: " . $e->getMessage());
            }

            // Delete product rejection comments if table exists
            try {
                DB::table('product_rejection_comments')->where('kodepengguna', 'U' . $umkm->user_id)->delete();
            } catch (\Exception $e) {
                \Log::warning("Could not delete product_rejection_comments: " . $e->getMessage());
            }

            // Delete the UMKM store
            $umkm->delete();
            \Log::info("UMKM deleted successfully");

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'UMKM store and all products deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Error deleting UMKM: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete UMKM store',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

