<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostService
{
    /**
     * Get paginated posts.
     */
    public function getPaginatedPosts(int $perPage = 10): LengthAwarePaginator
    {
        return Post::with(['user', 'category'])
            ->withCount(['comments as comments_count' => function ($query) {
                $query->where('is_approved', true);
            }])
            ->withAvg(['comments as average_rating' => function ($query) {
                $query->where('is_approved', true);
            }], 'rating')
            ->where('is_published', true)
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get all posts for the current authenticated user (admin sees all).
     */
    public function getUserPosts(int $userId, int $perPage = 10, string $pageName = 'posts_page'): LengthAwarePaginator
    {
        $user = \App\Models\User::find($userId);
        $query = Post::with(['category', 'user'])
            ->withCount('comments')
            ->withAvg('comments', 'rating');

        if ($user && !$user->isAdmin()) {
            $query->where('user_id', $userId);
        }

        return $query->latest()
            ->paginate($perPage, ['*'], $pageName)
            ->withQueryString()
            ->appends(['tab' => 'posts']);
    }

    /**
     * Get a post by slug.
     */
    public function getPostBySlug(string $slug): ?Post
    {
        return Post::with([
            'user',
            'category',
            'comments' => function ($query) {
                $query->where('is_approved', true)->with('user')->latest();
            }
        ])
        ->withCount(['comments as comments_count' => function ($query) {
            $query->where('is_approved', true);
        }])
        ->withAvg(['comments as average_rating' => function ($query) {
            $query->where('is_approved', true);
        }], 'rating')
        ->where('slug', $slug)
        ->firstOrFail();
    }

    /**
     * Create a new post.
     */
    public function createPost(array $data): Post
    {
        if (isset($data['image'])) {
            if ($data['image'] instanceof \Illuminate\Http\UploadedFile) {
                $path = $data['image']->store('posts', 'public');
                if ($path) {
                    $data['image'] = $path;
                } else {
                    unset($data['image']);
                }
            } elseif (is_string($data['image'])) {
                // Keep the media library path
            }
        }

        $galleryPaths = [];
        if (isset($data['gallery_images']) && is_array($data['gallery_images'])) {
            foreach ($data['gallery_images'] as $file) {
                if ($file instanceof \Illuminate\Http\UploadedFile) {
                    $path = $file->store('posts/gallery', 'public');
                    if ($path) {
                        $galleryPaths[] = $path;
                    }
                } elseif (is_string($file)) {
                    $galleryPaths[] = $file;
                }
            }
        }
        $data['gallery_images'] = $galleryPaths;

        return Post::create($data);
    }

    /**
     * Update an existing post.
     */
    public function updatePost(Post $post, array $data): Post
    {
        if (isset($data['image'])) {
            if ($data['image'] instanceof \Illuminate\Http\UploadedFile) {
                $path = $data['image']->store('posts', 'public');
                if ($path) {
                    // Delete old image
                    if ($post->image) {
                        Storage::disk('public')->delete($post->image);
                    }
                    $data['image'] = $path;
                } else {
                    unset($data['image']);
                }
            } elseif (is_string($data['image'])) {
                // Keep the media library path
            }
        } else {
            unset($data['image']);
        }

        $galleryPaths = [];
        if (isset($data['retained_gallery_images'])) {
            $retained = is_string($data['retained_gallery_images']) 
                ? json_decode($data['retained_gallery_images'], true) 
                : $data['retained_gallery_images'];
            if (is_array($retained)) {
                $galleryPaths = $retained;
            }
        } else {
            $galleryPaths = $post->gallery_images ?? [];
        }

        // Clean up any images that were deleted from the gallery
        $deletedImages = array_diff($post->gallery_images ?? [], $galleryPaths);
        foreach ($deletedImages as $deletedImg) {
            Storage::disk('public')->delete($deletedImg);
        }

        // Add new uploaded gallery images
        if (isset($data['gallery_images']) && is_array($data['gallery_images'])) {
            foreach ($data['gallery_images'] as $file) {
                if ($file instanceof \Illuminate\Http\UploadedFile) {
                    $path = $file->store('posts/gallery', 'public');
                    if ($path) {
                        $galleryPaths[] = $path;
                    }
                } elseif (is_string($file)) {
                    if (!in_array($file, $galleryPaths)) {
                        $galleryPaths[] = $file;
                    }
                }
            }
        }
        $data['gallery_images'] = $galleryPaths;

        $post->update($data);

        return $post;
    }

    /**
     * Delete a post.
     */
    public function deletePost(Post $post): bool
    {
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        if ($post->gallery_images && is_array($post->gallery_images)) {
            foreach ($post->gallery_images as $img) {
                Storage::disk('public')->delete($img);
            }
        }

        return $post->delete();
    }
}
