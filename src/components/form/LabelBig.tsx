import { useState } from "react";
import { onCopy } from "../../function/commonHelper";

interface LabelBigProps {
    text: string;
    value?: string | number;
    copy?: boolean;
    password?: boolean;
    columnSpan?: number;
}

export default function LabelBig({
    text,
    value,
    copy = false,
    password = false,
    columnSpan = 1,
}: LabelBigProps) {
    const [showPassword, setShowPassword] = useState(false);

    const displayValue = !password || showPassword ? value : '***********';
    const isCopyable = copy && value !== undefined && String(value).trim().length > 0;

    return (
        <div
            className={`
                relative text-dark dark:text-tertiary
                ${columnSpan > 1 ? `col-span-${columnSpan}` : ''}
            `}
        >
            <label className="block mb-1 text-md font-bold">{text}</label>

            <div
                className="
                    mt-2 mb-1 text-md font-normal
                    overflow-auto
                    max-h-32 max-w-full
                    p-1 rounded bg-light-clear-secondary/50 dark:bg-dark-clear-secondary
                    whitespace-pre-wrap break-all
                "
            >
                {displayValue}
                {
                    isCopyable && (
                        <>
                            &nbsp;<i
                                className="fa-solid fa-copy cursor-pointer"
                                onClick={(e) => onCopy(e, String(value))}
                            />
                        </>
                    )
                }
            </div>

            {
                password && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-7 text-light-base dark:text-dark-base hover:text-light-base-secondary hover:dark:text-dark-base-secondary focus:outline-none cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                    </button>
                )
            }
        </div>
    );
}
