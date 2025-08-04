interface ButtonProps {
    label?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    type: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
    icon?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    loadingFlag?: boolean;
}

const sizeClasses = {
    sm: 'text-sm px-2 py-1.5',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-2',
};

const typeClasses = {
    primary: 'bg-light-primary-base dark:bg-dark-primary-base hover:bg-light-primary-base-hover hover:dark:bg-dark-primary-base border-2 border-light-primary-base dark:border-dark-primary-base hover:border-dark-primary-base hover:dark:border-dark-primary-base-hover text-light-primary-base-line dark:text-dark-primary-base-line',
    success: 'bg-light-success-base dark:bg-dark-success-base hover:bg-light-success-base-hover hover:dark:bg-dark-success-base border-2 border-light-success-base dark:border-dark-success-base hover:border-dark-success-base hover:dark:border-dark-success-base-hover text-light-success-base-line dark:text-dark-success-base-line',
    danger: 'bg-light-danger-base dark:bg-dark-danger-base hover:bg-light-danger-base-hover hover:dark:bg-dark-danger-base border-2 border-light-danger-base dark:border-dark-danger-base hover:border-dark-danger-base hover:dark:border-dark-danger-base-hover text-light-danger-base-line dark:text-dark-danger-base-line',
    warning: 'bg-light-warning-base dark:bg-dark-warning-base hover:bg-light-warning-base-hover hover:dark:bg-dark-warning-base border-2 border-light-warning-base dark:border-dark-warning-base hover:border-dark-warning-base hover:dark:border-dark-warning-base-hover text-light-warning-base-line dark:text-dark-warning-base-line',
    secondary: 'bg-light-secondary-base dark:bg-dark-secondary-base hover:bg-light-secondary-base-hover hover:dark:bg-dark-secondary-base border-2 border-light-secondary-base dark:border-dark-secondary-base hover:bg-light-secondary-base-hover hover:dark:border-dark-secondary-base-hover text-light-secondary-base-line dark:text-dark-secondary-base-line',
};

export default function Button({
    label = 'Button',
    className,
    size = 'sm',
    type,
    icon = '',
    onClick = () => alert('Please define your function!'),
    loadingFlag = false,
}: ButtonProps) {
    return (
        <button
            className={`rounded-sm shadow border-0 disabled:opacity-60 ${loadingFlag ? "cursor-not-allowed" : "cursor-pointer"} ${sizeClasses[size]} ${typeClasses[type]} ${className}`}
            disabled={loadingFlag}
            onClick={onClick}
        >
            {icon && <i className={`${icon} mr-2`}></i>}
            <span>{label}</span>
            {loadingFlag && <i className='fa-solid fa-spinner fa-spin ml-2'></i>}
        </button>
    );
}
