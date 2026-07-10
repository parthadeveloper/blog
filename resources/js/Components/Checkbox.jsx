export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-lg border-theme-border text-theme-primary bg-theme-card focus:ring-theme-primary transition duration-200 ' +
                className
            }
        />
    );
}
