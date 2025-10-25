import React from 'react';
import { useTranslation } from 'react-i18next';
import ErrorForm from './ErrorForm';
import { decode } from '../../function/commonHelper';

type UnitOption = {
    key: number | string;
    value: string;
};

type InputTextProps = {
    autoFocus?: boolean;
    autoComplete?: string;
    label?: string;
    name: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    positionUnit?: 'left' | 'right' | 'none';
    nameUnit?: string;
    valueUnit?: number | string;
    valueUnitList?: UnitOption[];
    onChangeUnit?: (e: { target: { name: string; value: number } }) => void;
    refference?: React.Ref<HTMLInputElement>;
    error?: string;
};

export default function InputText({
    autoFocus = false,
    autoComplete,
    label,
    name,
    value,
    placeholder,
    disabled = false,
    onChange,
    onKeyDown,
    onBlur,
    positionUnit = 'none',
    nameUnit,
    valueUnit,
    valueUnitList,
    onChangeUnit,
    refference,
    error,
}: InputTextProps) {
    const { t } = useTranslation();

    const onInputUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChangeUnit?.({
            target: {
                name,
                value: Number(value),
            },
        });
    };


    const renderUnitLeft = () => {
        if (!positionUnit || positionUnit !== 'left') return null;

        return valueUnitList ? (
            <select
                className="rounded-l-md border border-gray-300 bg-gray-100 px-2 text-sm text-gray-700 focus:outline-none"
                name={nameUnit}
                value={valueUnit}
                disabled={disabled}
                onChange={onInputUnitChange}
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
                onChange={onInputUnitChange}
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
        <div>
            {label && (
                <label className="block mb-1 text-md font-bold color-label">
                    {label}
                </label>
            )}

            <div className="flex shadow-sm rounded-md">
                {renderUnitLeft()}

                <input
                    ref={refference}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    className={`
                        form-input flex-1                        
                        ${decode(positionUnit, 'left', 'rounded-r-md', 'right', 'rounded-l-md', 'rounded-md')}
                        ${error ? 'form-input-error' : 'form-input-normal'}
                    `}
                    name={name}
                    type="text"
                    value={value ?? ''}
                    disabled={disabled}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onBlur={onBlur}
                    placeholder={placeholder ?? t('text.inputName', { name: label })}
                />

                {renderUnitRight()}
            </div>

            {error && <ErrorForm text={error} />}
        </div>
    );
}
