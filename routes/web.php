<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Routes
Route::get('/', [PostController::class, 'index'])->name('posts.index');

// Dashboard (Protected)
Route::get('/dashboard', [PostController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Protected Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Post Management
    Route::resource('posts', PostController::class)->except(['index', 'show']);

    // Theme Settings
    Route::patch('/settings/theme', [PostController::class, 'updateTheme'])->name('settings.theme');
    Route::post('/settings/general', [PostController::class, 'updateGeneralSettings'])->name('settings.general');

    // Comments & Ratings
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::patch('/comments/{comment}/toggle-approval', [CommentController::class, 'toggleApproval'])->name('comments.toggle-approval');

    // Category Taxonomy CRUD
    Route::post('/categories', [PostController::class, 'storeCategory'])->name('categories.store');
    Route::post('/categories/{category}/update', [PostController::class, 'updateCategory'])->name('categories.update');
    Route::delete('/categories/{category}', [PostController::class, 'destroyCategory'])->name('categories.destroy');

    // Media Library CRUD
    Route::get('/media', [\App\Http\Controllers\MediaController::class, 'index'])->name('media.index');
    Route::post('/media', [\App\Http\Controllers\MediaController::class, 'store'])->name('media.store');
    Route::post('/media/delete', [\App\Http\Controllers\MediaController::class, 'destroy'])->name('media.destroy');
});

// Public Wildcard Route (must be at the bottom to avoid intercepting static routes like posts/create)
Route::get('/posts/{slug}', [PostController::class, 'show'])->name('posts.show');

require __DIR__.'/auth.php';
