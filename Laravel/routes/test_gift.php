<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/test-gift-create', function (Request $request) {
    try {
        \Log::info('Received data:', $request->all());
        
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:15',
            'image' => 'nullable|string|max:255',
            'items' => 'required|array',
        ]);
        
        \Log::info('Validated data:', $validated);
        
        $lastProduct = DB::table('tproduk')->orderBy('kodeproduk', 'desc')->first();
        $newNumber = $lastProduct ? ((int) substr($lastProduct->kodeproduk, 1)) + 1 : 1;
        $kodeproduk = 'P' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
        
        \Log::info('Generated kodeproduk:', ['kodeproduk' => $kodeproduk]);
        
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        DB::table('tproduk')->insert([
            'kodeproduk' => $kodeproduk,
            'kodepengguna' => 'SYSTEM',
            'namaproduk' => $validated['name'],
            'detail' => $validated['description'],
            'harga' => $validated['price'],
            'stok' => 999,
            'gambarproduk' => $validated['image'] ?? 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
            'status' => $validated['category'],
            'kategori' => 'paket_hadiah',
            'items' => json_encode($validated['items']),
        ]);
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        \Log::info('Insert successful');
        
        return response()->json([
            'success' => true,
            'message' => 'Created successfully',
            'data' => ['id' => $kodeproduk]
        ], 201);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation error:', ['errors' => $e->errors()]);
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Error creating gift package:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
});
