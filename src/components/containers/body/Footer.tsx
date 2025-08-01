import { SIDEBAR_WIDTH } from "../../../constants/common-constants";

type FooterProps = {
    sidebarOpenFlag: boolean;
    scrollDownFlag: boolean;
};

export default function Footer({
    sidebarOpenFlag,
    scrollDownFlag
}: FooterProps) {
    return (
        <footer
            className={`fixed bottom-0 w-full z-0 transition-all duration-500 shadow-inner text-sm p-4 bg-primary-layout dark:bg-primary-layout-dark text-on-primary dark:text-on-primary-dark ${sidebarOpenFlag ? `ml-[${SIDEBAR_WIDTH}px]` : 'ml-0'} ${scrollDownFlag ? 'translate-y-full' : 'translate-y-0'}`}>
            &copy; {new Date().getFullYear()} SAPA UMKM. All rights reserved.
        </footer>
    )
}