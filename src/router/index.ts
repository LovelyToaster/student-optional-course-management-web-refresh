import {createRouter, createWebHistory} from "vue-router";
import Login from "@/views/Login.vue";
import Management from "@/views/manangment/Management.vue";
import apiInstance from "@/hooks/api";
import code from "@/hooks/code";
import {notification} from "ant-design-vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/login",
            component: Login
        },
        {
            path: "/management",
            component: Management
        }
    ]
});

const setErrorNotification = ({
    message: null,
    description: null
})

const showErrorNotification = (message: string, description: string) => {
    notification.error({
        message,
        description,
    });
};

async function loginVerify() {
    return apiInstance
        .get("/user/status")
        .then((res) => {
            if (res.data.code === code.LOGIN_FAILED) {
                setErrorNotification.message = "错误";
                setErrorNotification.description = res.data.message;
                return false;
            } else if (res.data.code === code.LOGIN_SUCCESS) {
                return true;
            } else {
                setErrorNotification.message = "错误";
                setErrorNotification.description = "未知错误";
                return false;
            }
        })
        .catch((error) => {
            console.error("API 请求失败:", error);
            setErrorNotification.message = "错误";
            setErrorNotification.description = "网络请求失败，请稍后再试";
            return false;
        });
}


router.beforeEach(async (to, from) => {
    const isLogin = await loginVerify();
    if (!isLogin && to.path != "/login") {
        showErrorNotification(setErrorNotification.message, setErrorNotification.description)
        return {path: "/login"}
    } else if (isLogin && to.path == "/login") {
        return {path: "/management"}
    }
})

export default router;