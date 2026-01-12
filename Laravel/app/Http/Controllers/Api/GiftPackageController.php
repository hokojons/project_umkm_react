<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GiftPackageController extends Controller
{
    public function index()
    {
        try {
            $packages = DB::table('tproduk')
                ->where('kategori', 'Paket')
                ->where('status', 'active')
                ->orderBy('id', 'desc')
                ->get();

            $formattedPackages = $packages->map(function ($package) {
                // Parse items from description
                $items = [];
                if ($package->deskripsi) {
                    // Try to extract items if formatted as "Paket berisi:\n- item1\n- item2"
                    if (strpos($package->deskripsi, 'Paket berisi:') !== false) {
                        $parts = explode('Paket berisi:', $package->deskripsi);
                        if (count($parts) > 1) {
                            $itemsText = trim($parts[1]);
                            $lines = preg_split('/\r\n|\r|\n/', $itemsText);
                            foreach ($lines as $line) {
                                $trimmed = trim($line);
                                // Remove leading dash and trim again
                                if (strpos($trimmed, '-') === 0) {
                                    $item = trim(substr($trimmed, 1));
                                    if (!empty($item)) {
                                        $items[] = $item;
                                    }
                                }
                            }
                        }
                    }
                }
                
                return [
                    'id' => $package->id,
                    'name' => $package->nama_produk,
                    'description' => $package->deskripsi ?? '',
                    'price' => (float) $package->harga,
                    'stok' => (int) ($package->stok ?? 0),
                    'category' => 'Paket',
                    'image' => $package->gambar ?? 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
                    'items' => $items, // Always return array
                    'createdAt' => $package->created_at ?? now()->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedPackages,
            ]);
        } catch (\Exception $e) {
            \Log::error('Gift Package Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data paket hadiah: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // First check if it's a file upload
            if ($request->hasFile('image')) {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'price' => 'required|numeric|min:0',
                    'stok' => 'required|integer|min:0',
                    'category' => 'nullable|string|max:50',
                    'image' => 'nullable|file|image|max:2048',
                    'items' => 'nullable|array',
                ]);
                
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/gift-packages'), $filename);
                $imagePath = 'uploads/gift-packages/' . $filename;
            } else {
                // If no file, expect string (URL or base64)
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'price' => 'required|numeric|min:0',
                    'stok' => 'required|integer|min:0',
                    'category' => 'nullable|string|max:50',
                    'image' => 'nullable|string',
                    'items' => 'nullable|array',
                ]);
                
                $imagePath = $validated['image'] ?? 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400';
            }

            // Get first UMKM or create with NULL
            $firstUmkm = DB::table('tumkm')->where('status', 'active')->first();
            $umkmId = $firstUmkm ? $firstUmkm->id : 1;

            // Prepare items description
            $itemsDescription = '';
            if (isset($validated['items']) && is_array($validated['items'])) {
                $itemsDescription = "Paket berisi:\n- " . implode("\n- ", $validated['items']);
            } else {
                $itemsDescription = $validated['description'];
            }

            $insertId = DB::table('tproduk')->insertGetId([
                'umkm_id' => $umkmId,
                'nama_produk' => $validated['name'],
                'deskripsi' => $itemsDescription,
                'harga' => $validated['price'],
                'stok' => $validated['stok'],
                'gambar' => $imagePath,
                'status' => 'active',
                'kategori' => 'Paket',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Paket hadiah berhasil dibuat', 
                'data' => ['id' => $insertId]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Gift Package Store Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false, 
                'message' => 'Gagal membuat paket hadiah: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // First check if it's a file upload
            if ($request->hasFile('image')) {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'price' => 'required|numeric|min:0',
                    'stok' => 'required|integer|min:0',
                    'category' => 'nullable|string|max:50',
                    'image' => 'nullable|file|image|max:2048',
                    'items' => 'nullable|array',
                ]);
                
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/gift-packages'), $filename);
                $imagePath = 'uploads/gift-packages/' . $filename;
            } else {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'price' => 'required|numeric|min:0',
                    'stok' => 'required|integer|min:0',
                    'category' => 'nullable|string|max:50',
                    'image' => 'nullable|string',
                    'items' => 'nullable|array',
                ]);
                
                $imagePath = $validated['image'] ?? null;
            }

            // Prepare items description
            $itemsDescription = '';
            if (isset($validated['items']) && is_array($validated['items']) && count($validated['items']) > 0) {
                $itemsDescription = "Paket berisi:\n- " . implode("\n- ", $validated['items']);
            } else {
                $itemsDescription = $validated['description'];
            }

            // Handle file upload if provided
            $updateData = [
                'nama_produk' => $validated['name'],
                'deskripsi' => $itemsDescription,
                'harga' => $validated['price'],
                'stok' => $validated['stok'],
                'kategori' => 'Paket',
                'updated_at' => now(),
            ];

            // Add image if provided
            if ($imagePath) {
                $updateData['gambar'] = $imagePath;
            }

            $updated = DB::table('tproduk')
                ->where('id', $id)
                ->where('kategori', 'Paket')
                ->update($updateData);

            if (!$updated) {
                return response()->json(['success' => false, 'message' => 'Paket hadiah tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'message' => 'Paket hadiah berhasil diupdate']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Gift Package Update Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal mengupdate paket hadiah: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = DB::table('tproduk')
                ->where('id', $id)
                ->where('kategori', 'Paket')
                ->delete();

            if (!$deleted) {
                return response()->json(['success' => false, 'message' => 'Paket hadiah tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'message' => 'Paket hadiah berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal menghapus paket hadiah: ' . $e->getMessage()], 500);
        }
    }
}
