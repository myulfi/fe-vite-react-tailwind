import React, {
    useEffect,
    useState,
    createContext,
    useContext,
    useRef,
} from "react";
import { createPortal } from "react-dom";
import Button from "./components/form/Button";
import { useTranslation } from "react-i18next";
import type { ButtonArray } from "./constants/common-constants";
import { decode } from "./function/commonHelper";

const ModalStackContext = createContext<{
    registerModal: () => number;
    unregisterModal: (z: number) => void;
} | null>(null);

export function ModalStackProvider({ children }: { children: React.ReactNode }) {
    const [stack, setStack] = useState<number[]>([]);

    const registerModal = () => {
        const base = 5000; // base lebih tinggi agar pasti di atas header
        const z = base + stack.length * 10;

        setStack((prev) => {
            const next = [...prev, z];
            if (next.length === 1) {
                document.body.classList.add("overflow-hidden");
            }
            return next;
        });

        return z;
    };

    const unregisterModal = (z: number) => {
        setStack((prev) => {
            const next = prev.filter((val) => val !== z);
            if (next.length === 0) {
                document.body.classList.remove("overflow-hidden");
            }
            return next;
        });
    };

    return (
        <ModalStackContext.Provider value={{ registerModal, unregisterModal }}>
            {children}
        </ModalStackContext.Provider>
    );
}

function useModalStack() {
    const context = useContext(ModalStackContext);
    if (!context) {
        throw new Error("useModalStack must be used within ModalStackProvider");
    }
    return context;
}

type ModalProps = {
    show: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    type?: 'static' | 'dynamic';
    background?: 'primary' | 'secondary';
    title: string;
    icon?: string;
    buttonArray?: ButtonArray;
    onClose: () => void;
    loadingFlag?: boolean;
    children: React.ReactNode;
};

const sizeClasses = {
    sm: 'w-[320px]',
    md: 'w-[640px]',
    // md: 'w-[768px]',
    lg: 'w-[1024px]',
    xl: 'w-full',
};

export function Modal({ show, size = "xl", type = 'static', background = 'primary', title, icon, buttonArray = [], onClose, loadingFlag = false, children }: ModalProps) {
    const { t } = useTranslation();
    const { registerModal, unregisterModal } = useModalStack();
    const [zIndex, setZIndex] = useState(5000);
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        if (show) {
            const z = registerModal();
            setZIndex(z);
            setIsVisible(true);
            previousActiveElement.current = document.activeElement as HTMLElement;

            setTimeout(() => {
                const alreadyFocused = document.activeElement;
                if (
                    !modalRef.current?.contains(alreadyFocused) ||
                    alreadyFocused === document.body
                ) {
                    const focusable = modalRef.current?.querySelector<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    focusable?.focus();
                }
            }, 50);
        } else if (isVisible) {
            timeout = setTimeout(() => {
                setIsVisible(false);
                unregisterModal(zIndex);
                previousActiveElement.current?.focus();
            }, 200);
        }

        return () => clearTimeout(timeout);
    }, [show]);

    useEffect(() => {
        function handleTabKey(e: KeyboardEvent) {
            if (!modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const focusable = Array.from(focusableElements).filter(el => !el.hasAttribute('disabled'));

            if (focusable.length === 0) return;

            const firstElement = focusable[0];
            const lastElement = focusable[focusable.length - 1];

            if (e.key === "Tab") {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        }

        if (isVisible) {
            document.addEventListener("keydown", handleTabKey);
        }

        return () => {
            document.removeEventListener("keydown", handleTabKey);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return createPortal(
        <div
            className={`
                fixed inset-0 bg-light-base-line/50 dark:bg-dark-base-line/50
                overflow-y-auto 
                ${show ? "animate-fade-in-overlay" : "animate-fade-out-overlay"}`
            }
            style={{ zIndex }}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className={`flex ${decode(type, 'static', 'items-center')} justify-center min-h-screen py-4 px-4`}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`
                        bg-light-clear dark:bg-dark-clear text-light-base-line dark:text-dark-base-line
                        ${sizeClasses[size]}
                        rounded-lg shadow-xl h-fit
                        transition-[scale, opacity] duration-200 ease-out
                        ${show ? "animate-fade-in" : "animate-fade-out"}
                        flex flex-col
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between p-4">
                        <strong className="text-xl text-light-base-line-base dark:text-dark-base-line">
                            {icon && <i className={`${icon} mr-2`}></i>}
                            {title}
                        </strong>
                        <button
                            className="text-light-base-line dark:text-dark-base-line hover:text-light-base-line-secondary hover:dark:text-dark-base-line-secondary cursor-pointer p-1 rounded"
                            onClick={onClose}
                            aria-label="Open sidebar"
                        >
                            <i className="fa-solid fa-xmark text-xl" />
                        </button>
                    </div>
                    <div className={`${background === 'primary' ? 'color-main p-5 border-y-1 border-light-divider dark:border-dark-divider' : 'p-modal color-main-secondary'}`}>
                        <div className={`${loadingFlag ? 'opacity-0 pointer-events-none' : ''}`}>
                            {children}
                        </div>
                        {
                            loadingFlag &&
                            <div className={`
                                text-light-base dark:text-dark-base
                                absolute top-1/2 left-1/2
                                transform -translate-x-1/2 -translate-y-1/2
                                fa-solid fa-spinner fa-spin text-9xl
                                opacity-100
                            `}
                            />
                        }
                    </div>
                    <div className="flex max-sm:flex-col justify-end md:flex-row gap-4 p-4">
                        {
                            !loadingFlag &&
                            buttonArray.map((button, index) => (
                                <Button
                                    key={index}
                                    label={button.label}
                                    className="max-sm:w-full"
                                    type={button.type}
                                    icon={button.icon}
                                    onClick={button.onClick}
                                    loadingFlag={button.loadingFlag}
                                />
                            ))
                        }
                        <Button
                            label={t("text.close")}
                            className="max-sm:w-full"
                            type="secondary"
                            icon="fa-solid fa-xmark"
                            onClick={() => onClose()}
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
