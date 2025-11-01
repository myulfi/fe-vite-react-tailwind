import { useTranslation } from "react-i18next";
import ErrorForm from "./ErrorForm";
import InputLabel from "./InputLabel";

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
            <InputLabel label={label} />
            <div className="flex shadow-sm rounded-element">
                <input
                    className={`
                    form-input w-full rounded-element shadow-sm cursor-pointer
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
            </div>
            <ErrorForm text={error} />
        </div>
    );
}
