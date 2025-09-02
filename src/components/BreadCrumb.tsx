import React, { Fragment } from "react";
import { onCopy } from "../function/commonHelper";
import Span from "./Span";

type BreadCrumbProps = {
    valueList: string[];
    delimiter?: string;
    onClick: (index: number) => void;
    onEdit: () => void;
};

const BreadCrumb: React.FC<BreadCrumbProps> = ({
    valueList,
    delimiter = "&mnsp;",
    onClick,
    onEdit,
}) => {
    return (
        <Fragment>
            {valueList.map((name, index) => (
                <Fragment key={index}>
                    {index > 0 && <span className="px-1">{delimiter}</span>}

                    {index === valueList.length - 1 ? (
                        <b>{name}</b>
                    ) : (
                        <Span label={name} className="cursor-pointer hover:underline" onClick={() => onClick(index)} />
                    )}
                </Fragment>
            ))}
            <span className="ml-2">|</span>
            <span className="fa-solid fa-pen cursor-pointer ml-2" onClick={onEdit} />
            <span className="fa-solid fa-copy cursor-pointer ml-2" onClick={(e) => onCopy(e, valueList.join(delimiter))}
            />
        </Fragment>
    );
};

export default BreadCrumb;
