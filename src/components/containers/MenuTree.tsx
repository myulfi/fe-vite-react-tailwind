import { useEffect, useState } from "react";

type MenuItem = {
    name: string
    icon?: React.ReactNode
    path?: string
    children?: MenuItem[]
};

const SidebarItem: React.FC<{ item: MenuItem; level?: number; onNavigate?: () => void }> = ({ item, level = 0, onNavigate }) => {
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

                {!hasChildrenFlag ? (
                    // Link
                    <span
                        // to={item.path}
                        onClick={onNavigate}
                        className={`
                            flex items-center w-full p-2
                            hover:text-light-base-line hover:dark:hover:text-dark-base-line
                            hover:bg-light-clear-secondary hover:dark:bg-dark-clear-secondary
                            cursor-pointer rounded-l-lg
                            ${activeFlag ? 'text-light-base-line dark:text-dark-base-line bg-light-clear-secondary dark:bg-dark-clear-secondary font-semibold' : ''}`}
                    >
                        {item.icon && <span className='mr-2'><i className={`${item.icon}`} /></span>}
                        <span className='mr-2'><i className={"fa-solid fa-file-lines"} /></span>
                        {item.name}
                    </span>
                ) : (
                    <button
                        onClick={handleClick}
                        className={`
                            flex items-center w-full p-2 pl-2
                            hover:text-light-base-line hover:dark:hover:text-dark-base-line
                            hover:bg-light-clear-secondary hover:dark:bg-dark-clear-secondary
                            cursor-pointer rounded-l-lg`
                        }
                    >
                        <span className='mr-2'><i className={"fa-solid fa-folder-open"} /></span>
                        {item.name}
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

export default function MenuTree({ menuList = [] }) {
    const [tabletFlag, setTabletFlag] = useState(false);
    const [sidebarOpenFlag, setSidebarOpenFlag] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 321;
            const tablet = window.innerWidth < 769;
            setTabletFlag(tablet);
            setSidebarOpenFlag(!mobile);
        }

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="bg-light-clear dark:bg-dark-clear">
            <div
                className={`
                flex flex-col
                fixed top-0 left-0 h-full
                bg-light-clear dark:bg-dark-clear
                text-light-base-line dark:text-dark-base-line
                z-20 sm:w-[256px] max-sm:w-screen
                transition-[translate] duration-500 ease-in-out
                ${sidebarOpenFlag ? 'translate-x-0' : '-translate-x-full'}
            `}
            >
                <div className='relative border-b border-light-clear dark:border-dark-clear pb-4 m-4 shrink-0'>
                    <span className='block text-center font-bold text-3xl text-light-base dark:text-dark-base'><i className='fa-solid fa-earth-asia mr-1' />EasyCrazy</span>
                    <button
                        onClick={() => setSidebarOpenFlag(false)}
                        className='absolute right-0 top-0 md:hidden cursor-pointer'
                        aria-label='Close sidebar'
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

            <div className={`
            flex flex-col flex-1 min-h-screen relative 
            bg-light-clear-secondary dark:bg-dark-clear-secondary
            transition-[margin] duration-500 ease-out ${sidebarOpenFlag ? `max-sm:hidden md:ml-[256px] max-md:ml-0` : 'ml-0'}
        `}>
                <main className={`text-light-base-line dark:text-dark-base-line z-0`}>
                    Ini Content
                </main>
            </div>
        </div>
    )
}