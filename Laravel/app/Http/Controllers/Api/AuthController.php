<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Admin;
use App\Services\WhatsAppOtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppOtpService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|unique:users',
                'telepon' => 'required|string|unique:users|max:20',
                'password' => 'required|string|min:6|confirmed',
                'alamat' => 'nullable|string|max:255',
                'kota' => 'nullable|string|max:100',
                'kode_pos' => 'nullable|string|max:10',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'telepon' => $validated['telepon'],
                'password' => Hash::make($validated['password']),
                'alamat' => $validated['alamat'] ?? null,
                'kota' => $validated['kota'] ?? null,
                'kode_pos' => $validated['kode_pos'] ?? null,
                'role' => 'user',
                'status' => 'active'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => $user
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error_type' => get_class($e)
            ], 500);
        }
    }

    // Login untuk user biasa (email atau telepon) atau admin
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'credential' => 'required|string',
                'password' => 'required|string',
            ]);

            $credential = $validated['credential'];

            // Try modern users table first
            $user = null;
            if (strpos($credential, '@') !== false) {
                $user = User::where('email', $credential)->first();
            } else {
                $user = User::where('no_telepon', $credential)->first();
            }

            if ($user) {
                // Verify password
                if (!Hash::check($validated['password'], $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Password salah'
                    ], 401);
                }

                // Check status
                if ($user->status !== 'active') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akun Anda tidak aktif. Hubungi admin.'
                    ], 403);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Login berhasil',
                    'data' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'nama_lengkap' => $user->nama_lengkap,
                        'name' => $user->nama_lengkap,
                        'no_telepon' => $user->no_telepon,
                        'role' => $user->role,
                        'status' => $user->status,
                        'wa_verified' => $user->wa_verified,
                    ]
                ], 200);
            }

            // Try admin table (tadmin)
            $admin = DB::table('tadmin')
                ->where(function($query) use ($credential) {
                    $query->where('email', $credential)
                          ->orWhere('username', $credential);
                })
                ->first();

            if ($admin) {
                if (!password_verify($validated['password'], $admin->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Password salah'
                    ], 401);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Login admin berhasil',
                    'data' => [
                        'id' => $admin->id,
                        'email' => $admin->email,
                        'nama_lengkap' => $admin->nama,
                        'name' => $admin->nama,
                        'no_telepon' => null,
                        'role' => 'admin',
                        'status' => 'active',
                        'wa_verified' => true,
                    ]
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Email/Telepon atau password salah'
            ], 401);

        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Login error: ' . $e->getMessage()
            ], 500);
        }
    }

    // Login khusus untuk admin
    public function loginAdmin(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('email', $validated['email'])->first();

        if (!$admin || !Hash::check($validated['password'], $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        if (!$admin->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun admin tidak aktif'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login admin berhasil',
            'data' => [
                'admin' => [
                    'id' => $admin->id,
                    'nama' => $admin->nama,
                    'email' => $admin->email,
                    'is_active' => $admin->is_active,
                ],
                'role' => 'admin',
            ]
        ], 200);
    }

    public function getProfile(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            // Try legacy tpengguna first
            $user = DB::table('tpengguna')
                ->where('kodepengguna', $userId)
                ->first();

            if ($user) {
                $umkm = DB::table('tumkm')
                    ->where('kodepengguna', $user->kodepengguna)
                    ->first();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $user->kodepengguna,
                        'nama_lengkap' => $user->namapengguna,
                        'name' => $user->namapengguna,
                        'email' => $user->namapengguna . '@umkm.local',
                        'no_telepon' => $user->teleponpengguna,
                        'role' => $umkm ? 'umkm_owner' : 'user',
                        'status' => $user->status,
                        'wa_verified' => true,
                    ]
                ], 200);
            }

            // Try legacy tadmin
            $admin = DB::table('tadmin')
                ->where('kodeadmin', $userId)
                ->first();

            if ($admin) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $admin->kodeadmin,
                        'nama_lengkap' => $admin->namaadmin,
                        'name' => $admin->namaadmin,
                        'email' => $admin->namaadmin . '@admin.umkm',
                        'no_telepon' => null,
                        'role' => 'admin',
                        'status' => $admin->status,
                        'wa_verified' => true,
                    ]
                ], 200);
            }

            // Try modern User table
            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'name' => $user->nama_lengkap,
                    'email' => $user->email,
                    'no_telepon' => $user->no_telepon,
                    'role' => $user->role,
                    'status' => $user->status,
                    'wa_verified' => $user->wa_verified,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validated = $request->validate([
                'nama' => 'nullable|string|max:25',
                'email' => 'nullable|email|unique:users,email,' . $userId . ',id',
                'telepon' => 'nullable|string|unique:users,telepon,' . $userId . ',id|max:20',
                'alamat' => 'nullable|string|max:255',
                'kota' => 'nullable|string|max:100',
                'kode_pos' => 'nullable|string|max:10',
            ]);

            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error_type' => get_class($e)
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }

    /**
     * Send OTP ke nomor WhatsApp untuk register user
     * Mengembalikan OTP code + wa.me link (user klik sendiri)
     */
    public function sendOtpRegister(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_whatsapp' => 'required|string|regex:/^62[0-9]{9,12}$/',
            ]);

            // CHECK DULU: Apakah nomor WA sudah terdaftar?
            $existingUser = User::where('no_telepon', $validated['no_whatsapp'])
                ->first();

            if ($existingUser) {
                \Log::warning("Phone number already registered", [
                    'phone' => $validated['no_whatsapp'],
                    'user_id' => $existingUser->id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Nomor WhatsApp sudah terdaftar. Silakan login dengan akun Anda.',
                    'error_code' => 'PHONE_ALREADY_REGISTERED'
                ], 409); // 409 Conflict
            }

            // Nomor belum terdaftar, generate OTP
            $result = $this->whatsappService->generateOtp($validated['no_whatsapp'], 'user');

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 400);
            }

            // Generate message dan wa.me link
            $message = $this->whatsappService->generateRegistrationMessage($result['code']);
            $waLink = $this->whatsappService->generateWhatsAppLink($validated['no_whatsapp'], $message);

            return response()->json([
                'success' => true,
                'message' => 'OTP generated. Click button to send via WhatsApp.',
                'data' => [
                    'code' => $result['code'],
                    'phone_number' => $validated['no_whatsapp'],
                    'wa_link' => $waLink,
                    'message' => $message,
                    'expires_in_minutes' => 5,
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP user
     */
    public function verifyOtpRegister(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_whatsapp' => 'required|string',
                'code' => 'required|string|size:6',
                'email' => 'required|email',
                'nama' => 'required|string|max:255',
                'password' => 'required|string|min:6',
                'type' => 'required|in:user,business', // user atau business/umkm
            ]);

            \Log::info("Starting verifyOtpRegister", [
                'email' => $validated['email'],
                'phone' => $validated['no_whatsapp'],
                'type' => $validated['type']
            ]);

            // Check if user already exists BEFORE OTP verification
            $existingUser = User::where('email', $validated['email'])
                ->orWhere('no_telepon', $validated['no_whatsapp'])
                ->first();

            if ($existingUser) {
                \Log::info("User already exists, returning existing user", ['email' => $validated['email']]);
                return response()->json([
                    'success' => true,
                    'message' => 'Akun sudah terdaftar, silakan login',
                    'data' => [
                        'id' => $existingUser->id,
                        'email' => $existingUser->email,
                        'nama_lengkap' => $existingUser->nama_lengkap,
                        'no_telepon' => $existingUser->no_telepon,
                    ]
                ], 200);
            }

            // Verify OTP
            $result = $this->whatsappService->verifyOtp($validated['no_whatsapp'], $validated['code'], $validated['type']);

            if (!$result['success']) {
                \Log::warning("OTP verification failed", ['phone' => $validated['no_whatsapp']]);
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 400);
            }

            \Log::info("OTP verified, creating user...");

            // Create user setelah OTP verified - Use DB transaction
            \DB::beginTransaction();

            try {
                $hashedPassword = Hash::make($validated['password']);
                \Log::info("Password hashed successfully");

                $user = User::create([
                    'nama_lengkap' => $validated['nama'],
                    'email' => $validated['email'],
                    'no_telepon' => $validated['no_whatsapp'],
                    'password' => $hashedPassword,
                    'role' => $validated['type'] === 'business' ? 'umkm_owner' : 'customer',
                    'status' => 'active',
                    'wa_verified' => true
                ]);

                if (!$user) {
                    throw new \Exception('User::create returned null');
                }

                \DB::commit();
                \Log::info("✅ User created successfully", [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'nama_lengkap' => $user->nama_lengkap
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Akun berhasil dibuat dan OTP terverifikasi',
                    'data' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'nama_lengkap' => $user->nama_lengkap,
                        'no_telepon' => $user->no_telepon,
                        'role' => $user->role,
                    ]
                ], 201);

            } catch (\Exception $dbError) {
                \DB::rollBack();
                \Log::error("Database transaction failed", [
                    'error' => $dbError->getMessage(),
                    'trace' => $dbError->getTraceAsString()
                ]);
                throw $dbError;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error("Validation error in verifyOtpRegister", ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error("Error in verifyOtpRegister", [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
