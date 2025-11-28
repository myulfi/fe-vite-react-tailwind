import React, { Fragment, useState, useEffect, useRef } from "react";
import type { MenuItem } from "./RootTree";

interface TreeNodeProps {
    node: MenuItem;
    checkBoxFlag: boolean;
    level: number;
    parent?: TreeNodeHandlers;
    isLast?: boolean;
}

interface TreeNodeHandlers {
    childChanged: () => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
    node,
    checkBoxFlag,
    level,
    parent,
    isLast
}) => {
    const hasChildren = node.children && node.children.length > 0;

    // STATE
    const [checked, setChecked] = useState(node.checkedFlag === 1);
    const [indeterminate, setIndeterminate] = useState(false);
    const [expanded, setExpanded] = useState(level === 0);

    const checkboxRef = useRef<HTMLInputElement>(null);

    /** Apply indeterminate */
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    /** FORCE UPDATE CHILDREN */
    const forceUpdateChildren = (value: boolean) => {
        setChecked(value);
        setIndeterminate(false);
        node.checkedFlag = value ? 1 : 0;

        if (node.children) {
            node.children.forEach((child: any) => {
                child.__forceUpdate?.(value);
            });
        }
    };

    // Expose forceUpdate to children
    (node as any).__forceUpdate = forceUpdateChildren;

    /** HANDLE CHECKBOX CLICK */
    const onCheck = (value: boolean) => {
        forceUpdateChildren(value);
        // Notify parent
        if (parent) parent.childChanged();
    };

    /** HANDLE CHILD CHANGE → update parent state */
    const childChanged = () => {
        if (!hasChildren) return;
        const children = node.children!;
        const total = children.length;
        const checkedCount = children.filter(c => c.checkedFlag === 1).length;

        if (checkedCount === total) {
            setChecked(true);
            setIndeterminate(false);
            node.checkedFlag = 1;
        } else if (checkedCount === 0) {
            setChecked(false);
            setIndeterminate(false);
            node.checkedFlag = 0;
        } else {
            setChecked(false);
            setIndeterminate(true);
            node.checkedFlag = 0;
        }

        // Bubble up
        if (parent) parent.childChanged();
    };

    /** INITIAL SYNC */
    useEffect(() => {
        if (parent) parent.childChanged();
    }, []);

    return (
        <Fragment>
            <div className="relative container-row hover:bg-light-layout-secondary">

                {/* DOT + LINES */}
                {level > 0 && (
                    <>
                        <span
                            className="absolute top-8 -translate-y-5 w-2 h-2 bg-light-layout-trinity dark:bg-dark-layout-trinity rounded-full"
                            style={{ left: -8 + 20 * level }}
                        />
                        {Array.from({ length: level }, (_, i) => (
                            <span
                                key={i}
                                className={`absolute top-0 border-l border-light-layout-trinity dark:border-dark-layout-trinity 
                                    ${isLast && i === level - 1 && !expanded ? "h-3" : "h-6"}`}
                                style={{ left: -4 + 20 * (i + 1) }}
                            />
                        ))}
                        <span
                            className={`absolute -left-2 top-3.5 border-t border-light-layout-trinity dark:border-dark-layout-trinity 
                                ${!hasChildren ? "w-8" : "w-3"}`}
                            style={{ left: -4 + 20 * level }}
                        />
                    </>
                )}

                {/* EXPAND BUTTON */}
                {hasChildren ? (
                    <span
                        onClick={() => setExpanded(!expanded)}
                        className="cursor-pointer w-4 pl-additional"
                        style={{ marginLeft: 20 * level }}
                    >
                        <i className={`fa-solid text-xs ${expanded ? "fa-angle-down" : "fa-angle-right"}`} />
                    </span>
                ) : (
                    <span className="w-4" style={{ marginLeft: 20 * level }} />
                )}

                {/* CHECKBOX */}
                {checkBoxFlag && (
                    <input
                        ref={checkboxRef}
                        type="checkbox"
                        checked={checked}
                        onChange={e => onCheck(e.target.checked)}
                        className="cursor-pointer"
                    />
                )}

                {/* LABEL */}
                <span className="flex items-center">
                    {node.icon && <i className={`${node.icon} mr-additional`} />}
                    {node.name}
                </span>
            </div>

            {/* CHILDREN */}
            <div
                className={`overflow-hidden transition-[max-height, opacity]
                    ${expanded ? "duration-500 max-h-[1000px] opacity-100 visible" :
                        "duration-300 max-h-0 opacity-0 invisible pointer-events-none"}`}
            >
                {hasChildren && node.children!.map((child, idx) => (
                    <TreeNode
                        key={child.id}
                        node={child}
                        checkBoxFlag={checkBoxFlag}
                        level={level + 1}
                        parent={{ childChanged }}
                        isLast={idx === node.children!.length - 1}
                    />
                ))}
            </div>
        </Fragment>
    );
};

export default TreeNode;
