<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\WhatsAppOtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppOtpService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Create order dari keranjang untuk 1 UMKM
     */
    public function create(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            $validated = $request->validate([
                'business_id' => 'required|string',
                'no_whatsapp_pembeli' => 'required|string|max:20',
                'catatan' => 'nullable|string',
            ]);

            // Get cart items untuk business ini
            $cartItems = CartItem::where('user_id', $userId)
                ->with('product')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 400);
            }

            // Filter cart items untuk business ini
            $businessCartItems = $cartItems->filter(function ($item) use ($validated) {
                return $item->product->user_id === $validated['business_id'];
            });

            if ($businessCartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No items from this business in cart'
                ], 400);
            }

            // Hitung total harga
            $totalHarga = $businessCartItems->sum(function ($item) {
                return $item->product->harga * $item->jumlah;
            });

            // Create order
            $orderId = 'ORD-' . now()->format('Ymd') . '-' . Str::random(6);

            $order = Order::create([
                'id' => $orderId,
                'user_id' => $userId,
                'business_id' => $validated['business_id'],
                'no_whatsapp_pembeli' => $validated['no_whatsapp_pembeli'],
                'catatan' => $validated['catatan'] ?? null,
                'total_harga' => $totalHarga,
                'status' => 'pending',
                'status_umkm' => 'pending_confirmation',
            ]);

            // Create order items
            foreach ($businessCartItems as $cartItem) {
                OrderItem::create([
                    'id' => 'OI-' . Str::random(10),
                    'order_id' => $orderId,
                    'product_id' => $cartItem->product_id,
                    'jumlah' => $cartItem->jumlah,
                    'harga_satuan' => $cartItem->product->harga,
                    'subtotal' => $cartItem->product->harga * $cartItem->jumlah,
                ]);
            }

            // Delete cart items untuk business ini
            CartItem::where('user_id', $userId)
                ->whereIn('product_id', $businessCartItems->pluck('product_id'))
                ->delete();

            $order->load('items.product', 'user', 'business');

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
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
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detail order + generate WhatsApp message
     */
    public function getDetail(Request $request, $orderId)
    {
        try {
            $order = Order::with('items.product', 'user', 'business')
                ->find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Generate WhatsApp message
            $message = $this->whatsappService->generateOrderMessage($order);
            $whatsappLink = $this->whatsappService->generateWhatsAppLink(
                $order->business->no_whatsapp,
                $message
            );

            return response()->json([
                'success' => true,
                'message' => 'Order details retrieved',
                'data' => [
                    'order' => $order,
                    'whatsapp_message' => $message,
                    'whatsapp_link' => $whatsappLink,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get orders untuk user
     */
    public function getUserOrders(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            $orders = Order::where('user_id', $userId)
                ->with('items.product', 'business', 'business.user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Orders retrieved',
                'data' => $orders
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * UMKM update status pesanan
     */
    public function updateStatus(Request $request, $orderId)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            $validated = $request->validate([
                'status_umkm' => 'required|in:pending_confirmation,diproses,dikirim,selesai,dibatalkan',
            ]);

            $order = Order::find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check if user is the business owner
            if ($order->business->user_id !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $order->update([
                'status_umkm' => $validated['status_umkm'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated',
                'data' => $order
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
     * Get orders untuk UMKM
     */
    public function getBusinessOrders(Request $request)
    {
        try {
            $userId = $request->header('X-User-ID');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not provided'
                ], 400);
            }

            // Get business untuk user ini
            $business = \App\Models\Business::where('user_id', $userId)->first();

            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business not found'
                ], 404);
            }

            $orders = Order::where('business_id', $business->user_id)
                ->with('items.product', 'user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Business orders retrieved',
                'data' => $orders
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
