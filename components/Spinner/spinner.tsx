type SpinnerProps = {
    size?: "sm" | "md" | "lg";
    label?: string;
    className?: string;
};

const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
};

export default function Spinner({
    size = "md",
    label = "Carregando...",
    className = "",
}: SpinnerProps) {
    return (
        <span
            role="status"
            className={`inline-flex items-center justify-center ${className}`}
        >
            <span
                aria-hidden="true"
                className={`${sizes[size]} rounded-full border-[#0d8ef0]/20 border-t-[#0d8ef0] animate-spin`}
            />
            <span className="sr-only">{label}</span>
        </span>
    );
}
