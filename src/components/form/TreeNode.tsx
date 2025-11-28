import React, { Fragment, useState, useEffect, useRef } from "react";

export interface MenuItem {
    id: number;
    name: string;
    icon?: string;
    path?: string | null;
    checkedFlag: number; // 0 = unchecked, 1 = checked
    children?: MenuItem[];
}

interface TreeNodeProps {
    node: MenuItem;
    checkBoxFlag: boolean;
    level: number;
    lastFlag: boolean;
    onNodeChange: () => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, checkBoxFlag, level, lastFlag, onNodeChange }) => {
    const hasChildren = node.children && node.children.length > 0;

    const [checked, setChecked] = useState(node.checkedFlag === 1);
    const [indeterminate, setIndeterminate] = useState(false);
    const [expanded, setExpanded] = useState(level === 0);

    const checkboxRef = useRef<HTMLInputElement>(null);

    /** Apply indeterminate to DOM */
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    /** Sync local state when parent updates checkedFlag */
    useEffect(() => {
        setChecked(node.checkedFlag === 1);

        // kalau parent ubah child → indeterminate hilang
        setIndeterminate(false);
    }, [node.checkedFlag]);

    /** Propagate check/uncheck to ALL children */
    const updateChildren = (value: boolean, children?: MenuItem[]) => {
        if (!children) return;
        children.forEach(child => {
            child.checkedFlag = value ? 1 : 0;
            updateChildren(value, child.children);
        });
    };

    /** Evaluate state from children → update this node */
    const evaluateFromChildren = () => {
        if (!hasChildren) return;

        const children = node.children!;
        let checkedCount = 0;
        let totalCount = 0;

        const countChildren = (nodes: MenuItem[]) => {
            nodes.forEach(n => {
                totalCount++;
                if (n.checkedFlag === 1) checkedCount++;
                if (n.children) countChildren(n.children);
            });
        };
        countChildren(children);

        if (checkedCount === totalCount) {
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
            node.checkedFlag = 0; // set parent unchecked but indeterminate
        }
    };

    /** When this node checkbox clicked */
    const onCheck = (value: boolean) => {
        setChecked(value);
        setIndeterminate(false);
        node.checkedFlag = value ? 1 : 0;

        // propagate to children
        updateChildren(value, node.children);

        // notify parent (re-evaluate upward)
        onNodeChange();
    };

    /** Run when children changed → recalc parent */
    useEffect(() => {
        if (hasChildren) {
            evaluateFromChildren();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node.children?.map(c => c.checkedFlag).join(",")]);

    return (
        <Fragment>
            <div className="relative flex flex-row flex-wrap gap-additional hover:bg-light-layout-secondary">
                {/* DOT + LINES */}
                {level > 0 && (
                    <>
                        <span
                            className="absolute top-8 -translate-y-5 w-1 h-1 bg-light-contrast dark:bg-dark-contrast rounded-full"
                            style={{ left: -5 + 20 * level }}
                        />
                        {Array.from({ length: level }, (_, i) => (
                            <span
                                key={i}
                                className={`absolute top-0 border-l border-dashed border-light-contrast dark:border-dark-contrast 
                                ${lastFlag && i === level - 1 && !expanded ? "h-3" : "h-6"}`}
                                style={{ left: -4 + 20 * (i + 1) }}
                            />
                        ))}
                        <span
                            className={`absolute -left-2 top-3.5 border-t border-dashed border-light-contrast dark:border-dark-contrast 
                            ${!hasChildren ? "w-6" : "w-3"}`}
                            style={{ left: -4 + 20 * level }}
                        />
                    </>
                )}

                {/* Expand / Collapse */}
                {hasChildren && (
                    <span
                        onClick={() => setExpanded(!expanded)}
                        className="cursor-pointer pl-additional"
                        style={{ marginLeft: 20 * level, width: 22 }}
                    >
                        <i className={`fa-solid text-xs ${expanded ? "fa-angle-down" : "fa-angle-right"}`} />
                    </span>
                )}
                {!hasChildren && <span style={{ marginLeft: 20 * level, width: 22 }} />}

                {/* Checkbox */}
                {checkBoxFlag && (
                    <input
                        ref={checkboxRef}
                        type="checkbox"
                        checked={checked}
                        onChange={e => onCheck(e.target.checked)}
                        className="cursor-pointer"
                    />
                )}

                {/* Label */}
                <span className="flex items-center ml-1">
                    {node.icon && <i className={`${node.icon} mr-1`} />}
                    {node.name}
                </span>
            </div>

            {/* Children */}
            {hasChildren && (
                <div
                    className={`
                        overflow-hidden transition-[max-height, opacity] duration-300
                        ${expanded ? "max-h-[1000px] opacity-100 visible" : "max-h-0 opacity-0 invisible pointer-events-none"}
                    `}
                >
                    {node.children!.map((child, i) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            checkBoxFlag={checkBoxFlag}
                            level={level + 1}
                            lastFlag={node.children?.length! - 1 === i}
                            onNodeChange={onNodeChange}
                        />
                    ))}
                </div>
            )}
        </Fragment>
    );
};

export default TreeNode;
