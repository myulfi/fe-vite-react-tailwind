import React from 'react'
import { useTranslation } from 'react-i18next'

type UnitOption = {
    key: string;
    value: string;
};

type InputTextProps = {
    label?: string;
    name: string;
    value: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    positionUnit?: 'left' | 'right';
    nameUnit?: string;
    valueUnit?: string;
    valueUnitList?: UnitOption[];
    onChangeUnit?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    refference?: React.Ref<HTMLInputElement>;
    error?: string;
};

export default function InputText({
    label,
    name,
    value,
    disabled = false,
    onChange,
    onKeyDown,
    onBlur,
    positionUnit,
    nameUnit,
    valueUnit,
    valueUnitList,
    onChangeUnit,
    refference,
    error,
}: InputTextProps) {
    const { t } = useTranslation();

    const renderUnitLeft = () => {
        if (!positionUnit || positionUnit !== 'left') return null;

        return valueUnitList ? (
            <select
                className="rounded-l-md border border-gray-300 bg-gray-100 px-2 text-sm text-gray-700 focus:outline-none"
                name={nameUnit}
                value={valueUnit}
                disabled={disabled}
                onChange={onChangeUnit}
            >
                {valueUnitList.map((object) => (
                    <option value={object.key} key={object.key}>
                        {object.value}
                    </option>
                ))}
            </select>
        ) : (
            <span className="inline-flex items-center rounded-l-md border border-gray-300 bg-gray-100 px-3 text-sm text-gray-700">
                {valueUnit}
            </span>
        );
    };

    const renderUnitRight = () => {
        if (!positionUnit || positionUnit !== 'right') return null;

        return valueUnitList ? (
            <select
                className="rounded-r-md border border-gray-300 bg-gray-100 px-2 text-sm text-gray-700 focus:outline-none"
                name={nameUnit}
                value={valueUnit}
                disabled={disabled}
                onChange={onChangeUnit}
            >
                {valueUnitList.map((object) => (
                    <option value={object.key} key={object.key}>
                        {object.value}
                    </option>
                ))}
            </select>
        ) : (
            <span className="inline-flex items-center rounded-r-md border border-gray-300 bg-gray-100 px-3 text-sm text-gray-700">
                {valueUnit}
            </span>
        );
    };

    return (
        <div className="text-dark dark:text-tertiary">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}

            <div className="mb-1 flex">
                {renderUnitLeft()}

                <input
                    ref={refference}
                    className={`flex-1 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${positionUnit === 'left'
                        ? 'rounded-r-md'
                        : positionUnit === 'right'
                            ? 'rounded-l-md'
                            : 'rounded-md'
                        }`}
                    name={name}
                    type="text"
                    value={value ?? ''}
                    disabled={disabled}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onBlur={onBlur}
                    placeholder={t('common.text.inputName', { name: label })}
                />

                {renderUnitRight()}
            </div>

            {error && (
                <small className="mt-1 block text-xs text-red-600">{error}</small>
            )}
        </div>
    );
}
