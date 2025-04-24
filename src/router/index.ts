import {createRouter, createWebHistory} from "vue-router";
import Login from "@/views/Login.vue";
import Management from "@/views/management/Management.vue";
import Home from "@/views/management/Home.vue";
import GradeSearch from "@/views/management/grade/GradeSearch.vue";
import ForgetPassword from "@/views/ForgetPassword.vue";
import GradeStatistics from "@/views/management/grade/GradeStatistics.vue";

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
            path: "/forgetPassword",
            component: ForgetPassword
        },
        {
            path: "/management",
            component: Management,
            children: [{
                path: "/management/home",
                component: Home,
                name: "Home"
            }, {
                path: "/management/grade",
                children: [{
                    path: "/management/grade/search",
                    component: GradeSearch,
                    name: "GradeSearch"
                },{
                    path: "/management/grade/statistics",
                    component: GradeStatistics,
                    name: "GradeStatistics"
                }]
            }]
        }
    ]
});

export default router;