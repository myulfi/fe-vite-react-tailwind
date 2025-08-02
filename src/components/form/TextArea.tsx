import React from 'react'
import { useTranslation } from 'react-i18next'

type UnitOption = {
    key: string;
    value: string;
};

type InputTextProps = {
    label?: string;
    name: string;
    rows?: number;
    value?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    className?: string;
    placeholder?: string;
    error?: string;
};

export default function TextArea({
    label,
    name,
    rows,
    value,
    disabled = false,
    onChange,
    onKeyDown,
    className = '',
    placeholder,
    error,
}: InputTextProps) {
    const { t } = useTranslation();

    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <textarea
                className={`flex-1 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md`}
                name={name}
                rows={rows}
                value={value ?? ''}
                disabled={disabled}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder ?? t('common.text.inputName', { name: label })}
            />

            {error && (
                <small className="mt-1 block text-xs text-red-600">{error}</small>
            )}
        </div>
    );
}
