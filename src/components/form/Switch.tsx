import { useEffect, useState } from "react";
import InputLabel from "./InputLabel";

type SwitchProps = {
    label: string;
    name: string;
    value: number;
    onChange: (e: { target: { name: string; value: number | string } }) => void;
};

export default function Switch({
    label,
    name,
    value,
    onChange,
}: SwitchProps) {
    const [valueFlag, setValueFlag] = useState(value);

    useEffect(() => {
        onChange({
            target: {
                name,
                value: valueFlag,
            },
        });
    }, [valueFlag]);

    return (
        <div>
            <InputLabel label={label} />
            <div>
                <button
                    onClick={() => setValueFlag(Math.abs(valueFlag - 1))}
                    className={`cursor-pointer mt-2.5 mb-2 w-14 h-6 flex items-center px-1 rounded-full transition-colors duration-300 ${valueFlag ? 'bg-light-base dark:bg-dark-base' : 'bg-gray-400'}`}
                >
                    <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-[translate] duration-300 ${valueFlag ? 'translate-x-6' : 'translate-x-2'}`}
                    />
                </button>
            </div>
        </div>
    );
}