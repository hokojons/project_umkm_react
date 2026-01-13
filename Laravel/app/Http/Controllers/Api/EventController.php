<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index()
    {
        // Use legacy tacara table
        $events = DB::table('tacara')
            ->select(
                'kodeacara as id',
                'namaacara as name',
                'detail as description',
                'tanggal as date',
                'kuotapeserta as quota',
                'tanggaldaftar as registration_date',
                'lokasi as location',
                'gambar as image',
                'gambar_position_x',
                'gambar_position_y',
                'gambar_scale',
                'status'
            )
            ->where('status', 'active')
            ->get();

        // Add participants count (set to 0 for now since tpengguna restructured)
        $events = $events->map(function($event) {
            // TODO: Implement proper event registration tracking
            $participantsCount = 0; // Temporarily set to 0
            
            $event->participants_count = $participantsCount;
            $event->available_slots = $event->quota;
            
            return $event;
        });

        return response()->json([
            'success' => true,
            'data' => $events
        ], 200);
    }

    public function show($id)
    {
        $event = DB::table('tacara')
            ->select(
                'kodeacara as id',
                'namaacara as name',
                'detail as description',
                'tanggal as date',
                'kuotapeserta as quota',
                'tanggaldaftar as registration_date',
                'lokasi as location',
                'gambar as image',
                'gambar_position_x',
                'gambar_position_y',
                'gambar_scale',
                'status'
            )
            ->where('kodeacara', $id)
            ->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        // Add participants count (set to 0 for now since tpengguna restructured)
        $participantsCount = 0; // TODO: Implement proper event registration tracking
        
        $event->participants_count = $participantsCount;
        $event->available_slots = $event->quota;

        return response()->json([
            'success' => true,
            'data' => $event
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'required|string',
            'date' => 'required|date',
            'location' => 'nullable|string|max:200',
            'quota' => 'nullable|integer|min:1',
            'image' => 'nullable|file|image|max:2048',
            'gambar_position_x' => 'nullable|integer',
            'gambar_position_y' => 'nullable|integer',
        ]);

        // Handle file upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/events'), $filename);
            $imagePath = 'uploads/events/' . $filename;
        } elseif ($request->filled('image') && filter_var($request->image, FILTER_VALIDATE_URL)) {
            // If image is a URL
            $imagePath = $request->image;
        }

        // Generate event code
        $lastEvent = DB::table('tacara')
            ->orderBy('kodeacara', 'desc')
            ->first();
        
        if ($lastEvent) {
            $lastNumber = (int) substr($lastEvent->kodeacara, 3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        $eventCode = 'EVT' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        DB::table('tacara')->insert([
            'kodeacara' => $eventCode,
            'namaacara' => $validated['name'],
            'detail' => $validated['description'],
            'tanggal' => $validated['date'],
            'kuotapeserta' => $validated['quota'] ?? 100,
            'tanggaldaftar' => now(),
            'lokasi' => $validated['location'] ?? null,
            'gambar' => $imagePath,
            'gambar_position_x' => $request->gambar_position_x ?? 0,
            'gambar_position_y' => $request->gambar_position_y ?? 0,
            'gambar_scale' => $request->gambar_scale ?? 1.0,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => [
                'id' => $eventCode,
                'name' => $validated['name'],
                'description' => $validated['description'],
                'date' => $validated['date'],
                'quota' => $validated['quota'] ?? 100,
                'image' => $imagePath,
            ]
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $event = DB::table('tacara')
            ->where('kodeacara', $id)
            ->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'required|string',
            'date' => 'required|date',
            'location' => 'nullable|string|max:200',
            'quota' => 'nullable|integer|min:1',
            'image' => 'nullable|file|image|max:2048',
            'gambar_position_x' => 'nullable|integer',
            'gambar_position_y' => 'nullable|integer',
            'gambar_scale' => 'nullable|numeric|min:0.5|max:3',
        ]);

        // Prepare update data
        $updateData = [
            'namaacara' => $validated['name'],
            'detail' => $validated['description'],
            'tanggal' => $validated['date'],
            'kuotapeserta' => $validated['quota'] ?? $event->kuotapeserta,
            'lokasi' => $validated['location'] ?? null,
            'updated_at' => now(),
        ];

        // Always update position if provided
        if ($request->filled('gambar_position_x')) {
            $updateData['gambar_position_x'] = $request->gambar_position_x;
        }
        if ($request->filled('gambar_position_y')) {
            $updateData['gambar_position_y'] = $request->gambar_position_y;
        }
        if ($request->filled('gambar_scale')) {
            $updateData['gambar_scale'] = $request->gambar_scale;
        }

        // Handle file upload
        if ($request->hasFile('image')) {
            // Delete old image if exists and it's a local file
            if ($event->gambar && 
                !filter_var($event->gambar, FILTER_VALIDATE_URL) && 
                file_exists(public_path($event->gambar))) {
                unlink(public_path($event->gambar));
            }
            
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/events'), $filename);
            $updateData['gambar'] = 'uploads/events/' . $filename;
        } elseif ($request->filled('image') && filter_var($request->image, FILTER_VALIDATE_URL)) {
            // If image is a URL
            $updateData['gambar'] = $request->image;
        }

        DB::table('tacara')
            ->where('kodeacara', $id)
            ->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
        ], 200);
    }

    public function destroy($id)
    {
        $event = DB::table('tacara')
            ->where('kodeacara', $id)
            ->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        try {
            // Delete event image if exists and is local
            if ($event->gambar && 
                !filter_var($event->gambar, FILTER_VALIDATE_URL) && 
                file_exists(public_path($event->gambar))) {
                unlink(public_path($event->gambar));
            }

            // Delete event
            DB::table('tacara')
                ->where('kodeacara', $id)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Event deletion error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event: ' . $e->getMessage()
            ], 500);
        }
    }

    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'event_id' => 'required|string',
                'user_id' => 'nullable|string',
                'name' => 'required|string|max:100',
                'email' => 'required|email|max:100',
                'phone' => 'required|string|max:20',
                'organization' => 'nullable|string|max:100',
                'notes' => 'nullable|string|max:500',
            ]);

            // Check if event exists
            $event = DB::table('tacara')
                ->where('kodeacara', $validated['event_id'])
                ->first();

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event tidak ditemukan'
                ], 404);
            }

            // Check quota
            $participantCount = DB::table('tpengguna')
                ->where('kodeacara', $validated['event_id'])
                ->count();

            if ($participantCount >= $event->kuotapeserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kuota event sudah penuh'
                ], 400);
            }

            // Check if user already registered
            if (isset($validated['user_id'])) {
                $exists = DB::table('tpengguna')
                    ->where('kodeacara', $validated['event_id'])
                    ->where('kodepengguna', $validated['user_id'])
                    ->exists();

                if ($exists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Anda sudah terdaftar di event ini'
                    ], 400);
                }

                // Register user
                DB::table('tpengguna')->insert([
                    'kodeacara' => $validated['event_id'],
                    'kodepengguna' => $validated['user_id']
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Berhasil mendaftar event'
                ], 201);
            }

            // For visitor (non-user) registration, store in separate table or JSON
            // For now, create temporary user code
            $lastVisitor = DB::table('tpengguna')
                ->where('kodepengguna', 'like', 'V%')
                ->orderBy('kodepengguna', 'desc')
                ->first();

            if ($lastVisitor) {
                $lastNumber = (int) substr($lastVisitor->kodepengguna, 1);
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }

            $visitorCode = 'V' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

            // Create visitor entry in tpengguna (use visitor code as username to avoid duplicates)
            DB::table('tpengguna')->insert([
                'kodepengguna' => $visitorCode,
                'namapengguna' => $visitorCode, // Use code as username (unique)
                'teleponpengguna' => $validated['phone'],
                'katakunci' => password_hash('visitor', PASSWORD_DEFAULT),
                'status' => 'visitor'
            ]);

            // Store visitor details in separate table
            DB::table('event_visitor_details')->insert([
                'kodepengguna' => $visitorCode,
                'nama_lengkap' => $validated['name'],
                'email' => $validated['email'],
                'organization' => $validated['organization'] ?? null,
                'notes' => $validated['notes'] ?? null
            ]);

            // Register to event
            DB::table('tpengguna')->insert([
                'kodeacara' => $validated['event_id'],
                'kodepengguna' => $visitorCode
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil! Kami akan menghubungi Anda segera.',
                'data' => [
                    'registration_code' => $visitorCode
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Event registration error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftar: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getParticipants($id)
    {
        try {
            $participants = DB::table('tpengguna')
                ->join('tpengguna', DB::raw('tpengguna.kodepengguna COLLATE utf8mb4_unicode_ci'), '=', DB::raw('tpengguna.kodepengguna COLLATE utf8mb4_unicode_ci'))
                ->leftJoin('event_visitor_details', DB::raw('tpengguna.kodepengguna COLLATE utf8mb4_unicode_ci'), '=', DB::raw('event_visitor_details.kodepengguna COLLATE utf8mb4_unicode_ci'))
                ->where('tpengguna.kodeacara', $id)
                ->select(
                    'tpengguna.kodepengguna as id',
                    DB::raw('COALESCE(event_visitor_details.nama_lengkap, tpengguna.namapengguna) as name'),
                    'tpengguna.teleponpengguna as phone',
                    'tpengguna.status',
                    'event_visitor_details.email',
                    'event_visitor_details.organization'
                )
                ->get();

            return response()->json([
                'success' => true,
                'data' => $participants,
                'count' => $participants->count()
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Get participants error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch participants'
            ], 500);
        }
    }

    public function unregister($eventId, $userId)
    {
        $participant = EventParticipant::where('event_id', $eventId)
            ->where('user_id', $userId)
            ->first();

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Registration not found'
            ], 404);
        }

        $participant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unregistered from event'
        ], 200);
    }

    public function getUserEvents($userId)
    {
        $events = Event::whereHas('participants', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->with('participants')->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ], 200);
    }
}
