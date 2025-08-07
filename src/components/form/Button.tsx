import { useRef, useState } from "react";
import { useClickOutside } from "../../hook/useClickOutside";

interface ButtonProps {
    label?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    type: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
    icon?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    menuArray?: {
        label?: string;
        icon?: string;
        onClick: () => void;
    }[];
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
    onClick = () => { menuArray.length === 0 ? alert('Please define your function!') : "" },
    menuArray = [],
    loadingFlag = false,
}: ButtonProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const [menuOpenFlag, setMenuOpenFlag] = useState(false);

    if (menuArray.length > 0) {
        useClickOutside(menuRef, () => setMenuOpenFlag(false));
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                className={`
                    rounded-t-sm
                    ${menuOpenFlag ? 'rounded-b-none' : 'rounded-b-sm'}
                    shadow border-0 disabled:opacity-60
                    ${loadingFlag ? "cursor-not-allowed" : "cursor-pointer"}
                    ${sizeClasses[size]} ${typeClasses[type]} ${className}
                `}
                disabled={loadingFlag}
                onClick={(e) => menuArray.length > 0 ? setMenuOpenFlag((prev) => !prev) : onClick?.(e)}
            >
                {icon && <i className={`${icon} mr-2`} />}
                <span>{label}</span>
                {loadingFlag && <i className='fa-solid fa-spinner fa-spin ml-2' />}
            </button>
            {
                menuOpenFlag
                && menuArray.length > 0
                && <div className="absolute w-48 right-0 bg-light-clear dark:bg-dark-clear text-light-base dark:text-dark-base border border-t-0 border-light-divider dark:border-dark-divider rounded-tl-md rounded-b-md shadow-md z-20">
                    {
                        menuArray.map((menu) => (
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-light-base hover:dark:bg-dark-base hover:text-light-clear hover:dark:text-dark-clear cursor-pointer first:rounded-tl-md last:rounded-b-md flex items-center gap-2"
                                onClick={menu.onClick}>
                                <i className={menu.icon}></i> {menu.label}
                            </button>
                        ))
                    }
                </div>
            }
        </div >
    );
}
