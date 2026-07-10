import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2.5 pe-4 ps-4 ${
                active
                    ? 'border-theme-primary bg-theme-primary/10 text-theme-primary focus:border-theme-primary-hover focus:bg-theme-primary/20'
                    : 'border-transparent text-theme-muted hover:border-theme-border hover:bg-theme-main/50 hover:text-theme-text focus:border-theme-border focus:bg-theme-main/50 focus:text-theme-text'
            } text-base font-semibold transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
