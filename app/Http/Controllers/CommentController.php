<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request, Post $post): RedirectResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $post->comments()->create([
            'user_id' => Auth::id(),
            'content' => $validated['content'],
            'rating' => $validated['rating'] ?? null,
            'is_approved' => true, // Auto-approve by default, admin can moderate
        ]);

        return back()->with('message', 'Thank you! Your comment and rating have been posted.');
    }

    /**
     * Remove the specified comment from storage.
     */
    public function destroy(Comment $comment): RedirectResponse
    {
        // Only admin or the author can delete
        if (Auth::id() !== $comment->user_id && !Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $comment->delete();

        return back()->with('message', 'Comment deleted successfully.');
    }

    /**
     * Toggle the approval status of a comment (admin only).
     */
    public function toggleApproval(Comment $comment): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $comment->update([
            'is_approved' => !$comment->is_approved,
        ]);

        $status = $comment->is_approved ? 'approved' : 'unapproved';
        return back()->with('message', "Comment has been successfully {$status}.");
    }
}
