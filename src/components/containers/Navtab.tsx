import React, { useState } from 'react';

type Tab = {
    label: string;
    icon?: string;
    content: () => React.ReactNode;
};

type TabsProps = {
    tabs: Tab[];
};

const Navtab: React.FC<TabsProps> = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="w-full">
            <div className="flex border-b border-light-divider dark:border-dark-divider">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`
                            text-sm font-medium px-4 py-2 border-b-2
                            transition-colors duration-200
                            cursor-pointer
                            ${activeTab === index
                                ? 'text-light-base dark:text-dark-base border-light-base dark:border-dark-base'
                                : 'text-light-base-line-secondary dark:text-dark-base-line-secondary border-transparent hover:text-light-base hover:dark:text-dark-base hover:border-light-base hover:dark:border-dark-base'
                            }
                        `}
                        onClick={() => setActiveTab(index)}
                    >
                        <i className={`${tab.icon} mr-2`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                {tabs[activeTab]?.content()}
            </div>
        </div>
    );
};

export default Navtab;
