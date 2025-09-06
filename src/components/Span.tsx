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
        <span onClick={onClick}>
            {
                icon &&
                <i className={`mr-2 ${icon}`} />
            }
            <label className={className}>{label}</label>
        </span>
    );
}
