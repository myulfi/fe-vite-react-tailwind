import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LOCAL_STORAGE, SIDEBAR_WIDTH } from "../../../constants/common-constants";
import { apiRequest } from "../../../api";
import { useClickOutside } from "../../../hook/useClickOutside";

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

    useClickOutside(rieghtMenuRef, () => setRightMenuOpenFlag(false));

    const doLogout = async () => {
        try {
            await apiRequest('post', '/remove-token.json')
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
            className={`sticky top-0 z-10 transition-all duration-500 shadow-inner text-sm py-6 px-4 bg-light-clear dark:bg-dark-clear text-light-base dark:text-dark-base flex items-center justify-between ${sidebarOpenFlag ? `md:ml-[256px] max-md:ml-0` : 'ml-0'} ${scrollDownFlag ? 'max-sm:-translate-y-full' : 'translate-y-0'}`}
        >
            <div className="flex items-center gap-3 flex-1">
                <button
                    className="text-light-base dark:text-dark-base hover:text-light-base-secondary hover:dark:text-dark-base-secondary cursor-pointer p-1"
                    onClick={() => setSidebarOpenFlag(!sidebarOpenFlag)}
                    aria-label="Open sidebar"
                >
                    <i className="fa-solid fa-bars text-2xl" />
                </button>
                {/* <h1 className="text-light-base-line dark:text-dark-base-line text-2xl font-semibold max-sm:hidden">Dashboard Content</h1> */}
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
                    className="text-light-base dark:text-dark-base hover:text-light-base-secondary hover:dark:hover:text-dark-base-secondary cursor-pointer focus:outline-none flex items-center"
                >
                    <i className="fa-solid fa-circle-user text-2xl" />
                </button>

                {rightMenuOpenFlag && (
                    <div id="div_menu_right" className="fixed right-4 top-16 w-48 bg-light-clear dark:bg-dark-clear text-light-base dark:text-dark-base border border-t-0 border-light-outline dark:border-dark-outline rounded-b-md shadow-md z-20">
                        <Link to="/profile" onClick={() => setRightMenuOpenFlag(false)} className='w-full text-left px-4 py-2 hover:bg-light-base hover:dark:bg-dark-base hover:text-light-clear hover:dark:text-dark-clear cursor-pointer flex items-center gap-2'>
                            <i className="fa-solid fa-circle-user" /> Profile
                        </Link>
                        <Link to="/setting" onClick={() => setRightMenuOpenFlag(false)} className='w-full text-left px-4 py-2 hover:bg-light-base hover:dark:bg-dark-base hover:text-light-clear hover:dark:text-dark-clear cursor-pointer flex items-center gap-2'>
                            <i className="fa-solid fa-gear" /> Settings
                        </Link>
                        <hr className="my-1 border-t border-light-base dark:border-dark-base" />
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-light-base hover:dark:bg-dark-base hover:text-light-clear hover:dark:text-dark-clear cursor-pointer rounded-b-md flex items-center gap-2"
                            onClick={() => doLogout()}>
                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}