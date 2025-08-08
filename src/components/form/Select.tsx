import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import InputText from "./InputText";
import { useClickOutside } from "../../hook/useClickOutside";
import ErrorForm from "./ErrorForm";

type Option = {
    key: string | number;
    value: string;
};

type SelectProps = {
    label: string;
    name: string;
    value: any;
    map: Option[];
    multiple?: boolean;
    dataSize?: number;
    onChange: (e: { target: { name: string; value: any } }) => void;
    error?: string;
};

export default function Select({
    label,
    name,
    value,
    map,
    multiple = false,
    dataSize = 5,
    onChange,
    error,
}: SelectProps) {
    const { t } = useTranslation();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<HTMLDivElement>(value);
    const [itemList, setItemList] = useState<Option[]>(map);
    const [searchValue, setSearchValue] = useState("");
    const [labelValue, setLabelValue] = useState<string | null | undefined>("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [autoFocus, setAutoFocus] = useState(false);

    useClickOutside(dropdownRef, () => setDropdownOpen(false));

    useEffect(() => {
        setItemList(map);
        labelValueChange(value);
    }, [map]);

    useEffect(() => {
        valueRef.current = value
        labelValueChange(valueRef.current)
    }, [value]);

    const labelValueChange = (val: any) => {
        if (multiple) {
            if (!val || val.length === 0) {
                setLabelValue(null);
            } else if (val.length === 1) {
                const item = map.find((item) => item.key === val[0]);
                setLabelValue(item?.value ?? null);
            } else {
                setLabelValue(`${val.length} items selected`);
            }
        } else {
            const item = map.find((item) => item.key === val);
            setLabelValue(item?.value);
        }
    };

    const onSelect = (id: string | number) => {
        if (multiple) {
            if (value.includes(id)) {
                value.splice(value.indexOf(id), 1)
            } else {
                value.push(id)
            }
            valueRef.current = value
        } else {
            value = id
        }

        if (!multiple) {
            onChange({ target: { name, value: value } });
            setDropdownOpen(false);
        }
        labelValueChange(value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);
        setItemList(
            map.filter((item) =>
                item.value.toLowerCase().includes(val.toLowerCase())
            )
        );
    };

    const selectAll = () => {
        for (let i = 0; i < itemList.length; i++) {
            if (value.includes(itemList[i].key) === false) {
                value.push(itemList[i].key)
            }
        }
        labelValueChange(value);
    };

    const deselectAll = () => {
        for (let i = itemList.length - 1; i >= 0; i--) {
            if (value.includes(itemList[i].key)) {
                value.splice(value.indexOf(itemList[i].key), 1)
            }
        }

        labelValueChange(value)
    };

    const isSelected = (id: string | number) => {
        return multiple
            ? value?.includes(id)
            : value === id;
    };

    return (
        <div className="text-light-base-line dark:text-dark-base-line">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}

            <div className={`relative shadow-sm ${dropdownOpen ? 'rounded-t-md' : 'rounded-md'}`} ref={dropdownRef}>
                <button
                    type="button"
                    className={
                        `form-input w-full ${dropdownOpen ? "rounded-t border-x border-t" : 'rounded border'} 
                        cursor-pointer
                        ${error ? 'form-input-error' : 'form-input-normal'}
                    `}
                    onClick={() => {
                        setDropdownOpen(!dropdownOpen);
                        setAutoFocus(true);
                        handleSearchChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    onKeyDown={
                        (event: React.KeyboardEvent<HTMLButtonElement>) => {
                            if (event.key === 'ArrowDown') {
                                setDropdownOpen(true);
                            }
                        }
                    }
                >
                    <div className="flex justify-between items-center">
                        <span className={`${labelValue ? 'text-light-base-line dark:text-dark-base-line' : 'text-light-secondary-base dark:text-dark-secondary-base-hover'}`}>{labelValue ?? t("text.selectName", { name })}</span>
                        <i className="fa-solid fa-chevron-down text-sm"></i>
                    </div>
                </button>

                <div
                    className={`
                        absolute z-10 w-full
                        bg-light-clear dark:bg-dark-clear
                        text-light-base-line dark:text-dark-base-line
                        border border-t-0 border-light-outline dark:border-dark-outline
                        rounded-b-md shadow-lg
                        transition-all duration-400 ease-out origin-top
                        ${dropdownOpen ? "scale-y-100 opacity-100 visible" : "scale-y-0 opacity-0 invisible pointer-events-none"}
                    `}>
                    {map.length > dataSize && (
                        <div className="p-2">
                            <InputText
                                name=""
                                autoFocus={autoFocus}
                                value={searchValue}
                                onChange={handleSearchChange}
                            />
                        </div>
                    )}

                    {multiple && map.length > dataSize && (
                        <div className="flex gap-1 mx-2 pb-1">
                            <Button
                                label={t("button.selectAll")}
                                className="flex-1"
                                size="sm"
                                type="secondary"
                                onClick={selectAll}
                            />
                            <Button
                                label={t("button.deselectAll")}
                                className="flex-1"
                                size="sm"
                                type="secondary"
                                onClick={deselectAll}
                            />
                        </div>
                    )}

                    <ul className="max-h-48 overflow-y-auto text-sm">
                        {itemList.map((item) => (
                            <li
                                key={item.key}
                                tabIndex={0}
                                onClick={() => onSelect(item.key)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        onSelect(item.key);
                                    }
                                }}
                                className="px-6 py-2 hover:bg-light-clear-secondary hover:dark:bg-dark-clear-secondary cursor-pointer flex justify-between items-center"
                            >
                                <span>{item.value}</span>
                                {isSelected(item.key) && (
                                    <i className="fa-solid fa-check"></i>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {error && <ErrorForm text={error} />}
        </div>
    );
}
