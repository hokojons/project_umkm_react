<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Umkm;
use App\Models\Tumkm;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UmkmApiController extends Controller
{
    /**
     * Get all active UMKM with their products
     */
    public function index()
    {
        try {
            \Log::info('=== UMKM Index API Called ===');
            
            $umkmList = DB::table('tumkm')
                ->leftJoin('users', 'tumkm.user_id', '=', 'users.id')
                ->where('tumkm.status', 'active')
                ->select(
                    'tumkm.id',
                    'tumkm.nama_toko',
                    'tumkm.nama_pemilik',
                    'tumkm.deskripsi',
                    'tumkm.foto_toko',
                    'tumkm.status',
                    'tumkm.alamat',
                    'tumkm.kota',
                    'tumkm.whatsapp',
                    'tumkm.telepon',
                    'tumkm.email',
                    'tumkm.instagram',
                    'users.nama_lengkap'
                )
                ->get();

            \Log::info('UMKM Query Result Count: ' . $umkmList->count());
            
            // Check if there are any active UMKM in database
            $totalActive = DB::table('tumkm')->where('status', 'active')->count();
            \Log::info('Total Active UMKM in DB: ' . $totalActive);
            
            // Get products for each UMKM from tproduk
            $umkmWithProducts = $umkmList->map(function ($item) {
                $products = DB::table('tproduk')
                    ->where('umkm_id', $item->id)
                    ->where('status', 'active')
                    ->select(
                        'id',
                        'nama_produk',
                        'harga',
                        'stok',
                        'deskripsi',
                        'gambar',
                        'kategori'
                    )
                    ->get();

                $item->products = $products;
                $item->rating = 5; // Default rating
                $item->instagram = null;
                return $item;
            });

            \Log::info('Final UMKM with Products Count: ' . $umkmWithProducts->count());

            return response()->json([
                'success' => true,
                'data' => $umkmWithProducts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch UMKM data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single UMKM by ID
     */
    public function show($id)
    {
        try {
            $umkm = DB::table('umkm')
                ->join('users', 'umkm.user_id', '=', 'users.id')
                ->where('umkm.id', $id)
                ->select(
                    'umkm.*',
                    'users.nama_lengkap as nama_pemilik',
                    'users.no_telepon'
                )
                ->first();

            if (!$umkm) {
                return response()->json([
                    'success' => false,
                    'message' => 'UMKM not found'
                ], 404);
            }

            // Get products
            $products = DB::table('products')
                ->where('umkm_id', $id)
                ->where('status', 'active')
                ->get();

            $umkm->products = $products;

            return response()->json([
                'success' => true,
                'data' => $umkm
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch UMKM data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products by UMKM ID
     */
    public function products($umkmId)
    {
        try {
            $products = DB::table('products')
                ->where('umkm_id', $umkmId)
                ->where('status', 'active')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending UMKM stores (for admin approval)
     */
    public function pending()
    {
        try {
            // Use Eloquent with proper relationships - only fetch active/pending products
            $pendingUmkm = Tumkm::with(['user', 'category', 'activeProducts'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get();

            // Map to expected format
            $pendingWithProducts = $pendingUmkm->map(function ($umkm) {
                return [
                    'id' => $umkm->id,
                    'user_id' => $umkm->user_id,
                    'nama_toko' => $umkm->nama_toko,
                    'nama_pemilik' => $umkm->nama_pemilik,
                    'alamat_toko' => $umkm->alamat ?? $umkm->deskripsi,
                    'deskripsi' => $umkm->deskripsi,
                    'foto_toko' => $umkm->foto_toko,
                    'kategori_id' => $umkm->kategori_id,
                    'status' => $umkm->status,
                    'whatsapp' => $umkm->whatsapp,
                    'telepon' => $umkm->telepon,
                    'email' => $umkm->email,
                    'instagram' => $umkm->instagram,
                    'about_me' => $umkm->about_me,
                    'created_at' => $umkm->created_at,
                    'user' => [
                        'name' => $umkm->user->nama_lengkap ?? $umkm->nama_pemilik,
                        'email' => $umkm->user->email ?? null,
                        'phone' => $umkm->user->no_telepon ?? $umkm->telepon ?? 'N/A'
                    ],
                    'category' => [
                        'id' => $umkm->category->id ?? null,
                        'nama_kategori' => $umkm->category->nama_kategori ?? 'Unknown'
                    ],
                    'products' => $umkm->activeProducts->map(function($product) {
                        return [
                            'id' => $product->id,
                            'nama_produk' => $product->nama_produk,
                            'harga' => $product->harga,
                            'stok' => $product->stok,
                            'deskripsi' => $product->deskripsi,
                            'gambar' => $product->gambar,
                            'kategori' => $product->kategori,
                            'status' => $product->status,
                        ];
                    })
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $pendingWithProducts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending UMKM',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get UMKM by user (for user's own dashboard - includes all statuses)
     */
    public function getUserUmkm(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');
            
            \Log::info('=== getUserUmkm Called ===', ['user_id' => $userId]);
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            // Query from modern tumkm table using user_id
            $umkmList = DB::table('tumkm')
                ->leftJoin('users', 'tumkm.user_id', '=', 'users.id')
                ->where('tumkm.user_id', $userId)
                ->select(
                    'tumkm.id',
                    'tumkm.user_id',
                    'tumkm.nama_toko',
                    'tumkm.nama_pemilik',
                    'tumkm.deskripsi',
                    'tumkm.foto_toko',
                    'tumkm.kategori_id',
                    'tumkm.whatsapp',
                    'tumkm.instagram',
                    'tumkm.about_me',
                    'tumkm.status'
                )
                ->get();

            // Get products for each UMKM
            $umkmWithProducts = $umkmList->map(function ($item) use ($userId) {
                // Get products from modern tproduk table
                $products = DB::table('tproduk')
                    ->where('umkm_id', $item->id)
                    ->select(
                        'id',
                        'nama_produk',
                        'harga',
                        'stok',
                        'deskripsi',
                        'gambar',
                        'kategori',
                        'status',
                        'approval_status'
                    )
                    ->get();

                return [
                    'id' => $item->id,
                    'user_id' => $userId,
                    'nama_toko' => $item->nama_toko,
                    'nama_pemilik' => $item->nama_pemilik,
                    'deskripsi' => $item->deskripsi,
                    'foto_toko' => $item->foto_toko,
                    'kategori_id' => $item->kategori_id,
                    'whatsapp' => $item->whatsapp,
                    'instagram' => $item->instagram,
                    'about_me' => $item->about_me,
                    'status' => $item->status,
                    'category' => [
                        'nama_kategori' => 'General'
                    ],
                    'products' => $products
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $umkmWithProducts
            ]);

        } catch (\Exception $e) {
            \Log::error('getUserUmkm Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user UMKM',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
