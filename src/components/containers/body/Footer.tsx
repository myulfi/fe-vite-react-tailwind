import { useTranslation } from "react-i18next";

export default function Footer({ scrollDownFlag }: { scrollDownFlag: boolean }) {
    const { t } = useTranslation();
    return (
        <footer
            className={`
                fixed bottom-0 w-full z-base shadow-inner
                text-sm p-element color-main
                transition-[translate] duration-500 ease-out
                ${scrollDownFlag ? 'translate-y-full' : 'translate-y-0'}
            `}>
            &copy;&nbsp;{new Date().getFullYear()}&nbsp;{t("text.allRightReserved")}
        </footer>
    )
}