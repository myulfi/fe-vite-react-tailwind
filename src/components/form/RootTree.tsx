import React, { useState } from "react";
import TreeNode from "./TreeNode";

export interface MenuItem {
    id: number;
    name: string;
    icon?: string;
    path?: string | null;
    checkedFlag: number; // 0 = unchecked, 1 = checked
    children?: MenuItem[];
}

interface RootTreeProps {
    checkBoxFlag: boolean;
    data: MenuItem[];
    onCheckedChange?: (checkedIds: number[]) => void;
}

export default function RootTree({ checkBoxFlag, data, onCheckedChange }: RootTreeProps) {
    const [treeData, setTreeData] = useState<MenuItem[]>(data);

    // Ambil semua checked IDs
    const getCheckedIds = (nodes: MenuItem[]): number[] => {
        let ids: number[] = [];
        nodes.forEach((node) => {
            if (node.checkedFlag === 1) ids.push(node.id);
            if (node.children) ids.push(...getCheckedIds(node.children));
        });
        return ids;
    };

    // Callback dari TreeNode
    const handleChange = () => {
        setTreeData([...treeData]); // rerender
        if (onCheckedChange) {
            onCheckedChange(getCheckedIds(treeData));
        }
    };

    const rootNode: MenuItem = {
        id: 0,
        name: import.meta.env.VITE_API_URL || "ROOT",
        checkedFlag: 0,
        children: treeData,
    };

    return (
        <div className="container-column p-container">
            <div className="container-card p-element animate-fade-in-delay-1">
                <TreeNode
                    node={rootNode}
                    checkBoxFlag={checkBoxFlag}
                    level={0}
                    onNodeChange={handleChange}
                />
            </div>
        </div>
    );
}
