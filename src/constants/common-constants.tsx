export type ModalCategory = 'entry' | 'view';
export type ModalType = {
    title: string;
    submitLabel?: string;
    submitClass?: string;
    submitIcon?: string,
    submitLoadingFlag?: boolean,
};
export interface OptionColumn {
    viewedButtonFlag: boolean;
    deletedButtonFlag: boolean;
};
export type TableOptions = {
    page: number
    length: number
    search: string
    order?: [string, 'asc' | 'desc'] | []
};

export type ButtonArray = {
    label?: string;
    className?: string;
    type: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
    icon?: string;
    onClick: () => void;
    loadingFlag?: boolean;
}[];

export const FLAG = {
    YES: 1,
    NO: 0,
}
export const LOCAL_STORAGE = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    NAME: "name",
    ROLE: "roleList",
}
export const COOKIES = {
    LANGUAGE: "language"
}

export const HTTP_CODE = {
    OK: 200,
    UNAUTHORIZED: 401
}

export const SIDEBAR_WIDTH = 256;