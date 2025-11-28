import React, { Fragment, useState } from "react";

export interface MenuItem {
    id: number;
    name: string;
    icon?: string;
    path?: string | null;
    children?: MenuItem[];
}

interface TreeProps {
    checkBoxFlag: boolean;
    data: MenuItem[];
}

export default function Tree({ checkBoxFlag, data }: TreeProps) {
    return (
        <div className='container-column p-container'>
            <div className="container-card p-element animate-fade-in-delay-1">
                {[{
                    "id": 0,
                    "name": import.meta.env.VITE_API_URL,
                    "icon": "fa-solid fa-earth-asia",
                    "sequence": 1,
                    "path": "/home.html",
                    "menuParentId": 0,
                    "children": data
                }].map((node) => (
                    <TreeNode key={node.id} checkBoxFlag={checkBoxFlag} node={node} level={0} />
                ))}
            </div>
        </div>
    );
}

interface TreeNodeProps {
    node: MenuItem;
    checkBoxFlag?: boolean;
    level: number;
    parentChecked?: boolean;
    isLast?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, checkBoxFlag = false, level, isLast }) => {
    const [expanded, setExpanded] = useState<boolean>(level === 0);
    const [checked, setChecked] = useState<boolean>(node.checkedFlag);

    const hasChildren = node.children && node.children.length > 0;

    const setCheckedRecursive = (value: boolean) => {
        setChecked(value);

        if (!node.children) return;

        node.children.forEach((child) => {
            child.__forceCheck?.(value);
        });
    };

    (node as any).__forceCheck = (value: boolean) => {
        setChecked(value);

        if (node.children) {
            node.children.forEach((child) => {
                child.__forceCheck?.(value);
            });
        }
    };

    return (
        <Fragment>
            <div className="relative container-row hover:bg-light-layout-secondary">
                {
                    level > 0 &&
                    <span
                        className='absolute top-8 -translate-y-5 w-2 h-2 bg-light-layout-trinity dark:bg-dark-layout-trinity rounded-full'
                        style={{ left: -8 + (20 * level) }}
                    />
                }
                {
                    level > 0 &&
                    Array.from({ length: level }, (_, i) => (
                        <span
                            className={`absolute top-0 border-l border-light-layout-trinity dark:border-dark-layout-trinity ${isLast && i === (level - 1) && !expanded ? 'h-3' : 'h-6'}`}
                            style={{ left: -4 + (20 * (i + 1)) }}
                        />
                    ))
                }
                {
                    level > 0 &&
                    <span
                        className={`absolute -left-2 top-3.5 border-t border-light-layout-trinity dark:border-dark-layout-trinity ${!hasChildren && level > 0 ? 'w-8' : 'w-3'}`}
                        style={{ left: -4 + (20 * level) }}
                    />
                }

                {
                    hasChildren ? (
                        <span
                            onClick={() => setExpanded(!expanded)}
                            className="cursor-pointer w-4 pl-additional"
                            style={{ marginLeft: 0 + (20 * level) }}
                        >
                            <i className={`fa-solid text-xs ${expanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
                        </span>
                    ) : (
                        <span
                            className="w-4"
                            style={{ marginLeft: 0 + (20 * level) }}
                        />
                    )
                }

                {
                    checkBoxFlag &&
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setCheckedRecursive(e.target.checked)}
                        className="cursor-pointer"
                    />
                }

                <span
                    className="flex items-center"
                >
                    {node.icon && <i className={`${node.icon} mr-additional`} />}
                    {node.name}
                </span>


            </div>
            <div
                className={`
                   overflow-hidden
                    transition-[max-height, opacity]
                    ${expanded ? "duration-500" : "duration-300"} ease-in-out
                    ${expanded ? "max-h-[1000px] opacity-100 visible" : "max-h-0 opacity-0 invisible pointer-events-none"}
                `}
            >
                {
                    hasChildren &&
                    node.children!.map((child: MenuItem, index) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            checkBoxFlag={checkBoxFlag}
                            level={level + 1}
                            isLast={index === node.children!.length - 1}
                        />
                    ))
                }
            </div>
            {/* <div
                className={`
                hidden
                ${level > 0 ? 'pl-additional ml-additional' : ''}
                ${!isLast && level > 0 ? 'border-l border-light-contrast dark:border-dark-contrast' : ''}
            `}
            >
                <div className={`relative flex items-center gap-element`}>
                    {
                        level > 0 &&
                        <span className='absolute -left-2.5 top-7 -translate-y-5 w-1 h-1 bg-light-contrast dark:bg-dark-contrast rounded-full'></span>
                    }
                    {
                        isLast &&
                        <span className="absolute -left-2 top-0 border-l border-light-contrast dark:border-dark-contrast h-3" />
                    }

                    {
                        level > 0 &&
                        <span className={`absolute -left-2 top-2.5 border-t border-light-contrast dark:border-dark-contrast ${!hasChildren && level > 0 ? 'w-7' : 'w-3'}`} />
                    }
                    {hasChildren ? (
                        <span
                            onClick={() => setExpanded(!expanded)}
                            className="cursor-pointer w-4 px-additional"
                        >
                            <i className={`fa-solid text-xs ${expanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
                        </span>
                    ) : (
                        <span className="w-4 inline-block"></span>
                    )}

                    {
                        checkBoxFlag &&
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setCheckedRecursive(e.target.checked)}
                            className="cursor-pointer"
                        />
                    }

                    <span className="flex items-center">
                        {node.icon && <i className={`${node.icon} mr-additional`} />}
                        {node.name}
                    </span>
                </div>

                <div
                    // className={`ml-additional ${expanded ? 'border-l border-light-contrast dark:border-red-400' : ''}`}
                    className="ml-additional"
                >
                    {expanded &&
                        hasChildren &&
                        node.children!.map((child: MenuItem, index) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                isLast={index === node.children!.length - 1}
                            />
                        ))}
                </div>
            </div> */}
        </Fragment>
    );
};
