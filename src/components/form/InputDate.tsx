import { useTranslation } from "react-i18next";
import ErrorForm from "./ErrorForm";

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
        <div>
            {label && (
                <label className="block mb-1 text-md font-bold color-label">
                    {label}
                </label>
            )}
            <input
                className={`
                    form-input w-full rounded-md shadow-sm cursor-pointer
                    ${disabled ? "bg-gray-100 text-gray-400" : "text-gray-900"}
                    ${error ? 'form-input-error' : 'form-input-normal'} 
                `}
                name={name}
                type="date"
                value={value}
                disabled={disabled}
                onChange={onChange}
                placeholder={t("text.selectName", { name: label })}
            />
            {error && <ErrorForm text={error} />}
        </div>
    );
}
