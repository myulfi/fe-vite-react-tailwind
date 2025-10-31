import React from 'react';
import { useTranslation } from 'react-i18next';
import ErrorForm from './ErrorForm';
import { decode } from '../../function/commonHelper';
import { LabelValueUnit, SelectValueUnit } from './InputValueUnit';

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
    positionUnit?: 'left' | 'right';
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
    positionUnit = 'left',
    nameUnit,
    valueUnit,
    valueUnitList,
    onChangeUnit,
    refference,
    error,
}: InputTextProps) {
    const { t } = useTranslation();

    const renderUnit = (position: string) => {
        if (position !== positionUnit) return null;
        return valueUnitList
            ? <SelectValueUnit
                position={position}
                name={nameUnit!}
                value={valueUnit}
                valueList={valueUnitList}
                onChange={onChangeUnit}
            />
            : valueUnit
                ? <LabelValueUnit position={position} value={valueUnit} />
                : null;
    };

    return (
        <div>
            {label && (
                <label className="block pb-1 ml-1 text-md font-bold color-label">
                    {label}
                </label>
            )}

            <div className="flex shadow-sm rounded-element">
                {renderUnit('left')}

                <input
                    ref={refference}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    className={`
                        form-input flex-1                        
                        ${valueUnitList || valueUnit ? decode(positionUnit, 'left', 'rounded-r-element', 'right', 'rounded-l-element', 'rounded-element') : 'rounded-element'}
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

                {renderUnit('right')}
            </div>

            {error && <ErrorForm text={error} />}
        </div>
    );
}
