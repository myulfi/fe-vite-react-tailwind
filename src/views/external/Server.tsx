import { useTranslation } from "react-i18next";
import Button from "../../components/form/Button";
import { Fragment, useEffect, useRef, useState } from "react";
import { HTTP_CODE, type ButtonArray, type ModalCategory, type ModalType, type OptionColumn, type TableOptions } from "../../constants/common-constants";
import { apiRequest } from "../../api";
import { formatDate } from "../../function/dateHelper";
import { confirmDialog, Modal, ModalStackProvider } from "../../ModalContext";
import Label from "../../components/form/Label";
import { toast } from "../../ToastContext";
import InputText from "../../components/form/InputText";
import TextArea from "../../components/form/TextArea";
import InputDecimal from "../../components/form/InputDecimal";
import Table from "../../components/Table";
import { HttpStatusCode } from "axios";
import InputPassword from "../../components/form/InputPassword";
import Radio from "../../components/form/Radio";
import LabelBig from "../../components/form/LabelBig";
import Switch from "../../components/form/Switch";
import { formatBytes, yesNo } from "../../function/commonHelper";
import BreadCrumb from "../../components/BreadCrumb";
import Span from "../../components/Span";
import { useClickOutside } from "../../hook/useClickOutside";
import InputFile from "../../components/form/InputFile";

