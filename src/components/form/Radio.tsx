import { useEffect, useState, type ChangeEvent } from "react"
import { useTranslation } from "react-i18next"
import ErrorForm from "./ErrorForm"

type Option = {
    key: string | number
    icon?: string
    value: string
}

type RadioProps = {
    label: string
    columnSpan?: number,
    name: string
    value: string | number
    map: Option[]
    customFlag?: boolean
    onChange: (e: { target: { name: string; value: string | number } }) => void
    className?: string
    error?: string
}

export default function Radio({
    label,
    columnSpan = 1,
    name,
    value,
    map,
    customFlag = false,
    onChange,
    className = "",
    error,
}: RadioProps) {
    const { t } = useTranslation()
    const [valueInput, setValueInput] = useState<string | number>()

    useEffect(() => {
        const existsInMap = map.findIndex((x) => x.key === Number(value)) >= 0
        setValueInput(existsInMap ? -1 : value)
    }, [value, map])

    const onRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setValueInput(-1)
        onChange({
            target: {
                name,
                value: value,
            },
        })
    }

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setValueInput(value)
        onChange({
            target: {
                name,
                value,
            },
        })
    }

    return (
        <div className={`text-light-base-line dark:text-dark-base-line ${columnSpan > 1 ? `col-span-${columnSpan}` : ''}`}>
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap items-start">
                {map.map((object) => (
                    <div className="pr-2 pb-2 w-[100px]" key={object.key}>
                        <input
                            type="radio"
                            className="hidden peer"
                            name={name}
                            value={object.key}
                            id={`${name}_${object.key}`}
                            checked={String(value) === String(object.key)}
                            onChange={onRadioChange}
                            autoComplete="off"
                        />
                        <label
                            htmlFor={`${name}_${object.key}`}
                            className={`
                                block w-full text-center border
                                rounded px-2 py-2 cursor-pointer
                                border-light-primary-base-hover dark:border-dark-primary-base-hover
                                peer-checked:text-light-primary-base-line dark:peer-checked:text-dark-primary-base-line
                                peer-checked:bg-light-primary-base dark:peer-checked:bg-dark-primary-base
                            `}
                        >
                            <i className={object.icon} /><br />
                            {object.value}
                        </label>
                    </div>
                ))}

                {customFlag && (
                    <div className="pr-2 pb-2 w-[100px]">
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1"
                            // value={valueInput === 0 ? "" : valueInput}
                            value={valueInput}
                            name={name}
                            onChange={onInputChange}
                            autoComplete="off"
                            placeholder={t("common.text.otherValue")}
                        />
                    </div>
                )}
            </div>
            {error && <ErrorForm text={error} />}
        </div>
    )
}
