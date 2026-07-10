import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const theme = usePage().props.settings?.theme || 'theme-emerald';

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className={`${theme} min-h-screen bg-theme-main text-theme-text transition-colors duration-300 font-sans`}>
            <nav className="border-b border-theme-border/60 bg-theme-card/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2.5 group">
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
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="text-sm font-medium"
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('posts.index')}
                                    active={route().current('posts.index')}
                                    className="text-sm font-medium"
                                >
                                    Home Blog
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-xl border border-theme-border bg-theme-card px-4 py-2 text-sm font-semibold leading-4 text-theme-muted hover:text-theme-text hover:bg-theme-main/30 focus:outline-none transition-all duration-200"
                                            >
                                                <span className="mr-1 h-2 w-2 rounded-full bg-theme-primary animate-pulse"></span>
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4 opacity-70"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content className="border border-theme-border/60 bg-theme-card text-theme-text rounded-xl shadow-theme-lg">
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                            className="hover:bg-theme-main/50 text-theme-text"
                                        >
                                            Profile Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="hover:bg-red-500/10 hover:text-red-500 text-theme-text"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl p-2.5 text-theme-muted hover:bg-theme-main/50 hover:text-theme-text focus:outline-none transition duration-150"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden border-t border-theme-border/60 bg-theme-card transition-all duration-200'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('posts.index')}
                            active={route().current('posts.index')}
                        >
                            Home Blog
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-theme-border/60 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-semibold text-theme-text">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-theme-muted">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile Settings
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="text-red-500 hover:bg-red-500/10"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-theme-card border-b border-theme-border/50 shadow-theme-xs transition-colors duration-300">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
