import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LOCAL_STORAGE, METHOD, SIDEBAR_WIDTH } from "../../../constants/common-constants";
import { apiRequest } from "../../../api";

type HeaderProps = {
    sidebarOpenFlag: boolean;
    setSidebarOpenFlag: React.Dispatch<React.SetStateAction<boolean>>;
    scrollDownFlag: boolean;
};

export default function Header({
    sidebarOpenFlag,
    setSidebarOpenFlag,
    scrollDownFlag
}: HeaderProps) {
    const [darkModeFlag, setDarkModeFlag] = useState(() => {
        const stored = localStorage.getItem('darkModeFlag')
        if (stored !== null) return stored === 'true'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    const rieghtMenuRef = useRef<HTMLDivElement>(null)
    const [rightMenuOpenFlag, setRightMenuOpenFlag] = useState(false)

    useEffect(() => {
        if (darkModeFlag) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        localStorage.setItem('darkModeFlag', darkModeFlag.toString())
    }, [darkModeFlag])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rieghtMenuRef.current && !rieghtMenuRef.current.contains(event.target as Node)) {
                setRightMenuOpenFlag(false)
            }
        }

        if (rightMenuOpenFlag) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [rightMenuOpenFlag])

    const doLogout = async () => {
        try {
            await apiRequest(METHOD.POST, '/remove-token.json')
        } catch (error) {
            // setToast({ type: "failed", message: error.response?.data?.message ?? error.message })
        } finally {
            localStorage.removeItem(LOCAL_STORAGE.ACCESS_TOKEN)
            localStorage.removeItem(LOCAL_STORAGE.REFRESH_TOKEN)
            localStorage.removeItem(LOCAL_STORAGE.NAME)
            localStorage.removeItem(LOCAL_STORAGE.ROLE)
            window.location.reload()
        }
    }

    return (
        <div
            className={`sticky top-0 z-10 transition-all duration-500 shadow-inner text-sm p-4 bg-primary dark:bg-primary-dark text-secondary-dark dark:text-primary-dark flex items-center justify-between ${sidebarOpenFlag ? `ml-[${SIDEBAR_WIDTH}px]` : 'ml-0'} ${scrollDownFlag ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <div className="flex items-center gap-3 flex-1">
                <button
                    className="icon-primary cursor-pointer p-1"
                    onClick={() => setSidebarOpenFlag(!sidebarOpenFlag)}
                    aria-label="Open sidebar"
                >
                    <i className="fa-solid fa-bars text-2xl" />
                </button>
                {/* <h1 className="text-2xl font-semibold max-sm:hidden">Dashboard Content</h1> */}
            </div>

            <div className="mx-2">
                <button
                    onClick={() => setDarkModeFlag(!darkModeFlag)}
                    className={`cursor-pointer w-14 h-6 flex items-center px-1 rounded-full transition-colors duration-300 ${darkModeFlag ? 'bg-yellow-500' : 'bg-gray-400'}`}
                >
                    <span className="text-xs px-1">{darkModeFlag ? '☀️' : ''}</span>
                    <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${darkModeFlag ? 'translate-x-1' : 'translate-x-0'}`}
                    />
                    <span className="text-xs px-1">{!darkModeFlag ? '🌙' : ''}</span>
                </button>
            </div>

            <div className="relative" ref={rieghtMenuRef}>
                <button
                    onClick={() => setRightMenuOpenFlag(!rightMenuOpenFlag)}
                    className="icon-primary hover:cursor-pointer focus:outline-none flex items-center"
                >
                    <i className="fa-solid fa-circle-user text-2xl" />
                </button>

                {rightMenuOpenFlag && (
                    <div id="div_menu_right" className="fixed right-4 top-16 w-48 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark border border-tertiary dark:border-tertiary-dark rounded shadow-md z-20">
                        <Link to="/profile" onClick={() => setRightMenuOpenFlag(false)} className='w-full text-left px-4 py-2 hover:bg-tertiary dark:hover:bg-tertiary-dark hover:cursor-pointer flex items-center gap-2'>
                            <i className="fa-solid fa-circle-user" /> Profile
                        </Link>
                        <Link to="/setting" onClick={() => setRightMenuOpenFlag(false)} className='w-full text-left px-4 py-2 hover:bg-tertiary dark:hover:bg-tertiary-dark hover:cursor-pointer flex items-center gap-2'>
                            <i className="fa-solid fa-gear" /> Settings
                        </Link>
                        <hr className="my-1 border-t border-gray-200" />
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-tertiary dark:hover:bg-tertiary-dark hover:cursor-pointer flex items-center gap-2 text-red-500"
                            onClick={() => doLogout()}>
                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}