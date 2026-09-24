import type { ReactNode } from "react";
import { FiInbox } from "react-icons/fi";

type EmptyStateProps = {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
};

export default function EmptyState({
    title,
    description,
    icon = <FiInbox size={28} />,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <div
            className={`w-full flex flex-col items-center justify-center gap-3 px-6 py-12 text-center ${className}`}
        >
            <div
                aria-hidden="true"
                className="w-16 h-16 flex items-center justify-center rounded-full bg-[#0d8ef0]/10 text-[#0d8ef0]"
            >
                {icon}
            </div>

            <h2 className="text-lg font-bold text-ink">{title}</h2>

            {description && (
                <p className="max-w-sm text-sm text-gray-500">{description}</p>
            )}

            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
