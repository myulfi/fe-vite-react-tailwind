import { useState } from "react";

interface SpanProps {
    label: string;
    icon?: string;
    className?: string;
    onClick?: () => void;
}

export default function Span({
    label,
    icon = '',
    className,
    onClick,
}: SpanProps) {
    return (
        <span className={className} onClick={onClick}>
            {
                icon &&
                <i className={`mr-1 ${icon}`} />
            }
            {label}
        </span>
    );
}
