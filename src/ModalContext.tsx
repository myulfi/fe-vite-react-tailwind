import React, {
    useEffect,
    useState,
    createContext,
    useContext,
    useRef,
} from "react";
import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import Button from "./components/form/Button";
import { useTranslation } from "react-i18next";

type ConfirmDialogProps = {
    show: boolean;
    type: ConfirmType;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
};

function ConfirmDialog({
    show,
    type,
    message,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    const { t } = useTranslation();
    return (
        <Modal
            show={show}
            size="sm"
            icon={'alert' === type ? "fa-solid fa-triangle-exclamation" : 'confirmation' === type ? "fa-solid fa-circle-question" : 'warning' === type ? "fa-solid fa-circle-exclamation" : ""}
            title={t(`text.${type}`)}
            buttonArray={[
                'alert' === type && (
                    <Button
                        label={t("button.understood")}
                        type="warning"
                        icon="fa-solid fa-lightbulb"
                        onClick={onClose}
                    />
                ),
                'confirmation' === type && (
                    <Button
                        label={t("button.ok")}
                        type="primary"
                        icon="fa-solid fa-circle-check"
                        onClick={() => onConfirm()}
                    />
                ),
                'warning' === type && (
                    <Button
                        label={t("button.ofCourse")}
                        type="danger"
                        icon="fa-solid fa-circle-check"
                        onClick={() => onConfirm()}
                    />
                ),
            ].filter(Boolean) as React.ReactElement[]}
            onClose={onClose}>
            <div className="text-center space-y-4">
                <p>{message}</p>
            </div>
        </Modal>
    );
}

type ConfirmType = 'confirmation' | 'warning' | 'alert';
export function confirmDialog({
    type,
    message,
    onConfirm,
}: {
    type: ConfirmType;
    message: string;
    onConfirm?: () => void;
}): void {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = ReactDOM.createRoot(div);

    const Wrapper = () => {
        const [show, setShow] = useState(true);

        const handleConfirm = () => {
            if (onConfirm) onConfirm();
            setShow(false);
        };

        const handleClose = () => setShow(false);

        useEffect(() => {
            if (!show) {
                const timer = setTimeout(() => {
                    root.unmount();
                    div.remove();
                }, 200); // sesuai durasi animasi modal

                return () => clearTimeout(timer);
            }
        }, [show]);

        return (
            <ModalStackProvider>
                <ConfirmDialog
                    show={show}
                    type={type}
                    message={message}
                    onConfirm={handleConfirm}
                    onClose={handleClose}
                />
            </ModalStackProvider>
        );
    };

    root.render(<Wrapper />);
}

// 🧠 Modal Stack Context
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

// 🔳 Modal Component
type ModalProps = {
    show: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    title: string;
    icon?: string;
    buttonArray?: React.ReactElement[]
    onClose: () => void;
    children: React.ReactNode;
};

const sizeClasses = {
    sm: 'w-[320px]',
    md: 'w-[640px]',
    // md: 'w-[768px]',
    lg: 'w-[1024px]',
    xl: 'w-full',
};

export function Modal({ show, size = "xl", title, icon, buttonArray = [], onClose, children }: ModalProps) {
    const { t } = useTranslation();
    const { registerModal, unregisterModal } = useModalStack();
    const [zIndex, setZIndex] = useState(5000);
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
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
            setIsLeaving(true);
            timeout = setTimeout(() => {
                setIsVisible(false);
                setIsLeaving(false);
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
        transition-opacity duration-200
        overflow-y-auto 
        ${show && !isLeaving ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={{ zIndex }}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className="flex items-center justify-center min-h-screen py-4 px-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`
                        bg-light-clear dark:bg-dark-clear text-light-base-line dark:text-dark-base-line
                     ${sizeClasses[size]}
                        rounded-lg shadow-xl h-fit
                        transition-all duration-200 ease-out
                        ${show && !isLeaving ? "scale-100 opacity-100" : "scale-95 opacity-0"}
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
                    <div className="py-4 px-8 border-y-1 border-light-divider dark:border-dark-divider">
                        {children}
                    </div>
                    <div className="flex md:justify-end flex-col md:flex-row gap-4 p-4">
                        {buttonArray}
                        <Button
                            label={t("button.close")}
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
