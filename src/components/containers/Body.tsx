import { useEffect, useRef, useState } from "react"
import Routes from "../../routes"
import Header from "./body/Header"
import Footer from "./body/Footer"

type BodyProps = {
    sidebarOpenFlag: boolean;
    setSidebarOpenFlag: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Body({
    sidebarOpenFlag,
    setSidebarOpenFlag,
}: BodyProps) {
    const [scrollDownFlag, setScrollDownFlag] = useState(false);
    const prevScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > prevScrollY.current + 10) {
                setScrollDownFlag(true)
            } else if (currentScrollY < prevScrollY.current - 10) {
                setScrollDownFlag(false)
            }

            prevScrollY.current = currentScrollY
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className={`
            flex flex-col flex-1 min-h-screen relative 
            bg-light-clear-secondary dark:bg-dark-clear-secondary
            transition-[margin] duration-500 ease-out ${sidebarOpenFlag ? `max-sm:hidden md:ml-[256px] max-md:ml-0` : 'ml-0'}
        `}>
            <Header sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} scrollDownFlag={scrollDownFlag} />

            <main className={`text-light-base-line dark:text-dark-base-line z-0`}>
                <Routes />
            </main>

            <Footer scrollDownFlag={scrollDownFlag} />
        </div>
    )
}