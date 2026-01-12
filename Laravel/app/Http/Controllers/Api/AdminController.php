<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * GET /api/admin/admins
     * List semua admin
     */
    public function index()
    {
        $admins = Admin::select('id', 'email', 'nama', 'is_active', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $admins
        ], 200);
    }

    /**
     * POST /api/admin/admins
     * Buat admin baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:admins,email',
            'password' => 'required|string|min:6',
            'is_active' => 'boolean'
        ]);

        $admin = Admin::create([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil dibuat',
            'data' => [
                'id' => $admin->id,
                'nama' => $admin->nama,
                'email' => $admin->email,
                'is_active' => $admin->is_active,
            ]
        ], 201);
    }

    /**
     * GET /api/admin/admins/{id}
     * Detail admin
     */
    public function show($id)
    {
        $admin = Admin::select('id', 'email', 'nama', 'is_active', 'created_at', 'updated_at')
            ->find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $admin
        ], 200);
    }

    /**
     * PUT /api/admin/admins/{id}
     * Update admin (nama, email, password optional)
     */
    public function update(Request $request, $id)
    {
        $admin = Admin::find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'nama' => 'sometimes|string|max:100',
            'email' => [
                'sometimes',
                'email',
                'max:100',
                Rule::unique('admins', 'email')->ignore($id)
            ],
            'password' => 'sometimes|string|min:6'
        ]);

        if (isset($validated['nama'])) {
            $admin->nama = $validated['nama'];
        }

        if (isset($validated['email'])) {
            $admin->email = $validated['email'];
        }

        if (isset($validated['password'])) {
            $admin->password = Hash::make($validated['password']);
        }

        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil diupdate',
            'data' => [
                'id' => $admin->id,
                'nama' => $admin->nama,
                'email' => $admin->email,
                'is_active' => $admin->is_active,
            ]
        ], 200);
    }

    /**
     * PATCH /api/admin/admins/{id}/toggle-status
     * Aktifkan/nonaktifkan admin
     */
    public function toggleStatus($id)
    {
        $admin = Admin::find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin tidak ditemukan'
            ], 404);
        }

        // Cek jika admin terakhir yang aktif
        $activeAdminsCount = Admin::where('is_active', true)->count();
        if ($admin->is_active && $activeAdminsCount <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menonaktifkan admin terakhir'
            ], 400);
        }

        $admin->is_active = !$admin->is_active;
        $admin->save();

        return response()->json([
            'success' => true,
            'message' => $admin->is_active ? 'Admin diaktifkan' : 'Admin dinonaktifkan',
            'data' => [
                'id' => $admin->id,
                'nama' => $admin->nama,
                'email' => $admin->email,
                'is_active' => $admin->is_active,
            ]
        ], 200);
    }

    /**
     * DELETE /api/admin/admins/{id}
     * Hapus admin (soft delete dengan set is_active = false)
     */
    public function destroy($id)
    {
        $admin = Admin::find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin tidak ditemukan'
            ], 404);
        }

        // Cek jika admin terakhir yang aktif
        $activeAdminsCount = Admin::where('is_active', true)->count();
        if ($admin->is_active && $activeAdminsCount <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus admin terakhir'
            ], 400);
        }

        // Soft delete dengan set is_active = false
        $admin->is_active = false;
        $admin->save();

        // Atau hard delete: $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin berhasil dinonaktifkan'
        ], 200);
    }

    /**
     * GET /api/admin/users
     * List semua users dari database
     */
    public function getAllUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ], 200);
    }

    /**
     * PUT /api/admin/users/{id}/role
     * Update role user
     */
    public function updateUserRole(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'role' => 'required|in:customer,umkm_owner,admin'
        ]);

        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Role user berhasil diupdate',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 200);
    }

    /**
     * GET /api/admin/users
     * Get all users from database
     */
    public function users()
    {
        try {
            $users = User::select(
                'id',
                'nama_lengkap as name',
                'email',
                'no_telepon',
                'role',
                'status',
                'created_at'
            )
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
