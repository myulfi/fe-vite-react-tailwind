import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorForm from "./ErrorForm";

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
        <div className="text-light-base-line dark:text-dark-base-line">
            {label && (
                <label className="block mb-1 text-md font-bold">
                    {label}
                </label>
            )}

            <div
                className={`w-full p-4 border-2 border-dashed rounded-md min-h-[120px] transition-colors
                    ${disabled ? "border-gray-200 bg-gray-100 cursor-not-allowed" : "border-gray-300 hover:border-blue-400"}
                    ${error ? "border-red-500" : ""}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="flex flex-wrap gap-3">
                    {currentFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center px-3 py-1 bg-gray-100 border rounded text-sm text-gray-700"
                        >
                            📄 {file.name}
                        </div>
                    ))}

                    <div
                        className={`flex items-center justify-center w-24 h-16 border border-gray-300 rounded cursor-pointer text-sm
                            ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-500"}
                        `}
                        onClick={openFilePicker}
                    >
                        ➕ {t(".text.addFile") ?? "Add File"}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={disabled}
                />

                {currentFiles.length === 0 && (
                    <div className="mt-3 text-sm text-gray-400">
                        {t("button.dragHere") ?? "Drag files here or click 'Add File'"}
                    </div>
                )}
            </div>

            {error && <ErrorForm text={error} />}
        </div>
    );
}
