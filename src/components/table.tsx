import { Fragment, useEffect, useState } from "react";
import { decode, getNestedValue, onCopy } from "../function/commonHelper";
import { Trans, useTranslation } from "react-i18next";
import Button from "./form/Button";
import InputText from "./form/InputText";
import type { ButtonArray } from "../constants/common-constants";

interface TableProps {
    showFlag?: boolean;
    type?: 'pagination' | 'load_more';
    labelNewButton?: string;
    onNewButtonClick?: () => void;
    additionalButtonArray?: ButtonArray;
    bulkOptionLoadingFlag?: boolean;
    bulkOptionArray?: {
        label: string;
        icon: string;
        onClick: () => void;
    }[];
    lengthFlag?: boolean;
    searchFlag?: boolean;
    dataArray?: any[];
    columns: {
        name: string;
        data: string;
        class?: string;
        copy?: boolean;
        width?: number;
        minDevice?: 'none' | 'mobile' | 'tablet' | 'desktop' | 'tv';
        defaultContent?: () => string;
        render?: (value: any, data: any) => React.ReactNode;
        orderable?: boolean;
    }[];
    order?: [string, 'asc' | 'desc'];
    checkBoxArray?: number[] | undefined;
    onCheckBox?: (ids: number[]) => void;
    dataTotal?: number;
    dataLoadMoreFlag?: number;
    initialSizePage?: number;
    limitPaginationButton?: number;
    filter?: any;
    resetPagination?: boolean;
    onRender: (
        page: number,
        size: number,
        search: string,
        order?: [string, 'asc' | 'desc']
    ) => void;
    loadingFlag?: boolean;
}

