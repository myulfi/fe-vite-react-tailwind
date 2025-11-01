import { useState } from "react";
import { onCopy } from "../../function/commonHelper";

interface LabelProps {
    text: string;
    value?: string | number;
    copy?: boolean;
    password?: boolean;
    columnSpan?: number;
}

export default function Label({
    text,
    value,
    copy = false,
    password = false,
    columnSpan = 1,
}: LabelProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`
            relative
            ${columnSpan > 1 ? `col-span-${columnSpan}` : ''}
        `}>
            <label className="block mb-1 text-md font-bold color-label">{text}</label>
            <label className="block mt-2 mb-1 text-md color-value">
                {!password || showPassword ? value : '***********'}
                {
                    copy && value !== undefined && new String(value).trim().length > 0
                    && <>
                        &nbsp;<i
                            className="fa-solid fa-copy cursor-pointer"
                            onClick={(e) => onCopy(e, String(value))}
                        />
                    </>
                }
            </label>
            {
                password &&
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-7 text-light-base-fg dark:text-dark-base-fg hover:text-light-base-secondary-fg hover:dark:text-dark-base-secondary-fg focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                </button>
            }
        </div>
    );
}
