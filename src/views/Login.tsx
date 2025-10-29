import { useTranslation } from "react-i18next"
import { HTTP_CODE, LOCAL_STORAGE } from "../constants/common-constants"
import { useState } from "react"
import { apiRequest } from "../api"
import InputText from "../components/form/InputText"
import InputPassword from "../components/form/InputPassword"
import Button from "../components/form/Button"

export default function Login() {
    const { t } = useTranslation()

    interface LoginFormData {
        username: string;
        password: string;
    }

    const loginInitial = {
        username: '',
        password: '',
    }

    const [loginForm, setLoginForm] = useState(loginInitial)
    const [loginFormError, setLoginFormError] = useState<string | null>(null)
    const [loginLoadingFlag, setLoginLoadingFlag] = useState(false)

    const onLoginFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginForm({ ...loginForm, [name]: value });
        setLoginFormError(null);
    };

    const loginValidate = (data: LoginFormData) => {
        let error = null;
        if (!data.username.trim()) error = t("validate.required", { name: t("text.username") })
        else if (!data.password.trim()) error = t("validate.required", { name: t("text.password") })
        setLoginFormError(error)
        return error == null
    };

    const doLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (loginValidate(loginForm)) {
            setLoginLoadingFlag(true)

            try {
                const response = await apiRequest(
                    'post',
                    '/generate-token.json',
                    {
                        // username: btoa(unescape(encodeURIComponent(
                        //     btoa(unescape(encodeURIComponent(
                        //         btoa(unescape(encodeURIComponent(
                        //             loginForm.username
                        //         )))
                        //     )))
                        // ))),
                        // password: btoa(unescape(encodeURIComponent(
                        //     btoa(unescape(encodeURIComponent(
                        //         btoa(unescape(encodeURIComponent(
                        //             btoa(unescape(encodeURIComponent(
                        //                 loginForm.password
                        //             )))
                        //         )))
                        //     )))
                        // )))
                        username: loginForm.username,
                        password: loginForm.password,
                    }
                )

                if (HTTP_CODE.OK === response.status) {
                    const data = response.data;
                    localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, data.accessToken)
                    localStorage.setItem(LOCAL_STORAGE.REFRESH_TOKEN, data.refreshToken)
                    localStorage.setItem(LOCAL_STORAGE.NAME, data.user.nickName)
                    localStorage.setItem(LOCAL_STORAGE.ROLE, data.user.roleList)
                    window.location.reload()
                } else {
                    setLoginFormError(t(response.message));
                }
            } catch (error: any) {
                setLoginFormError(error?.message || t("error.unknown"));
            } finally {
                setLoginLoadingFlag(false);
            }
        }
    }

    return (
        <div className="h-screen flex justify-between">
            <div
                className="flex-1 max-sm:hidden flex items-center justify-center"
                style={{
                    inset: 0,
                    // top: 62,
                    backgroundImage: "url('https://plus.unsplash.com/premium_photo-1687864550351-6351804c91b7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundBlendMode: "overlay",
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    opacity: 0.4, // ubah sesuai kebutuhan
                    color: 'white',
                    zIndex: -1
                }
                }
            >
                {/* {import.meta.env.VITE_APP_TITLE} */}
            </div >
            <div className="bg-light-clear dark:bg-dark-clear text-light-base-line dark:text-dark-base-line w-[360px] max-sm:w-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold tracking-tight">{import.meta.env.VITE_APP_TITLE}</h2>
                <div className="px-10 w-full">
                    <form className="mt-10 flex flex-col gap-4">
                        <InputText name="username" label={t("text.username")} value={loginForm.username} onChange={onLoginFormChange} />
                        <InputPassword name="password" label={t("text.password")} value={loginForm.password} onChange={onLoginFormChange} />
                        <Button label={t("text.login")} type="primary" icon="fa-solid fa-right-to-bracket" onClick={(e: React.MouseEvent<HTMLButtonElement>) => doLogin(e)} loadingFlag={loginLoadingFlag} />
                    </form>
                </div>
                {loginFormError && <div className="form-floating mt-3 text-danger">{loginFormError}</div>}
                <p className="mt-5 mb-3 text-sm">&copy; {new Date().getFullYear()}</p>
            </div>
        </div >
    )
}