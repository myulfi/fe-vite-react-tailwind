import { onCopy } from "../../function/commonHelper";

interface LabelProps {
    text: string;
    value?: string;
    copy?: boolean
}

export default function Label({
    text,
    value,
    copy = false
}: LabelProps) {
    return (
        <div className="text-dark dark:text-tertiary">
            <label className="block mb-1 text-md font-bold">{text}</label>
            <label className="block mb-1 text-md font-normal">
                {value}
                {
                    copy && value !== undefined && value.trim.length > 0
                    && <>
                        &nbsp;<i
                            className="fa-solid fa-copy cursor-pointer"
                            onClick={(e) => onCopy(e, value)}
                        />
                    </>
                }
            </label>
        </div>
    );
}
