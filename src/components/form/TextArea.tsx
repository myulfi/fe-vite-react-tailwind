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
    placeholder,
    error,
}: InputTextProps) {
    const { t } = useTranslation();

    return (
        <div className="text-dark dark:text-tertiary">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}

            <textarea
                className={`mb-1 w-full flex-1 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md`}
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
