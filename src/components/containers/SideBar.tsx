import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { SIDEBAR_WIDTH } from "../../constants/common-constants"

type MenuItem = {
    label: string
    icon?: React.ReactNode
    link?: string
    children?: MenuItem[]
}
// const menuData: MenuItem[] = [
//     {
//         label: 'Home',
//         icon: "fa-solid fa-house",
//         link: '/',
//     },
//     {
//         label: 'Pengusaha',
//         icon: "fa-solid fa-user-tie",
//         link: '/businessman',
//     },
// ]
const menuData: MenuItem[] = [
    {
        label: 'Home',
        icon: 'fa-solid fa-house',
        link: '/',
    },
    {
        label: 'Analytics',
        icon: 'fa-solid fa-house',
        children: [
            {
                label: 'Reports',
                children: [
                    {
                        label: 'Daily',
                        children: [
                            { label: 'Morning', link: '/analytics/reports/daily/morning' },
                            { label: 'Afternoon', link: '/analytics/reports/daily/afternoon' },
                        ],
                    },
                    { label: 'Monthly', link: '/analytics/reports/monthly' },
                ],
            },
            { label: 'Insights', link: '/insights' },
        ],
    },
    {
        label: 'Example Template',
        icon: 'fa-solid fa-house',
        link: '/test/example-template.html',
    },
]

const SidebarItem: React.FC<{ item: MenuItem; level?: number; onNavigate?: () => void }> = ({ item, level = 0, onNavigate }) => {
    const location = useLocation()
    const [openFlag, setOpenFlag] = useState(false)
    const hasChildrenFlag = !!item.children?.length

    const activeFlag = item.link === location.pathname

    const hasActiveChildFlag = (children?: MenuItem[]): boolean => {
        if (!children) return false
        return children.some(child => {
            if (child.link && location.pathname === child.link) return true
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

                {item.link && !hasChildrenFlag ? (
                    <Link
                        to={item.link}
                        onClick={onNavigate}
                        className={`flex items-center w-full p-2 hover:text-light-base-line hover:dark:hover:text-dark-base-line hover:bg-light-clear-secondary hover:dark:bg-dark-clear-secondary cursor-pointer rounded-l-lg ${activeFlag ? 'text-light-base-line dark:text-dark-base-line bg-light-clear-secondary dark:bg-dark-clear-secondary font-semibold' : ''}`}
                    >
                        {item.icon && <span className='mr-2'><i className={`${item.icon}`} /></span>}
                        {item.label}
                    </Link>
                ) : (
                    <button
                        onClick={handleClick}
                        className="flex items-center w-full p-2 pl-2 hover:text-light-base-line hover:dark:hover:text-dark-base-line hover:bg-light-clear-secondary hover:dark:bg-dark-clear-secondary cursor-pointer rounded-l-lg"
                    >
                        {item.icon && <span className="mr-2"><i className={`${item.icon}`} /></span>}
                        {item.label}
                        {hasChildrenFlag && <span className="ml-auto pr-4"><i className={`fa-solid text-xs ${openFlag ? 'fa-angle-down' : 'fa-angle-right'}`} /></span>}
                    </button>
                )}
            </div>

            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openFlag ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
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
    mobileFlag: boolean;
    sidebarOpenFlag: boolean;
    setSidebarOpenFlag: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SideBar({
    mobileFlag,
    sidebarOpenFlag,
    setSidebarOpenFlag,
}: SideBarProps) {
    return (
        <div
            className={`fixed top-0 left-0 h-full overflow-y-auto bg-light-clear dark:bg-dark-clear text-light-base-line dark:text-dark-base-line z-20 transition-transform duration-500 ease-in-out w-screen md:w-[256px] ${sidebarOpenFlag ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className='relative border-b border-light-clear dark:border-dark-clear pb-4 m-4'>
                <span className='block text-center font-bold text-lg'>SAPA UMKM</span>
                {
                    mobileFlag &&
                    <button
                        onClick={() => setSidebarOpenFlag(false)}
                        className='absolute right-0 top-0 text-light-clear dark:text-dark-clear cursor-pointer'
                        aria-label='Close sidebar'
                    >
                        <i className='fa-solid fa-xmark'></i>
                    </button>
                }
            </div>

            <nav className='pl-4'>
                {menuData.map((item, idx) => (
                    <SidebarItem
                        key={idx}
                        item={item}
                        onNavigate={() => {
                            if (mobileFlag) {
                                setSidebarOpenFlag(false)
                            }
                        }}
                    />
                ))}
            </nav>
        </div>
    )
}