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
import InputDecimal from "../../components/form/InputDecimal";
import InputDate from "../../components/form/InputDate";
import Switch from "../../components/form/Switch";
import Select from "../../components/form/Select";
import Table from "../../components/Table";
import { HttpStatusCode } from "axios";
import { formatMoney, yesNo } from "../../function/commonHelper";
import InputPassword from "../../components/form/InputPassword";

export default function Server() {
    const { t } = useTranslation();

    type ServerData = {
        code: string;
        description?: string;
        ip: string;
        port: number;
        username: string,
        password: string,
        privateKey: string,
        version: number,
    }

    type ServerFormError = Partial<Record<keyof ServerData, string>>;

    const serverInitial: ServerData = {
        code: '',
        description: undefined,
        ip: '',
        port: 22,
        username: '',
        password: '',
        privateKey: '',
        version: 0,
    }

    const [serverStateModal, setServerStateModal] = useState<ModalCategory>("entry");

    const [serverOptionColumnTable, setServerOptionColumnTable] = useState<{ [id: number]: OptionColumn; }>({});
    const [serverAttributeTable, setServerAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [serverDataTotalTable, setServerDataTotalTable] = useState(0);
    const [serverTableLoadingFlag, setServerTableLoadingFlag] = useState(false);

    const [serverArray, setServerArray] = useState([]);

    const [serverEntryModal, setServerEntryModal] = useState<ModalType>({
        title: "",
        submitLabel: "",
        submitClass: "",
        submitIcon: "",
        submitLoadingFlag: false,
    });

    const [serverId, setServerId] = useState(0);
    const [serverForm, setServerForm] = useState<ServerData>(serverInitial);
    const [serverFormError, setServerFormError] = useState<ServerFormError>({});

    const onServerFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setServerForm({ ...serverForm, [name]: value });
        setServerFormError({ ...serverFormError, [name]: undefined });
    };

    const serverValidate = (data: ServerData) => {
        const error: ServerFormError = {};
        if (!data.code?.trim()) error.code = t("validate.required", { name: t("text.code") });
        if (!data.ip?.trim()) error.ip = t("validate.required", { name: "IP" });
        if (data.port <= 0) error.port = t("validate.required", { name: t("text.port") });
        if (!data.password?.trim()) error.password = t("validate.required", { name: t("text.password") });
        if (!data.privateKey?.trim()) error.privateKey = t("validate.required", { name: t("text.privateKey") });
        setServerFormError(error);
        return Object.keys(error).length === 0;
    };

    const getServer = async (options: TableOptions) => {
        setServerTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,
        };
        setServerAttributeTable(options);

        const response = await apiRequest('get', "/external/server.json", params);
        if (HTTP_CODE.OK === response.status) {
            setServerArray(response.data);
            setServerDataTotalTable(response.total);
            setServerOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    map[obj.id] = { "viewedButtonFlag": false, "deletedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setServerTableLoadingFlag(false);
    };

    const viewServer = async (id: number) => {
        setServerId(id);
        setServerForm(serverInitial);
        setServerStateModal("view");
        setServerOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/external/${id}/server.json`);
        if (HTTP_CODE.OK === response.status) {
            const server = response.data;

            setServerId(server.id);
            setServerForm({
                code: server.code,
                description: server.description,
                ip: server.ip,
                port: server.port,
                username: server.username,
                password: server.password,
                privateKey: server.privateKey,
                version: server.version,
            });

            setServerEntryModal({
                ...serverEntryModal,
                title: server.name,
                submitLabel: t("button.edit"),
                submitIcon: "fa-solid fa-pen",
                submitLoadingFlag: false,
            });

            setModalServer(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setServerOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: false,
            },
        }));
    };

    const entryServer = (haveContentFlag: boolean) => {
        setServerStateModal("entry");
        setServerFormError({});
        if (haveContentFlag) {
            setServerEntryModal({
                ...serverEntryModal,
                title: serverForm.code,
                submitLabel: t("button.update"),
                submitIcon: "fa-solid fa-repeat",
                submitLoadingFlag: false,
            });
        } else {
            setServerId(0);
            setServerForm(serverInitial);
            setServerEntryModal({
                ...serverEntryModal,
                title: t("button.createNew"),
                submitLabel: t("button.save"),
                submitIcon: "fa-solid fa-bookmark",
                submitLoadingFlag: false,
            });

            setModalServer(true);
        }
    };

    const confirmStoreServer = async () => {
        if (serverValidate(serverForm)) {
            confirmDialog({
                type: 'confirmation',
                message: t(serverId === 0 ? "confirmation.create" : "confirmation.update", { name: serverForm.name }),
                onConfirm: () => storeServer(),
            });
        }
    };

    const storeServer = async () => {
        if (serverValidate(serverForm)) {
            setModalServer(false);
            setServerEntryModal({ ...serverEntryModal, submitLoadingFlag: true });

            const response = await apiRequest(
                serverId === 0 ? 'post' : 'patch',
                serverId === 0 ? '/external/server.json' : `/external/${serverId}/server.json`,
                serverForm,
            );

            if (HttpStatusCode.Ok === response.status || HttpStatusCode.Created === response.status) {
                getServer(serverAttributeTable);
                toast.show({ type: "done", message: HttpStatusCode.Created === response.status ? "information.created" : "information.updated" });
                setModalServer(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setServerEntryModal({ ...serverEntryModal, submitLoadingFlag: false });
        }
    }

    const confirmDeleteServer = (id: number, name: string) => {
        confirmDialog({
            type: 'warning',
            message: t("confirmation.delete", { name: name }),
            onConfirm: () => deleteServer(id),
        });
    };

    const deleteServer = async (id: number) => {
        setModalServer(false);
        setServerOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                deletedButtonFlag: true,
            },
        }));

        const response = await apiRequest('delete', `/external/${id}/server.json`)
        if (HttpStatusCode.NoContent === response.status) {
            getServer(serverAttributeTable);
            toast.show({ type: "done", message: "information.deleted" });
        } else {
            toast.show({ type: "error", message: response.message });
        }

        setServerOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                deletedButtonFlag: false,
            },
        }));
    };

    const [modalServer, setModalServer] = useState(false);

    return (
        <div className="bg-light-clear dark:bg-dark-clear m-5 p-5 pb-0 rounded-lg shadow-lg">
            <ModalStackProvider>
                <Modal
                    show={modalServer}
                    size="md"
                    title={serverEntryModal.title}
                    onClose={() => setModalServer(false)}
                    buttonArray={[
                        "entry" === serverStateModal && ({
                            label: serverEntryModal.submitLabel,
                            type: "primary",
                            icon: serverEntryModal.submitIcon,
                            onClick: () => confirmStoreServer(),
                            loadingFlag: serverEntryModal.submitLoadingFlag
                        }),
                        "view" === serverStateModal && ({
                            label: serverEntryModal.submitLabel,
                            type: "primary",
                            icon: serverEntryModal.submitIcon,
                            onClick: () => entryServer(true),
                            loadingFlag: false
                        })
                    ].filter(Boolean) as ButtonArray}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {
                            "entry" === serverStateModal
                            && <Fragment>
                                <InputText autoFocus={true} label={t("text.code")} name="code" value={serverForm.code} onChange={onServerFormChange} error={serverFormError.code} />
                                <TextArea label={t("text.description")} name="description" rows={1} value={serverForm.description} onChange={onServerFormChange} error={serverFormError.description} />
                                <InputText label="IP" name="ip" value={serverForm.ip} onChange={onServerFormChange} error={serverFormError.ip} />
                                <InputDecimal label={t("text.port")} name="port" value={serverForm.port} onChange={onServerFormChange} error={serverFormError.port} />
                                <InputText autoComplete="off" label={t("text.username")} name="username" value={serverForm.username} onChange={onServerFormChange} error={serverFormError.username} />
                                <InputPassword autoComplete="off" label={t("text.password")} name="password" value={serverForm.password} onChange={onServerFormChange} error={serverFormError.password} />
                                <TextArea label={t("text.privateKey")} name="privateKey" rows={3} value={serverForm.privateKey} onChange={onServerFormChange} error={serverFormError.privateKey} />
                            </Fragment>
                        }
                        {
                            "view" === serverStateModal
                            && <Fragment>
                                <Label text={t("text.code")} value={serverForm.code} />
                                <Label text={t("text.description")} value={serverForm.description} />
                                <Label text="IP" value={serverForm.ip} />
                                <Label text={t("text.port")} value={serverForm.port} />
                                <Label text={t("text.username")} value={serverForm.username} />
                                <Label text={t("text.password")} value={serverForm.password} password={true} />
                                <Label text={t("text.privateKey")} value={serverForm.privateKey} />
                            </Fragment>
                        }
                    </div>
                </Modal>
            </ModalStackProvider>
            <Table
                labelNewButton={t("button.createNew")}
                onNewButtonClick={() => entryServer(false)}

                dataArray={serverArray}
                columns={[
                    {
                        data: "code",
                        name: t("text.code"),
                        class: "text-nowrap",
                        orderable: true,
                        minDevice: 'mobile',
                    },
                    {
                        data: "ip",
                        name: "IP",
                        class: "wrap text-nowrap",
                        minDevice: 'tablet',
                    },
                    {
                        data: "port",
                        name: t("text.port"),
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
                                        onClick={() => viewServer(data)}
                                        loadingFlag={serverOptionColumnTable[data]?.viewedButtonFlag}
                                    />
                                    <Button
                                        label={t("button.delete")}
                                        className="max-sm:w-full"
                                        type='danger'
                                        icon="fa-solid fa-trash"
                                        onClick={() => confirmDeleteServer(data, row.name)}
                                        loadingFlag={serverOptionColumnTable[data]?.deletedButtonFlag}
                                    />
                                </div>
                            )
                        }
                    }
                ]}
                order={["createdDate", "desc"]}

                dataTotal={serverDataTotalTable}
                onRender={(page, length, search, order) => {
                    getServer({ page: page, length: length, search: search, order: order })
                }}
                loadingFlag={serverTableLoadingFlag}
            />
        </div>
    )
}