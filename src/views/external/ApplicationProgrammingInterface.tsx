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
import MenuTree from "../../components/containers/MenuTree";

export default function ApplicationProgrammingInterface() {
    const { t } = useTranslation();

    type ApplicationProgrammingInterfaceData = {
        name: string;
        description?: string;
        version: number,
    }

    type ApplicationProgrammingInterfaceFormError = Partial<Record<keyof ApplicationProgrammingInterfaceData, string>>;

    const applicationProgrammingInterfaceInitial: ApplicationProgrammingInterfaceData = {
        name: "",
        description: undefined,
        version: 0,
    }

    const [applicationProgrammingInterfaceStateModal, setApplicationProgrammingInterfaceStateModal] = useState<ModalCategory>("entry");

    const [applicationProgrammingInterfaceOptionColumnTable, setApplicationProgrammingInterfaceOptionColumnTable] = useState<{
        [id: number]: {
            viewedButtonFlag: boolean;
            requestButtonFlag: boolean;
            deletedButtonFlag: boolean;
        };
    }>({});
    const [applicationProgrammingInterfaceAttributeTable, setApplicationProgrammingInterfaceAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [applicationProgrammingInterfaceDataTotalTable, setApplicationProgrammingInterfaceDataTotalTable] = useState(0);
    const [applicationProgrammingInterfaceTableLoadingFlag, setApplicationProgrammingInterfaceTableLoadingFlag] = useState(false);

    const [applicationProgrammingInterfaceArray, setApplicationProgrammingInterfaceArray] = useState([]);

    const [applicationProgrammingInterfaceEntryModal, setApplicationProgrammingInterfaceEntryModal] = useState<ModalType>({
        title: "",
        submitLabel: "",
        submitClass: "",
        submitIcon: "",
        submitLoadingFlag: false,
    });

    const [applicationProgrammingInterfaceId, setApplicationProgrammingInterfaceId] = useState(0);
    const [applicationProgrammingInterfaceForm, setApplicationProgrammingInterfaceForm] = useState<ApplicationProgrammingInterfaceData>(applicationProgrammingInterfaceInitial);
    const [applicationProgrammingInterfaceFormError, setApplicationProgrammingInterfaceFormError] = useState<ApplicationProgrammingInterfaceFormError>({});

    const onApplicationProgrammingInterfaceFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setApplicationProgrammingInterfaceForm({ ...applicationProgrammingInterfaceForm, [name]: value });
        setApplicationProgrammingInterfaceFormError({ ...applicationProgrammingInterfaceFormError, [name]: undefined });
    };

    const applicationProgrammingInterfaceValidate = (data: ApplicationProgrammingInterfaceData) => {
        const error: ApplicationProgrammingInterfaceFormError = {};
        if (!data.name?.trim()) error.name = t("validate.required", { name: t("text.name") });
        if (!data.description?.trim()) error.description = t("validate.required", { name: t("text.description") });
        setApplicationProgrammingInterfaceFormError(error);
        return Object.keys(error).length === 0;
    };

    // useEffect(() => { getApplicationProgrammingInterface({ page: 1, length: 10, search: '' }) }, []);

    const getApplicationProgrammingInterface = async (options: TableOptions) => {
        setApplicationProgrammingInterfaceTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,
        };
        setApplicationProgrammingInterfaceAttributeTable(options);

        const response = await apiRequest('get', "/external/api.json", params);
        if (HTTP_CODE.OK === response.status) {
            setApplicationProgrammingInterfaceArray(response.data);
            setApplicationProgrammingInterfaceDataTotalTable(response.total);
            setApplicationProgrammingInterfaceOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    map[obj.id] = { "viewedButtonFlag": false, "deletedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setApplicationProgrammingInterfaceTableLoadingFlag(false);
    };

    const viewApplicationProgrammingInterface = async (id: number) => {
        setApplicationProgrammingInterfaceId(id);
        setApplicationProgrammingInterfaceForm(applicationProgrammingInterfaceInitial);
        setApplicationProgrammingInterfaceStateModal("view");
        setApplicationProgrammingInterfaceOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/external/${id}/api.json`);
        if (HTTP_CODE.OK === response.status) {
            const applicationProgrammingInterface = response.data;

            setApplicationProgrammingInterfaceId(applicationProgrammingInterface.id);
            setApplicationProgrammingInterfaceForm({
                name: applicationProgrammingInterface.name,
                description: applicationProgrammingInterface.description,
                version: applicationProgrammingInterface.version,
            });

            setApplicationProgrammingInterfaceEntryModal({
                ...applicationProgrammingInterfaceEntryModal,
                title: applicationProgrammingInterface.name,
                submitLabel: t("text.edit"),
                submitIcon: "fa-solid fa-pen",
                submitLoadingFlag: false,
            });

            setModalApplicationProgrammingInterface(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setApplicationProgrammingInterfaceOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: false,
            },
        }));
    };

    const entryApplicationProgrammingInterface = (haveContentFlag: boolean) => {
        setApplicationProgrammingInterfaceStateModal("entry");
        setApplicationProgrammingInterfaceFormError({});
        if (haveContentFlag) {
            setApplicationProgrammingInterfaceEntryModal({
                ...applicationProgrammingInterfaceEntryModal,
                title: applicationProgrammingInterfaceForm.name,
                submitLabel: t("text.update"),
                submitIcon: "fa-solid fa-repeat",
                submitLoadingFlag: false,
            });
        } else {
            setApplicationProgrammingInterfaceId(0);
            setApplicationProgrammingInterfaceForm(applicationProgrammingInterfaceInitial);
            setApplicationProgrammingInterfaceEntryModal({
                ...applicationProgrammingInterfaceEntryModal,
                title: t("text.createNew"),
                submitLabel: t("text.save"),
                submitIcon: "fa-solid fa-bookmark",
                submitLoadingFlag: false,
            });

            setModalApplicationProgrammingInterface(true);
        }
    };

    const confirmStoreApplicationProgrammingInterface = async () => {
        if (applicationProgrammingInterfaceValidate(applicationProgrammingInterfaceForm)) {
            dialog.show({
                type: 'confirmation',
                message: t(applicationProgrammingInterfaceId === 0 ? "confirmation.create" : "confirmation.update", { name: applicationProgrammingInterfaceForm.name }),
                onConfirm: () => storeApplicationProgrammingInterface(),
            });
        }
    };

    const storeApplicationProgrammingInterface = async () => {
        if (applicationProgrammingInterfaceValidate(applicationProgrammingInterfaceForm)) {
            setApplicationProgrammingInterfaceEntryModal({ ...applicationProgrammingInterfaceEntryModal, submitLoadingFlag: true });

            const response = await apiRequest(
                applicationProgrammingInterfaceId === 0 ? 'post' : 'patch',
                applicationProgrammingInterfaceId === 0 ? '/external/api.json' : `/external/${applicationProgrammingInterfaceId}/api.json`,
                applicationProgrammingInterfaceForm,
            );

            if (HttpStatusCode.Ok === response.status || HttpStatusCode.Created === response.status) {
                getApplicationProgrammingInterface(applicationProgrammingInterfaceAttributeTable);
                toast.show({ type: "done", message: HttpStatusCode.Created === response.status ? "information.created" : "information.updated" });
                setModalApplicationProgrammingInterface(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setApplicationProgrammingInterfaceEntryModal({ ...applicationProgrammingInterfaceEntryModal, submitLoadingFlag: false });
        }
    }

    const confirmDeleteApplicationProgrammingInterface = (id: number, name: string) => {
        dialog.show({
            type: 'warning',
            message: t("confirmation.delete", { name: name }),
            onConfirm: () => deleteApplicationProgrammingInterface(id),
        });
    };

    const deleteApplicationProgrammingInterface = async (id: number) => {
        setModalApplicationProgrammingInterface(false);
        setApplicationProgrammingInterfaceOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                deletedButtonFlag: true,
            },
        }));

        const response = await apiRequest('delete', `/external/${id}/api.json`)
        if (HttpStatusCode.NoContent === response.status) {
            getApplicationProgrammingInterface(applicationProgrammingInterfaceAttributeTable);
            toast.show({ type: "done", message: "information.deleted" });
        } else {
            toast.show({ type: "error", message: response.message });
        }

        setApplicationProgrammingInterfaceOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                deletedButtonFlag: false,
            },
        }));
    };


    const [applicationProgrammingInterfaceRequestList, setApplicationProgrammingInterfaceRequestList] = useState([]);

    const viewRequestApplicationProgrammingInterface = async (id: number) => {
        setApplicationProgrammingInterfaceId(id);
        setApplicationProgrammingInterfaceOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                requestButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/external/${id}/api-request.json`);
        if (HTTP_CODE.OK === response.status) {
            setModalApplicationProgrammingInterfaceRequest(true);
            setApplicationProgrammingInterfaceRequestList(response.data);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setApplicationProgrammingInterfaceOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                requestButtonFlag: false,
            },
        }));
    };

    const [modalApplicationProgrammingInterface, setModalApplicationProgrammingInterface] = useState(false);
    const [modalApplicationProgrammingInterfaceRequest, setModalApplicationProgrammingInterfaceRequest] = useState(false);

    return (
        <div className="container-column">
            <ModalStackProvider>
                <Modal
                    show={modalApplicationProgrammingInterface}
                    size="sm"
                    title={applicationProgrammingInterfaceEntryModal.title}
                    onClose={() => setModalApplicationProgrammingInterface(false)}
                    buttonArray={[
                        "entry" === applicationProgrammingInterfaceStateModal && ({
                            label: applicationProgrammingInterfaceEntryModal.submitLabel,
                            type: "primary",
                            icon: applicationProgrammingInterfaceEntryModal.submitIcon,
                            onClick: () => confirmStoreApplicationProgrammingInterface(),
                            loadingFlag: applicationProgrammingInterfaceEntryModal.submitLoadingFlag
                        }),
                        "view" === applicationProgrammingInterfaceStateModal && ({
                            label: applicationProgrammingInterfaceEntryModal.submitLabel,
                            type: "primary",
                            icon: applicationProgrammingInterfaceEntryModal.submitIcon,
                            onClick: () => entryApplicationProgrammingInterface(true),
                            loadingFlag: false
                        })
                    ].filter(Boolean) as ButtonArray}
                >
                    <div className="container-column">
                        {
                            "entry" === applicationProgrammingInterfaceStateModal
                            && <Fragment>
                                <InputText autoFocus={true} label={t("text.name")} name="name" value={applicationProgrammingInterfaceForm.name} onChange={onApplicationProgrammingInterfaceFormChange} error={applicationProgrammingInterfaceFormError.name} />
                                <TextArea label={t("text.description")} name="description" rows={4} value={applicationProgrammingInterfaceForm.description} onChange={onApplicationProgrammingInterfaceFormChange} error={applicationProgrammingInterfaceFormError.description} />
                            </Fragment>
                        }
                        {
                            "view" === applicationProgrammingInterfaceStateModal
                            && <Fragment>
                                <Label text={t("text.name")} value={applicationProgrammingInterfaceForm.name} />
                                <Label text={t("text.description")} value={applicationProgrammingInterfaceForm.description} />
                            </Fragment>
                        }
                    </div>
                </Modal>
                <Modal
                    show={modalApplicationProgrammingInterfaceRequest}
                    size="xl"
                    title={applicationProgrammingInterfaceEntryModal.title}
                    onClose={() => setModalApplicationProgrammingInterfaceRequest(false)}
                >
                    <div className="color-main rounded-2xl">
                        <div className="container-cols">
                            <MenuTree menuList={applicationProgrammingInterfaceRequestList} />
                        </div>
                    </div>
                </Modal>
            </ModalStackProvider>
            <Table
                labelNewButton={t("text.createNew")}
                onNewButtonClick={() => entryApplicationProgrammingInterface(false)}

                dataArray={applicationProgrammingInterfaceArray}
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
                                        type='primary'
                                        icon="fa-solid fa-list"
                                        onClick={() => viewApplicationProgrammingInterface(data)}
                                        loadingFlag={applicationProgrammingInterfaceOptionColumnTable[data]?.viewedButtonFlag}
                                    />
                                    <Button
                                        label={t("text.request")}
                                        type='primary'
                                        icon="fa-solid fa-circle-arrow-right"
                                        onClick={() => viewRequestApplicationProgrammingInterface(data)}
                                        loadingFlag={applicationProgrammingInterfaceOptionColumnTable[data]?.requestButtonFlag}
                                    />
                                    <Button
                                        label={t("text.delete")}
                                        type='danger'
                                        icon="fa-solid fa-trash"
                                        onClick={() => confirmDeleteApplicationProgrammingInterface(data, row.name)}
                                        loadingFlag={applicationProgrammingInterfaceOptionColumnTable[data]?.deletedButtonFlag}
                                    />
                                </div>
                            )
                        }
                    }
                ]}
                order={["createdDate", "desc"]}
                dataTotal={applicationProgrammingInterfaceDataTotalTable}
                onRender={(page, length, search, order) => {
                    getApplicationProgrammingInterface({ page: page, length: length, search: search, order: order })
                }}
                loadingFlag={applicationProgrammingInterfaceTableLoadingFlag}
            />
        </div>
    )
}