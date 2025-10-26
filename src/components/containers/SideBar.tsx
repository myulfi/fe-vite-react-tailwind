import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LOCAL_STORAGE } from "../../constants/common-constants";
import { apiRequest } from "../../api";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "../../hook/useClickOutside";

type MenuItem = {
    name: string
    icon?: React.ReactNode
    path?: string
    children?: MenuItem[]
};

const SidebarItem: React.FC<{ item: MenuItem; level?: number; onNavigate?: () => void }> = ({ item, level = 0, onNavigate }) => {
    const { t } = useTranslation();
    const location = useLocation()
    const [openFlag, setOpenFlag] = useState(false)
    const hasChildrenFlag = !!item.children?.length

    const activeFlag = item.path === location.pathname

    const hasActiveChildFlag = (children?: MenuItem[]): boolean => {
        if (!children) return false
        return children.some(child => {
            if (child.path && location.pathname === child.path) return true
            return hasActiveChildFlag(child.children)
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
        <div className="relative">
            <div className="relative color-label">
                {level > 0 && (
                    <span className='absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full'></span>
                )}

                {item.path && !hasChildrenFlag ? (
                    <Link
                        to={item.path}
                        onClick={onNavigate}
                        className={`
                            flex items-center w-full p-2
                            cursor-pointer rounded-l-lg
                            ${activeFlag ? 'color-label-active-link font-semibold' : 'color-label-link'}`}
                    >
                        {item.icon && <span className='pr-2'><i className={`${item.icon}`} /></span>}
                        {t(item.name)}
                    </Link>
                ) : (
                    <button
                        onClick={handleClick}
                        className={`
                            flex items-center w-full p-2
                            color-label-link
                            cursor-pointer rounded-l-lg`
                        }
                    >
                        {item.icon && <span className="pr-2"><i className={`${item.icon}`} /></span>}
                        {t(item.name)}
                        {hasChildrenFlag && <span className="ml-auto pr-4"><i className={`fa-solid text-xs ${openFlag ? 'fa-angle-down' : 'fa-angle-right'}`} /></span>}
                    </button>
                )}
            </div>

            <div
                className={`
                    overflow-hidden
                    transition-[max-height, opacity] ${openFlag ? "duration-500" : "duration-300"} ease-in-out
                    ${openFlag ? "max-h-[1000px] opacity-100 visible" : "max-h-0 opacity-0 invisible pointer-events-none"}
                `}
            >
                {(
                    <div className="pl-8">
                        {item.children!.map((c, i) => (
                            <SidebarItem key={i} item={c} level={level + 1} onNavigate={onNavigate} />
                        ))}
                    </div>
                )}
            </div>
        </div>
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
            try {
                if (localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN) !== null) {
                    const response = await apiRequest("get", "/main/menu.json");
                    setMenuList(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch menu:", error);
            }
        };

        fetchMenu();
    }, []);

    const sideBarRef = useRef<HTMLDivElement>(null);
    useClickOutside(sideBarRef, () => {
        if (tabletFlag) {
            setSidebarOpenFlag(false);
        }
    });

    return (
        <div
            ref={sideBarRef}
            className={`
                flex flex-col
                fixed top-0 left-0 h-full
                color-main
                z-20 sm:w-sidebar max-sm:w-screen
                transition-[translate] duration-500 ease-in-out
                ${sidebarOpenFlag ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className='relative p-4 pb-7 shrink-0'>
                <span className='block text-center font-bold text-3xl'><i className='fa-solid fa-earth-asia mr-1' />EasyCrazy</span>
                <button
                    onClick={() => setSidebarOpenFlag(false)}
                    className='absolute right-4 top-6 md:hidden cursor-pointer'
                    aria-label={t("text.closeSidebar")}
                >
                    <i className='fa-solid fa-xmark' />
                </button>
            </div>

            <nav className='pl-4 overflow-y-auto flex-1'>
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
    )
}