export default function Server() {
    const { t } = useTranslation();

    type ServerData = {
        code: string;
        description?: string;
        serverTypeId: number;
        ip: string;
        port: number;
        username: string,
        passwordlessFlag?: number,
        password?: string,
        privateKey?: string,
        version: number,
    }

    type ServerFormError = Partial<Record<keyof ServerData, string>>;

    const serverInitial: ServerData = {
        code: '',
        description: undefined,
        serverTypeId: 0,
        ip: '',
        port: 22,
        username: '',
        passwordlessFlag: 0,
        password: undefined,
        privateKey: undefined,
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
        if (data.serverTypeId <= 0) error.serverTypeId = t("validate.required", { name: t("text.type") });
        if (!data.ip?.trim()) error.ip = t("validate.required", { name: "IP" });
        if (data.port <= 0) error.port = t("validate.required", { name: t("text.port") });
        if (0 === serverForm.passwordlessFlag && !data.password?.trim()) error.password = t("validate.required", { name: t("text.password") });
        if (1 === serverForm.passwordlessFlag && !data.privateKey?.trim()) error.privateKey = t("validate.required", { name: t("text.privateKey") });
        setServerFormError(error);
        return Object.keys(error).length === 0;
    };

    useEffect(() => {
        getMasterServerType();
    }, []);

    const [masterServerTypeArray, setMasterServerTypeArray] = useState<Array<{ key: number; value: string; icon: string }>>([]);
    const getMasterServerType = async () => {
        const response = await apiRequest('get', '/master/server-type.json')
        if (HTTP_CODE.OK === response.status) {
            setMasterServerTypeArray(response.data)
        }
    }

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
                serverTypeId: server.serverTypeId,
                ip: server.ip,
                port: server.port,
                username: server.username,
                passwordlessFlag: server.password === null ? 1 : 0,
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
                message: t(serverId === 0 ? "confirmation.create" : "confirmation.update", { name: serverForm.code }),
                onConfirm: () => storeServer(),
            });
        }
    };

    const storeServer = async () => {
        if (serverValidate(serverForm)) {
            setServerEntryModal({ ...serverEntryModal, submitLoadingFlag: true });

            const response = await apiRequest(
                serverId === 0 ? 'post' : 'patch',
                serverId === 0 ? '/external/server.json' : `/external/${serverId}/server.json`,
                {
                    ...serverForm,
                    [0 === serverForm.passwordlessFlag ? "privateKey" : "password"]: undefined,
                    passwordlessFlag: undefined,
                },
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

    const [serverConnectModalTitle, setServerConnectModalTitle] = useState("");

    const connectServer = async (id: number, name: string) => {
        setServerId(id);

        setServerOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                connectedButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/external/${id}/server-connect.json`);
        if (HttpStatusCode.Ok === response.status) {
            setServerDirectoryCurrent(response.data);
            setServerConnectModalTitle(name);
            setModalServerConnect(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setServerOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                connectedButtonFlag: false,
            },
        }));
    };

    const [serverDirectoryCurrent, setServerDirectoryCurrent] = useState<string[]>([]);
    const [serverDirectoryCurrentManual, setServerDirectoryCurrentManual] = useState(false);
    const [serverDirectoryCurrentText, setServerDirectoryCurrentText] = useState<string>();

    const [serverDirectoryBulkOptionLoadingFlag, setServerDirectoryBulkOptionLoadingFlag] = useState(false);
    const [serverDirectoryCheckBoxTableArray, setServerDirectoryCheckBoxTableArray] = useState<number[]>([]);
    const [serverDirectoryOptionColumnTable, setServerDirectoryOptionColumnTable] = useState<{ [id: number]: OptionColumn; }>({});
    const [serverDirectoryAttributeTable, setServerDirectoryAttributeTable] = useState<TableOptions>({ page: 1, length: 10 });
    const [serverDirectoryDataTotalTable, setServerDirectoryDataTotalTable] = useState(0);
    const [serverDirectoryTableLoadingFlag, setServerDirectoryTableLoadingFlag] = useState(false);
    const [serverDirectoryRefreshTable, setServerDirectoryRefreshTable] = useState<boolean>(false);

    const [serverDirectoryDataArray, setServerDirectoryDataArray] = useState([]);

    const getServerDirectory = async (options: TableOptions, serverDirectoryCurrent: string[]) => {
        setServerDirectoryTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,
            "directory": serverDirectoryCurrent.join("/")
        };
        setServerDirectoryAttributeTable(options);

        const response = await apiRequest('get', `/external/${serverId}/server-directory.json`, params);
        if (HTTP_CODE.OK === response.status) {
            setServerDirectoryDataArray(response.data);
            setServerDirectoryCurrent(response.directory);
            setServerDirectoryDataTotalTable(response.total);
            setServerDirectoryOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    map[obj.id] = { "viewedButtonFlag": false, "deletedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setServerDirectoryTableLoadingFlag(false);
    };

    const onServerDirectoryCurrentTextChange = (e: { target: { value: any } }) => {
        const { value } = e.target
        setServerDirectoryCurrentText(value)
    }

    const onServerDirectoryCurrentTextKeyDown = (e: { key: any }) => {
        if (e.key === "Enter") {
            manualFolder(serverDirectoryCurrentText);
            setServerDirectoryCurrentManual(false);
        }
    }

    const serverDirectoryCurrentTextRef = useRef<HTMLInputElement>(null);
    useClickOutside(serverDirectoryCurrentTextRef, () => setServerDirectoryCurrentManual(false));
    const onServerDirectoryCurrentManualChange = () => {
        setServerDirectoryCurrentManual(!serverDirectoryCurrentManual);
    }

    useEffect(() => {
        if (serverDirectoryCurrentManual) {
            setServerDirectoryCurrentText(serverDirectoryCurrent.join("/"))
            serverDirectoryCurrentTextRef.current!.focus()
        }
    }, [serverDirectoryCurrentManual]);

    const jumpFolder = (index: number) => {
        setServerDirectoryRefreshTable(refresh => !refresh);
        setServerDirectoryCheckBoxTableArray([]);
        // const shortcutIndex = serverShortcutMap.findIndex((item) => options.directory.length > 0 && item.value.endsWith(options.directory))
        // setServerShortcutValue(shortcutIndex > -1 ? serverShortcutMap[shortcutIndex].key : 0)
        // {...serverDirectoryAttributeTable, page : 0}
        getServerDirectory({ ...serverDirectoryAttributeTable, page: 1, search: "" }, index > 0 ? serverDirectoryCurrent.slice(0, index) : []);
    }

    const goToParent = () => {
        setServerDirectoryRefreshTable(refresh => !refresh);
        setServerDirectoryCheckBoxTableArray([]);
        // const shortcutIndex = serverShortcutMap.findIndex((item) => options.directory.length > 0 && item.value.endsWith(options.directory))
        // setServerShortcutValue(shortcutIndex > -1 ? serverShortcutMap[shortcutIndex].key : 0)
        getServerDirectory({ ...serverDirectoryAttributeTable, page: 1, search: "" }, serverDirectoryCurrent.slice(0, -1));
    }

    const enterFolder = (name: string) => {
        setServerDirectoryRefreshTable(refresh => !refresh);
        setServerDirectoryCheckBoxTableArray([]);
        // const index = serverShortcutMap.findIndex((item) => item.value.endsWith(options.directory))
        // setServerShortcutValue(index > -1 ? serverShortcutMap[index].key : 0)
        getServerDirectory({ ...serverDirectoryAttributeTable, page: 1, search: "" }, [...serverDirectoryCurrent, name]);
    }

    const manualFolder = (path?: string) => {
        setServerDirectoryRefreshTable(refresh => !refresh);
        setServerDirectoryCheckBoxTableArray([]);

        // const shortcutIndex = serverShortcutMap.findIndex((item) => options.directory.length > 0 && item.value.endsWith(options.directory))
        // setServerShortcutValue(shortcutIndex > -1 ? serverShortcutMap[shortcutIndex].key : 0)
        getServerDirectory({ ...serverDirectoryAttributeTable, page: 1, search: "" }, path!.split("/"));
    }

    type ServerFolderData = {
        name: string;
    }

    type ServerFolderFormError = Partial<Record<keyof ServerFolderData, string>>;

    const serverFolderInitial: ServerFolderData = {
        name: "",
    }

    const [serverFolderModalTitle, setServerFolderModalTitle] = useState("");
    const [serverFolderSubmitModalLoadingFlag, setServerFolderSubmitModalLoadingFlag] = useState(false);

    const [serverFolderForm, setServerFolderForm] = useState<ServerFolderData>(serverFolderInitial);
    const [serverFolderFormError, setServerFolderFormError] = useState<ServerFolderFormError>({});

    const onServerFolderFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setServerFolderForm({ ...serverFolderForm, [name]: value });
        setServerFolderFormError({ ...serverFolderFormError, [name]: undefined });
    };

    const serverFolderValidate = (data: ServerFolderData) => {
        const error: ServerFolderFormError = {};
        if (!data.name?.trim()) error.name = t("validate.required", { name: t("text.name") });
        setServerFolderFormError(error);
        return Object.keys(error).length === 0;
    };

    const entryServerFolder = () => {
        setServerFolderFormError({});
        setServerFolderForm(serverFolderInitial);
        setServerFolderModalTitle(serverDirectoryCurrent.join("/"));
        setServerFolderSubmitModalLoadingFlag(false);
        setModalServerFolder(true);
    };

    const confirmStoreServerFolder = async () => {
        if (serverFolderValidate(serverFolderForm)) {
            confirmDialog({
                type: 'confirmation',
                message: t("confirmation.create", { name: serverFolderForm.name }),
                onConfirm: () => storeServerFolder(),
            });
        }
    };

    const storeServerFolder = async () => {
        if (serverFolderValidate(serverFolderForm)) {
            setServerFolderSubmitModalLoadingFlag(true);

            const response = await apiRequest(
                'post'
                , '/external/server-folder.json',
                {
                    ...serverFolderForm,
                },
            );

            if (HttpStatusCode.Created === response.status) {
                getServerDirectory(serverDirectoryAttributeTable, serverDirectoryCurrent);
                toast.show({ type: "done", message: "information.created" });
                setModalServerFolder(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setServerFolderSubmitModalLoadingFlag(false);
        }
    }

    type ServerFileData = {
        name: string;
        content: string;
    }

    type ServerFileFormError = Partial<Record<keyof ServerFileData, string>>;

    const serverFileInitial: ServerFileData = {
        name: "",
        content: "",
    }

    const [serverFileModalTitle, setServerFileModalTitle] = useState("");
    const [serverFileSubmitModalLoadingFlag, setServerFileSubmitModalLoadingFlag] = useState(false);

    const [serverFileForm, setServerFileForm] = useState<ServerFileData>(serverFileInitial);
    const [serverFileFormError, setServerFileFormError] = useState<ServerFileFormError>({});

    const onServerFileFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setServerFileForm({ ...serverFileForm, [name]: value });
        setServerFileFormError({ ...serverFileFormError, [name]: undefined });
    };

    const serverFileValidate = (data: ServerFileData) => {
        const error: ServerFileFormError = {};
        if (!data.name?.trim()) error.name = t("validate.required", { name: t("text.name") });
        if (!data.content?.trim()) error.name = t("validate.required", { name: t("text.content") });
        setServerFileFormError(error);
        return Object.keys(error).length === 0;
    };

    const entryServerFile = () => {
        setServerFileFormError({});
        setServerFileForm(serverFileInitial);
        setServerFileModalTitle(serverDirectoryCurrent.join("/"));
        setServerFileSubmitModalLoadingFlag(false);
        setModalServerFile(true);
    };

    const confirmStoreServerFile = async () => {
        if (serverFileValidate(serverFileForm)) {
            confirmDialog({
                type: 'confirmation',
                message: t("confirmation.create", { name: serverFileForm.name }),
                onConfirm: () => storeServerFile(),
            });
        }
    };

    const storeServerFile = async () => {
        if (serverFileValidate(serverFileForm)) {
            setServerFileSubmitModalLoadingFlag(true);

            const response = await apiRequest(
                'post'
                , '/external/server-file.json',
                {
                    ...serverFileForm,
                },
            );

            if (HttpStatusCode.Created === response.status) {
                getServerDirectory(serverDirectoryAttributeTable, serverDirectoryCurrent);
                toast.show({ type: "done", message: "information.created" });
                setModalServerFile(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setServerFileSubmitModalLoadingFlag(false);
        }
    }

    type ServerUploadData = {
        file: File[];
    }

    type ServerUploadFormError = Partial<Record<keyof ServerUploadData, string>>;

    const serverUploadInitial: ServerUploadData = {
        file: [],
    }

    const [serverUploadModalTitle, setServerUploadModalTitle] = useState("");
    const [serverUploadSubmitModalLoadingFlag, setServerUploadSubmitModalLoadingFlag] = useState(false);

    const [serverUploadForm, setServerUploadForm] = useState<ServerUploadData>(serverUploadInitial);
    const [serverUploadFormError, setServerUploadFormError] = useState<ServerUploadFormError>({});

    const onServerUploadFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setServerUploadForm({ ...serverUploadForm, [name]: value });
        setServerUploadFormError({ ...serverUploadFormError, [name]: undefined });
    };

    const serverUploadValidate = (data: ServerUploadData) => {
        const error: ServerUploadFormError = {};
        if (data.file.length === 0) error.file = t("validate.required", { name: t("text.name") });
        setServerUploadFormError(error);
        return Object.keys(error).length === 0;
    };

    const entryServerUpload = () => {
        setServerUploadFormError({});
        setServerUploadForm(serverUploadInitial);
        setServerUploadModalTitle(serverDirectoryCurrent.join("/"));
        setServerUploadSubmitModalLoadingFlag(false);
        setModalServerUpload(true);
    };

    const confirmStoreServerUpload = async () => {
        if (serverUploadValidate(serverUploadForm)) {
            confirmDialog({
                type: 'confirmation',
                message: t("confirmation.create", { name: serverUploadForm.file.length }),
                onConfirm: () => storeServerUpload(),
            });
        }
    };

    const storeServerUpload = async () => {
        if (serverUploadValidate(serverUploadForm)) {
            setServerUploadSubmitModalLoadingFlag(true);

            const response = await apiRequest(
                'post'
                , '/external/server-upload.json',
                {
                    ...serverUploadForm,
                },
            );

            if (HttpStatusCode.Created === response.status) {
                getServerDirectory(serverDirectoryAttributeTable, serverDirectoryCurrent);
                toast.show({ type: "done", message: "information.created" });
                setModalServerUpload(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setServerUploadSubmitModalLoadingFlag(false);
        }
    }

    const [modalServer, setModalServer] = useState(false);
    const [modalServerConnect, setModalServerConnect] = useState(false);
    const [modalServerFolder, setModalServerFolder] = useState(false);
    const [modalServerFile, setModalServerFile] = useState(false);
    const [modalServerUpload, setModalServerUpload] = useState(false);

    return (
        <div className="bg-light-clear dark:bg-dark-clear m-5 p-5 pb-0 rounded-lg shadow-lg">
            <ModalStackProvider>
                <Modal
                    show={modalServer}
                    size="md"
                    type="dynamic"
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
                                <Radio label={t("text.type")} columnSpan={2} name="serverTypeId" value={serverForm.serverTypeId} size="sm" map={masterServerTypeArray} onChange={onServerFormChange} error={serverFormError.serverTypeId} />
                                <InputText label="IP" name="ip" value={serverForm.ip} onChange={onServerFormChange} error={serverFormError.ip} />
                                <InputDecimal label={t("text.port")} name="port" value={serverForm.port} onChange={onServerFormChange} error={serverFormError.port} />
                                <InputText autoComplete="off" label={t("text.username")} name="username" value={serverForm.username} onChange={onServerFormChange} error={serverFormError.username} />
                                <Switch label={t("text.passwordless")} name="passwordlessFlag" value={serverForm.passwordlessFlag!} onChange={onServerFormChange} />
                                {
                                    0 === serverForm.passwordlessFlag &&
                                    <InputPassword label={t("text.password")} name="password" value={serverForm.password!} onChange={onServerFormChange} error={serverFormError.password} />
                                }
                                {
                                    1 === serverForm.passwordlessFlag &&
                                    <TextArea label={t("text.privateKey")} name="privateKey" rows={3} value={serverForm.privateKey} onChange={onServerFormChange} error={serverFormError.privateKey} />
                                }
                            </Fragment>
                        }
                        {
                            "view" === serverStateModal
                            && <Fragment>
                                <Label text={t("text.code")} value={serverForm.code} />
                                <Label text={t("text.description")} value={serverForm.description} />
                                <Label text={t("text.type")} value={masterServerTypeArray.getValueByKey?.(serverForm.serverTypeId)} />
                                <Label text="IP" value={serverForm.ip} />
                                <Label text={t("text.port")} value={serverForm.port} />
                                <Label text={t("text.username")} value={serverForm.username} />
                                <Label text={t("text.passwordless")} value={yesNo(serverForm.passwordlessFlag!)} />
                                {
                                    0 === serverForm.passwordlessFlag &&
                                    <Label text={t("text.password")} value={serverForm.password} password={true} />
                                }
                                {
                                    1 === serverForm.passwordlessFlag &&
                                    <LabelBig text={t("text.privateKey")} value={serverForm.privateKey} />
                                }
                            </Fragment>
                        }
                    </div>
                </Modal>
                <Modal
                    show={modalServerConnect}
                    type="dynamic"
                    size="xl"
                    title={serverConnectModalTitle}
                    onClose={() => setModalServerConnect(false)}
                >
                    {
                        serverDirectoryCurrentManual &&
                        <div className="pt-1.5 pb-5">
                            <InputText
                                name=""
                                positionUnit="left"
                                valueUnit="... / "
                                refference={serverDirectoryCurrentTextRef}
                                value={serverDirectoryCurrentText!}
                                onChange={onServerDirectoryCurrentTextChange}
                                onKeyDown={onServerDirectoryCurrentTextKeyDown}
                            />
                        </div>
                    }
                    {
                        !serverDirectoryCurrentManual &&
                        <div className="pt-3 pb-7">
                            <BreadCrumb
                                valueList={["...", ...serverDirectoryCurrent]}
                                delimiter="/"
                                onClick={jumpFolder}
                                onEdit={onServerDirectoryCurrentManualChange}
                            />
                        </div>
                    }
                    <Table
                        additionalButtonArray={[
                            {
                                label: t("button.addToShortcut"),
                                type: 'primary',
                                icon: "fa-solid fa-up-right-from-square",
                                onClick: () => toast.show({ type: "done", message: "hahah" })
                            },
                            {
                                label: t("button.createDirectory"),
                                type: 'primary',
                                icon: "fa-solid fa-folder-plus",
                                onClick: () => entryServerFolder()
                            },
                            {
                                label: t("button.addFile"),
                                type: 'primary',
                                icon: "fa-solid fa-file-circle-plus",
                                onClick: () => entryServerFile()
                            },
                            {
                                label: t("button.upload"),
                                type: 'primary',
                                icon: "fa-solid fa-upload",
                                onClick: () => entryServerUpload()
                            }
                        ]}

                        bulkOptionLoadingFlag={serverDirectoryBulkOptionLoadingFlag}
                        bulkOptionArray={[
                            {
                                label: t("button.clone"),
                                icon: "fa-solid fa-clone",
                                onClick: () => { },
                            },
                            {
                                label: t("button.delete"),
                                icon: "fa-solid fa-trash",
                                onClick: () => { },
                            }
                        ]}

                        dataArray={
                            serverDirectoryCurrent.length > 0
                                ? [{ name: ".:Up:.", goToParentFlag: true }, ...serverDirectoryDataArray]
                                : serverDirectoryDataArray
                        }
                        columns={[
                            {
                                data: "name",
                                name: t("text.name"),
                                class: "text-nowrap",
                                orderable: true,
                                minDevice: 'mobile',
                                render: (data, row) => {
                                    if (row.goToParentFlag) {
                                        return (
                                            <Span label={data} icon="fa-solid fa-arrow-turn-up fa-flip-horizontal" className="cursor-pointer hover:underline" onClick={goToParent} />
                                        )
                                    } else {
                                        return (
                                            <Fragment>
                                                <Span
                                                    label={data}
                                                    icon={`${row.directoryFlag ? "fa-solid fa-folder-open" : "fa-solid fa-file"}`}
                                                    className="hover:cursor-pointer hover:underline"
                                                    onClick={() => row.directoryFlag ? enterFolder(data) : enterFolder(data)}
                                                />
                                                {/* <label role="button" onClick={() => row.directoryFlag ? enterFolder(data) : entryServerFile(data)}>
                                                    <i className={`${row.directoryFlag ? "bi-folder-fill" : "bi-file"}`} />&nbsp;&nbsp;{data}
                                                </label>
                                                &nbsp;|&nbsp;<label className="sm-1" role="button" onClick={() => entryServerDirectoryFile(data)}>
                                                    <i className="bi-arrow-repeat" />
                                                </label>
                                                &nbsp;<label className="sm-1" role="button" onClick={() => confirmPasteServerDirectoryFile(data)}>
                                                    <i className="bi-copy" />
                                                </label>&nbsp;<label className="sm-1" role="button" onClick={() => confirmDeleteServerDirectoryFile(data)}>
                                                    <i className="bi-trash" />
                                                </label> */}
                                            </Fragment>
                                        )
                                    }
                                }
                            },
                            {
                                data: "size",
                                name: t("text.size"),
                                class: "text-nowrap",
                                orderable: true,
                                minDevice: 'mobile',
                                render: (data, row) => {
                                    if (row.goToParentFlag) {
                                        return ""
                                    } else {
                                        return formatBytes(data)
                                    }
                                }
                            },
                            {
                                data: "modified_date",
                                name: t("text.modifiedDate"),
                                class: "text-nowrap",
                                orderable: true,
                                minDevice: 'tablet',
                                render: (data, row) => {
                                    if (row.goToParentFlag) {
                                        return ""
                                    } else {
                                        return formatDate(new Date(data), 'dd MMM yyyy HH:mm:ss')
                                    }
                                }
                            },
                            {
                                data: "status",
                                name: t("text.status"),
                                class: "text-nowrap",
                                minDevice: 'tablet',
                                render: (data, row) => {
                                    if (row.goToParentFlag) {
                                        return ""
                                    } else {
                                        return data
                                    }
                                }
                            },
                        ]}
                        order={["name", "asc"]}

                        checkBoxArray={serverDirectoryCheckBoxTableArray}
                        onCheckBox={serverDirectoryCheckBoxTableArray => { setServerDirectoryCheckBoxTableArray([...serverDirectoryCheckBoxTableArray]) }}
                        dataTotal={serverDirectoryDataTotalTable}

                        onRender={(page, length, search, order) => {
                            getServerDirectory({ page: page, length: length, search, order }, serverDirectoryCurrent)
                        }}
                        refresh={serverDirectoryRefreshTable}
                        loadingFlag={serverDirectoryTableLoadingFlag}
                    />
                </Modal>
                <Modal
                    show={modalServerFolder}
                    size="md"
                    title={`${serverConnectModalTitle} | ${serverFolderModalTitle}`}
                    onClose={() => setModalServerFolder(false)}
                    buttonArray={[
                        {
                            label: t("button.create"),
                            type: "primary",
                            icon: 'fa-solid fa-bookmark',
                            onClick: () => confirmStoreServerFolder(),
                            loadingFlag: serverFolderSubmitModalLoadingFlag
                        }
                    ]}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <InputText autoFocus={true} label={t("text.name")} name="name" value={serverFolderForm.name} onChange={onServerFolderFormChange} error={serverFolderFormError.name} />
                    </div>
                </Modal>
                <Modal
                    show={modalServerFile}
                    size="lg"
                    title={`${serverConnectModalTitle} | ${serverFileModalTitle}`}
                    onClose={() => setModalServerFile(false)}
                    buttonArray={[
                        {
                            label: t("button.create"),
                            type: "primary",
                            icon: 'fa-solid fa-bookmark',
                            onClick: () => confirmStoreServerFile(),
                            loadingFlag: serverFileSubmitModalLoadingFlag
                        }
                    ]}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <InputText autoFocus={true} label={t("text.name")} name="name" value={serverFileForm.name} onChange={onServerFileFormChange} error={serverFileFormError.name} />
                        <TextArea label={t("text.content")} name="content" rows={10} value={serverFileForm.content} onChange={onServerFileFormChange} error={serverFileFormError.content} />
                    </div>
                </Modal>
                <Modal
                    show={modalServerUpload}
                    size="lg"
                    title={`${serverConnectModalTitle} | ${serverUploadModalTitle}`}
                    onClose={() => setModalServerUpload(false)}
                    buttonArray={[
                        {
                            label: t("button.upload"),
                            type: "primary",
                            icon: 'fa-solid fa-upload',
                            onClick: () => confirmStoreServerUpload(),
                            loadingFlag: serverUploadSubmitModalLoadingFlag
                        }
                    ]}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <InputFile label={t("text.file")} name="content" value={serverUploadForm.file} onChange={onServerUploadFormChange} error={serverUploadFormError.file} />
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
                                        label={t("button.connect")}
                                        className="max-sm:w-full"
                                        type='primary'
                                        icon="fa-solid fa-plug"
                                        onClick={() => connectServer(data, row.code)}
                                        loadingFlag={serverOptionColumnTable[data]?.connectedButtonFlag}
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