export default function Table({
    showFlag = true,
    type = 'pagination',
    labelNewButton,
    onNewButtonClick = () => { alert("Please define your function!") },
    additionalButtonArray = [],
    bulkOptionLoadingFlag = false,
    bulkOptionArray = [],
    lengthFlag = true,
    searchFlag = true,
    dataArray = [],
    columns,
    order = undefined,
    checkBoxArray = undefined,
    onCheckBox = () => { alert("Please define your function!") },
    dataTotal = 0,
    dataLoadMoreFlag = 0,
    initialSizePage = 10,
    limitPaginationButton = 7,
    filter,
    resetPagination,
    onRender,
    loadingFlag = false,
}: TableProps) {
    const { t } = useTranslation()
    const [itemArray, setItemArray] = useState(dataArray)
    const [search, setSearch] = useState("")
    const [currentOrder, setCurrentOrder] = useState(order)
    const [orderColumn, setOrderColumn] = useState<(string | null)[]>([])
    const [detailRow, setDetailRow] = useState(itemArray.map(() => false))

    const [currentPage, setCurrentPage] = useState(1)
    const [sizePage, setSizePage] = useState(initialSizePage)

    useEffect(() => {
        if ('pagination' === type) {
            setItemArray(dataArray)
        } else if ('load_more' === type) {
            setItemArray([...itemArray, ...dataArray])
        }
    }, [dataArray])

    useEffect(() => {
        if ('load_more' === type) {
            setItemArray([]);
            setCurrentPage(1);
        }
    }, [columns])

    const checkBoxStateArray = itemArray.map(function (obj) {
        return obj['id']
    })

    const columnShow = columns.filter(column => { return column.minDevice !== 'none' })
    const columnHide = columns.filter(column => { return column.minDevice !== undefined && column.minDevice !== 'mobile' })
    const columnAlwaysHide = columns.filter(column => { return column.minDevice === 'none' })

    const pages = Array.from({ length: Math.ceil(dataTotal / sizePage) }, (_, i) => i + 1)
    const lengthArray = [5, 10, 25, 50, 100]

    const onPageChange = (page: number, length: number, search: string) => {
        if ('load_more' === type && page === 1) {
            setItemArray([])
        }
        setCurrentPage(page)
        setSizePage(length)
        setDetailRow(itemArray.map(() => false))
        onRender(page, length, search, currentOrder)
    }

    const onPageLoadMore = (page: number, length: number, search: string) => {
        setCurrentPage(page)
        setSizePage(length)
        setDetailRow(itemArray.map(() => false))
        onRender(page, length, search, currentOrder)
    }

    const onOrderChange = (data: string, index: number) => {
        var array: (string | null)[] = new Array()
        for (var i = 0; i < orderColumn.length; i++) {
            if (index === i) {
                setDetailRow(itemArray.map(() => false))
                if (orderColumn[i] === "fa-solid fa-arrow-down-wide-short") {
                    array.push("fa-solid fa-arrow-down-short-wide")
                    setCurrentOrder([data, "asc"])
                    onRender(currentPage, sizePage, search, [data, "asc"])
                } else {
                    array.push("fa-solid fa-arrow-down-wide-short")
                    setCurrentOrder([data, "desc"])
                    onRender(currentPage, sizePage, search, [data, "desc"])
                }
            } else {
                array.push(orderColumn[i] !== null ? "fa-solid fa-ellipsis-vertical" : null)
            }
        }
        setOrderColumn(array)
    }

    const onCheckBoxAll = () => {
        if (checkBoxArray !== undefined) {
            const currentCheckBoxStateArray = checkBoxStateArray.length
            const currentCheckBoxArray = itemArray.filter(datum => checkBoxArray.includes(datum.id)).length
            itemArray.forEach(function (itemArray) {
                if (itemArray.id !== undefined) {
                    if (currentCheckBoxStateArray !== currentCheckBoxArray) {
                        if (checkBoxArray.includes(itemArray.id) === false) {
                            checkBoxArray.push(itemArray.id)
                        }
                    } else {
                        if (checkBoxArray.includes(itemArray.id)) {
                            checkBoxArray.splice(checkBoxArray.indexOf(itemArray.id), 1)
                        }
                    }
                }
            })

            onCheckBox(checkBoxArray)
        }
    }

    const onCheckBoxSingle = (id: number) => {
        if (checkBoxArray !== undefined) {
            if (checkBoxArray.includes(id)) {
                checkBoxArray.splice(checkBoxArray.indexOf(id), 1)
            } else {
                checkBoxArray.push(id)
            }

            onCheckBox(checkBoxArray)
        }
    }

    const showDetail = (index: number) => {
        setDetailRow({ ...detailRow, [index]: !detailRow[index] })
    }

    const paginationRange = (len: number, start: number) => {
        var end

        if (start === undefined) {
            start = 1
            end = len
        } else {
            end = start
            start = len
        }

        var out = []
        for (var i = start; i <= end; i++) { out.push(i) }
        return out
    }

    const paginationButton = (currentPage: number, pageAmount: number, limitButton: number) => {
        const halfLimitButon = Math.floor(limitButton / 2)
        var buttonArray: number[]
        if (pageAmount <= limitButton) {
            buttonArray = paginationRange(1, pageAmount)
        } else if (currentPage <= halfLimitButon) {
            buttonArray = paginationRange(1, limitButton)
            buttonArray[limitButton - 2] = 0
            buttonArray[limitButton - 1] = pageAmount
        } else if (currentPage >= pageAmount - halfLimitButon) {
            buttonArray = paginationRange(pageAmount - limitButton + 1, pageAmount)
            buttonArray[0] = 1
            buttonArray[1] = 0
        } else {
            buttonArray = paginationRange(currentPage - halfLimitButon, currentPage + halfLimitButon)
            buttonArray[0] = 1
            buttonArray[1] = 0
            buttonArray[limitButton - 2] = 0
            buttonArray[limitButton - 1] = pageAmount
        }

        return buttonArray
    }

    useEffect(() => {
        if (orderColumn.length === 0) {
            var array: (string | null)[] = new Array()

            for (var i = 0; i < columnShow.length; i++) {
                if (order?.length === 2 && columnShow[i].data === order[0]) {
                    array.push("asc" === order[1] ? "fa-solid fa-arrow-down-short-wide" : "fa-solid fa-arrow-down-wide-short")
                } else {
                    array.push(columnShow[i].orderable ? "fa-solid fa-ellipsis-vertical" : null);
                }
            }

            if (order?.length === 2) {
                if ("asc" === order[1]) {
                    setCurrentOrder([order[0], "asc"])
                    onRender(currentPage, sizePage, search, [order[0], "asc"])
                } else if ("desc" === order[1]) {
                    setCurrentOrder([order[0], "desc"])
                    onRender(currentPage, sizePage, search, [order[0], "desc"])
                }
            } else {
                onRender(currentPage, sizePage, search)
            }
            setOrderColumn(array)
        } else {
            onPageChange(1, sizePage, search)
        }
    }, [filter])

    useEffect(() => {
        setCurrentPage(1)
        setDetailRow(itemArray.map(() => false))
    }, [resetPagination])

    return (
        <div>
            <div>
                {
                    (labelNewButton != undefined || additionalButtonArray.length > 0 || bulkOptionArray.length > 0) &&
                    <div className="flex flex-col flex-wrap sm:flex-row md:justify-between gap-5 pb-5">
                        {
                            labelNewButton != undefined
                            && <div className="w-full sm:w-auto">
                                <Button label={labelNewButton} className="w-full text-nowrap" size="md" type="primary" icon="fa-solid fa-plus" onClick={() => onNewButtonClick()} />
                            </div>
                        }
                        {
                            additionalButtonArray.map((additionalButton, index) => (
                                <div key={index} className="w-full sm:w-auto">
                                    <Button key={index} label={additionalButton.label} className={`w-full text-nowrap ${additionalButton.className}`} size="md" type={additionalButton.type} icon={additionalButton.icon} onClick={additionalButton.onClick} loadingFlag={additionalButton.loadingFlag} />
                                </div>
                            ))
                        }
                        {
                            bulkOptionArray.length > 0
                            && <div className="w-full sm:w-auto sm:ml-auto">
                                <Button
                                    label={`${checkBoxArray !== undefined && checkBoxArray?.length > 0 ? `(${checkBoxArray?.length}) ` : ''}${t("button.bulkOption")}`}
                                    className="w-full text-nowrap btn-primary"
                                    size="md"
                                    type="primary"
                                    icon="fa-solid fa-boxes-stacked"
                                    menuArray={bulkOptionArray}
                                    loadingFlag={bulkOptionLoadingFlag}
                                />
                            </div>
                        }
                    </div>
                }
                {(lengthFlag || searchFlag) &&
                    <div className="flex flex-col md:flex-row items-center md:justify-between gap-5 pb-5">
                        {
                            lengthFlag
                            && <div className="w-full md:w-auto max-sm:flex max-sm:items-center max-sm:justify-center-safe">
                                <Trans
                                    i18nKey="table.lengthMenu"
                                    components={{
                                        menu: <select className="p-1" value={sizePage} onChange={(e) => onPageChange(1, Number(e.target.value), search)}>
                                            {
                                                lengthArray.map((length) => (
                                                    <option value={length} key={length}>{length}</option>
                                                ))
                                            }
                                        </select>
                                    }}
                                />
                            </div>
                        }
                        {
                            searchFlag
                            && <div className="w-full md:w-auto md:ml-auto">
                                <InputText
                                    autoFocus={true}
                                    autoComplete="off"
                                    name="name"
                                    value={search}
                                    onChange={event => setSearch(event.target.value)}
                                    onKeyDown={event => { if (event.key === "Enter") { onPageChange(1, sizePage, search) } }} />
                            </div>
                        }
                    </div>
                }
            </div>
            <div
                className={`
                    overflow-x-auto w-full pb-5
                    ${loadingFlag ? 'min-h-64' : ''}
            `}>
                {
                    loadingFlag
                    && (
                        "pagination" === type
                        || ("load_more" === type && itemArray.length === 0)
                    )
                    && <div className={`
                        text-light-base dark:text-dark-base
                        absolute top-8/12 left-1/2
                        transform -translate-x-1/2 -translate-y-1/2
                        fa-solid fa-spinner fa-spin text-9xl
                    `}></div>
                }
                <table className="min-w-full table-auto">
                    <thead className='text-light-base-line-secondary dark:text-dark-base-line-secondary border-y-1 border-light-divider dark:border-dark-divider'>
                        <tr>
                            {
                                checkBoxArray !== undefined
                                && <th scope="col" className="text-center px-3">
                                    <span
                                        className={`text-light-base dark:text-dark-base cursor-pointer ${itemArray.filter(datum => checkBoxArray.includes(datum.id)).length === 0 ? 'fa-regular fa-square' : itemArray.filter(datum => checkBoxArray.includes(datum.id)).length === checkBoxStateArray.length ? 'fa-solid fa-square-plus' : 'fa-solid fa-square-minus'}`}
                                        role="button" onClick={() => onCheckBoxAll()}></span>
                                </th>
                            }
                            {
                                columnShow.map((column, index) => (
                                    <th key={index} scope="col" className={`px-4 py-4 align-middle ${column.class} ${column.minDevice == 'desktop' ? "max-lg:hidden" : column.minDevice == 'tablet' ? "max-md:hidden" : ""}`} style={column.width != null ? { width: `${column.width}%` } : {}}>
                                        <span className="flex items-center justify-between w-full">
                                            <span>{column.name}</span>
                                            {
                                                orderColumn[index] != null &&
                                                <i className={`cursor-pointer ${orderColumn[index]}`} role="button" onClick={() => onOrderChange(column.data, index)}></i>
                                            }
                                        </span>
                                    </th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            itemArray.length > 0
                                ? itemArray.map((data, indexRow) => (
                                    <Fragment key={indexRow}>
                                        <tr className="border-b-1 border-light-divider dark:border-dark-divider">
                                            {
                                                checkBoxArray !== undefined
                                                && data.id !== undefined
                                                && <td className="text-center">
                                                    <span className={`text-light-base dark:text-dark-base cursor-pointer ${checkBoxArray.indexOf(data.id) >= 0 ? 'fa-solid fa-square-check' : 'fa-regular fa-square'}`}
                                                        role="button" onClick={() => onCheckBoxSingle(data.id)}></span>
                                                </td>
                                            }
                                            {
                                                checkBoxArray !== undefined
                                                && data.id === undefined
                                                && <td className="text-center"></td>
                                            }
                                            {
                                                columnShow
                                                    .map((column, index) => (
                                                        <td key={index} className={`px-4 py-3 ${index === 0 && column.copy !== true ? "cursor-pointer" : undefined} ${column.class} ${column.minDevice == 'desktop' ? "max-lg:hidden" : column.minDevice == 'tablet' ? "max-md:hidden" : ""}`} onClick={index === 0 && column.copy !== true ? () => showDetail(indexRow) : undefined}>
                                                            {
                                                                index == 0 &&
                                                                <span className={`cursor-pointer me-2 ${columnAlwaysHide.length === 0 ? "lg:hidden" : null}`} onClick={column.copy ? () => showDetail(indexRow) : undefined} ><i className={`fa-solid ${detailRow[indexRow] ? "fa-circle-minus" : "fa-circle-plus"}`} /></span>
                                                            }
                                                            {
                                                                column.render != undefined
                                                                    ? column.render(getNestedValue(data, column.data), data)
                                                                    : getNestedValue(data, column.data) ?? (column.defaultContent ? column.defaultContent() : "")
                                                            }
                                                            {
                                                                column.copy
                                                                && <>
                                                                    &nbsp;<i
                                                                        className="fa-solid fa-copy cursor-pointer"
                                                                        onClick={(e) => onCopy(
                                                                            e,
                                                                            column.render != undefined
                                                                                ? column.render(getNestedValue(data, column.data), data)
                                                                                : getNestedValue(data, column.data) ?? (column.defaultContent ? column.defaultContent() : "")
                                                                        )}
                                                                    />
                                                                </>
                                                            }
                                                        </td>
                                                    ))
                                            }
                                        </tr>
                                        {
                                            <tr>
                                                <td
                                                    className={columnAlwaysHide.length === 0 ? "lg:hidden" : ''}
                                                    colSpan={columnShow.length + (checkBoxArray !== undefined ? 1 : 0)}
                                                >
                                                    {
                                                        columnHide
                                                            .map((column, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`
                                                                        overflow-hidden
                                                                        ml-6 mr-2 px-2
                                                                        border-l-1 border-light-divider dark:border-dark-divider
                                                                        transition-[max-height, opacity, padding] duration-300 ease-in-out
                                                                        ${detailRow[indexRow] ? "max-h-[1000px] opacity-100 py-2" : "max-h-0 opacity-0 py-0"}
                                                                        ${decode(column.minDevice, 'tablet', 'md:hidden', 'desktop', 'lg:hidden')}
                                                                    `}>
                                                                    <span className='row-hidden-bullet' />
                                                                    <label className="fw-bold mx-2">{column.name}</label>
                                                                    {
                                                                        column.render != undefined
                                                                            ? column.render(getNestedValue(data, column.data), data)
                                                                            : getNestedValue(data, column.data) ?? (column.defaultContent ? column.defaultContent() : "")
                                                                    }
                                                                    {
                                                                        column.copy
                                                                        && <>
                                                                            &nbsp;<i
                                                                                className="fa-solid fa-copy cursor-pointer"
                                                                                onClick={(e) => onCopy(
                                                                                    e,
                                                                                    column.render != undefined
                                                                                        ? column.render(getNestedValue(data, column.data), data)
                                                                                        : getNestedValue(data, column.data) ?? (column.defaultContent ? column.defaultContent() : "")
                                                                                )}
                                                                            />
                                                                        </>
                                                                    }
                                                                </div>
                                                            ))
                                                    }
                                                </td>
                                            </tr >
                                        }
                                    </Fragment>
                                ))
                                : <tr className="border-b-1 border-light-divider dark:border-dark-divider">
                                    <td colSpan={columnShow.length + (checkBoxArray != undefined ? 1 : 0)} className="px-4 py-3">
                                        {
                                            !loadingFlag &&
                                            <div className="flex flex-col items-center">
                                                <i className={`
                                                    text-light-base dark:text-dark-base
                                                    fa-solid fa-inbox text-9xl
                                                `} />
                                                <label>{t("table.emptyTable")}</label>
                                            </div>
                                        }
                                    </td>
                                </tr>
                        }
                    </tbody>
                </table>
            </div>
            {
                'pagination' === type
                && dataTotal > 0
                && <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-5 pb-5">
                    <div className="w-full sm:w-auto max-sm:flex max-sm:items-center max-sm:justify-center-safe">
                        {t
                            (
                                "table.info",
                                {

                                    start: ((currentPage - 1) * sizePage + 1) > dataTotal && dataTotal > 0 ? 0 : (((currentPage - 1) * sizePage) + 1),
                                    end: ((currentPage - 1) * sizePage + 1) > dataTotal && dataTotal > 0 ? 0 : (currentPage * sizePage > dataTotal ? dataTotal : (currentPage * sizePage)),
                                    total: dataTotal
                                }
                            )
                        }
                    </div>
                    <div className="w-full sm:w-auto sm:ml-auto max-sm:flex max-sm:items-center max-sm:justify-center-safe">
                        {
                            pages.length > 1
                            && <div className="inline-flex items-center -space-x-px text-sm">
                                <button
                                    disabled={currentPage === 1}
                                    className={`
                                        max-md:hidden rounded-l-md
                                        px-3 py-2 ml-0 leading-tight border
                                        text-light-base dark:text-dark-base
                                        hover:text-light-base-secondary dark:hover:text-dark-base-secondary
                                        bg-light-outline dark:bg-dark-outline/30
                                        border-light-outline dark:border-dark-outline/30
                                        cursor-pointer
                                        
                                        disabled:text-light-base-line disabled:dark:text-dark-base-line
                                        disabled:cursor-not-allowed
                                    `}
                                    onClick={() => currentPage === 1 ? {} : onPageChange(currentPage - 1, sizePage, search)}
                                >
                                    {t("table.previous")}
                                </button>
                                {
                                    paginationButton(currentPage, pages.length, limitPaginationButton).map((page, index) => (
                                        <Fragment key={index}>
                                            <button
                                                className={`
                                                    max-md:first:rounded-l-md max-md:last:rounded-r-md
                                                    px-3 py-2 leading-tight border
                                                        
                                                        
                                                    ${page === currentPage
                                                        ? `
                                                        text-light-base-line dark:text-dark-base-line
                                                        `
                                                        : `
                                                        text-light-base dark:text-dark-base
                                                        hover:text-light-base-secondary dark:hover:text-dark-base-secondary
                                                        
                                                        
                                                        ${page === 0 ? 'cursor-default' : 'cursor-pointer hover:text-light-base-secondary dark:hover:text-dark-base-secondary'}
                                                    `}
                                                    
                                                    bg-light-outline dark:bg-dark-outline/30
                                                    border-light-outline dark:border-dark-outline/30
                                                `}
                                                onClick={() => onPageChange(page, sizePage, search)}
                                            >
                                                {page === 0 ? "..." : page}
                                            </button>
                                        </Fragment>
                                    ))
                                }
                                <button
                                    disabled={currentPage === pages.length}
                                    className={`
                                        max-md:hidden rounded-r-md
                                        px-3 py-2 ml-0 leading-tight border
                                        text-light-base dark:text-dark-base
                                        hover:text-light-base-secondary dark:hover:text-dark-base-secondary
                                        bg-light-outline dark:bg-dark-outline/30
                                        border-light-outline dark:border-dark-outline/30
                                        cursor-pointer
                                        
                                        disabled:text-light-base-line disabled:dark:text-dark-base-line
                                        disabled:cursor-not-allowed
                                    `}
                                    onClick={() => currentPage === pages.length ? {} : onPageChange(currentPage + 1, sizePage, search)}
                                >
                                    {t("table.next")}
                                </button>
                            </div>
                        }
                    </div >
                </div >
            }
            {
                'load_more' === type
                && itemArray.length > 0
                && <div className="pb-5">
                    {
                        dataLoadMoreFlag === 0
                        && <div className="flex items-center gap-4 text-light-base dark:text-dark-base text-sm mt-4">
                            <div className="flex-grow border-t border-light-outline dark:border-dark-outline"></div>
                            <span className="whitespace-nowrap">{t("text.endData")}</span>
                            <div className="flex-grow border-t border-light-outline dark:border-dark-outline"></div>
                        </div>
                    }
                    <div>
                        {t("text.amountItem", { amount: itemArray.length })}
                    </div>
                    {
                        dataLoadMoreFlag === 1
                        && <div className="text-center mt-2">
                            <Button
                                label={t("button.loadMore")}
                                size="sm"
                                type="primary"
                                icon="fa-solid fa-circle-arrow-down animate-bounce"
                                onClick={() => onPageLoadMore(currentPage + 1, sizePage, search)}
                                loadingFlag={loadingFlag}
                            />
                        </div>
                    }
                </div>
            }
        </div>
    )
}