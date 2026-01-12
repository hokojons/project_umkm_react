<?php

/**
 * Laravel Controller Example - BusinessController
 * 
 * Path: app/Http/Controllers/Api/BusinessController.php
 * 
 * Contoh implementasi Business Controller untuk Laravel
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class BusinessController extends BaseController
{
    /**
     * Get all businesses
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Business::with('products');

        // Filter by category
        if ($request->has('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('owner', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Pagination
        if ($request->has('page')) {
            $perPage = $request->get('per_page', 15);
            $businesses = $query->paginate($perPage);
            
            return $this->sendResponse([
                'data' => $businesses->items(),
                'current_page' => $businesses->currentPage(),
                'last_page' => $businesses->lastPage(),
                'per_page' => $businesses->perPage(),
                'total' => $businesses->total(),
            ]);
        }

        $businesses = $query->get();

        return $this->sendResponse($businesses);
    }

    /**
     * Get business by ID
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $business = Business::with('products')->find($id);

        if (!$business) {
            return $this->sendError('Business not found', [], 404);
        }

        return $this->sendResponse($business);
    }

    /**
     * Get businesses owned by current user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function myBusinesses(Request $request)
    {
        $businesses = Business::with('products')
            ->where('owner_id', $request->user()->id)
            ->get();

        return $this->sendResponse($businesses);
    }

    /**
     * Get featured businesses
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function featured(Request $request)
    {
        $limit = $request->get('limit', 6);
        
        $businesses = Business::with('products')
            ->where('is_featured', true)
            ->limit($limit)
            ->get();

        return $this->sendResponse($businesses);
    }

    /**
     * Get businesses by category
     * 
     * @param string $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function byCategory($category)
    {
        $businesses = Business::with('products')
            ->where('category', $category)
            ->get();

        return $this->sendResponse($businesses);
    }

    /**
     * Create new business
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'about' => 'sometimes|string',
            'category' => 'required|string',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'whatsapp' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'email' => 'sometimes|email',
            'instagram' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation failed', $validator->errors()->toArray(), 422);
        }

        $businessData = [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'owner_id' => $request->user()->id,
            'name' => $request->name,
            'owner' => $request->user()->name,
            'description' => $request->description,
            'about' => $request->about,
            'category' => $request->category,
            'rating' => 0,
            'whatsapp' => $request->whatsapp,
            'phone' => $request->phone,
            'email' => $request->email,
            'instagram' => $request->instagram,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('businesses', 'public');
            $businessData['image'] = Storage::url($path);
        }

        $business = Business::create($businessData);

        // Load products relationship
        $business->load('products');

        return $this->sendResponse($business, 'Business created successfully', 201);
    }

    /**
     * Update business
     * 
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $business = Business::find($id);

        if (!$business) {
            return $this->sendError('Business not found', [], 404);
        }

        // Check ownership (unless admin)
        if ($request->user()->role !== 'admin' && $business->owner_id !== $request->user()->id) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'about' => 'sometimes|string',
            'category' => 'sometimes|string',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'whatsapp' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'email' => 'sometimes|email',
            'instagram' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation failed', $validator->errors()->toArray(), 422);
        }

        // Update fields
        $business->fill($request->only([
            'name', 'description', 'about', 'category',
            'whatsapp', 'phone', 'email', 'instagram'
        ]));

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($business->image) {
                $oldPath = str_replace('/storage/', '', $business->image);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('businesses', 'public');
            $business->image = Storage::url($path);
        }

        $business->save();

        // Load products relationship
        $business->load('products');

        return $this->sendResponse($business, 'Business updated successfully');
    }

    /**
     * Delete business
     * 
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        $business = Business::find($id);

        if (!$business) {
            return $this->sendError('Business not found', [], 404);
        }

        // Check ownership (unless admin)
        if ($request->user()->role !== 'admin' && $business->owner_id !== $request->user()->id) {
            return $this->sendError('Unauthorized', [], 403);
        }

        // Delete image
        if ($business->image) {
            $oldPath = str_replace('/storage/', '', $business->image);
            Storage::disk('public')->delete($oldPath);
        }

        $business->delete();

        return $this->sendResponse(null, 'Business deleted successfully');
    }
}
