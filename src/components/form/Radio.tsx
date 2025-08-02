import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type RadioOption = {
    key: number;
    value: string;
};

type RadioProps = {
    label: string;
    name: string;
    value: number | string;
    map: RadioOption[];
    customFlag?: boolean;
    onChange: (e: { target: { name: string; value: number | string } }) => void;
    className?: string;
    error?: string;
};

export default function Radio({
    label,
    name,
    value,
    map,
    customFlag = false,
    onChange,
    className = "",
    error,
}: RadioProps) {
    const { t } = useTranslation();
    const [valueInput, setValueInput] = useState<string>("");

    useEffect(() => {
        const found = map.findIndex((x) => x.key === Number(value)) >= 0;
        setValueInput(found ? "" : String(value));
    }, [value]);

    const onRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValueInput(""); // reset custom input
        onChange({
            target: {
                name,
                value: Number(value),
            },
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValueInput(value);
        onChange({
            target: {
                name,
                value,
            },
        });
    };

    return (
        <div className={`mb-4 ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            <div className="flex flex-wrap gap-2">
                {map.map((option) => (
                    <div className="w-[100px]" key={option.key}>
                        <input
                            type="radio"
                            name={name}
                            value={option.key}
                            id={`${name}_${option.key}`}
                            checked={parseInt(String(value)) === option.key}
                            onChange={onRadioChange}
                            className="peer hidden"
                            autoComplete="off"
                        />
                        <label
                            htmlFor={`${name}_${option.key}`}
                            className="w-full cursor-pointer rounded border border-gray-300 px-3 py-1.5 text-center text-sm text-gray-700 peer-checked:bg-blue-500 peer-checked:text-white transition"
                        >
                            {option.value}
                        </label>
                    </div>
                ))}

                {customFlag && (
                    <div className="w-[100px]">
                        <input
                            type="text"
                            name={name}
                            value={valueInput}
                            onChange={onInputChange}
                            placeholder={t("common.text.otherValue")}
                            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoComplete="off"
                        />
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium px-1">{error}</p>
            )}
        </div>
    );
}
