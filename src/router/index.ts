import {createRouter, createWebHistory} from "vue-router";
import Login from "@/views/Login.vue";
import Management from "@/views/management/Management.vue";
import Home from "@/views/management/Home.vue";
import GradeSearch from "@/views/management/grade/GradeSearch.vue";
import ForgetPassword from "@/views/ForgetPassword.vue";
import GradeStatistics from "@/views/management/grade/GradeStatistics.vue";
import StudentManagement from "@/views/management/user/StudentManagement.vue";
import TeacherManagement from "@/views/management/user/TeacherManagement.vue";
import FacultyManagement from "@/views/management/faculty/FacultyManagement.vue";
import MajorManagement from "@/views/management/major/MajorManagement.vue";
import ClassManagement from "@/views/management/class/ClassManagement.vue";

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
                }, {
                    path: "/management/grade/statistics",
                    component: GradeStatistics,
                    name: "GradeStatistics"
                }]
            }, {
                path: "/management/student",
                children: [{
                    path: "/management/student/management",
                    component: StudentManagement,
                    name: "StudentManagement"
                }]
            }, {
                path: "/management/teacher",
                children: [{
                    path: "/management/teacher/management",
                    component: TeacherManagement,
                    name: "TeacherManagement"
                }]
            }, {
                path: "/management/faculty",
                children: [{
                    path: "/management/faculty/management",
                    component: FacultyManagement,
                    name: "FacultyManagement"
                }]
            }, {
                path: "/management/major",
                children: [{
                    path: "/management/major/management",
                    component: MajorManagement,
                    name: "MajorManagement"
                }]
            }, {
                path: "/management/class",
                children: [{
                    path: "/management/class/management",
                    component: ClassManagement,
                    name: "ClassManagement"
                }]
            }]
        }
    ]
});

export default router;