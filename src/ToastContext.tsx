import React, { Fragment, useEffect, useState } from 'react';

type ToastMessage = {
    id: number;
    type: ToastType;
    message: string;
    duration?: number;
    isClosing?: boolean;
};

const styles = {
    info: 'bg-light-info-base dark:bg-dark-info-base text-light-info-base-line dark:text-dark-info-base-line',
    done: 'bg-light-done-base dark:bg-dark-done-base text-light-done-base-line dark:text-dark-done-base-line',
    problem: 'bg-light-problem-base dark:bg-dark-problem-base text-light-problem-base-line dark:text-dark-problem-base-line',
    error: 'bg-light-error-base dark:bg-dark-error-base text-light-error-base-line dark:text-dark-error-base-line',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const show = (options: ToastOptions) => {
        const id = Date.now();
        const { message, type = 'info', duration = 3000 } = options;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => startClosing(id), duration);
    };

    const startClosing = (id: number) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isClosing: true } : t))
        );

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 200);
    };

    useEffect(() => {
        toast._register({ show: (opts) => show(opts) });
    }, []);

    const handleManualClose = (id: number) => {
        startClosing(id);
    };

    return (
        <Fragment>
            {children}
            <div className="fixed top-4 sm:right-4 space-y-2 w-screen px-4 md:w-72 md:px-0" style={{ zIndex: 6000 }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            flex rounded shadow p-4
                            transition-all duration-200 transform
                            ${toast.isClosing
                                ? 'animate-fade-out'
                                : 'animate-fade-in'
                            }
                            ${styles[toast.type]}`}
                    >
                        <span className='mr-4'>{toast.message}</span>
                        <button
                            className='ml-auto font-bold text-lg leading-none'
                            onClick={() => handleManualClose(toast.id)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </Fragment>
    );
};

type ToastType = 'info' | 'done' | 'problem' | 'error';

interface ToastOptions {
    type?: ToastType;
    message: string;
    duration?: number;
}

type ToastHandler = {
    show: (options: ToastOptions) => void;
};

let handler: ToastHandler | null = null;

export const toast = {
    show: (options: ToastOptions) => {
        if (handler) {
            handler.show(options);
        } else {
            console.warn("Toast system not initialized yet.");
        }
    },
    _register: (h: ToastHandler) => {
        handler = h;
    },
};
