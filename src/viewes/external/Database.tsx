import { useTranslation } from "react-i18next";
import Button from "../../components/form/Button";
import { Fragment, useState } from "react";
import { HTTP_CODE, type ButtonArray, type ModalCategory, type ModalType, type OptionColumn, type TableOptions } from "../../constants/common-constants";
import { apiRequest } from "../../api";
import { formatDate } from "../../function/dateHelper";
import { confirmDialog, Modal, ModalStackProvider } from "../../ModalContext";
import Label from "../../components/form/Label";
import { toast } from "../../ToastContext";
import InputText from "../../components/form/InputText";
import TextArea from "../../components/form/TextArea";
import Radio from "../../components/form/Radio";
import Select from "../../components/form/Select";
import Table from "../../components/Table";
import { HttpStatusCode } from "axios";
import { yesNo } from "../../function/commonHelper";
import InputPassword from "../../components/form/InputPassword";

export default function Database() {
    const { t } = useTranslation();

    type DatabaseData = {
        code: string;
        description?: string;
        databaseTypeId: number;
        // valueMultiple: [];
        username: string,
        password: string,
        databaseConnection: string,
        lockFlag: number,
        version: number,
    }

    type DatabaseFormError = Partial<Record<keyof DatabaseData, string>>;

    const databaseInitial: DatabaseData = {
        code: '',
        description: undefined,
        databaseTypeId: 1,
        username: '',
        password: '',
        databaseConnection: '',
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

    const [databaseEntryModal, setDatabaseEntryModal] = useState<ModalType>({
        title: "",
        submitLabel: "",
        submitClass: "",
        submitIcon: "",
        submitLoadingFlag: false,
    });

    const [databaseId, setDatabaseId] = useState(0);
    const [databaseForm, setDatabaseForm] = useState<DatabaseData>(databaseInitial);
    const [databaseFormError, setDatabaseFormError] = useState<DatabaseFormError>({});

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

    const getDatabase = async (options: TableOptions) => {
        setDatabaseTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search),
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
                    map[obj.id] = { "viewedButtonFlag": false, "deletedButtonFlag": false }
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
                    databaseTypeId: database.databaseTypeId,
                    username: database.username,
                    password: database.password,
                    databaseConnection: database.databaseConnection,
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

    const [modalDatabase, setModalDatabase] = useState(false);

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
                                {/* <Select label={t("text.value")} name="value" map={selectValueMap} value={databaseForm.value} onChange={onDatabaseFormChange} error={databaseFormError.value} /> */}
                                <Select label={t("text.type")} name="value" map={[]} value={databaseForm.databaseTypeId} onChange={onDatabaseFormChange} error={databaseFormError.databaseTypeId} />
                                <InputText label={t("text.username")} name="username" value={databaseForm.username} onChange={onDatabaseFormChange} error={databaseFormError.username} />
                                <InputPassword label={t("text.password")} name="password" value={databaseForm.password} onChange={onDatabaseFormChange} error={databaseFormError.password} />
                                <TextArea label={t("text.databaseConnection")} name="databaseConnection" rows={1} value={databaseForm.databaseConnection} onChange={onDatabaseFormChange} error={databaseFormError.databaseConnection} />
                                <Radio label={t("text.lockFlag")} name="lockFlag" value={databaseForm.lockFlag} onChange={onDatabaseFormChange} />
                            </Fragment>
                        }
                        {
                            "view" === databaseStateModal
                            && <Fragment>
                                <Label text={t("text.code")} value={databaseForm.code} />
                                <Label text={t("text.description")} value={databaseForm.description} />
                                <Label text={t("text.type")} value={databaseForm.databaseTypeId} />
                                <Label text={t("text.username")} value={databaseForm.username} />
                                <Label text={t("text.password")} value={databaseForm.password} />
                                <Label text={t("text.databaseConnection")} value={databaseForm.databaseConnection} />
                                <Label text={t("text.lockFlag")} value={yesNo(databaseForm.lockFlag)} />
                            </Fragment>
                        }
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