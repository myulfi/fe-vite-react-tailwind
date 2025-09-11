import { useTranslation } from "react-i18next";
import Button from "../../components/form/Button";
import { Fragment, useEffect, useState } from "react";
import { HTTP_CODE, type ButtonArray, type ModalCategory, type ModalType, type OptionColumn, type TableOptions } from "../../constants/common-constants";
import { apiRequest } from "../../api";
import { Modal, ModalStackProvider } from "../../ModalContext";
import Label from "../../components/form/Label";
import { toast } from "../../ToastContext";
import InputText from "../../components/form/InputText";
import Table from "../../components/Table";
import { HttpStatusCode } from "axios";
import { dialog } from "../../DialogContext";

export default function Language() {
    const { t } = useTranslation();

    type LanguageData = {
        labelType: string;
        keyCode: string;
        version: number;
        value: Record<string, string>;
    }

    type LanguageFormError = {
        labelType?: string;
        keyCode?: string;
        version?: string;
        value?: Record<string, string>;
    };

    const languageInitial: LanguageData = {
        labelType: "text",
        keyCode: "",
        version: 0,
        value: {}
    }

    const [languageStateModal, setLanguageStateModal] = useState<ModalCategory>("entry");

    const languageFilterTableInitial = {
        value: 0,
        date: "",
        range: 0,
    };

    const [languageFilterTable, setLanguageFilterTable] = useState(languageFilterTableInitial);

    const onLanguageFilterTableChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLanguageFilterTable(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const [languageBulkOptionLoadingFlag, setLanguageBulkOptionLoadingFlag] = useState(false);
    const [languageCheckBoxTableArray, setLanguageCheckBoxTableArray] = useState<(string | number)[]>([]);
    const [languageOptionColumnTable, setLanguageOptionColumnTable] = useState<{ [id: number]: OptionColumn; }>({});
    const [languageAttributeTable, setLanguageAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [languageDataTotalTable, setLanguageDataTotalTable] = useState(0);
    const [languageTableLoadingFlag, setLanguageTableLoadingFlag] = useState(false);

    const [languageArray, setLanguageArray] = useState([]);

    const [languageEntryModal, setLanguageEntryModal] = useState<ModalType>({
        title: "",
        submitLabel: "",
        submitClass: "",
        submitIcon: "",
        submitLoadingFlag: false,
    });

    const [languageId, setLanguageId] = useState(0);
    const [languageForm, setLanguageForm] = useState<LanguageData>(languageInitial);
    const [languageFormError, setLanguageFormError] = useState<LanguageFormError>({});

    const onLanguageFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [name_parameter, name_index] = name.split(".", 2);
            setLanguageForm(prev => ({
                ...prev,
                [name_parameter]: {
                    ...(prev as any)[name_parameter],
                    [name_index]: value,
                },
            }));

            setLanguageFormError(prev => ({
                ...prev,
                [name_parameter]: {
                    ...(prev as any)[name_parameter],
                    [name_index]: undefined,
                },
            }));
        } else {
            setLanguageForm({ ...languageForm, [name]: value });
            setLanguageFormError({ ...languageFormError, [name]: undefined });
        }
    };

    const labelTypeMap = [
        { "key": "text", "value": "text" },
        { "key": "datatable", "value": "datatable" },
        { "key": "information", "value": "information" },
        { "key": "confirmation", "value": "confirmation" },
    ];

    const languageValidate = (data: LanguageData) => {
        const error: LanguageFormError = {};

        if (!data.keyCode?.trim()) error.keyCode = t("validate.required", { name: t("text.keyCode") });
        masterLanguageArray.forEach((masterLanguage) => {
            const fieldName = `lang${masterLanguage.key}`;
            if (!data.value[fieldName]?.trim()) {
                if (!error.value) error.value = {};
                error.value[fieldName] = t("validate.required", { name: masterLanguage.value });
            }
        });
        setLanguageFormError(error);
        return Object.keys(error).length === 0;
    };

    useEffect(() => {
        getMasterLanguage();
    }, []);

    const [masterLanguageArray, setMasterLanguageArray] = useState<Array<{ key: number; value: string }>>([]);
    const getMasterLanguage = async () => {
        const response = await apiRequest('get', '/master/language.json')
        if (HTTP_CODE.OK === response.status) {
            setMasterLanguageArray(response.data)
        }
    }

    const getLanguage = async (options: TableOptions) => {
        setLanguageTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,

            // "value": languageFilterTable.value,
            // "date": languageFilterTable.date,
            // "range": languageFilterTable.range,
        };
        setLanguageAttributeTable(options);

        const response = await apiRequest('get', "/command/language.json", params);
        if (HTTP_CODE.OK === response.status) {
            setLanguageArray(response.data);
            setLanguageDataTotalTable(response.total);
            setLanguageOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    //map[obj.id] = obj.name
                    map[obj.id] = { "viewedButtonFlag": false, "deletedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setLanguageTableLoadingFlag(false);
    };

    const viewLanguage = async (id: number) => {
        setLanguageId(id);
        setLanguageForm(languageInitial);
        setLanguageStateModal("view");
        setLanguageOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/command/${id}/language.json`);
        if (HTTP_CODE.OK === response.status) {
            const language = response.data;

            setLanguageId(language.id);
            setLanguageForm({
                labelType: language.labelType,
                keyCode: language.keyCode,
                version: language.version,
                value: language.value,
            });

            setLanguageEntryModal({
                ...languageEntryModal,
                title: language.name,
                submitLabel: t("button.edit"),
                submitIcon: "fa-solid fa-pen",
                submitLoadingFlag: false,
            });

            setModalLanguage(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setLanguageOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: false,
            },
        }));
    };

    const entryLanguage = (haveContentFlag: boolean) => {
        setLanguageStateModal("entry");
        setLanguageFormError({});
        if (haveContentFlag) {
            setLanguageEntryModal({
                ...languageEntryModal,
                title: languageForm.keyCode,
                submitLabel: t("button.update"),
                submitIcon: "fa-solid fa-repeat",
                submitLoadingFlag: false,
            });
        } else {
            setLanguageId(0);
            setLanguageForm(languageInitial);
            setLanguageEntryModal({
                ...languageEntryModal,
                title: t("button.createNew"),
                submitLabel: t("button.save"),
                submitIcon: "fa-solid fa-bookmark",
                submitLoadingFlag: false,
            });

            setModalLanguage(true);
        }
    };

    const confirmStoreLanguage = async () => {
        if (languageValidate(languageForm)) {
            dialog.show({
                type: 'confirmation',
                message: t(languageId === 0 ? "confirmation.create" : "confirmation.update", { name: languageForm.keyCode }),
                onConfirm: () => storeLanguage(),
            });
        }
    };

    const storeLanguage = async () => {
        if (languageValidate(languageForm)) {
            setLanguageEntryModal({ ...languageEntryModal, submitLoadingFlag: true });

            const response = await apiRequest(
                languageId === 0 ? 'post' : 'patch',
                languageId === 0 ? '/command/language.json' : `/command/${languageId}/language.json`,
                {
                    ...languageForm,
                    value: Object.entries(languageForm.value).map(([key, val]) => {
                        const mt_lang_id = Number(key.replace("lang", ""));
                        return { mt_lang_id, value: val };
                    }),
                },
            );

            if (HttpStatusCode.Ok === response.status || HttpStatusCode.Created === response.status) {
                getLanguage(languageAttributeTable);
                toast.show({ type: "done", message: HttpStatusCode.Created === response.status ? "information.created" : "information.updated" });
                setModalLanguage(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setLanguageEntryModal({ ...languageEntryModal, submitLoadingFlag: false });
        }
    }

    const confirmDeleteLanguage = (id?: number, name?: string) => {
        if (id !== undefined) {
            dialog.show({
                type: 'warning',
                message: t("confirmation.delete", { name: name }),
                onConfirm: () => deleteLanguage(id),
            });
        } else {
            if (languageCheckBoxTableArray.length > 0) {
                dialog.show({
                    type: 'warning',
                    message: t("confirmation.delete", { name: t("text.amountItem", { amount: languageCheckBoxTableArray.length }) }),
                    onConfirm: () => deleteLanguage(),
                });
            } else {
                dialog.show({
                    type: 'alert',
                    message: t("validate.pleaseTickAtLeastAnItem")
                });
            }
        }
    };

    const deleteLanguage = async (id?: number) => {
        setModalLanguage(false);
        if (id !== undefined) {
            setLanguageOptionColumnTable(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    deletedButtonFlag: true,
                },
            }));
        } else {
            setLanguageBulkOptionLoadingFlag(true);
        }

        const response = await apiRequest('delete', `/command/${id !== undefined ? id : languageCheckBoxTableArray.join("")}/language.json`)
        if (HttpStatusCode.NoContent === response.status) {
            getLanguage(languageAttributeTable);
            if (id === undefined) {
                setLanguageCheckBoxTableArray([]);
            }
            toast.show({ type: "done", message: "information.deleted" });
        } else {
            toast.show({ type: "error", message: response.message });
        }

        if (id !== undefined) {
            setLanguageOptionColumnTable(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    deletedButtonFlag: false,
                },
            }));
        } else {
            setLanguageBulkOptionLoadingFlag(false);
        }
    };

    const [modalLanguage, setModalLanguage] = useState(false);

    return (
        <div className="bg-light-clear dark:bg-dark-clear m-5 p-5 pb-0 rounded-lg shadow-lg">
            <ModalStackProvider>
                <Modal
                    show={modalLanguage}
                    size="sm"
                    title={languageEntryModal.title}
                    onClose={() => setModalLanguage(false)}
                    buttonArray={[
                        "entry" === languageStateModal && ({
                            label: languageEntryModal.submitLabel,
                            type: "primary",
                            icon: languageEntryModal.submitIcon,
                            onClick: () => confirmStoreLanguage(),
                            loadingFlag: languageEntryModal.submitLoadingFlag
                        }),
                        "view" === languageStateModal && ({
                            label: languageEntryModal.submitLabel,
                            type: "primary",
                            icon: languageEntryModal.submitIcon,
                            onClick: () => entryLanguage(true),
                            loadingFlag: false
                        })
                    ].filter(Boolean) as ButtonArray}
                >
                    <div className="grid grid-cols-1 gap-4">
                        {
                            "entry" === languageStateModal
                            && <Fragment>
                                <InputText
                                    autoFocus={true}
                                    label={t("text.keyCode")}
                                    name="keyCode"
                                    value={languageForm.keyCode}
                                    onChange={onLanguageFormChange}
                                    positionUnit='left'
                                    nameUnit='labelType'
                                    valueUnitList={labelTypeMap}
                                    onChangeUnit={onLanguageFormChange}
                                    error={languageFormError.keyCode} />
                                {
                                    masterLanguageArray.map((masterLanguage) => {
                                        const fieldName = `lang${masterLanguage.key}`;
                                        return (
                                            <InputText
                                                key={fieldName}
                                                label={masterLanguage.value}
                                                name={`value.${fieldName}`}
                                                value={languageForm.value[fieldName] || ''}
                                                onChange={onLanguageFormChange}
                                                error={languageFormError.value?.[fieldName]}
                                            />
                                        );
                                    })
                                }
                            </Fragment>
                        }
                        {
                            "view" === languageStateModal
                            && <Fragment>
                                <Label text={t("text.keyCode")} value={languageForm.keyCode} />
                            </Fragment>
                        }
                    </div>
                </Modal>
            </ModalStackProvider>
            <Table
                labelNewButton={t("button.createNew")}
                onNewButtonClick={() => entryLanguage(false)}

                bulkOptionLoadingFlag={languageBulkOptionLoadingFlag}
                bulkOptionArray={[
                    {
                        label: t("button.delete"),
                        icon: "fa-solid fa-trash",
                        onClick: () => confirmDeleteLanguage(),
                    },
                    {
                        label: t("button.delete"),
                        icon: "fa-solid fa-trash",
                        onClick: () => confirmDeleteLanguage(),
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

                dataArray={languageArray}
                columns={[
                    {
                        data: "label_typ",
                        name: t("text.type"),
                        class: "text-nowrap",
                        orderable: true,
                        minDevice: 'mobile',
                    },
                    {
                        data: "key_cd",
                        name: t("text.code"),
                        class: "wrap text-nowrap",
                        minDevice: 'tablet',
                    },
                    {
                        data: "value",
                        name: t("text.english"),
                        class: "text-nowrap",
                        width: 10,
                        minDevice: 'tablet',
                        render: function (data) {
                            return data.getValueByParameter?.("mt_lang_id", 1, "value");
                        }
                    },
                    {
                        data: "value",
                        name: t("text.bahasa"),
                        class: "text-nowrap",
                        width: 10,
                        minDevice: 'tablet',
                        render: function (data) {
                            return data.getValueByParameter?.("mt_lang_id", 2, "value");
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
                                        onClick={() => viewLanguage(data)}
                                        loadingFlag={languageOptionColumnTable[data]?.viewedButtonFlag}
                                    />
                                    <Button
                                        label={t("button.delete")}
                                        className="max-sm:w-full"
                                        type='danger'
                                        icon="fa-solid fa-trash"
                                        onClick={() => confirmDeleteLanguage(data, row.name)}
                                        loadingFlag={languageOptionColumnTable[data]?.deletedButtonFlag}
                                    />
                                </div>
                            )
                        }
                    }
                ]}
                order={["createdDate", "desc"]}

                checkBoxArray={languageCheckBoxTableArray}
                onCheckBox={languageCheckBoxTableArray => { setLanguageCheckBoxTableArray([...languageCheckBoxTableArray]) }}
                dataTotal={languageDataTotalTable}
                filter={languageFilterTable}
                onRender={(page, length, search, order) => {
                    getLanguage({ page: page, length: length, search: search, order: order })
                }}
                loadingFlag={languageTableLoadingFlag}
            />
        </div>
    )
}