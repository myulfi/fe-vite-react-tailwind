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
            <div className="relative text-light-label-secondary-fg dark:text-dark-label-secondary-fg">
                {level > 0 && (
                    <span className='absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-2 bg-light-base-bg dark:bg-dark-base-bg rounded-full'></span>
                )}

                {!hasChildrenFlag ? (
                    // Link
                    <span
                        // to={item.path}
                        onClick={onNavigate}
                        className={`
                            flex items-center w-full p-2
                            hover:text-light-label-fg hover:dark:hover:text-dark-label-fg
                            hover:bg-light-base-secondary-bg hover:dark:bg-dark-base-secondary-bg
                            cursor-pointer rounded-l-lg
                            ${activeFlag ? 'text-light-label-fg dark:text-dark-label-fg bg-light-base-secondary-bg dark:bg-dark-base-secondary-bg font-semibold' : ''}`}
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
                            hover:text-light-label-fg hover:dark:hover:text-dark-label-fg
                            hover:bg-light-base-secondary-bg hover:dark:bg-dark-base-secondary-bg
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
                    <div className="ml-4 pl-4 border-l border-light-base-bg dark:border-dark-base-bg">
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
        <div className="bg-light-base-bg dark:bg-dark-base-bg">
            <div
                className={`
                flex flex-col
                fixed top-0 left-0 h-full
                bg-light-base-bg dark:bg-dark-base-bg
                text-light-label-fg dark:text-dark-label-fg
                z-20 sm:w-[256px] max-sm:w-screen
                transition-[translate] duration-500 ease-in-out
                ${sidebarOpenFlag ? 'translate-x-0' : '-translate-x-full'}
            `}
            >
                <div className='relative border-b border-light-base-bg dark:border-dark-base-bg pb-4 m-4 shrink-0'>
                    {/* <span className='block text-center font-bold text-3xl text-light-base-fg dark:text-dark-base-fg'><i className='fa-solid fa-earth-asia mr-1' />EasyCrazy</span> */}
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
                bg-light-base-secondary-bg dark:bg-dark-base-secondary-bg
                transition-[margin] duration-500 ease-out ${sidebarOpenFlag ? `max-sm:hidden md:ml-[256px] max-md:ml-0` : 'ml-0'}
            `}>
                <main className={`text-light-label-fg dark:text-dark-label-fg z-0`}>
                    Ini Content
                </main>
            </div>
        </div>
    )
}