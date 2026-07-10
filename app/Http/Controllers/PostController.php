<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostStoreRequest;
use App\Http\Requests\PostUpdateRequest;
use App\Models\Post;
use App\Models\Category;
use App\Models\Comment;
use App\Services\CategoryService;
use App\Services\PostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        protected PostService $postService,
        protected CategoryService $categoryService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $perPage = (int) \App\Models\Setting::get('posts_per_page', 10);
        return Inertia::render('Posts/Index', [
            'posts' => $this->postService->getPaginatedPosts($perPage),
        ]);
    }

    /**
     * Display the user's dashboard based on their role.
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        $dashPostsPer   = (int) \App\Models\Setting::get('dash_posts_per_page', 10);
        $dashCatPer     = (int) \App\Models\Setting::get('dash_categories_per_page', 10);
        $dashCommentPer = (int) \App\Models\Setting::get('dash_comments_per_page', 10);

        $data = [
            'posts' => $this->postService->getUserPosts($user->id, $dashPostsPer, 'posts_page'),
        ];

        if ($user->isAdmin()) {
            $data['categories'] = Category::withCount('posts')
                ->latest()
                ->paginate($dashCatPer, ['*'], 'categories_page')
                ->withQueryString()
                ->appends(['tab' => 'categories']);

            $data['allComments'] = Comment::with(['user', 'post'])
                ->latest()
                ->paginate($dashCommentPer, ['*'], 'comments_page')
                ->withQueryString()
                ->appends(['tab' => 'comments']);
        } else {
            $data['myComments'] = Comment::with('post')
                ->where('user_id', $user->id)
                ->latest()
                ->paginate($dashCommentPer, ['*'], 'comments_page')
                ->withQueryString()
                ->appends(['tab' => 'my-comments']);
        }

        return Inertia::render('Dashboard', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Posts/Create', [
            'categories' => $this->categoryService->getAllCategories(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PostStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        $this->postService->createPost($data);

        return redirect()->route('dashboard')->with('message', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug): Response
    {
        return Inertia::render('Posts/Show', [
            'post' => $this->postService->getPostBySlug($slug),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post): Response
    {
        $this->authorize('update', $post);

        return Inertia::render('Posts/Edit', [
            'post' => $post,
            'categories' => $this->categoryService->getAllCategories(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostUpdateRequest $request, Post $post): RedirectResponse
    {
        $this->postService->updatePost($post, $request->validated());

        return redirect()->route('dashboard')->with('message', 'Post updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        $this->postService->deletePost($post);

        return redirect()->route('dashboard')->with('message', 'Post deleted successfully.');
    }

    /**
     * Update the site-wide theme (Admin only).
     */
    public function updateTheme(\Illuminate\Http\Request $request): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'theme' => 'required|string|in:theme-emerald,theme-dark-slate,theme-cyberpunk,theme-retro-amber,theme-nordic-snow',
        ]);

        \App\Models\Setting::set('site_theme', $request->theme);

        return redirect()->back()->with('message', 'Site theme updated successfully.');
    }

    /**
     * Update the site-wide general configurations (Admin only).
     */
    public function updateGeneralSettings(\Illuminate\Http\Request $request): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'site_name' => 'required|string|max:255',
            'posts_per_page' => 'required|integer|min:1|max:100',
            'theme' => 'required|string|in:theme-emerald,theme-dark-slate,theme-cyberpunk,theme-retro-amber,theme-nordic-snow,theme-corp-indigo,theme-emerald-pine,theme-teal-minimal,theme-deep-plum,theme-warm-terracotta',
            'homepage_title' => 'required|string|max:255',
            'homepage_subtitle' => 'required|string|max:1000',
            'logo' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,ico|max:1024',
            'gallery_infinite_loop' => 'nullable|boolean',
            'dash_posts_per_page' => 'required|integer|min:1|max:100',
            'dash_categories_per_page' => 'required|integer|min:1|max:100',
            'dash_comments_per_page' => 'required|integer|min:1|max:100',
            'site_footer' => 'required|string|max:500',
            'email_verification_enabled' => 'nullable|boolean',
        ]);

        \App\Models\Setting::set('site_name', $request->site_name);
        \App\Models\Setting::set('posts_per_page', $request->posts_per_page);
        \App\Models\Setting::set('site_theme', $request->theme);
        \App\Models\Setting::set('homepage_title', $request->homepage_title);
        \App\Models\Setting::set('homepage_subtitle', $request->homepage_subtitle);
        \App\Models\Setting::set('gallery_infinite_loop', $request->has('gallery_infinite_loop') && $request->gallery_infinite_loop ? '1' : '0');
        \App\Models\Setting::set('email_verification_enabled', $request->has('email_verification_enabled') && $request->email_verification_enabled ? '1' : '0');
        \App\Models\Setting::set('dash_posts_per_page', $request->dash_posts_per_page);
        \App\Models\Setting::set('dash_categories_per_page', $request->dash_categories_per_page);
        \App\Models\Setting::set('dash_comments_per_page', $request->dash_comments_per_page);
        \App\Models\Setting::set('site_footer', $request->site_footer);

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
            \App\Models\Setting::set('site_logo', $logoPath);
        }

        if ($request->hasFile('favicon')) {
            $faviconPath = $request->file('favicon')->store('favicons', 'public');
            \App\Models\Setting::set('site_favicon', $faviconPath);
        }

        return redirect()->back()->with('message', 'General settings updated successfully.');
    }

    /**
     * Store a newly created category in taxonomy (Admin only).
     */
    public function storeCategory(\Illuminate\Http\Request $request): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        Category::create([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
        ]);

        return redirect()->back()->with('message', 'Category created successfully.');
    }

    /**
     * Update the specified category in taxonomy (Admin only).
     */
    public function updateCategory(\Illuminate\Http\Request $request, Category $category): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
        ]);

        return redirect()->back()->with('message', 'Category updated successfully.');
    }

    /**
     * Remove the specified category from taxonomy (Admin only).
     */
    public function destroyCategory(Category $category): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        if ($category->posts()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete a category that contains active posts.');
        }

        $category->delete();

        return redirect()->back()->with('message', 'Category deleted successfully.');
    }
}
