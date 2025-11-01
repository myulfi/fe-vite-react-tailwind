import React, { useState } from 'react';

type Tab = {
    label: string;
    icon?: string;
    content: React.ReactNode;
};

type TabsProps = {
    tabs: Tab[];
    initialActiveTab?: number;
};

const Navtab: React.FC<TabsProps> = ({ tabs, initialActiveTab = 0 }) => {
    const [activeTab, setActiveTab] = useState(initialActiveTab);

    return (
        <div className="w-full">
            <div className="color-main rounded-xl">
                <div className="p-container flex flex-row flex-wrap">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            className={`
                                text-lg font-medium py-0 px-2 border-b-2
                                transition-colors duration-200
                                cursor-pointer
                                ${activeTab === index
                                    ? 'text-light-base-primary dark:text-dark-base-primary border-light-base-primary dark:border-dark-base-primary'
                                    : 'text-light-label-secondary-fg dark:text-dark-label-secondary-fg border-transparent hover:text-light-base-primary hover:dark:text-dark-base-primary hover:border-light-base-primary hover:dark:border-dark-base-primary'
                                }
                        `}
                            onClick={() => setActiveTab(index)}
                        >
                            {tab.icon && <i className={`${tab.icon} mr-2`} />}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        style={{ display: activeTab === index ? 'block' : 'none' }}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Navtab;
