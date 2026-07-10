import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-semibold leading-5 transition duration-200 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-theme-primary text-theme-text focus:border-theme-primary-hover'
                    : 'border-transparent text-theme-muted hover:border-theme-border hover:text-theme-text focus:border-theme-border focus:text-theme-text') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
