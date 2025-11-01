import { useEffect, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import ErrorForm from "./ErrorForm";
import { decode } from "../../function/commonHelper";
import InputLabel from "./InputLabel";

type Option<T extends string | number> = {
    key: T;
    icon?: string;
    value: string;
};

type RadioProps<T extends string | number> = {
    label: string;
    size?: 'sm' | 'md' | 'lg'
    columnSpan?: number;
    name: string;
    value: T;
    map: Option<T>[];
    customFlag?: boolean;
    onChange: (e: { target: { name: string; value: T } }) => void;
    error?: string;
};

function Radio<T extends string | number>({
    label,
    columnSpan = 1,
    name,
    value,
    size = 'md',
    map,
    customFlag = false,
    onChange,
    error
}: RadioProps<T>) {
    const { t } = useTranslation();
    const [valueInput, setValueInput] = useState<T | -1>();

    useEffect(() => {
        const existsInMap = map.some((x) => x.key === value);
        setValueInput(existsInMap ? (-1 as T | -1) : value);
    }, [value, map]);

    const isKeyNumber = typeof map[0]?.key === "number";

    const onRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value: inputValue } = e.target;
        const parsedValue = (isKeyNumber ? Number(inputValue) : inputValue) as T;
        setValueInput(-1);
        onChange({
            target: {
                name,
                value: parsedValue,
            },
        });
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value: inputValue } = e.target;
        const parsedValue = (isKeyNumber ? Number(inputValue) : inputValue) as T;
        setValueInput(parsedValue);
        onChange({
            target: {
                name,
                value: parsedValue,
            },
        });
    };

    return (
        <div
            className={`${decode(
                columnSpan,
                2,
                "md:col-span-2",
                3,
                "md:col-span-3",
                4,
                "md:col-span-4"
            )}`}
        >
            <InputLabel label={label} />
            <div className="flex flex-wrap items-start">
                {map.map((object) => (
                    <div
                        className={
                            decode(size
                                , 'sm', 'pr-2 pb-2 w-[85px]'
                                , 'md', 'pr-2 pb-2 w-[100px]'
                                , 'lg', 'pr-2 pb-2 w-[100px]'
                            )
                        }
                        key={object.key}>
                        <input
                            type="radio"
                            className="hidden peer"
                            name={name}
                            value={object.key}
                            id={`${name}_${object.key}`}
                            checked={value === object.key}
                            onChange={onRadioChange}
                            autoComplete="off"
                        />
                        <label
                            htmlFor={`${name}_${object.key}`}
                            className={`
                                block w-full text-center border
                                rounded px-2 py-2 cursor-pointer
                                ${'sm' === size ? 'text-sm' : ''}
                                border-light-primary-base-hover dark:border-dark-primary-base-hover
                                peer-checked:text-light-primary-base-line dark:peer-checked:text-dark-primary-base-line
                                peer-checked:bg-light-base-fg dark:peer-checked:bg-dark-primary-base
                            `}
                        >
                            <i className={`${object.icon} ${'sm' === size ? 'mr-1' : ''}`} />
                            {
                                'sm' !== size &&
                                <br />
                            }
                            {object.value}
                        </label>
                    </div>
                ))}

                {customFlag && (
                    <div className="pr-2 pb-2 w-[100px]">
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1"
                            value={valueInput === -1 ? "" : valueInput}
                            name={name}
                            onChange={onInputChange}
                            autoComplete="off"
                            placeholder={t("common.text.otherValue")}
                        />
                    </div>
                )}
            </div>
            <ErrorForm text={error} />
        </div>
    );
}

export default Radio;