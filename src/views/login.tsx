import logo from '../assets/react.svg'
import { useState } from 'react';
import { apiRequest } from '../api';
import * as CommonConstants from '../constants/commonConstants';

export default function Login() {
    const loginInitial = {
        username: ''
        , password: ''
    };

    const [loginForm, setLoginForm] = useState(loginInitial);
    const [loginFormError, setLoginFormError] = useState([]);
    const [loginLoadingFlag, setLoginLoadingFlag] = useState(false);

    const onLoginFormChange = (e: any) => {
        const { name, value } = e.target;
        setLoginForm({ ...loginForm, [name]: value });
        setLoginFormError([]);
    };

    const loginValidate = (data: object) => {
        let error = null;
        if (!data.username.trim() || data.username.trim().length === 0) error = 'Username is required';
        else if (!data.password.trim() || data.password.trim().length === 0) error = 'Password is required';
        setLoginFormError(error);
        return error == null;
    };

    const doLogin = async (e: any) => {
        e.preventDefault()
        if (loginValidate(loginForm)) {
            setLoginLoadingFlag(true);

            try {
                const response = await apiRequest(
                    CommonConstants.METHOD_IS_POST,
                    '/generate-token.json',
                    JSON.stringify({
                        username: btoa(unescape(encodeURIComponent(
                            btoa(unescape(encodeURIComponent(
                                btoa(unescape(encodeURIComponent(
                                    loginForm.username
                                )))
                            )))
                        )))
                        , password: btoa(unescape(encodeURIComponent(
                            btoa(unescape(encodeURIComponent(
                                btoa(unescape(encodeURIComponent(
                                    btoa(unescape(encodeURIComponent(
                                        loginForm.password
                                    )))
                                )))
                            )))
                        )))
                    })
                )

                if (response?.data.status === "success") {
                    localStorage.setItem("accessToken", response.data.data.token);
                    window.location.reload();
                } else {
                    setLoginFormError(response?.data.message);
                }
            } catch (error: any) {
                setLoginFormError(error);
            } finally {
                setLoginLoadingFlag(false);
            }
        }
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="Your Company"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                    className="mx-auto h-10 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form action="#" method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={loginForm.username} onChange={onLoginFormChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                            Password
                        </label>
                        <div className="mt-2">
                            <input id="password"
                                name="password"
                                type="password"
                                value={loginForm.password} onChange={onLoginFormChange}
                                autoComplete="current-password"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            disabled={loginLoadingFlag} onClick={(e) => doLogin(e)}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <span className="bi-arrow-right-square">&nbsp;&nbsp;Login</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}