import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const theme = usePage().props.settings?.theme || 'theme-emerald';

    return (
        <div className={`${theme} flex min-h-screen flex-col items-center bg-theme-main pt-6 sm:justify-center sm:pt-0 transition-colors duration-300 font-sans`}>
            <div className="animate-fade-in-down">
                <Link href="/">
                    <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-theme-primary to-theme-primary-hover shadow-theme-sm">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.832.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </span>
                        <span className="bg-gradient-to-r from-theme-text to-theme-muted bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                            LaraBlog
                        </span>
                    </div>
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden bg-theme-card border border-theme-border/60 px-8 py-8 shadow-theme-lg sm:max-w-md sm:rounded-2xl transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
