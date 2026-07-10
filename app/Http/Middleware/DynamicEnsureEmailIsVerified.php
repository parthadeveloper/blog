<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Setting;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\URL;

class DynamicEnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $redirectToRoute
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse|null
     */
    public function handle($request, Closure $next, $redirectToRoute = null)
    {
        // If email verification is turned off in settings, bypass verification checks entirely!
        $verificationEnabled = Setting::get('email_verification_enabled', '0') === '1';

        if (!$verificationEnabled) {
            return $next($request);
        }

        // If enabled, standard users are forced to verify their email.
        // Let's also bypass verification for admin users so they can always log in and fix settings!
        $user = $request->user();
        if ($user && $user->isAdmin()) {
            return $next($request);
        }

        if (!$user ||
            ($user instanceof MustVerifyEmail &&
             !$user->hasVerifiedEmail())) {
            return $request->expectsJson()
                    ? abort(403, 'Your email address is not verified.')
                    : Redirect::guest(URL::route($redirectToRoute ?: 'verification.notice'));
        }

        return $next($request);
    }
}
