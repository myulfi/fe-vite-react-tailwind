import React, { useEffect, useState, Fragment } from 'react';
import ReactDOM from 'react-dom';
import Button from './components/form/Button';
import { useTranslation } from 'react-i18next';

type ConfirmType = 'confirmation' | 'warning' | 'alert';

export interface ConfirmDialogOptions {
    type: ConfirmType;
    message: string;
    onConfirm?: () => void;
}

type DialogHandler = {
    show: (options: ConfirmDialogOptions) => void;
};

let handler: DialogHandler | null = null;

export const dialog = {
    show: (options: ConfirmDialogOptions) => {
        if (handler) {
            handler.show(options);
        } else {
            console.warn('Dialog not ready yet.');
        }
    },
    _register: (h: DialogHandler) => {
        handler = h;
    },
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [show, setShow] = useState(false);
    const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);

    const showDialog = (opts: ConfirmDialogOptions) => {
        setOptions(opts);
        setShow(true);
    };

    const handleConfirm = () => {
        options?.onConfirm?.();
        setShow(false);
    };

    const handleClose = () => {
        setShow(false);
    };

    // Register globally
    useEffect(() => {
        dialog._register({ show: showDialog });
    }, []);

    return (
        <Fragment>
            {children}
            {show && options && (
                <ConfirmDialog
                    type={options.type}
                    message={options.message}
                    onConfirm={handleConfirm}
                    onClose={handleClose}
                />
            )}
        </Fragment>
    );
};

type ConfirmDialogProps = {
    type: ConfirmType;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
};

function ConfirmDialog({ type, message, onConfirm, onClose }: ConfirmDialogProps) {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);

    const icon =
        type === 'alert'
            ? 'fa-solid fa-triangle-exclamation'
            : type === 'confirmation'
                ? 'fa-solid fa-circle-question'
                : 'fa-solid fa-circle-exclamation';

    const title = t(`text.${type}`);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 400);
    };

    return ReactDOM.createPortal(
        <div className={
            `fixed inset-0 flex items-center justify-center z-[6000] bg-black/40 p-cnt
            ${isClosing
                ? 'animate-fade-out-overlay'
                : 'animate-fade-in-overlay'
            }`
        }
        >
            <div
                className={`
                    rounded-lg w-[320px] shadow-lg space-y-4 bg-white dark:bg-dark-clear
                    ${isClosing
                        ? 'animate-fade-out'
                        : 'animate-fade-in'
                    }
                `}>
                <div className="flex justify-between pt-4 pb-2 px-3.5">
                    <div className="flex items-center gap-2 text-lg font-bold text-dark dark:text-white">
                        <i className={icon}></i>
                        <span>{title}</span>
                    </div>
                    <button
                        className="text-light-base-line dark:text-dark-base-line hover:text-light-base-line-secondary hover:dark:text-dark-base-line-secondary cursor-pointer p-1 rounded"
                        onClick={onClose}
                        aria-label="Open sidebar"
                    >
                        <i className="fa-solid fa-xmark text-xl" />
                    </button>
                </div>
                <p className="text-sm text-dark dark:text-gray-300 text-center px-4">{message}</p>
                <div className="flex justify-end gap-4 mt-4 p-4 pt-2">
                    {type !== 'alert' && (
                        <Button
                            label={
                                type === 'confirmation'
                                    ? t('text.ok')
                                    : t('text.ofCourse')
                            }
                            type={type === 'confirmation' ? 'primary' : 'danger'}
                            icon="fa-solid fa-circle-check"
                            onClick={onConfirm}
                        />
                    )}
                    <Button
                        label={
                            type === 'alert'
                                ? t('text.understood')
                                : t('text.close')
                        }
                        type="secondary"
                        icon="fa-solid fa-xmark"
                        onClick={handleClose}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}
