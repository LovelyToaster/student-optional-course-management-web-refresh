import axios from "axios";
import code from "./code";
import {notification} from "ant-design-vue";

let isFailed = false
const apiInstance = axios.create({
    baseURL: 'http://localhost:8080',
});
apiInstance.defaults.headers.common["Content-Type"] = "application/x-www-form-urlencoded"
apiInstance.defaults.withCredentials = true
apiInstance.interceptors.response.use(
    (response) => {
        if (response.data.code === code.TOKEN_EXPIRED && !isFailed) {
            notification.error({
                message: "失败",
                description: response.data.message,
            });
            isFailed = true
            setTimeout(() => {
                window.location.pathname = '/login'
            }, 3000)
            return Promise.reject(new Error("token expired"))
        }
        if (response.data.code === code.NO_LOGIN && window.location.pathname !== "/login" && !isFailed) {
            notification.error({
                message: "失败",
                description: response.data.message,
            });
            isFailed = true
            setTimeout(() => {
                window.location.pathname = '/login'
            }, 3000)
            return Promise.reject(new Error("no login"))
        }
        isFailed = false
        return response;
    },
    (error) => {
        const config = error.config;

        if (config.skipInterceptor) {
            return Promise.reject(error);
        }
        if (error.response.status === 500) {
            notification.error({
                message: error.response.data.message,
                description: error.response.data.data,
            });
        }
        if (error.response.status === 409) {
            notification.error({
                message: error.response.data.message,
                description: error.response.data.data,
            });
        }
        return Promise.reject(error);
    }
);
export default apiInstance;