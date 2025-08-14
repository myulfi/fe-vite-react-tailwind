export function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export function formatMoney(value: (string | null)) {
    return value?.toString().replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") ?? 0;
}

export function roundNumber(num: number, dec: number) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec)
}

export function format(template: string, values: any[]) {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof values[index] !== 'undefined' ? values[index] : match;
    });
}

export function decode(key?: string | number, ...args: (string | number | ((key: string | number) => string))[]): string {
    if (key === undefined || key === null) return "";

    const len = args.length;
    const hasDefault = len % 2 === 1;
    const defaultValue = hasDefault ? args[len - 1] : undefined;

    for (let i = 0; i < len - (hasDefault ? 1 : 0); i += 2) {
        const match = args[i];
        const value = args[i + 1];

        if (key === match) {
            if (typeof value === "function") {
                return value(key);
            } else {
                return String(value);
            }
        }
    }

    // console.log(key)
    console.log(args)
    if (defaultValue !== undefined) {
        return typeof defaultValue === "function"
            ? defaultValue(key)
            : String(defaultValue);
    }

    return "";
}


export function nvl<T>(object1: T, object2: T): T {
    if (
        typeof object1 === "undefined" ||
        object1 === null ||
        object1 === "" ||
        (Array.isArray(object1) && object1.length === 0) ||
        (typeof object1 === "object" && !Array.isArray(object1) && Object.keys(object1).length === 0) ||
        object1 === 0
    ) {
        return object2;
    }

    return object1;
}

export function yesNo(value: number) {
    return value === 1 ? "text.yes" : "text.no"
}

export function downloadFile(name: string, data: any) {
    const url = window.URL.createObjectURL(new Blob(data))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}

export function formatBytes(value: number) {
    if (value === 0) return '0 Bytes'
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    let idx = Math.floor(Math.log(value) / Math.log(1024))
    if (idx > sizes.length - 1) idx = sizes.length - 1
    return formatMoney((value / Math.pow(1024, idx)).toFixed(2)) + ' ' + sizes[idx]
}

export function onCopy(e: React.MouseEvent<HTMLElement>, value: string) {
    const div = document.createElement("div");
    div.innerText = value;
    div.style.position = "absolute";
    div.style.left = "-9999px";
    document.body.appendChild(div);

    const range = document.createRange();
    range.selectNodeContents(div);

    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }

    document.execCommand("copy");

    if (selection) {
        selection.removeAllRanges();
    }

    document.body.removeChild(div);

    // Create tooltip
    const tooltip = document.createElement("div");
    tooltip.innerText = `"${value}" copied`;
    tooltip.style.position = "absolute";
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
    tooltip.style.backgroundColor = "#333";
    tooltip.style.color = "#FFF";
    tooltip.style.padding = "7px";
    tooltip.style.borderRadius = "5px";
    tooltip.style.fontSize = "12px";
    tooltip.style.opacity = "0.9";
    tooltip.style.pointerEvents = "none";
    tooltip.style.zIndex = "9999";
    tooltip.style.transition = "opacity 0.3s";

    document.body.appendChild(tooltip);

    setTimeout(() => {
        document.body.removeChild(tooltip);
    }, 1000);
};

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}