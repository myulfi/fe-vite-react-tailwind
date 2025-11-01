import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorForm from './ErrorForm';
import InputLabel from './InputLabel';

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
        <div>
            <InputLabel label={label} />
            <div className="relative flex shadow-sm rounded-element">
                <input
                    id={name}
                    autoComplete={autoComplete ? "on" : "new-password"}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={t('text.inputName', { name: label })}
                    className={`
                       form-input flex-1 rounded-element
                        ${error ? 'form-input-error' : 'form-input-normal'}
                    `}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1.5 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                </button>
            </div>
            <ErrorForm text={error} />
        </div>
    );
}
