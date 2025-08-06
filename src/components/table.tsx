import { Fragment, useEffect, useState } from "react";
import { getNestedValue, onCopy } from "../function/commonHelper";
import { Trans, useTranslation } from "react-i18next";
import Button from "./form/Button";
import InputText from "./form/InputText";

interface TableProps {
    showFlag?: boolean;
    type?: 'pagination' | 'load_more';
    labelNewButton?: string;
    onNewButtonClick?: () => void;
    additionalButtonArray?: {
        label?: string;
        className?: string;
        type: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
        icon?: string;
        onClick: () => void;
        loadingFlag?: boolean;
    }[];
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
    checkBoxArray?: number[];
    onCheckBox?: (ids: number[]) => void;
    dataTotal?: number;
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
    checkBoxArray = [],
    onCheckBox = () => { alert("Please define your function!") },
    dataTotal = 0,
    initialSizePage = 10,
    limitPaginationButton = 7,
    filter,
    resetPagination,
    onRender,
    loadingFlag = false,
}: TableProps) {
    const { t } = useTranslation()
    const [loadMoreButtonFlag, setLoadMoreButtonFlag] = useState(true)
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
            setLoadMoreButtonFlag(dataArray.length == sizePage)
        }
    }, [dataArray])

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

    const onCheckBoxSingle = (id: number) => {
        if (checkBoxArray.includes(id)) {
            checkBoxArray.splice(checkBoxArray.indexOf(id), 1)
        } else {
            checkBoxArray.push(id)
        }

        onCheckBox(checkBoxArray)
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
                    if ("asc" === order[1]) {
                        array.push("asc" === order[1] ? "fa-solid fa-arrow-down-short-wide" : "fa-solid fa-arrow-down-wide-short")
                    }
                }
                array.push(columnShow[i].orderable ? "fa-solid fa-ellipsis-vertical" : null)
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
                <div className="flex flex-col md:flex-row md:justify-between gap-5 pb-5 max-sm:pb-2">
                    {
                        labelNewButton != undefined
                        && <div className="w-full md:w-auto">
                            <Button label={labelNewButton} className="w-full text-nowrap" size="md" type="primary" icon="fa-solid fa-plus" onClick={() => onNewButtonClick()} />
                        </div>
                    }
                    {
                        additionalButtonArray.map((additionalButton, index) => (
                            <div key={index} className="w-full md:w-auto">
                                <Button key={index} label={additionalButton.label} className={`w-full text-nowrap ${additionalButton.className}`} size="md" type={additionalButton.type} icon={additionalButton.icon} onClick={additionalButton.onClick} loadingFlag={additionalButton.loadingFlag} />
                            </div>
                        ))
                    }
                    {
                        bulkOptionArray.length > 0
                        && <div className="w-full md:w-auto md:ml-auto">
                            <Button label={t("button.bulkOption")} className="w-full text-nowrap btn-primary" size="md" type="secondary" icon="fa-solid fa-boxes-stacked" onClick={() => onNewButtonClick()} />
                        </div>
                        // && <div className="w-full md:w-auto md:ml-auto pb-4">
                        //     <div className="btn-group">
                        //         <button className="btn btn-outline-dark shadow-sm dropdown-toggle" disabled={bulkOptionLoadingFlag} data-bs-toggle="dropdown">
                        //             <span className={bulkOptionLoadingFlag ? "spinner-border spinner-border-sm mx-2" : undefined} role="status" aria-hidden="true" />
                        //             <span className="bi-stack">&nbsp;{checkBoxArray?.length > 0 ? `(${checkBoxArray?.length}) ` : null}{t("button.bulkOption")}</span>
                        //         </button>
                        //         <div className="dropdown-menu">
                        //             {
                        //                 bulkOptionArray.map((bulkOption, index) => (
                        //                     <Dropdown key={index} label={bulkOption.label} icon={bulkOption.icon} onClick={() => bulkOption.onClick()}></Dropdown>
                        //                 ))
                        //             }
                        //         </div>
                        //     </div>
                        // </div>
                    }
                </div>
                <div className="flex flex-col md:flex-row md:justify-between gap-5 pb-5">
                    {
                        lengthFlag
                        && <div className="w-full md:w-auto mt-1.5 max-sm:my-0">
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
            </div>
            <div className="overflow-x-auto w-full pb-5">
                <table className="min-w-full table-auto">
                    {/* bg-slate-300 dark:bg-gray-700 */}
                    <thead className='text-light-base-line-secondary dark:text-dark-base-line-secondary border-y-1 border-light-divider dark:border-dark-divider'>
                        <tr>
                            {
                                checkBoxArray.length > 0
                                && <th scope="col" className="text-center">
                                    <span
                                        className={`cursor-pointer ${itemArray.filter(datum => checkBoxArray.includes(datum.id)).length === 0 ? 'fa-regular fa-square' : itemArray.filter(datum => checkBoxArray.includes(datum.id)).length === checkBoxStateArray.length ? 'fa-solid fa-square-plus' : 'fa-solid fa-square-minus'}`}
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
                                                checkBoxArray.length > 0
                                                && data.id !== undefined
                                                && <td className="text-center">
                                                    <span className={`cursor-pointer ${checkBoxArray.indexOf(data.id) >= 0 ? 'fa-solid fa-square-check' : 'fa-regular fa-square'}`}
                                                        role="button" onClick={() => onCheckBoxSingle(data.id)}></span>
                                                </td>
                                            }
                                            {
                                                checkBoxArray.length > 0
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
                                            columnHide.length > 0 && detailRow[indexRow] &&
                                            <tr className={columnAlwaysHide.length === 0 ? "lg:hidden" : undefined}>
                                                <td colSpan={columnShow.length + (checkBoxArray != undefined ? 1 : 0)}>
                                                    {
                                                        columnHide
                                                            .map((column, index) => (
                                                                <div key={index} className={`border-l-1 border-light-divider dark:border-dark-divider ml-6 mr-2 px-2 py-2 ${column.minDevice == 'tablet' ? "md:hidden" : column.minDevice == 'desktop' ? "lg:hidden" : ""}`}>
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
                                : <tr>
                                    <td colSpan={columnShow.length + (checkBoxArray != undefined ? 1 : 0)} className="text-center">
                                        {t("table.emptyTable")}
                                    </td>
                                </tr>
                        }
                    </tbody>
                </table>
            </div>
            {
                'pagination' === type
                && dataTotal > 0
                && <div className="flex flex-col md:flex-row md:justify-between gap-2 md:mt-2 pb-3">
                    <div className="w-full md:w-auto max-sm:my-2">
                        {/* {`Showing ${((currentPage - 1) * sizePage + 1) > dataTotal && dataTotal > 0 ? 0 : (((currentPage - 1) * sizePage) + 1)} to ${((currentPage - 1) * sizePage + 1) > dataTotal && dataTotal > 0 ? 0 : (currentPage * sizePage > dataTotal ? dataTotal : (currentPage * sizePage))} of ${dataTotal} entries`} */}
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
                    <div className="w-full md:w-auto md:ml-auto">
                        {
                            pages.length > 1
                            && <ul className="inline-flex items-center -space-x-px text-sm">
                                <li className="max-md:hidden">
                                    {
                                        currentPage === 1
                                            ? <a className="px-3 py-2 ml-0 leading-tight rounded-l-md border
                                            text-gray-400 dark:text-gray-500
                                            bg-gray-200 dark:bg-gray-700
                                            border-gray-300 dark:border-gray-600
                                            cursor-default pointer-events-none"
                                                aria-disabled="true">{t("table.previous")}</a>
                                            : <a className="px-3 py-2 ml-0 leading-tight rounded-l-md border
                                            text-gray-500 dark:text-gray-400
                                            bg-white dark:bg-gray-800
                                            border-gray-300 dark:border-gray-700
                                            hover:text-gray-700 dark:hover:text-white
                                            hover:bg-gray-100 dark:hover:bg-gray-700
                                            cursor-pointer"
                                                onClick={() => onPageChange(currentPage - 1, sizePage, search)} role="button">
                                                {t("table.previous")}
                                            </a>
                                    }
                                </li>
                                {
                                    paginationButton(currentPage, pages.length, limitPaginationButton).map((page, index) => (
                                        <li
                                            key={index}
                                        >
                                            {
                                                page === currentPage || page === 0
                                                    ? (
                                                        page === 0
                                                            ? <a className="px-3 py-2 ml-0 leading-tight border
                                                                text-gray-400 dark:text-gray-500
                                                                bg-gray-200 dark:bg-gray-700
                                                                border-gray-300 dark:border-gray-600
                                                                cursor-default pointer-events-none"
                                                                aria-disabled="true">...</a>
                                                            : <a
                                                                aria-current="page"
                                                                className="px-3 py-2 leading-tight border
                                                                text-white
                                                                bg-blue-600 dark:bg-blue-500
                                                                border-blue-600 dark:border-blue-500
                                                                cursor-default pointer-events-none"
                                                            >
                                                                {page}
                                                            </a>
                                                    )
                                                    : <a className="px-3 py-2 leading-tight
                                                     text-gray-500 dark:text-gray-400
                                                     bg-white border dark:bg-gray-800
                                                     border-gray-300 dark:border-gray-700
                                                     hover:text-gray-700 dark:hover:text-white
                                                     hover:bg-gray-100 dark:hover:bg-gray-700
                                                     cursor-pointer"
                                                        onClick={() => onPageChange(page, sizePage, search)} role="button">
                                                        {page}
                                                    </a>
                                            }
                                        </li>
                                    ))
                                }
                                <li className="max-md:hidden">
                                    {
                                        currentPage === pages.length
                                            ? <a className="px-3 py-2 ml-0 leading-tight rounded-r-md border
                                            text-gray-400 dark:text-gray-500
                                            bg-gray-200 dark:bg-gray-700
                                            border-gray-300 dark:border-gray-600
                                            cursor-default pointer-events-none"
                                                aria-disabled="true">{t("table.next")}</a>
                                            : <a className="px-3 py-2 ml-0 leading-tight rounded-r-md border
                                            text-gray-500 dark:text-gray-400
                                            bg-white dark:bg-gray-800
                                            border-gray-300 dark:border-gray-700
                                            hover:text-gray-700 dark:hover:text-white
                                            hover:bg-gray-100 dark:hover:bg-gray-700
                                            cursor-pointer"
                                                onClick={() => onPageChange(currentPage + 1, sizePage, search)} role="button">
                                                {t("table.next")}
                                            </a>
                                    }
                                </li>
                            </ul>
                        }
                    </div>
                </div>
            }
            {
                'load_more' === type
                && itemArray.length > 0
                && <Fragment>
                    <div className="mt-2">
                        {/* {t("text.amountItem", { amount: itemArray.length })} */}
                    </div>
                    {
                        loadMoreButtonFlag
                        && <div className="text-center mt-2">
                            <button className="btn btn-md btn-primary rounded border-0 shadow-sm" disabled={loadingFlag} type="button" onClick={() => onPageLoadMore(currentPage + 1, sizePage, search)}>
                                <span className={loadingFlag ? "spinner-border spinner-border-sm mx-2" : undefined} role="status" aria-hidden="true" />
                                <span className="bi-arrow-down-circle">&nbsp;&nbsp;{t("button.loadMore")}</span>
                            </button>
                        </div>
                    }
                </Fragment>
            }
        </div >
    )
}