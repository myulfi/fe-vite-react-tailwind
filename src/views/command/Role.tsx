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
import Table from "../../components/Table";
import { HttpStatusCode } from "axios";
import { dialog } from "../../DialogContext";
import Tree from "../../components/form/Tree";
import RootTree from "../../components/form/RootTree";

export default function Role() {
    const { t } = useTranslation();

    type RoleData = {
        name: string;
        description?: string;
        version: number,
    }

    type RoleFormError = Partial<Record<keyof RoleData, string>>;

    const roleInitial: RoleData = {
        name: "",
        description: undefined,
        version: 0,
    }

    const [roleStateModal, setRoleStateModal] = useState<ModalCategory>("entry");

    interface OptionColumn {
        viewedButtonFlag: boolean;
        menuButtonFlag: boolean;
        deletedButtonFlag: boolean;
    };
    const [roleOptionColumnTable, setRoleOptionColumnTable] = useState<{ [id: number]: OptionColumn; }>({});
    const [roleAttributeTable, setRoleAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [roleDataTotalTable, setRoleDataTotalTable] = useState(0);
    const [roleTableLoadingFlag, setRoleTableLoadingFlag] = useState(false);

    const [roleArray, setRoleArray] = useState([]);

    const [roleEntryModal, setRoleEntryModal] = useState<ModalType>({
        title: "",
        submitLabel: "",
        submitClass: "",
        submitIcon: "",
        submitLoadingFlag: false,
    });

    const [roleId, setRoleId] = useState(0);
    const [roleForm, setRoleForm] = useState<RoleData>(roleInitial);
    const [roleFormError, setRoleFormError] = useState<RoleFormError>({});

    const onRoleFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setRoleForm({ ...roleForm, [name]: value });
        setRoleFormError({ ...roleFormError, [name]: undefined });
    };

    const roleValidate = (data: RoleData) => {
        const error: RoleFormError = {};
        if (!data.name?.trim()) error.name = t("validate.required", { name: t("text.name") });
        if (!data.description?.trim()) error.description = t("validate.required", { name: t("text.description") });

        setRoleFormError(error);
        return Object.keys(error).length === 0;
    };

    const getRole = async (options: TableOptions) => {
        setRoleTableLoadingFlag(true)

        const params = {
            "start": (options.page - 1) * options.length,
            "length": options.length,
            "search": encodeURIComponent(options.search!),
            "sort": Array.isArray(options.order) && options.order.length > 0 ? options.order[0] : null,
            "dir": Array.isArray(options.order) && options.order.length > 0 ? options.order[1] : null,
        };
        setRoleAttributeTable(options);

        const response = await apiRequest('get', "/command/role.json", params);
        if (HTTP_CODE.OK === response.status) {
            setRoleArray(response.data);
            setRoleDataTotalTable(response.total);
            setRoleOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    map[obj.id] = { "viewedButtonFlag": false, "menuButtonFlag": false, "deletedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setRoleTableLoadingFlag(false);
    };

    const viewRole = async (id: number) => {
        setRoleId(id);
        setRoleForm(roleInitial);
        setRoleStateModal("view");
        setRoleOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/command/${id}/role.json`);
        if (HTTP_CODE.OK === response.status) {
            const role = response.data;

            setRoleId(role.id);
            setRoleForm({
                name: role.name,
                description: role.description,
                version: role.version,
            });

            setRoleEntryModal({
                ...roleEntryModal,
                title: role.name,
                submitLabel: t("text.edit"),
                submitIcon: "fa-solid fa-pen",
                submitLoadingFlag: false,
            });

            setModalRole(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setRoleOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: false,
            },
        }));
    };

    const entryRole = (haveContentFlag: boolean) => {
        setRoleStateModal("entry");
        setRoleFormError({});
        if (haveContentFlag) {
            setRoleEntryModal({
                ...roleEntryModal,
                title: roleForm.name,
                submitLabel: t("text.update"),
                submitIcon: "fa-solid fa-repeat",
                submitLoadingFlag: false,
            });
        } else {
            setRoleId(0);
            setRoleForm(roleInitial);
            setRoleEntryModal({
                ...roleEntryModal,
                title: t("text.createNew"),
                submitLabel: t("text.save"),
                submitIcon: "fa-solid fa-bookmark",
                submitLoadingFlag: false,
            });

            setModalRole(true);
        }
    };

    const confirmStoreRole = async () => {
        if (roleValidate(roleForm)) {
            dialog.show({
                type: 'confirmation',
                message: t(roleId === 0 ? "confirmation.create" : "confirmation.update", { name: roleForm.name }),
                onConfirm: () => storeRole(),
            });
        }
    };

    const storeRole = async () => {
        if (roleValidate(roleForm)) {
            setRoleEntryModal({ ...roleEntryModal, submitLoadingFlag: true });

            const response = await apiRequest(
                roleId === 0 ? 'post' : 'patch',
                roleId === 0 ? '/command/role.json' : `/command/${roleId}/role.json`,
                roleForm,
            );

            if (HttpStatusCode.Ok === response.status || HttpStatusCode.Created === response.status) {
                getRole(roleAttributeTable);
                toast.show({ type: "done", message: HttpStatusCode.Created === response.status ? "information.created" : "information.updated" });
                setModalRole(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setRoleEntryModal({ ...roleEntryModal, submitLoadingFlag: false });
        }
    }

    const confirmDeleteRole = (id: number, name?: string) => {
        dialog.show({
            type: 'warning',
            message: t("confirmation.delete", { name: name }),
            onConfirm: () => deleteRole(id),
        });
    };

    const deleteRole = async (id: number) => {
        setModalRole(false);
        setRoleOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                deletedButtonFlag: true,
            },
        }));

        const response = await apiRequest('delete', `/command/${id}/role.json`)
        if (HttpStatusCode.NoContent === response.status) {
            getRole(roleAttributeTable);
            toast.show({ type: "done", message: "information.deleted" });
        } else {
            toast.show({ type: "error", message: response.message });
        }

        setRoleOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                deletedButtonFlag: false,
            },
        }));
    };

    const [menuArray, setMenuArray] = useState<Array<{ key: number; value: string }>>([]);


    const viewMenu = async (id: number) => {
        setRoleId(id);
        setRoleOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                menuButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/command/${id}/role-menu.json`);
        if (HTTP_CODE.OK === response.status) {
            const role_menu = response.data;
            setRoleId(id);
            setMenuArray(role_menu);

            setModalMenu(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setRoleOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                menuButtonFlag: false,
            },
        }));
    };

    const [modalRole, setModalRole] = useState(false);
    const [modalMenu, setModalMenu] = useState(false);

    return (
        <div className='container-column'>
            <ModalStackProvider>
                <Modal
                    show={modalRole}
                    size="md"
                    title={roleEntryModal.title}
                    onClose={() => setModalRole(false)}
                    buttonArray={[
                        "entry" === roleStateModal && ({
                            label: roleEntryModal.submitLabel,
                            type: "primary",
                            icon: roleEntryModal.submitIcon,
                            onClick: () => confirmStoreRole(),
                            loadingFlag: roleEntryModal.submitLoadingFlag
                        }),
                        "view" === roleStateModal && ({
                            label: roleEntryModal.submitLabel,
                            type: "primary",
                            icon: roleEntryModal.submitIcon,
                            onClick: () => entryRole(true),
                            loadingFlag: false
                        })
                    ].filter(Boolean) as ButtonArray}
                >
                    <div className="container-grid-2-2-1">
                        {
                            "entry" === roleStateModal
                            && <Fragment>
                                <InputText autoFocus={true} label={t("text.name")} name="name" value={roleForm.name} onChange={onRoleFormChange} error={roleFormError.name} />
                                <TextArea label={t("text.description")} name="description" rows={1} value={roleForm.description} onChange={onRoleFormChange} error={roleFormError.description} />
                            </Fragment>
                        }
                        {
                            "view" === roleStateModal
                            && <Fragment>
                                <Label text={t("text.name")} value={roleForm.name} />
                                <Label text={t("text.description")} value={roleForm.description} />
                            </Fragment>
                        }
                    </div>
                </Modal>
                <Modal
                    show={modalMenu}
                    size="md"
                    type="dynamic"
                    background='secondary'
                    title={roleEntryModal.title}
                    onClose={() => setModalMenu(false)}
                    buttonArray={[
                        {
                            label: roleEntryModal.submitLabel,
                            type: "primary",
                            icon: roleEntryModal.submitIcon,
                            onClick: () => confirmStoreRole(),
                            loadingFlag: roleEntryModal.submitLoadingFlag
                        }
                    ]}
                >
                    <div className="container-column">
                        <RootTree
                            checkBoxFlag={true}
                            data={menuArray}
                        />
                    </div>
                </Modal>
            </ModalStackProvider>
            <Table
                labelNewButton={t("text.createNew")}
                onNewButtonClick={() => entryRole(false)}

                dataArray={roleArray}
                columns={[
                    {
                        data: "name",
                        name: t("text.name"),
                        orderable: true,
                        minDevice: 'mobile',
                    },
                    {
                        data: "description",
                        name: t("text.description"),
                        minDevice: 'tablet',
                    },
                    {
                        data: "createdBy",
                        name: t("text.createdBy"),
                        width: 10,
                        minDevice: "none"
                    },
                    {
                        data: "createdDate",
                        name: t("text.createdDate"),
                        width: 15,
                        orderable: true,
                        minDevice: "none",
                        render: function (data) {
                            return formatDate(new Date(data), "dd MMM yyyy HH:mm:ss")
                        }
                    },
                    {
                        data: "id",
                        name: t("text.option"),
                        position: 'center',
                        render: function (data, row) {
                            return (
                                <div className="flex flex-col tablet:flex-row justify-center gap-element">
                                    <Button
                                        label={t("text.view")}
                                        type='primary'
                                        icon="fa-solid fa-list"
                                        onClick={() => viewRole(data)}
                                        loadingFlag={roleOptionColumnTable[data]?.viewedButtonFlag}
                                    />
                                    <Button
                                        label={t("text.menu")}
                                        type='primary'
                                        icon="fa-solid fa-chart-diagram"
                                        onClick={() => viewMenu(data)}
                                        loadingFlag={roleOptionColumnTable[data]?.menuButtonFlag}
                                    />
                                    <Button
                                        label={t("text.delete")}
                                        type='danger'
                                        icon="fa-solid fa-trash"
                                        onClick={() => confirmDeleteRole(data, row.name)}
                                        loadingFlag={roleOptionColumnTable[data]?.deletedButtonFlag}
                                    />
                                </div>
                            )
                        }
                    }
                ]}
                order={["createdDate", "desc"]}

                dataTotal={roleDataTotalTable}
                onRender={(page, length, search, order) => {
                    getRole({ page: page, length: length, search: search, order: order })
                }}
                loadingFlag={roleTableLoadingFlag}
            />
        </div>
    )
}