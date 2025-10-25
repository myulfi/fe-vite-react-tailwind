import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorForm from "./ErrorForm";
import { reduceInMiddleText } from "../../function/commonHelper";

type InputFileProps = {
    label: string;
    name: string;
    value?: File[];
    disabled?: boolean;
    onChange: (e: { target: { name: string; value: File[] } }) => void;
    error?: string;
};

export default function InputFile({
    label,
    name,
    value,
    disabled = false,
    onChange,
    error,
}: InputFileProps) {
    const { t } = useTranslation();
    const [internalFiles, setInternalFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentFiles = value ?? internalFiles;

    const handleFiles = useCallback(
        (incoming: FileList | null) => {
            if (!incoming) return;
            const newFiles = Array.from(incoming);
            const uniqueFiles = [...currentFiles, ...newFiles].filter(
                (file, index, self) =>
                    index === self.findIndex((f) => f.name === file.name && f.size === file.size)
            );
            setInternalFiles(uniqueFiles);
            onChange({
                target: {
                    name,
                    value: uniqueFiles,
                },
            });
        },
        [currentFiles, name, onChange]
    );

    const handleDeleteFile = useCallback(
        (index: number) => {
            const updatedFiles = currentFiles.filter((_, i) => i !== index);
            setInternalFiles(updatedFiles);
            onChange({
                target: {
                    name,
                    value: updatedFiles,
                },
            });
        },
        [currentFiles, name, onChange]
    );

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const openFilePicker = () => {
        if (!disabled) fileInputRef.current?.click();
    };

    return (
        <div>
            {label && (
                <label className="block mb-1 text-md font-bold color-label">
                    {label}
                </label>
            )}
            <div
                className={`
                    w-full border rounded-md min-h-[120px]
                    transition-colors
                    shadow-sm
                    ${currentFiles.length === 0
                        ? `
                            flex flex-col items-center justify-center
                            hover:border-2    
                            hover:text-light-base hover:dark:text-dark-base
                            hover:border-light-base hover:dark:border-dark-base
                            cursor-pointer                   
                        `
                        : 'grid grid-cols-5 gap-1 p-2'
                    }
                    
                    ${error ? "form-input-error" : "border-light-outline dark:border-dark-outline"}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={currentFiles.length === 0 ? openFilePicker : () => { }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={disabled}
                />
                {
                    currentFiles.length === 0 &&
                    <div className="text-center">
                        <i className="fa-solid fa-arrow-up-from-bracket" />
                        <div>
                            {t("text.clickOrdragHere")}
                        </div>
                    </div>
                }
                {
                    currentFiles.map((file, index) => (
                        <div
                            key={index}
                            className={`
                                relative
                                flex items-center justify-center p-4 m-2
                                h-[80px]
                                text-light-base-line dark:text-dark-base-line
                                bg-light-clear dark:bg-dark-clear
                                border border-dashed
                                rounded text-sm
                            `}
                        >
                            <button
                                onClick={() => handleDeleteFile(index)}
                                className="
                                    absolute top-1.5 right-1
                                    text-light-danger-base hover:text-light-danger-base-hover
                                    hover:cursor-pointer
                                    flex items-center justify-center
                                "
                            >
                                <i className="fa-solid fa-circle-xmark" />
                            </button>
                            {reduceInMiddleText(file.name, 10, 20)}
                        </div>
                    ))
                }

                {
                    currentFiles.length > 0 &&
                    <div
                        className={`
                                p-4 m-2
                                h-[80px]
                                flex flex-col items-center justify-center
                                text-light-base-line dark:text-dark-base-line
                                bg-light-clear dark:bg-dark-clear
                                hover:text-light-base hover:dark:text-dark-base
                                hover:border-light-base hover:dark:border-dark-base
                                hover:cursor-pointer
                                border border-dashed
                                rounded text-sm
                            `}
                        onClick={openFilePicker}
                    >
                        <i className="fa-solid fa-circle-plus" />
                        <div>
                            {t("text.add")}
                        </div>
                    </div>
                }
            </div>

            {error && <ErrorForm text={error} />}
        </div>
    );
}
