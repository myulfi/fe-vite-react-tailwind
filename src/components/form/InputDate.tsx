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
        <div className="text-light-base-line dark:text-dark-base-line">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}
            <input
                className={`
border-light-outline dark:border-dark-outline px-3 py-2 text-sm text-light-base-line dark:text-dark-base-line placeholder-light-secondary-base dark:placeholder-dark-secondary-base-hover focus:border-light-base focus:dark:border-dark-base focus:outline-none focus:ring-1 focus:ring-light-base focus:dark:ring-dark-base
          ${error ? "border-red-500 focus:ring-red-500" : ""}
          ${disabled ? "bg-gray-100 text-gray-400" : "text-gray-900"}
        `}
                name={name}
                type="date"
                value={value}
                disabled={disabled}
                onChange={onChange}
                placeholder={t("text.selectName", { name: label })}
            />
            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
}
