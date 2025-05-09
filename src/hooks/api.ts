import axios from "axios";
import code from "./code";
import {notification} from "ant-design-vue";

const apiInstance = axios.create({
    baseURL: 'http://localhost:8080',
});
apiInstance.defaults.headers.common["Content-Type"] = "application/x-www-form-urlencoded"
apiInstance.defaults.withCredentials = true
apiInstance.interceptors.response.use(
    (response) => {
        if (response.data.code === code.LOGIN_FAILED && window.location.pathname != "/login") {
            notification.error({
                message: "失败",
                description: response.data.message,
            });
            window.location.pathname = "/login"
        }
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
        return Promise.reject(error);
    }
);
export default apiInstance;