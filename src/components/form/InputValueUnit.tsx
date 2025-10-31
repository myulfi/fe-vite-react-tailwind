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
    const onInputUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange?.({
            target: {
                name,
                value: Number(value),
            },
        });
    };

    return (
        <select
            className={`
                ${position === 'left' ? 'rounded-l-element' : 'rounded-r-element'}
                px-2 text-sm
                border border-gray-300 bg-gray-100 
                text-gray-700 focus:outline-none
            `}
            name={name}
            value={value}
            disabled={disabled}
            onChange={onInputUnitChange}
        >
            {valueList.map((object) => (
                <option value={object.key} key={object.key}>
                    {object.value}
                </option>
            ))}
        </select>
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
                border border-light-base dark:border-dark-base
                text-light-base dark:text-dark-base
                bg-light-clear dark:bg-dark-clear
            `}>
            {value}
        </span>
    );
}
