<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Business;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('user')->where('status', 'active')->get();
        return response()->json([
            'success' => true,
            'data' => $products
        ], 200);
    }

    public function show($id)
    {
        $product = Product::with('user')->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:products',
            'user_id' => 'required|string|exists:users,id',
            'name' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string|max:255',
        ]);

        $product = Product::create([
            ...$validated,
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',
            'price' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ], 200);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ], 200);
    }

    public function getByBusiness($userId)
    {
        $products = Product::where('user_id', $userId)
            ->where('status', 'active')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ], 200);
    }

    // Update product image (admin only)
    public function updateImage(Request $request, $id)
    {
        try {
            // Find product in tproduk table
            $product = \DB::table('tproduk')->where('id', $id)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $validated = $request->validate([
                'gambar' => 'required|string|max:5000000'
            ]);

            \DB::table('tproduk')
                ->where('id', $id)
                ->update(['gambar' => $validated['gambar']]);

            return response()->json([
                'success' => true,
                'message' => 'Product image updated successfully',
                'data' => \DB::table('tproduk')->where('id', $id)->first()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
