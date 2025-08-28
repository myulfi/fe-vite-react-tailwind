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
        <div>
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
            &nbsp;&nbsp;<span className="fa-solid fa-pen cursor-pointer" onClick={onEdit} />
            &nbsp;&nbsp;<span className="fa-solid fa-copy cursor-pointer" onClick={(e) => onCopy(e, valueList.join(delimiter))}
            />
        </div>
    );
};

export default BreadCrumb;
