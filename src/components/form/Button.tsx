interface ButtonProps {
    label?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    loadingFlag?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-3',
};

export default function Button({
    label = 'Button',
    className = 'btn-primary',
    size = 'sm',
    icon = '',
    loadingFlag = false,
    onClick = () => alert('Please define your function!'),
}: ButtonProps) {
    return (
        <button
            className={`rounded-sm shadow border-0 disabled:opacity-60 ${loadingFlag ? "cursor-not-allowed" : "cursor-pointer"} ${sizeClasses[size]} ${className}`}
            disabled={loadingFlag}
            onClick={onClick}
        >
            {icon && <i className={`${icon} mr-2`}></i>}
            <span>{label}</span>
            {loadingFlag && <i className='fa-solid fa-spinner fa-spin ml-2'></i>}
        </button>
    );
}
