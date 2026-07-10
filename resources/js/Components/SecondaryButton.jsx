export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-xl border border-theme-border bg-theme-card px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-theme-muted shadow-theme-xs transition duration-200 ease-in-out hover:bg-theme-main/50 hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 active:scale-[0.98] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
