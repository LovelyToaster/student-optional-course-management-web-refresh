import {createRouter, createWebHistory} from "vue-router";
import Login from "@/views/Login.vue";
import Management from "@/views/manangment/Management.vue";
import apiInstance from "@/hooks/api";
import code from "@/hooks/code";
import {notification} from "ant-design-vue";
import useLoginStore from "@/store";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            redirect: "/login"
        },
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

const setSuccessNotification = ({
    message: null,
    description: null
})

const showErrorNotification = (message: string, description: string) => {
    notification.error({
        message,
        description,
    });
};

const showSuccessNotification = (message: string, description: string) => {
    notification.success({
        message,
        description,
    });
};

async function loginVerify() {
    const loginStore=useLoginStore()
    return apiInstance
        .get("/user/status")
        .then((res) => {
            if (res.data.code === code.LOGIN_FAILED) {
                setErrorNotification.message = "错误";
                setErrorNotification.description = res.data.message;
                return false;
            } else if (res.data.code === code.LOGIN_SUCCESS) {
                loginStore.userInfo.userName = res.data.data.userName;
                loginStore.userInfo.permissions = res.data.data.permissions;
                loginStore.userInfo.avatarPath = res.data.data.avatarPath;
                setSuccessNotification.message="成功";
                setSuccessNotification.description="登录成功";
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
        showSuccessNotification(setSuccessNotification.message, setSuccessNotification.description)
        return {path: "/management"}
    }
})

export default router;