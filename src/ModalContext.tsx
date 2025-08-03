import React, {
    useEffect,
    useState,
    createContext,
    useContext,
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
        <Modal show={show} size="sm" title={t(`common.text.${type}`)} onClose={onClose}>
            <div className="text-center space-y-4">
                <h2 className="text-lg font-semibold">{t(`common.text.${type}`)}</h2>
                <p className="text-gray-600">{message}</p>
                <div className="flex justify-center gap-4 mt-6">
                    {/* <Button label={confirmLabel} onClick={onConfirm} className="btn-danger" /> */}
                    <Button label={t("common.button.close")} onClick={onClose} className="btn-secondary" />
                </div>
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

export function Modal({ show, size = "xl", title, buttonArray = [], onClose, children }: ModalProps) {
    const { t } = useTranslation();
    const { registerModal, unregisterModal } = useModalStack();
    const [zIndex, setZIndex] = useState(5000);
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        if (show) {
            const z = registerModal();
            setZIndex(z);
            setIsVisible(true);
        } else if (isVisible) {
            setIsLeaving(true);
            timeout = setTimeout(() => {
                setIsVisible(false);
                setIsLeaving(false);
                unregisterModal(zIndex);
            }, 200);
        }

        return () => clearTimeout(timeout);
    }, [show]);

    if (!isVisible) return null;

    return createPortal(
        <div
            className={`
        fixed inset-0 bg-black/40
        transition-opacity duration-200
        overflow-y-auto 
        ${show && !isLeaving ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={{ zIndex }}
        >
            <div
                className="flex items-center justify-center min-h-screen py-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`
                        modal-primary
                     ${sizeClasses[size]}
                        rounded-lg shadow-xl h-fit
                        transition-all duration-200
                        transform
                        ${show && !isLeaving ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                        flex flex-col
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between border-b p-4">
                        <strong className="text-xl">{title}</strong>
                        <button
                            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:cursor-pointer p-1 rounded"
                            onClick={onClose}
                            aria-label="Open sidebar"
                        >
                            <i className="fa-solid fa-xmark text-xl" />
                        </button>
                    </div>
                    <div className="py-4 px-8">
                        {children}
                    </div>
                    <div className="flex justify-end border-t gap-4 p-4">
                        {buttonArray}
                        <Button
                            label={t("button.close")}
                            onClick={onClose}
                            className="btn-secondary"
                            icon="fa-solid fa-xmark"
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
