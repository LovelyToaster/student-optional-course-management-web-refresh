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
        if (response.data.code === code.SERVICE_FAILED)
            notification.error({
                message: response.data.message,
                description: response.data.data,
            });
        if (response.data.code === code.LOGIN_FAILED && window.location.pathname != "/login") {
            notification.error({
                message: "失败",
                description: response.data.message,
            });
            window.location.pathname = "/login"
        }
        return response;
    },
);
export default apiInstance;