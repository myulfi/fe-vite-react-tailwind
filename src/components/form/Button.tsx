import { useRef, useState } from "react";
import { useClickOutside } from "../../hook/useClickOutside";

interface ButtonProps {
    label?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    type: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
    icon?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    menuArray?: {
        label?: string;
        icon?: string;
        onClick: () => void;
        autoCloseMenu?: boolean;
    }[];
    loadingFlag?: boolean;
}

const sizeClasses = {
    xs: 'text-xs p-1 text-[8px]',
    sm: 'text-sm px-2 py-1.5',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-2',
};

const typeClasses = {
    primary: 'button-primary',
    success: 'button-success',
    danger: 'button-danger',
    warning: 'button-warning',
    secondary: 'button-secondary'
    // default: 'button-default'
};

export default function Button({
    label,
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
                    w-full tablet:w-auto text-nowrap
                    rounded-t-container
                    ${menuOpenFlag ? 'rounded-b-none' : 'rounded-b-container'}
                    shadow border-0 disabled:opacity-60 w-auto
                    ${loadingFlag ? "cursor-not-allowed" : "cursor-pointer"}
                    ${sizeClasses[size]} ${typeClasses[type]}
                `}
                disabled={loadingFlag}
                onClick={(e) => menuArray.length > 0 ? setMenuOpenFlag((prev) => !prev) : onClick?.(e)}
            >
                {icon && <i className={`${icon} ${label ? 'mr-2' : ''}`} />}
                {label && <span>{label}</span>}
                <i
                    className={`
                        fa-solid fa-spinner fa-spin
                        transition-[opacity, transform] duration-300 ease-in-out
                        ${loadingFlag ? "opacity-100 max-w-[20px] ml-2" : "opacity-0 max-w-0 overflow-hidden"}
                    `}
                />
                {!loadingFlag && menuArray.length > 0 && <i className='fa-solid fa-chevron-down ml-2' />}
            </button>
            {menuArray.length > 0 && (
                <div
                    className={`
                        absolute w-48 right-0
                        bg-light-layout-primary dark:bg-dark-layout-primary
                        text-light-base-primary dark:text-dark-base-primary
                        border border-t-0 border-light-layout-trinity dark:border-dark-layout-trinity
                        rounded-tl-md rounded-b-md shadow-md z-20
                        transition-[opacity, transform] duration-300 ease-out origin-top
                        ${menuOpenFlag ? "scale-y-100 opacity-100 visible" : "scale-y-0 opacity-0 invisible pointer-events-none"}
                    `}
                >
                    {menuArray.map((menu, index) => (
                        <button
                            key={index}
                            className="w-full text-left px-4 py-2 hover:bg-light-layout-secondary hover:dark:bg-dark-layout-secondary cursor-pointer first:rounded-tl-md last:rounded-b-md flex items-center gap-2"
                            onClick={() => {
                                menu.onClick();
                                if (menu.autoCloseMenu) {
                                    setMenuOpenFlag(false);
                                }
                            }}
                        >
                            <i className={menu.icon}></i> {menu.label}
                        </button>
                    ))}
                </div>
            )}
        </div >
    );
}
