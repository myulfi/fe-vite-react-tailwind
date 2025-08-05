import React, { Fragment, useEffect, useState } from 'react';

type ToastMessage = {
    id: number;
    type: ToastType;
    message: string;
    duration?: number;
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
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    };

    // Register handler globally
    useEffect(() => {
        toast._register({ show: (opts) => show(opts) });
    }, []);

    return (
        <Fragment>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 sm:right-4 z-50 space-y-2 w-screen px-4 md:w-72 md:px-0">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`flex ${styles[toast.type]} rounded shadow p-4`}>
                        <span className='mr-4'>{toast.message}</span>
                        <button className='ml-auto font-bold text-lg leading-none'>&times;</button>
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
};

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