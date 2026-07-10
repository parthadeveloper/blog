import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PublicLayout({ header, children, user }) {
    const theme = usePage().props.settings?.theme || 'theme-emerald';
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className={`${theme} min-h-screen bg-theme-main text-theme-text transition-colors duration-300 font-sans`}>
            {/* Navbar */}
            <nav className="border-b border-theme-border/60 bg-theme-card/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo */}
                        <Link href={route('posts.index')} className="flex items-center gap-2.5 group">
                            {usePage().props.settings?.logo ? (
                                <img 
                                    src={usePage().props.settings.logo} 
                                    alt={usePage().props.settings.name || 'LaraBlog'} 
                                    className="h-10 max-w-[120px] object-contain transition-transform duration-200 group-hover:scale-105"
                                />
                            ) : (
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-theme-primary to-theme-primary-hover shadow-theme-sm group-hover:scale-105 transition-transform duration-200">
                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.832.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </span>
                            )}
                            <span className="bg-gradient-to-r from-theme-text to-theme-muted bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                                {usePage().props.settings?.name || 'LaraBlog'}
                            </span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden sm:flex items-center gap-3">
                            {user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center rounded-xl border border-theme-border bg-theme-card px-4 py-2 text-sm font-semibold text-theme-muted hover:text-theme-text hover:bg-theme-main/30 focus:outline-none transition-all duration-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-semibold text-theme-muted hover:text-theme-text px-4 py-2 rounded-xl transition duration-150"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2 px-4 rounded-xl text-sm shadow-theme-sm transition duration-150"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className="sm:hidden p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-main/30 transition"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                {mobileOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="sm:hidden border-t border-theme-border/60 bg-theme-card/90 px-4 py-3 space-y-2">
                        {user ? (
                            <Link href={route('dashboard')} className="block text-sm font-semibold text-theme-muted hover:text-theme-text py-2">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="block text-sm font-semibold text-theme-muted hover:text-theme-text py-2">Log In</Link>
                                <Link href={route('register')} className="block text-sm font-bold text-theme-primary py-2">Get Started</Link>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* Page Header */}
            {header && (
                <header className="bg-theme-card/50 border-b border-theme-border/40 transition-colors duration-300">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-theme-border/40 mt-16 py-8 text-center text-xs text-theme-muted">
                {usePage().props.settings?.site_footer || `© ${new Date().getFullYear()} LaraBlog. Built with Laravel & React.`}
            </footer>
        </div>
    );
}
