import {createRouter, createWebHistory} from "vue-router";
import Login from "@/views/Login.vue";
import Management from "@/views/management/Management.vue";
import Home from "@/views/management/Home.vue";
import GradeSearch from "@/views/management/grade/GradeSearch.vue";

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
                }]
            }]
        }
    ]
});

export default router;