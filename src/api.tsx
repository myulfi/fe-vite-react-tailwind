import axios from 'axios'
import type { AxiosError, AxiosResponse } from 'axios'
import { HTTP_CODE, LOCAL_STORAGE, METHOD } from './constants/common-constants'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

type HttpMethod = number
type ParamsType = Record<string, any> | FormData | null

const getAuthHeader = (contentType: string) => ({
    'Content-Type': contentType,
    'Authorization': `Bearer ${localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN)}`
})

const apiRequest = async (
    method: HttpMethod,
    url: string,
    params?: ParamsType
): Promise<any> => {
    let result: any = null
    let attempt = 0

    do {
        try {
            const contentType =
                params instanceof FormData ? 'multipart/form-data' : 'application/json'

            const headers = getAuthHeader(contentType)

            let response: AxiosResponse

            switch (method) {
                case METHOD.GET:
                    response = await api.get(url, { headers, params })
                    break

                // Uncomment if needed later
                // case CommonConstants.METHOD.GET_BLOB:
                //   response = await api.get(url, {
                //     headers: {
                //       ...getAuthHeader('text/csv'),
                //     },
                //     params,
                //     responseType: 'blob'
                //   })
                //   break

                case METHOD.POST:
                    response = await api.post(url, params, { headers })
                    break

                case METHOD.PUT:
                    response = await api.put(url, params, { headers })
                    break

                case METHOD.PATCH:
                    response = await api.patch(url, params, { headers })
                    break

                case METHOD.DELETE:
                    response = await api.delete(url, { headers })
                    break

                default:
                    throw new Error('HTTP method not supported.')
            }

            result = {
                ...response.data,
                status: response.status
            }

        } catch (error) {
            const err = error as AxiosError
            const response = err.response as AxiosResponse<{ message?: string }>;

            result = {
                status: response?.status || 500,
                message: response?.data?.message || err.message || 'Unknown error'
            }
        }

        if ('/generate-token.json' === url) break;

        if (
            attempt === 0
            && result.status === HTTP_CODE.UNAUTHORIZED
        ) {
            try {
                const refreshResponse = await api.post(
                    '/refresh-token.json',
                    null,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem(LOCAL_STORAGE.REFRESH_TOKEN)}`
                        }
                    }
                )

                if (refreshResponse.data.status === HTTP_CODE.OK) {
                    const { accessToken, refreshToken, user } = refreshResponse.data.data

                    localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, accessToken)
                    localStorage.setItem(LOCAL_STORAGE.REFRESH_TOKEN, refreshToken)
                    localStorage.setItem(LOCAL_STORAGE.NAME, user.nickName)
                    localStorage.setItem(LOCAL_STORAGE.ROLE, user.roleList)
                }
            } catch {
                localStorage.removeItem(LOCAL_STORAGE.ACCESS_TOKEN)
                localStorage.removeItem(LOCAL_STORAGE.REFRESH_TOKEN)
                localStorage.removeItem(LOCAL_STORAGE.NAME)
                localStorage.removeItem(LOCAL_STORAGE.ROLE)
                // Optionally redirect to login or reload
                window.location.reload()
            }
        }

        attempt++

    } while (
        attempt < 2 &&
        result.status === HTTP_CODE.UNAUTHORIZED
    )

    return result
}

export { api, apiRequest }
