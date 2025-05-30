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
import CourseManagement from "@/views/management/course/CourseManagement.vue";
import UserCenter from "@/views/management/user/UserCenter.vue";
import CourseTask from "@/views/management/course/CourseTask.vue";
import CourseOptional from "@/views/management/course/CourseOptional.vue";
import GradeInput from "@/views/management/grade/GradeInput.vue";
import GradeStatisticsTeacher from "@/views/management/grade/GradeStatisticsTeacher.vue";
import CourseScheduleManagement from "@/views/management/course/CourseScheduleManagement.vue";
import CourseScheduleDisplay from "@/views/management/course/CourseScheduleDisplay.vue";
import PermissionsManagement from "@/views/management/user/PermissionsManagement.vue";

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
                }, {
                    path: "/management/grade/input",
                    component: GradeInput,
                    name: "GradeInput"
                }, {
                    path: "/management/grade/teacherStatistics",
                    component: GradeStatisticsTeacher,
                    name: "GradeStatisticsTeacher"
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
            }, {
                path: "/management/course",
                children: [{
                    path: "/management/course/management",
                    component: CourseManagement,
                    name: "CourseManagement"
                }, {
                    path: "/management/course/task",
                    component: CourseTask,
                    name: "CourseTask"
                }, {
                    path: "/management/course/optional",
                    component: CourseOptional,
                    name: "CourseOptional"
                }, {
                    path: "/management/course/scheduleManagement",
                    component: CourseScheduleManagement,
                    name: "CourseScheduleManagement"
                }, {
                    path: "/management/course/schedule",
                    component: CourseScheduleDisplay,
                    name: "CourseScheduleDisplay"
                }]
            }, {
                path: "/management/user",
                children: [{
                    path: "/management/user/center",
                    component: UserCenter,
                    name: "UserCenter"
                }, {
                    path: "/management/user/permissions",
                    component: PermissionsManagement,
                    name: "PermissionsManagement"
                }]
            }]
        }
    ]
});

export default router;