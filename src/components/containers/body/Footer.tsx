export default function Footer({ scrollDownFlag }: { scrollDownFlag: boolean }) {
    return (
        <footer
            className={`
                fixed bottom-0 w-full z-0 shadow-inner text-sm p-4
                bg-light-clear dark:bg-dark-clear
                text-light-base dark:text-dark-base
                transition-[translate] duration-500 ease-out
                ${scrollDownFlag ? 'translate-y-full' : 'translate-y-0'}
            `}>
            &copy; {new Date().getFullYear()} All rights reserved.
        </footer>
    )
}