<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use App\Services\WhatsAppOtpService;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppOtpService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }
    public function index()
    {
        $businesses = Business::with(['user', 'category', 'products'])
            ->where('status', 'approved')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $businesses
        ], 200);
    }

    public function show($userId)
    {
        $business = Business::with(['user', 'category', 'products'])
            ->where('user_id', $userId)
            ->first();

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $business
        ], 200);
    }

    public function store(Request $request)
    {
        // Check if user already has a business application
        $existingBusiness = Business::where('user_id', $request->user_id)->first();

        if ($existingBusiness) {
            // If already approved, cannot submit again
            if ($existingBusiness->status === 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah memiliki UMKM yang telah disetujui'
                ], 422);
            }

            // If pending or rejected, allow to update the application
            $validated = $request->validate([
                'user_id' => 'required|string|exists:users,id',
                'nama_pemilik' => 'required|string|max:25',
                'nama_bisnis' => 'required|string|max:50',
                'alamat' => 'required|string|max:100',
                'alasan_pengajuan' => 'nullable|string',
                'category_id' => 'required|string|exists:categories,id',
            ]);

            $existingBusiness->update([
                ...$validated,
                'status' => 'pending' // Reset to pending
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan UMKM berhasil diperbarui',
                'data' => $existingBusiness
            ], 200);
        }

        // New application
        $validated = $request->validate([
            'user_id' => 'required|string|unique:businesses,user_id|exists:users,id',
            'nama_pemilik' => 'required|string|max:25',
            'nama_bisnis' => 'required|string|max:50',
            'alamat' => 'required|string|max:100',
            'alasan_pengajuan' => 'nullable|string',
            'category_id' => 'required|string|exists:categories,id',
        ]);

        $business = Business::create([
            ...$validated,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan UMKM berhasil diajukan',
            'data' => $business
        ], 201);
    }

    public function update(Request $request, $userId)
    {
        $business = Business::where('user_id', $userId)->first();

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found'
            ], 404);
        }

        $validated = $request->validate([
            'nama_pemilik' => 'sometimes|string|max:25',
            'nama_bisnis' => 'sometimes|string|max:50',
            'alamat' => 'sometimes|string|max:100',
            'category_id' => 'sometimes|string|exists:categories,id',
        ]);

        $business->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Business updated successfully',
            'data' => $business
        ], 200);
    }

    public function getByCategory($categoryId)
    {
        $businesses = Business::with(['user', 'products'])
            ->where('category_id', $categoryId)
            ->where('status', 'approved')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $businesses
        ], 200);
    }

    public function getPendingApplications()
    {
        $businesses = Business::with(['user', 'category'])
            ->where('status', 'pending')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $businesses
        ], 200);
    }

    public function approveApplication($userId)
    {
        $business = Business::where('user_id', $userId)->first();

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found'
            ], 404);
        }

        // Update business status to approved
        $business->update(['status' => 'approved']);

        // Update user role from 'user' to 'umkm'
        $user = $business->user;
        if ($user && $user->role !== 'umkm') {
            $user->update(['role' => 'umkm']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Business approved successfully',
            'data' => $business
        ], 200);
    }

    public function rejectApplication($userId)
    {
        $business = Business::where('user_id', $userId)->first();

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found'
            ], 404);
        }

        $business->update(['status' => 'rejected']);

        return response()->json([
            'success' => true,
            'message' => 'Business rejected',
            'data' => $business
        ], 200);
    }

    /**
     * Send OTP ke nomor WhatsApp untuk register bisnis
     * Mengembalikan OTP code + wa.me link (user klik sendiri)
     */
    public function sendOtpRegisterBusiness(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_whatsapp' => 'required|string|regex:/^62[0-9]{9,12}$/',
            ]);

            $result = $this->whatsappService->generateOtp($validated['no_whatsapp'], 'business');

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
     * Verify OTP bisnis
     */
    public function verifyOtpRegisterBusiness(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_whatsapp' => 'required|string',
                'code' => 'required|string|size:6',
            ]);

            $result = $this->whatsappService->verifyOtp($validated['no_whatsapp'], $validated['code'], 'business');

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'OTP verified successfully'
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
}

