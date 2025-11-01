import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "../../hook/useClickOutside";

type UnitOption = {
    key: number | string;
    value: string;
};

type SelectValueUnitProps = {
    position: "left" | "right";
    name: string;
    value?: string | number;
    valueList: UnitOption[];
    disabled?: boolean;
    onChange?: (e: { target: { name: string; value: number } }) => void;
    error?: string;
};

export function SelectValueUnit({
    position,
    name,
    value,
    valueList,
    disabled = false,
    onChange,
}: SelectValueUnitProps) {

    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [labelValue, setLabelValue] = useState<string | null | undefined>("");
    useClickOutside(dropdownRef, () => setDropdownOpen(false));

    useEffect(() => {
        if (value === undefined) {
            onSelect(valueList.length > 0 ? valueList[0].key : 0)
        }
    }, [])

    const onInputUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange?.({
            target: {
                name,
                value: Number(value),
            },
        });
    };

    const labelValueChange = (val: any) => {
        const item = valueList.find((item) => item.key === val);
        setLabelValue(item?.value);
    };

    const onSelect = (id: string | number) => {
        onChange?.({
            target: {
                name,
                value: Number(id),
            },
        });
        setDropdownOpen(false);
        labelValueChange(id);
    };

    const isSelected = (id: string | number) => {
        return value === id;
    };

    return (
        <div
            className={`
                relative w-fit shadow-sm
                ${dropdownOpen
                    ? `${position === 'left' ? 'rounded-tl-element' : 'rounded-tr-element'}`
                    : `${position === 'left' ? 'rounded-l-element' : 'rounded-r-element'}`
                }
            `}
            ref={dropdownRef}
        >
            <button
                type='button'
                className={`
                    not-focus:border-light-outline not-focus:dark:border-dark-outline
                    w-full cursor-pointer
                    ${dropdownOpen
                        ? `${position === 'left' ? 'rounded-tl-element' : 'rounded-tr-element'} px-3 py-2 text-sm text-light-label-secondary-fg dark:text-dark-label-secondary-fg placeholder-light-secondary-base dark:placeholder-dark-secondary-base-hover border-2 border-b-0 border-light-base-primary dark:border-dark-base-primary`
                        : `${position === 'left' ? 'rounded-l-element' : 'rounded-r-element'} form-input`
                    } 
                `}
                onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                }}
                onKeyDown={
                    (event: React.KeyboardEvent<HTMLButtonElement>) => {
                        if (event.key === 'ArrowDown') {
                            setDropdownOpen(true);
                        }
                    }
                }
            >
                <div className='flex justify-between items-center'>
                    <span className={`${labelValue ? 'text-light-label-secondary-fg dark:text-dark-label-secondary-fg' : 'text-light-secondary-base dark:text-dark-secondary-base-hover'}`}>{labelValue}</span>
                    <i className='fa-solid fa-chevron-down text-sm px-element'></i>
                </div>
            </button>
            <div
                className={`
                    absolute z-10 w-fit
                    text-light-base-primary dark:text-dark-base-primary
                    bg-light-layout-primary dark:bg-dark-layout-primary
                    border-t-1 border-t-light-outline
                    border-2
                    border-light-base-primary dark:border-dark-base-primary
                    rounded-b-element shadow-lg
                    ${position === 'left' ? 'left-0' : 'right-0'}
                    transition-[opacity, transform] duration-400 ease-out origin-top
                    ${dropdownOpen ? "scale-y-100 opacity-100 visible" : "scale-y-0 opacity-0 invisible pointer-events-none"}
                `}>

                <ul className="max-h-48 overflow-y-auto text-sm">
                    {valueList.map((item) => (
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
                            className="px-6 py-2 hover:bg-light-layout-secondary hover:dark:bg-dark-layout-secondary cursor-pointer flex justify-between items-center"
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
    );
}

type LabelValueUnitProps = {
    position: "left" | "right";
    value?: string | number;
};

export function LabelValueUnit({
    position,
    value
}: LabelValueUnitProps) {
    return (
        <span className={`
                inline-flex items-center
                 ${position === 'left' ? 'rounded-l-element' : 'rounded-r-element'}
                px-3 text-sm
                border border-light-base-primary dark:border-dark-base-primary
                text-light-base-primary dark:text-dark-base-primary
                bg-light-layout-primary dark:bg-dark-layout-primary
            `}>
            {value}
        </span>
    );
}
