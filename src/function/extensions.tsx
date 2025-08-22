// src/utils/array.extensions.ts

export { };

declare global {
    interface Array<T> {
        getValueByKey?(this: Array<{ key: number; value: string }>, keyToFind: number): string | undefined;
    }
}

Array.prototype.getValueByKey = function (
    this: Array<{ key: number; value: string }>,
    keyToFind: number
): string | undefined {
    return this.find(item => item.key === keyToFind)?.value;
};
