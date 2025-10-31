import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorForm from "./ErrorForm";
import { decode } from "../../function/commonHelper";
import { LabelValueUnit, SelectValueUnit } from "./InputValueUnit";
import InputLabel from "./InputLabel";

type UnitOption = {
    key: string | number;
    value: string;
};

type InputDecimalProps = {
    autoFocus?: boolean;
    label: string;
    name: string;
    value?: number | string;
    placeholder?: string;
    disabled?: boolean;
    decimal?: number;
    onChange: (e: { target: { name: string; value: number } }) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    positionUnit?: "left" | "right";
    nameUnit?: string;
    valueUnit?: string | number;
    valueUnitList?: UnitOption[];
    onChangeUnit?: (e: { target: { name: string; value: number } }) => void;
    error?: string;
};

export default function InputDecimal({
    autoFocus = false,
    label,
    name,
    value,
    placeholder,
    disabled = false,
    decimal = 0,
    onChange,
    onKeyDown,
    onBlur,
    positionUnit = 'left',
    nameUnit,
    valueUnit,
    valueUnitList,
    onChangeUnit,
    error,
}: InputDecimalProps) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const [valueInput, setValueInput] = useState("");

    useEffect(() => {
        setValueInput(formatToMoney((value ?? "").toString().replace(".", ",")));
    }, [value]);

    const formatToMoney = (input: string): string => {
        let [integerPart, decimalPart] = input
            .replace(/(,)(?=.*,)|[^0-9,]/g, "")
            .split(",");
        if (integerPart)
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        if (decimalPart) decimalPart = decimalPart.substring(0, decimal);
        return decimalPart !== undefined
            ? `${integerPart},${decimalPart}`
            : integerPart;
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, selectionStart } = e.target;
        const formattedValue = formatToMoney(value);
        setValueInput(formattedValue);
        onChange({
            target: {
                name,
                value: Number(formattedValue.replace(/\./g, "").replace(/,/g, ".")),
            },
        });

        setTimeout(() => {
            if (inputRef.current && selectionStart !== null) {
                const offset = formattedValue.length > value.length ? 1 : 0;
                const newPos = selectionStart + offset;
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

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
            <InputLabel label={label} />
            <div className="flex shadow-sm rounded-md">
                {renderUnit('left')}

                <input
                    ref={inputRef}
                    autoFocus={autoFocus}
                    className={`
                        form-input flex-1
                        ${valueUnitList || valueUnit ? decode(positionUnit, 'left', 'rounded-r-element', 'right', 'rounded-l-element', 'rounded-element') : 'rounded-element'}
                        ${error ? 'form-input-error' : 'form-input-normal'}
                    `}
                    name={name}
                    type="text"
                    value={valueInput}
                    disabled={disabled}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    onBlur={onBlur}
                    placeholder={placeholder ?? t('text.inputName', { name: label })}
                />

                {renderUnit('right')}
            </div>
            <ErrorForm text={error} />
        </div>
    );
}
