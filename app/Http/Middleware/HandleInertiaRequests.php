<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'asset_url' => asset('storage'),
            'settings' => [
                'theme' => \App\Models\Setting::get('site_theme', 'theme-emerald'),
                'name' => \App\Models\Setting::get('site_name', 'LaraBlog'),
                'logo' => \App\Models\Setting::get('site_logo') ? asset('storage/' . \App\Models\Setting::get('site_logo')) : null,
                'favicon' => \App\Models\Setting::get('site_favicon') ? asset('storage/' . \App\Models\Setting::get('site_favicon')) : asset('favicon.svg'),
                'posts_per_page' => (int) \App\Models\Setting::get('posts_per_page', 10),
                'homepage_title' => \App\Models\Setting::get('homepage_title', 'Latest Publications'),
                'homepage_subtitle' => \App\Models\Setting::get('homepage_subtitle', 'Explore insightful articles, tutorials, and travel diaries curated by the community.'),
                'gallery_infinite_loop' => (bool) \App\Models\Setting::get('gallery_infinite_loop', true),
                'dash_posts_per_page' => (int) \App\Models\Setting::get('dash_posts_per_page', 10),
                'dash_categories_per_page' => (int) \App\Models\Setting::get('dash_categories_per_page', 10),
                'dash_comments_per_page' => (int) \App\Models\Setting::get('dash_comments_per_page', 10),
                'site_footer' => \App\Models\Setting::get('site_footer', '© ' . date('Y') . ' LaraBlog. Built with Laravel & React.'),
                'email_verification_enabled' => (bool) \App\Models\Setting::get('email_verification_enabled', false),
            ],
        ];
    }
}
