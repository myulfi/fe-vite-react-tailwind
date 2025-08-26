import React from 'react'
import { useTranslation } from 'react-i18next'
import ErrorForm from './ErrorForm';

type UnitOption = {
    key: string;
    value: string;
};

type InputTextProps = {
    autoFocus?: boolean;
    label?: string;
    name: string;
    rows?: number;
    value?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    error?: string;
};

export default function TextArea({
    autoFocus = false,
    label,
    name,
    rows,
    value,
    disabled = false,
    onChange,
    onKeyDown,
    placeholder,
    error,
}: InputTextProps) {
    const { t } = useTranslation();

    return (
        <div className="text-light-base-line dark:text-dark-base-line">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}

            <textarea
                autoFocus={autoFocus}
                className={`
                    form-input w-full rounded-md shadow-sm
                    ${error ? 'form-input-error' : 'form-input-normal'}
                `}
                name={name}
                rows={rows}
                value={value ?? ''}
                disabled={disabled}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder ?? t('text.inputName', { name: label })}
            />

            {error && <ErrorForm text={error} />}
        </div>
    );
}
