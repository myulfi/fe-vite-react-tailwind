import axios from "axios";
import * as CommonConstants from "../constants/commonConstants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
    , headers: {
        'Content-Type': 'application/json'
    }
})

const apiRequest = (method: number, url: string, params?: string) => {
    if (CommonConstants.METHOD_IS_GET === method) {
        return api.get(
            url
            , {
                headers: {
                    'Content-Type': 'application/json'
                    , 'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                }
                , params: params
            })
    } else if (CommonConstants.METHOD_IS_POST === method) {
        return api.post(
            url
            , params
            , {
                headers: {
                    'Content-Type': 'application/json'
                    , 'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                }
            }
        )
    } else if (CommonConstants.METHOD_IS_PUT === method) {
        return api.put(
            url
            , params
            , {
                headers: {
                    'Content-Type': 'application/json'
                    , 'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                }
            }
        )
    } else if (CommonConstants.METHOD_IS_PATCH === method) {
        return api.patch(
            url
            , params
            , {
                headers: {
                    'Content-Type': 'application/json'
                    , 'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                }
            }
        )
    } else if (CommonConstants.METHOD_IS_DELETE === method) {
        return api.delete(
            url
            , {
                headers: {
                    'Content-Type': 'application/json'
                    , 'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                }
            }
        )
    } else {
        return null
    }
};

export { apiRequest }