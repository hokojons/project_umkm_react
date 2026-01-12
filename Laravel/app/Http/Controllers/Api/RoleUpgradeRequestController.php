<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessSubmission;
use App\Models\Tumkm;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleUpgradeRequestController extends Controller
{
    // Get pending requests for admin
    public function getPending()
    {
        $requests = BusinessSubmission::with(['user', 'category'])
            ->where('statuspengajuan', 'pending')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ], 200);
    }

    // Check if user has existing request
    public function checkUserRequest($userId)
    {
        // userId is from users.id, not kodepengguna
        // So we need to generate kodepengguna from userId
        $kodepengguna = 'U' . str_pad($userId, 3, '0', STR_PAD_LEFT);
        
        // Check in tumkm table (actual UMKM submissions)
        $umkmRequest = Tumkm::where('kodepengguna', $kodepengguna)->first();

        if ($umkmRequest) {
            // Get category name
            $category = \DB::table('tkategori')
                ->where('kodekategori', $umkmRequest->kodekategori)
                ->first();
            
            // Get products
            $products = \DB::table('tproduk')
                ->where('kodepengguna', $kodepengguna)
                ->select(
                    'kodeproduk as id',
                    'namaproduk as nama_produk',
                    'harga',
                    'stok',
                    'detail as deskripsi',
                    'gambarproduk as gambar'
                )
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $umkmRequest->kodepengguna,
                    'nama_toko' => $umkmRequest->namatoko,
                    'nama_pemilik' => $umkmRequest->namapemilik,
                    'alamat_toko' => $umkmRequest->alamattoko,
                    'foto_toko' => $umkmRequest->fototoko,
                    'status' => $umkmRequest->statuspengajuan,
                    'kategori' => $category->namakategori ?? 'Unknown',
                    'products' => $products
                ]
            ], 200);
        }
        
        // Fallback: check old BusinessSubmission table
        $request = BusinessSubmission::where('kodepengguna', $kodepengguna)->first();

        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'No request found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $request
        ], 200);
    }

    // Submit or update request
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'nama_pemilik' => 'required|string|max:100',
            'nama_toko' => 'required|string|max:100',
            'alamat_toko' => 'required|string|max:200',
            'alasan_pengajuan' => 'nullable|string',
            'kategori_id' => 'required|integer|exists:categories,id',
        ]);

        // Generate kodepengguna from user_id
        $kodepengguna = 'U' . str_pad($validated['user_id'], 3, '0', STR_PAD_LEFT);
        
        // Get user data from users table
        $user = \DB::table('users')->where('id', $validated['user_id'])->first();
        
        // Note: tpengguna table is now for event visitors only
        // No need to insert into tpengguna for business submissions
        
        // Check if user already has a request
        $existingRequest = BusinessSubmission::where('kodepengguna', $kodepengguna)->first();

        if ($existingRequest) {
            // Check if already approved (user is already UMKM)
            if ($existingRequest->statuspengajuan === 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah memiliki UMKM yang telah disetujui'
                ], 422);
            }

            // Update existing request
            $existingRequest->update([
                'namapemilik' => $validated['nama_pemilik'],
                'namatoko' => $validated['nama_toko'],
                'alamattoko' => $validated['alamat_toko'],
                'kodekategori' => (string)$validated['kategori_id'],
                'statuspengajuan' => 'pending' // Reset to pending
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan UMKM berhasil diperbarui',
                'data' => $existingRequest
            ], 200);
        }

        // New request
        $roleRequest = BusinessSubmission::create([
            'kodepengguna' => $kodepengguna,
            'namapemilik' => $validated['nama_pemilik'],
            'namatoko' => $validated['nama_toko'],
            'alamattoko' => $validated['alamat_toko'],
            'kodekategori' => (string)$validated['kategori_id'],
            'statuspengajuan' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan UMKM berhasil diajukan',
            'data' => $roleRequest
        ], 201);
    }

    // Approve request
    public function approve($userId)
    {
        // Generate kodepengguna from userId
        $kodepengguna = 'U' . str_pad($userId, 3, '0', STR_PAD_LEFT);
        
        $roleRequest = BusinessSubmission::where('kodepengguna', $kodepengguna)->first();

        if (!$roleRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found'
            ], 404);
        }

        // Update request status
        $roleRequest->update(['statuspengajuan' => 'approved']);

        // Update user role (use userId from parameter, not kodepengguna)
        $user = User::find($userId);
        if ($user && $user->role !== 'umkm_owner') {
            $user->update(['role' => 'umkm_owner']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Request approved successfully'
        ], 200);
    }

    // Reject request
    public function reject($userId)
    {
        // Generate kodepengguna from userId
        $kodepengguna = 'U' . str_pad($userId, 3, '0', STR_PAD_LEFT);
        
        $roleRequest = BusinessSubmission::where('kodepengguna', $kodepengguna)->first();

        if (!$roleRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found'
            ], 404);
        }

        $roleRequest->update(['statuspengajuan' => 'rejected']);

        return response()->json([
            'success' => true,
            'message' => 'Request rejected'
        ], 200);
    }
}
