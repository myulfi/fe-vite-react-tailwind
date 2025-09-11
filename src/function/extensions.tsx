// src/utils/array.extensions.ts

export { };

declare global {
    interface Array<T> {
        getValueByKey?(this: Array<{ key: number; value: string }>, keyToFind: number): string | undefined;
        getValueByParameter?<K extends keyof T, V extends keyof T>(
            this: T[],
            parameter: K,
            keyToFind: T[K],
            keyToShow: V
        ): T[V] | undefined;
    }
}

Array.prototype.getValueByKey = function (
    this: Array<{ key: number; value: string }>,
    keyToFind: number
): string | undefined {
    return this.find(item => item.key === keyToFind)?.value;
};

Array.prototype.getValueByParameter = function <T, K extends keyof T, V extends keyof T>(
    this: T[],
    parameter: K,
    keyToFind: T[K],
    keyToShow: V
): T[V] | undefined {
    const item = this.find(entry => entry[parameter] === keyToFind);
    return item?.[keyToShow];
};
