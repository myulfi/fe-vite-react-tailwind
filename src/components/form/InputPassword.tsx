import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorForm from './ErrorForm';

type InputPasswordProps = {
    autoComplete?: boolean;
    label: string;
    name: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
};

export default function InputPassword({
    autoComplete = false,
    label,
    name,
    value,
    onChange,
    error,
}: InputPasswordProps) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            {label && (
                <label className="block mb-1 text-md font-bold color-label">
                    {label}
                </label>
            )}

            <input
                id={name}
                autoComplete={autoComplete ? "on" : "new-password"}
                name={name}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={t('text.inputName', { name: label })}
                className={`
                    form-input w-full rounded-md pr-10 
                    ${error ? 'form-input-error' : 'form-input-normal'}
                `}
            />

            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8.5 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>

            {error && <ErrorForm text={error} />}
        </div>
    );
}
