import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HTTP_CODE, LOCAL_STORAGE } from "../../constants/common-constants";
import { apiRequest } from "../../api";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "../../hook/useClickOutside";
import { toast } from "../../ToastContext";

type MenuItem = {
    name: string
    icon?: React.ReactNode
    path?: string
    children?: MenuItem[]
};

const SidebarItem: React.FC<{ item: MenuItem; level?: number; onNavigate?: () => void }> = ({ item, level = 0, onNavigate }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [openFlag, setOpenFlag] = useState(false);
    const hasChildrenFlag = !!item.children?.length;

    const activeFlag = item.path === location.pathname;

    const hasActiveChildFlag = (children?: MenuItem[]): boolean => {
        if (!children) return false;
        return children.some(child => {
            if (child.path && location.pathname === child.path) return true;
            return hasActiveChildFlag(child.children);
        })
    }

    useEffect(() => {
        if (hasActiveChildFlag(item.children)) {
            setOpenFlag(true)
        }
    }, [location.pathname])

    const handleClick = () => {
        if (hasChildrenFlag) setOpenFlag(!openFlag)
    }

    return (
        <Fragment>
            <div className='flex flex-row color-label'>
                {
                    level > 0 &&
                    <div>
                        <span
                            className={`
                                relative inline-block
                                translate-y-2 -translate-x-1
                                w-2 h-2 mr-1 rounded-full
                                bg-light-layout-trinity dark:bg-dark-layout-trinity
                            `}
                        ></span>
                    </div>
                }
                {
                    item.path && !hasChildrenFlag ? (
                        <Link
                            to={item.path}
                            onClick={onNavigate}
                            className={`
                                flex flex-row w-full p-additional
                                cursor-pointer rounded-l-element
                                ${activeFlag
                                    ? 'color-label-active-link font-highlight'
                                    : 'color-label-link'
                                }
                            `}
                        >
                            {item.icon && <span className='mr-2'><i className={`${item.icon}`} /></span>}
                            {t(item.name)}
                        </Link>
                    ) : (
                        <button
                            onClick={handleClick}
                            className={`
                                flex flex-row w-full p-additional
                                color-label-link
                                cursor-pointer rounded-l-element
                            `}
                        >
                            {item.icon && <span className="mr-2"><i className={`${item.icon}`} /></span>}
                            {t(item.name)}
                            {
                                hasChildrenFlag &&
                                <span className='ml-auto pr-element'>
                                    <i className={`fa-solid text-xs ${openFlag ? 'fa-angle-down' : 'fa-angle-right'}`} />
                                </span>
                            }
                        </button>
                    )
                }
            </div>

            <div
                className={`
                    overflow-hidden
                    transition-[max-height, opacity]
                    ${openFlag ? "duration-500" : "duration-300"} ease-in-out
                    ${openFlag ? "max-h-[1000px] opacity-100 visible" : "max-h-0 opacity-0 invisible pointer-events-none"}
                `}
            >
                {(
                    <div
                        className={`
                            relative
                            ${level === 1 ? 'ml-7' : 'ml-element'}
                            border-l border-light-layout-trinity dark:border-dark-layout-trinity
                        `}
                    >
                        {item.children!.map((c, i) => (
                            <SidebarItem key={i} item={c} level={level + 1} onNavigate={onNavigate} />
                        ))}
                    </div>
                )}
            </div>
        </Fragment>
    )
}

type SideBarProps = {
    tabletFlag: boolean;
    sidebarOpenFlag: boolean;
    setSidebarOpenFlag: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SideBar({
    tabletFlag,
    sidebarOpenFlag,
    setSidebarOpenFlag,
}: SideBarProps) {
    const { t } = useTranslation();
    const [menuList, setMenuList] = useState([]);

    useEffect(() => {
        // i18n.changeLanguage(Cookies.get(CommonConstants.COOKIES.LANGUAGE) ?? "en")
        const fetchMenu = async () => {
            if (localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN) !== null) {
                const response = await apiRequest('get', '/main/menu.json');
                if (HTTP_CODE.OK === response.status) {
                    setMenuList(response.data);
                } else {
                    toast.show({ type: 'error', message: response.message });
                }
            };
        };
        fetchMenu();
    }, []);

    const sideBarRef = useRef<HTMLDivElement>(null);
    useClickOutside(sideBarRef, () => setSidebarOpenFlag(sidebarOpenFlag => tabletFlag ? false : sidebarOpenFlag));

    return (
        <div
            ref={sideBarRef}
            className={`
                flex flex-col
                fixed top-0 left-0 h-full
                color-main
                z-dropdown w-screen tablet:w-sidebar
                transition-[translate] duration-500 ease-in-out
                ${sidebarOpenFlag ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className='relative p-4 py-6'>
                <span className='block text-center text-logo'>
                    <i className='fa-solid fa-earth-asia pr-2' />
                    EasyCrazy
                </span>
                <button
                    onClick={() => setSidebarOpenFlag(false)}
                    className='absolute right-element top-container desktop:hidden cursor-pointer'
                    aria-label={t('text.closeSidebar')}
                >
                    <i className='fa-solid fa-xmark' />
                </button>
            </div>

            <div className='flex-1 overflow-y-auto'>
                <nav className='flex flex-col ml-element'>
                    {menuList.map((item, idx) => (
                        <SidebarItem
                            key={idx}
                            item={item}
                            onNavigate={() => {
                                if (tabletFlag) {
                                    setSidebarOpenFlag(false)
                                }
                            }}
                        />
                    ))}
                </nav>
            </div>
        </div>
    )
}