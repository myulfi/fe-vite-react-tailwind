import { useTranslation } from "react-i18next";
import Button from "../../components/form/Button";
import { Fragment, useState } from "react";
import { HTTP_CODE, type ButtonArray, type ModalCategory, type ModalType, type OptionColumn, type TableOptions } from "../../constants/common-constants";
import { apiRequest } from "../../api";
import { formatDate } from "../../function/dateHelper";
import { Modal, ModalStackProvider } from "../../ModalContext";
import Label from "../../components/form/Label";
import { toast } from "../../ToastContext";
import InputText from "../../components/form/InputText";
import TextArea from "../../components/form/TextArea";
import InputDecimal from "../../components/form/InputDecimal";
import InputDate from "../../components/form/InputDate";
import Switch from "../../components/form/Switch";
import Select from "../../components/form/Select";
import Table from "../../components/Table";
import { HttpStatusCode } from "axios";
import { formatMoney, yesNo } from "../../function/commonHelper";
import { dialog } from "../../DialogContext";

export default function ExampleTemplate() {
    const { t } = useTranslation();

    type ExampleTemplateData = {
        name: string;
        description?: string;
        value: number;
        // valueMultiple: [];
        amount: string,
        date?: Date,
        activeFlag: number,
        version: number,
    }

    type ExampleTemplateFormError = Partial<Record<keyof ExampleTemplateData, string>>;

    const exampleTemplateInitial: ExampleTemplateData = {
        name: "",
        description: undefined,
        value: 0,
        // valueMultiple: [],
        amount: '',
        date: undefined,
        activeFlag: 0,
        version: 0,
    }

    const [exampleTemplateStateModal, setExampleTemplateStateModal] = useState<ModalCategory>("entry");

    const exampleTemplateFilterTableInitial = {
        value: 0,
        date: "",
        range: 0,
    };

    const [exampleTemplateFilterTable, setExampleTemplateFilterTable] = useState(exampleTemplateFilterTableInitial);

    const onExampleTemplateFilterTableChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setExampleTemplateFilterTable(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const [exampleTemplateBulkOptionLoadingFlag, setExampleTemplateBulkOptionLoadingFlag] = useState(false);
    const [exampleTemplateCheckBoxTableArray, setExampleTemplateCheckBoxTableArray] = useState<(string | number)[]>([]);
    const [exampleTemplateOptionColumnTable, setExampleTemplateOptionColumnTable] = useState<{ [id: number]: OptionColumn; }>({});
    const [exampleTemplateAttributeTable, setExampleTemplateAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [exampleTemplateDataTotalTable, setExampleTemplateDataTotalTable] = useState(0);
    const [exampleTemplateTableLoadingFlag, setExampleTemplateTableLoadingFlag] = useState(false);

    const [exampleTemplateArray, setExampleTemplateArray] = useState([]);

    const [exampleTemplateEntryModal, setExampleTemplateEntryModal] = useState<ModalType>({
        title: "",
        submitLabel: "",
        submitClass: "",
        submitIcon: "",
        submitLoadingFlag: false,
    });

    const [exampleTemplateId, setExampleTemplateId] = useState(0);
    const [exampleTemplateForm, setExampleTemplateForm] = useState<ExampleTemplateData>(exampleTemplateInitial);
    const [exampleTemplateFormError, setExampleTemplateFormError] = useState<ExampleTemplateFormError>({});

    const onExampleTemplateFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setExampleTemplateForm({ ...exampleTemplateForm, [name]: value });
        setExampleTemplateFormError({ ...exampleTemplateFormError, [name]: undefined });
    };

    const selectValueMap = [
        { "key": 1, "value": "Satu" },
        { "key": 2, "value": "Dua" },
        { "key": 3, "value": "Tiga" },
        { "key": 4, "value": "Empat" },
        { "key": 5, "value": "Lima" },
        { "key": 6, "value": "Enam" },
        { "key": 7, "value": "Tujuh" },
        { "key": 8, "value": "Delapan" },
        { "key": 9, "value": "Sembilan" },
        { "key": 10, "value": "Sepuluh" },
    ];

    const exampleTemplateValidate = (data: ExampleTemplateData) => {
        const error: ExampleTemplateFormError = {};
        if (!data.name?.trim()) error.name = t("validate.required", { name: t("text.name") });
        if (!data.description?.trim()) error.description = t("validate.required", { name: t("text.description") });
        if (data.value <= 0) error.value = t("validate.required", { name: t("text.value") });

        // if (!data.email.trim()) error.email = t("validate.required", { name: t("text.email") })
        // else if (!/\S+@\S+\.\S+/.test(data.email)) error.email = t("validate.invalid", { name: t("text.email") })
        setExampleTemplateFormError(error);
        return Object.keys(error).length === 0;
    };

    // useEffect(() => { getExampleTemplate({ page: 1, length: 10, search: '' }) }, []);

    const getExampleTemplate = async (options: TableOptions) => {
        setExampleTemplateTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,

            // "value": exampleTemplateFilterTable.value,
            // "date": exampleTemplateFilterTable.date,
            // "range": exampleTemplateFilterTable.range,
        };
        setExampleTemplateAttributeTable(options);

        const response = await apiRequest('get', "/test/example-template.json", params);
        if (HTTP_CODE.OK === response.status) {
            setExampleTemplateArray(response.data);
            setExampleTemplateDataTotalTable(response.total);
            setExampleTemplateOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    //map[obj.id] = obj.name
                    map[obj.id] = { "viewedButtonFlag": false, "deletedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setExampleTemplateTableLoadingFlag(false);
    };

    const viewExampleTemplate = async (id: number) => {
        setExampleTemplateId(id);
        setExampleTemplateForm(exampleTemplateInitial);
        setExampleTemplateStateModal("view");
        setExampleTemplateOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/test/${id}/example-template.json`);
        if (HTTP_CODE.OK === response.status) {
            const exampleTemplate = response.data;

            setExampleTemplateId(exampleTemplate.id);
            setExampleTemplateForm({
                name: exampleTemplate.name,
                description: exampleTemplate.description,
                value: exampleTemplate.value,
                amount: exampleTemplate.amount,
                date: exampleTemplate.date,
                activeFlag: exampleTemplate.activeFlag,
                version: exampleTemplate.version,
            });

            setExampleTemplateEntryModal({
                ...exampleTemplateEntryModal,
                title: exampleTemplate.name,
                submitLabel: t("text.edit"),
                submitIcon: "fa-solid fa-pen",
                submitLoadingFlag: false,
            });

            setModalExampleTemplate(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setExampleTemplateOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: false,
            },
        }));
    };

    const entryExampleTemplate = (haveContentFlag: boolean) => {
        setExampleTemplateStateModal("entry");
        setExampleTemplateFormError({});
        if (haveContentFlag) {
            setExampleTemplateEntryModal({
                ...exampleTemplateEntryModal,
                title: exampleTemplateForm.name,
                submitLabel: t("text.update"),
                submitIcon: "fa-solid fa-repeat",
                submitLoadingFlag: false,
            });
        } else {
            setExampleTemplateId(0);
            setExampleTemplateForm(exampleTemplateInitial);
            setExampleTemplateEntryModal({
                ...exampleTemplateEntryModal,
                title: t("text.createNew"),
                submitLabel: t("text.save"),
                submitIcon: "fa-solid fa-bookmark",
                submitLoadingFlag: false,
            });

            setModalExampleTemplate(true);
        }
    };

    const confirmStoreExampleTemplate = async () => {
        if (exampleTemplateValidate(exampleTemplateForm)) {
            dialog.show({
                type: 'confirmation',
                message: t(exampleTemplateId === 0 ? "confirmation.create" : "confirmation.update", { name: exampleTemplateForm.name }),
                onConfirm: () => storeExampleTemplate(),
            });
        }
    };

    const storeExampleTemplate = async () => {
        if (exampleTemplateValidate(exampleTemplateForm)) {
            setExampleTemplateEntryModal({ ...exampleTemplateEntryModal, submitLoadingFlag: true });

            const response = await apiRequest(
                exampleTemplateId === 0 ? 'post' : 'patch',
                exampleTemplateId === 0 ? '/test/example-template.json' : `/test/${exampleTemplateId}/example-template.json`,
                exampleTemplateForm,
            );

            if (HttpStatusCode.Ok === response.status || HttpStatusCode.Created === response.status) {
                getExampleTemplate(exampleTemplateAttributeTable);
                toast.show({ type: "done", message: HttpStatusCode.Created === response.status ? "information.created" : "information.updated" });
                setModalExampleTemplate(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setExampleTemplateEntryModal({ ...exampleTemplateEntryModal, submitLoadingFlag: false });
        }
    }

    const confirmDeleteExampleTemplate = (id?: number, name?: string) => {
        if (id !== undefined) {
            dialog.show({
                type: 'warning',
                message: t("confirmation.delete", { name: name }),
                onConfirm: () => deleteExampleTemplate(id),
            });
        } else {
            if (exampleTemplateCheckBoxTableArray.length > 0) {
                dialog.show({
                    type: 'warning',
                    message: t("confirmation.delete", { name: t("text.amountItem", { amount: exampleTemplateCheckBoxTableArray.length }) }),
                    onConfirm: () => deleteExampleTemplate(),
                });
            } else {
                dialog.show({
                    type: 'alert',
                    message: t("validate.pleaseTickAtLeastAnItem")
                });
            }
        }
    };

    const deleteExampleTemplate = async (id?: number) => {
        setModalExampleTemplate(false);
        if (id !== undefined) {
            setExampleTemplateOptionColumnTable(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    deletedButtonFlag: true,
                },
            }));
        } else {
            setExampleTemplateBulkOptionLoadingFlag(true);
        }

        const response = await apiRequest('delete', `/test/${id !== undefined ? id : exampleTemplateCheckBoxTableArray.join("")}/example-template.json`)
        if (HttpStatusCode.NoContent === response.status) {
            getExampleTemplate(exampleTemplateAttributeTable);
            if (id === undefined) {
                setExampleTemplateCheckBoxTableArray([]);
            }
            toast.show({ type: "done", message: "information.deleted" });
        } else {
            toast.show({ type: "error", message: response.message });
        }

        if (id !== undefined) {
            setExampleTemplateOptionColumnTable(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    deletedButtonFlag: false,
                },
            }));
        } else {
            setExampleTemplateBulkOptionLoadingFlag(false);
        }
    };

    const [modalExampleTemplate, setModalExampleTemplate] = useState(false);

    return (
        <div className='container-cols'>
            {/* <div className="color-container p-cnt rounded-lg shadow-lg"> */}
            <ModalStackProvider>
                <Modal
                    show={modalExampleTemplate}
                    size="md"
                    title={exampleTemplateEntryModal.title}
                    onClose={() => setModalExampleTemplate(false)}
                    buttonArray={[
                        "entry" === exampleTemplateStateModal && ({
                            label: exampleTemplateEntryModal.submitLabel,
                            type: "primary",
                            icon: exampleTemplateEntryModal.submitIcon,
                            onClick: () => confirmStoreExampleTemplate(),
                            loadingFlag: exampleTemplateEntryModal.submitLoadingFlag
                        }),
                        "view" === exampleTemplateStateModal && ({
                            label: exampleTemplateEntryModal.submitLabel,
                            type: "primary",
                            icon: exampleTemplateEntryModal.submitIcon,
                            onClick: () => entryExampleTemplate(true),
                            loadingFlag: false
                        })
                    ].filter(Boolean) as ButtonArray}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {
                            "entry" === exampleTemplateStateModal
                            && <Fragment>
                                <InputText autoFocus={true} label={t("text.name")} name="name" value={exampleTemplateForm.name} onChange={onExampleTemplateFormChange} error={exampleTemplateFormError.name} />
                                <TextArea label={t("text.description")} name="description" rows={1} value={exampleTemplateForm.description} onChange={onExampleTemplateFormChange} error={exampleTemplateFormError.description} />
                                <Select label={t("text.value")} name="value" map={selectValueMap} value={exampleTemplateForm.value} onChange={onExampleTemplateFormChange} error={exampleTemplateFormError.value} />
                                {/* <Select label={t("common.text.value")} name="valueMultiple" map={selectValueMap} value={exampleTemplateForm.valueMultiple} multiple={true}
                                    dataSize={5}
                                    onChange={onExampleTemplateFormChange}
                                    error={exampleTemplateFormError.value} /> */}
                                <InputDecimal label={t("text.amount")} name="amount" value={exampleTemplateForm.amount} decimal={2} onChange={onExampleTemplateFormChange} error={exampleTemplateFormError.amount} />
                                <InputDate label={t("text.date")} name="date" value={formatDate(new Date(exampleTemplateForm.date ?? ""), "yyyy-MM-dd")} onChange={onExampleTemplateFormChange} error={exampleTemplateFormError.date} />
                                <Switch label={t("text.activeFlag")} name="activeFlag" value={exampleTemplateForm.activeFlag} onChange={onExampleTemplateFormChange} />
                            </Fragment>
                        }
                        {
                            "view" === exampleTemplateStateModal
                            && <Fragment>
                                <Label text={t("text.name")} value={exampleTemplateForm.name} />
                                <Label text={t("text.description")} value={exampleTemplateForm.description} />
                                <Label text={t("text.value")} value={exampleTemplateForm.value} />
                                <Label text={t("text.amount")} value={formatMoney(exampleTemplateForm.amount)} />
                                <Label text={t("text.date")} value={formatDate(new Date(exampleTemplateForm.date!), "dd MMM yyyy")} />
                                <Label text={t("text.activeFlag")} value={yesNo(exampleTemplateForm.activeFlag)} />
                            </Fragment>
                        }
                    </div>
                </Modal>
            </ModalStackProvider>
            <Table
                labelNewButton={t("text.createNew")}
                onNewButtonClick={() => entryExampleTemplate(false)}

                bulkOptionLoadingFlag={exampleTemplateBulkOptionLoadingFlag}
                bulkOptionArray={[
                    {
                        label: t("text.delete"),
                        icon: "fa-solid fa-trash",
                        onClick: () => confirmDeleteExampleTemplate(),
                    },
                    {
                        label: t("text.delete"),
                        icon: "fa-solid fa-trash",
                        onClick: () => confirmDeleteExampleTemplate(),
                    }
                ]}

                additionalButtonArray={[
                    {
                        label: "success",
                        type: 'success',
                        icon: "fa-solid fa-list",
                        onClick: () => toast.show({ type: "done", message: "hahah" })
                    },
                    {
                        label: "warning",
                        type: 'warning',
                        icon: "fa-solid fa-list",
                        onClick: () => toast.show({ type: "done", message: "hahah" })
                    },
                    {
                        label: "danger",
                        type: 'danger',
                        icon: "fa-solid fa-list",
                        onClick: () => toast.show({ type: "done", message: "hahah" })
                    }
                ]}

                dataArray={exampleTemplateArray}
                columns={[
                    {
                        data: "name",
                        name: t("text.name"),
                        class: "text-nowrap",
                        orderable: true,
                        minDevice: 'mobile',
                    },
                    {
                        data: "description",
                        name: t("text.description"),
                        class: "wrap text-nowrap",
                        minDevice: 'tablet',
                    },
                    {
                        data: "value",
                        name: t("text.value"),
                        class: "text-nowrap",
                        width: 10,
                        minDevice: 'tablet',
                    },
                    // {
                    //     data: "date",
                    //     name: t("text.date"),
                    //     class: "text-nowrap",
                    //     width: 10,
                    //     minDevice: 'desktop'
                    // },
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
                                        label={t("text.view")}
                                        className="max-sm:w-full"
                                        type='primary'
                                        icon="fa-solid fa-list"
                                        onClick={() => viewExampleTemplate(data)}
                                        loadingFlag={exampleTemplateOptionColumnTable[data]?.viewedButtonFlag}
                                    />
                                    <Button
                                        label={t("text.delete")}
                                        className="max-sm:w-full"
                                        type='danger'
                                        icon="fa-solid fa-trash"
                                        onClick={() => confirmDeleteExampleTemplate(data, row.name)}
                                        loadingFlag={exampleTemplateOptionColumnTable[data]?.deletedButtonFlag}
                                    />
                                </div>
                            )
                        }
                    }
                ]}
                order={["createdDate", "desc"]}

                checkBoxArray={exampleTemplateCheckBoxTableArray}
                onCheckBox={exampleTemplateCheckBoxTableArray => { setExampleTemplateCheckBoxTableArray([...exampleTemplateCheckBoxTableArray]) }}
                dataTotal={exampleTemplateDataTotalTable}
                filter={exampleTemplateFilterTable}
                onRender={(page, length, search, order) => {
                    getExampleTemplate({ page: page, length: length, search: search, order: order })
                }}
                loadingFlag={exampleTemplateTableLoadingFlag}
            />
        </div>
    )
}