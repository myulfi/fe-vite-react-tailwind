import React, {
    useEffect,
    useState,
    createContext,
    useContext,
} from "react";
import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import Button from "./components/form/Button";

type ConfirmDialogProps = {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
};

export function ConfirmDialog({
    show,
    onClose,
    onConfirm,
    title = "Konfirmasi",
    message = "Apakah Anda yakin ingin melanjutkan?",
    confirmLabel = "Ya",
    cancelLabel = "Batal",
}: ConfirmDialogProps) {
    return (
        <Modal show={show} size="sm" onClose={onClose}>
            <div className="text-center space-y-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-gray-600">{message}</p>
                <div className="flex justify-center gap-4 mt-6">
                    <Button label={cancelLabel} onClick={onClose} className="btn-secondary" />
                    <Button label={confirmLabel} onClick={onConfirm} className="btn-danger" />
                </div>
            </div>
        </Modal>
    );
}

function confirmDialog({
    title,
    message,
    confirmLabel,
    cancelLabel,
}: {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}): Promise<boolean> {
    return new Promise((resolve) => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        const root = ReactDOM.createRoot(div);

        function cleanup() {
            root.unmount();
            div.remove();
        }

        function onConfirm() {
            cleanup();
            resolve(true);
        }

        function onCancel() {
            cleanup();
            resolve(false);
        }

        root.render(
            <ConfirmDialog
                show={true}
                onClose={onCancel}
                onConfirm={onConfirm}
                title={title}
                message={message}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
            />
        );
    });
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
    onClose: () => void;
    children: React.ReactNode;
};

const sizeClasses = {
    sm: 'w-[320px]',
    md: 'w-[768px]',
    lg: 'w-[1024px]',
    xl: 'w-full',
};

export function Modal({ show, size = "xl", onClose, children }: ModalProps) {
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
        fixed inset-0 bg-black/40 flex items-center justify-center
        transition-opacity duration-200
        ${show && !isLeaving ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
            style={{ zIndex }}
        >
            <div
                // max-w-2xl
                className={`relative ${sizeClasses[size]} h-full p-4 flex items-center justify-center`}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`
                        modal-primary
                        rounded-lg shadow-xl w-full max-h-[100vh]
                        overflow-y-auto transition-all duration-200
                        transform
                        ${show && !isLeaving ? "scale-100 opacity-100" : "scale-95 opacity-0"}
                        scrollbar-none
                        flex flex-col
                    `}
                >
                    <div className="flex justify-between border-b p-4">
                        <strong className="text-xl">Header</strong>
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
                    <div className="flex justify-end border-t p-4">
                        <Button
                            label="Tutup"
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
