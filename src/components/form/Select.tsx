import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

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
    const [itemList, setItemList] = useState<Option[]>(map);
    const [searchValue, setSearchValue] = useState("");
    const [labelValue, setLabelValue] = useState<string>("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isMultiple = Array.isArray(value);

    useEffect(() => {
        setItemList(map);
        updateLabel(value);
    }, [map, value]);

    const updateLabel = (val: any) => {
        if (multiple) {
            if (!val || val.length === 0) {
                setLabelValue(t("text.selectName", { name }));
            } else if (val.length === 1) {
                const item = map.find((item) => item.key === val[0]);
                setLabelValue(item?.value ?? "");
            } else {
                setLabelValue(`${val.length} items selected`);
            }
        } else {
            const item = map.find((item) => item.key === val);
            setLabelValue(item?.value ?? t("text.selectName", { name }));
        }
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

    const handleSelect = (id: string | number) => {
        let newValue: any;
        if (multiple && Array.isArray(value)) {
            newValue = value.includes(id)
                ? value.filter((v: any) => v !== id)
                : [...value, id];
        } else {
            newValue = id;
            setDropdownOpen(false);
        }

        onChange({ target: { name, value: newValue } });
        updateLabel(newValue);
    };

    const selectAll = () => {
        const allKeys = itemList.map((item) => item.key);
        onChange({ target: { name, value: allKeys } });
        updateLabel(allKeys);
    };

    const deselectAll = () => {
        onChange({ target: { name, value: [] } });
        updateLabel([]);
    };

    const isSelected = (id: string | number) => {
        return multiple
            ? value?.includes(id)
            : value === id;
    };

    return (
        <div className="text-dark dark:text-tertiary">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}

            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    className="w-full border border-gray-300 rounded-md bg-white px-3 py-2 text-sm text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onClick={() => {
                        setDropdownOpen(!dropdownOpen);
                        handleSearchChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                >
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">{labelValue}</span>
                        <i className="bi bi-chevron-down text-gray-500 text-sm"></i>
                    </div>
                </button>

                {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        {map.length > dataSize && (
                            <div className="p-2">
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring"
                                    placeholder={t("text.search")}
                                />
                            </div>
                        )}

                        {multiple && map.length > dataSize && (
                            <div className="flex justify-between px-2 pb-1">
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    {t("button.selectAll")}
                                </button>
                                <button
                                    type="button"
                                    onClick={deselectAll}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    {t("button.deselectAll")}
                                </button>
                            </div>
                        )}

                        <ul className="max-h-48 overflow-y-auto divide-y text-sm">
                            {itemList.map((item) => (
                                <li
                                    key={item.key}
                                    onClick={() => handleSelect(item.key)}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                >
                                    <span>{item.value}</span>
                                    {isSelected(item.key) && (
                                        <i className="bi bi-check-lg text-blue-600"></i>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium px-1">{error}</p>
            )}
        </div>
    );
}
