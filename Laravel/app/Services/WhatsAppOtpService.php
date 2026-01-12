<?php

namespace App\Services;

use App\Models\WaVerification;

class WhatsAppOtpService
{
    /**
     * Generate 6-digit OTP dan simpan ke database (5 menit berlaku)
     */
    public function generateOtp($phoneNumber, $type = 'user')
    {
        try {
            // Generate OTP 6 digit
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Hapus OTP lama yang expired
            WaVerification::where('phone_number', $phoneNumber)
                ->where('expires_at', '<', now())
                ->delete();

            // Simpan OTP baru ke database
            WaVerification::create([
                'phone_number' => $phoneNumber,
                'code' => $code,
                'type' => $type,
                'is_verified' => false,
                'expires_at' => now()->addMinutes(5), // 5 menit
            ]);

            \Log::info("OTP Generated", ['phone' => $phoneNumber, 'code' => $code]);

            return [
                'success' => true,
                'message' => 'OTP generated. Send via WhatsApp manually.',
                'code' => $code,
            ];

        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Failed: ' . $e->getMessage()];
        }
    }

    /**
     * Verify OTP code (cek validitas + expiration)
     */
    public function verifyOtp($phoneNumber, $code, $type = 'user')
    {
        try {
            $verification = WaVerification::where('phone_number', $phoneNumber)
                ->where('code', $code)
                ->where('expires_at', '>', now())
                ->first();

            if (!$verification) {
                return ['success' => false, 'message' => 'Invalid or expired OTP'];
            }

            $verification->update([
                'is_verified' => true,
                'verified_at' => now()
            ]);

            return ['success' => true, 'message' => 'OTP verified successfully'];

        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Verification failed: ' . $e->getMessage()];
        }
    }

    /**
     * Generate pesan OTP untuk 2FA registration
     */
    public function generateRegistrationMessage($code)
    {
        return "Halo Admin UMKM 👋\n" .
            "Saya ingin verifikasi akun.\n\n" .
            "Kode OTP: $code\n\n" .
            "Berlaku 5 menit.\n" .
            "Jangan bagikan kode ini.";
    }

    /**
     * Generate pesan order untuk dikirim ke UMKM
     */
    public function generateOrderMessage($order)
    {
        $message = "Halo! Ada pesanan baru nih 🎉\n\n";
        $message .= "📦 DETAIL PESANAN:\n";
        $message .= "Order ID: #" . $order->id . "\n";
        $message .= "Total: Rp " . number_format($order->total_harga, 0, ',', '.') . "\n\n";
        $message .= "👤 PENERIMA:\n";
        $message .= "Nama: " . ($order->user?->nama ?? 'Customer') . "\n";
        $message .= "Alamat: " . ($order->user?->alamat ?? 'Ada di catatan') . "\n";
        $message .= "No WA: " . $order->no_whatsapp_pembeli . "\n\n";
        $message .= "Mohon dikonfirmasi ya 🙏";
        return $message;
    }

    /**
     * Generate wa.me link dengan pre-filled message
     */
    public function generateWhatsAppLink($phoneNumber, $message)
    {
        $encodedMessage = urlencode($message);
        return "https://wa.me/" . $phoneNumber . "?text=" . $encodedMessage;
    }
}
