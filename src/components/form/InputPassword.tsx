import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type InputPasswordProps = {
    label: string;
    name: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    error?: string;
};

export default function InputPassword({
    label,
    name,
    value,
    onChange,
    className = '',
    error,
}: InputPasswordProps) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`mb-4 relative ${className}`}>
            <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                id={name}
                name={name}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={t('common.text.inputName', { name: label })}
                className={`w-full rounded-md border px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            />

            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-7.5 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>

            {error && <small className="mt-1 block text-xs text-red-600">{error}</small>}
        </div>
    );
}
