import { useTranslation } from "react-i18next";

type InputDateProps = {
    label: string;
    name: string;
    value?: string;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
};

export default function InputDate({
    label,
    name,
    value,
    disabled = false,
    onChange,
    error,
}: InputDateProps) {
    const { t } = useTranslation();

    return (
        <div className="text-dark dark:text-tertiary">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-3 py-2 border text-sm rounded-md focus:ring-1 focus:outline-none
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}
          ${disabled ? "bg-gray-100 text-gray-400" : "text-gray-900"}
        `}
                name={name}
                type="date"
                value={value}
                disabled={disabled}
                onChange={onChange}
                placeholder={t("common.text.selectName", { name: label })}
            />
            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
}
