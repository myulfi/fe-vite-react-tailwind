import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LOCAL_STORAGE } from "../../../constants/common-constants";
import { apiRequest } from "../../../api";
import { useClickOutside } from "../../../hook/useClickOutside";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const [darkModeFlag, setDarkModeFlag] = useState(() => {
        const stored = localStorage.getItem('darkModeFlag');
        if (stored !== null) return stored === 'true'
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    })

    const rightMenuRef = useRef<HTMLDivElement>(null);
    const [rightMenuOpenFlag, setRightMenuOpenFlag] = useState(false);

    useEffect(() => {
        if (darkModeFlag) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        localStorage.setItem('darkModeFlag', darkModeFlag.toString())
    }, [darkModeFlag])

    useClickOutside(rightMenuRef, () => setRightMenuOpenFlag(false));

    const menu = [
        {
            "name": "text.profile",
            "icon": "fa-solid fa-circle-user",
            "path": "/profile.html",
        },
        {
            "name": "text.setting",
            "icon": "fa-solid fa-gear",
            "path": "/setting.html",
        }
    ];

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
            className={`
                sticky top-0
                z-layout shadow-inner
                py-6 px-element
                color-main
                flex flex-row items-center justify-between
                transition-[translate] duration-500 ease-out
                ${scrollDownFlag ? '-translate-y-full tablet:translate-y-0' : 'translate-y-0'}
            `}
        >
            <div className='flex-1'>
                <button
                    className='color-main-link cursor-pointer p-1'
                    onClick={() => setSidebarOpenFlag(!sidebarOpenFlag)}
                    aria-label={t('text.openSidebar')}
                >
                    <i className='fa-solid fa-bars text-2xl' />
                </button>
                {/* <h1 className="text-light-label-fg dark:text-dark-label-fg text-2xl font-semibold max-sm:hidden">Dashboard Content</h1> */}
            </div>

            <div className='mx-additional'>
                <button
                    onClick={() => setDarkModeFlag(!darkModeFlag)}
                    className={`
                        flex flex-row items-center
                        w-14 h-6
                        px-1 rounded-full
                        transition-colors duration-300
                        ${darkModeFlag ? 'bg-yellow-500' : 'bg-gray-400'}
                        cursor-pointer
                    `}
                >
                    <span className='text-xs px-1'>{darkModeFlag ? '☀️' : ''}</span>
                    <div
                        className={`
                            bg-light-base-bg w-element h-element rounded-full shadow-md
                            transform transition-[translate] duration-300
                            ${darkModeFlag ? 'translate-x-1' : 'translate-x-0'}
                        `}
                    />
                    <span className='text-xs px-1'>{!darkModeFlag ? '🌙' : ''}</span>
                </button>
            </div>

            <div className='relative' ref={rightMenuRef}>
                <button
                    onClick={() => setRightMenuOpenFlag(!rightMenuOpenFlag)}
                    className='color-main-link cursor-pointer focus:outline-none'
                >
                    <i className='fa-solid fa-circle-user text-2xl' />
                </button>

                <div className={`
                        fixed right-element top-20 w-48
                        color-dropdown
                        rounded-b-container shadow-md z-dropdown
                        transition-[opacity, transform] duration-300 ease-in-out
                        ${rightMenuOpenFlag ? 'translate-y-0 opacity-100 visible' : '-translate-y-5 opacity-0 invisible pointer-events-none'}
                    `}>
                    {
                        menu.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                onClick={() => setRightMenuOpenFlag(false)}
                                className={`
                                    flex items-center gap-additional
                                    w-full text-left
                                    px-element py-additional
                                    color-dropdown-item
                                    cursor-pointer
                                `}
                            >
                                <i className={item.icon} />{t(item.name)}
                            </Link>
                        ))
                    }
                    <hr className='color-divider' />
                    <button
                        className={`
                            flex items-center gap-additional
                            w-full text-left
                            px-element py-additional
                            color-dropdown-item
                            cursor-pointer
                            rounded-b-container
                        `}
                        onClick={() => doLogout()}>
                        <i className='fa-solid fa-arrow-right-from-bracket'></i>{t('text.logout')}
                    </button>
                </div>
            </div>
        </div>
    )
}