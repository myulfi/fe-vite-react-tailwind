import { useTranslation } from "react-i18next";
import "../../function/extensions";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { HTTP_CODE, type ButtonArray, type ModalCategory, type ModalType, type OptionColumn, type TableOptions } from "../../constants/common-constants";
import { apiRequest } from "../../api";
import { formatDate } from "../../function/dateHelper";
import { confirmDialog, Modal, ModalStackProvider } from "../../ModalContext";
import Label from "../../components/form/Label";
import { Chart } from "react-chartjs-2"
import 'chart.js/auto'
import { toast } from "../../ToastContext";
import InputText from "../../components/form/InputText";
import TextArea from "../../components/form/TextArea";
import Radio from "../../components/form/Radio";
import Select from "../../components/form/Select";
import Table from "../../components/Table";
import { HttpStatusCode } from "axios";
import { decode, downloadFile, yesNo } from "../../function/commonHelper";
import InputPassword from "../../components/form/InputPassword";
import Navtab from "../../components/containers/Navtab";
import Switch from "../../components/form/Switch";
import InputDecimal from "../../components/form/InputDecimal";
import type { ChartOptions } from "chart.js/auto";
import Button from "../../components/form/Button";

export default function Database() {
    const { t } = useTranslation();

    type DatabaseData = {
        code: string;
        description?: string;
        externalServerId: number;
        databaseTypeId: number;
        // valueMultiple: [];
        username: string,
        password: string,
        databaseConnection: string,
        usePageFlag: number,
        lockFlag: number,
        version: number,
    }

    type DatabaseFormError = Partial<Record<keyof DatabaseData, string>>;

    const databaseInitial: DatabaseData = {
        code: '',
        description: undefined,
        externalServerId: 0,
        databaseTypeId: 1,
        username: '',
        password: '',
        databaseConnection: '',
        usePageFlag: 1,
        lockFlag: 0,
        version: 0,
    }

    const [databaseStateModal, setDatabaseStateModal] = useState<ModalCategory>("entry");

    const [databaseOptionColumnTable, setDatabaseOptionColumnTable] = useState<{ [id: number]: OptionColumn; }>({});
    const [databaseAttributeTable, setDatabaseAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [databaseDataTotalTable, setDatabaseDataTotalTable] = useState(0);
    const [databaseTableLoadingFlag, setDatabaseTableLoadingFlag] = useState(false);

    const [databaseArray, setDatabaseArray] = useState([]);

    const [databaseId, setDatabaseId] = useState(0);
    const [databaseForm, setDatabaseForm] = useState<DatabaseData>(databaseInitial);
    const [databaseFormError, setDatabaseFormError] = useState<DatabaseFormError>({});

    const [databaseEntryModal, setDatabaseEntryModal] = useState<ModalType>({
        title: "",
        submitLabel: "",
        submitClass: "",
        submitIcon: "",
        submitLoadingFlag: false,
    });

    const onDatabaseFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setDatabaseForm({ ...databaseForm, [name]: value });
        setDatabaseFormError({ ...databaseFormError, [name]: undefined });
    };

    const databaseValidate = (data: DatabaseData) => {
        const error: DatabaseFormError = {};
        if (!data.code?.trim()) error.code = t("validate.required", { name: t("text.name") });
        if (data.databaseTypeId <= 0) error.databaseTypeId = t("validate.required", { name: t("text.type") });
        if (!data.username?.trim()) error.username = t("validate.required", { name: t("text.username") });
        if (!data.password?.trim()) error.password = t("validate.required", { name: t("text.password") });
        if (!data.databaseConnection?.trim()) error.databaseConnection = t("validate.required", { name: t("text.databaseConnection") });

        setDatabaseFormError(error);
        return Object.keys(error).length === 0;
    };

    useEffect(() => {
        getMasterDatabaseType();
        getMasterExternalServerArray();
    }, []);

    const [masterDatabaseTypeArray, setMasterDatabaseTypeArray] = useState<Array<{ key: number; value: string }>>([]);
    const [masterExternalServerArray, setMasterExternalServerArray] = useState<Array<{ key: number; value: string }>>([]);
    const getMasterDatabaseType = async () => {
        const response = await apiRequest('get', '/master/database-type.json')
        if (HTTP_CODE.OK === response.status) {
            setMasterDatabaseTypeArray(response.data)
        }
    }
    const getMasterExternalServerArray = async () => {
        const response = await apiRequest('get', '/master/external-server.json')
        if (HTTP_CODE.OK === response.status) {
            setMasterExternalServerArray([{ key: 0, value: t("text.none") }, ...response.data]);
        }
    }

    const getDatabase = async (options: TableOptions) => {
        setDatabaseTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,
        };
        setDatabaseAttributeTable(options);

        const response = await apiRequest('get', "/external/database.json", params);
        if (HTTP_CODE.OK === response.status) {
            setDatabaseArray(response.data);
            setDatabaseDataTotalTable(response.total);
            setDatabaseOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    map[obj.id] = { "viewedButtonFlag": false, "connectedButtonFlag": false, "deletedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setDatabaseTableLoadingFlag(false);
    };

    const viewDatabase = async (id: number) => {
        setDatabaseId(id);
        setDatabaseForm(databaseInitial);
        if (id !== undefined) {
            setDatabaseStateModal("view");
            setDatabaseOptionColumnTable(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    viewedButtonFlag: true,
                },
            }));

            const response = await apiRequest('get', `/external/${id}/database.json`);
            if (HTTP_CODE.OK === response.status) {
                const database = response.data;

                setDatabaseId(database.id);
                setDatabaseForm({
                    code: database.code,
                    description: database.description,
                    externalServerId: database.externalServerId,
                    databaseTypeId: database.databaseTypeId,
                    username: database.username,
                    password: database.password,
                    databaseConnection: database.databaseConnection,
                    usePageFlag: database.usePageFlag,
                    lockFlag: database.lockFlag,
                    version: database.version,
                });

                setDatabaseEntryModal({
                    ...databaseEntryModal,
                    title: database.name,
                    submitLabel: t("button.edit"),
                    submitIcon: "fa-solid fa-pen",
                    submitLoadingFlag: false,
                });

                setModalDatabase(true);
            } else {
                toast.show({ type: 'error', message: response.message });
            }

            setDatabaseOptionColumnTable(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    viewedButtonFlag: false,
                },
            }));
        }
    };

    const entryDatabase = (haveContentFlag: boolean) => {
        setDatabaseStateModal("entry");
        setDatabaseFormError({});
        if (haveContentFlag) {
            setDatabaseEntryModal({
                ...databaseEntryModal,
                title: databaseForm.code,
                submitLabel: t("button.update"),
                submitIcon: "fa-solid fa-repeat",
                submitLoadingFlag: false,
            });
        } else {
            setDatabaseId(0);
            setDatabaseForm(databaseInitial);
            setDatabaseEntryModal({
                ...databaseEntryModal,
                title: t("button.createNew"),
                submitLabel: t("button.save"),
                submitIcon: "fa-solid fa-bookmark",
                submitLoadingFlag: false,
            });

            setModalDatabase(true);
        }
    };

    const confirmStoreDatabase = async () => {
        if (databaseValidate(databaseForm)) {
            confirmDialog({
                type: 'confirmation',
                message: t(databaseId === 0 ? "confirmation.create" : "confirmation.update", { name: databaseForm.code }),
                onConfirm: () => storeDatabase(),
            });
        }
    };

    const storeDatabase = async () => {
        if (databaseValidate(databaseForm)) {
            setModalDatabase(false);
            setDatabaseEntryModal({ ...databaseEntryModal, submitLoadingFlag: true });

            const response = await apiRequest(
                databaseId === 0 ? 'post' : 'patch',
                databaseId === 0 ? '/external/database.json' : `/external/${databaseId}/database.json`,
                databaseForm,
            );

            if (HttpStatusCode.Ok === response.status || HttpStatusCode.Created === response.status) {
                getDatabase(databaseAttributeTable);
                toast.show({ type: "done", message: HttpStatusCode.Created === response.status ? "information.created" : "information.updated" });
                setModalDatabase(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setDatabaseEntryModal({ ...databaseEntryModal, submitLoadingFlag: false });
        }
    }

    const confirmDeleteDatabase = (id: number, name: string) => {
        confirmDialog({
            type: 'warning',
            message: t("confirmation.delete", { name: name }),
            onConfirm: () => deleteDatabase(id),
        });
    };

    const deleteDatabase = async (id: number) => {
        setModalDatabase(false);
        setDatabaseOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                deletedButtonFlag: true,
            },
        }));

        const response = await apiRequest('delete', `/external/${id}/database.json`)
        if (HttpStatusCode.NoContent === response.status) {
            getDatabase(databaseAttributeTable);
            toast.show({ type: "done", message: "information.deleted" });
        } else {
            toast.show({ type: "error", message: response.message });
        }

        setDatabaseOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                deletedButtonFlag: false,
            },
        }));
    };

    const [databaseConnectModalTitle, setDatabaseConnectModalTitle] = useState("");

    const connectDatabase = async (id: number, name: string) => {
        setDatabaseId(id);

        setDatabaseOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                connectedButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/external/${id}/database-connect.json`);
        if (HttpStatusCode.NoContent === response.status) {
            setDatabaseConnectModalTitle(name);
            getDatabaseQueryObject(databaseQueryObjectAttributeTable);
            getDatabaseQueryWhitelist(databaseQueryWhitelistAttributeTable);
            setModalDatabaseConnect(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setDatabaseOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                connectedButtonFlag: false,
            },
        }));
    };

    const [databaseQueryObjectOptionColumnTable, setDatabaseQueryObjectOptionColumnTable] = useState<{ [id: string]: OptionColumn; }>({});
    const [databaseQueryObjectAttributeTable, setDatabaseQueryObjectAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [databaseQueryObjectDataTotalTable, setDatabaseQueryObjectDataTotalTable] = useState(0);
    const [databaseQueryObjectTableLoadingFlag, setDatabaseQueryObjectTableLoadingFlag] = useState(false);

    const [databaseQueryObjectArray, setDatabaseQueryObjectArray] = useState([]);

    const getDatabaseQueryObject = async (options: TableOptions) => {
        setDatabaseQueryObjectTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,
        };
        setDatabaseQueryObjectAttributeTable(options);

        const response = await apiRequest('get', `/external/${databaseId}/database-query-object-list.json`, params);
        if (HTTP_CODE.OK === response.status) {
            setDatabaseQueryObjectArray(response.data);
            setDatabaseQueryObjectDataTotalTable(response.total);
            setDatabaseQueryObjectOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    map[obj.id] = { "viewedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setDatabaseQueryObjectTableLoadingFlag(false);
    };

    const [databaseQueryWhitelistOptionColumnTable, setDatabaseQueryWhitelistOptionColumnTable] = useState<{ [id: number]: OptionColumn; }>({});
    const [databaseQueryWhitelistAttributeTable, setDatabaseQueryWhitelistAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [databaseQueryWhitelistDataTotalTable, setDatabaseQueryWhitelistDataTotalTable] = useState(0);
    const [databaseQueryWhitelistTableLoadingFlag, setDatabaseQueryWhitelistTableLoadingFlag] = useState(false);

    const [databaseQueryWhitelistArray, setDatabaseQueryWhitelistArray] = useState([]);

    const getDatabaseQueryWhitelist = async (options: TableOptions) => {
        setDatabaseQueryWhitelistTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,
        };
        setDatabaseQueryWhitelistAttributeTable(options);

        const response = await apiRequest('get', `/external/${databaseId}/database-query-whitelist-list.json`, params);
        if (HTTP_CODE.OK === response.status) {
            setDatabaseQueryWhitelistArray(response.data);
            setDatabaseQueryWhitelistDataTotalTable(response.total);
            setDatabaseQueryWhitelistOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    map[obj.id] = { "viewedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setDatabaseQueryWhitelistTableLoadingFlag(false);
    };

    type DatabaseQueryManualColumData = {
        data: string
        type: string
        name: string
        class: string
        defaultContent: () => ReactNode
    };

    type DatabaseQueryManualData = {
        query: string;
    }
    type DatabaseQueryManualFormError = Partial<Record<keyof DatabaseQueryManualData, string>>;

    const [databaseQueryManualDataTotalTable, setDatabaseQueryManualDataTotalTable] = useState(0);
    const [databaseQueryManualTableLoadingFlag, setDatabaseQueryManualTableLoadingFlag] = useState(false);
    const [databaseQueryManualLoadingFlag, setDatabaseQueryManualLoadingFlag] = useState(false);
    const [databaseQueryManualChartLoadingFlag, setDatabaseQueryManualChartLoadingFlag] = useState(false);

    const [databaseQueryManualAdditionalButtonFlag, setDatabaseQueryManualAdditionalButtonFlag] = useState(false);

    const [databaseQueryManualArray, setDatabaseQueryManualArray] = useState([]);
    const [databaseQueryManualColumn, setDatabaseQueryManualColumn] = useState<DatabaseQueryManualColumData[]>([]);

    const [databaseQueryManualTableFlag, setDatabaseQueryManualTableFlag] = useState(false);

    const [databaseQueryManualId, setDatabaseQueryManualId] = useState(0);
    const [databaseQueryManualForm, setDatabaseQueryManualForm] = useState<DatabaseQueryManualData>({ query: "" });
    const [databaseQueryManualFormError, setDatabaseQueryManualFormError] = useState<DatabaseQueryManualFormError>({});

    const onDatabaseQueryManualFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setDatabaseQueryManualForm({ ...databaseQueryManualForm, [name]: value });
    };

    const onDatabaseQueryManualValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const isEnter = e.key === 'Enter';

        if (e.ctrlKey && isEnter && !databaseQueryManualLoadingFlag) {
            e.preventDefault(); // opsional
            runDatabaseQueryManual();
        }
    }

    const databaseQueryManualValidate = (data: DatabaseQueryManualData) => {
        const error: DatabaseQueryManualFormError = {};
        if (!data.query?.trim()) error.query = t("validate.required", { name: t("text.query") });
        setDatabaseQueryManualFormError(error);
        return Object.keys(error).length === 0;
    };

    const runDatabaseQueryManual = async () => {
        if (databaseQueryManualValidate(databaseQueryManualForm)) {
            setModalDatabase(false);
            setDatabaseQueryManualLoadingFlag(true);

            const response = await apiRequest('post', `/external/${databaseId}/database-query-manual-run.json`, databaseQueryManualForm);

            if (HttpStatusCode.Ok === response.status) {
                setDatabaseQueryManualTableFlag(true);
                if (response.id !== undefined) {
                    setDatabaseQueryManualColumn(
                        response.header.map((element: DatabaseQueryManualColumData) => {
                            return {
                                data: element.name,
                                type: element.type,
                                name: `${element.name} (${element.type})`,
                                class: "text-nowrap",
                                defaultContent: () => { return <i>NULL</i> }
                            }
                        })
                    );
                    setDatabaseQueryManualId(response.id);
                    getDatabaseQueryManual({ id: response.id, page: 1, length: 10 });
                    setDatabaseQueryManualAdditionalButtonFlag(true);
                } else {
                    setDatabaseQueryManualColumn([
                        {
                            data: "message",
                            name: "Result Information",
                            type: "error",
                            class: "text-nowrap",
                            render: function (_, row) {
                                return (
                                    <div>
                                        {
                                            row.message &&
                                            <strong>{row.message}</strong>
                                        }
                                        {
                                            row.affected !== undefined &&
                                            <span>{row.affected} {decode(row.action, "insert", "inserted", "update", "updated", "delete", "deleted", "drop", "droped", "create", "created", "alter", "altered", "affected")}</span>
                                        }
                                        {
                                            row.query &&
                                            <Fragment>
                                                &nbsp;|&nbsp;<i>{row.query}</i>
                                            </Fragment>
                                        }
                                    </div>
                                )
                            }
                        }
                    ]);
                    setDatabaseQueryManualArray(response.data);
                    setDatabaseQueryManualDataTotalTable(0);
                    setDatabaseQueryManualAdditionalButtonFlag(false);
                }
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setDatabaseQueryManualLoadingFlag(false);
        }
    }

    const getDatabaseQueryManual = async (options: {
        id: number;
        page: number;
        length: number;
    }) => {
        setDatabaseQueryManualTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
        };

        const response = await apiRequest('get', `/external/${options.id}/database-query-manual-list.json`, params);
        if (HTTP_CODE.OK === response.status) {
            setDatabaseQueryManualArray(response.data);
            setDatabaseQueryManualDataTotalTable(response.total);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setDatabaseQueryManualTableLoadingFlag(false);
    };

    const [databaseQueryExactDataTotalTable, setDatabaseQueryExactDataTotalTable] = useState(0);
    const [databaseQueryExactTableLoadingFlag, setDatabaseQueryExactTableLoadingFlag] = useState(false);
    const [databaseQueryExactChartLoadingFlag, setDatabaseQueryExactChartLoadingFlag] = useState(false);

    const [databaseQueryExactArray, setDatabaseQueryExactArray] = useState([]);
    const [databaseQueryExactColumn, setDatabaseQueryExactColumn] = useState<DatabaseQueryManualColumData[]>([]);

    const [databaseQueryExactIdentify, setDatabaseQueryExactIdentify] = useState<number | string>(0);

    const [databaseExactModalTitle, setDatabaseExactModalTitle] = useState("")

    const runDatabaseQueryExact = async (identify: number | string) => {
        setModalDatabaseExact(false);

        if (typeof identify === 'number') {
            setDatabaseQueryWhitelistOptionColumnTable(prev => ({
                ...prev,
                [identify]: {
                    ...prev[identify],
                    viewedButtonFlag: true,
                },
            }));
        } else {
            setDatabaseQueryObjectOptionColumnTable(prev => ({
                ...prev,
                [identify]: {
                    ...prev[identify],
                    viewedButtonFlag: true,
                },
            }));
        }

        const response = await apiRequest(
            'post',
            typeof identify === 'number'
                ? `/external/${identify}/database-query-exact-whitelist-run.json`
                : `/external/${databaseId}/${identify}/database-query-exact-object-run.json`
        );

        if (HttpStatusCode.Ok === response.status) {
            setDatabaseExactModalTitle(String(identify));
            setDatabaseQueryExactColumn(
                response.data.map((element: DatabaseQueryManualColumData) => {
                    return {
                        data: element.name,
                        type: element.type,
                        name: `${element.name} (${element.type})`,
                        class: "text-nowrap",
                        defaultContent: () => { return <i>NULL</i> }
                    }
                })
            );

            setDatabaseQueryExactIdentify(identify)
            getDatabaseQueryExact({ identify: identify, page: 1, length: 10 })
            setModalDatabaseExact(true);
        } else {
            toast.show({ type: "error", message: response.message });
        }

        if (typeof identify === 'number') {
            setDatabaseQueryWhitelistOptionColumnTable(prev => ({
                ...prev,
                [identify]: {
                    ...prev[identify],
                    viewedButtonFlag: false,
                },
            }));
        } else {
            setDatabaseQueryObjectOptionColumnTable(prev => ({
                ...prev,
                [identify]: {
                    ...prev[identify],
                    viewedButtonFlag: false,
                },
            }));
        }
    }

    const getDatabaseQueryExact = async (options: {
        identify: number | string;
        page: number;
        length: number;
    }) => {
        setDatabaseQueryExactTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
        };

        const response = await apiRequest(
            'get',
            typeof options.identify === 'number'
                ? `/external/${options.identify}/database-query-exact-whitelist-list.json`
                : `/external/${databaseId}/${options.identify}/database-query-exact-object-list.json`
            , params);

        if (HTTP_CODE.OK === response.status) {
            setDatabaseQueryExactArray(response.data);
            setDatabaseQueryExactDataTotalTable(response.total);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setDatabaseQueryExactTableLoadingFlag(false);
    };

    type DatabaseExportData = {
        format: 'sql' | 'xls' | 'csv' | 'json' | 'xml';
        header: number;
        delimiter: string;
        insertFlag: number;
        includeColumnNameFlag: number;
        numberLinePerAction: number;
        multipleLineFlag: number;
        firstAmountConditioned: number;
        firstAmountCombined: number;
        saveAs: 'clipboard' | 'file';
    }

    type DatabaseExportFormError = Partial<Record<keyof DatabaseExportData, string>>;

    const databaseExportInitial: DatabaseExportData = {
        format: 'sql',
        header: 0,
        delimiter: ',',
        insertFlag: 1,
        includeColumnNameFlag: 0,
        numberLinePerAction: 1,
        multipleLineFlag: 0,
        firstAmountConditioned: 1,
        firstAmountCombined: 0,
        saveAs: 'clipboard',
    };

    const [databaseExportLoadingFlag, setDatabaseExportLoadingFlag] = useState(false);

    const [databaseExportForm, setDatabaseExportForm] = useState<DatabaseExportData>(databaseExportInitial);
    const [databaseExportFormError, setDatabaseExportFormError] = useState<DatabaseExportFormError>({});

    const onDatabaseExportFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setDatabaseExportForm({ ...databaseExportForm, [name]: value });
        setDatabaseExportFormError({ ...databaseExportFormError, [name]: undefined });
    };

    const checkDatabaseExportFrom = {
        header: () => 'csv' === databaseExportForm.format,
        delimiter: () => 'csv' === databaseExportForm.format,
        statement: () => 'sql' === databaseExportForm.format,
        includeColumnName: () => 'sql' === databaseExportForm.format && 1 === databaseExportForm.insertFlag,
        numberLinePerAction: () => 'sql' === databaseExportForm.format && 1 === databaseExportForm.insertFlag,
        multipleLine: () => 'sql' === databaseExportForm.format && 0 === databaseExportForm.insertFlag,
        firstAmountConditioned: () => 'sql' === databaseExportForm.format && 0 === databaseExportForm.insertFlag,
        firstAmountCombined: () => 'xls' === databaseExportForm.format,
        saveAs: () => ['sql', 'csv', 'json', 'xml'].includes(databaseExportForm.format),
    };

    const databaseExportValidate = (data: DatabaseExportData) => {
        const error: DatabaseExportFormError = {};
        if (checkDatabaseExportFrom.delimiter() && !data.delimiter?.trim()) error.delimiter = t("validate.required", { name: t("text.delimiter") });
        if (checkDatabaseExportFrom.numberLinePerAction() && data.numberLinePerAction < 1) error.numberLinePerAction = t("validate.greaterThanEqual", { name: t("text.firstAmountConditioned"), value: 1 });
        if (checkDatabaseExportFrom.firstAmountConditioned() && data.firstAmountConditioned < 1) error.firstAmountConditioned = t("validate.greaterThanEqual", { name: t("text.firstAmountConditioned"), value: 1 });
        if (checkDatabaseExportFrom.firstAmountConditioned() && data.firstAmountCombined < 0) error.firstAmountCombined = t("validate.greaterThanEqual", { name: t("text.firstAmountConditioned"), value: 0 });

        setDatabaseExportFormError(error);
        return Object.keys(error).length === 0;
    };

    const onDatabaseExport = async () => {
        if (databaseExportValidate(databaseExportForm)) {
            setDatabaseExportLoadingFlag(true);

            let url = '';
            if ("sql" === databaseExportForm.format) {
                url = databaseExportForm.insertFlag
                    ? `/external/${databaseQueryManualId}/${databaseExportForm.includeColumnNameFlag}/${databaseExportForm.numberLinePerAction}/database-query-manual-sql-insert.json`
                    : `/external/${databaseQueryManualId}/${databaseExportForm.multipleLineFlag}/${databaseExportForm.firstAmountConditioned}/database-query-manual-sql-update.json`;
            } else if ("xls" === databaseExportForm.format) {
                url = `/external/${databaseQueryManualId}/${databaseExportForm.firstAmountCombined}/database-query-manual.xlsx`;
            } else if ("csv" === databaseExportForm.format) {
                if ("clipboard" === databaseExportForm.saveAs) {
                    url = `/external/${databaseQueryManualId}/${databaseExportForm.header}/${databaseExportForm.delimiter}/database-query-manual-csv.json`;
                } else if ("file" === databaseExportForm.saveAs) {

                }
            } else if ("json" === databaseExportForm.format) {
                if ("clipboard" === databaseExportForm.saveAs) {
                    url = `/external/${databaseQueryManualId}/database-query-manual.json`;
                } else if ("file" === databaseExportForm.saveAs) {

                }
            } else if ("xml" === databaseExportForm.format) {
                if ("clipboard" === databaseExportForm.saveAs) {
                    url = `/external/${databaseQueryManualId}/database-query-manual-xml.json`;
                } else if ("file" === databaseExportForm.saveAs) {

                }
            }

            if ("xls" === databaseExportForm.format) {
                const response = await apiRequest('xlsx', url);
                console.log(response);
                downloadFile("test.xlsx", [response.data]);
                setModalDatabaseExport(false);
            } else {
                const response = await apiRequest('get', url);
                if (HttpStatusCode.Ok === response.status) {
                    if ("clipboard" === databaseExportForm.saveAs) {
                        await navigator.clipboard.writeText(response.data)
                        toast.show({ type: "error", message: "Copied" });
                    } else if ("file" === databaseExportForm.saveAs) {
                        downloadFile("test.txt", [response.data]);
                    }
                    setModalDatabaseExport(false);
                } else {
                    toast.show({ type: "error", message: response.message });
                }
            }
            setDatabaseExportLoadingFlag(false);
        }
    }


    type ChartType = 'line' | 'bar' | 'bubble' | 'doughnut' | 'pie' | 'polarArea' | 'radar' | 'scatter';
    type ChartTypeMap = {
        key: ChartType,
        icon: string,
        value: string,
    };

    const [chartTypeValue, setChartTypeValue] = useState<ChartType>("line");
    const [chartTypeMap, setChartTypeMap] = useState<ChartTypeMap[]>([]);

    type DatabaseQueryType = 'manual' | 'exact';

    const chartRef = useRef(null);
    const [canvasLabelArray, setCanvasLabelArray] = useState<string[]>([])
    const [canvasDatasetCommonArray, setCanvasDatasetCommonArray] = useState<{ hidden: boolean, label: string, data: string }[]>([])
    const [canvasDatasetBubbleArray, setCanvasDatasetBubbleArray] = useState([])
    const [canvasOptionArray, setCanvasOptionArray] = useState<ChartOptions>()
    const [databaseQueryType, setDatabaseQueryType] = useState<DatabaseQueryType>()

    const runDatabaseQueryChart = async (databaseQueryType: DatabaseQueryType) => {
        setDatabaseQueryType(databaseQueryType)
        setChartTypeValue("line")
        if ("manual" === databaseQueryType) {
            setDatabaseQueryManualChartLoadingFlag(true);
        } else {
            setDatabaseQueryExactChartLoadingFlag(true);
        }
        const response = await apiRequest(
            'get',
            "manual" === databaseQueryType
                ? `/external/${databaseQueryManualId}/database-query-manual-all-list.json`
                : (
                    typeof databaseQueryExactIdentify === 'number'
                        ? `/external/${databaseQueryExactIdentify}/database-query-exact-whitelist-all-list.json`
                        : `/external/${databaseId}/${databaseQueryExactIdentify}/database-query-exact-object-all-list.json`
                )
        );

        if (HTTP_CODE.OK === response.status) {
            const databaseQueryColumn = "manual" === databaseQueryType ? databaseQueryManualColumn : databaseQueryExactColumn;
            const labelArray = [...new Set(
                response.data.map((item: any) =>
                    String(item[databaseQueryColumn[0].data] ?? "NULL")
                )
            )] as string[];
            let datasetCommonArray = new Array();
            let datasetBubbleArray = new Array();

            let chartTypeArray: ChartTypeMap[] = []
            chartTypeArray.push({ key: "line", icon: "fa-solid fa-chart-line", value: "Line" });
            chartTypeArray.push({ key: "bar", icon: "fa-solid fa-chart-column", value: "Bar" });

            for (let i = 1; i < databaseQueryColumn.length; i++) {
                if (/.*(int|number|numeric).*$/.test(databaseQueryColumn[i].type.toLowerCase())) {
                    datasetCommonArray.push({
                        "hidden": false,
                        "label": databaseQueryColumn[i].data,
                        // "tension" : 0.4,
                        "data": labelArray.map(label => {
                            return response.data.reduce(function (sum: number, item: any) {
                                if (String(item[databaseQueryColumn[0].data] ?? "NULL") === label) {
                                    return sum + item[databaseQueryColumn[i].data]
                                } else {
                                    return sum
                                }
                            }, 0)
                        })
                    })
                }
            }

            if (datasetCommonArray.length > 0) {
                if (/.*(int|number|numeric).*$/.test(databaseQueryColumn[0].type.toLowerCase())) {
                    if (databaseQueryColumn.length === 2) {
                        chartTypeArray.push({ key: "scatter", icon: "fa-solid fa-soap", value: "Scatter" });
                    } else {
                        chartTypeArray.push({ key: "bubble", icon: "fa-solid fa-soap", value: "Bubble" })
                        chartTypeArray.push({ key: "radar", icon: "fa-solid fa-hexagon-nodes", value: "Radar" })

                        datasetBubbleArray.push({
                            label: datasetCommonArray[0].label,
                            data: labelArray.map((label, index) => {
                                return {
                                    x: label,
                                    y: datasetCommonArray[0].data[index],
                                    r: datasetCommonArray[1].data[index],
                                }
                            })
                        });
                    }
                } else {
                    if (databaseQueryColumn.length === 2) {
                        chartTypeArray.push({ key: "doughnut", icon: "fa-solid fa-circle-half-stroke", value: "Doughnut" })
                        chartTypeArray.push({ key: "pie", icon: "fa-solid fa-chart-pie", value: "Pie" })
                        chartTypeArray.push({ key: "polarArea", icon: "fa-solid fa-hexagon-nodes", value: "Polar" })
                    }
                    chartTypeArray.push({ key: "radar", icon: "fa-solid fa-hexagon-nodes", value: "Radar" })
                }
            }

            if (datasetCommonArray.length === 0) {
                if (
                    databaseQueryColumn.length > 1
                    && /.*(int|number|numeric).*$/.test(databaseQueryColumn[1].type.toLowerCase()) === false
                ) {
                    const secondLabelArray = [...new Set(response.data.map((item: any) => item[databaseQueryColumn[1].data] ?? "NULL"))]
                    secondLabelArray.forEach(secondLabel => {
                        datasetCommonArray.push({
                            hidden: false,
                            label: secondLabel,
                            data: labelArray.map(label => {
                                return response.data.reduce(function (sum: number, item: any) {
                                    if (
                                        String(item[databaseQueryColumn[0].data] ?? "NULL") === label
                                        && String(item[databaseQueryColumn[1].data] ?? "NULL") === secondLabel
                                    ) {
                                        return sum + 1
                                    } else {
                                        return sum
                                    }
                                }, 0)
                            })
                        })
                    })
                } else {
                    datasetCommonArray.push({
                        hidden: false,
                        label: t("common.text.amount"),
                        // tension : 0.4,
                        data: labelArray.map(label => {
                            return response.data.reduce(function (sum: number, item: any) {
                                if (String(item[databaseQueryColumn[0].data] ?? "NULL") === label) {
                                    return sum + 1
                                } else {
                                    return sum
                                }
                            }, 0)
                        })
                    })
                }
            }

            setChartTypeMap(chartTypeArray)
            setCanvasLabelArray(labelArray)
            setCanvasDatasetCommonArray(datasetCommonArray)
            setCanvasDatasetBubbleArray(datasetBubbleArray)

            let optionArray: ChartOptions = {
                maintainAspectRatio: false,
                responsive: true
            }

            if (datasetCommonArray.length === 1) {
                optionArray = {
                    ...optionArray,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            // type: 'linear',
                            // beginAtZero: true,
                            stacked: false,
                            title: {
                                display: true,
                                text: databaseQueryColumn[0].name,
                                font: {
                                    size: 20,
                                },
                            }
                        },
                        y: {
                            // beginAtZero: true,
                            stacked: false,
                            title: {
                                display: true,
                                text: datasetCommonArray[0].label,
                                font: {
                                    size: 20,
                                }
                            }
                        }
                    }
                }
            } else {
                optionArray = {
                    ...optionArray,
                    scales: {
                        x: {
                            stacked: false,
                            title: {
                                display: true,
                                text: databaseQueryColumn[0].name,
                                font: {
                                    size: 20,
                                },
                            }
                        }
                    }
                }
            }

            setCanvasOptionArray(optionArray);
            setModalDatabaseChart(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        if ("manual" === databaseQueryType) {
            setDatabaseQueryManualChartLoadingFlag(false);
        } else {
            setDatabaseQueryExactChartLoadingFlag(false);
        }
    }

    const onChartTypeChange = (e: { target: { name: string; value: any } }) => {
        setChartTypeValue(e.target.value)
        let optionArray: ChartOptions = {
            maintainAspectRatio: false,
            responsive: true
        }

        if (/(bar|line|scatter)$/.test(e.target.value)) {
            if (canvasDatasetCommonArray.length === 1) {
                optionArray = {
                    ...optionArray,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            // type: 'linear',
                            beginAtZero: true,
                            stacked: false,
                            title: {
                                display: true,
                                text: "manual" === databaseQueryType ? databaseQueryManualColumn[0].data : databaseQueryExactColumn[0].data,
                                font: {
                                    size: 20,
                                },
                            }
                        },
                        y: {
                            beginAtZero: true,
                            stacked: false,
                            title: {
                                display: true,
                                text: canvasDatasetCommonArray[0].label,
                                font: {
                                    size: 20,
                                }
                            }
                        }
                    }
                }
            } else {
                optionArray = {
                    ...optionArray,
                    scales: {
                        x: {
                            stacked: false,
                            title: {
                                display: true,
                                text: "manual" === databaseQueryType ? databaseQueryManualColumn[0].data : databaseQueryExactColumn[0].data,
                                font: {
                                    size: 20,
                                },
                            }
                        }
                    }
                }
            }
        } else if (/(polarArea)$/.test(e.target.value)) {
            optionArray = {
                ...optionArray,
                scales: {
                    r: {
                        pointLabels: {
                            display: true,
                            centerPointLabels: true,
                            font: {
                                size: 18
                            }
                        }
                    }
                }
            }
        } else if (/(bubble)$/.test(e.target.value)) {
            optionArray = {
                ...optionArray,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                        title: {
                            display: true,
                            text: "manual" === databaseQueryType ? databaseQueryManualColumn[0].data : databaseQueryExactColumn[0].data,
                            font: {
                                size: 20,
                            },
                        }
                    },
                    y: {
                        ticks: { beginAtZero: true },
                        stacked: false,
                        title: {
                            display: true,
                            text: canvasDatasetCommonArray[0].label,
                            font: {
                                size: 20,
                            }
                        }
                    }
                }
            }
        } else if (/(pie)$/.test(e.target.value)) {
            // optionArray = {
            //     ...optionArray,
            //     plugins: {
            //         tooltip: {
            //             callbacks: {
            //                 label: function (tooltipItem) {
            //                     console.log(tooltipItem)
            //                     const label = tooltipItem.label || '';
            //                     const value = tooltipItem.raw;
            //                     return `${label}: ${value}%`; // Custom label for tooltip
            //                 }
            //             }
            //         }
            //     }
            // }
        } else if (/(radar)$/.test(e.target.value)) {
            if (canvasDatasetCommonArray.length === 1) {
                optionArray = {
                    ...optionArray,
                    plugins: {
                        legend: {
                            display: false
                        },
                    },
                }
            }

            optionArray = {
                ...optionArray,
                scales: {
                    r: {
                        pointLabels: {
                            callback: function (value, index) {
                                return value
                            }
                        },
                        beginAtZero: true
                    }
                }
            }
        }

        setCanvasOptionArray(optionArray)
    }

    const [modalDatabase, setModalDatabase] = useState(false);
    const [modalDatabaseConnect, setModalDatabaseConnect] = useState(false);
    const [modalDatabaseExact, setModalDatabaseExact] = useState(false);
    const [modalDatabaseExport, setModalDatabaseExport] = useState(false);
    const [modalDatabaseChart, setModalDatabaseChart] = useState(false);

    return (
        <div className="bg-light-clear dark:bg-dark-clear m-5 p-5 pb-0 rounded-lg shadow-lg">
            <ModalStackProvider>
                <Modal
                    show={modalDatabase}
                    size="md"
                    title={databaseEntryModal.title}
                    onClose={() => setModalDatabase(false)}
                    buttonArray={[
                        "entry" === databaseStateModal && ({
                            label: databaseEntryModal.submitLabel,
                            type: "primary",
                            icon: databaseEntryModal.submitIcon,
                            onClick: () => confirmStoreDatabase(),
                            loadingFlag: databaseEntryModal.submitLoadingFlag
                        }),
                        "view" === databaseStateModal && ({
                            label: databaseEntryModal.submitLabel,
                            type: "primary",
                            icon: databaseEntryModal.submitIcon,
                            onClick: () => entryDatabase(true),
                            loadingFlag: false
                        })
                    ].filter(Boolean) as ButtonArray}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {
                            "entry" === databaseStateModal
                            && <Fragment>
                                <InputText autoFocus={true} label={t("text.code")} name="code" value={databaseForm.code} onChange={onDatabaseFormChange} error={databaseFormError.code} />
                                <TextArea label={t("text.description")} name="description" rows={1} value={databaseForm.description} onChange={onDatabaseFormChange} error={databaseFormError.description} />
                                <Select label="SSH" name="externalServerId" map={masterExternalServerArray} value={databaseForm.externalServerId} onChange={onDatabaseFormChange} />
                                <Select label={t("text.type")} name="value" map={masterDatabaseTypeArray} value={databaseForm.databaseTypeId} onChange={onDatabaseFormChange} error={databaseFormError.databaseTypeId} />
                                <InputText label={t("text.username")} name="username" value={databaseForm.username} onChange={onDatabaseFormChange} error={databaseFormError.username} />
                                <InputPassword label={t("text.password")} name="password" value={databaseForm.password} onChange={onDatabaseFormChange} error={databaseFormError.password} />
                                <TextArea label={t("text.databaseConnection")} name="databaseConnection" rows={1} value={databaseForm.databaseConnection} onChange={onDatabaseFormChange} error={databaseFormError.databaseConnection} />
                                <Switch label={t("text.usePageFlag")} name="usePageFlag" value={databaseForm.usePageFlag} onChange={onDatabaseFormChange} />
                                <Switch label={t("text.lockFlag")} name="lockFlag" value={databaseForm.lockFlag} onChange={onDatabaseFormChange} />
                            </Fragment>
                        }
                        {
                            "view" === databaseStateModal
                            && <Fragment>
                                <Label text={t("text.code")} value={databaseForm.code} />
                                <Label text={t("text.description")} value={databaseForm.description} />
                                <Label text="SSH" value={masterExternalServerArray.getValueByKey?.(databaseForm.externalServerId)} />
                                <Label text={t("text.type")} value={masterDatabaseTypeArray.getValueByKey?.(databaseForm.databaseTypeId)} />
                                <Label text={t("text.username")} value={databaseForm.username} />
                                <Label text={t("text.password")} value={databaseForm.password} password={true} />
                                <Label text={t("text.databaseConnection")} value={databaseForm.databaseConnection} />
                                <Label text={t("text.usePageFlag")} value={yesNo(databaseForm.usePageFlag)} />
                                <Label text={t("text.lockFlag")} value={yesNo(databaseForm.lockFlag)} />
                            </Fragment>
                        }
                    </div>
                </Modal>
                <Modal
                    show={modalDatabaseConnect}
                    size="xl"
                    title={databaseConnectModalTitle}
                    onClose={() => setModalDatabaseConnect(false)}
                >
                    <Navtab
                        tabs={[
                            {
                                label: t("text.object"),
                                icon: "fa-solid fa-table",
                                content: function () {
                                    return (
                                        <Table
                                            searchFlag={false}
                                            dataArray={databaseQueryObjectArray}
                                            columns={[
                                                {
                                                    data: "object_id",
                                                    name: "id",
                                                    class: "text-nowrap",
                                                    orderable: true,
                                                    minDevice: 'mobile',
                                                },
                                                {
                                                    data: "object_name",
                                                    name: t("text.name"),
                                                    class: "text-nowrap",
                                                    copy: true,
                                                    minDevice: 'tablet',
                                                },
                                                {
                                                    data: "object_type",
                                                    name: t("text.type"),
                                                    class: "text-nowrap",
                                                    minDevice: 'tablet',
                                                },
                                                {
                                                    data: "object_name",
                                                    name: t("text.option"),
                                                    class: "text-nowrap",
                                                    render: function (data) {
                                                        return (
                                                            <div className="flex justify-center max-sm:flex-col gap-4">
                                                                <Button
                                                                    label={t("button.data")}
                                                                    className="max-sm:w-full"
                                                                    type='primary'
                                                                    icon="fa-solid fa-list"
                                                                    onClick={() => runDatabaseQueryExact(data)}
                                                                    loadingFlag={databaseQueryObjectOptionColumnTable[data]?.viewedButtonFlag}
                                                                />
                                                            </div>
                                                        )
                                                    }
                                                }
                                            ]}

                                            dataTotal={databaseQueryObjectDataTotalTable}
                                            onRender={(page, length) => {
                                                getDatabaseQueryObject({ page: page, length: length })
                                            }}
                                            loadingFlag={databaseQueryObjectTableLoadingFlag}
                                        />
                                    );
                                },
                            },
                            {
                                label: t("text.manual"),
                                icon: "fa-solid fa-wrench",
                                content: function () {
                                    return (
                                        <Fragment>
                                            <div className="flex flex-col gap-5">
                                                <Button
                                                    label={t("button.run")}
                                                    size="xs"
                                                    type="primary"
                                                    icon="fa-solid fa-play"
                                                    onClick={runDatabaseQueryManual}
                                                    loadingFlag={databaseQueryManualLoadingFlag}
                                                />
                                                <div className="font-semibold font-mono">
                                                    <TextArea
                                                        name="query"
                                                        rows={5}
                                                        value={databaseQueryManualForm.query}
                                                        onChange={onDatabaseQueryManualFormChange}
                                                        onKeyDown={onDatabaseQueryManualValueKeyDown}
                                                        placeholder={t("text.queryOnHere")}
                                                        error={databaseQueryManualFormError.query}
                                                    />
                                                </div>
                                                {
                                                    databaseQueryManualTableFlag &&
                                                    <div className="text-sm font-mono">
                                                        <Table
                                                            searchFlag={false}
                                                            dataArray={databaseQueryManualArray}
                                                            columns={databaseQueryManualColumn}

                                                            dataTotal={databaseQueryManualDataTotalTable}
                                                            onRender={(page, length) => {
                                                                if (databaseQueryManualId > 0) {
                                                                    getDatabaseQueryManual({ id: databaseQueryManualId, page: page, length: length })
                                                                }
                                                            }}
                                                            loadingFlag={databaseQueryManualTableLoadingFlag}
                                                        />
                                                    </div>
                                                }
                                            </div>
                                            {
                                                databaseQueryManualAdditionalButtonFlag &&
                                                <div className="flex flex-row gap-4">
                                                    <Button
                                                        label={t("button.export")}
                                                        size="xs"
                                                        type="primary"
                                                        icon="fa-solid fa-download"
                                                        onClick={() => setModalDatabaseExport(true)}
                                                    />
                                                    <Button
                                                        label={t("button.chart")}
                                                        size="xs"
                                                        type="primary"
                                                        icon="fa-solid fa-chart-line"
                                                        onClick={() => runDatabaseQueryChart("manual")}
                                                        loadingFlag={databaseQueryManualChartLoadingFlag}
                                                    />
                                                </div>

                                            }
                                        </Fragment>
                                    );
                                },
                            },
                            {
                                label: t("text.whitelist"),
                                icon: "fa-solid fa-file-circle-check",
                                content: function () {
                                    return (
                                        <Table
                                            searchFlag={true}
                                            dataArray={databaseQueryWhitelistArray}
                                            columns={[
                                                {
                                                    data: "description",
                                                    name: t("text.description"),
                                                    class: "text-nowrap",
                                                    minDevice: 'mobile',
                                                },
                                                {
                                                    data: "query",
                                                    name: t("text.query"),
                                                    class: "text-nowrap",
                                                    copy: true,
                                                    minDevice: 'tablet',
                                                },
                                                {
                                                    data: "id",
                                                    name: t("text.option"),
                                                    class: "text-nowrap",
                                                    render: function (data) {
                                                        return (
                                                            <div className="flex justify-center max-sm:flex-col gap-4">
                                                                <Button
                                                                    label={t("button.data")}
                                                                    className="max-sm:w-full"
                                                                    type='primary'
                                                                    icon="fa-solid fa-list"
                                                                    onClick={() => runDatabaseQueryExact(data)}
                                                                    loadingFlag={databaseQueryWhitelistOptionColumnTable[data]?.viewedButtonFlag}
                                                                />
                                                            </div>
                                                        )
                                                    }
                                                }
                                            ]}

                                            dataTotal={databaseQueryWhitelistDataTotalTable}
                                            onRender={(page, length, search) => {
                                                getDatabaseQueryWhitelist({ page: page, length: length, search: search })
                                            }}
                                            loadingFlag={databaseQueryWhitelistTableLoadingFlag}
                                        />
                                    );
                                },
                            }
                        ]}
                    />
                </Modal>
                <Modal
                    show={modalDatabaseExact}
                    size="xl"
                    title={databaseExactModalTitle}
                    onClose={() => setModalDatabaseExact(false)}
                >
                    <Table
                        searchFlag={false}
                        dataArray={databaseQueryExactArray}
                        columns={databaseQueryExactColumn}

                        dataTotal={databaseQueryExactDataTotalTable}
                        onRender={(page, length) => {
                            getDatabaseQueryExact({ identify: databaseQueryExactIdentify, page: page, length: length });
                        }}
                        loadingFlag={databaseQueryExactTableLoadingFlag}
                    />
                </Modal>
                <Modal
                    show={modalDatabaseExport}
                    size="sm"
                    type="dynamic"
                    title={t("text.export")}
                    onClose={() => setModalDatabaseExport(false)}
                    buttonArray={[
                        {
                            label: t("button.export"),
                            type: "primary",
                            icon: "fa-solid fa-download",
                            onClick: () => { onDatabaseExport() },
                            loadingFlag: databaseExportLoadingFlag
                        }
                    ]}
                >
                    <div className="grid md:grid-cols-1 gap-4">
                        <Radio<string>
                            label={t("text.format")}
                            size='sm'
                            name="format"
                            value={databaseExportForm.format}
                            map={[
                                { key: "sql", icon: "fa-solid fa-database", value: "SQL" },
                                { key: "xls", icon: "fa-solid fa-file-excel", value: "XLS" },
                                { key: "csv", icon: "fa-solid fa-file-csv", value: "CSV" },
                                { key: "json", icon: "fa-solid fa-code", value: "JSON" },
                                { key: "xml", icon: "fa-solid fa-code", value: "XML" },
                            ]}
                            onChange={onDatabaseExportFormChange}
                            error={databaseExportFormError.format}
                        />
                        {
                            checkDatabaseExportFrom.header() &&
                            <Switch label={t("text.header")} name="header" value={databaseExportForm.header} onChange={onDatabaseExportFormChange} />
                        }
                        {
                            checkDatabaseExportFrom.delimiter() &&
                            <InputText label={t("text.delimiter")} name="delimiter" value={databaseExportForm.delimiter} onChange={onDatabaseExportFormChange} error={databaseExportFormError.delimiter} />
                        }
                        {
                            checkDatabaseExportFrom.statement() &&
                            <Radio<number>
                                label={t("text.statement")}
                                size='sm'
                                name="insertFlag"
                                value={databaseExportForm.insertFlag}
                                map={[
                                    { key: 1, icon: "fa-solid fa-add", value: t("text.insert") },
                                    { key: 0, icon: "fa-solid fa-pen", value: t("text.update") },
                                ]}
                                onChange={onDatabaseExportFormChange}
                                error={databaseExportFormError.insertFlag}
                            />
                        }
                        {
                            checkDatabaseExportFrom.includeColumnName() &&
                            <Switch label={t("text.includeColumnName")} name="includeColumnNameFlag" value={databaseExportForm.includeColumnNameFlag} onChange={onDatabaseExportFormChange} />
                        }
                        {
                            checkDatabaseExportFrom.numberLinePerAction() &&
                            <InputDecimal label={t("text.numberLinePerAction")} name="numberLinePerAction" value={databaseExportForm.numberLinePerAction} onChange={onDatabaseExportFormChange} error={databaseExportFormError.numberLinePerAction} />
                        }
                        {
                            checkDatabaseExportFrom.multipleLine() &&
                            <Switch label={t("text.multipleLine")} name="multipleLineFlag" value={databaseExportForm.multipleLineFlag} onChange={onDatabaseExportFormChange} />
                        }
                        {
                            checkDatabaseExportFrom.firstAmountConditioned() &&
                            <InputDecimal label={t("text.firstAmountConditioned")} name="firstAmountConditioned" value={databaseExportForm.firstAmountConditioned} positionUnit="right" valueUnit={t("text.column")} onChange={onDatabaseExportFormChange} error={databaseExportFormError.firstAmountConditioned} />
                        }
                        {
                            checkDatabaseExportFrom.firstAmountCombined() &&
                            <InputDecimal label={t("text.firstAmountCombined")} name="firstAmountCombined" value={databaseExportForm.firstAmountCombined} positionUnit="right" valueUnit={t("text.column")} onChange={onDatabaseExportFormChange} error={databaseExportFormError.firstAmountCombined} />
                        }
                        {
                            checkDatabaseExportFrom.saveAs() &&
                            <Radio<string>
                                label={t("text.saveAs")}
                                size='sm'
                                name="saveAs"
                                value={databaseExportForm.saveAs}
                                map={[
                                    { key: "clipboard", icon: "fa-solid fa-clipboard", value: t("text.clipboard") },
                                    { key: "file", icon: "fa-solid fa-file", value: t("text.file") },
                                ]}
                                onChange={onDatabaseExportFormChange}
                                error={databaseExportFormError.saveAs}
                            />
                        }
                    </div>
                </Modal>
                <Modal
                    show={modalDatabaseChart}
                    size="lg"
                    title={t("text.chart")}
                    onClose={() => setModalDatabaseChart(false)}
                >
                    <div className="flex flex-col">
                        <Radio
                            label={t("text.format")}
                            name="chartTypeValue"
                            value={chartTypeValue}
                            map={chartTypeMap}
                            onChange={onChartTypeChange}
                            error={databaseExportFormError.format}
                        />
                        <div className="min-h-96 max-h-96">
                            <Chart
                                ref={chartRef}
                                type={chartTypeValue}
                                data={{
                                    labels: canvasLabelArray,
                                    datasets: "bubble" === chartTypeValue ? canvasDatasetBubbleArray : canvasDatasetCommonArray
                                }}
                                options={canvasOptionArray}
                            />
                        </div>
                    </div>
                </Modal>
            </ModalStackProvider>
            <Table
                labelNewButton={t("button.createNew")}
                onNewButtonClick={() => entryDatabase(false)}

                dataArray={databaseArray}
                columns={[
                    {
                        data: "code",
                        name: t("text.code"),
                        class: "text-nowrap",
                        orderable: true,
                        minDevice: 'mobile',
                    },
                    {
                        data: "description",
                        name: t("text.description"),
                        class: "wrap text-nowrap",
                        minDevice: 'none',
                    },
                    {
                        data: "username",
                        name: t("text.username"),
                        class: "text-nowrap",
                        width: 10,
                        minDevice: 'tablet',
                    },
                    {
                        data: "createdBy",
                        name: t("text.createdBy"),
                        class: "text-nowrap",
                        width: 10,
                        minDevice: "desktop"
                    },
                    {
                        data: "createdDate",
                        name: t("text.createdDate"),
                        class: "text-nowrap",
                        width: 15,
                        orderable: true,
                        minDevice: "desktop",
                        render: function (data) {
                            return formatDate(new Date(data), "dd MMM yyyy HH:mm:ss")
                        }
                    },
                    {
                        data: "id",
                        name: t("text.option"),
                        class: "text-nowrap",
                        render: function (data, row) {
                            return (
                                <div className="flex justify-center max-sm:flex-col gap-4">
                                    <Button
                                        label={t("button.view")}
                                        className="max-sm:w-full"
                                        type='primary'
                                        icon="fa-solid fa-list"
                                        onClick={() => viewDatabase(data)}
                                        loadingFlag={databaseOptionColumnTable[data]?.viewedButtonFlag}
                                    />
                                    <Button
                                        label={t("button.connect")}
                                        className="max-sm:w-full"
                                        type='primary'
                                        icon="fa-solid fa-plug"
                                        onClick={() => connectDatabase(data, row.code)}
                                        loadingFlag={databaseOptionColumnTable[data]?.connectedButtonFlag}
                                    />
                                    <Button
                                        label={t("button.delete")}
                                        className="max-sm:w-full"
                                        type='danger'
                                        icon="fa-solid fa-trash"
                                        onClick={() => confirmDeleteDatabase(data, row.code)}
                                        loadingFlag={databaseOptionColumnTable[data]?.deletedButtonFlag}
                                    />
                                </div>
                            )
                        }
                    }
                ]}
                order={["createdDate", "desc"]}

                dataTotal={databaseDataTotalTable}
                onRender={(page, length, search, order) => {
                    getDatabase({ page: page, length: length, search: search, order: order })
                }}
                loadingFlag={databaseTableLoadingFlag}
            />
        </div>
    )
}