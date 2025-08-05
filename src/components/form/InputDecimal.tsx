import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type UnitOption = {
    key: string | number;
    value: string;
};

type InputDecimalProps = {
    label: string;
    name: string;
    value?: number | string;
    disabled?: boolean;
    decimal?: number;
    onChange: (e: { target: { name: string; value: number } }) => void;
    positionUnit?: "left" | "right";
    nameUnit?: string;
    valueUnit?: string | number;
    valueUnitList?: UnitOption[];
    onChangeUnit?: (e: { target: { name: string; value: number } }) => void;
    error?: string;
};

export default function InputDecimal({
    label,
    name,
    value,
    disabled = false,
    decimal = 0,
    onChange,
    positionUnit,
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

    const onInputUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChangeUnit?.({
            target: {
                name,
                value: Number(value),
            },
        });
    };

    return (
        <div className="text-light-base-line dark:text-dark-base-line">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}


            <div className="flex rounded-md shadow-sm">
                {positionUnit === "left" && (
                    <>
                        {valueUnitList ? (
                            <select
                                className="rounded-l-md border border-gray-300 bg-gray-50 px-2 text-sm text-gray-700"
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
                            <span className="inline-flex items-center px-3 rounded-l-md border border-gray-300 bg-gray-100 text-gray-600 text-sm">
                                {valueUnit}
                            </span>
                        )}
                    </>
                )}

                <input
                    ref={inputRef}
                    className={`flex-1 border border-light-outline dark:border-dark-outline px-3 py-2 text-sm text-light-base-line dark:text-dark-base-line placeholder-light-secondary-base dark:placeholder-dark-secondary-base-hover focus:border-light-base focus:dark:border-dark-base focus:outline-none focus:ring-1 focus:ring-light-base focus:dark:ring-dark-base ${positionUnit === "left" ? "rounded-l-none" : ""
                        } ${positionUnit === "right" ? "rounded-r-none" : ""}`}
                    name={name}
                    type="text"
                    value={valueInput}
                    disabled={disabled}
                    onChange={onInputChange}
                    placeholder={t("common.text.inputName", { name: label })}
                />

                {positionUnit === "right" && (
                    <>
                        {valueUnitList ? (
                            <select
                                className="rounded-r-md border border-gray-300 bg-gray-50 px-2 text-sm text-gray-700"
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
                            <span className="inline-flex items-center px-3 rounded-r-md border border-gray-300 bg-gray-100 text-gray-600 text-sm">
                                {valueUnit}
                            </span>
                        )}
                    </>
                )}
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
}
