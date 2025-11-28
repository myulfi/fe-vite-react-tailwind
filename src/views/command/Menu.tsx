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
import Tree from "../../components/form/Tree";

export default function Menu() {
    const { t } = useTranslation();

    type MenuData = {
        languageTypeId: number;
        keyCode: string;
        version: number;
        value: {
            languageId: number;
            value: string;
        }[];
    }

    type MenuFormError = {
        languageTypeId?: string;
        keyCode?: string;
        version?: string;
        value?: Record<string, string>;
    };

    const languageInitial: MenuData = {
        languageTypeId: 1,
        keyCode: "",
        version: 0,
        value: []
    }

    const [languageStateModal, setMenuStateModal] = useState<ModalCategory>("entry");

    const languageFilterTableInitial = {
        value: 0,
        date: "",
        range: 0,
    };

    const [languageFilterTable, setMenuFilterTable] = useState(languageFilterTableInitial);

    const onMenuFilterTableChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setMenuFilterTable(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const [languageBulkOptionLoadingFlag, setMenuBulkOptionLoadingFlag] = useState(false);
    const [languageCheckBoxTableArray, setMenuCheckBoxTableArray] = useState<(string | number)[]>([]);
    const [languageOptionColumnTable, setMenuOptionColumnTable] = useState<{ [id: number]: OptionColumn; }>({});
    const [languageAttributeTable, setMenuAttributeTable] = useState<TableOptions>({
        page: 1,
        length: 10,
        search: '',
        order: []
    });
    const [languageDataTotalTable, setMenuDataTotalTable] = useState(0);
    const [languageTableLoadingFlag, setMenuTableLoadingFlag] = useState(false);

    const [languageArray, setMenuArray] = useState([]);

    const [languageEntryModal, setMenuEntryModal] = useState<ModalType>({
        title: "",
        submitLabel: "",
        submitClass: "",
        submitIcon: "",
        submitLoadingFlag: false,
    });

    const [languageId, setMenuId] = useState(0);
    const [languageForm, setMenuForm] = useState<MenuData>(languageInitial);
    const [languageFormError, setMenuFormError] = useState<MenuFormError>({});

    const onMenuFormChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [name_parameter, name_index] = name.split(".", 2);
            setMenuForm(prev => ({
                ...prev,
                [name_parameter]: (prev as any)[name_parameter]?.map((item: any) =>
                    item.languageId === Number(name_index)
                        ? { ...item, value: value }
                        : item
                ),
            }));

            setMenuFormError(prev => ({
                ...prev,
                [name_parameter]: {
                    ...(prev as any)[name_parameter],
                    [name_index]: undefined,
                },
            }));
        } else {
            setMenuForm({ ...languageForm, [name]: value });
            setMenuFormError({ ...languageFormError, [name]: undefined });
        }
    };

    const languageValidate = (data: MenuData) => {
        const error: MenuFormError = {};

        if (!data.keyCode?.trim()) error.keyCode = t("validate.required", { name: t("text.keyCode") });
        masterMenuArray.forEach((masterMenu, index) => {
            if (!data.value[`${index}`]?.value) {
                if (!error.value) error.value = {};
                error.value[`${masterMenu.key}`] = t("validate.required", { name: masterMenu.value });
            }
        });
        setMenuFormError(error);
        return Object.keys(error).length === 0;
    };

    useEffect(() => {
        getMasterMenu();
        getMasterMenuType();
    }, []);

    const [masterMenuArray, setMasterMenuArray] = useState<Array<{ key: number; value: string }>>([]);
    const [masterMenuTypeArray, setMasterMenuTypeArray] = useState<Array<{ key: number; value: string }>>([]);
    const getMasterMenu = async () => {
        const response = await apiRequest('get', '/main/menu.json')
        if (HTTP_CODE.OK === response.status) {
            setMasterMenuArray(response.data)
        }
    }

    const getMasterMenuType = async () => {
        const response = await apiRequest('get', '/master/language-type.json')
        if (HTTP_CODE.OK === response.status) {
            setMasterMenuTypeArray(response.data)
        }
    }

    const getMenu = async (options: TableOptions) => {
        setMenuTableLoadingFlag(true)

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
        setMenuAttributeTable(options);

        const response = await apiRequest('get', "/command/language.json", params);
        if (HTTP_CODE.OK === response.status) {
            setMenuArray(response.data);
            setMenuDataTotalTable(response.total);
            setMenuOptionColumnTable(
                response.data.reduce(function (map: Record<string, any>, obj: any) {
                    //map[obj.id] = obj.name
                    map[obj.id] = { "viewedButtonFlag": false, "deletedButtonFlag": false }
                    return map
                }, {})
            );
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setMenuTableLoadingFlag(false);
    };

    const viewMenu = async (id: number) => {
        setMenuId(id);
        setMenuForm(languageInitial);
        setMenuStateModal("view");
        setMenuOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: true,
            },
        }));

        const response = await apiRequest('get', `/command/${id}/language.json`);
        if (HTTP_CODE.OK === response.status) {
            const language = response.data;

            setMenuId(language.id);
            setMenuForm({
                languageTypeId: language.languageTypeId,
                keyCode: language.keyCode,
                version: language.version,
                value: language.value,
            });

            setMenuEntryModal({
                ...languageEntryModal,
                title: language.name,
                submitLabel: t("text.edit"),
                submitIcon: "fa-solid fa-pen",
                submitLoadingFlag: false,
            });

            setModalMenu(true);
        } else {
            toast.show({ type: 'error', message: response.message });
        }

        setMenuOptionColumnTable(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                viewedButtonFlag: false,
            },
        }));
    };

    const entryMenu = (haveContentFlag: boolean) => {
        setMenuStateModal("entry");
        setMenuFormError({});
        if (haveContentFlag) {
            setMenuEntryModal({
                ...languageEntryModal,
                title: languageForm.keyCode,
                submitLabel: t("text.update"),
                submitIcon: "fa-solid fa-repeat",
                submitLoadingFlag: false,
            });
        } else {
            setMenuId(0);
            setMenuForm({
                ...languageInitial,
                value: masterMenuArray.map((item: any) => ({
                    languageId: item.key,
                    value: ""
                })),
            });
            setMenuEntryModal({
                ...languageEntryModal,
                title: t("text.createNew"),
                submitLabel: t("text.save"),
                submitIcon: "fa-solid fa-bookmark",
                submitLoadingFlag: false,
            });

            setModalMenu(true);
        }
    };

    const confirmStoreMenu = async () => {
        if (languageValidate(languageForm)) {
            dialog.show({
                type: 'confirmation',
                message: t(languageId === 0 ? "confirmation.create" : "confirmation.update", { name: languageForm.keyCode }),
                onConfirm: () => storeMenu(),
            });
        }
    };

    const storeMenu = async () => {
        if (languageValidate(languageForm)) {
            setMenuEntryModal({ ...languageEntryModal, submitLoadingFlag: true });

            const response = await apiRequest(
                languageId === 0 ? 'post' : 'patch',
                languageId === 0 ? '/command/language.json' : `/command/${languageId}/language.json`,
                languageForm,
            );

            if (HttpStatusCode.Ok === response.status || HttpStatusCode.Created === response.status) {
                getMenu(languageAttributeTable);
                toast.show({ type: "done", message: HttpStatusCode.Created === response.status ? "information.created" : "information.updated" });
                setModalMenu(false);
            } else {
                toast.show({ type: "error", message: response.message });
            }

            setMenuEntryModal({ ...languageEntryModal, submitLoadingFlag: false });
        }
    }

    const confirmDeleteMenu = (id?: number, name?: string) => {
        if (id !== undefined) {
            dialog.show({
                type: 'warning',
                message: t("confirmation.delete", { name: name }),
                onConfirm: () => deleteMenu(id),
            });
        } else {
            if (languageCheckBoxTableArray.length > 0) {
                dialog.show({
                    type: 'warning',
                    message: t("confirmation.delete", { name: t("text.amountItem", { amount: languageCheckBoxTableArray.length }) }),
                    onConfirm: () => deleteMenu(),
                });
            } else {
                dialog.show({
                    type: 'alert',
                    message: t("validate.pleaseTickAtLeastAnItem")
                });
            }
        }
    };

    const deleteMenu = async (id?: number) => {
        setModalMenu(false);
        if (id !== undefined) {
            setMenuOptionColumnTable(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    deletedButtonFlag: true,
                },
            }));
        } else {
            setMenuBulkOptionLoadingFlag(true);
        }

        const response = await apiRequest('delete', `/command/${id !== undefined ? id : languageCheckBoxTableArray.join("")}/language.json`)
        if (HttpStatusCode.NoContent === response.status) {
            getMenu(languageAttributeTable);
            if (id === undefined) {
                setMenuCheckBoxTableArray([]);
            }
            toast.show({ type: "done", message: "information.deleted" });
        } else {
            toast.show({ type: "error", message: response.message });
        }

        if (id !== undefined) {
            setMenuOptionColumnTable(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    deletedButtonFlag: false,
                },
            }));
        } else {
            setMenuBulkOptionLoadingFlag(false);
        }
    };



    const [modalMenu, setModalMenu] = useState(false);

    return (
        <div className="container-column">
            <ModalStackProvider>
                <Modal
                    show={modalMenu}
                    size="sm"
                    title={languageEntryModal.title}
                    onClose={() => setModalMenu(false)}
                    buttonArray={[
                        "entry" === languageStateModal && ({
                            label: languageEntryModal.submitLabel,
                            type: "primary",
                            icon: languageEntryModal.submitIcon,
                            onClick: () => confirmStoreMenu(),
                            loadingFlag: languageEntryModal.submitLoadingFlag
                        }),
                        "view" === languageStateModal && ({
                            label: languageEntryModal.submitLabel,
                            type: "primary",
                            icon: languageEntryModal.submitIcon,
                            onClick: () => entryMenu(true),
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
                                    onChange={onMenuFormChange}
                                    positionUnit='left'
                                    nameUnit='languageTypeId'
                                    valueUnit={languageForm.languageTypeId}
                                    valueUnitList={masterMenuTypeArray}
                                    onChangeUnit={onMenuFormChange}
                                    error={languageFormError.keyCode} />
                                {
                                    masterMenuArray.map((masterMenu, index) => {
                                        return (
                                            <InputText
                                                key={`${masterMenu.key}`}
                                                label={masterMenu.value}
                                                name={`value.${`${masterMenu.key}`}`}
                                                value={languageForm.value?.[index]?.value || ''}
                                                onChange={onMenuFormChange}
                                                error={languageFormError.value?.[`${masterMenu.key}`]}
                                            />
                                        );
                                    })
                                }
                            </Fragment>
                        }
                        {
                            "view" === languageStateModal
                            && <Fragment>
                                <Label text={t("text.keyCode")} value={`${masterMenuTypeArray.getValueByKey?.(languageForm.languageTypeId)}.${languageForm.keyCode}`} />
                                {
                                    masterMenuArray.map((masterMenu, index) => {
                                        return (
                                            <Label
                                                key={index}
                                                text={masterMenu.value}
                                                value={languageForm.value?.[index]?.value || ''}
                                            />
                                        );
                                    })
                                }
                            </Fragment>
                        }
                    </div>
                </Modal>
            </ModalStackProvider>
            <Tree
                data={masterMenuArray} />
        </div>
    )
}