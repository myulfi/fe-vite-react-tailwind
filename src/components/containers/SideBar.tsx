import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { LOCAL_STORAGE, SIDEBAR_WIDTH } from "../../constants/common-constants"
import { apiRequest } from "../../api"
import { useTranslation } from "react-i18next"

type MenuItem = {
    name: string
    icon?: React.ReactNode
    path?: string
    children?: MenuItem[]
}

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
            <div className="relative text-light-base-line-secondary dark:text-dark-base-line-secondary">
                {level > 0 && (
                    <span className='absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-2 bg-light-clear dark:bg-dark-clear rounded-full'></span>
                )}

                {item.path && !hasChildrenFlag ? (
                    <Link
                        to={item.path}
                        onClick={onNavigate}
                        className={`flex items-center w-full p-2 hover:text-light-base-line hover:dark:hover:text-dark-base-line hover:bg-light-clear-secondary hover:dark:bg-dark-clear-secondary cursor-pointer rounded-l-lg ${activeFlag ? 'text-light-base-line dark:text-dark-base-line bg-light-clear-secondary dark:bg-dark-clear-secondary font-semibold' : ''}`}
                    >
                        {item.icon && <span className='mr-2'><i className={`${item.icon}`} /></span>}
                        {t(item.name)}
                    </Link>
                ) : (
                    <button
                        onClick={handleClick}
                        className="flex items-center w-full p-2 pl-2 hover:text-light-base-line hover:dark:hover:text-dark-base-line hover:bg-light-clear-secondary hover:dark:bg-dark-clear-secondary cursor-pointer rounded-l-lg"
                    >
                        {item.icon && <span className="mr-2"><i className={`${item.icon}`} /></span>}
                        {t(item.name)}
                        {hasChildrenFlag && <span className="ml-auto pr-4"><i className={`fa-solid text-xs ${openFlag ? 'fa-angle-down' : 'fa-angle-right'}`} /></span>}
                    </button>
                )}
            </div>

            <div
                className={`
                    overflow-hidden
                    transition-all duration-500 ease-in-out
                    ${openFlag ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                {openFlag && hasChildrenFlag && (
                    <div className="ml-4 pl-4 border-l border-light-clear dark:border-dark-clear">
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

    return (
        <div
            className={`
                fixed top-0 left-0 h-full overflow-y-auto
                bg-light-clear dark:bg-dark-clear
                text-light-base-line dark:text-dark-base-line
                z-20 sm:w-[256px] max-sm:w-screen
                transition-transform duration-500 ease-in-out
                ${sidebarOpenFlag ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className='relative border-b border-light-clear dark:border-dark-clear pb-4 m-4'>
                <span className='block text-center font-bold text-3xl text-light-base dark:text-dark-base'><i className='fa-solid fa-earth-asia mr-1' />EasyCrazy</span>
                <button
                    onClick={() => setSidebarOpenFlag(false)}
                    className='absolute right-0 top-0 md:hidden cursor-pointer'
                    aria-label='Close sidebar'
                >
                    <i className='fa-solid fa-xmark' />
                </button>
            </div>

            <nav className='pl-4'>

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