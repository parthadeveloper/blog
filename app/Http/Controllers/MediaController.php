<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * List all files inside the media library.
     */
    public function index(): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Ensure the media folder exists
        if (!Storage::disk('public')->exists('media')) {
            Storage::disk('public')->makeDirectory('media');
        }

        $files = Storage::disk('public')->files('media');
        $mediaList = [];

        foreach ($files as $file) {
            // Only include images
            $mimeType = Storage::disk('public')->mimeType($file);
            if (str_starts_with($mimeType, 'image/')) {
                $mediaList[] = [
                    'name' => basename($file),
                    'path' => $file,
                    'url' => asset('storage/' . $file),
                    'size' => round(Storage::disk('public')->size($file) / 1024, 2) . ' KB',
                    'created_at' => date('Y-m-d H:i:s', Storage::disk('public')->lastModified($file)),
                ];
            }
        }

        // Sort so the latest uploaded files are returned first (WordPress style)
        usort($mediaList, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return response()->json($mediaList);
    }

    /**
     * Store new files inside the media library.
     */
    public function store(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('media', 'public');
            
            return response()->json([
                'success' => true,
                'name' => basename($path),
                'path' => $path,
                'url' => asset('storage/' . $path),
            ]);
        }

        return response()->json(['error' => 'File upload failed'], 400);
    }

    /**
     * Delete files inside the media library.
     */
    public function destroy(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'path' => 'required|string',
        ]);

        if (Storage::disk('public')->exists($request->path)) {
            // Prevent deleting files outside of the media folder for security
            if (!str_starts_with($request->path, 'media/')) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            Storage::disk('public')->delete($request->path);
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'File not found'], 404);
    }
}
